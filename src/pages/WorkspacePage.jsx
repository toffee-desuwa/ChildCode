import { useState, useRef, useMemo, memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BlocklyEditor from '../components/BlocklyEditor'
import { isComplete, hasDuplicates, getDuplicateMessage } from '../blocks/exportJson'
import { getConfigStatus, loadConfig, isQuotaExhausted, incrementUsage, addHistoryEntry, saveTemplate } from '../config/storage'
import { derivePrompt } from '../generation/derivePrompt'
import { generateImage } from '../generation/provider'
import { diffBlocks } from '../generation/diffBlocks'
import { getGuidance } from '../guidance/phaseGuide'
import GuidanceHint from '../components/GuidanceHint'
import ChangeInsight from '../components/ChangeInsight'
import { CATEGORY_LABELS, BLOCK_CATEGORIES } from '../blocks/whitelist'

const CONFIG_STATUS_TEXT = {
  not_configured: '未配置 — 请让爸爸妈妈先完成设置',
  configured: '已配置',
  invalid: '配置无效 — 请让爸爸妈妈检查设置',
}

export default function WorkspacePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const templateBlocks = location.state?.templateBlocks || null
  const [currentJson, setCurrentJson] = useState(null)
  const [templateSaved, setTemplateSaved] = useState(false)
  const [snapshotA, setSnapshotA] = useState(null) // { json, imageUrl }
  const [snapshotB, setSnapshotB] = useState(null) // { json, imageUrl }
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [generationFailed, setGenerationFailed] = useState(false)
  const [zeroChangeWarn, setZeroChangeWarn] = useState(false)
  const [quotaExhausted, setQuotaExhausted] = useState(() => isQuotaExhausted())

  // Ref mirrors snapshotA to avoid closure staleness in async handleGenerate
  const snapshotARef = useRef(null)
  // 缓存 first-image 阶段的建议类别，防止每次渲染闪烁
  const guidanceSuggestionRef = useRef(null)

  const configStatus = getConfigStatus()
  const complete = currentJson && isComplete(currentJson)
  const duplicated = currentJson && hasDuplicates(currentJson)
  const duplicateMsg = currentJson && getDuplicateMessage(currentJson)

  const hasA = snapshotA !== null
  const hasB = snapshotB !== null
  const canGenerate = complete && !duplicated && configStatus === 'configured' && !generating && !quotaExhausted

  const guidance = getGuidance(currentJson, snapshotA, snapshotB, guidanceSuggestionRef.current)
  if (guidance.suggestedCategory) {
    guidanceSuggestionRef.current = guidance.suggestedCategory
  }

  const handleGenerate = async () => {
    if (!canGenerate) return

    const currentA = snapshotARef.current
    setZeroChangeWarn(false)

    // If A exists and 0 blocks changed, block generation
    if (currentA !== null) {
      const diff = diffBlocks(currentA.json, currentJson)
      if (diff.count === 0) {
        setZeroChangeWarn(true)
        return
      }
    }

    setGenerating(true)
    setError(null)
    setGenerationFailed(false)

    try {
      const prompt = derivePrompt(currentJson)
      if (!prompt) {
        setError('积木组合不完整，无法生成')
        return
      }

      const config = loadConfig()
      const result = await generateImage(prompt, config)

      const newSnapshot = {
        json: JSON.parse(JSON.stringify(currentJson)),
        imageUrl: result.url,
      }

      // Count usage and save to history after successful generation
      incrementUsage()
      setQuotaExhausted(isQuotaExhausted())
      addHistoryEntry(currentJson, result.url)

      // Use ref (always current) to decide slot
      if (snapshotARef.current === null) {
        snapshotARef.current = newSnapshot
        setSnapshotA(newSnapshot)
      } else {
        setSnapshotB(newSnapshot)
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Generation error:', err)
      }
      setError('这次创作没有成功，请稍后再试一次。若一直失败，请让家长检查设置。')
      setGenerationFailed(true)
    } finally {
      setGenerating(false)
    }
  }

  // Memoize comparison: only recompute when snapshot references change.
  // This prevents any unrelated re-render (e.g. from Blockly events
  // updating currentJson) from recreating comparison/changedFields.
  const comparison = useMemo(() => {
    if (!snapshotA || !snapshotB) return null
    return diffBlocks(snapshotA.json, snapshotB.json)
  }, [snapshotA, snapshotB])


  // 保存当前积木组合为模板
  const handleSaveTemplate = () => {
    if (!currentJson || !isComplete(currentJson)) return
    const usedBlocks = Object.entries(currentJson.blocks)
      .filter(([, v]) => v !== null)
      .map(([type, v]) => CATEGORY_LABELS[type] + '·' + v.label)
      .join(' + ')
    const name = usedBlocks || '我的模板'
    saveTemplate(name, currentJson.blocks)
    setTemplateSaved(true)
    setTimeout(() => setTemplateSaved(false), 2000)
  }

  // "Start new round" — promote B to A, clear B
  const handleNewRound = () => {
    snapshotARef.current = snapshotB
    setSnapshotA(snapshotB)
    setSnapshotB(null)
    setZeroChangeWarn(false)
  }

  return (
    <div className="page workspace-page">
      <header className="workspace-header">
        <h2>ChildCode 创作区</h2>
        <div className="workspace-header-actions">
          <button
            onClick={handleSaveTemplate}
            disabled={!complete}
            className="secondary"
          >
            {templateSaved ? '已保存' : '存为模板'}
          </button>
          <button onClick={() => navigate('/templates')} className="secondary">
            我的模板
          </button>
          <button onClick={() => navigate('/history')} className="secondary">
            我的历史
          </button>
          <button onClick={() => navigate('/')} className="secondary">
            返回首页
          </button>
        </div>
      </header>

      <div className="workspace-layout">
        <section className="blocks-area">
          <h3>积木搭建区</h3>
          <BlocklyEditor onJsonChange={setCurrentJson} initialBlocks={templateBlocks} />

          <GuidanceHint message={guidance.message} phase={guidance.phase} />

          {zeroChangeWarn && (
            <p className="status-hint">你没有修改积木哦，改一个块试试？</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="generate-btn"
          >
            {generating
              ? '正在创作中…'
              : hasA && !hasB
                ? '再次生成'
                : '生成图片'}
          </button>

          {quotaExhausted && (
            <p className="status-hint">创作次数已用完，请让爸爸妈妈查看设置</p>
          )}

          {configStatus !== 'configured' && (
            <p className="status-hint">请先完成家长设置才能生成</p>
          )}
        </section>

        <section className="preview-area">
          <div className="image-slot">
            <h3>第一张图</h3>
            {snapshotA ? (
              <img src={snapshotA.imageUrl} alt="第一张图" className="generated-image" />
            ) : (
              <div className="placeholder-box image-placeholder">
                <p>{generating ? '正在生成，请稍等…' : '拖好积木后，点击生成看看效果吧'}</p>
              </div>
            )}
          </div>

          <div className="image-slot">
            <h3>第二张图</h3>
            {snapshotB ? (
              <img src={snapshotB.imageUrl} alt="第二张图" className="generated-image" />
            ) : (
              <div className="placeholder-box image-placeholder">
                <p>{hasA && generating ? '正在生成，请稍等…' : '改一个积木后，再生成一张来对比'}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {error && (
        <section className="error-banner">
          <p>{error}</p>
          <div className="error-actions">
            {generationFailed && (
              <button onClick={() => { setError(null); setGenerationFailed(false); handleGenerate() }}>重试</button>
            )}
            <button onClick={() => { setError(null); setGenerationFailed(false) }} className="secondary">关闭</button>
          </div>
        </section>
      )}

      {/* Comparison area — only when both snapshots exist */}
      {comparison && (
        <section className="compare-area">
          <h3>对比区</h3>

          <ChangeInsight details={comparison.details} />

          {comparison.count > 1 && (
            <p className="compare-hint">
              你改了 {comparison.count} 个块哦。试试只改 1 个，更容易看出区别！
            </p>
          )}

          <div className="compare-grid">
            <CompareCard label="第一张图" snapshot={snapshotA} changedFields={comparison.changedFields} />
            <CompareCard label="第二张图" snapshot={snapshotB} changedFields={comparison.changedFields} />
          </div>

          <button onClick={handleNewRound} className="secondary new-round-btn">
            开始新一轮对比
          </button>
        </section>
      )}

      {/* Placeholder when no comparison yet */}
      {!comparison && (
        <section className="compare-area">
          <h3>对比区</h3>
          <div className="placeholder-box">
            <p>生成两张图之后，就可以在这里对比啦</p>
          </div>
        </section>
      )}

      {/* JSON 真相层 — dev-only, hidden from children */}
      {import.meta.env.DEV && (
        <section className="json-preview">
          <h3>JSON 真相层 <span className="dev-badge">开发调试</span></h3>
          {duplicated ? (
            <>
              <pre className="json-output json-invalid">积木组合无效（存在重复类别）</pre>
              <p className="status-error">{duplicateMsg}</p>
            </>
          ) : (
            <pre className="json-output">
              {currentJson ? JSON.stringify(currentJson, null, 2) : '尚未选择积木'}
            </pre>
          )}
        </section>
      )}

      <section className="status-area">
        <div className={`config-status config-${configStatus}`}>
          <span>家长配置：{CONFIG_STATUS_TEXT[configStatus]}</span>
          {configStatus !== 'configured' && (
            <button onClick={() => navigate('/config')} className="secondary">
              前往设置
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

/**
 * Compare card: shows image + 4 block values, highlights changed fields.
 * Memoized — only re-renders when snapshot or changedFields reference changes.
 * Highlight is purely derived from stored snapshot data.
 */
const CompareCard = memo(function CompareCard({ label, snapshot, changedFields }) {
  return (
    <div className="compare-card">
      <h4>{label}</h4>
      <img src={snapshot.imageUrl} alt={label} className="compare-image" />
      <ul className="compare-blocks">
        {Object.keys(BLOCK_CATEGORIES).map((type) => {
          const block = snapshot.json.blocks[type]
          // 跳过未使用的可选类别
          if (!block) return null
          const changed = changedFields.includes(type)
          return (
            <li
              key={type}
              className={changed ? 'is-changed' : ''}
            >
              <span className="block-type">{CATEGORY_LABELS[type]}</span>
              <span className="block-value">{block.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
})
