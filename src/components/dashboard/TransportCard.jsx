import { MODES } from '../../constants/transport'
import { minutesToDisplay } from '../../utils/time'
import { formatCost, formatMiles } from '../../utils/format'
import { buildLyftLink, buildLimeLink, buildGoogleMapsLink } from '../../utils/deepLinks'

export function TransportCard({ option, isTop, destination, origin, onAccept, accepted }) {
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
    <div className="flex overflow-hidden border border-dracula-line/40 bg-dracula-bgDark">
      {/* Bold color panel */}
      <div
        className="w-14 flex-shrink-0 flex flex-col items-center justify-center gap-1"
        style={{ background: color }}
      >
        <span className="font-mono font-bold text-base leading-none" style={{ color: '#1e2029' }}>
          {meta.code}
        </span>
        {isTop && (
          <span className="text-[7px] font-mono font-bold uppercase tracking-widest leading-none" style={{ color: '#1e2029' }}>
            TOP
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-3">
        {/* Header row */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-mono font-semibold text-dracula-fg text-sm tracking-wide uppercase">
              {meta.label}
            </div>
            {option.departures?.length > 0 && (
              <div className="text-xs text-dracula-comment mono mt-0.5">
                {option.departures.slice(0, 3).map(d => `${d}m`).join(' · ')}
              </div>
            )}
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <div className="font-mono font-bold text-lg leading-none" style={{ color }}>
              {option.durationMinutes ? minutesToDisplay(option.durationMinutes) : '—'}
            </div>
            <div className="text-xs text-dracula-comment mono mt-0.5">
              {formatCost(option.estimatedCost)}
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-px bg-dracula-line mb-2">
          <div className="h-px transition-all duration-500" style={{ width: `${option.score}%`, background: color }} />
        </div>

        {/* Detail + actions row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-xs text-dracula-comment mono">
            {option.distanceMiles && <span>{formatMiles(option.distanceMiles)}</span>}
            {option.walkMinutes > 0 && <span>+{option.walkMinutes}m walk</span>}
            {option.waitMinutes > 0 && <span>{option.waitMinutes}m wait</span>}
          </div>
          <div className="flex items-center gap-2">
            {deepLink && (
              <a
                href={deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono uppercase tracking-wider px-2 py-1 border transition-colors"
                style={{ borderColor: `${color}55`, color }}
                onClick={e => e.stopPropagation()}
              >
                Open
              </a>
            )}
            {onAccept && (
              <button
                onClick={() => onAccept(option)}
                disabled={accepted}
                className="text-xs font-mono uppercase tracking-wider px-2 py-1 border transition-all"
                style={accepted
                  ? { borderColor: '#50fa7b66', color: '#50fa7b' }
                  : { borderColor: `${color}66`, color }
                }
              >
                {accepted ? 'Logged' : 'Take this'}
              </button>
            )}
          </div>
        </div>

        {/* Alert */}
        {option.alerts?.length > 0 && (
          <div className="mt-2 text-xs text-dracula-orange font-mono">
            / {option.alerts[0]}
          </div>
        )}
      </div>
    </div>
  )
}
