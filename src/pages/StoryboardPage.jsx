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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">{t('storyboard.title')}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/workspace')}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {t('storyboard.create')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {t('storyboard.home')}
            </button>
          </div>
        </header>

        <p className="text-sm text-slate-500 mb-6">
          {frames.length === 0
            ? t('storyboard.empty')
            : t('storyboard.count', { count: frames.length, max: STORYBOARD_MAX_FRAMES })}
        </p>

        {frames.length > 0 && (
          <>
            {/* Story strip — horizontal thumbnail sequence */}
            <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 mb-6">
              {frames.map((frame, i) => (
                <div key={frame.id} className="relative flex-shrink-0">
                  <span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <img
                    src={frame.imageUrl}
                    alt={t('storyboard.frameAlt', { index: i + 1 })}
                    className="h-[100px] w-[100px] rounded-lg border border-slate-700 object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Detailed frame list */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {frames.map((frame, i) => (
                <div key={frame.id} className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-indigo-400">{t('storyboard.frameLabel', { index: i + 1 })}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMoveUp(i)}
                        disabled={i === 0}
                        className="rounded-md bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 transition-colors disabled:opacity-40"
                      >
                        {t('storyboard.moveUp')}
                      </button>
                      <button
                        onClick={() => handleMoveDown(i)}
                        disabled={i === frames.length - 1}
                        className="rounded-md bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 transition-colors disabled:opacity-40"
                      >
                        {t('storyboard.moveDown')}
                      </button>
                      <button
                        onClick={() => handleRemove(frame.id)}
                        className="rounded-md bg-slate-700 px-2 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors"
                      >
                        {t('storyboard.remove')}
                      </button>
                    </div>
                  </div>
                  <img
                    src={frame.imageUrl}
                    alt={t('storyboard.frameAlt', { index: i + 1 })}
                    className="w-full rounded-lg border border-slate-700 mb-2"
                  />
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(frame.json.blocks)
                      .filter(([, v]) => v !== null)
                      .map(([type, v]) => (
                        <span key={type} className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
                          {t('blocks.category.' + type)}: {v.value ? t('blocks.option.' + v.value) : v.label}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleClear}
              className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"
            >
              {t('storyboard.clear')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
