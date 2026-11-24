-- 级差佣金 SQL（SQLite 方言）
-- 卖单 100.00 元 = 10000 分；规则 一级20%(2000bps) 二级15%(1500bps) 三级10%(1000bps)
-- 级差：本级得 (本级比例 - 下级比例)；三级(最低层)得全额本级比例
-- 期望：三级 1000 分、二级 500 分、一级 500 分，合计 2000 分 = ¥20.00

WITH sale AS (
  SELECT 10000 AS amount_cents, 'D3' AS seller
),
tiers AS (
  SELECT r.level, r.rate_bps,
         COALESCE((SELECT r2.rate_bps FROM commission_rule r2 WHERE r2.level = r.level + 1), 0) AS child_bps
  FROM commission_rule r
)
SELECT
  t.level,
  (t.rate_bps - t.child_bps) AS diff_bps,
  CAST(s.amount_cents * (t.rate_bps - t.child_bps) / 10000 AS INTEGER) AS amount_cents
FROM tiers t, sale s
WHERE t.level IN (SELECT level FROM distributor_relation WHERE seller_id = s.seller)
ORDER BY t.level;
