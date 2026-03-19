/**
 * Compare two JSON truth layer snapshots, return changed fields and details.
 *
 * @param {object} jsonA - first generation JSON
 * @param {object} jsonB - second generation JSON
 * @returns {{ changedFields: string[], count: number, details: Array<{field: string, from: string, fromValue: string|null, to: string, toValue: string|null}> }}
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
        from: a?.label ?? '\u2014',
        fromValue: a?.value ?? null,
        to: b?.label ?? '\u2014',
        toValue: b?.value ?? null,
      })
    }
  }

  return { changedFields, count: changedFields.length, details }
}
