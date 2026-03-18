import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import WorkspacePage from './pages/WorkspacePage'
import ConfigPage from './pages/ConfigPage'
import HistoryPage from './pages/HistoryPage'
import TemplatesPage from './pages/TemplatesPage'
import StoryboardPage from './pages/StoryboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/storyboard" element={<StoryboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}
