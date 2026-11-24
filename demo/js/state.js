/* ========== 全局状态层：种子数据 + 持久化 + 核心业务动作 ========== */
const STORAGE_KEY = 'dsx_demo_state_v1';

const ORDER_STATES = ['CREATED','PAID','ACCEPTED','SHIPPED','COMPLETED','SETTLED','AFTER_SALE_PENDING','REFUNDING','CLOSED','CANCELLED'];
const SPLIT_STATES = ['INIT','PUSHING','ACCEPTED','PROCESSING','SUCCESS','PART_SUCCESS','FREEZE','REVOKED','FAILED'];
const STATE_LABEL = {
  CREATED:'待付款', PAID:'已付款/待发货', ACCEPTED:'已接单', SHIPPED:'已发货',
  COMPLETED:'已完成', SETTLED:'已结算', AFTER_SALE_PENDING:'售后中', REFUNDING:'退款中',
  CLOSED:'已关闭', CANCELLED:'已取消'
};
const STATE_CLASS = {
  CREATED:'b-creat', PAID:'b-paid', ACCEPTED:'b-cyan', SHIPPED:'b-ship', COMPLETED:'b-done',
  SETTLED:'b-done', AFTER_SALE_PENDING:'b-warn', REFUNDING:'b-warn', CLOSED:'b-refund', CANCELLED:'b-refund'
};
const SPLIT_CLASS = {
  INIT:'b-creat', PUSHING:'b-paid', ACCEPTED:'b-cyan', PROCESSING:'b-ship', SUCCESS:'b-done',
  PART_SUCCESS:'b-warn', FREEZE:'b-warn', REVOKED:'b-refund', FAILED:'b-refund'
};

// 种子数据唯一来源：demo/js/seed.js（state.js 只负责持久化、日志、ID 生成）
function seedState() { return Seed.createSeedState(); }
// 兼容别名：actions.js 的 createOrder 仍使用 mkOrder/mkItem
function mkOrder(id, userId, amount, status, payStatus, time, items) {
  return Seed.mkOrder(id, userId, amount, status, payStatus, time, items);
}
function mkItem(productId, supplier, amount, status) {
  return Seed.mkItem(productId, supplier, amount, status);
}

let S = load();
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      // 版本迁移：v1 种子含 PAY_SUCCESS 旧口径，且资金指标不自洽；统一重置为 v2
      if (d && d.version === 2) return d;
      if (d && d.version === 1) {
        const fresh = seedState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
      }
    }
  } catch (e) { console.warn('状态读取失败', e); }
  return seedState();
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }
  catch (e) { console.warn('状态保存失败', e); }
}
function resetState() { S = seedState(); save(); }

function log(level, msg) {
  S.logs.unshift({ id: ++S.seq.log, time: new Date().toISOString().slice(0,19).replace('T',' '), level, msg });
  if (S.logs.length > 80) S.logs.length = 80;
}
function nextId(prefix) { return prefix + String(++S.seq[prefix.toLowerCase()] || 1).padStart(6,'0'); }
