#!/usr/bin/env bash
# 渠道适配器契约测试一键运行脚本（零外部依赖，仅需 JDK 17+）
set -euo pipefail
cd "$(dirname "$0")"
rm -rf out
mkdir -p out
echo ">>> 编译 ..."
javac -d out $(find src -name '*.java')
echo ">>> 运行契约测试 ..."
java -cp out contract.ContractTestRunner
