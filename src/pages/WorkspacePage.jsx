import { useState, useRef, useEffect, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import BlocklyEditor from '../components/BlocklyEditor'
import { isComplete, hasDuplicates, getDuplicateMessage } from '../blocks/exportJson'
import { getConfigStatus, loadConfig } from '../config/storage'
import { derivePrompt } from '../generation/derivePrompt'
import { generateImage } from '../generation/provider'
import { diffBlocks } from '../generation/diffBlocks'

const CONFIG_STATUS_TEXT = {
  not_configured: '未配置 — 请让爸爸妈妈先完成设置',
  configured: '已配置',
  invalid: '配置无效 — 请让爸爸妈妈检查设置',
}

const CATEGORY_LABELS = {
  subject: '对象',
  action: '动作',
  scene: '场景',
  style: '风格',
}

export default function WorkspacePage() {
  const navigate = useNavigate()
  const [currentJson, setCurrentJson] = useState(null)
  const [snapshotA, setSnapshotA] = useState(null) // { json, imageUrl }
  const [snapshotB, setSnapshotB] = useState(null) // { json, imageUrl }
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [zeroChangeWarn, setZeroChangeWarn] = useState(false)

  // Ref mirrors snapshotA to avoid closure staleness in async handleGenerate
  const snapshotARef = useRef(null)

  // --- TEMPORARY DEBUG: detect component mount/unmount ---
  const mountCountRef = useRef(0)
  useEffect(() => {
    mountCountRef.current++
    console.log('[DEBUG] WorkspacePage MOUNTED, count:', mountCountRef.current)
    return () => {
      console.log('[DEBUG] WorkspacePage UNMOUNTED')
    }
  }, [])
  // --- END TEMPORARY DEBUG ---

  const configStatus = getConfigStatus()
  const complete = currentJson && isComplete(currentJson)
  const duplicated = currentJson && hasDuplicates(currentJson)
  const duplicateMsg = currentJson && getDuplicateMessage(currentJson)

  const hasA = snapshotA !== null
  const hasB = snapshotB !== null
  const canGenerate = complete && !duplicated && configStatus === 'configured' && !generating

  const handleGenerate = async () => {
    console.log('[DEBUG] handleGenerate called', {
      canGenerate,
      refA: snapshotARef.current !== null,
      hasA,
      hasB,
      complete,
      duplicated,
      configStatus,
      generating,
    })

    if (!canGenerate) {
      console.log('[DEBUG] canGenerate is false, returning early')
      return
    }

    const currentA = snapshotARef.current
    setZeroChangeWarn(false)

    // Requirement C: if A exists and 0 blocks changed, block generation entirely
    if (currentA !== null) {
      const diff = diffBlocks(currentA.json, currentJson)
      console.log('[DEBUG] diff check:', diff)
      if (diff.count === 0) {
        console.log('[DEBUG] 0-change, blocking generation')
        setZeroChangeWarn(true)
        return
      }
    }

    setGenerating(true)
    setError(null)

    try {
      const prompt = derivePrompt(currentJson)
      console.log('[DEBUG] derived prompt:', prompt)
      if (!prompt) {
        setError('积木组合不完整，无法生成')
        return
      }

      const config = loadConfig()
      console.log('[DEBUG] calling generateImage...')
      const result = await generateImage(prompt, config)
      console.log('[DEBUG] generateImage returned:', result.url ? 'has URL' : 'NO URL')

      const newSnapshot = {
        json: JSON.parse(JSON.stringify(currentJson)),
        imageUrl: result.url,
      }

      // Use ref (always current) to decide slot
      if (snapshotARef.current === null) {
        console.log('[DEBUG] filling slot A')
        snapshotARef.current = newSnapshot
        setSnapshotA(newSnapshot)
      } else {
        console.log('[DEBUG] filling slot B')
        setSnapshotB(newSnapshot)
      }
    } catch (err) {
      console.error('[DEBUG] generation error:', err)
      setError(err.message || '图片生成遇到了一点问题，再试一次？')
    } finally {
      setGenerating(false)
    }
  }

  // Memoize comparison: only recompute when snapshot references change.
  // This prevents any unrelated re-render (e.g. from Blockly events
  // updating currentJson) from recreating comparison/changedFields.
  const comparison = useMemo(() => {
    if (!snapshotA || !snapshotB) return null
    const result = diffBlocks(snapshotA.json, snapshotB.json)
    console.log('[DEBUG] comparison recomputed:', result)
    return result
  }, [snapshotA, snapshotB])

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
        <button onClick={() => navigate('/')} className="secondary">
          返回首页
        </button>
      </header>

      {/* --- TEMPORARY DEBUG PANEL --- */}
      <section className="debug-panel">
        <h4>DEBUG 状态面板（临时）</h4>
        <ul>
          <li>snapshotA: <strong>{hasA ? 'SET' : 'NULL'}</strong></li>
          <li>snapshotB: <strong>{hasB ? 'SET' : 'NULL'}</strong></li>
          <li>refA: <strong>{snapshotARef.current !== null ? 'SET' : 'NULL'}</strong></li>
          <li>canGenerate: <strong>{String(canGenerate)}</strong></li>
          <li>complete: <strong>{String(!!complete)}</strong></li>
          <li>duplicated: <strong>{String(!!duplicated)}</strong></li>
          <li>configStatus: <strong>{configStatus}</strong></li>
          <li>generating: <strong>{String(generating)}</strong></li>
          <li>zeroChangeWarn: <strong>{String(zeroChangeWarn)}</strong></li>
          <li>buttonMode: <strong>{generating ? 'GENERATING' : hasA && !hasB ? 'REGENERATE' : 'FIRST_GEN'}</strong></li>
          <li>comparison: <strong>{comparison ? `${comparison.count} changed` : 'NULL'}</strong></li>
          <li>error: <strong>{error || 'none'}</strong></li>
        </ul>
      </section>
      {/* --- END TEMPORARY DEBUG PANEL --- */}

      <div className="workspace-layout">
        <section className="blocks-area">
          <h3>积木搭建区</h3>
          <BlocklyEditor onJsonChange={setCurrentJson} />

          {hasA && !hasB && (
            <p className="phase-hint">试试只改一个块，看看会有什么不同？</p>
          )}

          {zeroChangeWarn && (
            <p className="status-hint">你没有修改积木哦，改一个块试试？</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="generate-btn"
          >
            {generating
              ? '生成中…'
              : hasA && !hasB
                ? '再次生成'
                : '生成图片'}
          </button>

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
                <p>{generating ? '正在生成…' : '图片预览 A（占位）'}</p>
              </div>
            )}
          </div>

          <div className="image-slot">
            <h3>第二张图</h3>
            {snapshotB ? (
              <img src={snapshotB.imageUrl} alt="第二张图" className="generated-image" />
            ) : (
              <div className="placeholder-box image-placeholder">
                <p>{hasA && generating ? '正在生成…' : '图片预览 B（占位）'}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {error && (
        <section className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="secondary">关闭</button>
        </section>
      )}

      {/* Comparison area — only when both snapshots exist */}
      {comparison && (
        <section className="compare-area">
          <h3>对比区</h3>

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
            <p>生成两张图后，这里会展示对比</p>
          </div>
        </section>
      )}

      <section className="json-preview">
        <h3>JSON 真相层 <span className="dev-badge">开发调试</span></h3>
        {duplicated ? (
          <>
            <pre className="json-output json-invalid">积木组合无效（存在重复类别）</pre>
            <p className="status-error">{duplicateMsg}</p>
          </>
        ) : (
          <>
            <pre className="json-output">
              {currentJson ? JSON.stringify(currentJson, null, 2) : '尚未选择积木'}
            </pre>
            {currentJson && !complete && (
              <p className="status-hint">还差积木哦，把四类都拖过来吧！</p>
            )}
            {complete && (
              <p className="status-ready">四类积木已齐全</p>
            )}
          </>
        )}
      </section>

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
  console.log('[DEBUG] CompareCard render:', label, 'changedFields:', changedFields)
  return (
    <div className="compare-card">
      <h4>{label}</h4>
      <img src={snapshot.imageUrl} alt={label} className="compare-image" />
      <ul className="compare-blocks">
        {['subject', 'action', 'scene', 'style'].map((type) => {
          const block = snapshot.json.blocks[type]
          const changed = changedFields.includes(type)
          return (
            <li
              key={type}
              className={changed ? 'is-changed' : ''}
              style={changed ? { background: '#fff3e0', border: '2px solid #ff9800', fontWeight: 'bold' } : undefined}
            >
              <span className="block-type">{CATEGORY_LABELS[type]}</span>
              <span className="block-value">{block?.label ?? '—'}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
})
