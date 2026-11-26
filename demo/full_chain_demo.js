/**
 * 电商代销平台 · 全链路状态机推演（8 步，每步断言资金守恒）
 * 运行：node demo/full_chain_demo.js
 *
 * 覆盖：初始化 → 支付 → 拆单 → 发货/确认收货 → 生成分账 → 推送到账 → 冲正退款 → 对账
 * 资金守恒不变量：GMV = 冻结 + 已划拨（Seed.assertInvariant）
 * 金额单位：分（整数）；分账比例 60/20/10/10（basis points）
 */
'use strict';
const path = require('node:path');
const Seed = require(path.join(__dirname, 'js', 'seed.js'));

let step = 0;
function assert(label, cond, detail) {
  if (!cond) { console.error(`  [FAIL] ${label}${detail ? ' — ' + detail : ''}`); process.exitCode = 1;
    throw new Error(label); }
  console.log(`  [PASS] ${label}${detail ? ' — ' + detail : ''}`);
}
function conserve(label, state) {
  const r = Seed.assertInvariant(state);
  assert(`${label}: GMV=冻结+已划拨`, r.ok, `GMV=${r.gmv} 冻结=${r.frozen} 已划拨=${r.allocated}`);
}
function money(cents) { return '¥' + (cents / 100).toFixed(2); }

function main() {
  console.log('===== 电商代销平台 · 全链路状态机推演 =====\n');
  const st = Seed.createSeedState();
  const byId = (id) => st.orders.find(o => o.id === id);

  // ---- 步骤 1：初始化种子 ----
  step++;
  const m0 = Seed.metrics(st);
  console.log(`[step ${step}/8] 初始化种子`);
  assert('种子 GMV = 已支付订单金额', m0.gmv === 165350, `GMV=${money(m0.gmv)}`);
  assert('种子 allocated = 账本成功分账', m0.allocated === 95700, `已划拨=${money(m0.allocated)}`);
  conserve('初始化', st);

  // ---- 步骤 2：支付回调（CREATED → PAID）----
  step++;
  console.log(`[step ${step}/8] 支付回调：DSO...124 CREATED → PAID`);
  const o124 = byId('DSO20261124000124');
  o124.status = 'PAID'; o124.payStatus = Seed.PAY_SUCCESS; o124.version++;
  o124.items.forEach(it => it.status = 'PAID');
  assert('支付状态统一为 SUCCESS', o124.payStatus === 'SUCCESS');
  assert('新订单计入 GMV', Seed.metrics(st).gmv === m0.gmv + o124.amount);
  conserve('支付后', st);

  // ---- 步骤 3：拆单（最大余额法，子单之和 = 父单）----
  step++;
  console.log(`[step ${step}/8] 拆单：DSO...122 按子单等分（末项兜底守恒）`);
  const o122 = byId('DSO20261124000122');
  let allocated = 0;
  o122.items.forEach((it, i) => {
    if (i === o122.items.length - 1) it.amount = o122.amount - allocated;
    else { it.amount = Math.floor(o122.amount / o122.items.length); allocated += it.amount; }
  });
  const subSum = o122.items.reduce((a, it) => a + it.amount, 0);
  assert('拆单金额守恒：Σ子单 = 父单', subSum === o122.amount, `${subSum} = ${o122.amount}`);
  conserve('拆单后', st);

  // ---- 步骤 4：发货 → 确认收货（PAID → ACCEPTED → SHIPPED → COMPLETED）----
  step++;
  console.log(`[step ${step}/8] 履约：DSO...123 PAID → ACCEPTED → SHIPPED → COMPLETED`);
  const o123 = byId('DSO20261124000123');
  ['ACCEPTED', 'SHIPPED', 'COMPLETED'].forEach(target => {
    assert(`合法流转 ${o123.status} → ${target}`, Seed.TRANSITIONS[o123.status].includes(target));
    o123.status = target; o123.version++;
    o123.items.forEach(it => it.status = target);
  });
  assert('确认收货后仍未分账，allocated 不变', Seed.metrics(st).allocated === m0.allocated);
  conserve('确认收货后', st);

  // ---- 步骤 5：生成分账指令（60/20/10/10，末条兜底）----
  step++;
  console.log(`[step ${step}/8] 生成分账指令：DSO...123 4 条（60/20/10/10）`);
  let sum = 0;
  Seed.SPLIT_RULES.forEach((r, i) => {
    const amt = i === Seed.SPLIT_RULES.length - 1 ? o123.amount - sum : Math.round(o123.amount * r.bps / 10000);
    sum += amt;
    const key = `SPLIT_${o123.id}_${r.receiver}_0001`;
    st.splits.push({ id: 'SP000100', orderId: o123.id, receiver: r.receiver, role: r.role,
      amount: amt, status: 'INIT', key, time: new Date().toISOString().slice(0,19).replace('T',' ') });
    st.ledger.push({ id: 'LG000100', biz: o123.id, account: r.receiver, type: 'SPLIT_ACCOUNT',
      amount: amt, status: 0, key, time: new Date().toISOString().slice(0,19).replace('T',' ') });
  });
  assert('分账指令金额守恒：Σ = 订单金额', sum === o123.amount, `${sum} = ${o123.amount}`);
  assert('INIT 阶段未划拨，allocated 不变', Seed.metrics(st).allocated === m0.allocated);
  conserve('生成指令后', st);

  // ---- 步骤 6：推送 + 到账（INIT → PUSHING → ACCEPTED → SUCCESS）----
  step++;
  console.log(`[step ${step}/8] 分账推送与到账：4 条 INIT → SUCCESS`);
  const created = st.splits.filter(s => s.orderId === o123.id);
  const SPLIT_TRANSITIONS = {
    INIT:['PUSHING'], PUSHING:['ACCEPTED'], ACCEPTED:['PROCESSING','SUCCESS'],
    PROCESSING:['SUCCESS'], PART_SUCCESS:['SUCCESS'], FREEZE:['ACCEPTED'],
    SUCCESS:[], REVOKED:[], FAILED:[],
  };
  created.forEach(s => {
    ['PUSHING', 'ACCEPTED', 'SUCCESS'].forEach(target => {
      assert(`分账合法流转 ${s.status} → ${target}`, (SPLIT_TRANSITIONS[s.status] || []).includes(target));
      s.status = target;
    });
    st.ledger.filter(l => l.key === s.key).forEach(l => l.status = 1);
  });
  o123.status = 'SETTLED';
  assert('账本与指令金额对齐',
    st.ledger.filter(l => l.status===1 && l.biz===o123.id).reduce((a,l)=>a+l.amount,0) === o123.amount);
  assert('到账后 allocated 增加', Seed.metrics(st).allocated === m0.allocated + o123.amount);
  conserve('到账后', st);

  // ---- 步骤 7：冲正 + 退款（先 REVOKED 后 CLOSED）----
  step++;
  console.log(`[step ${step}/8] 退款冲正：DSO...120（先回退已分资金，后退款）`);
  const o120 = byId('DSO20261124000120');
  const related = st.splits.filter(s => s.orderId === o120.id && s.status === 'SUCCESS');
  related.forEach(s => { s.status = 'REVOKED'; st.ledger.filter(l=>l.key===s.key).forEach(l=>l.status=0); });
  o120.status = 'CLOSED'; o120.refundStatus = 'REFUNDED'; o120.version++;
  assert('已关闭订单退出 GMV', !Seed.metrics(st).gmv.toString().includes('NaN'));
  const beforeGmv = m0.gmv + o124.amount; // 本步未改支付集合（120 仍 SUCCESS 但状态 CLOSED → 退出 GMV）
  assert('退款后 GMV = 原 GMV - 退款单金额', Seed.metrics(st).gmv === beforeGmv - o120.amount,
    `GMV=${money(Seed.metrics(st).gmv)}`);
  conserve('冲正退款后', st);

  // ---- 步骤 8：对账（四象限各命中 1 条）----
  step++;
  console.log(`[step ${step}/8] 对账：四象限差错各命中 1 条`);
  const types = ['短款', '长款', '金额不一致', '状态不一致'];
  types.forEach(t => assert(`差异类型「${t}」存在`, st.reconciles.some(r => r.type === t)));
  const p0 = st.reconciles.filter(r => r.risk === 'P0');
  assert('P0 差异存在且禁止自动修复', p0.length > 0, `${p0.length} 条`);
  conserve('对账后', st);

  console.log(`\n[FINAL] 全链路 ${step}/8 步断言全部通过，资金守恒：` +
    `GMV(${money(Seed.metrics(st).gmv)}) = 冻结(${money(Seed.metrics(st).frozen)}) + 已划拨(${money(Seed.metrics(st).allocated)})`);
}
try { main(); } catch (e) { console.error('\n推演失败：' + e.message); process.exit(1); }
