import { useApp } from '../../context/AppContext'

export function TopBar() {
  const { location, weather, weatherLoading, locationError } = useApp()

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-dracula-line bg-dracula-bgDark safe-top">
      <div className="flex items-center gap-2">
        <span className="text-xl">🚇</span>
        <span className="font-mono font-semibold text-dracula-purple tracking-wider text-sm">
          COMMUTE
        </span>
      </div>
      <div className="flex items-center gap-3 text-dracula-comment text-xs mono">
        {locationError ? (
          <span title={locationError} className="text-dracula-orange">📍 Manual</span>
        ) : location ? (
          <span className="text-dracula-green">📍 Located</span>
        ) : (
          <span className="animate-pulse">📍 Locating…</span>
        )}
        {weatherLoading && <span className="animate-pulse">🌡 Loading…</span>}
        {weather && !weatherLoading && (
          <span className="text-dracula-cyan">{Math.round(weather.tempF)}°F</span>
        )}
      </div>
    </header>
  )
}
