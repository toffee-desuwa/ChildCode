/**
 * Provider adapter 统一接口
 *
 * 业务层只调用 generateImage(prompt, config)
 * 切换 provider 只需在家长设置中选择，不改业务逻辑
 *
 * config: { apiKey: string, provider?: string, apiBase?: string }
 * 返回: { url: string } 或抛出错误
 */

const FETCH_TIMEOUT_MS = 30000

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
 * 通用 OpenAI 兼容 fetch（openai 和 compatible 共用）
 * @param {string} prompt
 * @param {object} config
 * @param {object} options - { baseUrl, model }
 */
async function fetchImageGeneration(prompt, config, { baseUrl, model }) {
  const body = { prompt, n: 1, size: '1024x1024' }
  if (model) body.model = model

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let response
  try {
    response = await fetch(`${baseUrl}/v1/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('请求超时，请检查网络或 API 地址')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }

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
 * OpenAI DALL-E provider
 */
async function openaiProvider(prompt, config) {
  const baseUrl = config.apiBase || 'https://api.openai.com'
  return fetchImageGeneration(prompt, config, { baseUrl, model: 'dall-e-3' })
}

/**
 * OpenAI 兼容 provider（支持国内代理和 OpenAI 兼容 API）
 * 需要设置 apiBase，如 https://api.siliconflow.cn
 */
async function compatibleProvider(prompt, config) {
  if (!config.apiBase) throw new Error('兼容模式需要设置 API 地址')
  return fetchImageGeneration(prompt, config, { baseUrl: config.apiBase, model: null })
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
