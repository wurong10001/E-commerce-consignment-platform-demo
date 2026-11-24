### 一、 财务对账：四层核对与 SQL 比对逻辑

对账的核心不是简单的“找不同”，而是**逐层下钻与差错分类**。针对代销模式，我们采用“订单-数量-金额-资金”四层核对法，并配合 SQL 实现自动化比对。

#### 1.1 对账数据源与标准化

由于渠道（微信/支付宝/银行）账单格式各异，必须先进行**数据清洗与标准化**，统一存入 `reconciliation_channel_bill`（渠道账单表）和 `reconciliation_local_bill`（本地账单表）。

- **金额处理**：所有金额字段在数据库中必须使用 `DECIMAL(12,2)` 或转为整数（分）存储，严禁使用 `FLOAT/DOUBLE`，避免精度丢失。
- **唯一键**：以 `channel_order_no`（渠道订单号）作为核心关联键。

#### 1.2 核心 SQL 比对逻辑（差错四象限）

**场景一：短款（渠道有，系统无）**
*风险*：用户已付款，但平台未收到回调或入库失败，属于资损风险。

```sql
-- 找出渠道成功但本地不存在或状态非成功的订单
SELECT 
    c.channel_order_no, 
    c.amount AS channel_amount, 
    c.pay_time
FROM 
    reconciliation_channel_bill c
LEFT JOIN 
    oms_order o ON c.channel_order_no = o.channel_order_no
WHERE 
    c.status = 'SUCCESS' 
    AND (o.order_id IS NULL OR o.pay_status != 2); -- pay_status=2(SUCCESS)为已支付,不可用order_status判断
```

*处理策略*：系统自动触发“补单”流程（幂等校验后插入订单），若无法补单则转人工。

**场景二：长款（系统有，渠道无）**
*风险*：系统显示已支付，但渠道实际未扣款，可能是虚假订单或掉单。

```sql
-- 找出本地已支付但渠道无记录（或渠道失败）的订单
SELECT 
    o.order_id, 
    o.pay_amount, 
    o.create_time
FROM 
    oms_order o
LEFT JOIN 
    reconciliation_channel_bill c ON o.channel_order_no = c.channel_order_no
WHERE 
    o.pay_status = 2 -- 支付成功(SUCCESS)
    AND (c.channel_order_no IS NULL OR c.status != 'SUCCESS');
```

*处理策略*：系统自动调用渠道“查单接口”二次确认。若确认未支付，自动冲正订单状态为“失败”。

**场景三：金额不一致（高危）**
*风险*：两边都有记录，但金额不符，可能涉及优惠分摊错误或篡改。

```sql
-- 找出金额不匹配的订单
SELECT 
    o.order_id, 
    o.pay_amount AS local_amount, 
    c.amount AS channel_amount,
    (o.pay_amount - c.amount) AS diff_amount
FROM 
    oms_order o
JOIN 
    reconciliation_channel_bill c ON o.channel_order_no = c.channel_order_no
WHERE 
    o.pay_status = 2 -- 支付成功(SUCCESS)
    AND c.status = 'SUCCESS'
    AND o.pay_amount != c.amount;
```

*处理策略*：**严禁自动处理**，直接生成 P0 级告警，冻结该订单后续结算，转人工财务介入。

**场景四：状态不一致**
*风险*：如本地“退款中”但渠道“已退款”，导致状态机卡死。

```sql
-- 找出状态映射不一致的记录（pay_status 与渠道状态比对，映射表见《统一契约字典》第六章）
SELECT 
    o.order_id, 
    o.pay_status, 
    c.status AS channel_status
FROM 
    oms_order o
JOIN 
    reconciliation_channel_bill c ON o.channel_order_no = c.channel_order_no
WHERE 
    NOT (
        (o.pay_status = 2 AND c.status = 'SUCCESS') OR
        (o.pay_status = 4 AND c.status = 'REFUND') OR
        (o.pay_status = 0 AND c.status = 'INIT')
    );
```

#### 1.3 性能优化：分片与内存比对

对于千万级数据，直接 SQL JOIN 性能极差。生产环境采用 **“分片下载 + 内存 Hash 比对”** ：

1. **分片**：按 `order_id` 取模或时间范围，将任务拆分为 100 个子任务（XXL-Job 调度）。
2. **内存比对**：将本地数据加载至 Redis 或本地 Map（Key=订单号，Value=金额+状态），流式读取渠道文件逐条比对，避免数据库压力。

---

### 二、 分销佣金：复杂规则引擎设计

代销平台的佣金计算涉及**多级分佣、级差计算、阶梯返利**等复杂逻辑，且规则常随营销活动动态变化。硬编码是灾难，必须引入**规则引擎**。

#### 2.1 技术选型：Drools + 策略模式

- **Drools 规则引擎**：用于处理动态变化的佣金比例、条件判断（如“VIP用户额外奖励”）。
- **策略模式**：封装不同的计算算法（如“级差算法”、“平级算法”）。

#### 2.2 核心佣金模型设计

**1. 级差佣金（最常用）**
*逻辑*：上级赚取的是“自身比例”与“下级比例”的差额，而非全额。

- *示例*：一级比例 20%，二级 15%，三级 10%。
- *计算*：三级卖单 100 元 -> 三级拿 10 元；二级拿 (15%-10%)=5 元；一级拿 (20%-15%)=5 元。
- *SQL 实现（基于闭包表）*：
- *Java 计算逻辑*：遍历结果，`current_rate - child_rate` 即为当前层级应得比例。

**2. 阶梯返利（月度结算）**
*逻辑*：根据月度总销量触发额外奖励。

- *规则配置*：`[{min: 100, max: 500, bonus: 500}, {min: 501, max: 1000, bonus: 3000}]`
- *实现*：每月 1 日跑批任务，统计上月 `SUM(order_amount)`，匹配规则表生成返利单。

#### 2.3 规则引擎落地（Drools 示例）

将易变的规则抽取为 `.drl` 文件，支持热部署。

```java
// 规则文件：commission_rules.drl
package com.platform.commission;

import com.platform.model.OrderContext;
import com.platform.model.CommissionResult;

rule "VIP用户额外奖励"
    when
        $ctx : OrderContext( userLevel == "VIP", amount > 1000 )
    then
        // 在基础佣金上额外增加 2%
        $ctx.setExtraRate(0.02);
end

rule "大促期间佣金翻倍"
    when
        $ctx : OrderContext( isPromotion == true, categoryId == 1001 )
    then
        $ctx.setBaseRate($ctx.getBaseRate() * 2);
end
```

#### 2.4 佣金计算时序与防错

1. **预计算（下单时）**：实时计算预估佣金，写入 `oms_order_commission` 表，状态为 `PENDING`（待结算）。此时仅做展示，不扣款。
2. **实结算（确认收货后）**：订单状态变为 `COMPLETED` 后，触发规则引擎正式计算。
    - **幂等性**：以 `order_id` 为键，防止重复生成佣金单。
    - **回溯机制**：若发生退款，需追溯该订单关联的所有佣金记录。若已结算，生成“负向佣金单”从分销商余额中扣回（支持余额不足挂账）。

#### 2.5 复杂场景处理：代理升级与规则变更

- **问题**：代理升级了，之前卖的单按新比例算还是旧比例算？
- **方案**：**快照机制**。在订单生成时，将当时的佣金比例、规则版本存入订单扩展字段（JSON）。结算时严格读取快照，不受后续规则变更影响。

---

### 三、 总结与交付建议

至此，电商代销平台的六大核心文档已全部完成：

1. **PRD 产品需求文档**（业务蓝图）
2. **技术架构与数据库设计**（系统骨架）
3. **接口对接与异常处理规范**（交互契约）
4. **报文样例与状态机时序**（开发细节）
5. **核心状态机可视化与并发调度**（逻辑闭环）
6. **财务对账与佣金规则引擎**（资金核心）

**落地建议**：

- **对账系统**：建议独立部署，不要与业务库强耦合，使用只读从库进行数据抽取。
- **佣金引擎**：初期可简化规则，先跑通“级差+固定比例”，后续通过 Drools 逐步接入复杂营销规则，避免过度设计。

这套文档体系已具备直接指导中大型研发团队进行系统建设的深度与广度。

