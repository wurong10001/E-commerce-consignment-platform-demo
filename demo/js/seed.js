/**
 * 电商代销平台 · 唯一种子真源（UMD：浏览器 + Node 共用）
 * ------------------------------------------------------------------
 * 所有看板数字、Worker /api/stats、全链路推演脚本一律通过 metrics(state) 计算，
 * 杜绝"同一指标多算法"（G2）与冻结额重复计算（G3）。
 *
 * 不变量：gmv = frozen + allocated
 *   gmv       = Σ 已支付且未 CLOSED/CANCELLED 的订单金额
 *   allocated = Σ ledger 中 status=1 且 type=SPLIT_ACCOUNT 的金额（资金账本唯一真源）
 *   frozen    = gmv - allocated （差额法）
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Seed = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PAY_SUCCESS = 'SUCCESS'; // 唯一支付成功常量：消灭 PAY_SUCCESS/SUCCESS 口径分裂
  const BASE_TIME = Date.UTC(2026, 10, 24, 2, 0, 0); // 固定基准，Node 推演可复现

  const TRANSITIONS = {
    CREATED: ['PAID', 'CANCELLED'],
    PAID: ['ACCEPTED', 'AFTER_SALE_PENDING', 'CANCELLED'],
    ACCEPTED: ['SHIPPED', 'AFTER_SALE_PENDING'],
    SHIPPED: ['PART_SHIPPED', 'COMPLETED', 'AFTER_SALE_PENDING'],
    PART_SHIPPED: ['SHIPPED', 'COMPLETED', 'SETTLED', 'AFTER_SALE_PENDING'],
    COMPLETED: ['SETTLED', 'AFTER_SALE_PENDING'],
    SETTLED: ['AFTER_SALE_PENDING'],
    AFTER_SALE_PENDING: ['REFUNDING', 'SHIPPED', 'COMPLETED', 'SETTLED'],
    REFUNDING: ['CLOSED', 'COMPLETED', 'SETTLED'],
    CLOSED: [], CANCELLED: [],
  };

  // 子订单状态机（按供应商独立流转，与主单解耦）
  const ITEM_TRANSITIONS = {
    CREATED: ['PAID', 'CANCELLED'],
    PAID: ['ACCEPTED', 'AFTER_SALE_PENDING'],
    ACCEPTED: ['SHIPPED', 'AFTER_SALE_PENDING'],
    SHIPPED: ['COMPLETED', 'AFTER_SALE_PENDING'],
    COMPLETED: ['SETTLED', 'AFTER_SALE_PENDING'],
    SETTLED: ['AFTER_SALE_PENDING'],
    AFTER_SALE_PENDING: ['REFUNDING', 'SHIPPED', 'COMPLETED', 'SETTLED'],
    REFUNDING: ['CLOSED'],
    CLOSED: [], CANCELLED: [],
  };

  /**
   * 主订单状态聚合：禁止直接修改主单状态，由子单状态按规则计算。
   * 规则源自 D3 文档「主订单状态聚合规则表」。
   */
  function aggregateOrderStatus(order) {
    const ss = order.items.map(i => i.status);
    const all = (pred) => ss.length > 0 && ss.every(pred);
    if (all(s => s === 'CLOSED' || s === 'CANCELLED')) return 'CLOSED';
    if (all(s => s === 'CREATED')) return 'CREATED';
    if (all(s => s === 'SETTLED')) return 'SETTLED';
    if (all(s => s === 'SETTLED' || s === 'COMPLETED')) return 'COMPLETED';
    if (all(s => ['SHIPPED', 'COMPLETED', 'SETTLED'].includes(s))) return 'SHIPPED';
    if (ss.some(s => s === 'SHIPPED' || s === 'COMPLETED' || s === 'SETTLED')) return 'PART_SHIPPED';
    if (all(s => ['PAID', 'ACCEPTED'].includes(s))) return 'PAID';
    return order.status; // 无明确规则时保持原值（兼容演示种子）
  }

  // 60/20/10/10 分账规则；末条用最大余额法兜底，保证 Σ = 订单金额
  const SPLIT_RULES = [
    { receiver: 'VA_S1001', role: 'SUPPLIER', bps: 6000, memo: '供货货款 60%' },
    { receiver: 'VA_D2031', role: 'DISTRIBUTOR', bps: 2000, memo: '一级分销佣金 20%' },
    { receiver: 'VA_P0001', role: 'PLATFORM', bps: 1000, memo: '平台服务费 10%' },
    { receiver: 'VA_RESERVE', role: 'RESERVATION', bps: 1000, memo: '逆向售后保证金 10%' },
  ];

  function mkOrder(id, userId, amount, status, payStatus, time, items) {
    return { id, userId, amount, status, payStatus, refundStatus: 'NONE', version: 0, time, items, splits: 0 };
  }
  function mkItem(productId, supplier, amount, status) {
    return { productId, supplier, amount, status };
  }

  /** 生成自洽种子；baseTime 可注入以便推演脚本得到确定性时间。 */
  function createSeedState(baseTime) {
    const now = baseTime == null ? BASE_TIME : baseTime;
    const t = (m) => new Date(now - m * 60000).toISOString().slice(0, 19).replace('T', ' ');

    const orders = [
      mkOrder('DSO20261124000121', 'u_1001', 29900, 'SHIPPED', PAY_SUCCESS, t(180), [
        mkItem('SKU1001', 'S1001 深圳智造', 29900, 'SHIPPED')]),
      mkOrder('DSO20261124000122', 'u_1002', 65800, 'COMPLETED', PAY_SUCCESS, t(120), [
        mkItem('SKU1002', 'S1002 杭州家居', 45900, 'COMPLETED'),
        mkItem('SKU1001', 'S1001 深圳智造', 19900, 'COMPLETED')]),
      mkOrder('DSO20261124000123', 'u_1003', 49750, 'PAID', PAY_SUCCESS, t(60), [
        mkItem('SKU1003', 'S1003 南通纺织', 19900, 'PAID'),
        mkItem('SKU1002', 'S1002 杭州家居', 29850, 'PAID')]),
      mkOrder('DSO20261124000124', 'u_1004', 8900, 'CREATED', 'INIT', t(12), [
        mkItem('SKU1005', 'S1002 杭州家居', 8900, 'CREATED')]),
      mkOrder('DSO20261124000120', 'u_1005', 19900, 'REFUNDING', PAY_SUCCESS, t(300), [
        mkItem('SKU1003', 'S1003 南通纺织', 19900, 'REFUNDING')]),
    ];
    orders[0].splits = 4; orders[1].splits = 4;

    // 已划拨：121(29900) + 122(65800) = 95700，分账明细与流水严格配平
    const splits = [];
    const ledger = [];
    const makeSplitSet = (order, prefix, time) => {
      let allocated = 0;
      SPLIT_RULES.forEach((r, i) => {
        const amt = i === SPLIT_RULES.length - 1 ? order.amount - allocated : Math.round(order.amount * r.bps / 10000);
        allocated += amt;
        const key = `SPLIT_${order.id}_${r.receiver}_0001`;
        splits.push({ id: `${prefix}${i + 1}`, orderId: order.id, receiver: r.receiver, role: r.role,
          amount: amt, status: 'SUCCESS', key, time });
        ledger.push({ id: `LG${prefix.slice(2)}${i + 1}`, biz: order.id, account: r.receiver,
          type: 'SPLIT_ACCOUNT', amount: amt, status: 1, key, time });
      });
      return allocated;
    };
    makeSplitSet(orders[0], 'SP000005', t(100)); // 29900
    makeSplitSet(orders[1], 'SP000009', t(90));  // 65800

    return {
      version: 2,
      seq: { order: 124, product: 12, split: 13, ledger: 30, reconcile: 6, commission: 6, withdraw: 0, log: 30 },
      products: [
        { id: 'SKU1001', name: '无线蓝牙耳机 Pro', supplier: 'S1001 深圳智造', price: 29900, stock: 168, cat: '数码' },
        { id: 'SKU1002', name: '便携咖啡机', supplier: 'S1002 杭州家居', price: 45900, stock: 42, cat: '家电' },
        { id: 'SKU1003', name: '纯棉四件套', supplier: 'S1003 南通纺织', price: 19900, stock: 305, cat: '家居' },
        { id: 'SKU1004', name: '智能体脂秤', supplier: 'S1001 深圳智造', price: 12900, stock: 0, cat: '数码' },
        { id: 'SKU1005', name: '户外保温杯', supplier: 'S1002 杭州家居', price: 8900, stock: 520, cat: '家居' },
      ],
      orders, splits, ledger,
      reconciles: [
        { id: 'RC0001', date: '2026-11-23', layer: '金额层', type: '金额不一致', order: 'DSO20261123000088', diff: 200, status: 'PENDING', risk: 'P0', time: t(1440) },
        { id: 'RC0002', date: '2026-11-23', layer: '订单层', type: '短款', order: 'DSO20261123000091', diff: 12900, status: 'AUTO_FIXED', risk: 'P1', time: t(1440) },
        { id: 'RC0003', date: '2026-11-23', layer: '资金层', type: '状态不一致', order: 'DSO20261123000095', diff: 0, status: 'PENDING', risk: 'P1', time: t(1440) },
        { id: 'RC0004', date: '2026-11-23', layer: '订单层', type: '长款', order: 'DSO20261123000097', diff: 8900, status: 'PENDING', risk: 'P1', time: t(1440) },
      ],
      commissions: [
        { id: 'CM0001', order: 'DSO20261124000122', user: 'u_1002', level: '一级', base: 65800, rate: 0.20, amount: 13160, status: 'PENDING', time: t(120) },
        { id: 'CM0002', order: 'DSO20261124000121', user: 'u_1001', level: '一级', base: 29900, rate: 0.20, amount: 5980, status: 'SETTLED', time: t(180) },
        { id: 'CM0003', order: 'DSO20261123000088', user: 'u_1009', level: '二级', base: 19900, rate: 0.05, amount: 995, status: 'PENDING', time: t(1500) },
      ],
      logs: [
        { id: 1, time: t(60), level: 'INFO', msg: '订单 DSO...123 支付成功，货款进入监管户冻结' },
        { id: 2, time: t(90), level: 'OK', msg: '订单 DSO...122 确认收货 → 分账 4 笔全部到账 [SUCCESS]' },
        { id: 3, time: t(100), level: 'OK', msg: '订单 DSO...121 发货 → 分账 4 笔到账，资金划拨完成' },
        { id: 4, time: t(180), level: 'INFO', msg: '供应商发货，物流单号已回传' },
        { id: 5, time: t(300), level: 'WARN', msg: '订单 DSO...120 发起退款，先冲正后退款' },
      ],
    };
  }

  /** 统一口径：所有指标的唯一计算入口（G1/G2/G3 的根治点）。 */
  function metrics(state) {
    const paidOrders = state.orders.filter(o =>
      o.payStatus === PAY_SUCCESS && o.status !== 'CLOSED' && o.status !== 'CANCELLED');
    const gmv = paidOrders.reduce((a, o) => a + o.amount, 0);
    const allocated = state.ledger
      .filter(l => l.status === 1 && l.type === 'SPLIT_ACCOUNT')
      .reduce((a, l) => a + l.amount, 0);
    const frozen = gmv - allocated;
    return {
      gmv, allocated, frozen,
      paidCount: paidOrders.length,
      orderCount: state.orders.length,
      splitSuccess: state.splits.filter(s => s.status === 'SUCCESS').length,
      splitCount: state.splits.length,
      pendingRecon: state.reconciles.filter(r => r.status === 'PENDING').length,
    };
  }

  /** 守恒断言：gmv === frozen + allocated（差额法下恒成立，同时检查非负数）。 */
  function assertInvariant(state) {
    const m = metrics(state);
    const ok = m.gmv === m.frozen + m.allocated && m.frozen >= 0 && m.allocated >= 0;
    return { ok, gmv: m.gmv, frozen: m.frozen, allocated: m.allocated,
      detail: `GMV(${m.gmv}) = 冻结(${m.frozen}) + 已划拨(${m.allocated})` };
  }

  return { PAY_SUCCESS, BASE_TIME, TRANSITIONS, ITEM_TRANSITIONS, SPLIT_RULES,
    createSeedState, mkOrder, mkItem, metrics, assertInvariant, aggregateOrderStatus };
});
