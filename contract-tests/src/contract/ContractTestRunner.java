package contract;

import java.io.IOException;
import java.net.URI;
import java.net.http.*;
import java.util.*;

/**
 * 渠道适配器契约测试运行器（零外部依赖，可直接 java 运行）。
 * 覆盖：字段映射、金额守恒、幂等键、UNKNOWN 不臆断、明确失败、回调应答语义、状态枚举映射。
 */
public final class ContractTestRunner {
    private static final int PORT = 18081;
    private static int passed = 0, failed = 0;

    private final ChannelAdapter adapter = new ChannelAdapter();
    private final IdempotentKeyGenerator keyGen = new IdempotentKeyGenerator();
    private MockChannelServer server;
    private HttpClient http;

    public static void main(String[] args) throws Exception {
        ContractTestRunner runner = new ContractTestRunner();
        runner.runAll();
        System.out.println("\n===== 契约测试结果: 通过 " + passed + " / 失败 " + failed + " =====");
        if (failed > 0) System.exit(1);
    }

    void runAll() throws Exception {
        server = new MockChannelServer(PORT);
        server.start();
        http = HttpClient.newHttpClient();
        try {
            // ---- 字段映射（P0-3）----
            test("TC-01 平台→渠道字段映射（sub_account_no→receiver_account_no, split_amount→amount）", () -> {
                Map<String, Object> platform = new LinkedHashMap<>();
                platform.put("out_request_no", "SP_DSO123_VA_S1001_0001");
                platform.put("trade_no", "BO2026112400000088991122");
                platform.put("biz_order_no", "DSO20261124000123");
                platform.put("total_split_amount", 19900L);
                platform.put("unsplit_amount", 0L);
                platform.put("receivers", List.of(
                    receiver("VA_S1001", "SUPPLIER", 11940L, "供货货款 60%"),
                    receiver("VA_D2031", "DISTRIBUTOR", 3980L, "一级分销佣金 20%"),
                    receiver("VA_P0001", "PLATFORM", 1990L, "平台服务费 10%"),
                    receiver("VA_RESERVE", "RESERVATION", 1990L, "逆向售后保证金 10%")
                ));
                Map<String, Object> ch = adapter.toChannelSplitRequest(platform);
                eq(19900L, MiniJson.asLong(ch.get("total_amount")), "total_amount 应等于 total_split_amount");
                List<?> detail = MiniJson.getList(ch, "split_detail");
                eq(4, detail.size(), "split_detail 明细数");
                Map<String, Object> first = asMap(detail.get(0));
                eq("VA_S1001", first.get("receiver_account_no"), "sub_account_no 应映射为 receiver_account_no");
                eq(11940L, MiniJson.asLong(first.get("amount")), "split_amount 应映射为 amount");
            });

            // ---- 金额守恒（P1-6 / P0-3）----
            test("TC-02 分账明细金额守恒（各明细之和 + 未分金额 = 交易金额）", () -> {
                long total = 19900L, unsplit = 0L;
                long sum = 11940L + 3980L + 1990L + 1990L;
                eq(total, sum + unsplit, "分账明细之和 + unsplit_amount 必须等于交易金额");
                // Money 值对象校验
                eq(Money.ofCents(19900), Money.ofCents(11940).add(Money.ofCents(3980))
                        .add(Money.ofCents(1990)).add(Money.ofCents(1990)), "Money 金额守恒");
                eq(Money.ofCents(12800), Money.ofYuan("128.00"), "元转分精度（128.00 元 = 12800 分）");
            });

            // ---- 幂等键（P0-4）----
            test("TC-03 幂等键格式与生成责任归一（资金中台统一生成）", () -> {
                String key = keyGen.generate("SPLIT", "DSO20261124000123_VA_S1001", 1);
                eq("SPLIT_DSO20261124000123_VA_S1001_0001", key, "幂等键格式");
                ok(keyGen.isSameRequest(key, key), "原号重发应判定为同一笔请求");
                boolean dup = false;
                try { keyGen.generate("SPLIT", "DSO20261124000123_VA_S1001", 1); }
                catch (IllegalStateException e) { dup = true; }
                ok(dup, "重复生成同一幂等键应被拒绝（对应 DB 唯一索引）");
            });

            // ---- 渠道响应反向映射（P0-2）----
            test("TC-04 渠道响应→平台状态枚举映射（ACCEPTED/ALL_SUCCESS/PARTIAL）", () -> {
                Map<String, Object> chResp = new LinkedHashMap<>();
                chResp.put("code", "10000");
                chResp.put("msg", "Success");
                chResp.put("data", Map.of("out_request_no", "SP_X", "split_batch_no", "SB_X",
                        "instruction_status", "ACCEPTED", "accept_time", "2026-11-24 10:35:01"));
                Map<String, Object> p = adapter.fromChannelSplitResponse(chResp);
                Map<String, Object> data = asMap(p.get("data"));
                eq("ACCEPTED", data.get("status"), "渠道 ACCEPTED → 平台 ACCEPTED");
                eq("SB_X", data.get("instruction_id"), "split_batch_no → instruction_id");
            });

            // ---- 端到端调用（P0-3 域名配置化，走本地桩）----
            test("TC-05 分账下发端到端：平台请求经适配器→Mock渠道→反向映射", () -> {
                Map<String, Object> platform = new LinkedHashMap<>();
                String key = keyGen.generate("SPLIT", "DSO_E2E_VA_S1001", 1);
                platform.put("out_request_no", key);
                platform.put("trade_no", "BO_E2E");
                platform.put("biz_order_no", "DSO_E2E");
                platform.put("total_split_amount", 19900L);
                platform.put("unsplit_amount", 0L);
                platform.put("receivers", List.of(receiver("VA_S1001", "SUPPLIER", 19900L, "全款")));
                Map<String, Object> chReq = adapter.toChannelSplitRequest(platform);
                String respBody = post("/v1/split/execute", MiniJson.toJson(chReq));
                Map<String, Object> chResp = MiniJson.parseObject(respBody);
                eq("10000", chResp.get("code"), "渠道受理成功");
                Map<String, Object> mapped = adapter.fromChannelSplitResponse(chResp);
                eq("ACCEPTED", asMap(mapped.get("data")).get("status"), "端到端状态映射为 ACCEPTED");
            });

            // ---- UNKNOWN 不臆断（P0-2 / 规范 6.3）----
            test("TC-06 UNKNOWN 不臆断为失败（保持未决，须原号重发+查询兜底）", () -> {
                try {
                    server.forceUnknown(true);
                    Map<String, Object> chResp = MiniJson.parseObject(post("/v1/split/execute",
                            MiniJson.toJson(Map.of("out_request_no", "SP_UNKNOWN_1"))));
                    eq("20000", chResp.get("code"), "渠道返回系统繁忙 UNKNOWN");
                    Map<String, Object> mapped = adapter.fromChannelSplitResponse(chResp);
                    eq("PUSHING", asMap(mapped.get("data")).get("status"), "UNKNOWN 映射为在途 PUSHING，不臆断为 FAILED/SUCCESS");
                } finally {
                    server.forceUnknown(false);
                }
            });

            // ---- 明确失败（规范 6.2）----
            test("TC-07 明确业务失败映射为 FAILED（可转 INIT 重试）", () -> {
                try {
                    server.forceResponseCode("40004");
                    Map<String, Object> chResp = MiniJson.parseObject(post("/v1/split/execute",
                            MiniJson.toJson(Map.of("out_request_no", "SP_FAIL_1"))));
                    Map<String, Object> mapped = adapter.fromChannelSplitResponse(chResp);
                    eq("FAILED", asMap(mapped.get("data")).get("status"), "明确拒绝 → FAILED");
                } finally {
                    server.forceResponseCode(null);
                }
            });

            // ---- 幂等端到端（规范 5.3：重复通知返回同一结果，不重复入账）----
            test("TC-08 重复下发同一 out_request_no，渠道返回相同受理号（幂等）", () -> {
                String key = "SP_IDEM_E2E_0001";
                String r1 = post("/v1/split/execute", MiniJson.toJson(Map.of("out_request_no", key)));
                String r2 = post("/v1/split/execute", MiniJson.toJson(Map.of("out_request_no", key)));
                eq(MiniJson.asString(MiniJson.getMap(MiniJson.parseObject(r1), "data").get("split_batch_no")),
                   MiniJson.asString(MiniJson.getMap(MiniJson.parseObject(r2), "data").get("split_batch_no")),
                   "同一幂等键两次调用应返回相同 split_batch_no");
            });
        } finally {
            server.stop();
        }
    }

    // ---------- 工具 ----------
    private Map<String, Object> receiver(String acct, String role, long amount, String memo) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("sub_account_no", acct);
        r.put("receiver_role", role);
        r.put("split_amount", amount);
        r.put("memo", memo);
        return r;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object o) { return (Map<String, Object>) o; }

    private String post(String path, String body) throws IOException, InterruptedException {
        HttpRequest req = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + PORT + path))
                .header("Content-Type", "application/json;charset=UTF-8")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build();
        return http.send(req, HttpResponse.BodyHandlers.ofString()).body();
    }

    private interface Check { void run() throws Exception; }

    private static void test(String name, Check check) {
        try {
            check.run();
            passed++;
            System.out.println("  [PASS] " + name);
        } catch (Throwable t) {
            failed++;
            System.out.println("  [FAIL] " + name + " -> " + t);
        }
    }

    private static void ok(boolean cond, String msg) {
        if (!cond) throw new AssertionError(msg);
    }
    private static void eq(Object expected, Object actual, String msg) {
        if (!Objects.equals(expected, actual))
            throw new AssertionError(msg + " (期望=" + expected + ", 实际=" + actual + ")");
    }
}
