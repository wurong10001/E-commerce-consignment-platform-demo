/* ========== 页面渲染：总览 / 商品 / 订单（Apple 视觉） ========== */
const PAGE_META = {
  dashboard:{title:'总览看板', desc:'全链路业务与资金流实时概览'},
  products:{title:'商品与库存', desc:'代销商品池、供应商与防超卖库存管理'},
  orders:{title:'订单中心', desc:'拆单合单、双层状态机、资金操作联动'},
  funds:{title:'资金中台', desc:'监管户资金流、分账指令、资金流水账本'},
  reconcile:{title:'对账中心', desc:'订单-数量-金额-资金四层对账与差错处理'},
  commission:{title:'分销佣金', desc:'级差佣金、快照机制与负向扣回'},
  debug:{title:'调试控制台', desc:'强制调整订单/分账状态、模拟异常、注入事件'},
};

/* 触摸版顶部「更多」入口（商品 / 佣金在 tabbar 无独立位，放进总览） */
function moreEntries() {
  return `<div class="section-label hide-desktop">更多模块</div>
  <div class="grid g2 hide-desktop">
    <button class="card stat" style="text-align:left;cursor:pointer" onclick="switchPage('products')">
      <span class="label">▦ 商品与库存</span><span class="value" style="font-size:17px">SKU 管理 →</span>
    </button>
    <button class="card stat" style="text-align:left;cursor:pointer" onclick="switchPage('commission')">
      <span class="label">◇ 分销佣金</span><span class="value" style="font-size:17px">级差佣金 →</span>
    </button>
  </div>`;
}

function renderDashboard() {
  // 所有资金指标来自唯一种子真源 metrics()，杜绝同一指标多算法（G1/G2/G3）
  const M = Seed.metrics(S);
  const inv = Seed.assertInvariant(S);
  const totalGmv = M.gmv;
  const paid = M.paidCount;
  const splitSuccess = M.splitSuccess;
  const pendingRecon = M.pendingRecon;
  const lowStock = S.products.filter(p => p.stock < 50).length;

  let h = `<section>
    <div class="section-label">实时概览 · LIVE</div>
    <div class="grid g4">
      <div class="card stat"><div class="label">◈ GMV（已支付）</div><div class="value blue">${money(totalGmv)}</div><div class="foot">${paid} 笔已支付订单</div></div>
      <div class="card stat"><div class="label">▤ 订单总数</div><div class="value">${S.orders.length}</div><div class="foot">${S.orders.filter(o=>o.status==='CREATED').length} 笔待付款</div></div>
      <div class="card stat"><div class="label">✓ 分账成功率</div><div class="value green">${S.splits.length ? Math.round(splitSuccess/S.splits.length*100)+'%' : '—'}</div><div class="foot">${splitSuccess}/${S.splits.length} 笔到账</div></div>
      <div class="card stat"><div class="label">☷ 待处理差异</div><div class="value ${pendingRecon?'heat':'green'}">${pendingRecon}</div><div class="foot">${S.reconciles.filter(r=>r.risk==='P0').length} 条 P0 高危</div></div>
    </div>
  </section>`;

  h += `<div class="grid g2 mt">`;
  // 订单状态分布
  const dist = {}; S.orders.forEach(o => dist[o.status] = (dist[o.status]||0)+1);
  const max = Math.max(1, ...Object.values(dist));
  h += `<div class="panel"><div class="panel-head"><h3>订单状态分布</h3><span class="sub">共 ${S.orders.length} 单</span></div>
    <div style="padding:18px clamp(17px,2.5vw,24px)">`;
  h += Object.entries(dist).map(([s,n]) => `<div style="margin-bottom:11px">
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px">
      <span>${badge(s)}</span><span class="mono" style="color:var(--text-2)">${n} 单</span></div>
    <div class="bar"><i style="width:${n/max*100}%"></i></div></div>`).join('') + `</div></div>`;

  // 资金健康：冻结 = GMV − 已划拨（差额法），两页同源同值
  const frozen = M.frozen;
  const splitTotal = M.allocated;
  h += `<div class="panel"><div class="panel-head"><h3>资金流健康</h3><span class="sub">监管户一清架构</span></div>
    <div style="padding:18px clamp(17px,2.5vw,24px)">
      <div class="kv">
        <div class="k">合规架构</div><div style="color:#248a3d">✓ 资金不经过平台账户</div>
        <div class="k">监管户冻结</div><div class="mono">${money(frozen)}</div>
        <div class="k">已划拨资金</div><div class="mono">${money(splitTotal)}</div>
        <div class="k">守恒校验</div><div class="mono" style="color:${inv.ok?'#248a3d':'#d70015'}">${inv.ok?'✓ PASS':'✗ FAIL'} ${esc(inv.detail)}</div>
        <div class="k">库存预警</div><div>${lowStock ? `<span style="color:var(--heat)">${lowStock} 个 SKU 低于 50</span>` : '<span style="color:#248a3d">正常</span>'}</div>
      </div>
      <div class="divider"></div>
      <p style="font-size:12px;color:var(--text-2);line-height:1.85">
        <b style="color:var(--accent)">端到端链路：</b>消费者支付 → 资金直入监管户 → 订单按供应商拆单 → 发货 → 确认收货 → 分账指令 → 资金划拨各方子户。
      </p>
    </div></div></div>`;

  h += moreEntries();

  h += `<div class="section-label">最近事件</div>
  <div class="panel"><div style="padding:18px clamp(17px,2.5vw,24px)"><div class="timeline">`;
  h += S.logs.slice(0,7).map(l => `<div class="tl-item"><span class="time">${esc(l.time)}</span>${esc(l.msg)}</div>`).join('');
  h += `</div></div></div>`;
  return h;
}

function renderProducts() {
  let h = `<div class="section-label">代销商品池</div>
  <div class="panel"><div class="panel-head"><h3>商品与库存</h3><span class="sub">${S.products.length} 个 SKU · 实时同步</span></div>
  <div class="scroll"><table><thead><tr><th>SKU</th><th>商品名称</th><th>供应商</th><th>代销价</th><th>库存</th><th>状态</th></tr></thead><tbody>`;
  h += S.products.map(p => `<tr>
    <td class="mono">${esc(p.id)}</td><td style="color:var(--text)">${esc(p.name)}</td><td>${esc(p.supplier)}</td>
    <td class="mono">${money(p.price)}</td>
    <td class="mono" style="color:${p.stock===0?'#d70015':p.stock<50?'var(--heat)':''}">${p.stock}</td>
    <td>${p.stock===0?'<span class="badge red">缺货</span>':p.stock<50?'<span class="badge heat">低库存</span>':'<span class="badge green">正常</span>'}</td>
  </tr>`).join('');
  h += `</tbody></table></div>
  <div style="padding:16px 20px" class="btn-row">
    <button class="btn primary" onclick="showCreateOrder()">＋ 模拟下单</button>
    <button class="btn" onclick="syncStock()">↻ 同步供应商库存</button>
  </div></div>
  <p class="hint">防超卖策略：Redis Lua 原子预扣减 → MQ 异步落库 → DB 条件更新失败则回滚 Redis 并取消订单。</p>`;
  return h;
}

function showCreateOrder() {
  const opts = S.products.filter(p=>p.stock>0).map(p => `<option value="${p.id}">${esc(p.name)} · ${money(p.price)} · 库存${p.stock}</option>`).join('');
  openModal('模拟下单', `
    <div class="field"><label>选择商品</label><select id="moProduct">${opts}</select></div>
    <div class="field"><label>数量</label><input id="moQty" type="number" value="1" min="1"></div>
    <p class="hint">将触发 Redis 库存预扣减并创建待付款订单。</p>`,
    [{label:'取消', cls:''},{label:'确认下单', cls:'primary', onClick:()=>{
      const r = createOrder($('#moProduct').value, parseInt($('#moQty').value)||1);
      toast(r.msg, !r.ok); render(); return r.ok;
    }}]);
}
function syncStock() {
  S.products.forEach(p => { p.stock += Math.floor(Math.random()*20)-5; if (p.stock<0) p.stock=0; });
  log('INFO', '供应商库存同步完成，5 个 SKU 库存已更新');
  save(); render(); toast('库存同步完成');
}

function renderOrders() {
  let h = `<div class="section-label">订单列表</div>
  <div class="panel"><div class="panel-head"><h3>全部订单</h3><span class="sub">双层状态机 · 乐观锁 v</span></div>
  <div class="scroll"><table><thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>履约状态</th><th>支付状态</th><th>子单</th><th>操作</th></tr></thead><tbody>`;
  h += S.orders.map(o => `<tr>
    <td class="mono">${esc(o.id)}</td><td class="mono">${esc(o.userId)}</td>
    <td class="mono">${money(o.amount)}</td><td>${badge(o.status)}</td>
    <td><span class="badge ${o.payStatus==='SUCCESS'?'blue':'grey'}">${o.payStatus}</span></td>
    <td class="mono">${o.items.length}</td>
    <td><button class="btn sm" onclick="showOrderDetail('${o.id}')">详情</button></td>
  </tr>`).join('');
  h += `</tbody></table></div></div>`;
  return h;
}

function showOrderDetail(id) {
  const o = S.orders.find(x=>x.id===id); if (!o) return;
  const agg = Seed.aggregateOrderStatus(o);
  const items = o.items.map((it, i) => `<tr style="cursor:pointer" onclick="showItemDetail('${id}',${i})" title="点击查看子单独立状态机">
    <td class="mono">${esc(it.productId)}</td><td>${esc(it.supplier)}</td>
    <td class="mono">${money(it.amount)}</td><td>${badge(it.status)}</td><td style="color:var(--accent)">›</td></tr>`).join('');
  const buttons = [];
  if (o.status === 'CREATED') buttons.push({label:'模拟支付', cls:'primary', onClick:()=>{ const r=payOrder(id); toast(r.msg,!r.ok); render(); return r.ok; }});
  if (['COMPLETED','SETTLED'].includes(o.status)) buttons.push({label:'生成分账指令', cls:'primary', onClick:()=>{ const r=createSplit(id); toast(r.msg,!r.ok); render(); return r.ok; }});
  if (!['CLOSED','CANCELLED'].includes(o.status)) buttons.push({label:'发起退款', cls:'danger', onClick:()=>{ const r=refundOrder(id); toast(r.msg,!r.ok); render(); return r.ok; }});
  buttons.push({label:'调试状态', cls:'', onClick:()=>{ closeModal(); setTimeout(()=>{ switchPage('debug'); const s=$('#dbgOrder'); if(s) s.value=id; },120); return true; }});
  buttons.push({label:'关闭', cls:''});
  openModal('订单详情 · ' + short(id), `
    <div class="kv">
      <div class="k">订单号</div><div class="mono">${esc(o.id)}</div>
      <div class="k">买家</div><div class="mono">${esc(o.userId)}</div>
      <div class="k">实付金额</div><div class="mono" style="color:var(--accent);font-weight:600">${money(o.amount)}</div>
      <div class="k">履约状态</div><div>${badge(o.status)} <span style="font-size:10.5px;color:var(--text-3)">（子单聚合：${STATE_LABEL[agg]||agg}${agg!==o.status?' · 建议同步':''}）</span></div>
      <div class="k">支付状态</div><div class="mono">${o.payStatus}</div>
      <div class="k">退款状态</div><div class="mono">${o.refundStatus}</div>
      <div class="k">乐观锁版本</div><div class="mono">v${o.version}</div>
      <div class="k">下单时间</div><div class="mono">${esc(o.time)}</div>
    </div>
    <div class="section-label">状态机流转</div>
    ${orderFlow(o.status)}
    <div class="section-label">子订单 · 点击任意行查看独立状态机</div>
    <div class="scroll"><table><thead><tr><th>商品</th><th>供应商</th><th>分摊金额</th><th>状态</th><th></th></tr></thead><tbody>${items}</tbody></table></div>
    ${o.items.length>1?`<div class="btn-row" style="margin-top:14px"><button class="btn" onclick="doSplit('${id}')">执行拆单校验</button></div>`:''}`, buttons);
}
function doSplit(id) { const r = splitOrder(id); toast(r.msg, !r.ok); render(); }

/** A2：子单独立状态机查看与流转，主单状态由子单聚合自动回写 */
function showItemDetail(orderId, index) {
  const o = S.orders.find(x=>x.id===orderId); if (!o) return;
  const it = o.items[index]; if (!it) return;
  const targets = Seed.ITEM_TRANSITIONS[it.status] || [];
  const opts = targets.length
    ? targets.map(t => `<option value="${t}">${t} · ${STATE_LABEL[t]||t}</option>`).join('')
    : '<option value="">（终态，无后继）</option>';
  const buttons = targets.length
    ? [{label:'推进子单状态', cls:'primary', onClick:()=>{
        const t = $('#itemTarget').value; if (!t) return false;
        const r = setItemStatus(orderId, index, t); toast(r.msg, !r.ok); render(); return r.ok;
      }}]
    : [];
  buttons.push({label:'关闭', cls:''});
  openModal(`子订单 · ${esc(it.productId)}`, `
    <div class="kv">
      <div class="k">所属主单</div><div class="mono">${esc(orderId)}</div>
      <div class="k">供应商</div><div>${esc(it.supplier)}</div>
      <div class="k">分摊金额</div><div class="mono" style="color:var(--accent)">${money(it.amount)}</div>
      <div class="k">当前状态</div><div>${badge(it.status)}</div>
      <div class="k">主单状态</div><div>${badge(o.status)}</div>
    </div>
    <div class="section-label">子单独立状态机</div>
    ${flowFor(it.status, ['CREATED','PAID','ACCEPTED','SHIPPED','COMPLETED','SETTLED'], ['待付款','已付款','已接单','已发货','已完成','已结算'])}
    <div class="field" style="margin-top:16px"><label>流转目标（合法后继）</label><select id="itemTarget">${opts}</select></div>
    <p class="hint">子单独立流转；每次变更会增加主单乐观锁版本，并按「主订单状态聚合规则」自动回写主单状态（禁止直接修改主单）。</p>`, buttons);
}
