/**
 * Provider adapter 统一接口
 *
 * 业务层只调用 generateImage(prompt, config)
 * 切换 provider 只需替换此文件中的实现，不改业务逻辑
 *
 * config: { apiKey: string }
 * 返回: { url: string } 或抛出错误
 */

/**
 * Mock provider — returns a deterministic SVG data URL placeholder.
 * The SVG includes the prompt text and a unique timestamp so that
 * image A and image B are visually distinguishable.
 */
let mockCounter = 0

async function mockProvider(prompt) {
  // Simulate a short network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  mockCounter++
  const label = `图 #${mockCounter}`
  // Use different background hues so A and B are visually distinct
  const hue = (mockCounter * 67) % 360

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="hsl(${hue}, 60%, 85%)" />
  <text x="256" y="180" text-anchor="middle" font-size="48" font-family="sans-serif" fill="#333">${label}</text>
  <text x="256" y="280" text-anchor="middle" font-size="20" font-family="sans-serif" fill="#555" textLength="440" lengthAdjust="spacingAndGlyphs">${escapeXml(prompt)}</text>
  <text x="256" y="440" text-anchor="middle" font-size="14" font-family="monospace" fill="#999">mock · ${new Date().toLocaleTimeString()}</text>
</svg>`.trim()

  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  return { url }
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * OpenAI DALL-E provider adapter
 */
async function openaiProvider(prompt, config) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    }),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message = errorBody?.error?.message || `API 请求失败 (${response.status})`
    throw new Error(message)
  }

  const data = await response.json()
  const url = data?.data?.[0]?.url
  if (!url) {
    throw new Error('API 未返回图片')
  }

  return { url }
}

/**
 * 统一入口：generateImage(prompt, config)
 * 业务层通过此函数调用，不直接绑定具体 provider
 *
 * 开发模式默认使用 mock provider，不调用外部 API。
 * 生产模式或 localStorage 中设置了 childcode_use_real_api=true 时使用 OpenAI。
 */
export async function generateImage(prompt, config) {
  const useReal = localStorage.getItem('childcode_use_real_api') === 'true'

  if (import.meta.env.DEV && !useReal) {
    return mockProvider(prompt)
  }
  return openaiProvider(prompt, config)
}
