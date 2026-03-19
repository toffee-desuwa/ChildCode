const STORAGE_KEY = 'childcode_config'
const USAGE_COUNT_KEY = 'childcode_usage_count'

/**
 * Safe localStorage write (defends against quota overflow and security restrictions)
 */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    if (import.meta.env.DEV) {
      console.warn(`localStorage write failed for key: ${key}`)
    }
    return false
  }
}

/**
 * Safe localStorage key removal
 */
function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Silently ignore removal failures
  }
}

/**
 * Load config from localStorage
 * @returns {{ apiKey: string, usageLimit: number, ageTier?: string } | null}
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
 * Save config to localStorage
 */
export function saveConfig({ apiKey, usageLimit, ageTier, provider, apiBase }) {
  const data = { apiKey, usageLimit }
  if (ageTier) data.ageTier = ageTier
  if (provider) data.provider = provider
  if (apiBase) data.apiBase = apiBase
  safeSetItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Validate config fields
 * @returns {{ valid: boolean, errors: object }}
 */
export function validateConfig({ apiKey, usageLimit }) {
  const errors = {}

  if (!apiKey || apiKey.trim() === '') {
    errors.apiKey = 'API Key is required'
  }

  const limit = Number(usageLimit)
  if (!Number.isInteger(limit) || limit <= 0) {
    errors.usageLimit = 'Usage limit must be a positive integer'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Get config status summary
 * @returns {'not_configured' | 'configured' | 'invalid'}
 */
export function getConfigStatus() {
  const config = loadConfig()
  if (!config) return 'not_configured'
  const { valid } = validateConfig(config)
  return valid ? 'configured' : 'invalid'
}

/**
 * Get current usage count
 */
export function getUsageCount() {
  try {
    const raw = localStorage.getItem(USAGE_COUNT_KEY)
    const n = Number(raw)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

/**
 * Increment usage count by 1
 */
export function incrementUsage() {
  const count = getUsageCount() + 1
  safeSetItem(USAGE_COUNT_KEY, String(count))
  return count
}

/**
 * Check if usage quota is exhausted
 */
export function isQuotaExhausted() {
  const config = loadConfig()
  if (!config) return false
  return getUsageCount() >= config.usageLimit
}

/**
 * Reset usage count (parent action)
 */
export function resetUsageCount() {
  safeSetItem(USAGE_COUNT_KEY, '0')
}

// -- Expression history --

const HISTORY_KEY = 'childcode_history'
const MAX_HISTORY = 50

/**
 * Load creation history
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
 * Add a creation entry (newest first, max MAX_HISTORY entries)
 */
export function addHistoryEntry(json, imageUrl) {
  const history = loadHistory()
  history.unshift({
    json: JSON.parse(JSON.stringify(json)),
    imageUrl,
    timestamp: Date.now(),
  })
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
  safeSetItem(HISTORY_KEY, JSON.stringify(history))
}

/**
 * Clear creation history (parent action)
 */
export function clearHistory() {
  safeRemoveItem(HISTORY_KEY)
}

// -- Reusable templates --

const TEMPLATES_KEY = 'childcode_templates'
const MAX_TEMPLATES = 20

/**
 * Load saved template list
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
 * Save current block combination as a template
 * @returns {string} New template id
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
  safeSetItem(TEMPLATES_KEY, JSON.stringify(templates))
  return id
}

/**
 * Delete a template by id
 */
export function deleteTemplate(id) {
  const templates = loadTemplates().filter((t) => t.id !== id)
  safeSetItem(TEMPLATES_KEY, JSON.stringify(templates))
}

/**
 * Get a template by id
 */
export function getTemplate(id) {
  return loadTemplates().find((t) => t.id === id) || null
}

// -- Storyboard (multi-step creation) --

const STORYBOARD_KEY = 'childcode_storyboard'
const MAX_FRAMES = 8

/**
 * Load current storyboard
 * @returns {Array<{id: string, json: object, imageUrl: string, addedAt: number}>}
 */
export function loadStoryboard() {
  try {
    const raw = localStorage.getItem(STORYBOARD_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Add a frame to the end of the storyboard
 * @returns {boolean} Whether successful (may be full)
 */
export function addStoryboardFrame(json, imageUrl) {
  const frames = loadStoryboard()
  if (frames.length >= MAX_FRAMES) return false
  frames.push({
    id: Date.now().toString(36),
    json: JSON.parse(JSON.stringify(json)),
    imageUrl,
    addedAt: Date.now(),
  })
  safeSetItem(STORYBOARD_KEY, JSON.stringify(frames))
  return true
}

/**
 * Remove a frame from the storyboard
 */
export function removeStoryboardFrame(id) {
  const frames = loadStoryboard().filter((f) => f.id !== id)
  safeSetItem(STORYBOARD_KEY, JSON.stringify(frames))
}

/**
 * Reorder storyboard frames
 * @param {string[]} orderedIds - IDs in desired order
 */
export function reorderStoryboard(orderedIds) {
  const frames = loadStoryboard()
  const map = Object.fromEntries(frames.map((f) => [f.id, f]))
  const reordered = orderedIds.map((id) => map[id]).filter(Boolean)
  safeSetItem(STORYBOARD_KEY, JSON.stringify(reordered))
}

/**
 * Clear storyboard
 */
export function clearStoryboard() {
  safeRemoveItem(STORYBOARD_KEY)
}

/**
 * Storyboard max frame count
 */
export const STORYBOARD_MAX_FRAMES = MAX_FRAMES

// -- Control feeling mastery --

const MASTERY_KEY = 'childcode_mastery'

/**
 * Load mastery statistics
 * @returns {{ singleChanges: number, totalComparisons: number }}
 */
export function loadMastery() {
  try {
    const raw = localStorage.getItem(MASTERY_KEY)
    return raw ? JSON.parse(raw) : { singleChanges: 0, totalComparisons: 0 }
  } catch {
    return { singleChanges: 0, totalComparisons: 0 }
  }
}

/**
 * Check if this is a first-time user (no creation history)
 */
export function isFirstTimeUser() {
  return loadHistory().length === 0
}

/**
 * Record a comparison (distinguishes single vs multi block changes)
 */
export function recordComparison(changedCount) {
  const mastery = loadMastery()
  mastery.totalComparisons += 1
  if (changedCount === 1) mastery.singleChanges += 1
  safeSetItem(MASTERY_KEY, JSON.stringify(mastery))
  return mastery
}
