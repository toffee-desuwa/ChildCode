/**
 * 对比两个 JSON 真相层快照，返回变化的字段列表
 *
 * @param {object} jsonA - 第一次生成时的 JSON
 * @param {object} jsonB - 第二次生成时的 JSON
 * @returns {{ changedFields: string[], count: number }}
 */
const BLOCK_TYPES = ['subject', 'action', 'scene', 'style']

export function diffBlocks(jsonA, jsonB) {
  const changedFields = BLOCK_TYPES.filter(
    (type) => jsonA.blocks[type]?.value !== jsonB.blocks[type]?.value
  )
  return { changedFields, count: changedFields.length }
}
