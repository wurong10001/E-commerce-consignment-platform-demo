-- 级差佣金 SQL（SQLite 方言）
-- 卖单 100.00 元 = 10000 分；规则 一级20%(2000bps) 二级15%(1500bps) 三级10%(1000bps)
-- 级差：本级得 (本级比例 - 下级比例)；三级(最低层)得全额本级比例
-- 期望：三级 1000 分、二级 500 分、一级 500 分，合计 2000 分 = ¥20.00
-- 取整余差用「最大余额法」分配：按 raw%10000 降序、层级升序逐级补 1 分，保证 Σ = 顶层比例

WITH sale AS (
  SELECT 10000 AS amount_cents, 'D3' AS seller
),
tiers AS (
  SELECT r.level, r.rate_bps,
         (r.rate_bps - COALESCE(
           (SELECT r2.rate_bps FROM commission_rule r2 WHERE r2.level = r.level + 1), 0)) AS diff_bps
  FROM commission_rule r
  WHERE r.level IN (SELECT level FROM distributor_relation WHERE seller_id = (SELECT seller FROM sale))
),
base AS (
  SELECT t.level, t.diff_bps,
         CAST(t.diff_bps * (SELECT amount_cents FROM sale) / 10000 AS INTEGER) AS amount_cents,
         (t.diff_bps * (SELECT amount_cents FROM sale)) % 10000 AS remainder
  FROM tiers t
),
goal AS (
  SELECT CAST((SELECT amount_cents FROM sale) * (SELECT MAX(rate_bps) FROM tiers) / 10000 AS INTEGER)
         - (SELECT SUM(amount_cents) FROM base) AS left_cents
),
ranked AS (
  SELECT level, diff_bps, amount_cents, remainder,
         ROW_NUMBER() OVER (ORDER BY remainder DESC, level ASC) AS rn
  FROM base
),
bonus(rn, remaining) AS (
  SELECT 0, (SELECT left_cents FROM goal)
  UNION ALL
  SELECT r.rn, b.remaining - 1
  FROM bonus b JOIN ranked r ON r.rn = b.rn + 1
  WHERE b.remaining > 0
)
SELECT r.level, r.diff_bps,
       r.amount_cents + (SELECT COUNT(*) FROM bonus b WHERE b.rn = r.rn AND b.rn > 0) AS amount_cents
FROM ranked r
ORDER BY r.level;
