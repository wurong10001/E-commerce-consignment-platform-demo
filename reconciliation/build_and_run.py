#!/usr/bin/env python3
"""电商代销平台 · 对账四象限 + 级差佣金 SQL 验证（纯标准库，内存 SQLite）。

运行：python3 reconciliation/build_and_run.py
预期：四象限各命中 1 条；级差佣金三级 1000/二级 500/一级 500 分，合计 2000 分。
"""
import re
import sqlite3
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def read(name: str) -> str:
    return (HERE / name).read_text(encoding="utf-8")


def split_quadrants(sql: str):
    """按 -- @Q1..@Q4 标记切分，返回 [(编号, 名称, SQL)]。"""
    parts = re.split(r"^--\s*@(Q\d)\s+(.+)$", sql, flags=re.MULTILINE)
    out = []
    for i in range(1, len(parts), 3):
        out.append((parts[i], parts[i + 1].strip(), parts[i + 2]))
    return out


def main() -> int:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.executescript(read("01_schema_and_seed.sql"))

    quadrants = split_quadrants(read("02_reconcile_quadrants.sql"))
    ok = True
    for code, name, sql in quadrants:
        rows = conn.execute(sql).fetchall()
        hit = len(rows) == 1
        ok &= hit
        ids = ", ".join(str(r[0]) for r in rows) or "无"
        print(f"{code} {name}: 命中 {len(rows)} 条 [{ids}] " + ("PASS" if hit else "FAIL"))

    rows = conn.execute(read("03_commission_tier.sql")).fetchall()
    # 输出按 level 升序：1=一级 500, 2=二级 500, 3=三级 1000
    result = {r["level"]: r["amount_cents"] for r in rows}
    total = sum(result.values())
    expected = {1: 500, 2: 500, 3: 1000}
    tier_ok = result == expected and total == 2000
    ok &= tier_ok
    for level in (1, 2, 3):
        cents = result.get(level, 0)
        print(f"佣金 第{['一','二','三'][level-1]}级: {cents} 分 (¥{cents/100:.2f})")
    print(f"佣金 合计: {total} 分 (¥{total/100:.2f}) " + ("PASS" if tier_ok else "FAIL"))

    print("\n[PASS] 四象限各命中 1 条；级差佣金与规则一致" if ok else "\n[FAIL] 存在断言失败")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
