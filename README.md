# ChildCode

一个面向 8–12 岁孩子的 AI 表达启蒙工具 MVP。

孩子通过拖拽积木（对象、动作、场景、风格）组合结构化输入，生成图片，再通过"只改一个块"的对比闭环，理解输入结构如何影响 AI 输出。

我们在探索一种新的儿童 AI 表达启蒙方式。

## 核心闭环

```
拖积木 → 生成图 A → 改一个块 → 再生成图 B → 并排对比差异
```

孩子在这个循环中自然习得：
- **结构化表达** — 把想法拆成对象 + 动作 + 场景 + 风格
- **因果推理** — 改变一个输入，观察输出如何变化
- **AI 素养启蒙** — AI 的输出取决于你怎么描述，不是魔法

## 为什么这样设计

### 白名单积木，不开放自由文本
所有输入来自预设的白名单积木。孩子不需要打字、不接触 prompt，降低认知门槛和安全风险。

### JSON 真相层，不直接拼 prompt
积木操作产生结构化 JSON，系统从 JSON 派生 prompt。业务逻辑基于 JSON 而非 prompt 文本，孩子在生产 UI 中看不到 JSON 或 prompt。

### Mock provider 验证的意义
MVP 阶段默认使用 mock provider（SVG 占位图）进行开发和验证。mock 验证了核心闭环（拖拽 → 生成 → 对比 → 差异高亮）、主要边界状态、以及 UI 交互流程。真实 provider 的失败路径通过无效 API key 额外验证。真实图片 API 适配器（OpenAI DALL-E 3）已实现，切换 provider 不影响业务逻辑。

## 当前状态

**MVP 已完成 Phase 1–6，进入 Phase 7（文档与验收打磨）。**

已验证的功能（mock provider 下）：
- 四类白名单积木拖拽 + 结构化 JSON 导出
- JSON → prompt → 图片生成 → 展示
- 改块 → 再生成 → 两图并排 → 差异高亮
- 家长配置（API key + 额度）
- 额度耗尽阻止生成（最小 localStorage 计数）
- 边界状态：缺少积木、重复积木、零修改阻断、多块修改提示、配置缺失/无效

另外通过真实 provider 失败路径验证：
- 生成失败时展示友好中文提示 + 重试按钮

详细验收证据见 `STATE/acceptance-evidence.md`。

## 明确不做的事（MVP 范围冻结）

- 自由文本输入
- 课程系统 / 教学引导 / 闯关机制
- Harness / 测试管理 UI
- 商业化 / 付费 / 账户体系
- 多语言（当前只做中文）
- 社交 / 分享功能
- 后端服务
- 真实计费 / 额度扣减系统
- 响应式移动端适配

这是一个聚焦的 MVP，不是完整的教育平台。

## 技术栈

- React + Vite（纯前端，无后端）
- Blockly（积木拖拽交互）
- localStorage（配置与额度存储）
- Provider adapter 模式（当前：mock + OpenAI DALL-E 3）

## 快速开始

```bash
npm install
npm run dev       # 启动开发服务器（默认使用 mock provider）
npm run build     # 生产构建
npm run lint      # ESLint 检查
```

开发模式下默认使用 mock provider，无需配置 API key 即可体验完整流程。

如需使用真实图片 API，在浏览器 localStorage 中设置 `childcode_use_real_api=true`，并在家长设置页配置有效的 OpenAI API key。

## 项目文档

| 文档 | 说明 |
|------|------|
| `docs/PRODUCT_BRIEF.md` | 产品定义与设计决策 |
| `docs/GOAL_AND_ACCEPTANCE.md` | 目标、非目标、验收标准 |
| `docs/V0_SCHEMA_AND_FLOW.md` | Block schema、页面流程、边界状态 |
| `docs/TECH_PLAN.md` | 技术选型与实现阶段 |
| `STATE/progress.md` | 进度追踪 |
| `STATE/acceptance-evidence.md` | 验收证据 |
