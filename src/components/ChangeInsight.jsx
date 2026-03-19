import { memo } from 'react'
import { useI18n } from '../i18n'

/**
 * Change insight: shows what changed between two generations (from -> to)
 * Dark theme — renders inside WorkspacePage
 * @param {{ details: Array<{field: string, from: string, fromValue: string|null, to: string, toValue: string|null}> }} props
 */
const ChangeInsight = memo(function ChangeInsight({ details }) {
  const { t } = useI18n()

  if (!details || details.length === 0) return null

  return (
    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3 mb-4 animate-[fadeIn_0.3s_ease-in]">
      <h4 className="text-purple-300 font-semibold mb-2">{t('insight.title')}</h4>
      <ul className="space-y-1">
        {details.map(({ field, fromValue, toValue, from, to }) => (
          <li key={field} className="flex items-center gap-3 py-1">
            <span className="text-purple-400 font-bold min-w-[48px] text-sm">{t('blocks.category.' + field)}</span>
            <span className="flex items-center gap-2">
              <span className="text-slate-500 line-through text-sm">{fromValue ? t('blocks.option.' + fromValue) : from}</span>
              <span className="text-purple-400">{'\u2192'}</span>
              <span className="text-purple-200 font-bold text-sm">{toValue ? t('blocks.option.' + toValue) : to}</span>
            </span>
          </li>
        ))}
      </ul>
      {details.length === 1 && (
        <p className="text-emerald-400 font-semibold text-sm mt-2">
          {t('insight.singleTip', { category: t('blocks.category.' + details[0].field) })}
        </p>
      )}
    </div>
  )
})

export default ChangeInsight
