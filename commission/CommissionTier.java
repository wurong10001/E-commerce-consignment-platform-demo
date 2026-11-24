/**
 * 电商代销平台 · 分销佣金级差算法（可运行，无第三方依赖）
 * 运行： javac CommissionTier.java && java CommissionTier
 *
 * 金额单位：分（整数）；费率单位：basis points（2000 = 20%）
 * 级差：本级得 (本级比例 − 下级比例)；最低层得全额本级比例
 * 期望（100 元 / 20-15-10）：一级 500 分、二级 500 分、三级 1000 分，合计 2000 分
 * 与 reconciliation/03_commission_tier.sql 输出严格一致。
 */
import java.util.ArrayList;
import java.util.List;

public final class CommissionTier {
    public record CommissionLine(int level, int diffBps, int amountCents) {}

    /**
     * @param saleAmountCents 卖单金额（分）
     * @param ratesBps        各层级比例（basis points），index 0 = 一级，依次到最低层
     */
    public static List<CommissionLine> calculate(long saleAmountCents, int[] ratesBps) {
        if (ratesBps == null || ratesBps.length == 0) throw new IllegalArgumentException("层级比例不能为空");
        List<CommissionLine> lines = new ArrayList<>();
        for (int i = 0; i < ratesBps.length; i++) {
            int childRate = (i + 1 < ratesBps.length) ? ratesBps[i + 1] : 0;
            int diff = ratesBps[i] - childRate;
            // 整数除法，杜绝浮点尾差；本例均可整除
            long amount = saleAmountCents * diff / 10000;
            lines.add(new CommissionLine(i + 1, diff, (int) amount));
        }
        return lines;
    }

    public static void main(String[] args) {
        long saleAmount = 10000;             // 100.00 元 = 10000 分
        int[] rates = {2000, 1500, 1000};    // 20% / 15% / 10%
        List<CommissionLine> lines = calculate(saleAmount, rates);
        String[] names = {"一", "二", "三", "四", "五"};

        long total = 0;
        for (CommissionLine l : lines) {
            total += l.amountCents();
            System.out.printf("level=%d  diffBps=%d  amountCents=%d  (¥%.2f)%n",
                    l.level(), l.diffBps(), l.amountCents(), l.amountCents() / 100.0);
        }
        System.out.printf("TOTAL amountCents=%d (¥%.2f)%n", total, total / 100.0);

        long expected = saleAmount * rates[0] / 10000;
        boolean ok = total == expected;
        System.out.println(ok ? "[PASS] 级差合计 = 卖单金额 × 一级比例" : "[FAIL] 级差不守恒");
        if (!ok) System.exit(1);
    }
}
