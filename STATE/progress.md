# ChildCode — 进度追踪

## Current Status

**阶段：Phase 7 Step 1 完成，等待 review**

Phase 6 全部完成。Phase 7 Step 1 已录入验收证据文档。

## Just Completed — Phase 6: Edge States 与体验打磨

### 1. 额度耗尽边界状态
- `storage.js` 新增 `getUsageCount`、`incrementUsage`、`isQuotaExhausted`、`resetUsageCount`
- `WorkspacePage` 生成成功后自动 +1 计数，额度耗尽时禁用生成按钮并提示"创作次数已用完"
- `ConfigPage` 显示已使用次数 + 重置按钮

### 2. 生成失败边界状态
- 错误提示栏增加"重试"按钮，孩子无需关闭再重新操作

### 3. Debug 清理
- 移除 WorkspacePage 中的 DEBUG 状态面板（JSX + CSS）
- 移除所有 `console.log` / `console.error`（WorkspacePage × 10+、BlocklyEditor × 1、CompareCard × 1）
- 移除 mount/unmount 追踪 useEffect
- 移除 `useEffect` 等未使用的 import

### 4. UX 打磨
- 占位文案改为孩子友好语气：
  - 第一张图："拖好积木后，点击生成看看效果吧"
  - 第二张图："改一个积木后，再生成一张来对比"
  - 对比区："生成两张图之后，就可以在这里对比啦"
- 生成按钮 loading 态："正在创作中…"
- 多块修改提示色统一为警告橙色
- CompareCard 移除冗余 inline style，统一走 CSS class

**验证命令：**
```bash
npm run build   # 构建成功
npm run lint    # 无 lint 错误
npm run dev     # 启动后手动验证
```

**手动验证步骤：**
1. `npm run dev` → 进入工作区
2. 未配置时：生成按钮禁用 + 提示"请先完成家长设置"
3. 配置 API key + 额度为 3 → 回到工作区
4. 拖入四类积木 → 点击"生成图片" → 图 A 显示，按钮变"再次生成"
5. 不改积木 → 点"再次生成" → 阻断，提示"你没有修改积木哦"
6. 替换一个积木 → 再次生成 → 图 B 出现，对比区高亮被替换字段
7. 替换两个积木 → 生成 → 对比区提示"你改了 2 个块哦"（橙色）
8. 连续生成直至额度耗尽 → 按钮禁用 + 提示"创作次数已用完"
9. 前往家长设置 → 可见"已使用次数" → 点击"重置" → 回到工作区可继续
10. 页面无 DEBUG 面板，控制台无 `[DEBUG]` 输出
11. 占位文案为孩子友好语气

## Previously Completed

- Phase 1：项目脚手架与基础 UI 骨架
- Phase 2：Blockly 积木接入与 JSON 导出（含重复块校验补丁）
- Phase 3：家长最小配置入口（配置保存 / 读取 / 状态感知）
- Phase 4：图片生成对接（JSON → prompt → provider adapter → 图片展示）
- Phase 5：对比闭环（改块 → 再生成 → 两图并排 → 差异高亮）+ 修复补丁

## Confirmed Decisions

- 目标用户：8–12 岁孩子（独立探索）+ 家长（配置与安全）
- MVP 闭环：拖积木 → 生成图 → 改一个块 → 再生成 → 比较差异
- 四类积木：对象、动作、场景、风格
- 完全白名单，不开放自由文本
- 双层表示：结构化 JSON（真相层）→ prompt（派生执行层）
- Provider adapter：业务层通过 `generateImage(prompt, config)` 调用，当前实现 OpenAI DALL-E 3
- 前端技术栈：React + Vite
- 存储方案：localStorage
- 架构：纯前端，无后端
- Phase 5 对比模式：只保留最近两个快照（snapshotA / snapshotB），不做通用历史
- Phase 6 额度：最小 MVP 计数（localStorage），非真实扣费系统

## Key Documents

- 验收证据：`STATE/acceptance-evidence.md`
- 验收标准：`docs/GOAL_AND_ACCEPTANCE.md`

## Next Recommended Step

Phase 7 后续：README 更新、demo 资产打包（待讨论）。
