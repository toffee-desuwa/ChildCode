# ChildCode — 进度追踪

## Current Status

**阶段：Phase 5 修复补丁完成，等待 review**

对比闭环已实现：改块 → 再生成 → 两图并排 → 差异高亮。修复了初版的槽位逻辑、0-change 阻断、高亮稳定性问题。

## Just Completed — Phase 5 fix patch

修复的问题：
- **槽位逻辑**：使用 `snapshotARef`（ref）代替闭包变量判断 A/B 槽，避免 async 函数中闭包值过期导致 A 被覆盖
- **0-change 阻断**：改为生成前强制检查，0 个字段变化时直接 return，不调用 API、不触碰快照
- **diff 高亮稳定性**：高亮完全基于 `diffBlocks(snapshotA.json, snapshotB.json)`，不依赖 Blockly 当前选中/聚焦状态
- **handleNewRound**：同步更新 ref 和 state，确保新一轮对比状态一致

**验证命令：**
```bash
npm run build   # 构建成功
npm run lint    # 无 lint 错误
npm run dev     # 启动后手动验证
```

**手动验证步骤：**
1. `npm run dev` → 进入工作区，配置有效 API key + 额度
2. 拖入四类积木 → 点击"生成图片" → 图 A 显示，按钮变为"再次生成"
3. 不改任何积木 → 点击"再次生成" → 被阻断，显示"你没有修改积木哦"，图 A 不变，B 不出现
4. 替换一个积木 → 点击"再次生成" → 图 B 显示，对比区出现，被替换字段橙色高亮
5. 点击 Blockly 空白区域 → 对比区高亮不消失（稳定性验证）
6. 重新测试：替换两个积木 → 生成 B → 对比区提示"你改了 2 个块哦"
7. 点击"开始新一轮对比" → B 升为 A，B 清空，按钮变回"再次生成"

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
