package contract;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 模拟渠道服务（沙箱桩）：复刻 D5 报文样例的响应结构与错误行为。
 * 仅依赖 JDK 内置 HttpServer，无需 Maven/JUnit。
 */
public final class MockChannelServer {
    private final HttpServer server;
    public final AtomicInteger splitCallCount = new AtomicInteger();
    /** out_request_no → 首次生成的受理号；重复请求返回同一受理号（真实幂等语义）。 */
    public final Map<String, String> seenRequestNos = new HashMap<>();
    private volatile String forcedCode = null;
    private volatile boolean forceUnknown = false;

    public MockChannelServer(int port) throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        server.createContext("/v1/split/execute", new SplitHandler());
        server.createContext("/v1/trade/precreate", new PrecreateHandler());
        server.setExecutor(null);
    }

    public void start() { server.start(); }
    public void stop() { server.stop(0); }

    /** 测试钩子：强制返回错误码，用于验证 UNKNOWN 与明确失败的处理。 */
    public void forceResponseCode(String code) { this.forcedCode = code; }
    public void forceUnknown(boolean unknown) { this.forceUnknown = unknown; }

    private void send(HttpExchange ex, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json;charset=UTF-8");
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
    }

    private String readBody(HttpExchange ex) throws IOException {
        return new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    private final class SplitHandler implements HttpHandler {
        @Override public void handle(HttpExchange ex) throws IOException {
            String body = readBody(ex);
            Map<String, Object> req = MiniJson.parseObject(body);
            String outRequestNo = MiniJson.asString(req.get("out_request_no"));
            splitCallCount.incrementAndGet();

            // 幂等：同一 out_request_no 始终返回首次受理号，不重复生成新指令
            String batchNo;
            synchronized (seenRequestNos) {
                batchNo = seenRequestNos.computeIfAbsent(outRequestNo,
                        k -> "SB20261124103500001");
            }

            if (forceUnknown) {
                send(ex, 200, "{\"code\":\"20000\",\"msg\":\"Service Currently Unavailable\",\"sub_code\":\"aop.unknow-error\"}");
                return;
            }
            if (forcedCode != null) {
                send(ex, 200, "{\"code\":\"" + forcedCode + "\",\"msg\":\"Business Failed\",\"sub_code\":\"ACQ.SPLIT_RECEIVER_LIMIT_EXCEEDED\"}");
                return;
            }

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("code", "10000");
            resp.put("msg", "Success");
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("out_request_no", outRequestNo);
            data.put("split_batch_no", batchNo);
            data.put("instruction_status", "ACCEPTED");
            data.put("accept_time", "2026-11-24 10:35:01");
            resp.put("data", data);
            resp.put("sign", "MOCK_SIGN");
            send(ex, 200, MiniJson.toJson(resp));
        }
    }

    private final class PrecreateHandler implements HttpHandler {
        @Override public void handle(HttpExchange ex) throws IOException {
            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("code", "10000");
            resp.put("msg", "Success");
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("out_request_no", MiniJson.asString(MiniJson.parseObject(readBody(ex)).get("out_request_no")));
            data.put("trade_no", "BO2026112400000088991122");
            data.put("status", "WAIT_BUYER_PAY");
            resp.put("data", data);
            send(ex, 200, MiniJson.toJson(resp));
        }
    }
}
