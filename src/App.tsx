import { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/appStore'
import BottomNav from './components/BottomNav'
import RecordPage from './pages/RecordPage'
import PlanPage from './pages/PlanPage'
import LogPage from './pages/LogPage'
import SummaryPage from './pages/SummaryPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const { loadAll, theme } = useStore()

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <HashRouter>
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/record" replace />} />
          <Route path="/record" element={<RecordPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <BottomNav />
    </HashRouter>
  )
}
