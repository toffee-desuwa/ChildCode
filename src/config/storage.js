const STORAGE_KEY = 'childcode_config'

/**
 * 从 localStorage 读取配置
 * 返回 { apiKey, usageLimit } 或 null
 */
export function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed.apiKey || !parsed.usageLimit) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * 保存配置到 localStorage
 */
export function saveConfig({ apiKey, usageLimit }) {
  const data = { apiKey, usageLimit }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * 校验配置字段
 * 返回 { valid, errors }
 */
export function validateConfig({ apiKey, usageLimit }) {
  const errors = {}

  if (!apiKey || apiKey.trim() === '') {
    errors.apiKey = 'API Key 不能为空'
  }

  const limit = Number(usageLimit)
  if (!Number.isInteger(limit) || limit <= 0) {
    errors.usageLimit = '使用额度必须是正整数'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * 获取配置状态摘要
 * 返回 'not_configured' | 'configured' | 'invalid'
 */
export function getConfigStatus() {
  const config = loadConfig()
  if (!config) return 'not_configured'
  const { valid } = validateConfig(config)
  return valid ? 'configured' : 'invalid'
}
