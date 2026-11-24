-- 电商代销平台 · 对账与佣金演示库（SQLite 方言）
-- 金额一律整数「分」；pay_status: 0=INIT, 2=SUCCESS, 4=REFUND
-- 四象限各命中 1 条 + 1 条正常对照；级差规则 20/15/10（basis points）

CREATE TABLE oms_order (
  order_id TEXT PRIMARY KEY,
  channel_order_no TEXT UNIQUE NOT NULL,
  pay_amount INTEGER NOT NULL,
  pay_status INTEGER NOT NULL,
  create_time TEXT NOT NULL
);

CREATE TABLE reconciliation_channel_bill (
  channel_order_no TEXT PRIMARY KEY,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  pay_time TEXT NOT NULL
);

CREATE TABLE commission_rule (
  level INTEGER PRIMARY KEY,
  rate_bps INTEGER NOT NULL   -- basis points: 2000=20%
);

CREATE TABLE distributor_relation (
  seller_id TEXT NOT NULL,
  ancestor_id TEXT NOT NULL,
  level INTEGER NOT NULL,    -- 1=一级(20%), 2=二级(15%), 3=三级(10%)
  PRIMARY KEY (seller_id, level)
);

-- 四象限样例
-- Q1 短款：渠道有 SUCCESS，本地 pay_status=0（未支付/漏单）
INSERT INTO oms_order VALUES ('O_SHORT','C_SHORT',1000,0,'2026-11-23 10:00:00');
INSERT INTO reconciliation_channel_bill VALUES ('C_SHORT',1000,'SUCCESS','2026-11-23 10:01:00');

-- Q2 长款：本地已支付，渠道无记录
INSERT INTO oms_order VALUES ('O_LONG','C_LONG',2000,2,'2026-11-23 10:05:00');

-- Q3 金额不一致（P0 高危）：两边都有但金额差 -200 分
INSERT INTO oms_order VALUES ('O_AMT','C_AMT',3000,2,'2026-11-23 10:10:00');
INSERT INTO reconciliation_channel_bill VALUES ('C_AMT',3200,'SUCCESS','2026-11-23 10:11:00');

-- Q4 状态不一致：两边都有但状态映射不符（本地 REFUND / 渠道 SUCCESS）
INSERT INTO oms_order VALUES ('O_STATE','C_STATE',4000,4,'2026-11-23 10:15:00');
INSERT INTO reconciliation_channel_bill VALUES ('C_STATE',4000,'SUCCESS','2026-11-23 10:16:00');

-- 正常对照：不命中任何象限
INSERT INTO oms_order VALUES ('O_OK','C_OK',5000,2,'2026-11-23 10:20:00');
INSERT INTO reconciliation_channel_bill VALUES ('C_OK',5000,'SUCCESS','2026-11-23 10:21:00');

-- 级差佣金规则与三级关系链（seller=D3 卖单；D2=二级、D1=一级）
INSERT INTO commission_rule VALUES (1,2000),(2,1500),(3,1000);
INSERT INTO distributor_relation VALUES ('D3','D1',1),('D3','D2',2),('D3','D3',3);
