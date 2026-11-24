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

function seedState() {
  const now = Date.now();
  const t = (m) => new Date(now - m * 60000).toISOString().slice(0, 19).replace('T', ' ');
  return {
    version: 1,
    seq: { order: 124, product: 12, split: 8, ledger: 20, reconcile: 5, commission: 6, log: 30 },
    products: [
      { id:'SKU1001', name:'无线蓝牙耳机 Pro', supplier:'S1001 深圳智造', price:29900, stock:168, cat:'数码' },
      { id:'SKU1002', name:'便携咖啡机', supplier:'S1002 杭州家居', price:45900, stock:42, cat:'家电' },
      { id:'SKU1003', name:'纯棉四件套', supplier:'S1003 南通纺织', price:19900, stock:305, cat:'家居' },
      { id:'SKU1004', name:'智能体脂秤', supplier:'S1001 深圳智造', price:12900, stock:0, cat:'数码' },
      { id:'SKU1005', name:'户外保温杯', supplier:'S1002 杭州家居', price:8900, stock:520, cat:'家居' },
    ],
    orders: [
      mkOrder('DSO20261124000121', 'u_1001', 29900, 'SHIPPED', 'PAY_SUCCESS', t(180), [
        mkItem('SKU1001', 'S1001 深圳智造', 29900, 'SHIPPED')]),
      mkOrder('DSO20261124000122', 'u_1002', 65800, 'COMPLETED', 'PAY_SUCCESS', t(120), [
        mkItem('SKU1002', 'S1002 杭州家居', 45900, 'COMPLETED'),
        mkItem('SKU1001', 'S1001 深圳智造', 19900, 'COMPLETED')]),
      mkOrder('DSO20261124000123', 'u_1003', 49750, 'PAID', 'PAY_SUCCESS', t(60), [
        mkItem('SKU1003', 'S1003 南通纺织', 19900, 'PAID'),
        mkItem('SKU1002', 'S1002 杭州家居', 29850, 'PAID')]),
      mkOrder('DSO20261124000124', 'u_1004', 8900, 'CREATED', 'INIT', t(12), [
        mkItem('SKU1005', 'S1002 杭州家居', 8900, 'CREATED')]),
      mkOrder('DSO20261124000120', 'u_1005', 19900, 'REFUNDING', 'PAY_SUCCESS', t(300), [
        mkItem('SKU1003', 'S1003 南通纺织', 19900, 'REFUNDING')]),
    ],
    splits: [
      { id:'SP20261124000005', orderId:'DSO20261124000122', receiver:'VA_S1002', role:'SUPPLIER', amount:27540, status:'SUCCESS', key:'SPLIT_DSO...122_VA_S1002_0001', time:t(100) },
      { id:'SP20261124000006', orderId:'DSO20261124000122', receiver:'VA_D2031', role:'DISTRIBUTOR', amount:13160, status:'SUCCESS', key:'SPLIT_DSO...122_VA_D2031_0001', time:t(100) },
      { id:'SP20261124000007', orderId:'DSO20261124000121', receiver:'VA_S1001', role:'SUPPLIER', amount:17940, status:'ACCEPTED', key:'SPLIT_DSO...121_VA_S1001_0001', time:t(60) },
    ],
    ledger: [
      { id:'LG000018', biz:'DSO20261124000122', account:'VA_S1002', type:'SPLIT_ACCOUNT', amount:27540, status:1, key:'SPLIT_DSO...122_VA_S1002_0001', time:t(100) },
      { id:'LG000019', biz:'DSO20261124000122', account:'VA_D2031', type:'SPLIT_ACCOUNT', amount:13160, status:1, key:'SPLIT_DSO...122_VA_D2031_0001', time:t(100) },
      { id:'LG000020', biz:'DSO20261124000121', account:'VA_S1001', type:'SPLIT_ACCOUNT', amount:17940, status:0, key:'SPLIT_DSO...121_VA_S1001_0001', time:t(60) },
    ],
    reconciles: [
      { id:'RC0001', date:'2026-11-23', layer:'金额层', type:'金额不一致', order:'DSO20261123000088', diff:200, status:'PENDING', risk:'P0', time:t(1440) },
      { id:'RC0002', date:'2026-11-23', layer:'订单层', type:'短款', order:'DSO20261123000091', diff:12900, status:'AUTO_FIXED', risk:'P1', time:t(1440) },
      { id:'RC0003', date:'2026-11-23', layer:'资金层', type:'状态不一致', order:'DSO20261123000095', diff:0, status:'PENDING', risk:'P1', time:t(1440) },
    ],
    commissions: [
      { id:'CM0001', order:'DSO20261124000122', user:'u_1002', level:'一级', base:65800, rate:0.20, amount:13160, status:'PENDING', time:t(120) },
      { id:'CM0002', order:'DSO20261124000121', user:'u_1001', level:'一级', base:29900, rate:0.20, amount:5980, status:'SETTLED', time:t(180) },
      { id:'CM0003', order:'DSO20261123000088', user:'u_1009', level:'二级', base:19900, rate:0.05, amount:995, status:'PENDING', time:t(1500) },
    ],
    logs: [
      { id:1, time:t(120), level:'INFO', msg:'订单 DSO...122 确认收货，触发分账事件' },
      { id:2, time:t(100), level:'OK', msg:'分账指令 SP...005 渠道受理成功 (ACCEPTED)' },
      { id:3, time:t(60), level:'INFO', msg:'订单 DSO...121 发货，状态 SHIPPED' },
      { id:4, time:t(12), level:'WARN', msg:'订单 DSO...124 库存预扣减成功，待支付超时释放' },
    ],
  };
}
function mkOrder(id, userId, amount, status, payStatus, time, items) {
  return { id, userId, amount, status, payStatus, refundStatus:'NONE', version:0, time, items, splits:0 };
}
function mkItem(productId, supplier, amount, status) {
  return { productId, supplier, amount, status };
}

let S = load();
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const d = JSON.parse(raw); if (d && d.version) return d; }
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
