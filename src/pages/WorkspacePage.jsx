import { useState, useMemo, memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BlocklyEditor from '../components/BlocklyEditor'
import { isComplete, hasDuplicates, getDuplicateMessage } from '../blocks/exportJson'
import { getConfigStatus, loadConfig, saveTemplate, addStoryboardFrame, loadStoryboard, STORYBOARD_MAX_FRAMES } from '../config/storage'
import { getGuidance } from '../guidance/phaseGuide'
import GuidanceHint from '../components/GuidanceHint'
import ChangeInsight from '../components/ChangeInsight'
import { BLOCK_CATEGORIES, AGE_TIERS, DEFAULT_AGE_TIER } from '../blocks/whitelist'
import { PredictionHint, MasteryBadge, ControlReflection } from '../components/ControlFeeling'
import { shareCreation, downloadImage } from '../sharing/shareCard'
import { useGeneration } from '../hooks/useGeneration'
import { useI18n } from '../i18n'

export default function WorkspacePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()
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
  const duplicateMsg = currentJson && getDuplicateMessage(currentJson, t)

  // Cache suggested category for first-image phase to prevent flicker
  const [cachedSuggestion, setCachedSuggestion] = useState(null)

  const {
    snapshotA, snapshotB, generating, error, generationFailed,
    zeroChangeWarn, quotaExhausted, mastery, complete, hasA, hasB,
    canGenerate, liveDiff, comparison, handleGenerate, handleNewRound, clearError,
  } = useGeneration(currentJson, configStatus)

  // canGenerate extra check: duplicate blocks cannot generate
  const canGenerateFinal = canGenerate && !duplicated

  const guidance = useMemo(() => {
    const g = getGuidance(currentJson, snapshotA, snapshotB, cachedSuggestion, t)
    if (g.suggestedCategory && g.suggestedCategory !== cachedSuggestion) {
      queueMicrotask(() => setCachedSuggestion(g.suggestedCategory))
    }
    return g
  }, [currentJson, snapshotA, snapshotB, cachedSuggestion, t])

  // Save current block combination as template
  const handleSaveTemplate = () => {
    if (!currentJson || !isComplete(currentJson)) return
    const usedBlocks = Object.entries(currentJson.blocks)
      .filter(([, v]) => v !== null)
      .map(([type, v]) => t('blocks.category.' + type) + '\u00b7' + (v.value ? t('blocks.option.' + v.value) : v.label))
      .join(' + ')
    const name = usedBlocks || 'Template'
    saveTemplate(name, currentJson.blocks)
    setTemplateSaved(true)
    setTimeout(() => setTemplateSaved(false), 2000)
  }

  // Add current generation result to storyboard
  const handleAddToStoryboard = () => {
    const target = snapshotB || snapshotA
    if (!target) return
    const ok = addStoryboardFrame(target.json, target.imageUrl)
    if (ok) {
      const count = loadStoryboard().length
      setStoryboardMsg(t('workspace.storyboardAdded', { count, max: STORYBOARD_MAX_FRAMES }))
    } else {
      setStoryboardMsg(t('workspace.storyboardFull', { max: STORYBOARD_MAX_FRAMES }))
    }
    setTimeout(() => setStoryboardMsg(null), 2500)
  }

  // Share current creation
  const handleShare = async () => {
    const target = snapshotB || snapshotA
    if (!target) return
    const ok = await shareCreation(target.json, target.imageUrl, t)
    setShareMsg(ok ? t('workspace.shareCopied') : t('workspace.shareFailed'))
    setTimeout(() => setShareMsg(null), 2500)
  }

  // Download current creation image
  const handleDownload = () => {
    const target = snapshotB || snapshotA
    if (!target) return
    downloadImage(target.imageUrl)
  }

  return (
    <div className={`page workspace-page age-tier-${maxTier}`}>
      <header className="workspace-header">
        <h2>{t('workspace.header')}</h2>
        <div className="workspace-header-actions">
          {maxTier >= 2 && (
            <button
              onClick={handleSaveTemplate}
              disabled={!complete}
              className="secondary"
            >
              {templateSaved ? t('workspace.templateSaved') : t('workspace.saveTemplate')}
            </button>
          )}
          {maxTier >= 3 && (
            <>
              <button
                onClick={handleAddToStoryboard}
                disabled={!snapshotA}
                className="secondary"
              >
                {storyboardMsg || t('workspace.addToStoryboard')}
              </button>
              <button onClick={() => navigate('/storyboard')} className="secondary">
                {t('workspace.storyboard')}
              </button>
            </>
          )}
          {maxTier >= 2 && (
            <button onClick={() => navigate('/templates')} className="secondary">
              {t('workspace.myTemplates')}
            </button>
          )}
          <button onClick={() => navigate('/history')} className="secondary">
            {t('workspace.myHistory')}
          </button>
          <button onClick={() => navigate('/')} className="secondary">
            {t('workspace.home')}
          </button>
        </div>
      </header>

      {isOnboarding && !hasA && (
        <div className="onboarding-steps-bar">
          <span className={`onboarding-step ${complete ? 'done' : 'active'}`}>{t('workspace.onboarding.step1')}</span>
          <span className="onboarding-step-arrow">{'\u2192'}</span>
          <span className={`onboarding-step ${complete && !hasA ? 'active' : ''}`}>{t('workspace.onboarding.step2')}</span>
          <span className="onboarding-step-arrow">{'\u2192'}</span>
          <span className="onboarding-step">{t('workspace.onboarding.step3')}</span>
        </div>
      )}

      {isOnboarding && hasA && !hasB && (
        <div className="onboarding-steps-bar onboarding-success">
          {t('workspace.onboarding.success')}
        </div>
      )}

      <div className="workspace-layout">
        <section className="blocks-area">
          <h3>{t('workspace.blocksTitle')}</h3>
          <BlocklyEditor onJsonChange={setCurrentJson} initialBlocks={templateBlocks} />

          <GuidanceHint message={guidance.message} phase={guidance.phase} />

          {liveDiff && liveDiff.count > 0 && (
            <PredictionHint changedFields={liveDiff.changedFields} />
          )}

          {zeroChangeWarn && (
            <p className="status-hint">{t('workspace.zeroChange')}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerateFinal}
            className="generate-btn"
          >
            {generating
              ? t('workspace.generating')
              : hasA && !hasB
                ? t('workspace.regenerate')
                : t('workspace.generate')}
          </button>

          {quotaExhausted && (
            <p className="status-hint">{t('workspace.quotaExhausted')}</p>
          )}

          {configStatus !== 'configured' && (
            <p className="status-hint">{t('workspace.needConfig')}</p>
          )}
        </section>

        <section className="preview-area">
          <div className="image-slot">
            <h3>{t('workspace.imageA')}</h3>
            {snapshotA ? (
              <img src={snapshotA.imageUrl} alt={t('workspace.imageA')} className="generated-image" />
            ) : (
              <div className="placeholder-box image-placeholder">
                <p>{generating ? t('workspace.imageA.generating') : t('workspace.imageA.placeholder')}</p>
              </div>
            )}
          </div>

          <div className="image-slot">
            <h3>{t('workspace.imageB')}</h3>
            {snapshotB ? (
              <img src={snapshotB.imageUrl} alt={t('workspace.imageB')} className="generated-image" />
            ) : (
              <div className="placeholder-box image-placeholder">
                <p>{hasA && generating ? t('workspace.imageB.generating') : t('workspace.imageB.placeholder')}</p>
              </div>
            )}
          </div>

          {hasA && (
            <div className="share-actions">
              <button onClick={handleShare} className="secondary">
                {shareMsg || t('workspace.share')}
              </button>
              <button onClick={handleDownload} className="secondary">
                {t('workspace.download')}
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
              <button onClick={() => { clearError(); handleGenerate() }}>{t('workspace.retry')}</button>
            )}
            <button onClick={clearError} className="secondary">{t('workspace.close')}</button>
          </div>
        </section>
      )}

      {/* Comparison area — only when both snapshots exist */}
      {comparison && (
        <section className="compare-area">
          <h3>{t('workspace.compareTitle')}</h3>

          <MasteryBadge mastery={mastery} />
          <ChangeInsight details={comparison.details} />
          <ControlReflection details={comparison.details} mastery={mastery} />

          <div className="compare-grid">
            <CompareCard label={t('workspace.imageA')} snapshot={snapshotA} changedFields={comparison.changedFields} />
            <CompareCard label={t('workspace.imageB')} snapshot={snapshotB} changedFields={comparison.changedFields} />
          </div>

          <button onClick={handleNewRound} className="secondary new-round-btn">
            {t('workspace.newRound')}
          </button>
        </section>
      )}

      {/* Placeholder when no comparison yet */}
      {!comparison && (
        <section className="compare-area">
          <h3>{t('workspace.compareTitle')}</h3>
          <div className="placeholder-box">
            <p>{t('workspace.comparePlaceholder')}</p>
          </div>
        </section>
      )}

      {/* JSON truth layer — dev-only, hidden from children */}
      {import.meta.env.DEV && (
        <section className="json-preview">
          <h3>{t('workspace.jsonTitle')} <span className="dev-badge">{t('workspace.jsonDevBadge')}</span></h3>
          {duplicated ? (
            <>
              <pre className="json-output json-invalid">{t('workspace.jsonInvalid')}</pre>
              <p className="status-error">{duplicateMsg}</p>
            </>
          ) : (
            <pre className="json-output">
              {currentJson ? JSON.stringify(currentJson, null, 2) : t('workspace.jsonEmpty')}
            </pre>
          )}
        </section>
      )}

      <section className="status-area">
        <div className={`config-status config-${configStatus}`}>
          <span>{t('workspace.configLabel')}{t(`workspace.config.${configStatus}`)}</span>
          {configStatus !== 'configured' && (
            <button onClick={() => navigate('/config')} className="secondary">
              {t('workspace.goToSettings')}
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
  const { t } = useI18n()

  return (
    <div className="compare-card">
      <h4>{label}</h4>
      <img src={snapshot.imageUrl} alt={label} className="compare-image" />
      <ul className="compare-blocks">
        {Object.keys(BLOCK_CATEGORIES).map((type) => {
          const block = snapshot.json.blocks[type]
          if (!block) return null
          const changed = changedFields.includes(type)
          return (
            <li
              key={type}
              className={changed ? 'is-changed' : ''}
            >
              <span className="block-type">{t('blocks.category.' + type)}</span>
              <span className="block-value">{block.value ? t('blocks.option.' + block.value) : block.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
})
