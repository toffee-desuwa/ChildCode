import { memo } from 'react'
import { CATEGORY_LABELS } from '../blocks/whitelist'

/**
 * 控制感体验组件
 * 1. 预测提示：生成前让孩子思考"改了X，画面会怎么变"
 * 2. 掌握度徽章：基于单块变化次数展示成长
 * 3. 增强反馈：对比后给出因果连接更强的反馈
 */

// 掌握度等级
const MASTERY_LEVELS = [
  { min: 0, label: '小探索者', color: '#90caf9' },
  { min: 3, label: '表达学徒', color: '#66bb6a' },
  { min: 8, label: '积木达人', color: '#ffa726' },
  { min: 15, label: '控制大师', color: '#ab47bc' },
]

function getMasteryLevel(singleChanges) {
  for (let i = MASTERY_LEVELS.length - 1; i >= 0; i--) {
    if (singleChanges >= MASTERY_LEVELS[i].min) return MASTERY_LEVELS[i]
  }
  return MASTERY_LEVELS[0]
}

/**
 * 预测提示 — 在有 A 且检测到积木变化时显示
 */
export const PredictionHint = memo(function PredictionHint({ changedFields }) {
  if (!changedFields || changedFields.length === 0) return null

  const names = changedFields.map((f) => CATEGORY_LABELS[f]).join('、')

  return (
    <div className="prediction-hint">
      <p>
        你改了「{names}」—— 猜猜画面会怎么变？
      </p>
    </div>
  )
})

/**
 * 掌握度徽章 — 展示孩子的成长
 */
export const MasteryBadge = memo(function MasteryBadge({ mastery }) {
  if (!mastery || mastery.totalComparisons === 0) return null

  const level = getMasteryLevel(mastery.singleChanges)

  return (
    <div className="mastery-badge" style={{ borderColor: level.color }}>
      <span className="mastery-label" style={{ color: level.color }}>{level.label}</span>
      <span className="mastery-count">已完成 {mastery.singleChanges} 次精准对比</span>
    </div>
  )
})

/**
 * 增强反馈 — 对比后给出更强的因果连接
 */
export const ControlReflection = memo(function ControlReflection({ details, mastery }) {
  if (!details || details.length === 0) return null

  // 单块变化：强因果反馈
  if (details.length === 1) {
    const { field, from, to } = details[0]
    const category = CATEGORY_LABELS[field]
    const messages = [
      `你把「${category}」从"${from}"换成了"${to}"，画面的变化就来自这一个改动！`,
      `只动了「${category}」这一块，画面就不一样了——你正在学会精确控制 AI！`,
      `"${from}"→"${to}"，一个积木的变化，一幅不同的画。你掌握了「${category}」的力量！`,
    ]
    // 根据掌握度选不同的话
    const idx = mastery ? mastery.singleChanges % messages.length : 0

    return (
      <div className="control-reflection control-reflection-single">
        <p>{messages[idx]}</p>
      </div>
    )
  }

  // 多块变化：鼓励聚焦
  return (
    <div className="control-reflection control-reflection-multi">
      <p>
        这次你改了 {details.length} 个积木。变化很大对吧？
        试试下次只改一个，更容易看清每个积木的力量！
      </p>
    </div>
  )
})
