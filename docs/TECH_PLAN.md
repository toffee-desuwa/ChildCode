# ChildCode — v0 技术选型与实现计划

## A. Frontend Choice

**推荐：React + Vite**

为什么适合 ChildCode v0：
- Blockly 官方提供 `@blockly/react` 适配层，接入成本最低
- React 组件模型天然适合"搭建区 + 图片展示区 + 对比视图"的 UI 结构
- Vite 启动快、配置少，适合 MVP 快速迭代
- 生态成熟，遇到问题容易找到解决方案

为什么现在不选其他方案：
- **Vue**：Blockly 官方无 Vue 适配层，需自行封装，增加 v0 复杂度
- **Next.js**：v0 是纯前端应用（API key 直连），不需要 SSR/SSG，Next.js 引入不必要的复杂度
- **Svelte**：Blockly 集成需要更多手动工作，社区参考少

## B. Blockly Integration Plan

### Blockly 在 v0 中负责什么
- 展示四类白名单积木分类
- 提供拖拽交互，让孩子从分类中选取积木到工作区
- 当工作区积木变化时，输出结构化 JSON 真相层数据

### 最小接入方式
- 使用 `@blockly/react` 组件包裹 Blockly 编辑器
- 用 Blockly Toolbox 定义四个分类（subject / action / scene / style）
- 每个分类下挂载白名单积木块（下拉选择或独立块）
- 监听 workspace change 事件，实时导出 JSON

### 需要避免的复杂度
- 不做自定义 Blockly 渲染器或主题（用默认即可）
- 不做积木嵌套、连接、逻辑组合
- 不做积木拼图式连接（v0 的四个块是并列的，不是串联的）
- 不做 Blockly 代码生成器（不需要生成 JavaScript/Python，只导出 JSON）

## C. State / Data Plan

### JSON 真相层管理
- 用 React state（`useState` / `useReducer`）管理当前积木组合的 JSON
- JSON 结构与 `docs/V0_SCHEMA_AND_FLOW.md` 中定义的 schema 一致
- Blockly workspace change → 解析 workspace → 更新 JSON state

### 第一张图与第二张图的保存与比较
- 维护一个 `history` 数组，每次生成时保存 `{ json, imageUrl }` 快照
- 对比视图从 `history` 中取最近两次快照并排展示

### 如何判断"只改了一个块"
- 对比当前 JSON 与上一次生成时的 JSON
- 逐字段比较 `blocks.subject.value`、`blocks.action.value`、`blocks.scene.value`、`blocks.style.value`
- 统计差异字段数量：0 = 没改，1 = 只改了一个块，>1 = 改了多个块
- 根据差异数量决定提示文案（见 `V0_SCHEMA_AND_FLOW.md` Edge States）

## D. API Plan

### v0 图片生成方式

**推荐：前端直连云端图片生成 API（如 DALL·E、Stability AI 等）**

为什么这样选：
- 无需搭建后端服务，v0 保持纯前端架构
- API key 由家长在本地配置，存储在 localStorage
- 降低部署复杂度，孩子打开浏览器即可使用

具体 API 选择留给实现阶段确认，v0 只需满足：
- 接受文本 prompt 输入
- 返回图片 URL 或 base64
- 支持 API key 鉴权

### API key 与额度的最小配置落地
- **存储**：API key 和额度配置存 localStorage（v0 不做后端）
- **额度计数**：localStorage 中维护已用次数，每次生成 +1
- **额度检查**：生成前比较已用次数与上限，超限则禁用生成按钮
- **重置**：v0 不做自动重置逻辑，家长可手动在配置入口中重置

**不做：** 后端鉴权、用户账户、服务端额度管理、API key 加密存储

### Provider Adapter 原则
- 业务层不直接绑定某家具体图片生成服务
- 通过单一 provider adapter 抽象接入图片生成能力，业务层只调用类似 `generateImage(prompt, config)` 的统一接口
- v0 只实现一个 provider adapter，但切换 provider 时只需替换 adapter，不改业务逻辑

## E. Implementation Phases

### Phase 1 — 项目脚手架与基础 UI 骨架
**目标：** 可运行的空项目 + 页面路由骨架
**产物：**
- Vite + React 项目初始化
- 欢迎页、搭建页、配置入口的空壳组件
- 基础路由跳转
**验证：**
- `npm run dev` 启动成功
- 浏览器可在欢迎页与搭建页之间跳转

### Phase 2 — Blockly 积木接入与 JSON 导出
**目标：** Blockly 工作区可拖拽四类白名单积木，并实时输出 JSON
**产物：**
- Blockly 编辑器组件，Toolbox 含四类积木
- workspace change → JSON 真相层导出
- 页面上实时显示 JSON（开发调试用，不面向孩子）
**验证：**
- 拖拽积木后，页面显示正确的 JSON 结构
- JSON 符合 `V0_SCHEMA_AND_FLOW.md` 中的 schema

### Phase 3 — 家长最小配置与额度控制
**目标：** 家长可配置 API key 和额度，额度耗尽时阻止生成
**产物：**
- 配置入口（页面或弹窗）
- API key 输入、验证、localStorage 存储
- 额度设置与计数
**验证：**
- 配置 API key 后可正常生成
- 未配置时引导进入配置
- 额度耗尽时生成按钮禁用且显示提示

### Phase 4 — 图片生成对接
**目标：** JSON → prompt → 调用图片 API → 展示图片
**产物：**
- prompt 派生函数（JSON → 文本）
- 图片生成 API 调用模块（通过 provider adapter）
- 生成按钮 + 加载状态 + 图片展示
**验证：**
- 选齐四类积木后点击生成，返回并展示一张图片
- 缺少积木时生成按钮禁用

### Phase 5 — 对比闭环
**目标：** 改块 → 再生成 → 两图并排对比
**产物：**
- 生成历史快照保存
- 差异检测（几个块被修改）
- 对比视图 UI + 修改高亮 + 提示文案
**验证：**
- 替换一个块后再次生成，两张图并排展示
- 被替换的块有高亮标注
- 改多个块时出现提示文案

### Phase 6 — Edge States 与体验打磨
**目标：** 覆盖所有边界状态，完成 MVP 验收
**产物：**
- 所有 Edge States 的错误处理与提示文案
- 白名单安全验证（无绕过路径）
- 基础视觉打磨（孩子友好的颜色、字体大小）
**验证：**
- 逐项检查 `GOAL_AND_ACCEPTANCE.md` 中 A1–A5 所有验收条目
- 所有 Edge States 按 `V0_SCHEMA_AND_FLOW.md` 预期行为运行

## F. Acceptance Commands

以下为各阶段可运行的验证命令（随实现推进逐步可用）：

```bash
# Phase 1 — 项目可启动
npm run dev                    # 开发服务器启动，无报错
npm run build                  # 生产构建成功

# Phase 2 — Blockly 集成
npm run dev                    # 手动验证：拖拽积木后页面显示正确 JSON

# Phase 3 — 图片生成
npm run dev                    # 手动验证：选齐积木 → 点击生成 → 图片展示

# Phase 4 — 对比闭环
npm run dev                    # 手动验证：改一个块 → 再生成 → 两图并排 → 高亮标注

# Phase 5 — 家长配置
npm run dev                    # 手动验证：配置 API key → 额度耗尽 → 阻止生成

# Phase 6 — 全量验收
npm run build                  # 构建无报错无警告
npm run lint                   # 无 lint 错误（如配置了 ESLint）
# 手动逐项检查 docs/GOAL_AND_ACCEPTANCE.md 中 A1–A5
```

**备注：** v0 以手动验证为主。若后续引入自动化测试，在对应 Phase 补充 `npm test` 命令。

## G. Risks / Simplifications

### 最可能踩坑的点

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Blockly 定制复杂度超预期 | 积木交互体验不符合设计 | 先用 Blockly 默认 UI，只做最小 Toolbox 配置 |
| 图片 API 响应慢或不稳定 | 孩子等待时间长，体验差 | 加 loading 动画；考虑设超时上限 |
| API key 存 localStorage 不安全 | 家长 API key 可能泄露 | v0 接受此简化；文档中提醒家长风险 |
| Blockly workspace 解析逻辑复杂 | JSON 导出不稳定 | 保持 workspace 结构极简（四个平行块，无嵌套） |
| 图片 API 返回不当内容 | 即使白名单 prompt 也可能有意外输出 | 白名单已大幅降低风险；v0 接受剩余风险，由家长兜底 |

### v0 故意接受的简化

- API key 明文存 localStorage，不做加密
- 额度计数存 localStorage，用户可手动清除绕过（v0 接受）
- 不做后端，前端直连图片 API
- 不做自动化测试，以手动验收为主
- 不做响应式适配，先做桌面浏览器
- 不做国际化，只做中文
- 不做持久化存储（刷新页面后历史记录丢失）
