const STORAGE_KEY = 'childcode_config'
const USAGE_COUNT_KEY = 'childcode_usage_count'

/**
 * 从 localStorage 读取配置
 * 返回 { apiKey, usageLimit, ageTier? } 或 null
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
export function saveConfig({ apiKey, usageLimit, ageTier }) {
  const data = { apiKey, usageLimit }
  if (ageTier) data.ageTier = ageTier
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

/**
 * 获取已使用次数
 */
export function getUsageCount() {
  const raw = localStorage.getItem(USAGE_COUNT_KEY)
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/**
 * 已使用次数 +1
 */
export function incrementUsage() {
  const count = getUsageCount() + 1
  localStorage.setItem(USAGE_COUNT_KEY, String(count))
  return count
}

/**
 * 检查额度是否已用完
 */
export function isQuotaExhausted() {
  const config = loadConfig()
  if (!config) return false
  return getUsageCount() >= config.usageLimit
}

/**
 * 重置已使用次数（家长操作）
 */
export function resetUsageCount() {
  localStorage.setItem(USAGE_COUNT_KEY, '0')
}

// ── 表达历史 ──

const HISTORY_KEY = 'childcode_history'
const MAX_HISTORY = 50

/**
 * 读取创作历史
 * @returns {Array<{json: object, imageUrl: string, timestamp: number}>}
 */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * 添加一条创作记录（最新在前，最多保留 MAX_HISTORY 条）
 */
export function addHistoryEntry(json, imageUrl) {
  const history = loadHistory()
  history.unshift({
    json: JSON.parse(JSON.stringify(json)),
    imageUrl,
    timestamp: Date.now(),
  })
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

/**
 * 清空创作历史（家长操作）
 */
export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

// ── 可复用模板 ──

const TEMPLATES_KEY = 'childcode_templates'
const MAX_TEMPLATES = 20

/**
 * 读取已保存的模板列表
 * @returns {Array<{id: string, name: string, blocks: object, createdAt: number}>}
 */
export function loadTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * 保存当前积木组合为模板
 * @returns {string} 新模板的 id
 */
export function saveTemplate(name, blocks) {
  const templates = loadTemplates()
  const id = Date.now().toString(36)
  templates.unshift({
    id,
    name,
    blocks: JSON.parse(JSON.stringify(blocks)),
    createdAt: Date.now(),
  })
  if (templates.length > MAX_TEMPLATES) templates.length = MAX_TEMPLATES
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
  return id
}

/**
 * 删除指定模板
 */
export function deleteTemplate(id) {
  const templates = loadTemplates().filter((t) => t.id !== id)
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
}

/**
 * 获取指定模板
 */
export function getTemplate(id) {
  return loadTemplates().find((t) => t.id === id) || null
}
