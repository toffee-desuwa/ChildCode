#!/usr/bin/env bash
# ============================================================
# ChildCode — Harness Init Script
# 每个 Ralph session 开头跑：环境检查 + 构建验证 + 状态报告
# ============================================================

set -euo pipefail

echo "=== ChildCode Harness Init ==="
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 1. 环境检查
echo "--- Environment Check ---"
node -v || { echo "FAIL: node not found"; exit 1; }
npm -v || { echo "FAIL: npm not found"; exit 1; }
echo ""

# 2. 依赖检查
echo "--- Dependencies ---"
if [ ! -d "node_modules" ]; then
  echo "node_modules missing, installing..."
  npm install
else
  echo "node_modules OK"
fi
echo ""

# 3. 构建验证
echo "--- Build Check ---"
npm run build 2>&1 | tail -3
BUILD_EXIT=$?
if [ $BUILD_EXIT -ne 0 ]; then
  echo "FAIL: build failed"
  exit 1
fi
echo "Build OK"
echo ""

# 4. Lint 检查
echo "--- Lint Check ---"
npm run lint 2>&1 | tail -5
LINT_EXIT=$?
if [ $LINT_EXIT -ne 0 ]; then
  echo "WARN: lint has issues"
fi
echo ""

# 5. Git 状态
echo "--- Git Status ---"
git status --short
echo ""
echo "Last 5 commits:"
git log --oneline -5
echo ""

# 6. Feature 状态摘要
echo "--- Feature Status ---"
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('harness/features.json', 'utf8'));
const counts = {};
data.features.forEach(f => { counts[f.status] = (counts[f.status] || 0) + 1; });
Object.entries(counts).sort().forEach(([s, c]) => console.log('  ' + s + ': ' + c));
console.log('  total: ' + data.features.length);
"
echo ""

# 7. 进度文件尾部
echo "--- Last Progress Entry ---"
tail -5 harness/progress.txt 2>/dev/null || echo "(no progress yet)"
echo ""

echo "=== Init Complete ==="
