/* ========== 核心业务动作（全部基于内存状态，操作后自动持久化） ========== */

// 合法状态流转表（受控状态机，禁止跨态跳变）
// 状态机流转表来自唯一种子真源，避免与推演脚本重复定义
const TRANSITIONS = Seed.TRANSITIONS;
const EVENT_FOR = {
  PAID:'PAY_SUCCESS', ACCEPTED:'ACCEPT', SHIPPED:'SHIP', COMPLETED:'CONFIRM_RECEIPT',
  SETTLED:'SETTLE', AFTER_SALE_PENDING:'DISPUTE_OPEN', REFUNDING:'REFUND_APPLY',
  CLOSED:'REFUND_SUCCESS', CANCELLED:'TIMEOUT_CANCEL'
};

function setOrderStatus(orderId, target, opts = {}) {
  const o = S.orders.find(x => x.id === orderId);
  if (!o) return { ok:false, msg:'订单不存在' };
  if (o.status === target) return { ok:false, msg:'状态未变化' };
  const force = opts.force === true; // 调试面板可强制跳变
  if (!force && !(TRANSITIONS[o.status] || []).includes(target))
    return { ok:false, msg:`非法流转：${o.status} → ${target}（调试模式可强制）` };
  const old = o.status;
  o.status = target;
  o.version++;

  // 支付状态联动
  if (target === 'PAID' || (TRANSITIONS.PAID.includes(target) && old === 'CREATED')) o.payStatus = Seed.PAY_SUCCESS;
  if (target === 'CANCELLED') o.payStatus = 'CLOSED';
  if (target === 'REFUNDING') o.refundStatus = 'REFUNDING';
  if (target === 'CLOSED') o.refundStatus = 'REFUNDED';
  // 子订单状态联动（PART_SHIPPED 是主单聚合态，不写入子单）
  if (Seed.ITEM_TRANSITIONS[target]) o.items.forEach(it => { it.status = target; });

  log(target === 'CANCELLED' || target === 'CLOSED' ? 'WARN' : 'OK',
      `订单 ${shortId(orderId)} 状态 ${old} → ${target}${force ? ' [调试强制]' : ''}`);
  save();
  return { ok:true, msg:`状态已更新：${old} → ${target}` };
}

// 子订单独立流转（与主单状态机解耦），主单状态随后按子单聚合
function setItemStatus(orderId, itemIndex, target, opts = {}) {
  const o = S.orders.find(x => x.id === orderId);
  if (!o) return { ok:false, msg:'订单不存在' };
  const it = o.items[itemIndex];
  if (!it) return { ok:false, msg:'子订单不存在' };
  if (it.status === target) return { ok:false, msg:'子单状态未变化' };
  const ITEM_TRANSITIONS = Seed.ITEM_TRANSITIONS;
  const force = opts.force === true;
  if (!force && !(ITEM_TRANSITIONS[it.status] || []).includes(target))
    return { ok:false, msg:`子单非法流转：${it.status} → ${target}（调试模式可强制）` };
  const old = it.status;
  it.status = target;
  o.version++;
  const before = o.status;
  o.status = Seed.aggregateOrderStatus(o); // 主单状态由子单聚合，禁止直接写
  log(old === 'SHIPPED' && target === 'COMPLETED' ? 'OK' : 'INFO',
    `子单 ${it.productId} ${old} → ${target}；主单 ${before} → ${o.status}${o.status!==before?'（聚合）':''}`);
  save();
  return { ok:true, msg:`子单 ${it.productId}：${old} → ${target}` +
    (o.status !== before ? `；主单聚合为 ${o.status}` : '') };
}

// 拆单：按子订单等分 + 末项兜底（金额守恒）
function splitOrder(parentId) {
  const o = S.orders.find(x => x.id === parentId);
  if (!o) return { ok:false, msg:'订单不存在' };
  if (o.items.length < 2) return { ok:false, msg:'该订单无需拆单（仅一个子订单）' };
  let allocated = 0;
  o.items.forEach((it, i) => {
    if (i === o.items.length - 1) it.amount = o.amount - allocated; // 最大余额法：末项兜底守恒
    else { it.amount = Math.floor(o.amount / o.items.length); allocated += it.amount; }
  });
  o.splits = o.items.length;
  log('OK', `订单 ${shortId(parentId)} 按最大余额法拆为 ${o.items.length} 个子订单，金额守恒校验通过`);
  save();
  return { ok:true, msg:`已拆为 ${o.items.length} 个子订单，金额之和=${formatMoney(o.amount)}` };
}

// 生成分账指令（资金中台统一生成幂等键）
function createSplit(orderId) {
  const o = S.orders.find(x => x.id === orderId);
  if (!o) return { ok:false, msg:'订单不存在' };
  if (!['COMPLETED','SETTLED'].includes(o.status))
    return { ok:false, msg:'仅已完成订单可触发分账（当前：'+STATE_LABEL[o.status]+'）' };
  const activeSplit = S.splits.find(s => s.orderId === orderId && !['REVOKED','FAILED'].includes(s.status));
  if (activeSplit) return { ok:false, msg:'已存在进行中的分账指令：'+activeSplit.id };

  const rules = Seed.SPLIT_RULES; // 与种子/推演脚本同源，杜绝多算法
  let sum = 0;
  rules.forEach((r, i) => {
    const amt = i === rules.length - 1 ? o.amount - sum : Math.round(o.amount * r.bps / 10000);
    sum += amt;
    const id = nextId('sp');
    const key = `SPLIT_${orderId}_${r.receiver}_${String(Number(id.slice(2))).padStart(4, '0')}`;
    S.splits.unshift({ id, orderId, receiver:r.receiver, role:r.role, amount:amt,
      status:'INIT', key, time:nowStr() });
    addLedger(orderId, r.receiver, 'SPLIT_ACCOUNT', amt, 0, key);
    log('INFO', `生成分账指令 ${id} → ${r.receiver} ${formatMoney(amt)}（${r.memo}）`);
  });
  o.splits = rules.length;
  save();
  return { ok:true, msg:`已生成 ${rules.length} 条分账指令，合计 ${formatMoney(sum)}（金额守恒）` };
}

// 推送分账（INIT → PUSHING → ACCEPTED）
function pushSplit(splitId) {
  const s = S.splits.find(x => x.id === splitId);
  if (!s) return { ok:false, msg:'指令不存在' };
  if (s.status !== 'INIT') return { ok:false, msg:'仅 INIT 状态可推送（当前：'+s.status+'）' };
  s.status = 'PUSHING'; log('INFO', `分账 ${s.id} 推送渠道中... [PUSHING]`);
  const stateAtPush = S;
  setTimeout(() => {
    if (S !== stateAtPush) return; // 期间 resetState() 则放弃过期回调
    s.status = 'ACCEPTED'; s.time = nowStr();
    const l = S.ledger.find(x => x.key === s.key); if (l) l.status = 1;
    log('OK', `分账 ${s.id} 渠道受理成功 [ACCEPTED]`); save();
    if (typeof render === 'function') render();
  }, 700);
  save();
  return { ok:true, msg:'已推送，模拟渠道受理中...' };
}

// 模拟分账到账回调（ACCEPTED → SUCCESS）
function settleSplit(splitId) {
  const s = S.splits.find(x => x.id === splitId);
  if (!s) return { ok:false, msg:'指令不存在' };
  if (!['ACCEPTED','PROCESSING'].includes(s.status)) return { ok:false, msg:'当前状态不可确认到账：'+s.status };
  s.status = 'SUCCESS'; s.time = nowStr();
  const o = S.orders.find(x => x.id === s.orderId);
  if (o && S.splits.filter(x => x.orderId === s.orderId).every(x => x.status === 'SUCCESS')) {
    o.items.forEach(it => { it.status = 'SETTLED'; });
    o.status = 'SETTLED'; o.version++; log('OK', `订单 ${shortId(o.id)} 全部分账到账，状态 → SETTLED`);
  }
  log('OK', `分账 ${s.id} 资金到账 [SUCCESS]`); save();
  return { ok:true, msg:'分账到账成功' };
}

// 退款冲正铁律：先回退已分资金（REVOKED），再退款给买家
function refundOrder(orderId, full = true) {
  const o = S.orders.find(x => x.id === orderId);
  if (!o) return { ok:false, msg:'订单不存在' };
  const related = S.splits.filter(s => s.orderId === orderId && ['SUCCESS','ACCEPTED','PROCESSING','PART_SUCCESS'].includes(s.status));
  let msg = '';
  if (related.length) {
    related.forEach(s => {
      s.status = 'REVOKED';
      // 冲正同步回退资金账本，避免 allocated 虚高破坏 GMV=冻结+已划拨
      S.ledger.filter(l => l.key === s.key).forEach(l => { l.status = 0; });
      log('WARN', `分账回退 ${s.id} → REVOKED（资金收回监管户，账本同步回退）`);
    });
    msg = `已回退 ${related.length} 笔分账 → `;
  }
  o.status = 'REFUNDING'; o.refundStatus = 'REFUNDING'; o.version++;
  const stateAtRefund = S;
  setTimeout(() => {
    if (S !== stateAtRefund) return; // 期间 resetState() 则放弃过期回调
    o.status = 'CLOSED'; o.refundStatus = 'REFUNDED'; o.version++;
    log('OK', `订单 ${shortId(orderId)} 退款成功，状态 → CLOSED`);
    save(); if (typeof render === 'function') render();
  }, 900);
  log('WARN', `订单 ${shortId(orderId)} 发起退款（${full ? '全额' : '部分'}），先冲正后退款`);
  save();
  return { ok:true, msg: msg + '退款处理中，完成后订单关闭' };
}

// 资金挂起/解冻（争议冻结）
function toggleFreeze(splitId) {
  const s = S.splits.find(x => x.id === splitId);
  if (!s) return { ok:false, msg:'指令不存在' };
  if (!['ACCEPTED','PROCESSING','PART_SUCCESS','FREEZE'].includes(s.status))
    return { ok:false, msg:'当前状态不可冻结/解冻：' + s.status };
  if (s.status === 'FREEZE') {
    s.status = 'ACCEPTED'; log('INFO', `分账 ${s.id} 解冻，恢复 [ACCEPTED]`);
    save(); return { ok:true, msg:'已解冻' };
  }
  s.status = 'FREEZE'; log('WARN', `分账 ${s.id} 争议冻结 [FREEZE]`);
  save(); return { ok:true, msg:'已冻结，暂停放行与分账' };
}

// 提现
function withdraw(accountNo, amount) {
  if (!amount || amount <= 0) return { ok:false, msg:'请输入有效金额' };
  const available = S.ledger.filter(l => l.account === accountNo && l.status === 1)
    .reduce((a, l) => a + l.amount, 0);
  if (amount > available) return { ok:false, msg:`可提现余额不足（${formatMoney(available)}）` };
  const id = nextId('wd');
  addLedger('-', accountNo, 'WITHDRAW', -amount, 1, `WD_${accountNo}_0001`);
  log('OK', `提现 ${formatMoney(amount)} 从 ${accountNo} → 绑定银行卡，流水 ${id}`);
  save();
  return { ok:true, msg:`提现申请已受理：${formatMoney(amount)}` };
}

function addLedger(biz, account, type, amount, status, key) {
  S.ledger.unshift({ id:nextId('ledger'), biz, account, type, amount, status, key, time:nowStr() });
}

// 对账差异处理
function handleReconcile(id, action) {
  const r = S.reconciles.find(x => x.id === id);
  if (!r) return { ok:false, msg:'差异记录不存在' };
  if (action === 'fix') {
    if (r.risk === 'P0') { log('WARN', `差异 ${id} 为 P0，禁止自动处理，已转人工`);
      save(); return { ok:false, msg:'P0 级差异严禁自动处理，已转人工财务介入' }; }
    r.status = 'AUTO_FIXED'; log('OK', `差异 ${id} 自动修复完成`);
  } else if (action === 'manual') {
    r.status = 'MANUAL_FIXED'; log('OK', `差异 ${id} 人工调账完成（已留痕）`);
  } else if (action === 'ignore') {
    r.status = 'IGNORED'; log('INFO', `差异 ${id} 标记忽略`);
  }
  save(); return { ok:true, msg:'处理成功' };
}

// 佣金结算 / 负向扣回
function settleCommission(id) {
  const c = S.commissions.find(x => x.id === id);
  if (!c) return { ok:false, msg:'佣金记录不存在' };
  c.status = 'SETTLED'; log('OK', `佣金 ${id} 结算完成 ${formatMoney(c.amount)} → ${c.user}`);
  save(); return { ok:true, msg:'佣金已结算' };
}
function reverseCommission(id) {
  const c = S.commissions.find(x => x.id === id);
  if (!c) return { ok:false, msg:'佣金记录不存在' };
  if (c.amount <= 0 || S.commissions.some(x => x.order === c.order && x.user === c.user &&
      x.level === c.level && x.amount === -c.amount && Math.abs(x.rate + c.rate) < 1e-9))
    return { ok:false, msg:'该佣金已扣回，禁止重复冲正' };
  S.commissions.unshift({ id:nextId('cm'), order:c.order, user:c.user, level:c.level,
    base:c.base, rate:-c.rate, amount:-c.amount, status:'SETTLED', time:nowStr() });
  log('WARN', `订单 ${c.order} 退款，生成负向佣金单扣回 ${formatMoney(c.amount)}`);
  save(); return { ok:true, msg:`已生成负向佣金单，扣回 ${formatMoney(c.amount)}` };
}

// 下单（创建新订单，模拟支付）
function createOrder(productId, qty) {
  const p = S.products.find(x => x.id === productId);
  if (!p) return { ok:false, msg:'商品不存在' };
  if (p.stock < qty) return { ok:false, msg:'库存不足，防超卖拦截' };
  p.stock -= qty;
  const id = 'DSO20261124' + String(++S.seq.order).padStart(5,'0');
  const o = mkOrder(id, 'u_demo_' + (100 + S.seq.order), p.price * qty, 'CREATED', 'INIT', nowStr(), [
    mkItem(p.id, p.supplier, p.price * qty, 'CREATED')
  ]);
  S.orders.unshift(o);
  log('OK', `新订单 ${shortId(id)} 创建，Redis 预扣库存 ${qty} 件（${p.name}）`);
  save(); return { ok:true, msg:`下单成功：${id}` };
}

// 模拟支付（CREATED → PAID）
function payOrder(orderId) {
  const r = setOrderStatus(orderId, 'PAID');
  if (r.ok) log('OK', `订单 ${shortId(orderId)} 支付回调验签通过，货款进入监管户冻结`);
  return r;
}

function nowStr() { return new Date().toISOString().slice(0,19).replace('T',' '); }
function shortId(id) { return id.length > 16 ? id.slice(0,10)+'…'+id.slice(-4) : id; }
function formatMoney(cents) { return '¥' + (cents/100).toFixed(2); }
