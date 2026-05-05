import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { BottomSheet } from '../common/BottomSheet'
import { useApp } from '../../context/AppContext'
import { MODES, MODE_KEYS } from '../../constants/transport'
import { formatCost } from '../../utils/format'

export function TripLogger({ open, onClose }) {
  const { addTrip, weather, rankedOptions, location, destination, settings } = useApp()

  const topMode = rankedOptions[0]?.mode ?? 'ctaTrain'
  const [mode, setMode] = useState(topMode)
  const [departedAt, setDepartedAt] = useState(() => new Date().toTimeString().slice(0, 5))
  const [arrivedAt, setArrivedAt] = useState('')
  const [notes, setNotes] = useState('')
  const [cost, setCost] = useState('')
  const [saving, setSaving] = useState(false)

  function durationMinutes() {
    if (!arrivedAt) return null
    const [dh, dm] = departedAt.split(':').map(Number)
    const [ah, am] = arrivedAt.split(':').map(Number)
    return Math.max(0, (ah * 60 + am) - (dh * 60 + dm))
  }

  function handleSave() {
    setSaving(true)
    const now = new Date()
    const [dh, dm] = departedAt.split(':').map(Number)
    const depTs = new Date(now)
    depTs.setHours(dh, dm, 0, 0)

    const dur = durationMinutes()
    const arrTs = dur != null ? new Date(depTs.getTime() + dur * 60000) : null

    const predicted = rankedOptions.find(o => o.mode === mode)?.durationMinutes ?? null

    addTrip({
      id: uuidv4(),
      timestamp: depTs.getTime(),
      arrivalTimestamp: arrTs?.getTime() ?? null,
      durationMinutes: dur,
      mode,
      origin: location ? { lat: location.lat, lng: location.lng, label: settings.homeAddress?.label ?? 'Origin' } : null,
      destination: destination ? { lat: destination.lat, lng: destination.lng, label: destination.formatted ?? 'Destination' } : null,
      distanceMiles: rankedOptions.find(o => o.mode === mode)?.distanceMiles ?? null,
      costDollars: cost ? parseFloat(cost) : null,
      weatherSnapshot: weather ? {
        tempF: weather.tempF,
        condition: weather.condition,
        windMph: weather.windMph,
        precipChance: weather.precipChance,
      } : null,
      notes,
      wasTopPick: mode === topMode,
      predictedDurationMinutes: predicted,
    })

    setNotes('')
    setCost('')
    setSaving(false)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Log Trip">
      <div className="flex flex-col gap-5">
        {/* Mode selector */}
        <div>
          <label className="text-xs font-mono text-dracula-comment uppercase tracking-wider block mb-2">Mode Used</label>
          <div className="grid grid-cols-3 gap-2">
            {MODE_KEYS.filter(k => settings.enabledModes[k]).map(k => {
              const m = MODES[k]
              return (
                <button
                  key={k}
                  onClick={() => setMode(k)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                    mode === k
                      ? 'border-2 bg-dracula-line/20'
                      : 'border-dracula-line text-dracula-comment hover:border-dracula-comment'
                  }`}
                  style={mode === k ? { borderColor: m.color, color: m.color } : {}}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="font-medium leading-tight text-center">{m.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Times */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-mono text-dracula-comment uppercase tracking-wider block mb-1">Departed</label>
            <input
              type="time"
              value={departedAt}
              onChange={e => setDepartedAt(e.target.value)}
              className="w-full bg-dracula-line/30 border border-dracula-line rounded-lg px-3 py-2 text-dracula-fg text-sm focus:outline-none focus:border-dracula-purple"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-mono text-dracula-comment uppercase tracking-wider block mb-1">Arrived</label>
            <input
              type="time"
              value={arrivedAt}
              onChange={e => setArrivedAt(e.target.value)}
              className="w-full bg-dracula-line/30 border border-dracula-line rounded-lg px-3 py-2 text-dracula-fg text-sm focus:outline-none focus:border-dracula-purple"
            />
          </div>
        </div>

        {durationMinutes() != null && (
          <div className="text-sm text-dracula-green font-mono text-center -mt-2">
            ⏱ {durationMinutes()} min commute
          </div>
        )}

        {/* Cost */}
        <div>
          <label className="text-xs font-mono text-dracula-comment uppercase tracking-wider block mb-1">Cost (optional)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dracula-comment">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={e => setCost(e.target.value)}
              placeholder="0.00"
              className="w-full bg-dracula-line/30 border border-dracula-line rounded-lg pl-7 pr-3 py-2 text-dracula-fg text-sm focus:outline-none focus:border-dracula-purple"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-mono text-dracula-comment uppercase tracking-wider block mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Delays, observations…"
            rows={2}
            className="w-full bg-dracula-line/30 border border-dracula-line rounded-lg px-3 py-2 text-dracula-fg text-sm resize-none focus:outline-none focus:border-dracula-purple"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-dracula-purple text-dracula-bg font-bold py-3 rounded-xl text-sm active:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Trip'}
        </button>
      </div>
    </BottomSheet>
  )
}
