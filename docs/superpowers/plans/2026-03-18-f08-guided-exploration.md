# F08: Guided Exploration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded hint strings in WorkspacePage with a phase-aware guidance system that shows contextual hints based on the child's exploration state.

**Architecture:** Pure-function guidance logic in `src/guidance/phaseGuide.js` determines the current phase from workspace state. A small presentational `GuidanceHint` component renders the hint. WorkspacePage wires them together, replacing its 3 hardcoded hints. No persistence, no new dependencies.

**Tech Stack:** React 19, pure JS, CSS animations

**Spec:** `docs/superpowers/specs/2026-03-18-f08-guided-exploration-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/guidance/phaseGuide.js` | Phase detection logic + comparison feedback |
| Create | `src/components/GuidanceHint.jsx` | Presentational hint component |
| Modify | `src/blocks/whitelist.js` | Export `CATEGORY_LABELS` constant |
| Modify | `src/pages/WorkspacePage.jsx` | Wire guidance into workspace, remove hardcoded hints |
| Modify | `src/index.css` | Guidance hint styles |

---

### Task 1: Export CATEGORY_LABELS from whitelist.js

**Files:**
- Modify: `src/blocks/whitelist.js`

- [ ] **Step 1: Add CATEGORY_LABELS export**

Add at the end of `src/blocks/whitelist.js`:

```js
/**
 * 类别中文标签映射，从 BLOCK_CATEGORIES 派生
 * 供 phaseGuide.js、WorkspacePage.jsx 等模块共用
 */
export const CATEGORY_LABELS = Object.fromEntries(
  Object.entries(BLOCK_CATEGORIES).map(([type, cat]) => [type, cat.label])
)
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: SUCCESS — no breaking changes, CATEGORY_LABELS is a new export

- [ ] **Step 3: Commit**

```bash
git add src/blocks/whitelist.js
git commit -m "refactor: export CATEGORY_LABELS from whitelist as single source of truth"
```

---

### Task 2: Create phaseGuide.js

**Files:**
- Create: `src/guidance/phaseGuide.js`

- [ ] **Step 1: Create the guidance module**

Create `src/guidance/phaseGuide.js`:

```js
/**
 * 阶段感知引导系统
 * 根据当前 workspace 状态返回引导信息，纯函数，无副作用
 */
import { BLOCK_CATEGORIES, CATEGORY_LABELS } from '../blocks/whitelist'
import { hasDuplicates } from '../blocks/exportJson'

const CATEGORIES = Object.keys(BLOCK_CATEGORIES)

/**
 * 根据当前状态判定阶段并返回引导信息
 * @param {object|null} currentJson - exportBlocksJson 返回值
 * @param {object|null} snapshotA - 第一张图快照
 * @param {object|null} snapshotB - 第二张图快照
 * @param {string|null} cachedSuggestion - 调用方缓存的建议类别，防闪烁
 * @returns {{ phase: string, message: string|null, suggestedCategory?: string }}
 */
export function getGuidance(currentJson, snapshotA, snapshotB, cachedSuggestion) {
  // 初始状态（组件 mount 时 currentJson 为 null）
  if (!currentJson) return { phase: 'empty', message: '从左边的工具箱拖几个积木过来试试！' }

  // workspace 清空所有积木后，blocks 全为 null
  const allNull = CATEGORIES.every(c => !currentJson.blocks[c])
  if (allNull) return { phase: 'empty', message: '从左边的工具箱拖几个积木过来试试！' }

  // 重复积木 — 不显示引导，让现有 duplicate UI 处理
  if (hasDuplicates(currentJson)) return { phase: 'invalid', message: null }

  // 未凑齐四类
  const missing = CATEGORIES.filter(c => !currentJson.blocks[c])
  if (missing.length > 0) {
    const names = missing.map(c => CATEGORY_LABELS[c])
    return { phase: 'incomplete', message: `还差${names.join('、')}就齐了！` }
  }

  // 四类齐全，未生成第一张图
  if (!snapshotA) {
    return { phase: 'ready', message: '准备好了！点「生成图片」看看你的积木会变成什么画' }
  }

  // 已有第一张图，等待第二张
  if (!snapshotB) {
    const suggestion = cachedSuggestion || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    return {
      phase: 'first-image',
      message: `试试只改一个积木，看看画会怎么变？比如换个${CATEGORY_LABELS[suggestion]}？`,
      suggestedCategory: suggestion,
    }
  }

  // 对比阶段 — 由现有 comparison UI 处理
  return { phase: 'comparing', message: null }
}

/**
 * 对比阶段的增强反馈（单块变化时给正面强化）
 * @param {{ changedFields: string[], count: number }} comparison
 * @returns {string|null}
 */
export function getComparisonFeedback(comparison) {
  if (comparison.count === 1) {
    const category = CATEGORY_LABELS[comparison.changedFields[0]]
    return `你只改了「${category}」，看看画面变化！这就是这个积木的力量`
  }
  return null
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 3: Verify lint passes**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/guidance/phaseGuide.js
git commit -m "feat(F08): add phase-aware guidance logic"
```

---

### Task 3: Create GuidanceHint component

**Files:**
- Create: `src/components/GuidanceHint.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/GuidanceHint.jsx`:

```jsx
/**
 * 引导提示组件
 * 根据阶段显示上下文相关的引导信息
 */
export default function GuidanceHint({ message, phase }) {
  if (!message) return null
  return (
    <div className={`guidance-hint guidance-${phase}`} role="status">
      <p>{message}</p>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 3: Commit**

```bash
git add src/components/GuidanceHint.jsx
git commit -m "feat(F08): add GuidanceHint presentational component"
```

---

### Task 4: Add guidance hint CSS styles

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add styles at the end of index.css**

Append to `src/index.css`, after the existing `.new-round-btn` rule:

```css
/* === F08: 引导提示样式 === */

@keyframes guidance-fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.guidance-hint {
  padding: 10px 16px;
  border-radius: 8px;
  margin-top: 8px;
  margin-bottom: 8px;
  font-weight: bold;
  animation: guidance-fade-in 0.3s ease-out;
}

.guidance-empty {
  background: #e3f2fd;
  border: 1px solid #90caf9;
  color: #1565c0;
}

.guidance-incomplete {
  background: #fff3e0;
  border: 1px solid #ffcc80;
  color: #e65100;
}

.guidance-ready {
  background: #e8f5e9;
  border: 1px solid #a5d6a7;
  color: #2e7d32;
}

.guidance-first-image {
  background: #e3f2fd;
  border: 1px solid #90caf9;
  color: #1565c0;
}

.compare-positive {
  color: #2e7d32;
  font-weight: bold;
  margin-bottom: 12px;
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat(F08): add guidance hint CSS styles with fade-in animation"
```

---

### Task 5: Wire guidance into WorkspacePage

This is the main integration task. It modifies `src/pages/WorkspacePage.jsx` to:
1. Import the new modules
2. Remove the hardcoded `CATEGORY_LABELS`
3. Replace hardcoded hints with `<GuidanceHint>`
4. Add comparison positive feedback

**Files:**
- Modify: `src/pages/WorkspacePage.jsx`

- [ ] **Step 1: Update imports**

In `src/pages/WorkspacePage.jsx`, add new imports after the existing imports:

```js
import { getGuidance, getComparisonFeedback } from '../guidance/phaseGuide'
import GuidanceHint from '../components/GuidanceHint'
```

- [ ] **Step 2: Replace CATEGORY_LABELS with import from whitelist**

Replace the hardcoded `CATEGORY_LABELS` constant:

```js
// DELETE this block:
const CATEGORY_LABELS = {
  subject: '对象',
  action: '动作',
  scene: '场景',
  style: '风格',
}
```

Replace with import. Add to the imports section:

```js
import { CATEGORY_LABELS } from '../blocks/whitelist'
```

- [ ] **Step 3: Add suggestion ref and guidance computation**

Inside the `WorkspacePage` function body, after the existing `snapshotARef` declaration, add:

```js
// 缓存 first-image 阶段的建议类别，防止每次渲染闪烁
const guidanceSuggestionRef = useRef(null)
```

After the existing `canGenerate` line, add:

```js
const guidance = getGuidance(currentJson, snapshotA, snapshotB, guidanceSuggestionRef.current)
if (guidance.suggestedCategory) {
  guidanceSuggestionRef.current = guidance.suggestedCategory
}
```

- [ ] **Step 4: Replace hardcoded phase-hint with GuidanceHint**

In the JSX, find and replace the hardcoded hint block:

```jsx
{/* DELETE this block: */}
{hasA && !hasB && (
  <p className="phase-hint">试试只改一个块，看看会有什么不同？</p>
)}
```

Replace with:

```jsx
<GuidanceHint message={guidance.message} phase={guidance.phase} />
```

Place the `<GuidanceHint>` in the `blocks-area` section, right after the `<BlocklyEditor>` and before the `zeroChangeWarn` check.

- [ ] **Step 5: Add comparison positive feedback**

In the comparison area JSX, find the existing multi-block warning:

```jsx
{comparison.count > 1 && (
  <p className="compare-hint">
    你改了 {comparison.count} 个块哦。试试只改 1 个，更容易看出区别！
  </p>
)}
```

First, compute the feedback once (add after the existing `comparison` useMemo):

```js
const comparisonPositive = comparison ? getComparisonFeedback(comparison) : null
```

Then add BEFORE the multi-block warning in JSX:

```jsx
{comparisonPositive && (
  <p className="compare-positive">{comparisonPositive}</p>
)}
```

Note: `getComparisonFeedback` returns non-null only when `count === 1`, so the two blocks are mutually exclusive.

- [ ] **Step 6: Verify build passes**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 7: Verify lint passes**

Run: `npm run lint`
Expected: No errors. If `hasA` variable is now unused after removing the phase-hint, clean up accordingly.

- [ ] **Step 8: Commit**

```bash
git add src/pages/WorkspacePage.jsx
git commit -m "feat(F08): wire phase-aware guidance into WorkspacePage"
```

---

### Task 6: Final verification and cleanup

**Files:**
- All modified files

- [ ] **Step 1: Full build verification**

Run: `npm run build`
Expected: SUCCESS with no warnings

- [ ] **Step 2: Full lint verification**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: Remove dead `.phase-hint` CSS rule**

In `src/index.css`, delete the now-unused `.phase-hint` rule (was used by the removed hardcoded hint):

```css
/* DELETE this block: */
.phase-hint {
  color: #4a90d9;
  margin-top: 8px;
  font-weight: bold;
}
```

- [ ] **Step 4: Replace local CATEGORY_LABELS in exportJson.js with import**

In `src/blocks/exportJson.js`, replace the local `CATEGORY_LABELS` derivation (lines 3-5):

```js
// DELETE:
const CATEGORY_LABELS = Object.fromEntries(
  Object.entries(BLOCK_CATEGORIES).map(([type, cat]) => [type, cat.label])
)
```

Replace the import line to also bring in `CATEGORY_LABELS`:

```js
import { BLOCK_CATEGORIES, CATEGORY_LABELS } from './whitelist'
```

- [ ] **Step 5: Update features.json status**

In `harness/features.json`, update F08 status:

```json
{
  "id": "F08",
  "name": "guided-exploration",
  "description": "引导式探索：不是让孩子无限刷图，而是系统引导'试试只改一个块'",
  "status": "done",
  "notes": "阶段感知引导系统，根据 workspace 状态显示上下文提示"
}
```

- [ ] **Step 6: Update progress.txt**

Append to `harness/progress.txt`:

```
## F08: guided-exploration (2026-03-19)
- 新增 src/guidance/phaseGuide.js — 阶段感知引导逻辑
- 新增 src/components/GuidanceHint.jsx — 引导提示组件
- 修改 src/blocks/whitelist.js — 导出 CATEGORY_LABELS
- 修改 src/pages/WorkspacePage.jsx — 替换硬编码提示为阶段引导
- 修改 src/index.css — 引导提示样式
- 验证：npm run build OK, npm run lint OK
```

- [ ] **Step 7: Final commit**

```bash
git add harness/features.json harness/progress.txt src/index.css src/blocks/exportJson.js
git commit -m "chore(F08): mark guided-exploration done, cleanup dead code, update progress"
```
