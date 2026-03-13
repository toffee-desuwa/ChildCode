import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BlocklyEditor from '../components/BlocklyEditor'
import { isComplete, hasDuplicates, getDuplicateMessage } from '../blocks/exportJson'
import { getConfigStatus, loadConfig } from '../config/storage'
import { derivePrompt } from '../generation/derivePrompt'
import { generateImage } from '../generation/provider'

const CONFIG_STATUS_TEXT = {
  not_configured: '未配置 — 请让爸爸妈妈先完成设置',
  configured: '已配置',
  invalid: '配置无效 — 请让爸爸妈妈检查设置',
}

export default function WorkspacePage() {
  const navigate = useNavigate()
  const [currentJson, setCurrentJson] = useState(null)
  const [imageA, setImageA] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  const configStatus = getConfigStatus()
  const complete = currentJson && isComplete(currentJson)
  const duplicated = currentJson && hasDuplicates(currentJson)
  const duplicateMsg = currentJson && getDuplicateMessage(currentJson)

  const canGenerate = complete && !duplicated && configStatus === 'configured' && !generating

  const handleGenerate = async () => {
    if (!canGenerate) return

    setGenerating(true)
    setError(null)

    try {
      const prompt = derivePrompt(currentJson)
      if (!prompt) {
        setError('积木组合不完整，无法生成')
        return
      }

      const config = loadConfig()
      const result = await generateImage(prompt, config)
      setImageA(result.url)
    } catch (err) {
      setError(err.message || '图片生成遇到了一点问题，再试一次？')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="page workspace-page">
      <header className="workspace-header">
        <h2>ChildCode 创作区</h2>
        <button onClick={() => navigate('/')} className="secondary">
          返回首页
        </button>
      </header>

      <div className="workspace-layout">
        <section className="blocks-area">
          <h3>积木搭建区</h3>
          <BlocklyEditor onJsonChange={setCurrentJson} />
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="generate-btn"
          >
            {generating ? '生成中…' : '生成图片'}
          </button>
          {configStatus !== 'configured' && (
            <p className="status-hint">请先完成家长设置才能生成</p>
          )}
        </section>

        <section className="preview-area">
          <div className="image-slot">
            <h3>第一张图</h3>
            {imageA ? (
              <img src={imageA} alt="生成的图片" className="generated-image" />
            ) : (
              <div className="placeholder-box image-placeholder">
                <p>{generating ? '正在生成…' : '图片预览 A（占位）'}</p>
              </div>
            )}
          </div>

          <div className="image-slot">
            <h3>第二张图</h3>
            <div className="placeholder-box image-placeholder">
              <p>图片预览 B（占位）</p>
            </div>
          </div>
        </section>
      </div>

      {error && (
        <section className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="secondary">关闭</button>
        </section>
      )}

      <section className="json-preview">
        <h3>JSON 真相层 <span className="dev-badge">开发调试</span></h3>
        {duplicated ? (
          <>
            <pre className="json-output json-invalid">积木组合无效（存在重复类别）</pre>
            <p className="status-error">{duplicateMsg}</p>
          </>
        ) : (
          <>
            <pre className="json-output">
              {currentJson ? JSON.stringify(currentJson, null, 2) : '尚未选择积木'}
            </pre>
            {currentJson && !complete && (
              <p className="status-hint">还差积木哦，把四类都拖过来吧！</p>
            )}
            {complete && (
              <p className="status-ready">四类积木已齐全</p>
            )}
          </>
        )}
      </section>

      <section className="compare-area">
        <h3>对比区</h3>
        <div className="placeholder-box">
          <p>两张图对比展示（占位）</p>
        </div>
      </section>

      <section className="status-area">
        <div className={`config-status config-${configStatus}`}>
          <span>家长配置：{CONFIG_STATUS_TEXT[configStatus]}</span>
          {configStatus !== 'configured' && (
            <button onClick={() => navigate('/config')} className="secondary">
              前往设置
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
