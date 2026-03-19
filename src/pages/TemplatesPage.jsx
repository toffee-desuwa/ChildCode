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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">{t('templates.title')}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/workspace')}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {t('templates.back')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {t('templates.home')}
            </button>
          </div>
        </header>

        <p className="text-sm text-slate-500 mb-6">{t('templates.subtitle')}</p>

        {templates.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-700 p-12 text-center text-slate-500">
            <p>{t('templates.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((tpl) => (
              <div key={tpl.id} className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-4 flex flex-col gap-3">
                <h4 className="font-medium text-white">{tpl.name}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(tpl.blocks).map(([type, data]) => {
                    if (!data) return null
                    return (
                      <span key={type} className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs text-indigo-300">
                        {t('blocks.category.' + type)}: {data.value ? t('blocks.option.' + data.value) : data.label}
                      </span>
                    )
                  })}
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(tpl.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                </span>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleUse(tpl)}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                  >
                    {t('templates.use')}
                  </button>
                  <button
                    onClick={() => handleDelete(tpl.id)}
                    className="rounded-lg bg-slate-700 px-4 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-600 transition-colors"
                  >
                    {t('templates.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
