/**
 * 从 JSON 真相层派生底层 prompt
 *
 * 规则（见 docs/V0_SCHEMA_AND_FLOW.md Section C）：
 * - 读取 subject、action、scene、style 四类核心信息
 * - 按固定模板组合成一句自然语言描述
 * - MVP 只使用这四类信息，不引入额外修饰
 */
export function derivePrompt(json) {
  const { blocks } = json
  const subject = blocks.subject?.label
  const action = blocks.action?.label
  const scene = blocks.scene?.label
  const style = blocks.style?.label

  if (!subject || !action || !scene || !style) {
    return null
  }

  return `${style}风格，${subject}在${scene}中${action}`
}
