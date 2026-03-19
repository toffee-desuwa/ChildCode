import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadHistory } from '../config/storage'
import { useI18n } from '../i18n'

/**
 * Format timestamp to locale-appropriate short date string
 */
function formatTime(ts, lang) {
  const d = new Date(ts)
  if (lang === 'zh') {
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hour = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${month}月${day}日 ${hour}:${min}`
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const [history] = useState(() => loadHistory())

  return (
    <div className="page history-page">
      <header className="workspace-header">
        <h2>{t('history.title')}</h2>
        <button onClick={() => navigate('/workspace')} className="secondary">
          {t('history.back')}
        </button>
      </header>

      {history.length === 0 ? (
        <div className="placeholder-box">
          <p>{t('history.empty')}</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((entry, i) => (
            <div key={entry.timestamp + '-' + i} className="history-card">
              <img src={entry.imageUrl} alt={t('history.imageAlt', { index: i + 1 })} className="history-image" />
              <div className="history-meta">
                <span className="history-time">{formatTime(entry.timestamp, lang)}</span>
                <ul className="history-blocks">
                  {['subject', 'action', 'scene', 'style'].map((type) => {
                    const block = entry.json.blocks[type]
                    return block ? (
                      <li key={type}>
                        <span className="history-block-type">{t('blocks.category.' + type)}</span>
                        <span className="history-block-value">{block.value ? t('blocks.option.' + block.value) : block.label}</span>
                      </li>
                    ) : null
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
