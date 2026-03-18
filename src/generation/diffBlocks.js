/**
 * 对比两个 JSON 真相层快照，返回变化的字段列表及变化详情
 *
 * @param {object} jsonA - 第一次生成时的 JSON
 * @param {object} jsonB - 第二次生成时的 JSON
 * @returns {{ changedFields: string[], count: number, details: Array<{field: string, from: string, to: string}> }}
 */
const BLOCK_TYPES = ['subject', 'action', 'scene', 'style']

export function diffBlocks(jsonA, jsonB) {
  const changedFields = []
  const details = []

  for (const type of BLOCK_TYPES) {
    const a = jsonA.blocks[type]
    const b = jsonB.blocks[type]
    if (a?.value !== b?.value) {
      changedFields.push(type)
      details.push({
        field: type,
        from: a?.label ?? '—',
        to: b?.label ?? '—',
      })
    }
  }

  return { changedFields, count: changedFields.length, details }
}
