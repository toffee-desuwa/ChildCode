import { memo } from 'react'
import { useI18n } from '../i18n'

/**
 * Control feeling components — dark theme, render inside WorkspacePage:
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

const MASTERY_COLORS = [
  { border: 'border-blue-400/50', text: 'text-blue-300' },
  { border: 'border-emerald-400/50', text: 'text-emerald-300' },
  { border: 'border-amber-400/50', text: 'text-amber-300' },
  { border: 'border-purple-400/50', text: 'text-purple-300' },
]

/**
 * Prediction hint — shown when A exists and block changes detected
 */
export const PredictionHint = memo(function PredictionHint({ changedFields }) {
  const { t } = useI18n()

  if (!changedFields || changedFields.length === 0) return null

  const names = changedFields.map((f) => t('blocks.category.' + f)).join(', ')

  return (
    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-4 py-2.5 mt-2 text-indigo-300 font-semibold text-sm animate-[fadeIn_0.3s_ease-out]">
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
  const colors = MASTERY_COLORS[levelIdx]
  const label = t('mastery.level.' + levelIdx)

  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 border-2 rounded-full bg-slate-800/50 mb-3 ${colors.border}`}>
      <span className={`font-bold text-sm ${colors.text}`}>{label}</span>
      <span className="text-xs text-slate-400">{t('mastery.count', { count: mastery.singleChanges })}</span>
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
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2.5 mb-3 font-semibold text-sm text-emerald-300 animate-[fadeIn_0.3s_ease-out]">
        <p>{t('reflection.single.' + idx, { category, from: fromLabel, to: toLabel })}</p>
      </div>
    )
  }

  // Multi block change: encourage focus
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2.5 mb-3 font-semibold text-sm text-amber-300 animate-[fadeIn_0.3s_ease-out]">
      <p>{t('reflection.multi', { count: details.length })}</p>
    </div>
  )
})
