import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStoryboard, removeStoryboardFrame, reorderStoryboard, clearStoryboard, STORYBOARD_MAX_FRAMES } from '../config/storage'
import { CATEGORY_LABELS } from '../blocks/whitelist'

export default function StoryboardPage() {
  const navigate = useNavigate()
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

  // 上移一帧
  const handleMoveUp = (index) => {
    if (index <= 0) return
    const ids = frames.map((f) => f.id)
    ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
    reorderStoryboard(ids)
    refresh()
  }

  // 下移一帧
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
        <h2>我的故事板</h2>
        <div className="storyboard-header-actions">
          <button onClick={() => navigate('/workspace')} className="secondary">
            去创作
          </button>
          <button onClick={() => navigate('/')} className="secondary">
            返回首页
          </button>
        </div>
      </div>

      <p className="storyboard-subtitle">
        {frames.length === 0
          ? '还没有帧哦，去创作区生成图片后点"加入故事板"'
          : `${frames.length} / ${STORYBOARD_MAX_FRAMES} 帧 — 在创作区生成图片后可以继续添加`}
      </p>

      {frames.length > 0 && (
        <>
          {/* 故事条 — 横向缩略图连续展示 */}
          <div className="storyboard-strip">
            {frames.map((frame, i) => (
              <div key={frame.id} className="storyboard-strip-frame">
                <span className="storyboard-strip-number">{i + 1}</span>
                <img src={frame.imageUrl} alt={`第 ${i + 1} 帧`} className="storyboard-strip-img" />
              </div>
            ))}
          </div>

          {/* 详细帧列表 */}
          <div className="storyboard-frames">
            {frames.map((frame, i) => (
              <div key={frame.id} className="storyboard-frame-card">
                <div className="storyboard-frame-header">
                  <span className="storyboard-frame-label">第 {i + 1} 帧</span>
                  <div className="storyboard-frame-actions">
                    <button
                      onClick={() => handleMoveUp(i)}
                      disabled={i === 0}
                      className="secondary"
                    >
                      上移
                    </button>
                    <button
                      onClick={() => handleMoveDown(i)}
                      disabled={i === frames.length - 1}
                      className="secondary"
                    >
                      下移
                    </button>
                    <button
                      onClick={() => handleRemove(frame.id)}
                      className="secondary"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <img src={frame.imageUrl} alt={`第 ${i + 1} 帧`} className="storyboard-frame-img" />
                <ul className="storyboard-frame-blocks">
                  {Object.entries(frame.json.blocks)
                    .filter(([, v]) => v !== null)
                    .map(([type, v]) => (
                      <li key={type}>
                        <span className="block-type">{CATEGORY_LABELS[type]}</span>
                        <span className="block-value">{v.label}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>

          <button onClick={handleClear} className="secondary storyboard-clear-btn">
            清空故事板
          </button>
        </>
      )}
    </div>
  )
}
