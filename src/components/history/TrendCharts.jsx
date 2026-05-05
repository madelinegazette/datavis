import { useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { MODES } from '../../constants/transport'

const CHART_COLORS = ['#bd93f9', '#50fa7b', '#8be9fd', '#ffb86c', '#ff79c6', '#f1fa8c', '#ff5555', '#6272a4', '#f8f8f2']

function isoWeek(ts) {
  const d = new Date(ts)
  const day = d.getDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return `W${Math.ceil(((d - yearStart) / 86400000 + 1) / 7)}`
}

function useWeeklyDuration(trips) {
  return useMemo(() => {
    const map = {}
    for (const t of trips) {
      if (t.durationMinutes == null) continue
      const w = isoWeek(t.timestamp)
      if (!map[w]) map[w] = { week: w, total: 0, count: 0 }
      map[w].total += t.durationMinutes
      map[w].count++
    }
    return Object.values(map)
      .sort((a, b) => a.week.localeCompare(b.week))
      .map(w => ({ week: w.week, avgMin: Math.round(w.total / w.count) }))
  }, [trips])
}

function useModeShare(trips) {
  return useMemo(() => {
    const map = {}
    for (const t of trips) {
      map[t.mode] = (map[t.mode] ?? 0) + 1
    }
    return Object.entries(map).map(([mode, count]) => ({
      name: MODES[mode]?.label ?? mode,
      value: count,
      color: MODES[mode]?.color ?? '#6272a4',
    }))
  }, [trips])
}

function useWeeklyCost(trips) {
  return useMemo(() => {
    const map = {}
    for (const t of trips) {
      if (t.costDollars == null) continue
      const w = isoWeek(t.timestamp)
      map[w] = (map[w] ?? 0) + t.costDollars
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, total]) => ({ week, total: Math.round(total * 100) / 100 }))
  }, [trips])
}

const tooltipStyle = {
  backgroundColor: '#282a36',
  border: '1px solid #44475a',
  borderRadius: 8,
  color: '#f8f8f2',
  fontSize: 12,
  fontFamily: 'JetBrains Mono, monospace',
}

export function TrendCharts({ trips }) {
  const weekly = useWeeklyDuration(trips)
  const modeShare = useModeShare(trips)
  const weeklyCost = useWeeklyCost(trips)

  const topPickRate = useMemo(() => {
    if (!trips.length) return null
    const took = trips.filter(t => t.wasTopPick).length
    return Math.round((took / trips.length) * 100)
  }, [trips])

  if (trips.length === 0) {
    return (
      <div className="text-center py-10 text-dracula-comment px-4">
        <div className="text-4xl mb-3">📈</div>
        <div className="text-sm">Log at least a few trips to see trends here.</div>
      </div>
    )
  }

  return (
    <div className="px-4 mt-4 flex flex-col gap-8 pb-4">
      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dracula-line/20 border border-dracula-line rounded-xl p-3 text-center">
          <div className="text-2xl font-mono font-bold text-dracula-cyan">{trips.length}</div>
          <div className="text-xs text-dracula-comment mt-1">Trips</div>
        </div>
        {topPickRate != null && (
          <div className="bg-dracula-line/20 border border-dracula-line rounded-xl p-3 text-center">
            <div className="text-2xl font-mono font-bold text-dracula-green">{topPickRate}%</div>
            <div className="text-xs text-dracula-comment mt-1">Top Pick</div>
          </div>
        )}
        {weeklyCost.length > 0 && (
          <div className="bg-dracula-line/20 border border-dracula-line rounded-xl p-3 text-center">
            <div className="text-2xl font-mono font-bold text-dracula-orange">
              ${(weeklyCost.reduce((s, w) => s + w.total, 0) / weeklyCost.length).toFixed(0)}
            </div>
            <div className="text-xs text-dracula-comment mt-1">Avg/wk</div>
          </div>
        )}
      </div>

      {/* Mode share donut */}
      {modeShare.length > 0 && (
        <div>
          <div className="text-xs font-mono text-dracula-comment uppercase tracking-wider mb-3">Mode Share</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={modeShare} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {modeShare.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v, n]} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={v => <span style={{ color: '#f8f8f2', fontSize: 11 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weekly duration trend */}
      {weekly.length > 1 && (
        <div>
          <div className="text-xs font-mono text-dracula-comment uppercase tracking-wider mb-3">Avg Commute Time (min)</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weekly} margin={{ left: -20, right: 10 }}>
              <XAxis dataKey="week" tick={{ fill: '#6272a4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6272a4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v} min`, 'Avg']} />
              <Line type="monotone" dataKey="avgMin" stroke="#bd93f9" strokeWidth={2} dot={{ fill: '#bd93f9', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weekly cost */}
      {weeklyCost.length > 1 && (
        <div>
          <div className="text-xs font-mono text-dracula-comment uppercase tracking-wider mb-3">Weekly Transit Cost ($)</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyCost} margin={{ left: -20, right: 10 }}>
              <XAxis dataKey="week" tick={{ fill: '#6272a4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6272a4', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${v}`, 'Cost']} />
              <Bar dataKey="total" fill="#ffb86c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
