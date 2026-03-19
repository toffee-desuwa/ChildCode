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
    <div className={`page welcome-page age-tier-${maxTier}`}>
      <h1>{t('welcome.title')}</h1>
      <p>{t(`welcome.subtitle.${maxTier}`)}</p>

      {firstTime && (
        <div className="onboarding-hero">
          <p className="onboarding-tagline">{t('welcome.onboarding.tagline')}</p>
          <button onClick={handleQuickStart} className="onboarding-cta">
            {t('welcome.onboarding.cta')}
          </button>
          <p className="onboarding-steps">
            {t('welcome.onboarding.steps')}
          </p>
        </div>
      )}

      <div className="welcome-actions">
        <button onClick={() => navigate('/workspace')}>{t('welcome.startCreating')}</button>
        {maxTier >= 2 && (
          <button onClick={() => navigate('/templates')} className="secondary">
            {t('welcome.myTemplates')}
          </button>
        )}
        {maxTier >= 3 && (
          <button onClick={() => navigate('/storyboard')} className="secondary">
            {t('welcome.storyboard')}
          </button>
        )}
        {!firstTime && (
          <button onClick={() => navigate('/history')} className="secondary">
            {t('welcome.myHistory')}
          </button>
        )}
        <button onClick={() => navigate('/config')} className="secondary">
          {t('welcome.parentSettings')}
        </button>
      </div>
    </div>
  )
}
