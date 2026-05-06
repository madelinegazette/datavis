import { useApp } from '../../context/AppContext'

export function TopBar() {
  const { location, weather, weatherLoading, locationError } = useApp()

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-dracula-line bg-dracula-bgDark safe-top">
      <span className="font-mono font-bold tracking-[0.2em] text-sm text-dracula-fg">
        CCD
      </span>
      <div className="flex items-center gap-4 font-mono text-xs tracking-wider">
        {locationError ? (
          <span className="text-dracula-orange uppercase">Manual</span>
        ) : location ? (
          <span className="text-dracula-green uppercase">Located</span>
        ) : (
          <span className="text-dracula-comment uppercase animate-pulse">Locating</span>
        )}
        {weatherLoading && (
          <span className="text-dracula-comment uppercase animate-pulse">Weather</span>
        )}
        {weather && !weatherLoading && (
          <span className="text-dracula-cyan">{Math.round(weather.tempF)}°F</span>
        )}
      </div>
    </header>
  )
}
