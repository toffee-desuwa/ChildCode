#!/usr/bin/env bash
# ============================================================
# ChildCode — Harness Init Script
# 每个 Ralph session 开头跑：失败回滚 + 环境检查 + 构建验证 + 状态报告
# ============================================================

set -euo pipefail

echo "=== ChildCode Harness Init ==="
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 0. 失败回滚 — 上一轮 commit 了坏代码时自动恢复
echo "--- Build Safety Check ---"
if ! npm run build --silent 2>/dev/null; then
  echo "WARN: Last commit has broken build. Auto-reverting..."
  git revert HEAD --no-edit
  npm install --silent 2>/dev/null
  if ! npm run build --silent 2>/dev/null; then
    echo "FAIL: Still broken after revert. Manual intervention needed."
    exit 1
  fi
  echo "Auto-reverted broken commit. Clean state restored."
else
  echo "Last commit builds OK"
fi
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

# 3. 构建验证（回滚逻辑已在 step 0 处理，这里只做确认）
echo "--- Build Check ---"
npm run build 2>&1 | tail -3
echo "Build OK"
echo ""

# 4. Lint 检查
echo "--- Lint Check ---"
npm run lint 2>&1 | tail -5
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
