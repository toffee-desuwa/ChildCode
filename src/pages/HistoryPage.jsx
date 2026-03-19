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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">{t('history.title')}</h2>
          <button
            onClick={() => navigate('/workspace')}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
          >
            {t('history.back')}
          </button>
        </header>

        {history.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-700 p-12 text-center text-slate-500">
            <p>{t('history.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {history.map((entry, i) => (
              <div key={entry.timestamp + '-' + i} className="rounded-xl bg-slate-800/60 border border-slate-700/50 overflow-hidden">
                <img src={entry.imageUrl} alt={t('history.imageAlt', { index: i + 1 })} className="w-full aspect-square object-cover" />
                <div className="p-3">
                  <span className="text-xs text-slate-500">{formatTime(entry.timestamp, lang)}</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {['subject', 'action', 'scene', 'style'].map((type) => {
                      const block = entry.json.blocks[type]
                      return block ? (
                        <span key={type} className="rounded-md bg-slate-700/60 px-2 py-0.5 text-xs">
                          <span className="text-slate-500">{t('blocks.category.' + type)} </span>
                          <span className="font-medium text-slate-300">{block.value ? t('blocks.option.' + block.value) : block.label}</span>
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
