import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadConfig, saveConfig, validateConfig, getUsageCount, resetUsageCount, loadHistory, loadMastery, loadStoryboard, loadTemplates, clearHistory } from '../config/storage'
import { AGE_TIERS, DEFAULT_AGE_TIER } from '../blocks/whitelist'
import { PROVIDERS } from '../generation/provider'
import { useI18n } from '../i18n'

function getInitialConfig() {
  const config = loadConfig()
  return {
    apiKey: config?.apiKey || '',
    usageLimit: config?.usageLimit ? String(config.usageLimit) : '',
    ageTier: config?.ageTier || DEFAULT_AGE_TIER,
    provider: config?.provider || 'openai',
    apiBase: config?.apiBase || '',
  }
}

export default function ConfigPage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const initial = getInitialConfig()
  const [apiKey, setApiKey] = useState(initial.apiKey)
  const [usageLimit, setUsageLimit] = useState(initial.usageLimit)
  const [ageTier, setAgeTier] = useState(initial.ageTier)
  const [provider, setProvider] = useState(initial.provider)
  const [apiBase, setApiBase] = useState(initial.apiBase)
  const [errors, setErrors] = useState({})
  const [saveMsg, setSaveMsg] = useState(null)
  const [usageCount, setUsageCount] = useState(() => getUsageCount())

  const handleSave = () => {
    const { valid, errors: fieldErrors } = validateConfig({ apiKey, usageLimit })
    setErrors(fieldErrors)

    if (!valid) {
      setSaveMsg(null)
      return
    }

    saveConfig({ apiKey: apiKey.trim(), usageLimit: Number(usageLimit), ageTier, provider, apiBase: apiBase.trim() })
    setSaveMsg(t('config.saveSuccess'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h2 className="text-2xl font-bold text-white mb-8">{t('config.title')}</h2>

        <div className="space-y-6">
          {/* API Key */}
          <label className="block">
            <span className="block text-sm font-medium text-slate-300 mb-1">{t('config.apiKey')}</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t('config.apiKeyPlaceholder')}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.apiKey && <p className="mt-1 text-sm text-red-400">{errors.apiKey}</p>}
          </label>

          {/* Provider */}
          <label className="block">
            <span className="block text-sm font-medium text-slate-300 mb-1">{t('config.provider')}</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {Object.entries(PROVIDERS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">{t('config.providerHint')}</p>
          </label>

          {/* API Base (conditional) */}
          {PROVIDERS[provider]?.needsApiBase && (
            <label className="block">
              <span className="block text-sm font-medium text-slate-300 mb-1">{t('config.apiBase')}</span>
              <input
                type="text"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder={t('config.apiBasePlaceholder')}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-500">{t('config.apiBaseHint')}</p>
            </label>
          )}

          {/* Usage Limit */}
          <label className="block">
            <span className="block text-sm font-medium text-slate-300 mb-1">{t('config.usageLimit')}</span>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder={t('config.usageLimitPlaceholder')}
              min="1"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.usageLimit && <p className="mt-1 text-sm text-red-400">{errors.usageLimit}</p>}
          </label>

          {/* Age Tier */}
          <label className="block">
            <span className="block text-sm font-medium text-slate-300 mb-1">{t('config.ageTier')}</span>
            <select
              value={ageTier}
              onChange={(e) => setAgeTier(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {Object.entries(AGE_TIERS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">{t('config.ageTierHint')}</p>
          </label>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-500 transition-colors"
            >
              {t('config.save')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-lg bg-slate-700 px-6 py-2.5 font-medium text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {t('config.back')}
            </button>
          </div>

          {saveMsg && <p className="text-sm font-medium text-emerald-400">{saveMsg}</p>}

          {/* Usage counter */}
          <div className="flex items-center gap-4 border-t border-slate-800 pt-4 text-sm text-slate-400">
            <span>
              {usageLimit
                ? t('config.usageCountWithLimit', { count: usageCount, limit: usageLimit })
                : t('config.usageCount', { count: usageCount })}
            </span>
            <button
              type="button"
              onClick={() => { resetUsageCount(); setUsageCount(0) }}
              className="rounded-md bg-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {t('config.resetUsage')}
            </button>
          </div>
        </div>

        <ParentDashboard />
      </div>
    </div>
  )
}

/**
 * Parent dashboard: view child's expression growth trajectory and usage stats
 */
function ParentDashboard() {
  const { t } = useI18n()
  const [history] = useState(() => loadHistory())
  const [mastery] = useState(() => loadMastery())
  const [storyboard] = useState(() => loadStoryboard())
  const [templates] = useState(() => loadTemplates())
  const [cleared, setCleared] = useState(false)
  const [sevenDaysAgo] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Mastery level
  const masteryIndex =
    mastery.singleChanges >= 15 ? 3 :
    mastery.singleChanges >= 8 ? 2 :
    mastery.singleChanges >= 3 ? 1 : 0
  const masteryLevel = t('dashboard.masteryLevels.' + masteryIndex)

  // Precision percentage
  const precision = mastery.totalComparisons > 0
    ? Math.round((mastery.singleChanges / mastery.totalComparisons) * 100)
    : 0

  // Recent 7-day activity
  const recentCount = history.filter(h => h.timestamp > sevenDaysAgo).length

  // Block variety stats
  const blockUsage = {}
  for (const entry of history) {
    for (const [type, data] of Object.entries(entry.json.blocks)) {
      if (data) {
        blockUsage[type] = (blockUsage[type] || new Set())
        blockUsage[type].add(data.value)
      }
    }
  }

  return (
    <section className="mt-10 border-t border-slate-800 pt-8">
      <h3 className="text-lg font-bold text-white mb-5">{t('dashboard.title')}</h3>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{history.length}</div>
          <div className="mt-1 text-xs text-slate-400">{t('dashboard.totalCreations')}</div>
        </div>
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{recentCount}</div>
          <div className="mt-1 text-xs text-slate-400">{t('dashboard.recentCreations')}</div>
        </div>
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{mastery.totalComparisons}</div>
          <div className="mt-1 text-xs text-slate-400">{t('dashboard.comparisons')}</div>
        </div>
        <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{precision}%</div>
          <div className="mt-1 text-xs text-slate-400">{t('dashboard.precision')}</div>
        </div>
      </div>

      {/* Mastery */}
      <div className="mb-4 rounded-lg bg-slate-800/40 p-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">{t('dashboard.mastery')}</h4>
        <p className="text-sm text-slate-300">{t('dashboard.masteryLevel', { level: masteryLevel, count: mastery.singleChanges })}</p>
        <p className="mt-1 text-xs text-slate-500">{t('dashboard.masteryHint')}</p>
      </div>

      {/* Block exploration */}
      <div className="mb-4 rounded-lg bg-slate-800/40 p-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">{t('dashboard.blockExploration')}</h4>
        {Object.keys(blockUsage).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(blockUsage).map(([type, values]) => (
              <span key={type} className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs text-indigo-300">
                {t('blocks.category.' + type)} — {t('dashboard.blockUsed', { count: values.size })}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">{t('dashboard.noHistory')}</p>
        )}
      </div>

      {/* Assets */}
      <div className="mb-4 rounded-lg bg-slate-800/40 p-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">{t('dashboard.assets')}</h4>
        <p className="text-sm text-slate-400">{t('dashboard.assetsDetail', { templates: templates.length, frames: storyboard.length })}</p>
      </div>

      {/* Data management */}
      <div className="rounded-lg bg-slate-800/40 p-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">{t('dashboard.dataManagement')}</h4>
        <button
          onClick={() => { clearHistory(); setCleared(true) }}
          disabled={cleared}
          className="rounded-md bg-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cleared ? t('dashboard.historyCleared') : t('dashboard.clearHistory')}
        </button>
      </div>
    </section>
  )
}
