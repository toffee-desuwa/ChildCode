import { useNavigate } from 'react-router-dom'
import { loadConfig, isFirstTimeUser } from '../config/storage'
import { AGE_TIERS, DEFAULT_AGE_TIER, BLOCK_CATEGORIES } from '../blocks/whitelist'

const WELCOME_TEXT = {
  1: { title: 'ChildCode', subtitle: '用积木创造你的画！' },
  2: { title: 'ChildCode', subtitle: '用积木组合表达，看 AI 怎么理解你的想法' },
  3: { title: 'ChildCode', subtitle: '用结构化表达控制 AI 输出，探索输入与结果的关系' },
}

/**
 * 随机选一组积木（每类随机一个），用于快速体验
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
  const config = loadConfig()
  const ageTier = config?.ageTier || DEFAULT_AGE_TIER
  const maxTier = AGE_TIERS[ageTier]?.maxTier ?? 1
  const text = WELCOME_TEXT[maxTier]
  const firstTime = isFirstTimeUser()

  const handleQuickStart = () => {
    const blocks = getRandomBlocks()
    navigate('/workspace', { state: { templateBlocks: blocks, onboarding: true } })
  }

  return (
    <div className={`page welcome-page age-tier-${maxTier}`}>
      <h1>{text.title}</h1>
      <p>{text.subtitle}</p>

      {firstTime && (
        <div className="onboarding-hero">
          <p className="onboarding-tagline">第一次来？30 秒体验 AI 画画的魔法！</p>
          <button onClick={handleQuickStart} className="onboarding-cta">
            一键试试
          </button>
          <p className="onboarding-steps">
            拖积木 → 点生成 → 看画面！
          </p>
        </div>
      )}

      <div className="welcome-actions">
        <button onClick={() => navigate('/workspace')}>开始创作</button>
        {maxTier >= 2 && (
          <button onClick={() => navigate('/templates')} className="secondary">
            我的模板
          </button>
        )}
        {maxTier >= 3 && (
          <button onClick={() => navigate('/storyboard')} className="secondary">
            故事板
          </button>
        )}
        {!firstTime && (
          <button onClick={() => navigate('/history')} className="secondary">
            我的历史
          </button>
        )}
        <button onClick={() => navigate('/config')} className="secondary">
          家长设置
        </button>
      </div>
    </div>
  )
}
