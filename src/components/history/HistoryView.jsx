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
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-mono ${
                range === f
                  ? 'bg-dracula-purple/20 border-dracula-purple text-dracula-purple'
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
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'text-dracula-purple border-b-2 border-dracula-purple'
                : 'text-dracula-comment'
            }`}
          >
            {t === 'list' ? `Trips (${filtered.length})` : 'Trends'}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div className="px-4 mt-3 flex flex-col gap-2">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-dracula-comment">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-sm">No trips logged yet.</div>
              <div className="text-xs mt-1">Use the ✍️ button on the dashboard to log your first trip.</div>
            </div>
          )}
          {filtered.map(trip => {
            const meta = MODES[trip.mode]
            return (
              <div
                key={trip.id}
                className="flex items-center gap-3 bg-dracula-line/10 border border-dracula-line rounded-xl px-4 py-3"
                style={{ borderLeftColor: meta?.color, borderLeftWidth: 3 }}
              >
                <span className="text-2xl">{meta?.icon ?? '🚌'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-dracula-fg text-sm">{meta?.label ?? trip.mode}</span>
                    {trip.wasTopPick && (
                      <span className="text-xs text-dracula-green font-mono">✓ top pick</span>
                    )}
                  </div>
                  <div className="text-xs text-dracula-comment">{formatDate(trip.timestamp)}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-dracula-cyan">
                    {trip.durationMinutes != null ? minutesToDisplay(trip.durationMinutes) : '—'}
                  </div>
                  <div className="text-xs text-dracula-comment">{formatCost(trip.costDollars)}</div>
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
