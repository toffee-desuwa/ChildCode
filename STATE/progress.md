# ChildCode — 进度追踪

## Current Status

**阶段：Phase 4 完成，等待 review**

图片生成链路已打通：JSON 真相层 → prompt 派生 → provider adapter → 图片展示。

## Just Completed — Phase 4

- `src/generation/derivePrompt.js` — JSON → prompt 派生（固定模板：`{风格}风格，{对象}在{场景}中{动作}`）
- `src/generation/provider.js` — 统一 `generateImage(prompt, config)` 接口 + OpenAI DALL-E 3 adapter
- 工作区新增"生成图片"按钮，四类齐全 + 已配置时可用
- 图 A 预览区展示生成结果
- 加载中 / 成功 / 失败状态处理
- 未配置 API key 时按钮禁用 + 提示
- 错误横幅可关闭

**验证命令：**
```bash
npm run build   # 构建成功
npm run lint    # 无 lint 错误
npm run dev     # 启动后手动验证
```

**手动验证步骤：**
1. `npm run dev` → 进入工作区
2. 未配置 API key 时 → "生成图片"按钮禁用，显示提示
3. 配置有效的 OpenAI API key + 额度
4. 回到工作区 → 拖入四类积木
5. 点击"生成图片" → 按钮变"生成中…" → 图 A 区显示生成的图片
6. 若 API key 无效或网络错误 → 显示红色错误横幅
7. JSON 预览区仍然正常工作

## Previously Completed

- Phase 1：项目脚手架与基础 UI 骨架
- Phase 2：Blockly 积木接入与 JSON 导出（含重复块校验补丁）
- Phase 3：家长最小配置与额度控制

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

## Not Started Yet

- Phase 5：对比闭环
- Phase 6：Edge States 与体验打磨
- 真正的次数消耗与扣减

## Next Recommended Step

Phase 5：实现改块 → 再生成 → 两图并排对比闭环。
