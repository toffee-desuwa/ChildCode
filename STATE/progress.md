# ChildCode — 进度追踪

## Current Status

**阶段：Phase 5 完成，等待 review**

对比闭环已实现：改块 → 再生成 → 两图并排 → 差异高亮。

## Just Completed — Phase 5

- `src/generation/diffBlocks.js` — 对比两个 JSON 快照，返回 `{ changedFields, count }`
- WorkspacePage 重构：snapshotA / snapshotB 两槽模式（不做通用历史）
- 第一次生成 → snapshotA；修改积木后再次生成 → snapshotB
- 对比区：两张图并排 + 四类积木值 + 变化字段橙色高亮
- 0 块修改：警告提示；>1 块修改：温和提示（不阻止生成）
- "开始新一轮对比"按钮：B 升为 A，清空 B，可继续探索
- 生成后按钮文字变为"再次生成"，引导文案"试试只改一个块"

**验证命令：**
```bash
npm run build   # 构建成功
npm run lint    # 无 lint 错误
npm run dev     # 启动后手动验证
```

**手动验证步骤：**
1. `npm run dev` → 进入工作区
2. 配置有效 API key + 额度
3. 拖入四类积木 → 点击"生成图片" → 图 A 显示
4. 按钮变为"再次生成"，出现提示"试试只改一个块"
5. 不改任何积木 → 提示"你没有修改积木哦"
6. 替换一个积木 → 点击"再次生成" → 图 B 显示
7. 对比区出现：两张图并排 + 四类积木值 + 被替换的块橙色高亮
8. 改多个积木再生成 → 对比区提示"你改了 N 个块哦。试试只改 1 个"
9. 点击"开始新一轮对比" → B 升为 A，可继续修改

## Previously Completed

- Phase 1：项目脚手架与基础 UI 骨架
- Phase 2：Blockly 积木接入与 JSON 导出（含重复块校验补丁）
- Phase 3：家长最小配置与额度控制
- Phase 4：图片生成对接（JSON → prompt → provider adapter → 图片展示）

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

## Not Started Yet

- Phase 6：Edge States 与体验打磨
- 真正的次数消耗与扣减

## Next Recommended Step

Phase 6：Edge States 与体验打磨。
