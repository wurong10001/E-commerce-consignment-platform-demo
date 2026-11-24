/* ========== UI 辅助函数 ========== */
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = (c) => '¥' + (Number(c)/100).toFixed(2);

function badge(state, kind='order') {
  const cls = kind === 'split' ? (SPLIT_CLASS[state]||'b-creat') : (STATE_CLASS[state]||'b-creat');
  const label = kind === 'split' ? state : (STATE_LABEL[state]||state);
  return `<span class="badge ${cls}">${esc(label)}</span>`;
}
function short(id) { return id.length > 18 ? id.slice(0,12)+'…'+id.slice(-4) : id; }

let toastTimer = null;
function toast(msg, err=false) {
  const el = $('#toast');
  el.textContent = msg; el.className = 'toast show' + (err ? ' err' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.className = 'toast', 2800);
}

function openModal(title, bodyHtml, buttons=[]) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHtml;
  const foot = $('#modalFoot'); foot.innerHTML = '';
  (buttons.length ? buttons : [{label:'关闭', cls:''}]).forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + (b.cls||'');
    btn.textContent = b.label;
    btn.onclick = () => { if (b.onClick && b.onClick() === false) return; closeModal(); };
    foot.appendChild(btn);
  });
  $('#modal').style.display = 'flex';
}
function closeModal() { $('#modal').style.display = 'none'; }

// 订单状态机流转可视化
function flowFor(current, states, labels) {
  return `<div class="flow">` + states.map((s,i) => {
    const idxCur = states.indexOf(current);
    let cls = '';
    if (current === s) cls = 'on';
    else if (idxCur >= 0 && i < idxCur && current !== 'CLOSED' && current !== 'CANCELLED') cls = 'done';
    const node = `<span class="node ${cls}">${esc(labels ? labels[i] : s)}</span>`;
    return node + (i < states.length - 1 ? '<span class="arr">→</span>' : '');
  }).join('') + `</div>`;
}
function orderFlow(status) {
  return flowFor(status,
    ['CREATED','PAID','ACCEPTED','SHIPPED','COMPLETED','SETTLED'],
    ['待付款','已付款','已接单','已发货','已完成','已结算']);
}
function splitFlow(status) {
  return flowFor(status,
    ['INIT','PUSHING','ACCEPTED','PROCESSING','SUCCESS'],
    ['INIT','PUSHING','ACCEPTED','PROCESSING','SUCCESS']);
}
