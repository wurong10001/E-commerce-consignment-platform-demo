-- 差错四象限比对 SQL（SQLite 方言）
-- build_and_run.py 按 -- @Q1..@Q4 标记切分逐条执行，每象限应命中 1 条。

-- @Q1 短款：渠道成功但本地不存在或支付状态非成功（资损风险）
SELECT c.channel_order_no, c.amount AS channel_amount, c.pay_time, o.order_id, o.pay_status
FROM reconciliation_channel_bill c
LEFT JOIN oms_order o ON c.channel_order_no = o.channel_order_no
WHERE c.status = 'SUCCESS'
  AND (o.order_id IS NULL OR o.pay_status NOT IN (2, 4));  -- 4=REFUND 归 Q4 状态不一致，保证互斥

-- @Q2 长款：本地已支付但渠道无记录或渠道失败（疑似掉单/虚假订单）
SELECT o.order_id, o.pay_amount, o.create_time, c.status AS channel_status
FROM oms_order o
LEFT JOIN reconciliation_channel_bill c ON o.channel_order_no = c.channel_order_no
WHERE o.pay_status = 2
  AND (c.channel_order_no IS NULL OR c.status != 'SUCCESS');

-- @Q3 金额不一致（P0 高危）：两边都有但金额不符，严禁自动处理
SELECT o.order_id, o.pay_amount AS local_amount, c.amount AS channel_amount,
       (o.pay_amount - c.amount) AS diff_amount
FROM oms_order o
JOIN reconciliation_channel_bill c ON o.channel_order_no = c.channel_order_no
WHERE o.pay_status = 2 AND c.status = 'SUCCESS'
  AND o.pay_amount != c.amount;

-- @Q4 状态不一致：两边都有记录但状态映射不符（本地与渠道非对应态）
-- 限定 c.status='SUCCESS' 且本地非 SUCCESS，避免与 Q1/Q2 重复命中
SELECT o.order_id, o.pay_status, c.status AS channel_status
FROM oms_order o
JOIN reconciliation_channel_bill c ON o.channel_order_no = c.channel_order_no
WHERE c.status = 'SUCCESS'
  AND o.pay_status != 2
  AND o.pay_status != 0;   -- INIT 属于 Q1，排除以保证互斥
