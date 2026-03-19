/**
 * Derive image generation prompt from JSON truth layer
 *
 * Rules:
 * - Core four (subject, action, scene, style) are all required
 * - Optional categories (emotion, weather, time) appended when present
 * - Prompt is always in English for best AI image generation results
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

  // Base prompt in English
  let prompt = `${style} style, ${subject} ${action} in ${scene}`

  // Optional modifiers
  const extras = []
  if (blocks.emotion?.label) extras.push(`looking ${blocks.emotion.label}`)
  if (blocks.weather?.label) extras.push(`${blocks.weather.label} weather`)
  if (blocks.time?.label) extras.push(`at ${blocks.time.label}`)

  if (extras.length > 0) {
    prompt += `, ${extras.join(', ')}`
  }

  return prompt
}
