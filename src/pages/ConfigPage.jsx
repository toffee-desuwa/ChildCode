import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadConfig, saveConfig, validateConfig, getUsageCount, resetUsageCount, loadHistory, loadMastery, loadStoryboard, loadTemplates, clearHistory } from '../config/storage'
import { AGE_TIERS, DEFAULT_AGE_TIER } from '../blocks/whitelist'
import { PROVIDERS } from '../generation/provider'

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
    setSaveMsg('保存成功（年龄段变更需刷新创作页生效）')
  }

  return (
    <div className="legacy-page page config-page">
      <h2>家长设置</h2>

      <div className="config-form">
        <label className="config-field">
          <span>API Key</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="请输入 API Key"
          />
          {errors.apiKey && <p className="field-error">{errors.apiKey}</p>}
        </label>

        <label className="config-field">
          <span>图片生成服务</span>
          <select value={provider} onChange={(e) => setProvider(e.target.value)}>
            {Object.entries(PROVIDERS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <p className="field-hint">国内用户可选择"OpenAI 兼容 API"并填写可用的 API 地址</p>
        </label>

        {PROVIDERS[provider]?.needsApiBase && (
          <label className="config-field">
            <span>API 地址</span>
            <input
              type="text"
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              placeholder="例如：https://api.siliconflow.cn"
            />
            <p className="field-hint">填写兼容 OpenAI 接口的 API 基础地址</p>
          </label>
        )}

        <label className="config-field">
          <span>创作次数上限</span>
          <input
            type="number"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="例如：20"
            min="1"
          />
          {errors.usageLimit && <p className="field-error">{errors.usageLimit}</p>}
        </label>

        <label className="config-field">
          <span>孩子年龄段</span>
          <select value={ageTier} onChange={(e) => setAgeTier(e.target.value)}>
            {Object.entries(AGE_TIERS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <p className="field-hint">年龄段决定可用积木种类：基础 4 类 → 扩展 +情绪/天气 → 进阶 +时间</p>
        </label>

        <div className="config-actions">
          <button onClick={handleSave}>保存设置</button>
          <button onClick={() => navigate('/')} className="secondary">返回首页</button>
        </div>

        {saveMsg && <p className="save-success">{saveMsg}</p>}

        <div className="usage-info">
          <p>已使用次数：{usageCount}{usageLimit ? ` / ${usageLimit}` : ''}</p>
          <button
            type="button"
            onClick={() => { resetUsageCount(); setUsageCount(0) }}
            className="secondary"
          >
            重置已使用次数
          </button>
        </div>
      </div>

      <ParentDashboard />
    </div>
  )
}

/**
 * 家长面板：查看孩子的表达成长轨迹和使用统计
 */
function ParentDashboard() {
  const [history] = useState(() => loadHistory())
  const [mastery] = useState(() => loadMastery())
  const [storyboard] = useState(() => loadStoryboard())
  const [templates] = useState(() => loadTemplates())
  const [cleared, setCleared] = useState(false)
  const [sevenDaysAgo] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000)

  // 掌握度等级
  const masteryLevel =
    mastery.singleChanges >= 15 ? '控制大师' :
    mastery.singleChanges >= 8 ? '积木达人' :
    mastery.singleChanges >= 3 ? '表达学徒' : '小探索者'

  // 精准度百分比
  const precision = mastery.totalComparisons > 0
    ? Math.round((mastery.singleChanges / mastery.totalComparisons) * 100)
    : 0

  // 最近7天活跃度
  const recentCount = history.filter(h => h.timestamp > sevenDaysAgo).length

  // 使用过的积木种类统计
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
    <section className="parent-dashboard">
      <h3>孩子的成长面板</h3>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-value">{history.length}</div>
          <div className="dashboard-label">总创作数</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-value">{recentCount}</div>
          <div className="dashboard-label">近7天创作</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-value">{mastery.totalComparisons}</div>
          <div className="dashboard-label">对比次数</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-value">{precision}%</div>
          <div className="dashboard-label">精准对比率</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h4>掌握度</h4>
        <p>当前等级：<strong>{masteryLevel}</strong>（{mastery.singleChanges} 次单块精准对比）</p>
        <p className="field-hint">精准对比 = 只改一个积木就生成对比，说明孩子在有意识地观察因果关系</p>
      </div>

      <div className="dashboard-section">
        <h4>积木探索广度</h4>
        {Object.keys(blockUsage).length > 0 ? (
          <ul className="dashboard-block-usage">
            {Object.entries(blockUsage).map(([type, values]) => (
              <li key={type}>
                <span className="block-type">{type}</span>
                <span className="dashboard-usage-count">用过 {values.size} 种</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="field-hint">还没有创作记录</p>
        )}
      </div>

      <div className="dashboard-section">
        <h4>创作资产</h4>
        <p>模板：{templates.length} 个 | 故事板帧：{storyboard.length} 帧</p>
      </div>

      <div className="dashboard-section">
        <h4>数据管理</h4>
        <button
          onClick={() => { clearHistory(); setCleared(true) }}
          className="secondary"
          disabled={cleared}
        >
          {cleared ? '历史已清空' : '清空创作历史'}
        </button>
      </div>
    </section>
  )
}
