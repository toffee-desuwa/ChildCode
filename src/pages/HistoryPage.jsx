import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadHistory } from '../config/storage'
import { CATEGORY_LABELS } from '../blocks/whitelist'

/**
 * 格式化时间戳为简短日期字符串
 */
function formatTime(ts) {
  const d = new Date(ts)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hour}:${min}`
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [history] = useState(() => loadHistory())

  return (
    <div className="page history-page">
      <header className="workspace-header">
        <h2>我的创作历史</h2>
        <button onClick={() => navigate('/workspace')} className="secondary">
          返回创作
        </button>
      </header>

      {history.length === 0 ? (
        <div className="placeholder-box">
          <p>还没有创作记录，去创作区试试吧！</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((entry, i) => (
            <div key={entry.timestamp + '-' + i} className="history-card">
              <img src={entry.imageUrl} alt={`创作 ${i + 1}`} className="history-image" />
              <div className="history-meta">
                <span className="history-time">{formatTime(entry.timestamp)}</span>
                <ul className="history-blocks">
                  {['subject', 'action', 'scene', 'style'].map((type) => {
                    const block = entry.json.blocks[type]
                    return block ? (
                      <li key={type}>
                        <span className="history-block-type">{CATEGORY_LABELS[type]}</span>
                        <span className="history-block-value">{block.label}</span>
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
