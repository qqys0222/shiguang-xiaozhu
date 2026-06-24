import { useLocation, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/record', label: '记录', icon: '✏️' },
  { path: '/plan', label: '计划', icon: '📋' },
  { path: '/log', label: '日志', icon: '📖' },
  { path: '/summary', label: '总结', icon: '📊' },
  { path: '/settings', label: '设置', icon: '⚙️' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const current = location.pathname

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.path}
          className={`nav-item ${current === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
