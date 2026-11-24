package contract;

import java.util.HashMap;
import java.util.Map;

/**
 * 幂等键生成器（契约字典 P0-4）：资金中台统一生成，格式 {PREFIX}_{bizKey}_{seq}。
 * 包含进程内去重校验，数据库唯一索引为最终兜底。
 */
public final class IdempotentKeyGenerator {
    private final Map<String, String> registry = new HashMap<>();

    /**
     * @param prefix 业务前缀 PAY/SPLIT/RB/RF/WD
     * @param bizKey 业务标识（订单号+接收方等）
     * @param seq    同一业务键下的顺序号（从 1 开始）
     */
    public String generate(String prefix, String bizKey, int seq) {
        String key = prefix + "_" + bizKey + "_" + String.format("%04d", seq);
        String prev = registry.putIfAbsent(key, key);
        if (prev != null) throw new IllegalStateException("幂等键重复: " + key);
        return key;
    }

    /** 重试必须携带原键：重复注册同一键应判定为同一笔，不报错。 */
    public boolean isSameRequest(String first, String retry) {
        return first.equals(retry);
    }
}
