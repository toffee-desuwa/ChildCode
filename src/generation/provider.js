/**
 * Provider adapter — unified interface for image generation.
 *
 * Business layer calls generateImage(prompt, config) only.
 * Switching provider is done in parent settings, no business logic change.
 *
 * config: { apiKey: string, provider?: string, apiBase?: string }
 * Returns: { url: string } or throws an error
 */

const FETCH_TIMEOUT_MS = 30000

/**
 * Mock provider — returns a deterministic SVG data URL placeholder.
 */
let mockCounter = 0

async function mockProvider(prompt) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  mockCounter++
  const label = `#${mockCounter}`
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
 * Shared OpenAI-compatible fetch (used by openai and compatible providers)
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
      throw new Error('Request timed out — check your network or API address')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message = errorBody?.error?.message || `API request failed (${response.status})`
    throw new Error(message)
  }

  const data = await response.json()
  const url = data?.data?.[0]?.url || data?.data?.[0]?.b64_json
  if (!url) throw new Error('API returned no image')

  // Convert base64 to data URL if needed
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
 * OpenAI-compatible provider (supports proxies and compatible APIs)
 * Requires apiBase, e.g. https://api.siliconflow.cn
 */
async function compatibleProvider(prompt, config) {
  if (!config.apiBase) throw new Error('Compatible mode requires an API address')
  return fetchImageGeneration(prompt, config, { baseUrl: config.apiBase, model: null })
}

/**
 * Registered provider list
 */
export const PROVIDERS = {
  openai: { label: 'OpenAI DALL-E', needsApiBase: false },
  compatible: { label: 'OpenAI Compatible API', needsApiBase: true },
  mock: { label: 'Mock (testing only)', needsApiBase: false },
}

const providerMap = {
  openai: openaiProvider,
  compatible: compatibleProvider,
  mock: mockProvider,
}

/**
 * Unified entry: generateImage(prompt, config)
 *
 * Dev mode defaults to mock provider (no external API calls).
 * Production mode uses the provider selected in config.
 */
export async function generateImage(prompt, config) {
  const useReal = localStorage.getItem('childcode_use_real_api') === 'true'

  if (import.meta.env.DEV && !useReal) {
    return mockProvider(prompt)
  }

  const providerName = config?.provider || 'openai'
  const fn = providerMap[providerName]
  if (!fn) throw new Error(`Unknown provider: ${providerName}`)
  return fn(prompt, config)
}
