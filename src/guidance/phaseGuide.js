/**
 * 阶段感知引导系统
 * 根据当前 workspace 状态返回引导信息，纯函数，无副作用
 */
import { BLOCK_CATEGORIES, CATEGORY_LABELS, getRequiredCategories } from '../blocks/whitelist'
import { hasDuplicates } from '../blocks/exportJson'

const ALL_CATEGORIES = Object.keys(BLOCK_CATEGORIES)
const REQUIRED = getRequiredCategories()

/**
 * 根据当前状态判定阶段并返回引导信息
 * @param {object|null} currentJson - exportBlocksJson 返回值
 * @param {object|null} snapshotA - 第一张图快照
 * @param {object|null} snapshotB - 第二张图快照
 * @param {string|null} cachedSuggestion - 调用方缓存的建议类别，防闪烁
 * @returns {{ phase: string, message: string|null, suggestedCategory?: string }}
 */
export function getGuidance(currentJson, snapshotA, snapshotB, cachedSuggestion) {
  // 初始状态（组件 mount 时 currentJson 为 null）
  if (!currentJson) return { phase: 'empty', message: '从左边的工具箱拖几个积木过来试试！' }

  // workspace 清空所有积木后，blocks 全为 null
  const allNull = ALL_CATEGORIES.every(c => !currentJson.blocks[c])
  if (allNull) return { phase: 'empty', message: '从左边的工具箱拖几个积木过来试试！' }

  // 重复积木 — 不显示引导，让现有 duplicate UI 处理
  if (hasDuplicates(currentJson)) return { phase: 'invalid', message: null }

  // 未凑齐必填四类
  const missing = REQUIRED.filter(c => !currentJson.blocks[c])
  if (missing.length > 0) {
    const names = missing.map(c => CATEGORY_LABELS[c])
    return { phase: 'incomplete', message: `还差${names.join('、')}就齐了！` }
  }

  // 四类齐全，未生成第一张图
  if (!snapshotA) {
    return { phase: 'ready', message: '准备好了！点「生成图片」看看你的积木会变成什么画' }
  }

  // 已有第一张图，等待第二张
  if (!snapshotB) {
    // 建议改任意已放置的类别
    const placed = ALL_CATEGORIES.filter(c => currentJson.blocks[c])
    const suggestion = cachedSuggestion || placed[Math.floor(Math.random() * placed.length)]
    return {
      phase: 'first-image',
      message: `试试只改一个积木，看看画会怎么变？比如换个${CATEGORY_LABELS[suggestion]}？`,
      suggestedCategory: suggestion,
    }
  }

  // 对比阶段 — 由现有 comparison UI 处理
  return { phase: 'comparing', message: null }
}

/**
 * 对比阶段的增强反馈（单块变化时给正面强化）
 * @param {{ changedFields: string[], count: number }} comparison
 * @returns {string|null}
 */
export function getComparisonFeedback(comparison) {
  if (comparison.count === 1) {
    const category = CATEGORY_LABELS[comparison.changedFields[0]]
    return `你只改了「${category}」，看看画面变化！这就是这个积木的力量`
  }
  return null
}
