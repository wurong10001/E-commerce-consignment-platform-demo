/* ========== 页面渲染层（续）：资金 / 对账 / 佣金 / 调试 ========== */

function renderFunds() {
  const frozen = S.orders.filter(o=>o.payStatus==='SUCCESS'&&!['CLOSED','CANCELLED'].includes(o.status)).reduce((a,o)=>a+o.amount,0);
  const splitTotal = S.splits.filter(s=>['SUCCESS','ACCEPTED','PROCESSING'].includes(s.status)).reduce((a,s)=>a+s.amount,0);
  let h = `<div class="grid g4">
    <div class="card stat"><div class="label">◈ 监管户冻结资金</div><div class="value blue">${money(frozen)}</div><div class="foot">货款直入监管户，平台不触碰</div></div>
    <div class="card stat"><div class="label">✓ 已划拨资金</div><div class="value green">${money(splitTotal)}</div><div class="foot">分账至各方虚拟子户</div></div>
    <div class="card stat"><div class="label">◇ 分账指令</div><div class="value">${S.splits.length}</div><div class="foot">${S.splits.filter(s=>s.status==='FREEZE').length} 笔冻结 · ${S.splits.filter(s=>s.status==='REVOKED').length} 笔已冲正</div></div>
    <div class="card stat"><div class="label">▤ 资金流水</div><div class="value purple">${S.ledger.length}</div><div class="foot">唯一真理来源 · 幂等键唯一索引</div></div>
  </div>`;

  h += `<div class="card" style="margin-top:18px"><h3>分账指令状态机 <span class="sub">事件驱动 · 禁止跨态跳变 · 乐观锁</span></h3>
    <div class="scroll"><table><thead><tr><th>指令号</th><th>关联订单</th><th>接收方</th><th>角色</th><th>金额</th><th>状态</th><th>幂等键</th><th>操作</th></tr></thead><tbody>`;
  h += S.splits.map(s => `<tr>
    <td class="mono">${esc(s.id)}</td><td class="mono">${esc(short(s.orderId))}</td>
    <td class="mono">${esc(s.receiver)}</td><td>${esc(s.role)}</td>
    <td class="mono">${money(s.amount)}</td><td>${badge(s.status,'split')}</td>
    <td class="mono" style="font-size:10px;color:var(--dim)">${esc(short(s.key))}</td>
    <td><div class="btn-row">
      ${s.status==='INIT'?`<button class="btn sm primary" onclick="doPushSplit('${s.id}')">推送</button>`:''}
      ${['ACCEPTED','PROCESSING'].includes(s.status)?`<button class="btn sm green" onclick="doSettleSplit('${s.id}')">确认到账</button>`:''}
      <button class="btn sm" onclick="doFreeze('${s.id}')">${s.status==='FREEZE'?'解冻':'冻结'}</button>
    </div></td>
  </tr>`).join('');
  h += `</tbody></table></div>
    <div class="hint">铁律：已分账订单退款必须先回退（冲正）再退款；UNKNOWN 保持 PUSHING 不臆断终态，原号重发 + 查询兜底。</div>
  </div>`;

  h += `<div class="card" style="margin-top:18px"><h3>资金流水账本 <span class="sub">fund_ledger · 财务对账唯一真理来源</span></h3>
    <div class="scroll"><table><thead><tr><th>流水号</th><th>业务订单</th><th>账户</th><th>类型</th><th>金额</th><th>状态</th><th>幂等键</th><th>时间</th></tr></thead><tbody>`;
  h += S.ledger.slice(0,20).map(l => `<tr>
    <td class="mono">${esc(l.id)}</td><td class="mono">${esc(l.biz==='-'?'-':short(l.biz))}</td>
    <td class="mono">${esc(l.account)}</td><td><span class="badge b-cyan">${esc(l.type)}</span></td>
    <td class="mono" style="color:${l.amount<0?'var(--red)':'var(--green)'}">${l.amount>0?'+':''}${money(l.amount)}</td>
    <td>${l.status===1?'<span class="badge b-done">成功</span>':'<span class="badge b-warn">处理中</span>'}</td>
    <td class="mono" style="font-size:10px;color:var(--dim)">${esc(short(l.key))}</td>
    <td class="mono" style="font-size:10px">${esc(l.time)}</td>
  </tr>`).join('');
  h += `</tbody></table></div>
    <div class="btn-row" style="margin-top:16px">
      <button class="btn primary" onclick="showWithdraw()">↗ 模拟提现</button>
    </div>
  </div>`;
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
    <div class="hint">资金从虚拟子户划付至绑定银行卡，平台仅推送指令不触碰资金。</div>`,
    [{label:'取消',cls:''},{label:'确认提现',cls:'primary',onClick:()=>{
      const r=withdraw($('#wdAcct').value, Math.round(parseFloat($('#wdAmt').value)*100));
      toast(r.msg,!r.ok); render(); return r.ok;
    }}]);
}

function renderReconcile() {
  const pending = S.reconciles.filter(r=>r.status==='PENDING').length;
  const fixed = S.reconciles.filter(r=>r.status.includes('FIXED')).length;
  let h = `<div class="grid g3">
    <div class="card stat"><div class="label">☷ 对账差异总数</div><div class="value">${S.reconciles.length}</div><div class="foot">四层核对：订单/数量/金额/资金</div></div>
    <div class="card stat"><div class="label">⚠ 待处理</div><div class="value ${pending?'amber':'green'}">${pending}</div><div class="foot">${S.reconciles.filter(r=>r.risk==='P0').length} 条 P0 级高危</div></div>
    <div class="card stat"><div class="label">✓ 自动化处理率</div><div class="value green">${S.reconciles.length?Math.round(fixed/S.reconciles.length*100):0}%</div><div class="foot">目标 ≥ 95%</div></div>
  </div>`;
  h += `<div class="card" style="margin-top:18px"><h3>差错四象限 <span class="sub">按 SQL 比对逻辑自动分类</span></h3>
    <div class="grid g4" style="margin-bottom:16px">
      ${['短款（渠道有系统无）','长款（系统有渠道无）','金额不一致（高危）','状态不一致'].map((t,i)=>`
      <div style="background:var(--panel2);border:1px solid var(--border);border-radius:9px;padding:12px">
        <div style="font-size:11px;color:var(--muted)">场景${i+1}</div>
        <div style="font-size:12.5px;margin-top:5px;color:${i===2?'var(--red)':''}">${t}</div>
      </div>`).join('')}
    </div>
    <div class="scroll"><table><thead><tr><th>差异号</th><th>账单日期</th><th>层级</th><th>类型</th><th>订单</th><th>差额</th><th>风险</th><th>状态</th><th>操作</th></tr></thead><tbody>`;
  h += S.reconciles.map(r => `<tr>
    <td class="mono">${esc(r.id)}</td><td class="mono">${esc(r.date)}</td>
    <td><span class="badge b-cyan">${esc(r.layer)}</span></td><td>${esc(r.type)}</td>
    <td class="mono">${esc(short(r.order))}</td>
    <td class="mono" style="color:${r.diff>0?'var(--red)':''}">${r.diff?money(r.diff):'—'}</td>
    <td>${r.risk==='P0'?'<span class="badge b-refund">P0</span>':'<span class="badge b-warn">'+r.risk+'</span>'}</td>
    <td>${r.status==='PENDING'?'<span class="badge b-warn">待处理</span>':r.status.includes('FIXED')?'<span class="badge b-done">已修复</span>':'<span class="badge b-creat">'+r.status+'</span>'}</td>
    <td>${r.status==='PENDING'?`<div class="btn-row">
      <button class="btn sm green" onclick="doRecon('${r.id}','fix')">自动修复</button>
      <button class="btn sm" onclick="doRecon('${r.id}','manual')">人工调账</button>
    </div>`:'—'}</td>
  </tr>`).join('');
  h += `</tbody></table></div>
    <div class="btn-row" style="margin-top:16px"><button class="btn" onclick="runReconcile()">▶ 模拟执行 T+1 对账任务</button></div>
    <div class="hint">P0 级差异严禁自动处理，直接生成 P0 告警冻结结算并转人工财务介入。</div>
  </div>`;
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
    <div class="card stat"><div class="label">◇ 待结算佣金</div><div class="value amber">${money(pending)}</div><div class="foot">订单完成后正式计算</div></div>
    <div class="card stat"><div class="label">✓ 已结算佣金</div><div class="value green">${money(settled)}</div><div class="foot">级差 + 固定比例</div></div>
    <div class="card stat"><div class="label">▤ 佣金记录</div><div class="value purple">${S.commissions.length}</div><div class="foot">含负向扣回记录</div></div>
  </div>`;
  h += `<div class="card" style="margin-top:18px"><h3>佣金计算引擎 <span class="sub">规则快照 · 退款负向回溯</span></h3>
    <div class="scroll"><table><thead><tr><th>佣金单号</th><th>关联订单</th><th>分销商</th><th>层级</th><th>基数</th><th>比例</th><th>佣金</th><th>状态</th><th>操作</th></tr></thead><tbody>`;
  h += S.commissions.map(c => `<tr>
    <td class="mono">${esc(c.id)}</td><td class="mono">${esc(short(c.order))}</td>
    <td class="mono">${esc(c.user)}</td><td>${esc(c.level)}</td>
    <td class="mono">${money(c.base)}</td><td class="mono">${(c.rate*100).toFixed(0)}%</td>
    <td class="mono" style="color:${c.amount<0?'var(--red)':'var(--green)'}">${c.amount>0?'+':''}${money(c.amount)}</td>
    <td>${c.status==='PENDING'?'<span class="badge b-warn">待结算</span>':'<span class="badge b-done">已结算</span>'}</td>
    <td>${c.status==='PENDING'?`<button class="btn sm green" onclick="doSettleCm('${c.id}')">结算</button>`:''}
        ${c.amount>0?`<button class="btn sm danger" onclick="doReverseCm('${c.id}')">退款扣回</button>`:''}</td>
  </tr>`).join('');
  h += `</tbody></table></div>
    <div class="hint">级差佣金示例：一级20%、二级15%、三级10% → 三级卖单100元，二级得(15%-10%)=5元，一级得(20%-15%)=5元。快照机制保证规则变更不影响历史订单。</div>
  </div>`;
  return h;
}
function doSettleCm(id){const r=settleCommission(id);toast(r.msg,!r.ok);render();}
function doReverseCm(id){const r=reverseCommission(id);toast(r.msg,!r.ok);render();}

function renderDebug() {
  const orderOpts = S.orders.map(o=>`<option value="${o.id}">${short(o.id)} · ${STATE_LABEL[o.status]} · ${money(o.amount)}</option>`).join('');
  const splitOpts = S.splits.map(s=>`<option value="${s.id}">${s.id} · ${s.status} · ${money(s.amount)}</option>`).join('');
  let h = `<div class="grid g2">`;
  // 订单状态调试
  h += `<div class="debug-card"><h4>⚙ 订单状态调试</h4>
    <div class="field"><label>选择订单</label><select id="dbgOrder">${orderOpts}</select></div>
    <div class="field"><label>目标状态（可强制跨态）</label><select id="dbgTarget">${ORDER_STATES.map(s=>`<option value="${s}">${s} (${STATE_LABEL[s]})</option>`).join('')}</select></div>
    <label style="font-size:11px;display:flex;align-items:center;gap:6px;color:var(--muted)">
      <input type="checkbox" id="dbgForce" style="width:auto"> 强制跨态（跳过状态机校验）</label>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn primary" onclick="dbgSetOrder()">应用状态</button>
      <button class="btn" onclick="dbgPay()">模拟支付</button>
      <button class="btn" onclick="dbgRefund()">模拟退款</button>
    </div>
    <div class="hint">正常模式遵循 TRANSITIONS 流转表并校验合法性；勾选"强制跨态"可任意跳转（模拟异常修复）。每次变更 version+1 并写状态日志。</div>
  </div>`;
  // 分账状态调试
  h += `<div class="debug-card"><h4>◈ 分账指令调试</h4>
    <div class="field"><label>选择分账指令</label><select id="dbgSplit">${splitOpts}</select></div>
    <div class="field"><label>目标状态</label><select id="dbgSplitTarget">${SPLIT_STATES.map(s=>`<option value="${s}">${s}</option>`).join('')}</select></div>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn primary" onclick="dbgSetSplit()">设置状态</button>
      <button class="btn" onclick="dbgInjectUnknown()">注入 UNKNOWN 事件</button>
    </div>
    <div class="hint">UNKNOWN 事件会保持 PUSHING 在途态，验证"不臆断终态"契约。FREEZE 用于争议冻结，REVOKED 用于冲正作废。</div>
  </div>`;
  h += `</div>`;
  // 事件注入 + 日志
  h += `<div class="grid g2" style="margin-top:16px">
    <div class="debug-card"><h4>⚡ 异常场景注入</h4>
      <div class="btn-row">
        <button class="btn danger" onclick="dbgStockFail()">库存扣减失败</button>
        <button class="btn danger" onclick="dbgTimeout()">分账接口超时</button>
        <button class="btn danger" onclick="dbgBalanceLow()">退款余额不足</button>
        <button class="btn" onclick="dbgDuplicate()">重复幂等键测试</button>
      </div>
      <div class="hint">注入后观察日志与状态变化，验证异常调度矩阵（支付回调丢失/分账超时/余额不足/库存失败）。</div>
    </div>
    <div class="debug-card"><h4>📋 实时调试日志 <span class="sub">TRACE_ID 关联</span></h4>
      <div class="log" id="debugLog">`;
  h += S.logs.slice(0,30).map(l=>`<div class="${l.level.toLowerCase()}">[${esc(l.time)}] <b>${esc(l.level)}</b> ${esc(l.msg)}</div>`).join('');
  h += `</div></div></div>`;
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
function dbgInjectUnknown(){
  const id=$('#dbgSplit').value;const s=S.splits.find(x=>x.id===id);if(!s)return;
  s.status='PUSHING';log('WARN',`分账 ${id} 收到 UNKNOWN/TIMEOUT，保持 PUSHING 在途，原号重发+查询兜底`);save();render();toast('UNKNOWN 已注入，状态保持 PUSHING');
}
function dbgStockFail(){log('ERR','库存扣减失败：Redis 扣减成功但 DB 条件更新失败，触发回滚 Redis + 取消订单');save();renderDebugLog();toast('已注入：库存扣减失败');}
function dbgTimeout(){log('ERR','分账接口调用 30s 超时 → UNKNOWN，启动退避重试（原幂等键重发）');save();renderDebugLog();toast('已注入：分账接口超时');}
function dbgBalanceLow(){log('ERR','退款失败：供应商虚拟户余额不足冲正 → 挂起退款，冻结提现权限，触发财务告警');save();renderDebugLog();toast('已注入：退款余额不足');}
function dbgDuplicate(){
  const k='SPLIT_DUPLICATE_TEST_0001';
  const g=new IdempotentKeyGenerator();
  try{g.generate('SPLIT','DUPLICATE_TEST',1);g.generate('SPLIT','DUPLICATE_TEST',1);}
  catch(e){log('OK','幂等键唯一索引生效：重复分账请求被拦截（'+e.message+'）');}
  save();renderDebugLog();toast('已测试：重复幂等键拦截');
}
function renderDebugLog(){
  const el=$('#debugLog');if(!el)return;
  el.innerHTML=S.logs.slice(0,30).map(l=>`<div class="${l.level.toLowerCase()}">[${esc(l.time)}] <b>${esc(l.level)}</b> ${esc(l.msg)}</div>`).join('');
}
