import { BLOCK_CATEGORIES, getRequiredCategories } from './whitelist'

/**
 * Export JSON truth layer from Blockly workspace
 *
 * Missing category fields are null.
 * Duplicate categories are listed in the duplicates array.
 */
export function exportBlocksJson(workspace) {
  const allBlocks = workspace.getAllBlocks(false)
  const validTypes = Object.keys(BLOCK_CATEGORIES)

  const counts = {}
  const blocks = {}
  for (const type of validTypes) {
    blocks[type] = null
    counts[type] = 0
  }

  for (const block of allBlocks) {
    const type = block.type
    if (!validTypes.includes(type)) continue

    counts[type]++

    const value = block.getFieldValue('VALUE')
    const category = BLOCK_CATEGORIES[type]
    const option = category.options.find(([, v]) => v === value)
    const label = option ? option[0] : value

    blocks[type] = { value, label }
  }

  const duplicates = validTypes.filter((type) => counts[type] > 1)

  return {
    version: 'v0',
    blocks,
    duplicates,
  }
}

/**
 * Check if there are duplicate categories
 */
export function hasDuplicates(json) {
  return json.duplicates && json.duplicates.length > 0
}

/**
 * Get duplicate category message
 * @param {object} json - exported blocks JSON
 * @param {function} [t] - optional i18n translator function
 */
export function getDuplicateMessage(json, t) {
  if (!hasDuplicates(json)) return null
  const names = json.duplicates
    .map((type) => t ? t('blocks.category.' + type) : BLOCK_CATEGORIES[type]?.label || type)
    .join(t ? ', ' : ', ')
  if (t) {
    return t('blocks.duplicateMsg', { names })
  }
  return `${names} blocks are duplicated \u2014 please keep only one of each`
}

/**
 * Check if JSON truth layer has all required categories and no duplicates
 */
export function isComplete(json) {
  if (hasDuplicates(json)) return false
  const { blocks } = json
  const required = getRequiredCategories()
  return required.every((type) => blocks[type] !== null)
}
