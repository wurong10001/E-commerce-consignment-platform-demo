package contract;

import java.math.BigDecimal;

/**
 * 金额值对象：内部一律以「分」（long 整数）表示，杜绝浮点尾差（契约字典 P1-6）。
 */
public record Money(long cents) {
    public static Money ofCents(long cents) { return new Money(cents); }

    /** 元转分，使用 BigDecimal 避免 double 精度问题。 */
    public static Money ofYuan(String yuan) {
        return new Money(new BigDecimal(yuan).movePointRight(2).longValueExact());
    }

    public Money add(Money other) { return new Money(this.cents + other.cents); }
    public Money subtract(Money other) { return new Money(this.cents - other.cents); }

    @Override public String toString() { return cents + "分"; }
}
