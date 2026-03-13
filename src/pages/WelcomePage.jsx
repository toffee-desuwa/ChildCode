import { useNavigate } from 'react-router-dom'

export default function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="page welcome-page">
      <h1>ChildCode</h1>
      <p>用积木创造你的画！</p>
      <div className="welcome-actions">
        <button onClick={() => navigate('/workspace')}>开始创作</button>
        <button onClick={() => navigate('/config')} className="secondary">
          家长设置
        </button>
      </div>
    </div>
  )
}
