import { memo } from 'react'
import { useI18n } from '../i18n'

/**
 * Control feeling components:
 * 1. PredictionHint — before generation, prompts "you changed X, guess what happens?"
 * 2. MasteryBadge — shows growth based on single-block comparison count
 * 3. ControlReflection — after comparison, gives causal feedback
 */

// Mastery level thresholds
const MASTERY_THRESHOLDS = [0, 3, 8, 15]

function getMasteryLevelIndex(singleChanges) {
  for (let i = MASTERY_THRESHOLDS.length - 1; i >= 0; i--) {
    if (singleChanges >= MASTERY_THRESHOLDS[i]) return i
  }
  return 0
}

const MASTERY_COLORS = ['#90caf9', '#66bb6a', '#ffa726', '#ab47bc']

/**
 * Prediction hint — shown when A exists and block changes detected
 */
export const PredictionHint = memo(function PredictionHint({ changedFields }) {
  const { t } = useI18n()

  if (!changedFields || changedFields.length === 0) return null

  const names = changedFields.map((f) => t('blocks.category.' + f)).join(', ')

  return (
    <div className="prediction-hint">
      <p>{t('prediction.hint', { names })}</p>
    </div>
  )
})

/**
 * Mastery badge — shows growth level
 */
export const MasteryBadge = memo(function MasteryBadge({ mastery }) {
  const { t } = useI18n()

  if (!mastery || mastery.totalComparisons === 0) return null

  const levelIdx = getMasteryLevelIndex(mastery.singleChanges)
  const color = MASTERY_COLORS[levelIdx]
  const label = t('mastery.level.' + levelIdx)

  return (
    <div className="mastery-badge" style={{ borderColor: color }}>
      <span className="mastery-label" style={{ color }}>{label}</span>
      <span className="mastery-count">{t('mastery.count', { count: mastery.singleChanges })}</span>
    </div>
  )
})

/**
 * Enhanced reflection — causal feedback after comparison
 */
export const ControlReflection = memo(function ControlReflection({ details, mastery }) {
  const { t } = useI18n()

  if (!details || details.length === 0) return null

  // Single block change: strong causal feedback (rotating messages)
  if (details.length === 1) {
    const { field, fromValue, toValue, from, to } = details[0]
    const category = t('blocks.category.' + field)
    const fromLabel = fromValue ? t('blocks.option.' + fromValue) : from
    const toLabel = toValue ? t('blocks.option.' + toValue) : to
    const idx = mastery ? mastery.singleChanges % 3 : 0

    return (
      <div className="control-reflection control-reflection-single">
        <p>{t('reflection.single.' + idx, { category, from: fromLabel, to: toLabel })}</p>
      </div>
    )
  }

  // Multi block change: encourage focus
  return (
    <div className="control-reflection control-reflection-multi">
      <p>{t('reflection.multi', { count: details.length })}</p>
    </div>
  )
})
