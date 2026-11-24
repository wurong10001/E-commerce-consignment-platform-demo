/* ========== UI 辅助函数（Apple Liquid Glass 版） ========== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = (c) => '¥' + (Number(c)/100).toFixed(2);

/* 状态 → 语义色：一般灰 / 进行中蓝 / 完成绿 / 警示橙 / 危险红 */
const STATE_BADGE = {
  CREATED:'grey', PAID:'blue', ACCEPTED:'blue', SHIPPED:'indigo', COMPLETED:'green',
  SETTLED:'green', AFTER_SALE_PENDING:'heat', REFUNDING:'heat', CLOSED:'red', CANCELLED:'red'
};
const SPLIT_BADGE = {
  INIT:'grey', PUSHING:'blue', ACCEPTED:'blue', PROCESSING:'indigo', SUCCESS:'green',
  PART_SUCCESS:'heat', FREEZE:'heat', REVOKED:'red', FAILED:'red'
};
function badge(state, kind='order') {
  const tone = kind === 'split' ? (SPLIT_BADGE[state]||'grey') : (STATE_BADGE[state]||'grey');
  const label = kind === 'split' ? state : (STATE_LABEL[state]||state);
  return `<span class="badge ${tone}">${esc(label)}</span>`;
}
function short(id) { return id.length > 18 ? id.slice(0,12)+'…'+id.slice(-4) : id; }

let toastTimer = null;
function toast(msg, err=false) {
  const el = $('#toast');
  el.textContent = msg; el.classList.toggle('err', !!err); el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
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
  // 同一帧触发布局，再开启过渡（materialize: 模糊+缩放+透明度一起）
  requestAnimationFrame(() => { $('#scrim').classList.add('show'); $('#modal').classList.add('show'); });
}
function closeModal() {
  $('#modal').classList.remove('show');
  $('#scrim').classList.remove('show');
}

/* 状态机流转可视化：当前节点实心强调蓝，已完成节点淡蓝 */
function flowFor(current, states, labels) {
  const idxCur = states.indexOf(current);
  return `<div class="flow">` + states.map((s,i) => {
    let cls = '';
    if (current === s) cls = 'on';
    else if (idxCur >= 0 && i < idxCur && current !== 'CLOSED' && current !== 'CANCELLED') cls = 'done';
    return `<span class="node ${cls}">${esc(labels ? labels[i] : s)}</span>` +
      (i < states.length-1 ? '<span class="arr">→</span>' : '');
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
