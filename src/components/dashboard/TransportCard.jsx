import { MODES } from '../../constants/transport'
import { minutesToDisplay } from '../../utils/time'
import { formatCost, formatMiles } from '../../utils/format'
import { buildLyftLink, buildLimeLink, buildGoogleMapsLink } from '../../utils/deepLinks'

export function TransportCard({ option, isTop, destination, origin }) {
  const meta = MODES[option.mode]
  if (!meta) return null

  const color = meta.color

  const deepLink = (() => {
    if (option.mode === 'lyft' && origin && destination) return buildLyftLink(origin, destination)
    if (option.mode === 'limeScooter' && origin) return buildLimeLink(origin)
    if (origin && destination) return buildGoogleMapsLink(origin, destination, meta.gMapsMode)
    return null
  })()

  return (
    <div
      className={`relative rounded-xl border transition-all ${
        isTop
          ? 'border-2 bg-dracula-line/20'
          : 'border-dracula-line bg-dracula-line/10 hover:bg-dracula-line/20'
      }`}
      style={{ borderColor: isTop ? color : undefined }}
    >
      {isTop && (
        <div
          className="absolute -top-3 left-4 text-xs font-mono font-bold px-2 py-0.5 rounded-full"
          style={{ background: color, color: '#282a36' }}
        >
          TOP PICK
        </div>
      )}
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.icon}</span>
            <div>
              <div className="font-semibold text-dracula-fg text-sm">{meta.label}</div>
              {option.departures?.length > 0 && (
                <div className="text-xs text-dracula-comment mono">
                  Next: {option.departures.slice(0, 3).map(d => `${d}min`).join(' · ')}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-lg" style={{ color }}>
              {option.durationMinutes ? minutesToDisplay(option.durationMinutes) : '—'}
            </div>
            <div className="text-xs text-dracula-comment">
              {formatCost(option.estimatedCost)}
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div className="score-bar mb-3">
          <div
            className="score-bar-fill"
            style={{ width: `${option.score}%`, background: color }}
          />
        </div>

        {/* Detail row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs text-dracula-comment mono">
            {option.distanceMiles && <span>{formatMiles(option.distanceMiles)}</span>}
            {option.walkMinutes > 0 && <span>+{option.walkMinutes}m walk</span>}
            {option.waitMinutes > 0 && <span>{option.waitMinutes}m wait</span>}
          </div>
          {deepLink && (
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1 rounded-full border transition-colors"
              style={{ borderColor: `${color}66`, color }}
              onClick={e => e.stopPropagation()}
            >
              Open →
            </a>
          )}
        </div>

        {/* Alerts */}
        {option.alerts?.length > 0 && (
          <div className="mt-2 text-xs text-dracula-orange flex items-center gap-1">
            <span>⚠️</span>
            <span>{option.alerts[0]}</span>
          </div>
        )}
      </div>
    </div>
  )
}
