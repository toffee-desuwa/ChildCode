import { memo } from 'react'
import { useI18n } from '../i18n'

/**
 * Change insight: shows what changed between two generations (from → to)
 * @param {{ details: Array<{field: string, from: string, fromValue: string|null, to: string, toValue: string|null}> }} props
 */
const ChangeInsight = memo(function ChangeInsight({ details }) {
  const { t } = useI18n()

  if (!details || details.length === 0) return null

  return (
    <div className="change-insight">
      <h4 className="change-insight-title">{t('insight.title')}</h4>
      <ul className="change-insight-list">
        {details.map(({ field, fromValue, toValue, from, to }) => (
          <li key={field} className="change-insight-item">
            <span className="change-insight-category">{t('blocks.category.' + field)}</span>
            <span className="change-insight-flow">
              <span className="change-insight-old">{fromValue ? t('blocks.option.' + fromValue) : from}</span>
              <span className="change-insight-arrow">{'\u2192'}</span>
              <span className="change-insight-new">{toValue ? t('blocks.option.' + toValue) : to}</span>
            </span>
          </li>
        ))}
      </ul>
      {details.length === 1 && (
        <p className="change-insight-tip">
          {t('insight.singleTip', { category: t('blocks.category.' + details[0].field) })}
        </p>
      )}
    </div>
  )
})

export default ChangeInsight
