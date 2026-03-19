import { useNavigate } from 'react-router-dom'
import { loadConfig, isFirstTimeUser } from '../config/storage'
import { AGE_TIERS, DEFAULT_AGE_TIER, BLOCK_CATEGORIES } from '../blocks/whitelist'
import { useI18n } from '../i18n'

/**
 * Pick one random block per required category for quick-start experience
 */
function getRandomBlocks() {
  const blocks = {}
  for (const [type, cat] of Object.entries(BLOCK_CATEGORIES)) {
    if (!cat.required) continue
    const option = cat.options[Math.floor(Math.random() * cat.options.length)]
    blocks[type] = { value: option[1], label: option[0] }
  }
  return blocks
}

export default function WelcomePage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const config = loadConfig()
  const ageTier = config?.ageTier || DEFAULT_AGE_TIER
  const maxTier = AGE_TIERS[ageTier]?.maxTier ?? 1
  const firstTime = isFirstTimeUser()

  const handleQuickStart = () => {
    const blocks = getRandomBlocks()
    navigate('/workspace', { state: { templateBlocks: blocks, onboarding: true } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 flex flex-col items-center justify-center px-6 text-center">
      {/* Brand */}
      <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-400 mb-4">
        ChildCode
      </h2>

      {/* Headline */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6">
        <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          {t('welcome.tagline')}
        </span>
      </h1>

      {/* Description */}
      <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-4 leading-relaxed">
        {t('welcome.description')}
      </p>

      {/* Subtitle — how it works */}
      <p className="text-sm text-slate-500 mb-12">
        {t('welcome.howItWorks')}
      </p>

      {/* Carousel placeholder — F30 will replace this */}
      <div className="w-full max-w-3xl h-48 sm:h-64 rounded-2xl border border-slate-700/50 bg-slate-800/30 flex items-center justify-center mb-12">
        <p className="text-slate-600 text-sm">{t('welcome.carouselPlaceholder')}</p>
      </div>

      {/* CTA */}
      <button
        onClick={firstTime ? handleQuickStart : () => navigate('/workspace')}
        className="group relative px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] cursor-pointer"
      >
        {firstTime ? t('welcome.onboarding.cta') : t('welcome.startCreating')}
        <span className="block text-xs font-normal text-indigo-200 mt-1 opacity-80">
          {t('welcome.onboarding.steps')}
        </span>
      </button>

      {/* Navigation links */}
      <nav className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        {maxTier >= 2 && (
          <button
            onClick={() => navigate('/templates')}
            className="text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {t('welcome.myTemplates')}
          </button>
        )}
        {maxTier >= 3 && (
          <button
            onClick={() => navigate('/storyboard')}
            className="text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {t('welcome.storyboard')}
          </button>
        )}
        {!firstTime && (
          <button
            onClick={() => navigate('/history')}
            className="text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {t('welcome.myHistory')}
          </button>
        )}
        <button
          onClick={() => navigate('/config')}
          className="text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
        >
          {t('welcome.parentSettings')}
        </button>
      </nav>
    </div>
  )
}
