/**
 * Provider adapter 统一接口
 *
 * 业务层只调用 generateImage(prompt, config)
 * 切换 provider 只需在家长设置中选择，不改业务逻辑
 *
 * config: { apiKey: string, provider?: string, apiBase?: string }
 * 返回: { url: string } 或抛出错误
 */

/**
 * Mock provider — returns a deterministic SVG data URL placeholder.
 */
let mockCounter = 0

async function mockProvider(prompt) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  mockCounter++
  const label = `图 #${mockCounter}`
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
 * OpenAI DALL-E provider
 */
async function openaiProvider(prompt, config) {
  const base = config.apiBase || 'https://api.openai.com'
  const response = await fetch(`${base}/v1/images/generations`, {
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
  if (!url) throw new Error('API 未返回图片')
  return { url }
}

/**
 * OpenAI 兼容 provider（支持国内代理和 OpenAI 兼容 API）
 * 需要设置 apiBase，如 https://api.siliconflow.cn
 */
async function compatibleProvider(prompt, config) {
  const base = config.apiBase
  if (!base) throw new Error('兼容模式需要设置 API 地址')

  const response = await fetch(`${base}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
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
  const url = data?.data?.[0]?.url || data?.data?.[0]?.b64_json
  if (!url) throw new Error('API 未返回图片')

  // 如果返回的是 base64，转为 data URL
  if (url.length > 500 && !url.startsWith('http')) {
    return { url: `data:image/png;base64,${url}` }
  }
  return { url }
}

/**
 * 已注册的 provider 列表
 */
export const PROVIDERS = {
  openai: { label: 'OpenAI DALL-E', needsApiBase: false },
  compatible: { label: 'OpenAI 兼容 API（国内可用）', needsApiBase: true },
  mock: { label: 'Mock（仅测试）', needsApiBase: false },
}

const providerMap = {
  openai: openaiProvider,
  compatible: compatibleProvider,
  mock: mockProvider,
}

/**
 * 统一入口：generateImage(prompt, config)
 *
 * 开发模式默认使用 mock provider，不调用外部 API。
 * 生产模式根据 config.provider 选择 provider。
 */
export async function generateImage(prompt, config) {
  const useReal = localStorage.getItem('childcode_use_real_api') === 'true'

  if (import.meta.env.DEV && !useReal) {
    return mockProvider(prompt)
  }

  const providerName = config?.provider || 'openai'
  const fn = providerMap[providerName]
  if (!fn) throw new Error(`未知的 provider: ${providerName}`)
  return fn(prompt, config)
}
