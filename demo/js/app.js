/* ========== 应用入口：路由 + 初始化 ========== */
const PAGE_RENDER = {
  dashboard:renderDashboard, products:renderProducts, orders:renderOrders,
  funds:renderFunds, reconcile:renderReconcile, commission:renderCommission, debug:renderDebug,
};
let currentPage = 'dashboard';

function switchPage(page) {
  if (!PAGE_RENDER[page]) page = 'dashboard';
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  const meta = PAGE_META[page] || PAGE_META.dashboard;
  $('#pageTitle').textContent = meta.title;
  $('#pageDesc').textContent = meta.desc;
  render();
  window.scrollTo({top:0, behavior:'smooth'});
}
function render() {
  const r = PAGE_RENDER[currentPage];
  $('#content').innerHTML = r ? r() : '<div class="empty">页面不存在</div>';
}

function tickClock() {
  const el = $('#clock'); if (!el) return;
  el.textContent = new Date().toLocaleString('zh-CN', {hour12:false});
}

function init() {
  document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => switchPage(b.dataset.page)));
  $('#resetBtn').addEventListener('click', () => {
    openModal('重置演示数据', '<p>确认恢复全部演示数据？当前修改将丢失。</p>',
      [{label:'取消'},{label:'确认重置', cls:'primary', onClick:()=>{ resetState(); render(); toast('演示数据已重置'); }}]);
  });
  $('#modalClose').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', e => { if (e.target === $('#modal')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  setInterval(tickClock, 1000); tickClock();
  render();
  log('INFO', 'Demo 初始化完成，状态数据已加载（localStorage 持久化）');
  save();
}
document.addEventListener('DOMContentLoaded', init);
