import { BLOCK_CATEGORIES, CATEGORY_LABELS, getRequiredCategories } from './whitelist'

/**
 * 从 Blockly workspace 导出 JSON 真相层
 *
 * 如果某类块缺失，对应字段为 null
 * 如果某类块重复，返回 duplicates 列表标记无效态
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
 * 检查是否有重复类别
 */
export function hasDuplicates(json) {
  return json.duplicates && json.duplicates.length > 0
}

/**
 * 获取重复类别的中文提示
 */
export function getDuplicateMessage(json) {
  if (!hasDuplicates(json)) return null
  const names = json.duplicates.map((type) => CATEGORY_LABELS[type] || type)
  return `${names.join('、')}积木重复了，请每类只保留一个`
}

/**
 * 检查 JSON 真相层是否必填类别齐全且无重复
 * 只检查 required 类别（tier 1 的四类），扩展类别为可选
 */
export function isComplete(json) {
  if (hasDuplicates(json)) return false
  const { blocks } = json
  const required = getRequiredCategories()
  return required.every((type) => blocks[type] !== null)
}
