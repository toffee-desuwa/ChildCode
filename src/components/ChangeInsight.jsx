import { memo } from 'react'
import { CATEGORY_LABELS } from '../blocks/whitelist'

/**
 * 变化洞察：明确告诉孩子改了什么、从什么变成什么
 * @param {{ details: Array<{field: string, from: string, to: string}> }} props
 */
const ChangeInsight = memo(function ChangeInsight({ details }) {
  if (!details || details.length === 0) return null

  return (
    <div className="change-insight">
      <h4 className="change-insight-title">你做了什么改变？</h4>
      <ul className="change-insight-list">
        {details.map(({ field, from, to }) => (
          <li key={field} className="change-insight-item">
            <span className="change-insight-category">{CATEGORY_LABELS[field]}</span>
            <span className="change-insight-flow">
              <span className="change-insight-old">{from}</span>
              <span className="change-insight-arrow">→</span>
              <span className="change-insight-new">{to}</span>
            </span>
          </li>
        ))}
      </ul>
      {details.length === 1 && (
        <p className="change-insight-tip">
          只改了一个积木，画面就不一样了！这就是「{CATEGORY_LABELS[details[0].field]}」的影响力
        </p>
      )}
    </div>
  )
})

export default ChangeInsight
