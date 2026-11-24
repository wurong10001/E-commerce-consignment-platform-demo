package contract;

import java.util.*;

/**
 * 渠道适配器（契约字典 P0-3）：把平台统一 REST 契约映射为渠道实际字段。
 * 平台统一字段以 D6 为基线：receivers / sub_account_no / total_split_amount。
 * 渠道字段以 D5 报文样例为参照：split_detail / receiver_account_no / total_amount。
 */
public final class ChannelAdapter {

    /** 平台统一分账请求 → 渠道分账请求（字段映射）。 */
    public Map<String, Object> toChannelSplitRequest(Map<String, Object> platformRequest) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("out_request_no", platformRequest.get("out_request_no"));
        out.put("trade_no", platformRequest.get("trade_no"));
        out.put("biz_order_no", platformRequest.get("biz_order_no"));
        // 平台 total_split_amount → 渠道 total_amount
        out.put("total_amount", platformRequest.get("total_split_amount"));
        out.put("unsplit_amount", platformRequest.getOrDefault("unsplit_amount", 0L));

        List<?> receivers = MiniJson.getList(platformRequest, "receivers");
        List<Object> splitDetail = new ArrayList<>();
        if (receivers != null) {
            for (Object o : receivers) {
                Map<String, Object> r = asMap(o);
                Map<String, Object> detail = new LinkedHashMap<>();
                // sub_account_no → receiver_account_no
                detail.put("receiver_account_no", r.get("sub_account_no"));
                detail.put("receiver_role", r.get("receiver_role"));
                // split_amount → amount
                detail.put("amount", r.get("split_amount"));
                detail.put("memo", r.get("memo"));
                splitDetail.add(detail);
            }
        }
        // receivers → split_detail
        out.put("split_detail", splitDetail);
        return out;
    }

    /** 渠道响应 → 平台统一响应（反向映射）。 */
    public Map<String, Object> fromChannelSplitResponse(Map<String, Object> channelResponse) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("code", channelResponse.get("code"));
        out.put("msg", channelResponse.get("msg"));
        Map<String, Object> platformData = new LinkedHashMap<>();
        Object data = channelResponse.get("data");
        if (data instanceof Map) {
            Map<String, Object> d = asMap(data);
            platformData.put("out_request_no", d.get("out_request_no"));
            platformData.put("instruction_id", d.get("split_batch_no"));
            platformData.put("status", mapChannelStatus(d.get("instruction_status")));
            platformData.put("accept_time", d.get("accept_time"));
        } else {
            // 错误响应无 data：依据 code 判定，UNKNOWN(2xx) 不臆断为终态（契约字典 P0-2 / 规范 6.3）
            String code = String.valueOf(channelResponse.get("code"));
            if (code.startsWith("4")) platformData.put("status", "FAILED");   // 明确业务失败
            else if (code.startsWith("2")) platformData.put("status", "PUSHING"); // 系统繁忙 UNKNOWN → 在途
            else platformData.put("status", "PUSHING");
        }
        out.put("data", platformData);
        return out;
    }

    /** 渠道状态 → 平台分账状态枚举（契约字典 P0-2）。 */
    private String mapChannelStatus(Object channelStatus) {
        if (channelStatus == null) return "INIT";
        return switch (String.valueOf(channelStatus)) {
            case "ACCEPTED" -> "ACCEPTED";
            case "SUCCESS", "ALL_SUCCESS" -> "SUCCESS";
            case "PARTIAL" -> "PART_SUCCESS";
            case "FAILED", "REJECTED" -> "FAILED";
            default -> "PUSHING";
        };
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object o) {
        if (o instanceof Map) return (Map<String, Object>) o;
        throw new IllegalArgumentException("期望 Map，实际: " + o.getClass());
    }
}
