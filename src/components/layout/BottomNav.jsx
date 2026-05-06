import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/',         label: 'Commute'  },
  { to: '/history',  label: 'History'  },
  { to: '/settings', label: 'Settings' },
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
            `flex-1 flex items-center justify-center py-3.5 font-mono text-xs uppercase tracking-widest transition-colors border-t-2 ${
              isActive
                ? 'text-dracula-purple border-dracula-purple'
                : 'text-dracula-comment border-transparent hover:text-dracula-fg'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
