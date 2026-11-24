# 电商代销平台 · 交互式演示项目

> 简历展示项目：完整演示「业务流与资金流解耦」的代销中台，含业务中台、资金中台、对账中心、分销佣金，以及**调试控制台**（可强制调整订单/分账状态、注入异常）。

## 项目结构

```
.
├── demo/                     # 前端交互 Demo（纯静态，零依赖，localStorage 持久化）
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── state.js          # 种子数据 + 持久化
│       ├── actions.js        # 核心业务动作（状态机/分账/冲正/退款/对账/佣金）
│       ├── utils.js          # UI 辅助（徽章/模态框/状态机可视化）
│       ├── pages.js          # 页面渲染：总览/商品/订单
│       ├── pages2.js         # 页面渲染：资金/对账/佣金/调试
│       └── app.js            # 应用入口与路由
├── src/
│   ├── index.ts              # Worker 入口：/ → 完整 Demo，/api/* → REST 接口
│   └── assets.ts             # 由 demo/ 打包生成的内嵌静态资源（自动生成，勿手改）
├── scripts/
│   └── bundle-assets.mjs     # 把 demo/ 打包进 src/assets.ts
├── wrangler.toml             # Worker 最小配置（无 account_id）
└── README.md
```

## 一、前端 Demo

### 本地运行

```bash
cd demo
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

### 功能模块（全部可交互）

| 模块 | 功能 |
| --- | --- |
| 总览看板 | GMV、订单数、分账成功率、对账差异、订单状态分布、资金健康、事件日志 |
| 商品与库存 | 商品池、防超卖库存提示、模拟下单（Redis 预扣）、库存同步 |
| 订单中心 | 订单列表、双层状态机流转图、子订单拆单（最大余额法）、模拟支付、退款 |
| 资金中台 | 监管户资金、分账指令状态机、推送/到账/冻结、资金流水账本、提现 |
| 对账中心 | 四层对账、差错四象限、自动修复/人工调账、T+1 对账任务模拟 |
| 分销佣金 | 级差佣金、快照机制、佣金结算、退款负向扣回 |
| **调试控制台** | **强制调整订单状态（可跨态）、设置分账状态、注入 UNKNOWN/超时/库存失败/余额不足、幂等键测试、实时日志** |

### 调试控制台亮点

- **订单状态调试**：选择订单 + 目标状态（10 种），勾选"强制跨态"可跳过流转校验（正常模式受 TRANSITIONS 表约束），每次变更 `version+1` 并写日志。
- **分账状态调试**：可设为 INIT/PUSHING/ACCEPTED/PROCESSING/SUCCESS/PART_SUCCESS/FREEZE/REVOKED/FAILED。
- **异常注入**：UNKNOWN 保持 PUSHING（不臆断终态）、库存扣减失败回滚、退款余额不足冻结提现、重复幂等键拦截。

## 二、Cloudflare Worker API（独立后端演示）

`src/index.ts` 是独立的 Worker REST API，使用**纯内存数据库**（无 KV、无外部绑定），提供：

```
GET  /health                       服务信息
GET  /api/orders                   订单列表
GET  /api/orders/:id               订单详情
POST /api/orders/:id/status        调整订单状态（支持 force:true 强制跨态）
POST /api/orders/:id/pay           模拟支付
POST /api/orders/:id/refund        退款（先冲正后退款）
POST /api/orders/:id/split         生成分账指令（最大余额法）
GET  /api/splits                   分账指令列表
POST /api/splits/:id/push          推送分账
POST /api/splits/:id/settle        确认到账
POST /api/splits/:id/freeze        冻结/解冻
GET  /api/ledger                   资金流水账本
POST /api/idempotent               幂等键生成（唯一性校验）
GET  /api/stats                    统计汇总
```

### 部署（网页端，推荐）—— 访问域名即可使用完整 Demo

本仓库部署后是**一个全栈 Worker**：访问根路径 `https://<你的 Worker 域名>/` 直接看到并使用完整交互式 Demo，`/api/*` 是独立 REST 接口。

1. 将本仓库推送到 GitHub（仓库名：`E-commerce-consignment-platform-demo`）。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Worker** → **Import from Git**。
3. 选择该 GitHub 仓库；Cloudflare 网页会自动识别 `wrangler.toml` 与 `src/index.ts` 入口并完成配置（无需手动填写 account_id 或任何绑定）。
4. 点击 **Deploy**，部署完成后获得 `https://ecommerce-consignment-demo.<你的子域>.workers.dev`。
5. 浏览器打开该域名 —— 即可看到 Apple Liquid Glass 风格的交互式 Demo（宽屏=桌面版，窄屏=触摸版，按分辨率自动切换）。

> **前端资源如何进入 Worker**：`src/assets.ts` 由 `scripts/bundle-assets.mjs` 从 `demo/` 打包生成。若修改了 `demo/` 下的前端文件，重新打包后再部署：
> ```bash
> node scripts/bundle-assets.mjs   # 重新生成 src/assets.ts
> git add -A && git commit -m "update demo" && git push
> ```
> 验证接口：访问 `/health` 返回 `status: UP`；`GET /api/stats` 返回统计汇总。Worker 重启后数据恢复初始种子状态（纯内存），符合演示用途。

## 三、契约依据

本项目实现遵循仓库内文档：
- `电商代销平台_统一契约字典.md`（P0-1~P0-4：状态分层、分账枚举、接口契约、幂等键）
- `电商代销平台_渠道适配器契约测试方案.md` + `contract-tests/`（可运行的契约测试，8/8 通过）
- `电商代销平台_开发实施计划.md`

## 四、演示建议（给老板看的顺序）

1. **总览看板** → 展示 GMV、资金健康、全链路概览。
2. **订单中心** → 打开订单详情，展示状态机流转图、拆单金额守恒。
3. **调试控制台** → 强制把订单从「已付款」跳到「已完成」，再点「生成分账指令」，展示资金流。
4. **资金中台** → 推送分账 → 确认到账 → 演示冻结/冲正。
5. **对账中心** → 运行 T+1 对账，演示 P0 差异禁止自动处理。
6. **分销佣金** → 结算佣金、退款负向扣回。
7. **Worker API** → 访问部署后的 `/api/stats`，展示独立后端也完整可用。
