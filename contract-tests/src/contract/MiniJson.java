package contract;

import java.util.*;

/**
 * 零依赖的极简 JSON 解析器/序列化器（仅用于契约测试示例，阶段 1 应替换为 Jackson）。
 * 支持对象、数组、字符串、整数(Long)、小数(Double)、布尔、null。
 */
public final class MiniJson {
    private MiniJson() {}

    // ---------- 序列化 ----------
    @SuppressWarnings("unchecked")
    public static String toJson(Object value) {
        StringBuilder sb = new StringBuilder();
        write(value, sb);
        return sb.toString();
    }

    private static void write(Object v, StringBuilder sb) {
        if (v == null) { sb.append("null"); return; }
        if (v instanceof String) { quote((String) v, sb); return; }
        if (v instanceof Boolean || v instanceof Integer || v instanceof Long || v instanceof Double) {
            sb.append(v); return;
        }
        if (v instanceof Map) {
            sb.append('{');
            boolean first = true;
            for (Map.Entry<Object, Object> e : ((Map<Object, Object>) v).entrySet()) {
                if (!first) sb.append(',');
                first = false;
                quote(String.valueOf(e.getKey()), sb);
                sb.append(':');
                write(e.getValue(), sb);
            }
            sb.append('}'); return;
        }
        if (v instanceof Collection) {
            sb.append('[');
            boolean first = true;
            for (Object o : (Collection<?>) v) {
                if (!first) sb.append(',');
                first = false;
                write(o, sb);
            }
            sb.append(']'); return;
        }
        throw new IllegalArgumentException("不支持的 JSON 类型: " + v.getClass());
    }

    private static void quote(String s, StringBuilder sb) {
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> sb.append(c);
            }
        }
        sb.append('"');
    }

    // ---------- 解析 ----------
    public static Object parse(String text) {
        Parser p = new Parser(text);
        Object result = p.parseValue();
        p.skipWhitespace();
        if (p.pos != p.text.length()) throw new IllegalArgumentException("JSON 尾部有多余内容: " + p.text.substring(p.pos));
        return result;
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> parseObject(String text) {
        Object o = parse(text);
        if (!(o instanceof Map)) throw new IllegalArgumentException("期望 JSON 对象");
        return (Map<String, Object>) o;
    }

    private static final class Parser {
        final String text;
        int pos = 0;
        Parser(String text) { this.text = text; }

        void skipWhitespace() {
            while (pos < text.length() && Character.isWhitespace(text.charAt(pos))) pos++;
        }

        Object parseValue() {
            skipWhitespace();
            if (pos >= text.length()) throw new IllegalArgumentException("JSON 意外结束");
            char c = text.charAt(pos);
            return switch (c) {
                case '{' -> parseObject();
                case '[' -> parseArray();
                case '"' -> parseString();
                case 't' -> parseLiteral("true", Boolean.TRUE);
                case 'f' -> parseLiteral("false", Boolean.FALSE);
                case 'n' -> parseLiteral("null", null);
                default -> parseNumber();
            };
        }

        Object parseLiteral(String lit, Object value) {
            if (!text.startsWith(lit, pos)) throw new IllegalArgumentException("非法字面量 @" + pos);
            pos += lit.length();
            return value;
        }

        Map<String, Object> parseObject() {
            pos++; // {
            Map<String, Object> map = new LinkedHashMap<>();
            skipWhitespace();
            if (pos < text.length() && text.charAt(pos) == '}') { pos++; return map; }
            while (true) {
                skipWhitespace();
                String key = parseString();
                skipWhitespace();
                if (text.charAt(pos++) != ':') throw new IllegalArgumentException("期望 ':' @" + pos);
                Object val = parseValue();
                map.put(key, val);
                skipWhitespace();
                char sep = text.charAt(pos++);
                if (sep == '}') break;
                if (sep != ',') throw new IllegalArgumentException("期望 ',' 或 '}' @" + pos);
            }
            return map;
        }

        List<Object> parseArray() {
            pos++; // [
            List<Object> list = new ArrayList<>();
            skipWhitespace();
            if (pos < text.length() && text.charAt(pos) == ']') { pos++; return list; }
            while (true) {
                list.add(parseValue());
                skipWhitespace();
                char sep = text.charAt(pos++);
                if (sep == ']') break;
                if (sep != ',') throw new IllegalArgumentException("期望 ',' 或 ']' @" + pos);
            }
            return list;
        }

        String parseString() {
            if (text.charAt(pos++) != '"') throw new IllegalArgumentException("期望字符串 @" + pos);
            StringBuilder sb = new StringBuilder();
            while (pos < text.length()) {
                char c = text.charAt(pos++);
                if (c == '"') return sb.toString();
                if (c == '\\') {
                    if (pos >= text.length()) break;
                    char e = text.charAt(pos++);
                    switch (e) {
                        case '"' -> sb.append('"');
                        case '\\' -> sb.append('\\');
                        case 'n' -> sb.append('\n');
                        case 'r' -> sb.append('\r');
                        case 't' -> sb.append('\t');
                        default -> sb.append(e);
                    }
                } else sb.append(c);
            }
            throw new IllegalArgumentException("字符串未闭合");
        }

        Object parseNumber() {
            int start = pos;
            while (pos < text.length() && (Character.isDigit(text.charAt(pos)) || text.charAt(pos) == '-' || text.charAt(pos) == '.')) pos++;
            String num = text.substring(start, pos);
            if (num.isEmpty()) throw new IllegalArgumentException("非法数字 @" + pos);
            if (num.contains(".")) return Double.parseDouble(num);
            return Long.parseLong(num);
        }
    }

    // ---------- 便捷读取 ----------
    public static Object get(Map<String, Object> m, String key) { return m.get(key); }
    @SuppressWarnings("unchecked")
    public static List<Object> getList(Map<String, Object> m, String key) { return (List<Object>) m.get(key); }
    @SuppressWarnings("unchecked")
    public static Map<String, Object> getMap(Map<String, Object> m, String key) { return (Map<String, Object>) m.get(key); }
    public static long asLong(Object o) {
        if (o instanceof Number n) return n.longValue();
        if (o instanceof String s) return Long.parseLong(s);
        throw new IllegalArgumentException("非数字: " + o);
    }
    public static String asString(Object o) { return String.valueOf(o); }
}
