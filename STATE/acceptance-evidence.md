# ChildCode MVP — Acceptance Evidence

Recorded against commit history up to `chore/phase7-acceptance-evidence` branch.

All walkthroughs were performed in dev mode with the mock provider (SVG placeholders).
The real-provider failure path was additionally checked by setting `childcode_use_real_api=true` with an invalid API key to verify friendly error handling. No full end-to-end real-provider generation was performed in this evidence run.

## Validation Environment

- Provider: mock (SVG placeholder, `import.meta.env.DEV` default); real provider tested for failure path only
- Storage: localStorage (API key, usage limit, usage count)
- Build: `npm run build` — passes, no errors
- Lint: `npm run lint` — passes, no errors

---

## A1 — 积木拖拽与结构化输出

| Criterion | Status | Evidence |
|-----------|--------|----------|
| 页面展示四类白名单积木：对象、动作、场景、风格 | PASS | Blockly toolbox shows 4 categories with whitelist options defined in `src/blocks/whitelist.js` |
| 孩子可拖拽积木块到工作区 | PASS | Blockly drag-and-drop works; each category has a dropdown block |
| 拖拽完成后，系统生成结构化 JSON | PASS | `exportBlocksJson()` outputs `{ version: "v0", blocks: {...}, duplicates: [] }` on every workspace change |
| JSON 包含 subject、action、scene、style | PASS | JSON structure matches `V0_SCHEMA_AND_FLOW.md` schema |
| MVP 只使用四类核心信息参与 prompt 派生 | PASS | `derivePrompt()` reads only these 4 fields, no extras |

## A2 — 图片生成

| Criterion | Status | Evidence |
|-----------|--------|----------|
| JSON → prompt 转换（孩子不可见） | PASS | `derivePrompt()` produces template string; prompt not shown in production UI (JSON preview is dev-only gated) |
| 调用图片 API 返回图片并展示 | PASS (mock) | Mock provider returns SVG data URL; displayed in image slot. Real OpenAI DALL-E 3 adapter exists but not tested end-to-end in this evidence run |

## A3 — 对比闭环

| Criterion | Status | Evidence |
|-----------|--------|----------|
| 可替换 1 个积木块 | PASS | Change any block dropdown value in workspace |
| 替换后可再次生成 | PASS | Button changes to "再次生成"; clicking generates image B |
| 两张图并排展示 | PASS | Image slots A and B side by side; compare area shows both cards with block values |
| 被替换的块高亮标注 | PASS | `diffBlocks()` detects changed fields; `CompareCard` highlights them with `.is-changed` CSS class (orange border + background) |

## A4 — 家长配置与安全

| Criterion | Status | Evidence |
|-----------|--------|----------|
| 家长可配置 API key 与使用额度 | PASS | ConfigPage saves to localStorage via `saveConfig()` |
| 额度耗尽时阻止生成并提示 | PASS | `isQuotaExhausted()` checked before generation; button disabled + "创作次数已用完，请让爸爸妈妈查看设置" shown |

Note: quota is minimal MVP — localStorage counter, not a real billing/deduction system. Parent can reset count in ConfigPage.

## A5 — 安全边界

| Criterion | Status | Evidence |
|-----------|--------|----------|
| 无自由文本输入 | PASS | All block values come from `BLOCK_CATEGORIES` whitelist; no text input fields in workspace |
| 白名单积木内容来自固定列表 | PASS | All current values are hardcoded in `whitelist.js`; no dynamic or user-supplied values |
| 未发现正常 UI 路径可绕过白名单 | PASS | Blockly blocks use dropdown fields sourced from whitelist; `exportBlocksJson()` only reads known block types. No formal security audit performed |

---

## Edge State Walkthroughs

### Missing blocks (incomplete)
- **Trigger**: fewer than 4 block types in workspace
- **Behavior**: generate button disabled; status hint "还差积木哦，把四类都拖过来吧！"
- **Status**: PASS

### Duplicate blocks
- **Trigger**: drag two blocks of the same category
- **Behavior**: `hasDuplicates()` returns true; button disabled; error message names the duplicated categories
- **Status**: PASS

### Zero-change blocked
- **Trigger**: after generating A, click "再次生成" without changing any block
- **Behavior**: generation blocked; warning "你没有修改积木哦，改一个块试试？"
- **Status**: PASS

### Multi-block change hint
- **Trigger**: change 2+ blocks after generating A, then generate B
- **Behavior**: compare area shows orange hint "你改了 N 个块哦。试试只改 1 个，更容易看出区别！"
- **Status**: PASS (non-blocking, hint only)

### Invalid / missing config
- **Trigger**: no API key configured, or invalid config in localStorage
- **Behavior**: button disabled; hint "请先完成家长设置才能生成"; config status badge shows orange/red with "前往设置" button
- **Status**: PASS

### Quota exhausted
- **Trigger**: usage count >= usage limit
- **Behavior**: button disabled; hint "创作次数已用完，请让爸爸妈妈查看设置"
- **Status**: PASS

### Generation / provider failure
- **Trigger**: real API failure (tested by setting `childcode_use_real_api=true` with invalid API key)
- **Behavior**: friendly Chinese error "这次创作没有成功，请稍后再试一次。若一直失败，请让家长检查设置。" with retry button. Raw error logged to console in dev mode only.
- **Status**: PASS (retry button appears only for true provider failures, not for missing blocks / config / quota)

### New round
- **Trigger**: after A/B comparison, click "开始新一轮对比"
- **Behavior**: B promotes to A, B clears, button returns to "再次生成" state
- **Status**: PASS

---

## Intentionally Out of Scope / Not Implemented

These items are explicitly excluded from MVP per `CLAUDE.md`, `PRODUCT_BRIEF.md`, and `GOAL_AND_ACCEPTANCE.md`:

- Free text input
- Course system / teaching flow / gamification
- Harness / test management UI
- Commercial / payment / account system
- Multi-language (Chinese only)
- Social / sharing features
- Prompt terminology teaching
- Backend / server-side logic
- Automated end-to-end tests (manual validation only)
- Persistent storage beyond localStorage (history lost on refresh)
- Real billing / quota deduction system
- Image editing / saving / export
- Responsive mobile layout
- API key encryption

## Mock vs Real Provider

| Aspect | Mock provider (dev default) | Real provider (OpenAI DALL-E 3) |
|--------|----------------------------|----------------------------------|
| Tested in this evidence | Yes — all walkthroughs | Failure path only (invalid key) |
| Image output | SVG placeholder with prompt text + counter | Real generated image |
| Latency | ~300ms simulated delay | Network-dependent |
| Error handling | Not applicable (mock never fails) | Friendly Chinese message + dev console detail |
| Activation | Default in `npm run dev` | Set `childcode_use_real_api=true` in localStorage |
