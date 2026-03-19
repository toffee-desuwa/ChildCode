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
import HeroCarousel from '../components/HeroCarousel'
import { useI18n } from '../i18n'

// Blockly container height varies by age tier
const BLOCKLY_HEIGHTS = { 1: 'h-[450px]', 2: 'h-[420px]', 3: 'h-[380px]' }

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

  const [cachedSuggestion, setCachedSuggestion] = useState(null)

  const {
    snapshotA, snapshotB, generating, error, generationFailed,
    zeroChangeWarn, quotaExhausted, mastery, complete, hasA, hasB,
    canGenerate, liveDiff, comparison, handleGenerate, handleNewRound, clearError,
  } = useGeneration(currentJson, configStatus)

  const canGenerateFinal = canGenerate && !duplicated

  const guidance = useMemo(() => {
    const g = getGuidance(currentJson, snapshotA, snapshotB, cachedSuggestion, t)
    if (g.suggestedCategory && g.suggestedCategory !== cachedSuggestion) {
      queueMicrotask(() => setCachedSuggestion(g.suggestedCategory))
    }
    return g
  }, [currentJson, snapshotA, snapshotB, cachedSuggestion, t])

  const handleSaveTemplate = () => {
    if (!currentJson || !isComplete(currentJson)) return
    const usedBlocks = Object.entries(currentJson.blocks)
      .filter(([, v]) => v !== null)
      .map(([type, v]) => t('blocks.category.' + type) + '\u00b7' + (v.value ? t('blocks.option.' + v.value) : v.label))
      .join(' + ')
    const name = usedBlocks || t('templates.defaultName')
    saveTemplate(name, currentJson.blocks)
    setTemplateSaved(true)
    setTimeout(() => setTemplateSaved(false), 2000)
  }

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

  const handleShare = async () => {
    const target = snapshotB || snapshotA
    if (!target) return
    const ok = await shareCreation(target.json, target.imageUrl, t)
    setShareMsg(ok ? t('workspace.shareCopied') : t('workspace.shareFailed'))
    setTimeout(() => setShareMsg(null), 2500)
  }

  const handleDownload = () => {
    const target = snapshotB || snapshotA
    if (!target) return
    downloadImage(target.imageUrl)
  }

  const blocklyHeight = BLOCKLY_HEIGHTS[maxTier] || BLOCKLY_HEIGHTS[1]
  const btnSize = maxTier === 1 ? 'py-4 text-xl' : maxTier === 3 ? 'py-2.5 text-base' : 'py-3 text-lg'
  const headerSize = maxTier === 1 ? 'text-2xl' : 'text-xl'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200 px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 max-w-7xl mx-auto flex-wrap gap-3">
        <h2 className={`${headerSize} font-bold text-white`}>{t('workspace.header')}</h2>
        <div className="flex gap-2 flex-wrap">
          {maxTier >= 2 && (
            <button
              onClick={handleSaveTemplate}
              disabled={!complete}
              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {templateSaved ? t('workspace.templateSaved') : t('workspace.saveTemplate')}
            </button>
          )}
          {maxTier >= 3 && (
            <>
              <button
                onClick={handleAddToStoryboard}
                disabled={!snapshotA}
                className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {storyboardMsg || t('workspace.addToStoryboard')}
              </button>
              <button
                onClick={() => navigate('/storyboard')}
                className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                {t('workspace.storyboard')}
              </button>
            </>
          )}
          {maxTier >= 2 && (
            <button
              onClick={() => navigate('/templates')}
              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              {t('workspace.myTemplates')}
            </button>
          )}
          <button
            onClick={() => navigate('/history')}
            className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            {t('workspace.myHistory')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            {t('workspace.home')}
          </button>
        </div>
      </header>

      {/* Onboarding steps bar */}
      {isOnboarding && !hasA && (
        <div className="flex items-center justify-center gap-3 py-3 px-4 mb-4 max-w-7xl mx-auto bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-sm animate-[fadeIn_0.3s_ease-out]">
          <span className={complete ? 'text-emerald-400 font-semibold' : 'text-indigo-400 font-semibold'}>{t('workspace.onboarding.step1')}</span>
          <span className="text-slate-600">{'\u2192'}</span>
          <span className={complete && !hasA ? 'text-indigo-400 font-semibold' : 'text-slate-500'}>{t('workspace.onboarding.step2')}</span>
          <span className="text-slate-600">{'\u2192'}</span>
          <span className="text-slate-500">{t('workspace.onboarding.step3')}</span>
        </div>
      )}

      {isOnboarding && hasA && !hasB && (
        <div className="flex items-center justify-center py-3 px-4 mb-4 max-w-7xl mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-semibold text-sm">
          {t('workspace.onboarding.success')}
        </div>
      )}

      {/* Mobile: "Best on desktop" banner + carousel (visible <768px) */}
      <div className="md:hidden max-w-7xl mx-auto mb-8">
        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/30 p-6 text-center mb-6">
          <h3 className="text-lg font-semibold text-indigo-300 mb-2">{t('workspace.mobile.title')}</h3>
          <p className="text-sm text-slate-400 mb-4">{t('workspace.mobile.subtitle')}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            {t('workspace.mobile.cta')}
          </button>
        </div>
        <p className="text-sm text-slate-500 text-center mb-4">{t('workspace.mobile.preview')}</p>
        <HeroCarousel />
      </div>

      {/* Main workspace grid (hidden on mobile, visible >=768px) */}
      <div className={`hidden md:grid grid-cols-1 lg:grid-cols-2 ${maxTier === 3 ? 'gap-4' : 'gap-6'} max-w-7xl mx-auto mb-8`}>
        {/* Left: Blocks area */}
        <section>
          <h3 className="text-lg font-semibold text-slate-300 mb-3">{t('workspace.blocksTitle')}</h3>
          <div className={`${blocklyHeight} rounded-xl border border-slate-700/50 overflow-hidden`}>
            <BlocklyEditor onJsonChange={setCurrentJson} initialBlocks={templateBlocks} />
          </div>

          <GuidanceHint message={guidance.message} phase={guidance.phase} />

          {liveDiff && liveDiff.count > 0 && (
            <PredictionHint changedFields={liveDiff.changedFields} />
          )}

          {zeroChangeWarn && (
            <p className="text-amber-400 mt-2 text-sm">{t('workspace.zeroChange')}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerateFinal}
            className={`w-full mt-4 ${btnSize} bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-purple-600 disabled:hover:shadow-indigo-500/20 cursor-pointer`}
          >
            {generating
              ? t('workspace.generating')
              : hasA && !hasB
                ? t('workspace.regenerate')
                : t('workspace.generate')}
          </button>

          {quotaExhausted && (
            <p className="text-amber-400 mt-2 text-sm">{t('workspace.quotaExhausted')}</p>
          )}

          {configStatus !== 'configured' && (
            <p className="text-amber-400 mt-2 text-sm">{t('workspace.needConfig')}</p>
          )}
        </section>

        {/* Right: Preview area */}
        <section className="space-y-4">
          {/* Image A */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">{t('workspace.imageA')}</h3>
            {snapshotA ? (
              <img src={snapshotA.imageUrl} alt={t('workspace.imageA')} className="w-full rounded-lg border border-slate-600" />
            ) : (
              <div className="min-h-[180px] flex items-center justify-center rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/30">
                <p className="text-slate-500 text-sm">{generating ? t('workspace.imageA.generating') : t('workspace.imageA.placeholder')}</p>
              </div>
            )}
          </div>

          {/* Image B */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">{t('workspace.imageB')}</h3>
            {snapshotB ? (
              <img src={snapshotB.imageUrl} alt={t('workspace.imageB')} className="w-full rounded-lg border border-slate-600" />
            ) : (
              <div className="min-h-[180px] flex items-center justify-center rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/30">
                <p className="text-slate-500 text-sm">{hasA && generating ? t('workspace.imageB.generating') : t('workspace.imageB.placeholder')}</p>
              </div>
            )}
          </div>

          {/* Share / Download */}
          {hasA && (
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                {shareMsg || t('workspace.share')}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                {t('workspace.download')}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Error banner (desktop only) */}
      {error && (
        <section className="hidden md:flex items-center justify-between gap-3 px-4 py-3 mb-6 max-w-7xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <p className="text-sm">{error}</p>
          <div className="flex gap-2 flex-shrink-0">
            {generationFailed && (
              <button
                onClick={() => { clearError(); handleGenerate() }}
                className="px-3 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors cursor-pointer"
              >
                {t('workspace.retry')}
              </button>
            )}
            <button
              onClick={clearError}
              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              {t('workspace.close')}
            </button>
          </div>
        </section>
      )}

      {/* Comparison area — only when both snapshots exist (desktop only) */}
      {comparison && (
        <section className="hidden md:block max-w-7xl mx-auto mb-8">
          <h3 className="text-lg font-semibold text-slate-300 mb-4">{t('workspace.compareTitle')}</h3>

          <MasteryBadge mastery={mastery} />
          <ChangeInsight details={comparison.details} />
          <ControlReflection details={comparison.details} mastery={mastery} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <CompareCard label={t('workspace.imageA')} snapshot={snapshotA} changedFields={comparison.changedFields} />
            <CompareCard label={t('workspace.imageB')} snapshot={snapshotB} changedFields={comparison.changedFields} />
          </div>

          <button
            onClick={handleNewRound}
            className="mt-4 px-6 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            {t('workspace.newRound')}
          </button>
        </section>
      )}

      {/* Placeholder when no comparison yet (desktop only) */}
      {!comparison && (
        <section className="hidden md:block max-w-7xl mx-auto mb-8">
          <h3 className="text-lg font-semibold text-slate-300 mb-4">{t('workspace.compareTitle')}</h3>
          <div className="min-h-[80px] flex items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30">
            <p className="text-slate-500 text-sm">{t('workspace.comparePlaceholder')}</p>
          </div>
        </section>
      )}

      {/* JSON truth layer — dev-only (desktop only) */}
      {import.meta.env.DEV && (
        <section className="hidden md:block max-w-7xl mx-auto mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">
            {t('workspace.jsonTitle')}{' '}
            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded ml-1">{t('workspace.jsonDevBadge')}</span>
          </h3>
          {duplicated ? (
            <>
              <pre className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm font-mono text-red-400 overflow-x-auto">{t('workspace.jsonInvalid')}</pre>
              <p className="text-red-400 mt-2 text-sm font-bold">{duplicateMsg}</p>
            </>
          ) : (
            <pre className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 text-sm font-mono text-slate-300 overflow-x-auto whitespace-pre">
              {currentJson ? JSON.stringify(currentJson, null, 2) : t('workspace.jsonEmpty')}
            </pre>
          )}
        </section>
      )}

      {/* Config status (desktop only) */}
      <section className="hidden md:block max-w-7xl mx-auto">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
          configStatus === 'configured'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : configStatus === 'invalid'
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
        }`}>
          <span>{t('workspace.configLabel')}{t(`workspace.config.${configStatus}`)}</span>
          {configStatus !== 'configured' && (
            <button
              onClick={() => navigate('/config')}
              className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
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
 * Dark theme with amber highlighting for changed blocks.
 */
const CompareCard = memo(function CompareCard({ label, snapshot, changedFields }) {
  const { t } = useI18n()

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
      <h4 className="text-sm font-semibold text-slate-400 mb-2">{label}</h4>
      <img src={snapshot.imageUrl} alt={label} className="w-full rounded-lg border border-slate-600 mb-3" />
      <ul className="space-y-1.5">
        {Object.keys(BLOCK_CATEGORIES).map((type) => {
          const block = snapshot.json.blocks[type]
          if (!block) return null
          const changed = changedFields.includes(type)
          return (
            <li
              key={type}
              className={`flex justify-between px-3 py-1.5 rounded-lg text-sm ${
                changed
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold'
                  : 'bg-slate-700/50 text-slate-300'
              }`}
            >
              <span className={changed ? 'text-amber-300/70' : 'text-slate-500'}>{t('blocks.category.' + type)}</span>
              <span>{block.value ? t('blocks.option.' + block.value) : block.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
})
