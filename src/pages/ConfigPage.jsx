import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadConfig, saveConfig, validateConfig, getUsageCount, resetUsageCount } from '../config/storage'

function getInitialConfig() {
  const config = loadConfig()
  return {
    apiKey: config?.apiKey || '',
    usageLimit: config?.usageLimit ? String(config.usageLimit) : '',
  }
}

export default function ConfigPage() {
  const navigate = useNavigate()
  const initial = getInitialConfig()
  const [apiKey, setApiKey] = useState(initial.apiKey)
  const [usageLimit, setUsageLimit] = useState(initial.usageLimit)
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

    saveConfig({ apiKey: apiKey.trim(), usageLimit: Number(usageLimit) })
    setSaveMsg('保存成功')
  }

  return (
    <div className="page config-page">
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
    </div>
  )
}
