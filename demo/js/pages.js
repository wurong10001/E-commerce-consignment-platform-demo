/* ========== 页面渲染层 ========== */
const PAGE_META = {
  dashboard:{title:'总览看板', desc:'全链路业务与资金流实时概览'},
  products:{title:'商品与库存', desc:'代销商品池、供应商与防超卖库存管理'},
  orders:{title:'订单中心', desc:'拆单合单、双层状态机、资金操作联动'},
  funds:{title:'资金中台', desc:'监管户资金流、分账指令、资金流水账本'},
  reconcile:{title:'对账中心', desc:'订单-数量-金额-资金四层对账与差错处理'},
  commission:{title:'分销佣金', desc:'级差佣金、快照机制与负向扣回'},
  debug:{title:'调试控制台', desc:'强制调整订单/分账状态、模拟异常、注入事件'},
};

function renderDashboard() {
  const totalGmv = S.orders.filter(o => o.payStatus === 'SUCCESS').reduce((a,o) => a+o.amount, 0);
  const paid = S.orders.filter(o => o.payStatus === 'SUCCESS').length;
  const splitSuccess = S.splits.filter(s => s.status === 'SUCCESS').length;
  const pendingRecon = S.reconciles.filter(r => r.status === 'PENDING').length;
  const lowStock = S.products.filter(p => p.stock < 50).length;
  const cards = [
    ['GMV（已支付）', money(totalGmv), 'blue', `${paid} 笔已支付订单`, '◈'],
    ['订单总数', S.orders.length, '', `${S.orders.filter(o=>o.status==='CREATED').length} 笔待付款`, '▤'],
    ['分账成功率', S.splits.length ? Math.round(splitSuccess/S.splits.length*100)+'%' : '—', 'green', `${splitSuccess}/${S.splits.length} 笔到账`, '✓'],
    ['待处理对账差异', pendingRecon, pendingRecon ? 'red':'green', `${S.reconciles.length} 条差异记录`, '☷'],
  ];
  let h = `<div class="grid g4">` + cards.map(c => `
    <div class="card stat"><div class="label">${c[4]} ${c[0]}</div>
    <div class="value ${c[2]}">${c[1]}</div><div class="foot">${c[3]}</div></div>`).join('') + `</div>`;

  h += `<div class="grid g2" style="margin-top:18px">`;
  // 订单状态分布
  const dist = {};
  S.orders.forEach(o => dist[o.status] = (dist[o.status]||0)+1);
  const max = Math.max(1, ...Object.values(dist));
  h += `<div class="card"><h3>订单状态分布 <span class="sub">共 ${S.orders.length} 单</span></h3>`;
  h += Object.entries(dist).map(([s,n]) => `
    <div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px">
      <span>${badge(s)}</span><span class="mono">${n} 单</span></div>
      <div class="bar"><i style="width:${n/max*100}%"></i></div></div>`).join('') + `</div>`;
  // 资金健康
  const fundByRole = {};
  S.ledger.filter(l => l.status === 1).forEach(l => fundByRole[l.type] = (fundByRole[l.type]||0) + Math.abs(l.amount));
  h += `<div class="card"><h3>资金流健康 <span class="sub">监管户一清架构</span></h3>
    <div class="kv">
      <div class="k">合规架构</div><div style="color:var(--green)">✓ 资金不经过平台账户</div>
      <div class="k">监管户冻结</div><div class="mono">${money(S.orders.filter(o=>o.payStatus==='SUCCESS'&&!['CLOSED','CANCELLED'].includes(o.status)).reduce((a,o)=>a+o.amount,0))}</div>
      <div class="k">已分账流水</div><div class="mono">${money(Object.values(fundByRole).reduce((a,b)=>a+b,0))}</div>
      <div class="k">库存预警</div><div>${lowStock ? `<span style="color:var(--amber)">${lowStock} 个 SKU 库存低于 50</span>` : '<span style="color:var(--green)">正常</span>'}</div>
    </div>
    <div class="split-line"></div>
    <div style="font-size:11px;color:var(--muted);line-height:1.8">
      <b style="color:var(--cyan)">端到端链路：</b>消费者下单支付 → 资金直入银行监管户 → 订单拆分下发供应商 → 发货 → 确认收货 → 分账指令 → 资金划拨各方子户。
    </div></div></div>`;
  h += `</div>`;

  h += `<div class="card" style="margin-top:18px"><h3>最近事件日志</h3><div class="timeline">`;
  h += S.logs.slice(0,8).map(l => `<div class="tl-item"><span class="time">${esc(l.time)}</span> · <span style="color:${l.level==='OK'?'var(--green)':l.level==='WARN'?'var(--amber)':'var(--blue)'}">${esc(l.level)}</span> ${esc(l.msg)}</div>`).join('');
  h += `</div></div>`;
  return h;
}

function renderProducts() {
  let h = `<div class="card"><h3>商品池 <span class="sub">${S.products.length} 个 SKU · 库存实时同步</span></h3>
    <div class="scroll"><table><thead><tr><th>SKU</th><th>商品名称</th><th>供应商</th><th>类目</th><th>代销价</th><th>库存</th><th>状态</th></tr></thead><tbody>`;
  h += S.products.map(p => `<tr>
    <td class="mono">${esc(p.id)}</td><td>${esc(p.name)}</td><td>${esc(p.supplier)}</td>
    <td><span class="badge b-cyan">${esc(p.cat)}</span></td><td class="mono">${money(p.price)}</td>
    <td class="mono" style="color:${p.stock===0?'var(--red)':p.stock<50?'var(--amber)':''}">${p.stock}</td>
    <td>${p.stock===0?'<span class="badge b-refund">缺货</span>':p.stock<50?'<span class="badge b-warn">低库存</span>':'<span class="badge b-done">正常</span>'}</td>
  </tr>`).join('');
  h += `</tbody></table></div>
    <div class="btn-row" style="margin-top:16px">
      <button class="btn primary" onclick="showCreateOrder()">＋ 模拟下单（Redis 预扣库存）</button>
      <button class="btn" onclick="syncStock()">↻ 模拟供应商库存同步</button>
    </div>
    <div class="hint">防超卖策略：Redis Lua 原子预扣减 → MQ 异步落库 → DB 条件更新失败则回滚 Redis 并取消订单。</div>
  </div>`;
  return h;
}

function showCreateOrder() {
  const opts = S.products.filter(p=>p.stock>0).map(p => `<option value="${p.id}">${esc(p.name)} · ${money(p.price)} · 库存${p.stock}</option>`).join('');
  openModal('模拟下单', `
    <div class="field"><label>选择商品</label><select id="moProduct">${opts}</select></div>
    <div class="field"><label>数量</label><input id="moQty" type="number" value="1" min="1"></div>
    <div class="hint">下单将触发 Redis 库存预扣减，创建待付款订单。</div>`,
    [{label:'取消', cls:''},{label:'确认下单', cls:'primary', onClick:()=>{
      const r = createOrder($('#moProduct').value, parseInt($('#moQty').value)||1);
      toast(r.msg, !r.ok); render(); return r.ok;
    }}]);
}
function syncStock() {
  S.products.forEach(p => { p.stock += Math.floor(Math.random()*20)-5; if (p.stock<0) p.stock=0; });
  log('INFO', '供应商库存定时同步完成，5 个 SKU 库存已更新');
  save(); render(); toast('库存同步完成');
}

function renderOrders() {
  let h = `<div class="card"><h3>订单列表 <span class="sub">双层状态机 · 乐观锁版本控制</span></h3>
    <div class="scroll"><table><thead><tr><th>订单号</th><th>买家</th><th>金额</th><th>履约状态</th><th>支付状态</th><th>子单</th><th>版本</th><th>操作</th></tr></thead><tbody>`;
  h += S.orders.map(o => `<tr>
    <td class="mono">${esc(o.id)}</td><td class="mono">${esc(o.userId)}</td>
    <td class="mono">${money(o.amount)}</td><td>${badge(o.status)}</td>
    <td><span class="badge ${o.payStatus==='SUCCESS'?'b-done':'b-creat'}">${o.payStatus}</span></td>
    <td class="mono">${o.items.length}</td><td class="mono">v${o.version}</td>
    <td><button class="btn sm" onclick="showOrderDetail('${o.id}')">详情</button></td>
  </tr>`).join('');
  h += `</tbody></table></div></div>`;
  return h;
}

function showOrderDetail(id) {
  const o = S.orders.find(x=>x.id===id); if (!o) return;
  const items = o.items.map(it => `<tr><td class="mono">${it.productId}</td><td>${esc(it.supplier)}</td><td class="mono">${money(it.amount)}</td><td>${badge(it.status)}</td></tr>`).join('');
  const buttons = [];
  if (o.status === 'CREATED') buttons.push({label:'模拟支付', cls:'primary', onClick:()=>{ const r=payOrder(id); toast(r.msg,!r.ok); render(); return r.ok; }});
  if (['COMPLETED','SETTLED'].includes(o.status)) {
    buttons.push({label:'生成分账指令', cls:'primary', onClick:()=>{ const r=createSplit(id); toast(r.msg,!r.ok); render(); return r.ok; }});
  }
  if (!['CLOSED','CANCELLED'].includes(o.status)) {
    buttons.push({label:'发起退款', cls:'danger', onClick:()=>{ const r=refundOrder(id); toast(r.msg,!r.ok); render(); return r.ok; }});
  }
  buttons.push({label:'调试状态', cls:'', onClick:()=>{ closeModal(); setTimeout(()=>{ switchPage('debug'); $('#dbgOrder').value=id; },100); return true; }});
  buttons.push({label:'关闭', cls:''});
  openModal('订单详情 · ' + short(id), `
    <div class="kv">
      <div class="k">订单号</div><div class="mono">${esc(o.id)}</div>
      <div class="k">买家</div><div class="mono">${esc(o.userId)}</div>
      <div class="k">实付金额</div><div class="mono" style="color:var(--blue)">${money(o.amount)}</div>
      <div class="k">履约状态</div><div>${badge(o.status)}</div>
      <div class="k">支付状态</div><div class="mono">${o.payStatus}</div>
      <div class="k">退款状态</div><div class="mono">${o.refundStatus}</div>
      <div class="k">乐观锁版本</div><div class="mono">v${o.version}</div>
      <div class="k">下单时间</div><div class="mono">${esc(o.time)}</div>
    </div>
    <div class="section-title">状态机流转路径</div>
    ${orderFlow(o.status)}
    <div class="section-title">子订单（按供应商拆分 · 最大余额法分摊）</div>
    <div class="scroll"><table><thead><tr><th>商品</th><th>供应商</th><th>分摊金额</th><th>状态</th></tr></thead><tbody>${items}</tbody></table></div>
    <div class="btn-row" style="margin-top:16px">
      ${o.items.length>1 ? `<button class="btn" onclick="doSplit('${id}')">执行拆单校验</button>`:''}
    </div>`, buttons);
}
function doSplit(id) { const r = splitOrder(id); toast(r.msg, !r.ok); render(); }
