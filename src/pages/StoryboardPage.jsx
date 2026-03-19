import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStoryboard, removeStoryboardFrame, reorderStoryboard, clearStoryboard, STORYBOARD_MAX_FRAMES } from '../config/storage'
import { useI18n } from '../i18n'

export default function StoryboardPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [frames, setFrames] = useState(() => loadStoryboard())

  const refresh = () => setFrames(loadStoryboard())

  const handleRemove = (id) => {
    removeStoryboardFrame(id)
    refresh()
  }

  const handleClear = () => {
    clearStoryboard()
    refresh()
  }

  const handleMoveUp = (index) => {
    if (index <= 0) return
    const ids = frames.map((f) => f.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    reorderStoryboard(ids)
    refresh()
  }

  const handleMoveDown = (index) => {
    if (index >= frames.length - 1) return
    const ids = frames.map((f) => f.id)
    ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
    reorderStoryboard(ids)
    refresh()
  }

  return (
    <div className="page storyboard-page">
      <div className="storyboard-header">
        <h2>{t('storyboard.title')}</h2>
        <div className="storyboard-header-actions">
          <button onClick={() => navigate('/workspace')} className="secondary">
            {t('storyboard.create')}
          </button>
          <button onClick={() => navigate('/')} className="secondary">
            {t('storyboard.home')}
          </button>
        </div>
      </div>

      <p className="storyboard-subtitle">
        {frames.length === 0
          ? t('storyboard.empty')
          : t('storyboard.count', { count: frames.length, max: STORYBOARD_MAX_FRAMES })}
      </p>

      {frames.length > 0 && (
        <>
          {/* Story strip — horizontal thumbnail sequence */}
          <div className="storyboard-strip">
            {frames.map((frame, i) => (
              <div key={frame.id} className="storyboard-strip-frame">
                <span className="storyboard-strip-number">{i + 1}</span>
                <img src={frame.imageUrl} alt={t('storyboard.frameAlt', { index: i + 1 })} className="storyboard-strip-img" />
              </div>
            ))}
          </div>

          {/* Detailed frame list */}
          <div className="storyboard-frames">
            {frames.map((frame, i) => (
              <div key={frame.id} className="storyboard-frame-card">
                <div className="storyboard-frame-header">
                  <span className="storyboard-frame-label">{t('storyboard.frameLabel', { index: i + 1 })}</span>
                  <div className="storyboard-frame-actions">
                    <button
                      onClick={() => handleMoveUp(i)}
                      disabled={i === 0}
                      className="secondary"
                    >
                      {t('storyboard.moveUp')}
                    </button>
                    <button
                      onClick={() => handleMoveDown(i)}
                      disabled={i === frames.length - 1}
                      className="secondary"
                    >
                      {t('storyboard.moveDown')}
                    </button>
                    <button
                      onClick={() => handleRemove(frame.id)}
                      className="secondary"
                    >
                      {t('storyboard.remove')}
                    </button>
                  </div>
                </div>
                <img src={frame.imageUrl} alt={t('storyboard.frameAlt', { index: i + 1 })} className="storyboard-frame-img" />
                <ul className="storyboard-frame-blocks">
                  {Object.entries(frame.json.blocks)
                    .filter(([, v]) => v !== null)
                    .map(([type, v]) => (
                      <li key={type}>
                        <span className="block-type">{t('blocks.category.' + type)}</span>
                        <span className="block-value">{v.value ? t('blocks.option.' + v.value) : v.label}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>

          <button onClick={handleClear} className="secondary storyboard-clear-btn">
            {t('storyboard.clear')}
          </button>
        </>
      )}
    </div>
  )
}
