# F08: Guided Exploration — Design Spec

## 概述

为 WorkspacePage 添加阶段感知的引导系统，根据孩子当前所处的探索阶段，显示上下文相关的提示信息。不是课程系统，不阻断操作，不做教学流程 — 只是让现有提示更智能。

## 设计原则

1. **不阻断** — 所有引导都是提示性的，孩子可以忽略
2. **不说教** — 用鼓励性语言，不用指令性语言
3. **阶段感知** — 根据当前状态自动切换提示，不需要孩子做选择
4. **会消退** — 引导在孩子开始操作后自然消失，不持续干扰
5. **无持久化** — 不用 localStorage，每次 session 重新开始

## 阶段定义

| 阶段 | 触发条件 | 引导内容 |
|------|---------|---------|
| `empty` | workspace 无积木（所有 blocks 为 null） | "从左边的工具箱拖几个积木过来试试！" |
| `incomplete` | 有积木但未凑齐四类 | "还差 {missing} 就齐了！"（列出缺少的类别中文名） |
| `ready` | 四类齐全，无 snapshotA | "准备好了！点「生成图片」看看你的积木会变成什么画" |
| `first-image` | snapshotA 存在，snapshotB 不存在 | "试试只改一个积木，看看画会怎么变？比如换个{suggestion}？" |
| `comparing` | snapshotA 和 snapshotB 都存在 | 已有对比 UI 处理，不额外引导 |

### `first-image` 阶段的智能建议

- 从四个类别中随机选一个作为建议（"换个**场景**？"）
- 每次渲染固定（用 useRef 缓存），避免闪烁
- 简单随机即可，不需要复杂逻辑

### 对比阶段的增强反馈

当 comparison 存在时：
- **改了 1 个块**："你只改了**{category}**，看看画面变化！这就是这个积木的力量" （正面强化）
- **改了 >1 个块**：保持现有提示 "你改了 N 个块哦。试试只改 1 个，更容易看出区别！"
- **改了 0 个块**：保持现有 zeroChangeWarn 逻辑

## 文件变更

### 新增文件

#### `src/guidance/phaseGuide.js` (~45 行)

```js
/**
 * 阶段感知引导系统
 * 根据当前 workspace 状态返回引导信息
 */
import { BLOCK_CATEGORIES } from '../blocks/whitelist'
import { isComplete, hasDuplicates } from '../blocks/exportJson'

const CATEGORY_LABELS = Object.fromEntries(
  Object.entries(BLOCK_CATEGORIES).map(([type, cat]) => [type, cat.label])
)
const CATEGORIES = Object.keys(BLOCK_CATEGORIES)

/**
 * 根据当前状态返回引导信息
 * @param {object|null} currentJson - exportBlocksJson 的返回值
 * @param {object|null} snapshotA
 * @param {object|null} snapshotB
 * @param {string|null} cachedSuggestion - 调用方缓存的建议类别，避免闪烁
 * @returns {{ phase: string, message: string|null, suggestedCategory?: string }}
 */
export function getGuidance(currentJson, snapshotA, snapshotB, cachedSuggestion) {
  if (!currentJson) return { phase: 'empty', message: '从左边的工具箱拖几个积木过来试试！' }

  // 重复积木时提示（不覆盖 duplicate 专用提示，只标记阶段）
  if (hasDuplicates(currentJson)) return { phase: 'invalid', message: null }

  const missing = CATEGORIES.filter(c => !currentJson.blocks[c])
  if (missing.length > 0) {
    const names = missing.map(c => CATEGORY_LABELS[c])
    return { phase: 'incomplete', message: `还差${names.join('、')}就齐了！` }
  }

  if (!snapshotA) return { phase: 'ready', message: '准备好了！点「生成图片」看看你的积木会变成什么画' }

  if (!snapshotB) {
    // 使用调用方缓存的建议，或生成一个新的
    const suggestion = cachedSuggestion || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    return {
      phase: 'first-image',
      message: `试试只改一个积木，看看画会怎么变？比如换个${CATEGORY_LABELS[suggestion]}？`,
      suggestedCategory: suggestion
    }
  }

  return { phase: 'comparing', message: null }
}

export function getComparisonFeedback(comparison) {
  if (comparison.count === 1) {
    const category = CATEGORY_LABELS[comparison.changedFields[0]]
    return `你只改了「${category}」，看看画面变化！这就是这个积木的力量`
  }
  return null
}
```

**设计决策说明：**
- `CATEGORY_LABELS` 从 `whitelist.js` 的 `BLOCK_CATEGORIES` 派生，保持单一数据源
- `cachedSuggestion` 参数让随机性由调用方（组件）通过 `useRef` 控制，避免每次渲染闪烁
- `hasDuplicates` 检查防止重复积木时误报 `ready` 阶段
- `invalid` 阶段返回 `message: null`，因为 WorkspacePage 已有独立的重复提示 UI

#### `src/components/GuidanceHint.jsx` (~25 行)

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

### 修改文件

#### `WorkspacePage.jsx`

**变更点：**
1. 导入 `getGuidance` 和 `getComparisonFeedback`
2. 导入 `GuidanceHint` 组件
3. 删除本文件内的 `CATEGORY_LABELS` 常量，改为从 `whitelist.js` 导入（消除重复定义）
4. 用 `useRef` 缓存 `first-image` 阶段的建议类别，传入 `getGuidance` 的 `cachedSuggestion` 参数
5. 替换硬编码提示为 `<GuidanceHint>`
6. 在 comparison 区域添加单块变化的正面反馈

**删除的代码：**
- `const CATEGORY_LABELS = { subject: '对象', ... }` 硬编码常量
- `{hasA && !hasB && (<p className="phase-hint">试试只改一个块...` 硬编码提示

**新增的代码：**
- `import { CATEGORY_LABELS } from '../blocks/whitelist'`（需要先从 whitelist.js 导出）
- `const guidanceSuggestionRef = useRef(null)`
- `const guidance = getGuidance(currentJson, snapshotA, snapshotB, guidanceSuggestionRef.current)`
- 当 guidance 返回 `suggestedCategory` 时更新 ref：`guidanceSuggestionRef.current = guidance.suggestedCategory`
- `<GuidanceHint message={guidance.message} phase={guidance.phase} />`
- comparison 区域的 `getComparisonFeedback` 调用

#### `src/blocks/whitelist.js`

**变更点：**
- 新增导出 `CATEGORY_LABELS`，从 `BLOCK_CATEGORIES` 派生，供 phaseGuide.js 和 WorkspacePage.jsx 共用

#### `src/index.css`（或对应样式文件）

新增 `.guidance-hint` 样式：
- 柔和背景色（浅蓝/浅黄）
- 圆角、内边距
- 简单的 fade-in 动画（CSS `@keyframes`）
- 不同 phase 可以用不同颜色调

## 不做的事

- 不做 localStorage 持久化（每次打开重新开始）
- 不做"任务"或"挑战"系统
- 不做引导步骤计数或进度条
- 不做强制引导（永远不阻断操作）
- 不做音效或复杂动画

## 验证方式

1. `npm run build` — 构建通过
2. `npm run lint` — 无新 lint 错误
3. 手动验证：
   - 空 workspace → 显示拖积木提示
   - 放 1-3 个积木 → 显示缺少哪些类别
   - 放齐 4 个 → 显示"准备好了"
   - 生成第一张图 → 显示"试试改一个块"
   - 生成第二张图（改 1 块）→ 显示正面反馈
   - 生成第二张图（改 >1 块）→ 显示现有多块提示
