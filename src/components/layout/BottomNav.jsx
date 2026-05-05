import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/',         icon: '🏠', label: 'Dashboard' },
  { to: '/history',  icon: '📊', label: 'History'   },
  { to: '/settings', icon: '⚙️', label: 'Settings'  },
]

export function BottomNav() {
  return (
    <nav className="flex border-t border-dracula-line bg-dracula-bgDark safe-bottom">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
              isActive ? 'text-dracula-purple' : 'text-dracula-comment hover:text-dracula-fg'
            }`
          }
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span className="font-medium">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
