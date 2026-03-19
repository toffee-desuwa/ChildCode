import { useNavigate } from 'react-router-dom'
import { loadConfig, isFirstTimeUser } from '../config/storage'
import { AGE_TIERS, DEFAULT_AGE_TIER, BLOCK_CATEGORIES } from '../blocks/whitelist'
import { useI18n } from '../i18n'
import HeroCarousel from '../components/HeroCarousel'

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-0 text-center">
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

      {/* Auto-playing demo carousel */}
      <div className="w-full mb-16">
        <HeroCarousel />
      </div>

      {/* Growth Ladder — Prompt → Skill → Harness */}
      <div className="w-full max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {t('welcome.ladder.title')}
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          {t('welcome.ladder.subtitle')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { key: 'prompt', icon: '🧩', color: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/30', accent: 'text-indigo-400', soon: false },
            { key: 'skill', icon: '🔧', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', accent: 'text-emerald-400', soon: true },
            { key: 'harness', icon: '🚀', color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', accent: 'text-amber-400', soon: true },
          ].map((level, i) => (
            <div
              key={level.key}
              className={`relative bg-gradient-to-b ${level.color} border ${level.border} rounded-2xl p-6 text-left ${level.soon ? 'opacity-75' : ''}`}
            >
              {level.soon && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-full">
                  {t('welcome.ladder.comingSoon')}
                </span>
              )}
              <div className="text-3xl mb-3">{level.icon}</div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${level.accent} mb-1`}>
                {t(`welcome.ladder.${level.key}.label`)}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {t(`welcome.ladder.${level.key}.title`)}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t(`welcome.ladder.${level.key}.desc`)}
              </p>
              {i < 2 && (
                <div className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 text-slate-600 text-xl z-10">→</div>
              )}
            </div>
          ))}
        </div>
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
