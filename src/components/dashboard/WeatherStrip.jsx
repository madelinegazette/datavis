import { useApp } from '../../context/AppContext'
import { formatTemp } from '../../utils/format'

function precipLabel(weather) {
  if (weather.precipMmHour > 2.5) return 'Heavy rain'
  if (weather.precipChance > 0.6) return 'Rain likely'
  if (weather.precipChance > 0.3) return 'Rain possible'
  return null
}

export function WeatherStrip() {
  const { weather, weatherLoading } = useApp()

  if (weatherLoading) {
    return (
      <div className="px-4 py-3 border-b border-dracula-line animate-pulse">
        <div className="h-8 bg-dracula-line/20" />
      </div>
    )
  }

  if (!weather) return null

  const precip = precipLabel(weather)

  return (
    <div className="px-4 py-2.5 border-b border-dracula-line flex items-center gap-5 overflow-x-auto">
      <span className="font-mono font-bold text-2xl text-dracula-cyan flex-shrink-0">
        {formatTemp(weather.tempF)}
      </span>
      <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-dracula-comment flex-shrink-0">
        <span className="text-dracula-fg">{weather.condition}</span>
        <span>Feels {formatTemp(weather.feelsLikeF)}</span>
        {weather.windMph > 5 && <span>{weather.windMph} mph wind</span>}
        {precip && <span className="text-dracula-orange">{precip}</span>}
        {weather.precipChance > 0 && (
          <span>{Math.round(weather.precipChance * 100)}% precip</span>
        )}
      </div>
      {weather.hourly?.length > 0 && (
        <div className="ml-auto flex gap-3 text-xs font-mono text-dracula-comment flex-shrink-0">
          {weather.hourly.slice(0, 3).map((h, i) => (
            <span key={i}>{formatTemp(h.tempF)}</span>
          ))}
        </div>
      )}
    </div>
  )
}
