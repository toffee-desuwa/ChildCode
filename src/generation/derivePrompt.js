/**
 * 从 JSON 真相层派生底层 prompt
 *
 * 规则：
 * - 必填四类（subject、action、scene、style）缺一不可
 * - 可选类（emotion、weather、time）存在则追加到 prompt
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

  // 基础 prompt
  let prompt = `${style}风格，${subject}在${scene}中${action}`

  // 可选修饰
  const extras = []
  if (blocks.emotion?.label) extras.push(`表情${blocks.emotion.label}`)
  if (blocks.weather?.label) extras.push(`${blocks.weather.label}`)
  if (blocks.time?.label) extras.push(`${blocks.time.label}时分`)

  if (extras.length > 0) {
    prompt += `，${extras.join('，')}`
  }

  return prompt
}
