import { useNavigate } from 'react-router-dom'
import { loadConfig } from '../config/storage'
import { AGE_TIERS, DEFAULT_AGE_TIER } from '../blocks/whitelist'

const WELCOME_TEXT = {
  1: { title: 'ChildCode', subtitle: '用积木创造你的画！' },
  2: { title: 'ChildCode', subtitle: '用积木组合表达，看 AI 怎么理解你的想法' },
  3: { title: 'ChildCode', subtitle: '用结构化表达控制 AI 输出，探索输入与结果的关系' },
}

export default function WelcomePage() {
  const navigate = useNavigate()
  const config = loadConfig()
  const ageTier = config?.ageTier || DEFAULT_AGE_TIER
  const maxTier = AGE_TIERS[ageTier]?.maxTier ?? 1
  const text = WELCOME_TEXT[maxTier]

  return (
    <div className={`page welcome-page age-tier-${maxTier}`}>
      <h1>{text.title}</h1>
      <p>{text.subtitle}</p>
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
        <button onClick={() => navigate('/history')} className="secondary">
          我的历史
        </button>
        <button onClick={() => navigate('/config')} className="secondary">
          家长设置
        </button>
      </div>
    </div>
  )
}
