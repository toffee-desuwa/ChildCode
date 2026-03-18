import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadTemplates, deleteTemplate } from '../config/storage'
import { CATEGORY_LABELS } from '../blocks/whitelist'

export default function TemplatesPage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState(() => loadTemplates())

  const handleUse = (template) => {
    navigate('/workspace', { state: { templateBlocks: template.blocks } })
  }

  const handleDelete = (id) => {
    deleteTemplate(id)
    setTemplates(loadTemplates())
  }

  return (
    <div className="page templates-page">
      <header className="templates-header">
        <h2>我的模板</h2>
        <div className="templates-header-actions">
          <button onClick={() => navigate('/workspace')} className="secondary">
            返回创作
          </button>
          <button onClick={() => navigate('/')} className="secondary">
            返回首页
          </button>
        </div>
      </header>

      <p className="templates-subtitle">
        保存常用的积木组合，下次创作可以直接用
      </p>

      {templates.length === 0 ? (
        <div className="placeholder-box">
          <p>还没有保存模板，去创作区试试「存为模板」吧</p>
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
                      <span className="block-type">{CATEGORY_LABELS[type]}</span>
                      <span className="block-value">{data.label}</span>
                    </li>
                  )
                })}
              </ul>
              <div className="template-meta">
                {new Date(tpl.createdAt).toLocaleDateString('zh-CN')}
              </div>
              <div className="template-actions">
                <button onClick={() => handleUse(tpl)}>使用模板</button>
                <button onClick={() => handleDelete(tpl.id)} className="secondary">
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
