/**
 * Demo image matching system.
 *
 * Maps block combinations to pre-rendered images stored in public/demo-images/.
 * Used in mock mode to return realistic results instead of generic SVG placeholders.
 *
 * Key generation: extract core four block values (subject, action, scene, style),
 * sort alphabetically, and join with '-'.
 */

import imageMapData from './imageMap.json'

const DEMO_IMAGE_BASE = '/demo-images/'

/**
 * Generate a lookup key from block JSON.
 * @param {object} json - block JSON from exportBlocksJson (has blocks.subject, etc.)
 * @returns {string|null} sorted key or null if incomplete
 */
export function buildDemoKey(json) {
  const { blocks } = json
  const values = [
    blocks.subject?.value,
    blocks.action?.value,
    blocks.scene?.value,
    blocks.style?.value,
  ]
  if (values.some((v) => !v)) return null
  return values.sort().join('-')
}

/**
 * Look up a pre-rendered demo image for the given block combination.
 * @param {object} json - block JSON
 * @returns {{ url: string, label: string } | null} match or null
 */
export function findDemoImage(json) {
  const key = buildDemoKey(json)
  if (!key) return null

  const entry = imageMapData.entries[key]
  if (!entry) return null

  return {
    url: `${DEMO_IMAGE_BASE}${entry.file}`,
    label: entry.label,
  }
}

/**
 * Find the closest demo image by counting shared block values.
 * Returns the best match (most shared values) or null if no entries exist.
 * @param {object} json - block JSON
 * @returns {{ url: string, label: string, sharedCount: number } | null}
 */
export function findClosestDemoImage(json) {
  const { blocks } = json
  const currentValues = new Set(
    [blocks.subject?.value, blocks.action?.value, blocks.scene?.value, blocks.style?.value]
      .filter(Boolean)
  )

  if (currentValues.size === 0) return null

  const entries = Object.entries(imageMapData.entries)
  if (entries.length === 0) return null

  let bestMatch = null
  let bestScore = 0

  for (const [key, entry] of entries) {
    const keyValues = key.split('-')
    const shared = keyValues.filter((v) => currentValues.has(v)).length
    if (shared > bestScore) {
      bestScore = shared
      bestMatch = { url: `${DEMO_IMAGE_BASE}${entry.file}`, label: entry.label, sharedCount: shared }
    }
  }

  return bestMatch
}

/**
 * Get all demo image entries (for carousel use).
 * @returns {Array<{ key: string, url: string, label: string }>}
 */
export function getAllDemoImages() {
  return Object.entries(imageMapData.entries).map(([key, entry]) => ({
    key,
    url: `${DEMO_IMAGE_BASE}${entry.file}`,
    label: entry.label,
  }))
}
