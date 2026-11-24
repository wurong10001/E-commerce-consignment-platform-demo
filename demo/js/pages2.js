/* ========== 页面渲染：资金 / 对账 / 佣金 / 调试（Apple 视觉） ========== */

function renderFunds() {
  // 与首页同源：一律走 Seed.metrics()，已划拨取资金账本成功流水
  const M = Seed.metrics(S);
  const frozen = M.frozen;
  const splitTotal = M.allocated;
  let h = `<div class="grid g4">
    <div class="card stat"><div class="label">◈ 监管户冻结</div><div class="value blue">${money(frozen)}</div><div class="foot">货款直入，平台不经手</div></div>
    <div class="card stat"><div class="label">✓ 已划拨资金</div><div class="value green">${money(splitTotal)}</div><div class="foot">分账至各方虚拟子户</div></div>
    <div class="card stat"><div class="label">◇ 分账指令</div><div class="value">${S.splits.length}</div><div class="foot">${S.splits.filter(s=>s.status==='FREEZE').length} 冻结 · ${S.splits.filter(s=>s.status==='REVOKED').length} 冲正</div></div>
    <div class="card stat"><div class="label">▤ 资金流水</div><div class="value purple">${S.ledger.length}</div><div class="foot">唯一真理来源 · 幂等唯一索引</div></div>
  </div>`;

  h += `<div class="section-label">分账指令 · 状态机</div>
  <div class="panel"><div class="panel-head"><h3>分账指令</h3><span class="sub">事件驱动 · 禁止跨态 · 乐观锁</span></div>
  <div class="scroll"><table><thead><tr><th>指令号</th><th>订单</th><th>接收方</th><th>金额</th><th>状态</th><th>操作</th></tr></thead><tbody>`;
  h += S.splits.map(s => `<tr>
    <td class="mono">${esc(s.id)}</td><td class="mono">${esc(short(s.orderId))}</td>
    <td class="mono">${esc(s.receiver)}</td><td class="mono">${money(s.amount)}</td><td>${badge(s.status,'split')}</td>
    <td><div class="btn-row">
      ${s.status==='INIT'?`<button class="btn sm primary" onclick="doPushSplit('${s.id}')">推送</button>`:''}
      ${['ACCEPTED','PROCESSING'].includes(s.status)?`<button class="btn sm green" onclick="doSettleSplit('${s.id}')">确认到账</button>`:''}
      <button class="btn sm" onclick="doFreeze('${s.id}')">${s.status==='FREEZE'?'解冻':'冻结'}</button>
    </div></td></tr>`).join('');
  h += `</tbody></table></div>
  <div style="padding:14px 20px"><p class="hint">铁律：已分账退款必须先回退（冲正）再退款；UNKNOWN 保持 PUSHING 不臆断终态，原号重发 + 查询兜底。</p></div></div>`;

  h += `<div class="section-label">资金流水账本 · fund_ledger</div>
  <div class="panel"><div class="panel-head"><h3>资金流水</h3><span class="sub">财务对账唯一真理来源</span></div>
  <div class="scroll"><table><thead><tr><th>流水号</th><th>业务订单</th><th>账户</th><th>类型</th><th>金额</th><th>状态</th></tr></thead><tbody>`;
  h += S.ledger.slice(0,20).map(l => `<tr>
    <td class="mono">${esc(l.id)}</td><td class="mono">${esc(l.biz==='-'?'-':short(l.biz))}</td>
    <td class="mono">${esc(l.account)}</td><td><span class="badge">${esc(l.type)}</span></td>
    <td class="mono" style="color:${l.amount<0?'#d70015':'#248a3d'}">${l.amount>0?'+':''}${money(l.amount)}</td>
    <td>${l.status===1?'<span class="badge green">成功</span>':'<span class="badge heat">处理中</span>'}</td>
  </tr>`).join('');
  h += `</tbody></table></div>
  <div style="padding:14px 20px" class="btn-row"><button class="btn primary" onclick="showWithdraw()">↗ 模拟提现</button></div></div>`;
  return h;
}
function doPushSplit(id){const r=pushSplit(id);toast(r.msg,!r.ok);render();}
function doSettleSplit(id){const r=settleSplit(id);toast(r.msg,!r.ok);render();}
function doFreeze(id){const r=toggleFreeze(id);toast(r.msg,!r.ok);render();}
function showWithdraw(){
  openModal('模拟提现',`
    <div class="field"><label>虚拟子户</label><select id="wdAcct">
      <option value="VA_S1001">VA_S1001（供应商）</option>
      <option value="VA_D2031">VA_D2031（分销商）</option>
      <option value="VA_P0001">VA_P0001（平台）</option>
    </select></div>
    <div class="field"><label>提现金额（元）</label><input id="wdAmt" type="number" value="1000" min="1"></div>
    <p class="hint">资金从虚拟子户划付至绑定银行卡，平台仅推送指令不触碰资金。</p>`,
    [{label:'取消',cls:''},{label:'确认提现',cls:'primary',onClick:()=>{
      const r=withdraw($('#wdAcct').value, Math.round(parseFloat($('#wdAmt').value)*100));
      toast(r.msg,!r.ok); render(); return r.ok;
    }}]);
}

// A4：四象限筛选状态（点击卡片切换，null=全部）
let reconFilter = null;
const RECON_TYPES = ['短款', '长款', '金额不一致', '状态不一致'];
function filterReconcile(t) {
  reconFilter = (reconFilter === t) ? null : t;
  render();
}

function renderReconcile() {
  const pending = S.reconciles.filter(r=>r.status==='PENDING').length;
  const fixed = S.reconciles.filter(r=>r.status.includes('FIXED')).length;
  let h = `<div class="grid g3">
    <div class="card stat"><div class="label">☷ 对账差异</div><div class="value">${S.reconciles.length}</div><div class="foot">订单/数量/金额/资金四层</div></div>
    <div class="card stat"><div class="label">⚠ 待处理</div><div class="value ${pending?'heat':'green'}">${pending}</div><div class="foot">${S.reconciles.filter(r=>r.risk==='P0').length} 条 P0 高危</div></div>
    <div class="card stat"><div class="label">✓ 自动化处理率</div><div class="value green">${S.reconciles.length?Math.round(fixed/S.reconciles.length*100):0}%</div><div class="foot">目标 ≥ 95%</div></div>
  </div>`;
  h += `<div class="section-label">差错四象限 · SQL 比对</div>
  <div class="panel"><div class="panel-head"><h3>差异记录</h3><span class="sub">自动分类 · 异常池</span></div>
  <div style="padding:16px 20px" class="grid g4">
    ${RECON_TYPES.map((t,i)=>`
    <button class="btn" style="height:auto;min-height:56px;flex-direction:column;align-items:flex-start;padding:10px 12px;${reconFilter===t?'border-color:var(--accent);background:rgba(0,113,227,.08)':''}" onclick="filterReconcile('${t}')">
      <span style="font-size:10.5px;color:var(--text-4)">场景 ${i+1} · 点击筛选</span>
      <span style="font-size:12px;margin-top:3px;color:${i===2?'#d70015':'var(--text-body)'}">${t}</span>
      <span style="font-size:10.5px;color:var(--text-3)">${S.reconciles.filter(r=>r.type===t).length} 条</span>
    </button>`).join('')}
  </div>
  ${reconFilter?`<div style="padding:0 20px 12px"><button class="btn sm" onclick="filterReconcile('${reconFilter}')">✕ 清除筛选：${esc(reconFilter)}</button></div>`:''}
  <div class="scroll"><table><thead><tr><th>差异号</th><th>日期</th><th>层级</th><th>类型</th><th>差额</th><th>风险</th><th>状态</th><th>操作</th></tr></thead><tbody>`;
  h += S.reconciles.filter(r => !reconFilter || r.type === reconFilter).map(r => `<tr>
    <td class="mono">${esc(r.id)}</td><td class="mono">${esc(r.date)}</td>
    <td><span class="badge blue">${esc(r.layer)}</span></td><td>${esc(r.type)}</td>
    <td class="mono" style="color:${r.diff>0?'#d70015':''}">${r.diff?money(r.diff):'—'}</td>
    <td>${r.risk==='P0'?'<span class="badge red">P0</span>':`<span class="badge heat">${r.risk}</span>`}</td>
    <td>${r.status==='PENDING'?'<span class="badge heat">待处理</span>':r.status.includes('FIXED')?'<span class="badge green">已修复</span>':`<span class="badge">${r.status}</span>`}</td>
    <td>${r.status==='PENDING'?`<div class="btn-row">
      <button class="btn sm green" onclick="doRecon('${r.id}','fix')">自动修复</button>
      <button class="btn sm" onclick="doRecon('${r.id}','manual')">人工调账</button>
    </div>`:'—'}</td></tr>`).join('');
  h += `</tbody></table></div>
  <div style="padding:14px 20px" class="btn-row"><button class="btn" onclick="runReconcile()">▶ 执行 T+1 对账任务</button></div>
  <div style="padding:0 20px 16px"><p class="hint">P0 级差异严禁自动处理，直接生成告警冻结结算并转人工财务介入。</p></div></div>`;
  return h;
}
function doRecon(id,act){const r=handleReconcile(id,act);toast(r.msg,!r.ok);render();}
function runReconcile(){
  const p=S.products[Math.floor(Math.random()*S.products.length)];
  S.reconciles.unshift({id:nextId('rc'),date:'2026-11-24',layer:['订单层','数量层','金额层','资金层'][Math.floor(Math.random()*4)],
    type:'金额不一致',order:p.id,diff:Math.round(Math.random()*50000),status:'PENDING',risk:'P1',time:nowStr()});
  log('INFO','T+1 对账任务执行完成，发现 1 条新差异，已进入异常池');
  save();render();toast('对账任务执行完成');
}

function renderCommission() {
  const pending = S.commissions.filter(c=>c.status==='PENDING').reduce((a,c)=>a+c.amount,0);
  const settled = S.commissions.filter(c=>c.status==='SETTLED'&&c.amount>0).reduce((a,c)=>a+c.amount,0);
  let h = `<div class="grid g3">
    <div class="card stat"><div class="label">◇ 待结算佣金</div><div class="value heat">${money(pending)}</div><div class="foot">订单完成后正式计算</div></div>
    <div class="card stat"><div class="label">✓ 已结算佣金</div><div class="value green">${money(settled)}</div><div class="foot">级差 + 固定比例</div></div>
    <div class="card stat"><div class="label">▤ 佣金记录</div><div class="value purple">${S.commissions.length}</div><div class="foot">含负向扣回</div></div>
  </div>`;
  h += `<div class="section-label">佣金计算 · 规则快照</div>
  <div class="panel"><div class="panel-head"><h3>佣金明细</h3><span class="sub">退款负向回溯</span></div>
  <div class="scroll"><table><thead><tr><th>佣金单</th><th>订单</th><th>分销商</th><th>层级</th><th>比例</th><th>佣金</th><th>状态</th><th>操作</th></tr></thead><tbody>`;
  h += S.commissions.map(c => `<tr>
    <td class="mono">${esc(c.id)}</td><td class="mono">${esc(short(c.order))}</td>
    <td class="mono">${esc(c.user)}</td><td>${esc(c.level)}</td>
    <td class="mono">${(c.rate*100).toFixed(0)}%</td>
    <td class="mono" style="color:${c.amount<0?'#d70015':'#248a3d'}">${c.amount>0?'+':''}${money(c.amount)}</td>
    <td>${c.status==='PENDING'?'<span class="badge heat">待结算</span>':'<span class="badge green">已结算</span>'}</td>
    <td>${c.status==='PENDING'?`<button class="btn sm green" onclick="doSettleCm('${c.id}')">结算</button>`:''}
        ${c.amount>0?`<button class="btn sm danger" onclick="doReverseCm('${c.id}')">退款扣回</button>`:''}</td>
  </tr>`).join('');
  h += `</tbody></table></div>
  <div style="padding:14px 20px 18px"><p class="hint">级差佣金：一级 20%、二级 15%、三级 10% → 三级卖单 100 元，二级得 (15%-10%)=5 元，一级得 (20%-15%)=5 元。快照机制保证规则变更不影响历史订单。</p></div></div>`;

  // A5：级差试算器（与 CommissionTier.java / 03_commission_tier.sql 输出同构）
  h += `<div class="section-label">级差试算器</div>
  <div class="panel"><div class="panel-head"><h3>试算：输入卖单，算各级佣金</h3><span class="sub">结果单位：分</span></div>
  <div style="padding:18px 20px">
    <div class="grid g2">
      <div class="field"><label>卖单金额（元）</label><input id="ctAmount" type="number" value="100" min="0" step="0.01"></div>
      <div class="field"><label>层级比例（%，从高到低，逗号分隔）</label><input id="ctRates" type="text" value="20,15,10"></div>
    </div>
    <div class="btn-row"><button class="btn primary" onclick="calcTier()">试算</button></div>
    <div id="ctResult" style="margin-top:14px">${tierResultHtml(10000, [2000,1500,1000])}</div>
  </div></div>`;
  return h;
}
/** 级差核心：rate 用 basis points（2000=20%），金额用整数分，整数除法无浮点。 */
function tierLines(saleAmountCents, ratesBps) {
  const lines = [];
  for (let i = 0; i < ratesBps.length; i++) {
    const childRate = i + 1 < ratesBps.length ? ratesBps[i + 1] : 0;
    const diff = ratesBps[i] - childRate;
    lines.push({ level: i + 1, diffBps: diff, amountCents: Math.floor(saleAmountCents * diff / 10000) });
  }
  return lines;
}
function tierResultHtml(saleAmountCents, ratesBps) {
  const lines = tierLines(saleAmountCents, ratesBps);
  const total = lines.reduce((a, l) => a + l.amountCents, 0);
  const expected = Math.floor(saleAmountCents * ratesBps[0] / 10000);
  const ok = total === expected;
  return `<div class="kv">
    ${lines.map(l => `<div class="k">第${['一','二','三','四','五'][l.level-1]||l.level}级（差 ${(l.diffBps/100).toFixed(0)}%）</div><div class="mono">${money(l.amountCents)} · ${l.amountCents} 分</div>`).join('')}
    <div class="k">合计</div><div class="mono" style="color:${ok?'#248a3d':'#d70015'}">${money(total)} · ${total} 分 ${ok?'✓':'✗'}</div>
  </div><p class="hint">断言：Σ各级 = 卖单金额 × 最高级比例 = ${expected} 分 ${ok?'（PASS）':'（FAIL）'}</p>`;
}
function calcTier() {
  const yuan = parseFloat($('#ctAmount').value) || 0;
  const cents = Math.round(yuan * 100);
  const rates = ($('#ctRates').value || '').split(',').map(s => Math.round((parseFloat(s) || 0) * 100));
  if (!rates.length || rates.some(r => r < 0)) { toast('请输入有效的层级比例', true); return; }
  $('#ctResult').innerHTML = tierResultHtml(cents, rates);
  toast('试算完成');
}
function doSettleCm(id){const r=settleCommission(id);toast(r.msg,!r.ok);render();}
function doReverseCm(id){const r=reverseCommission(id);toast(r.msg,!r.ok);render();}

function renderDebug() {
  const orderOpts = S.orders.map(o=>`<option value="${o.id}">${short(o.id)} · ${STATE_LABEL[o.status]} · ${money(o.amount)}</option>`).join('');
  const splitOpts = S.splits.map(s=>`<option value="${s.id}">${s.id} · ${s.status} · ${money(s.amount)}</option>`).join('');
  let h = `<div class="section-label">状态调试</div><div class="grid g2">`;
  h += `<div class="debug-card"><h4>⚙ 订单状态</h4>
    <div class="field"><label>选择订单</label><select id="dbgOrder">${orderOpts}</select></div>
    <div class="field"><label>目标状态（可强制跨态）</label><select id="dbgTarget">${ORDER_STATES.map(s=>`<option value="${s}">${s} · ${STATE_LABEL[s]}</option>`).join('')}</select></div>
    <label class="checkbox"><input type="checkbox" id="dbgForce"> 强制跨态（跳过状态机校验）</label>
    <div class="btn-row" style="margin-top:14px">
      <button class="btn primary" onclick="dbgSetOrder()">应用状态</button>
      <button class="btn" onclick="dbgPay()">模拟支付</button>
      <button class="btn danger" onclick="dbgRefund()">模拟退款</button>
    </div>
    <p class="hint">正常模式遵循 TRANSITIONS 流转表并校验合法性；勾选强制可任意跳转。每次变更 version+1 并写状态日志。</p>
  </div>`;
  h += `<div class="debug-card"><h4>◈ 分账指令</h4>
    <div class="field"><label>选择分账指令</label><select id="dbgSplit">${splitOpts}</select></div>
    <div class="field"><label>目标状态</label><select id="dbgSplitTarget">${SPLIT_STATES.map(s=>`<option value="${s}">${s}</option>`).join('')}</select></div>
    <div class="btn-row" style="margin-top:14px">
      <button class="btn primary" onclick="dbgSetSplit()">设置状态</button>
      <button class="btn" onclick="dbgInjectUnknown()">注入 UNKNOWN</button>
    </div>
    <p class="hint">UNKNOWN 保持 PUSHING 在途，验证"不臆断终态"契约。FREEZE 争议冻结，REVOKED 冲正作废。</p>
  </div></div>`;

  // A6：三道防线可视化（异常默认挂起 → 兜底 → 恢复）
  const inv = Seed.assertInvariant(S);
  h += `<div class="section-label">三道防线 · 资金安全</div>
  <div class="grid g3">
    <div class="card stat" style="${defenseState===1?'border-color:var(--accent)':''}">
      <div class="label">① 预防</div><div class="value" style="font-size:14px">幂等键 + 乐观锁</div><div class="foot">order_id 粒度分布式锁串行</div></div>
    <div class="card stat" style="${defenseState===2?'border-color:var(--accent)':''}">
      <div class="label">② 兜底</div><div class="value" style="font-size:14px">UNKNOWN 不臆断</div><div class="foot">原幂等键重发 + 查询兜底</div></div>
    <div class="card stat" style="${defenseState===3?'border-color:var(--accent)':''}">
      <div class="label">③ 恢复</div><div class="value" style="font-size:14px">对账 + 冲正退款</div><div class="foot">T+1 差异入异常池自动纠偏</div></div>
  </div>`;

  h += `<div class="section-label">异常注入 · 守恒 ${inv.ok?'<span style="color:#248a3d">✓ PASS</span>':'<span style="color:#d70015">✗ FAIL</span>'}</div>
  <div class="debug-card"><div class="btn-row">
    <button class="btn danger" onclick="dbgStockFail()">库存扣减失败</button>
    <button class="btn danger" onclick="dbgTimeout()">分账接口超时</button>
    <button class="btn danger" onclick="dbgBalanceLow()">退款余额不足</button>
    <button class="btn" onclick="dbgDuplicate()">重复幂等键</button>
  </div><p class="hint">注入后观察三道防线高亮与下方日志；顶部守恒标记实时校验 GMV = 冻结 + 已划拨。</p></div>`;

  h += `<div class="section-label">实时日志 · TRACE</div>
  <div class="log" id="debugLog">`;
  h += S.logs.slice(0,30).map(l=>`<span class="${l.level.toLowerCase()}">[${esc(l.time)}] ${esc(l.level)} ${esc(l.msg)}</span>`).join('');
  h += `</div>`;
  return h;
}
function dbgSetOrder(){
  const id=$('#dbgOrder').value, target=$('#dbgTarget').value, force=$('#dbgForce').checked;
  const r=setOrderStatus(id,target,{force});toast(r.msg,!r.ok);render();
}
function dbgPay(){const r=payOrder($('#dbgOrder').value);toast(r.msg,!r.ok);render();}
function dbgRefund(){const r=refundOrder($('#dbgOrder').value);toast(r.msg,!r.ok);render();}
function dbgSetSplit(){
  const id=$('#dbgSplit').value, target=$('#dbgSplitTarget').value;
  const s=S.splits.find(x=>x.id===id);if(!s)return;
  s.status=target;log('WARN',`分账 ${id} 调试强制设为 ${target}`);save();render();toast('分账状态已设置');
}
let defenseState = 0; // 0=未注入异常；1/2/3=最近激活的防线
function dbgInjectUnknown(){
  const id=$('#dbgSplit').value;const s=S.splits.find(x=>x.id===id);if(!s)return;
  s.status='PUSHING'; defenseState=2;
  log('WARN',`[防线②] 分账 ${id} 收到 UNKNOWN/TIMEOUT，保持 PUSHING 在途，原号重发+查询兜底`);save();render();toast('UNKNOWN 已注入，防线②兜底生效');
}
function dbgStockFail(){defenseState=1;log('ERR','[防线①] 库存扣减失败：Redis 扣减成功但 DB 条件更新失败 → 回滚 Redis + 取消订单');save();render();toast('已注入：库存扣减失败');}
function dbgTimeout(){defenseState=2;log('ERR','[防线②] 分账接口 30s 超时 → UNKNOWN，启动退避重试（原幂等键重发）');save();render();toast('已注入：分账接口超时');}
function dbgBalanceLow(){defenseState=3;log('ERR','[防线③] 退款失败：供应商虚拟户余额不足冲正 → 挂起退款，冻结提现，触发财务告警');save();render();toast('已注入：退款余额不足');}
function dbgDuplicate(){
  defenseState=1;
  const g=new IdempotentKeyGenerator();
  try{g.generate('SPLIT','DUPLICATE_TEST',1);g.generate('SPLIT','DUPLICATE_TEST',1);}
  catch(e){log('OK','[防线①] 幂等键唯一索引生效：重复分账请求被拦截（'+e.message+'）');}
  save();render();toast('已测试：防线①幂等拦截');
}
function renderDebugLog(){
  const el=$('#debugLog');if(!el)return;
  el.innerHTML=S.logs.slice(0,30).map(l=>`<span class="${l.level.toLowerCase()}">[${esc(l.time)}] ${esc(l.level)} ${esc(l.msg)}</span>`).join('');
}
