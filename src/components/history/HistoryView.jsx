import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { MODES } from '../../constants/transport'
import { formatDate, minutesToDisplay } from '../../utils/time'
import { formatCost } from '../../utils/format'
import { TrendCharts } from './TrendCharts'

const FILTERS = ['All', '7d', '30d', '90d']

function filterTrips(trips, range) {
  if (range === 'All') return trips
  const days = parseInt(range)
  const cutoff = Date.now() - days * 86400000
  return trips.filter(t => t.timestamp >= cutoff)
}

export function HistoryView() {
  const { trips, exportTrips } = useApp()
  const [range, setRange] = useState('30d')
  const [tab, setTab] = useState('list') // 'list' | 'trends'

  const filtered = useMemo(() => filterTrips(trips, range).slice().reverse(), [trips, range])

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="px-4 py-4 border-b border-dracula-line">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-mono font-bold text-dracula-purple text-lg">Trip History</h1>
          <button
            onClick={exportTrips}
            className="text-xs text-dracula-comment hover:text-dracula-cyan transition-colors border border-dracula-line rounded-lg px-3 py-1.5"
          >
            Export JSON
          </button>
        </div>

        {/* Range filter */}
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setRange(f)}
              className={`text-xs px-3 py-1.5 border transition-colors font-mono uppercase tracking-wider ${
                range === f
                  ? 'border-dracula-purple text-dracula-purple'
                  : 'border-dracula-line text-dracula-comment hover:border-dracula-comment'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dracula-line">
        {['list', 'trends'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors border-t-2 ${
              tab === t
                ? 'text-dracula-purple border-dracula-purple'
                : 'text-dracula-comment border-transparent'
            }`}
          >
            {t === 'list' ? `Trips · ${filtered.length}` : 'Trends'}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div className="px-4 mt-3 flex flex-col gap-2">
          {filtered.length === 0 && (
            <div className="py-12 text-dracula-comment font-mono text-sm uppercase tracking-wider text-center">
              No trips logged yet.
            </div>
          )}
          {filtered.map(trip => {
            const meta = MODES[trip.mode]
            return (
              <div
                key={trip.id}
                className="flex items-stretch border border-dracula-line/40 bg-dracula-bgDark overflow-hidden"
              >
                <div
                  className="w-10 flex-shrink-0 flex items-center justify-center"
                  style={{ background: meta?.color ?? '#6272a4' }}
                >
                  <span className="font-mono font-bold text-xs" style={{ color: '#1e2029' }}>
                    {meta?.code ?? '?'}
                  </span>
                </div>
                <div className="flex-1 flex items-center gap-3 px-3 py-2.5 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-dracula-fg text-sm uppercase tracking-wide">{meta?.label ?? trip.mode}</span>
                      {trip.wasTopPick && (
                        <span className="text-xs text-dracula-green font-mono">top pick</span>
                      )}
                    </div>
                    <div className="text-xs text-dracula-comment font-mono">{formatDate(trip.timestamp)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono text-sm" style={{ color: meta?.color ?? '#8be9fd' }}>
                      {trip.durationMinutes != null ? minutesToDisplay(trip.durationMinutes) : '—'}
                    </div>
                    <div className="text-xs text-dracula-comment font-mono">{formatCost(trip.costDollars)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'trends' && <TrendCharts trips={filtered} allTrips={trips} />}
    </div>
  )
}
