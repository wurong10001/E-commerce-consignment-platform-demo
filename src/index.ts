/**
 * 电商代销平台 · Cloudflare Worker（单工作者全栈演示）
 * ------------------------------------------------------------------
 * 访问域名根路径 → 完整交互式 Demo（Apple Liquid Glass 视觉，桌面/触摸双布局）
 * /api/* → 独立 REST 演示接口（纯内存数据库，无 KV / 无外部依赖）
 *
 * 静态资源来自 src/assets.ts，由 scripts/bundle-assets.mjs 从 demo/ 打包生成。
 * 修改前端后请先运行：node scripts/bundle-assets.mjs，再部署 Worker。
 *
 * 可选环境配置（不入库，通过 Dashboard / wrangler secret 设置）：
 *   DEMO_API_TOKEN  配置后，所有 /api/* 写操作需 Authorization: Bearer <token>
 *   ALLOWED_ORIGIN  逗号分隔的 CORS 白名单，未配置则不允许跨域（同源演示无需 CORS）
 *
 * 契约依据：《统一契约字典》P0-1~P0-4：
 *   - 订单三维状态 order_status / pay_status / refund_status 独立
 *   - 分账状态字符串枚举 INIT/PUSHING/ACCEPTED/PROCESSING/SUCCESS/...
 *   - 幂等键由平台统一生成 {PREFIX}_{bizKey}_{seq}，并做唯一性注册
 *   - 金额一律用「分」（整数）
 */

import { assets } from './assets';

/* ==================== 类型 ==================== */
interface Env {
  DEMO_API_TOKEN?: string;
  ALLOWED_ORIGIN?: string;
}
type OrderStatus =
  | 'CREATED' | 'PAID' | 'ACCEPTED' | 'SHIPPED' | 'PART_SHIPPED' | 'COMPLETED'
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
  status: SplitStatus; idempotentKey: string; version: number; createdAt: string;
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
// 与 demo/js/seed.js 同源：60/20/10/10 最大余额法，末条兜底，Σ = 订单金额
const SPLIT_RULES = [
  ['VA_S1001', 6000], ['VA_D2031', 2000], ['VA_P0001', 1000], ['VA_RESERVE', 1000],
] as const;
function buildSeedSplits(): Split[] {
  const out: Split[] = [];
  let n = 0;
  for (const order of orders.filter(o => o.id === 'DSO20261124000121' || o.id === 'DSO20261124000122')) {
    let allocated = 0;
    SPLIT_RULES.forEach(([receiver, bps], i) => {
      const amount = i === SPLIT_RULES.length - 1 ? order.amount - allocated : Math.round(order.amount * bps / 10000);
      allocated += amount;
      out.push(mkSplit('SP' + String(++n).padStart(6, '0'), order.id, receiver, amount, 'SUCCESS', n));
    });
  }
  return out;
}
let splits: Split[] = buildSeedSplits();
let ledger: Ledger[] = splits.map(s => ({
  id: 'LG' + s.id.slice(2), bizOrderId: s.orderId, account: s.receiver,
  type: 'SPLIT_ACCOUNT', amount: s.amount, status: 1,
  idempotentKey: s.idempotentKey, createdAt: s.createdAt,
}));
// 从已有指令推导，避免与种子 SP000001~SP000008 冲突
let seq = splits.reduce((max, s) => Math.max(max, Number(s.id.slice(2)) || 0), 0);
const idempotencyRegistry = new Set<string>(splits.map(s => s.idempotentKey));

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
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
const VALID_ORDER_STATUSES = Object.keys(TRANSITIONS) as OrderStatus[];

function mkOrder(id: string, userId: string, amount: number, st: OrderStatus, ps: PayStatus): Order {
  return { id, userId, amount, orderStatus: st, payStatus: ps, refundStatus: 'NONE',
    version: 0, createdAt: new Date().toISOString() };
}
function mkSplit(id: string, orderId: string, receiver: string, amount: number,
  status: SplitStatus, keySeq: number): Split {
  return { id, orderId, receiver, amount, status,
    idempotentKey: `SPLIT_${orderId}_${receiver}_${String(keySeq).padStart(4, '0')}`,
    version: 0, createdAt: new Date().toISOString() };
}
function now(): string { return new Date().toISOString(); }
function money(cents: number): string { return '¥' + (cents / 100).toFixed(2); }

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; " +
    "object-src 'none'; base-uri 'none'",
};

/* 每 IP 轻量限流（演示级，隔离回收即重置） */
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 60;
const rateBuckets = new Map<string, { start: number; count: number }>();
function rateLimited(key: string): boolean {
  const t = Date.now();
  const b = rateBuckets.get(key);
  if (!b || t - b.start > RATE_WINDOW_MS) {
    rateBuckets.set(key, { start: t, count: 1 });
    return false;
  }
  b.count++;
  return b.count > RATE_LIMIT;
}

/* ==================== 路由 ==================== */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
    const cors: Record<string, string> = origin && allowed.includes(origin) ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      Vary: 'Origin',
    } : {};

    const json = (data: unknown, status = 200): Response => new Response(
      JSON.stringify(data, null, 2),
      { status, headers: { 'Content-Type': 'application/json;charset=UTF-8', ...SECURITY_HEADERS, ...cors } });
    const ok = (data: unknown, message = 'success') =>
      json({ code: '10000', msg: message, data });
    const fail = (message: string, code = '40004', status = 400) =>
      json({ code, msg: message }, status);
    const readBody = async <T,>(): Promise<T | Response> => {
      try { return await request.json() as T; }
      catch { return fail('请求体不是合法 JSON', '400', 400); }
    };
    const versionConflict = (expected: number, actual: unknown): Response | null =>
      actual === expected ? null : fail(`版本冲突：期望 version=${expected}`, '409', 409);

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204,
        headers: { ...cors, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization', Vary: 'Origin' } });
    }

    // ---- 静态资源：访问域名即看到完整交互式 Demo ----
    const assetPath = path === '/index.html' ? '/' : path;
    const asset = assets[assetPath];
    if (asset) {
      return new Response(asset.body, {
        headers: { 'Content-Type': asset.contentType, 'Cache-Control': 'no-cache',
          ...SECURITY_HEADERS, ...cors },
      });
    }

    if (path === '/health') {
      return ok({ service: 'dsx-worker', version: '1.1.0', status: 'UP',
        auth: env.DEMO_API_TOKEN ? 'Bearer token required for POST /api/*' : 'optional',
        demo: 'GET / → 完整交互式 Demo（Apple Liquid Glass）',
        api: [
          'GET /api/orders', 'GET /api/orders/:id', 'POST /api/orders/:id/status',
          'POST /api/orders/:id/pay', 'POST /api/orders/:id/refund',
          'POST /api/orders/:id/split', 'GET /api/splits', 'POST /api/splits/:id/push',
          'POST /api/splits/:id/accept', 'POST /api/splits/:id/settle',
          'POST /api/splits/:id/freeze', 'GET /api/ledger',
          'POST /api/idempotent', 'GET /api/stats',
        ] });
    }

    // ---- 写接口鉴权与限流（可选 token；未配置时保持演示开箱即用）----
    if (path.startsWith('/api/') && method === 'POST') {
      if (env.DEMO_API_TOKEN && request.headers.get('Authorization') !== `Bearer ${env.DEMO_API_TOKEN}`)
        return fail('未授权：缺少有效的 Bearer Token', '401', 401);
      if (rateLimited(request.headers.get('CF-Connecting-IP') || 'unknown'))
        return fail('请求过于频繁，请稍后重试', '429', 429);
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

      // ---- 订单状态流转（调试核心：force 仅允许合法状态白名单）----
      const statusMatch = path.match(/^\/api\/orders\/([^/]+)\/status$/);
      if (statusMatch && method === 'POST') {
        const o = orders.find(x => x.id === statusMatch[1]);
        if (!o) return fail('订单不存在', '40004', 404);
        const body = await readBody<{ status: OrderStatus; force?: boolean; version?: number }>();
        if (body instanceof Response) return body;
        if (!VALID_ORDER_STATUSES.includes(body.status)) return fail('非法订单状态：' + body.status);
        const conflict = versionConflict(o.version, body.version);
        if (conflict) return conflict;
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
        const body = await readBody<{ version?: number }>();
        if (body instanceof Response) return body;
        const conflict = versionConflict(o.version, body.version);
        if (conflict) return conflict;
        if (o.orderStatus !== 'CREATED') return fail('仅待付款订单可支付');
        o.orderStatus = 'PAID'; o.payStatus = 'SUCCESS'; o.version++;
        return ok(o, '支付成功，货款进入监管户冻结');
      }

      // ---- 退款（先冲正后退款；账本同步回退）----
      const refundMatch = path.match(/^\/api\/orders\/([^/]+)\/refund$/);
      if (refundMatch && method === 'POST') {
        const o = orders.find(x => x.id === refundMatch[1]);
        if (!o) return fail('订单不存在', '40004', 404);
        const body = await readBody<{ version?: number }>();
        if (body instanceof Response) return body;
        const conflict = versionConflict(o.version, body.version);
        if (conflict) return conflict;
        if (o.orderStatus === 'CLOSED' || o.payStatus !== 'SUCCESS') return fail('当前订单不可退款');
        const revoked = splits.filter(s => s.orderId === o.id &&
          ['SUCCESS','ACCEPTED','PROCESSING','PART_SUCCESS'].includes(s.status));
        revoked.forEach(s => {
          s.status = 'REVOKED'; s.version++;
          const l = ledger.find(x => x.idempotentKey === s.idempotentKey);
          if (l) l.status = 0; // 冲正同步回退资金账本，避免 allocated 虚高
        });
        o.orderStatus = 'CLOSED'; o.refundStatus = 'REFUNDED'; o.version++;
        return ok({ order: o, revokedCount: revoked.length },
          revoked.length ? `已冲正 ${revoked.length} 笔分账，再退款给买家` : '未分账订单直接退款');
      }

      // ---- 生成分账指令 ----
      const splitGenMatch = path.match(/^\/api\/orders\/([^/]+)\/split$/);
      if (splitGenMatch && method === 'POST') {
        const o = orders.find(x => x.id === splitGenMatch[1]);
        if (!o) return fail('订单不存在', '40004', 404);
        const body = await readBody<{ version?: number }>();
        if (body instanceof Response) return body;
        const conflict = versionConflict(o.version, body.version);
        if (conflict) return conflict;
        if (!['COMPLETED','SETTLED'].includes(o.orderStatus)) return fail('仅已完成订单可触发分账');
        if (splits.some(s => s.orderId === o.id && !['REVOKED','FAILED'].includes(s.status)))
          return fail('已存在进行中的分账指令，禁止重复生成');
        let allocated = 0;
        const created: Split[] = [];
        for (let i = 0; i < SPLIT_RULES.length; i++) {
          const [receiver, bps] = SPLIT_RULES[i];
          const amt = i === SPLIT_RULES.length - 1 ? o.amount - allocated : Math.round(o.amount * bps / 10000);
          allocated += amt;
          const keySeq = ++seq;
          const s = mkSplit('SP' + String(keySeq).padStart(6, '0'), o.id, receiver, amt, 'INIT', keySeq);
          if (idempotencyRegistry.has(s.idempotentKey)) return fail('幂等键冲突', 'DUPLICATE_REQUEST', 409);
          idempotencyRegistry.add(s.idempotentKey);
          splits.unshift(s); created.push(s);
          ledger.unshift({ id: 'LG' + s.id.slice(2), bizOrderId: o.id, account: receiver,
            type: 'SPLIT_ACCOUNT', amount: amt, status: 0, idempotentKey: s.idempotentKey, createdAt: now() });
        }
        return ok({ instructions: created, total: allocated }, `生成 ${created.length} 条分账指令，合计 ${money(allocated)}`);
      }

      // ---- 分账列表 / 操作（push → accept → settle 完整链路）----
      if (path === '/api/splits' && method === 'GET') return ok(splits);
      const splitMatch = path.match(/^\/api\/splits\/([^/]+)\/(push|accept|settle|freeze)$/);
      if (splitMatch && method === 'POST') {
        const s = splits.find(x => x.id === splitMatch[1]);
        if (!s) return fail('分账指令不存在', '40004', 404);
        const body = await readBody<{ version?: number }>();
        if (body instanceof Response) return body;
        const conflict = versionConflict(s.version, body.version);
        if (conflict) return conflict;
        const action = splitMatch[2];
        if (action === 'push') {
          if (s.status !== 'INIT') return fail('仅 INIT 状态可推送');
          s.status = 'PUSHING'; s.version++;
          return ok(s, '已推送渠道 [PUSHING]');
        }
        if (action === 'accept') {
          if (s.status !== 'PUSHING' && s.status !== 'PROCESSING') return fail('当前状态不可受理：' + s.status);
          s.status = 'ACCEPTED'; s.version++;
          const l = ledger.find(x => x.idempotentKey === s.idempotentKey);
          if (l) l.status = 1; // 渠道受理时才计入 allocated
          return ok(s, '渠道已受理 [ACCEPTED]');
        }
        if (action === 'settle') {
          if (!['ACCEPTED','PROCESSING'].includes(s.status)) return fail('当前状态不可确认到账：' + s.status);
          s.status = 'SUCCESS'; s.version++;
          const o = orders.find(x => x.id === s.orderId);
          if (o && splits.filter(x => x.orderId === o.id).every(x => x.status === 'SUCCESS')) {
            o.orderStatus = 'SETTLED'; o.version++;
          }
          return ok(s, '分账到账 [SUCCESS]');
        }
        if (action === 'freeze') {
          if (!['ACCEPTED','PROCESSING','PART_SUCCESS','FREEZE'].includes(s.status))
            return fail('当前状态不可冻结/解冻：' + s.status);
          s.status = s.status === 'FREEZE' ? 'ACCEPTED' : 'FREEZE'; s.version++;
          return ok(s, s.status === 'FREEZE' ? '争议冻结 [FREEZE]' : '已解冻 [ACCEPTED]');
        }
      }

      // ---- 资金流水 ----
      if (path === '/api/ledger' && method === 'GET') return ok(ledger);

      // ---- 幂等键生成（资金中台统一）----
      if (path === '/api/idempotent' && method === 'POST') {
        const body = await readBody<{ prefix: string; bizKey: string; seq?: number }>();
        if (body instanceof Response) return body;
        if (typeof body.prefix !== 'string' || !body.prefix ||
            typeof body.bizKey !== 'string' || !body.bizKey ||
            (body.seq !== undefined && (!Number.isInteger(body.seq) || body.seq < 1)))
          return fail('prefix/bizKey 必填，seq 需为正整数');
        const key = `${body.prefix}_${body.bizKey}_${String(body.seq ?? 1).padStart(4,'0')}`;
        if (idempotencyRegistry.has(key)) return fail('幂等键重复（数据库唯一索引冲突）', 'DUPLICATE_REQUEST', 409);
        idempotencyRegistry.add(key);
        return ok({ idempotentKey: key });
      }

      // ---- 统计 ----
      if (path === '/api/stats' && method === 'GET') {
        // 口径与 demo/js/seed.js 的 metrics() 一致：gmv = frozen + allocated
        const paid = orders.filter(o => o.payStatus === 'SUCCESS' && o.orderStatus !== 'CLOSED' && o.orderStatus !== 'CANCELLED');
        const gmv = paid.reduce((a, o) => a + o.amount, 0);
        const allocated = ledger.filter(l => l.status === 1 && l.type === 'SPLIT_ACCOUNT')
          .reduce((a, l) => a + l.amount, 0);
        const frozen = gmv - allocated;
        const splitSuccess = splits.filter(s => s.status === 'SUCCESS');
        return ok({
          gmv, gmvLabel: money(gmv), allocated, frozen,
          invariant: gmv === frozen + allocated && frozen >= 0 && allocated >= 0,
          orderCount: orders.length, paidCount: paid.length,
          splitCount: splits.length, splitSuccessCount: splitSuccess.length,
          splitSuccessRate: splits.length ? Math.round(splitSuccess.length / splits.length * 100) + '%' : '0%',
          ledgerCount: ledger.length,
        });
      }

      return fail('接口不存在：' + path, '404', 404);
    } catch (e) {
      console.error('Worker 处理异常', e);
      return fail('服务器错误', '500', 500);
    }
  },
};
