/**
 * 电商代销平台 · Cloudflare Worker（单工作者全栈演示）
 * ------------------------------------------------------------------
 * 访问域名根路径 → 完整交互式 Demo（Apple Liquid Glass 视觉，桌面/触摸双布局）
 * /api/* → 独立 REST 演示接口（纯内存数据库，无 KV / 无外部依赖）
 *
 * 静态资源来自 src/assets.ts，由 scripts/bundle-assets.mjs 从 demo/ 打包生成。
 * 修改前端后请先运行：node scripts/bundle-assets.mjs，再部署 Worker。
 *
 * 契约依据：《统一契约字典》P0-1~P0-4：
 *   - 订单三维状态 order_status / pay_status / refund_status 独立
 *   - 分账状态字符串枚举 INIT/PUSHING/ACCEPTED/PROCESSING/SUCCESS/...
 *   - 幂等键由平台统一生成 {PREFIX}_{bizKey}_{seq}
 *   - 金额一律用「分」（整数）
 */

import { assets } from './assets';

/* ==================== 类型 ==================== */
type OrderStatus =
  | 'CREATED' | 'PAID' | 'ACCEPTED' | 'SHIPPED' | 'COMPLETED'
  | 'SETTLED' | 'AFTER_SALE_PENDING' | 'REFUNDING' | 'CLOSED' | 'CANCELLED';
type PayStatus = 'INIT' | 'PAYING' | 'SUCCESS' | 'CLOSED' | 'REFUND';
type SplitStatus =
  | 'INIT' | 'PUSHING' | 'ACCEPTED' | 'PROCESSING'
  | 'SUCCESS' | 'PART_SUCCESS' | 'FREEZE' | 'REVOKED' | 'FAILED';

interface Order {
  id: string; userId: string; amount: number;
  orderStatus: OrderStatus; payStatus: PayStatus; refundStatus: string;
  version: number; createdAt: string;
}
interface Split {
  id: string; orderId: string; receiver: string; amount: number;
  status: SplitStatus; idempotentKey: string; createdAt: string;
}
interface Ledger {
  id: string; bizOrderId: string; account: string; type: string;
  amount: number; status: number; idempotentKey: string; createdAt: string;
}

/* ==================== 内存数据库 ==================== */
let orders: Order[] = [
  mkOrder('DSO20261124000121', 'u_1001', 29900, 'SHIPPED', 'SUCCESS'),
  mkOrder('DSO20261124000122', 'u_1002', 65800, 'COMPLETED', 'SUCCESS'),
  mkOrder('DSO20261124000123', 'u_1003', 49750, 'PAID', 'SUCCESS'),
  mkOrder('DSO20261124000124', 'u_1004', 8900, 'CREATED', 'INIT'),
  mkOrder('DSO20261124000120', 'u_1005', 19900, 'REFUNDING', 'SUCCESS'),
];
let splits: Split[] = [
  mkSplit('SP000005', 'DSO20261124000122', 'VA_S1002', 39560, 'SUCCESS'),
  mkSplit('SP000006', 'DSO20261124000122', 'VA_D2031', 13160, 'SUCCESS'),
  mkSplit('SP000007', 'DSO20261124000121', 'VA_S1001', 17940, 'ACCEPTED'),
];
let ledger: Ledger[] = splits.map(s => ({
  id: 'LG' + s.id.slice(2), bizOrderId: s.orderId, account: s.receiver,
  type: 'SPLIT_ACCOUNT', amount: s.amount, status: s.status === 'SUCCESS' ? 1 : 0,
  idempotentKey: s.idempotentKey, createdAt: s.createdAt,
}));
let seq = 7;
const idempotencyRegistry = new Set<string>();

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ['PAID', 'CANCELLED'],
  PAID: ['ACCEPTED', 'AFTER_SALE_PENDING', 'CANCELLED'],
  ACCEPTED: ['SHIPPED', 'AFTER_SALE_PENDING'],
  SHIPPED: ['COMPLETED', 'AFTER_SALE_PENDING'],
  COMPLETED: ['SETTLED', 'AFTER_SALE_PENDING'],
  SETTLED: ['AFTER_SALE_PENDING'],
  AFTER_SALE_PENDING: ['REFUNDING', 'SHIPPED', 'COMPLETED', 'SETTLED'],
  REFUNDING: ['CLOSED', 'COMPLETED', 'SETTLED'],
  CLOSED: [], CANCELLED: [],
};
const VALID_SPLIT: SplitStatus[] = [
  'INIT','PUSHING','ACCEPTED','PROCESSING','SUCCESS','PART_SUCCESS','FREEZE','REVOKED','FAILED'
];

function mkOrder(id: string, userId: string, amount: number, st: OrderStatus, ps: PayStatus): Order {
  return { id, userId, amount, orderStatus: st, payStatus: ps, refundStatus: 'NONE',
    version: 0, createdAt: new Date().toISOString() };
}
function mkSplit(id: string, orderId: string, receiver: string, amount: number, status: SplitStatus): Split {
  return { id, orderId, receiver, amount, status,
    idempotentKey: `SPLIT_${orderId}_${receiver}_0001`, createdAt: new Date().toISOString() };
}
function now(): string { return new Date().toISOString(); }
function money(cents: number): string { return '¥' + (cents / 100).toFixed(2); }

/* ==================== 响应工具 ==================== */
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json;charset=UTF-8', 'Access-Control-Allow-Origin': '*' },
  });
}
function ok(data: unknown, message = 'success') { return json({ code: '10000', msg: message, data }); }
function fail(message: string, code = '40004', status = 400) { return json({ code, msg: message }, status); }

/* ==================== 路由 ==================== */
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      } });
    }
    // ---- 静态资源：访问域名即看到完整交互式 Demo ----
    const assetPath = path === '/index.html' ? '/' : path;
    const asset = assets[assetPath];
    if (asset) {
      return new Response(asset.body, {
        headers: {
          'Content-Type': asset.contentType,
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (path === '/health') {
      return ok({ service: 'dsx-worker', version: '1.0.0', status: 'UP',
        demo: 'GET / → 完整交互式 Demo（Apple Liquid Glass）',
        api: [
          'GET /api/orders', 'GET /api/orders/:id', 'POST /api/orders/:id/status',
          'POST /api/orders/:id/pay', 'POST /api/orders/:id/refund',
          'POST /api/orders/:id/split', 'GET /api/splits', 'POST /api/splits/:id/push',
          'POST /api/splits/:id/settle', 'POST /api/splits/:id/freeze',
          'GET /api/ledger', 'GET /api/stats',
        ] });
    }

    try {
      // ---- 订单列表 / 详情 ----
      if (path === '/api/orders' && method === 'GET') return ok(orders);
      const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
      if (orderMatch) {
        const o = orders.find(x => x.id === orderMatch[1]);
        if (!o) return fail('订单不存在', '40004', 404);
        if (method === 'GET') return ok(o);
      }

      // ---- 订单状态流转（调试核心：可强制跨态）----
      const statusMatch = path.match(/^\/api\/orders\/([^/]+)\/status$/);
      if (statusMatch && method === 'POST') {
        const o = orders.find(x => x.id === statusMatch[1]);
        if (!o) return fail('订单不存在', '40004', 404);
        const body = await request.json() as { status: OrderStatus; force?: boolean };
        if (!TRANSITIONS[o.orderStatus]?.length && body.status !== o.orderStatus) {
          // 终态允许强制
        }
        const legal = TRANSITIONS[o.orderStatus]?.includes(body.status);
        if (!legal && !body.force)
          return fail(`非法流转 ${o.orderStatus} → ${body.status}（可传 force:true 强制）`);
        const prev = o.orderStatus;
        o.orderStatus = body.status; o.version++;
        if (body.status === 'PAID') o.payStatus = 'SUCCESS';
        if (body.status === 'CANCELLED') o.payStatus = 'CLOSED';
        if (body.status === 'REFUNDING') o.refundStatus = 'REFUNDING';
        if (body.status === 'CLOSED') o.refundStatus = 'REFUNDED';
        return ok({ ...o, prevStatus: prev, forced: !!body.force }, `${prev} → ${body.status}`);
      }

      // ---- 模拟支付 ----
      const payMatch = path.match(/^\/api\/orders\/([^/]+)\/pay$/);
      if (payMatch && method === 'POST') {
        const o = orders.find(x => x.id === payMatch[1]);
        if (!o) return fail('订单不存在', '40004', 404);
        if (o.orderStatus !== 'CREATED') return fail('仅待付款订单可支付');
        o.orderStatus = 'PAID'; o.payStatus = 'SUCCESS'; o.version++;
        return ok(o, '支付成功，货款进入监管户冻结');
      }

      // ---- 退款（先冲正后退款）----
      const refundMatch = path.match(/^\/api\/orders\/([^/]+)\/refund$/);
      if (refundMatch && method === 'POST') {
        const o = orders.find(x => x.id === refundMatch[1]);
        if (!o) return fail('订单不存在', '40004', 404);
        const revoked = splits.filter(s => s.orderId === o.id &&
          ['SUCCESS','ACCEPTED','PROCESSING','PART_SUCCESS'].includes(s.status));
        revoked.forEach(s => { s.status = 'REVOKED'; });
        o.orderStatus = 'CLOSED'; o.refundStatus = 'REFUNDED'; o.version++;
        return ok({ order: o, revokedCount: revoked.length },
          revoked.length ? `已冲正 ${revoked.length} 笔分账，再退款给买家` : '未分账订单直接退款');
      }

      // ---- 生成分账指令 ----
      const splitGenMatch = path.match(/^\/api\/orders\/([^/]+)\/split$/);
      if (splitGenMatch && method === 'POST') {
        const o = orders.find(x => x.id === splitGenMatch[1]);
        if (!o) return fail('订单不存在', '40004', 404);
        if (!['COMPLETED','SETTLED'].includes(o.orderStatus)) return fail('仅已完成订单可触发分账');
        const rules = [
          ['VA_S1001','SUPPLIER',0.60], ['VA_D2031','DISTRIBUTOR',0.20],
          ['VA_P0001','PLATFORM',0.10], ['VA_RESERVE','RESERVATION',0.10],
        ] as const;
        let allocated = 0;
        const created: Split[] = [];
        rules.forEach(([receiver, _role, rate], i) => {
          const amt = i === rules.length - 1 ? o.amount - allocated : Math.round(o.amount * rate);
          allocated += amt;
          const s = mkSplit('SP' + String(++seq).padStart(6,'0'), o.id, receiver, amt, 'INIT');
          splits.unshift(s); created.push(s);
          ledger.unshift({ id: 'LG' + s.id.slice(2), bizOrderId: o.id, account: receiver,
            type: 'SPLIT_ACCOUNT', amount: amt, status: 0, idempotentKey: s.idempotentKey, createdAt: now() });
        });
        return ok({ instructions: created, total: allocated }, `生成 ${created.length} 条分账指令，合计 ${money(allocated)}`);
      }

      // ---- 分账列表 / 操作 ----
      if (path === '/api/splits' && method === 'GET') return ok(splits);
      const splitMatch = path.match(/^\/api\/splits\/([^/]+)\/(push|settle|freeze)$/);
      if (splitMatch && method === 'POST') {
        const s = splits.find(x => x.id === splitMatch[1]);
        if (!s) return fail('分账指令不存在', '40004', 404);
        const action = splitMatch[2];
        if (action === 'push') {
          if (s.status !== 'INIT') return fail('仅 INIT 状态可推送');
          s.status = 'PUSHING';
          const l = ledger.find(x => x.idempotentKey === s.idempotentKey); if (l) l.status = 1;
          return ok(s, '已推送渠道 [PUSHING]');
        }
        if (action === 'settle') {
          if (!['ACCEPTED','PROCESSING'].includes(s.status)) return fail('当前状态不可确认到账：' + s.status);
          s.status = 'SUCCESS';
          const o = orders.find(x => x.id === s.orderId);
          if (o && splits.filter(x => x.orderId === o.id).every(x => x.status === 'SUCCESS')) {
            o.orderStatus = 'SETTLED'; o.version++;
          }
          return ok(s, '分账到账 [SUCCESS]');
        }
        if (action === 'freeze') {
          s.status = s.status === 'FREEZE' ? 'ACCEPTED' : 'FREEZE';
          return ok(s, s.status === 'FREEZE' ? '争议冻结 [FREEZE]' : '已解冻 [ACCEPTED]');
        }
      }

      // ---- 资金流水 ----
      if (path === '/api/ledger' && method === 'GET') return ok(ledger);

      // ---- 幂等键生成（资金中台统一）----
      if (path === '/api/idempotent' && method === 'POST') {
        const body = await request.json() as { prefix: string; bizKey: string; seq?: number };
        const key = `${body.prefix}_${body.bizKey}_${String(body.seq ?? 1).padStart(4,'0')}`;
        if (idempotencyRegistry.has(key)) return fail('幂等键重复（数据库唯一索引冲突）', 'DUPLICATE_REQUEST');
        idempotencyRegistry.add(key);
        return ok({ idempotentKey: key });
      }

      // ---- 统计 ----
      if (path === '/api/stats' && method === 'GET') {
        const paid = orders.filter(o => o.payStatus === 'SUCCESS');
        const splitSuccess = splits.filter(s => s.status === 'SUCCESS');
        return ok({
          gmv: paid.reduce((a, o) => a + o.amount, 0), gmvLabel: money(paid.reduce((a, o) => a + o.amount, 0)),
          orderCount: orders.length, paidCount: paid.length,
          splitCount: splits.length, splitSuccessCount: splitSuccess.length,
          splitSuccessRate: splits.length ? Math.round(splitSuccess.length / splits.length * 100) + '%' : '0%',
          ledgerCount: ledger.length,
        });
      }

      return fail('接口不存在：' + path, '404', 404);
    } catch (e) {
      return fail('服务器错误：' + (e as Error).message, '500', 500);
    }
  },
};
