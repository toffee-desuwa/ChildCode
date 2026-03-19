/**
 * Phase-aware guidance system
 * Returns guidance messages based on current workspace state.
 * Pure function, no side effects.
 *
 * @param {function} t - i18n translator function
 */
import { BLOCK_CATEGORIES, getRequiredCategories } from '../blocks/whitelist'
import { hasDuplicates } from '../blocks/exportJson'

const ALL_CATEGORIES = Object.keys(BLOCK_CATEGORIES)
const REQUIRED = getRequiredCategories()

/**
 * Determine phase and return guidance message
 * @param {object|null} currentJson - exportBlocksJson result
 * @param {object|null} snapshotA - first image snapshot
 * @param {object|null} snapshotB - second image snapshot
 * @param {string|null} cachedSuggestion - caller-cached suggested category to prevent flicker
 * @param {function} t - i18n translator function
 * @returns {{ phase: string, message: string|null, suggestedCategory?: string }}
 */
export function getGuidance(currentJson, snapshotA, snapshotB, cachedSuggestion, t) {
  // Initial state (currentJson is null on component mount)
  if (!currentJson) return { phase: 'empty', message: t('guidance.empty') }

  // Workspace cleared — all blocks null
  const allNull = ALL_CATEGORIES.every(c => !currentJson.blocks[c])
  if (allNull) return { phase: 'empty', message: t('guidance.empty') }

  // Duplicate blocks — let existing duplicate UI handle it
  if (hasDuplicates(currentJson)) return { phase: 'invalid', message: null }

  // Missing required categories
  const missing = REQUIRED.filter(c => !currentJson.blocks[c])
  if (missing.length > 0) {
    const names = missing.map(c => t('blocks.category.' + c)).join(', ')
    return { phase: 'incomplete', message: t('guidance.incomplete', { missing: names }) }
  }

  // All four required present, no first image yet
  if (!snapshotA) {
    return { phase: 'ready', message: t('guidance.ready') }
  }

  // Has first image, waiting for second
  if (!snapshotB) {
    const placed = ALL_CATEGORIES.filter(c => currentJson.blocks[c])
    const suggestion = cachedSuggestion || placed[Math.floor(Math.random() * placed.length)]
    return {
      phase: 'first-image',
      message: t('guidance.firstImage', { category: t('blocks.category.' + suggestion) }),
      suggestedCategory: suggestion,
    }
  }

  // Comparison phase — handled by existing comparison UI
  return { phase: 'comparing', message: null }
}

/**
 * Enhanced feedback for comparison phase (single block change = positive reinforcement)
 * @param {{ changedFields: string[], count: number }} comparison
 * @param {function} t - i18n translator function
 * @returns {string|null}
 */
export function getComparisonFeedback(comparison, t) {
  if (comparison.count === 1) {
    const category = t('blocks.category.' + comparison.changedFields[0])
    return t('guidance.comparisonFeedback', { category })
  }
  return null
}
