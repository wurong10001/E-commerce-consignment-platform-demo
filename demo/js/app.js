/* ========== 应用入口：路由 + 初始化（双布局按分辨率切换） ========== */
const PAGE_RENDER = {
  dashboard:renderDashboard, products:renderProducts, orders:renderOrders,
  funds:renderFunds, reconcile:renderReconcile, commission:renderCommission, debug:renderDebug,
};
let currentPage = 'dashboard';

function switchPage(page) {
  if (!PAGE_RENDER[page]) page = 'dashboard';
  currentPage = page;
  // 两套导航同步高亮（同一 data-page）
  $$('[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === page));
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
  const el = $('#clock'); if (el) el.textContent = new Date().toLocaleString('zh-CN', {hour12:false});
}

function bindNav() {
  $$('[data-page]').forEach(b => b.addEventListener('click', () => switchPage(b.dataset.page)));
}

function init() {
  bindNav();

  $('#resetBtn').addEventListener('click', () => {
    openModal('重置演示数据', '<p style="color:var(--text-2);line-height:1.7">确认恢复全部演示数据？当前所有修改（订单状态、分账、对账处理等）将被清除。</p>',
      [{label:'取消', cls:''},{label:'确认重置', cls:'primary', onClick:()=>{ resetState(); render(); toast('演示数据已重置'); }}]);
  });

  $('#modalClose').addEventListener('click', closeModal);
  $('#scrim').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // 滚动边线：仅当内容真的滚到顶栏下面才出现发丝线
  const topbar = $('#topbar');
  addEventListener('scroll', () => topbar.classList.toggle('scrolled', scrollY > 8), {passive:true});

  setInterval(tickClock, 1000); tickClock();
  render();
  log('INFO', 'Demo 初始化完成，Apple 视觉系统已加载');
  save();
}
document.addEventListener('DOMContentLoaded', init);
