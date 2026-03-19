import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadTemplates, deleteTemplate } from '../config/storage'
import { useI18n } from '../i18n'

export default function TemplatesPage() {
  const navigate = useNavigate()
  const { t, lang } = useI18n()
  const [templates, setTemplates] = useState(() => loadTemplates())

  const handleUse = (template) => {
    navigate('/workspace', { state: { templateBlocks: template.blocks } })
  }

  const handleDelete = (id) => {
    deleteTemplate(id)
    setTemplates(loadTemplates())
  }

  return (
    <div className="legacy-page page templates-page">
      <header className="templates-header">
        <h2>{t('templates.title')}</h2>
        <div className="templates-header-actions">
          <button onClick={() => navigate('/workspace')} className="secondary">
            {t('templates.back')}
          </button>
          <button onClick={() => navigate('/')} className="secondary">
            {t('templates.home')}
          </button>
        </div>
      </header>

      <p className="templates-subtitle">
        {t('templates.subtitle')}
      </p>

      {templates.length === 0 ? (
        <div className="placeholder-box">
          <p>{t('templates.empty')}</p>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map((tpl) => (
            <div key={tpl.id} className="template-card">
              <h4 className="template-name">{tpl.name}</h4>
              <ul className="template-blocks">
                {Object.entries(tpl.blocks).map(([type, data]) => {
                  if (!data) return null
                  return (
                    <li key={type}>
                      <span className="block-type">{t('blocks.category.' + type)}</span>
                      <span className="block-value">{data.value ? t('blocks.option.' + data.value) : data.label}</span>
                    </li>
                  )
                })}
              </ul>
              <div className="template-meta">
                {new Date(tpl.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
              </div>
              <div className="template-actions">
                <button onClick={() => handleUse(tpl)}>{t('templates.use')}</button>
                <button onClick={() => handleDelete(tpl.id)} className="secondary">
                  {t('templates.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
