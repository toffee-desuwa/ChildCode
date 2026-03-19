import { useState, useMemo, memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BlocklyEditor from '../components/BlocklyEditor'
import { isComplete, hasDuplicates, getDuplicateMessage } from '../blocks/exportJson'
import { getConfigStatus, loadConfig, saveTemplate, addStoryboardFrame, loadStoryboard, STORYBOARD_MAX_FRAMES } from '../config/storage'
import { getGuidance } from '../guidance/phaseGuide'
import GuidanceHint from '../components/GuidanceHint'
import ChangeInsight from '../components/ChangeInsight'
import { CATEGORY_LABELS, BLOCK_CATEGORIES, AGE_TIERS, DEFAULT_AGE_TIER } from '../blocks/whitelist'
import { PredictionHint, MasteryBadge, ControlReflection } from '../components/ControlFeeling'
import { shareCreation, downloadImage } from '../sharing/shareCard'
import { useGeneration } from '../hooks/useGeneration'

const CONFIG_STATUS_TEXT = {
  not_configured: '未配置 — 请让爸爸妈妈先完成设置',
  configured: '已配置',
  invalid: '配置无效 — 请让爸爸妈妈检查设置',
}

export default function WorkspacePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const templateBlocks = location.state?.templateBlocks || null
  const isOnboarding = location.state?.onboarding || false
  const [currentJson, setCurrentJson] = useState(null)
  const [templateSaved, setTemplateSaved] = useState(false)
  const [storyboardMsg, setStoryboardMsg] = useState(null)
  const [shareMsg, setShareMsg] = useState(null)

  const config = loadConfig()
  const ageTier = config?.ageTier || DEFAULT_AGE_TIER
  const maxTier = AGE_TIERS[ageTier]?.maxTier ?? 1
  const configStatus = getConfigStatus()
  const duplicated = currentJson && hasDuplicates(currentJson)
  const duplicateMsg = currentJson && getDuplicateMessage(currentJson)

  // 缓存 first-image 阶段的建议类别，防止每次渲染闪烁
  const [cachedSuggestion, setCachedSuggestion] = useState(null)

  const {
    snapshotA, snapshotB, generating, error, generationFailed,
    zeroChangeWarn, quotaExhausted, mastery, complete, hasA, hasB,
    canGenerate, liveDiff, comparison, handleGenerate, handleNewRound, clearError,
  } = useGeneration(currentJson, configStatus)

  // canGenerate 额外检查：duplicate 积木不能生成
  const canGenerateFinal = canGenerate && !duplicated

  const guidance = useMemo(() => {
    const g = getGuidance(currentJson, snapshotA, snapshotB, cachedSuggestion)
    if (g.suggestedCategory && g.suggestedCategory !== cachedSuggestion) {
      // 延迟到下一轮渲染更新缓存，避免 render 中 setState
      queueMicrotask(() => setCachedSuggestion(g.suggestedCategory))
    }
    return g
  }, [currentJson, snapshotA, snapshotB, cachedSuggestion])

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

  // 添加当前生成结果到故事板
  const handleAddToStoryboard = () => {
    const target = snapshotB || snapshotA
    if (!target) return
    const ok = addStoryboardFrame(target.json, target.imageUrl)
    if (ok) {
      const count = loadStoryboard().length
      setStoryboardMsg(`已添加第 ${count} 帧（最多 ${STORYBOARD_MAX_FRAMES} 帧）`)
    } else {
      setStoryboardMsg(`故事板已满（最多 ${STORYBOARD_MAX_FRAMES} 帧）`)
    }
    setTimeout(() => setStoryboardMsg(null), 2500)
  }

  // 分享当前创作
  const handleShare = async () => {
    const target = snapshotB || snapshotA
    if (!target) return
    const ok = await shareCreation(target.json, target.imageUrl)
    setShareMsg(ok ? '已复制分享文案' : '分享失败')
    setTimeout(() => setShareMsg(null), 2500)
  }

  // 下载当前创作图片
  const handleDownload = () => {
    const target = snapshotB || snapshotA
    if (!target) return
    downloadImage(target.imageUrl)
  }

  return (
    <div className={`page workspace-page age-tier-${maxTier}`}>
      <header className="workspace-header">
        <h2>ChildCode 创作区</h2>
        <div className="workspace-header-actions">
          {maxTier >= 2 && (
            <button
              onClick={handleSaveTemplate}
              disabled={!complete}
              className="secondary"
            >
              {templateSaved ? '已保存' : '存为模板'}
            </button>
          )}
          {maxTier >= 3 && (
            <>
              <button
                onClick={handleAddToStoryboard}
                disabled={!snapshotA}
                className="secondary"
              >
                {storyboardMsg || '加入故事板'}
              </button>
              <button onClick={() => navigate('/storyboard')} className="secondary">
                故事板
              </button>
            </>
          )}
          {maxTier >= 2 && (
            <button onClick={() => navigate('/templates')} className="secondary">
              我的模板
            </button>
          )}
          <button onClick={() => navigate('/history')} className="secondary">
            我的历史
          </button>
          <button onClick={() => navigate('/')} className="secondary">
            返回首页
          </button>
        </div>
      </header>

      {isOnboarding && !hasA && (
        <div className="onboarding-steps-bar">
          <span className={`onboarding-step ${complete ? 'done' : 'active'}`}>1. 积木已就位</span>
          <span className="onboarding-step-arrow">→</span>
          <span className={`onboarding-step ${complete && !hasA ? 'active' : ''}`}>2. 点"生成图片"</span>
          <span className="onboarding-step-arrow">→</span>
          <span className="onboarding-step">3. 看画面！</span>
        </div>
      )}

      {isOnboarding && hasA && !hasB && (
        <div className="onboarding-steps-bar onboarding-success">
          你的第一幅画诞生了！试试改一个积木，看画面会怎么变？
        </div>
      )}

      <div className="workspace-layout">
        <section className="blocks-area">
          <h3>积木搭建区</h3>
          <BlocklyEditor onJsonChange={setCurrentJson} initialBlocks={templateBlocks} />

          <GuidanceHint message={guidance.message} phase={guidance.phase} />

          {liveDiff && liveDiff.count > 0 && (
            <PredictionHint changedFields={liveDiff.changedFields} />
          )}

          {zeroChangeWarn && (
            <p className="status-hint">你没有修改积木哦，改一个块试试？</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerateFinal}
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

          {hasA && (
            <div className="share-actions">
              <button onClick={handleShare} className="secondary">
                {shareMsg || '分享创作'}
              </button>
              <button onClick={handleDownload} className="secondary">
                下载图片
              </button>
            </div>
          )}
        </section>
      </div>

      {error && (
        <section className="error-banner">
          <p>{error}</p>
          <div className="error-actions">
            {generationFailed && (
              <button onClick={() => { clearError(); handleGenerate() }}>重试</button>
            )}
            <button onClick={clearError} className="secondary">关闭</button>
          </div>
        </section>
      )}

      {/* Comparison area — only when both snapshots exist */}
      {comparison && (
        <section className="compare-area">
          <h3>对比区</h3>

          <MasteryBadge mastery={mastery} />
          <ChangeInsight details={comparison.details} />
          <ControlReflection details={comparison.details} mastery={mastery} />

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
 * Compare card: shows image + block values, highlights changed fields.
 * Memoized — only re-renders when snapshot or changedFields reference changes.
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
