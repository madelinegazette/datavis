import { useApp } from '../../context/AppContext'
import { formatTemp } from '../../utils/format'

const OWM_ICON = (code) => `https://openweathermap.org/img/wn/${code}.png`

function precipLabel(weather) {
  if (weather.precipMmHour > 2.5) return 'Heavy rain'
  if (weather.precipChance > 0.6) return 'Likely rain'
  if (weather.precipChance > 0.3) return 'Chance of rain'
  return null
}

export function WeatherStrip() {
  const { weather, weatherLoading } = useApp()

  if (weatherLoading) {
    return (
      <div className="px-4 py-3 border-b border-dracula-line animate-pulse">
        <div className="h-10 bg-dracula-line/30 rounded-lg" />
      </div>
    )
  }

  if (!weather) return null

  const precip = precipLabel(weather)

  return (
    <div className="px-4 py-3 border-b border-dracula-line">
      <div className="flex items-center gap-3">
        {weather.conditionIcon && (
          <img src={OWM_ICON(weather.conditionIcon)} alt={weather.condition} className="w-10 h-10" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-semibold text-dracula-cyan">
              {formatTemp(weather.tempF)}
            </span>
            <span className="text-dracula-comment text-sm">
              Feels {formatTemp(weather.feelsLikeF)}
            </span>
          </div>
          <div className="text-dracula-comment text-xs capitalize flex gap-3 mt-0.5">
            <span>{weather.condition}</span>
            {weather.windMph > 5 && <span>💨 {weather.windMph}mph</span>}
            {precip && <span className="text-dracula-blue">{precip}</span>}
          </div>
        </div>
        <div className="text-right text-xs text-dracula-comment">
          {weather.hourly?.slice(0, 3).map((h, i) => (
            <div key={i} className="mono">{formatTemp(h.tempF)}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
