import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './components/dashboard/Dashboard'
import { HistoryView } from './components/history/HistoryView'
import { SettingsView } from './components/settings/SettingsView'
import { QuickLogFAB } from './components/trip/QuickLogFAB'

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="history" element={<HistoryView />} />
            <Route path="settings" element={<SettingsView />} />
          </Route>
        </Routes>
        <QuickLogFAB />
      </HashRouter>
    </AppProvider>
  )
}
