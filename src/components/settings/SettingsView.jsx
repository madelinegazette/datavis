import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { MODES, MODE_KEYS } from '../../constants/transport'
import { geocodeAddress } from '../../services/api/googleMaps'
import { storage } from '../../services/storage'

function Section({ title, children }) {
  return (
    <div className="border-b border-dracula-line pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <div className="text-xs font-mono text-dracula-purple uppercase tracking-wider mb-3">{title}</div>
      {children}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder, hint }) {
  return (
    <div className="mb-3">
      <label className="text-xs text-dracula-comment block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-dracula-line/30 border border-dracula-line rounded-lg px-3 py-2 text-dracula-fg text-sm focus:outline-none focus:border-dracula-purple transition-colors"
        autoComplete="off"
        spellCheck={false}
      />
      {hint && <p className="text-xs text-dracula-comment mt-1">{hint}</p>}
    </div>
  )
}

function AddressField({ label, value, apiKey, onSave }) {
  const [input, setInput] = useState(value?.formatted ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!input.trim()) return
    if (!apiKey) {
      // Save without geocoding — no coords
      onSave({ formatted: input.trim(), lat: null, lng: null })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
      return
    }
    setLoading(true)
    try {
      const result = await geocodeAddress(input.trim(), apiKey)
      onSave(result)
      setInput(result.formatted)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch {
      alert('Could not geocode that address. Check your Google Maps API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-3">
      <label className="text-xs text-dracula-comment block mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="123 Main St, Chicago, IL"
          className="flex-1 bg-dracula-line/30 border border-dracula-line rounded-lg px-3 py-2 text-dracula-fg text-sm focus:outline-none focus:border-dracula-purple transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className={`text-xs px-3 py-2 rounded-lg border transition-colors whitespace-nowrap ${
            saved
              ? 'bg-dracula-green/20 border-dracula-green text-dracula-green'
              : 'border-dracula-purple text-dracula-purple hover:bg-dracula-purple/10'
          }`}
        >
          {loading ? '…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export function SettingsView() {
  const { settings, updateSettings, updateNested } = useApp()
  const [keys, setKeys] = useState({ ...settings.apiKeys })
  const [rates, setRates] = useState({ ...settings.costRates })
  const [keysSaved, setKeysSaved] = useState(false)
  const [ratesSaved, setRatesSaved] = useState(false)

  function saveKeys(updatedKeys) {
    updateNested('apiKeys', updatedKeys)
    setKeysSaved(true)
    setTimeout(() => setKeysSaved(false), 1500)
  }

  function saveRates() {
    updateNested('costRates', { ...Object.fromEntries(Object.entries(rates).map(([k, v]) => [k, parseFloat(v)])) })
    setRatesSaved(true)
    setTimeout(() => setRatesSaved(false), 1500)
  }

  function handleClearData() {
    if (confirm('Delete ALL trip history? This cannot be undone.')) {
      storage.clearAll()
      window.location.reload()
    }
  }

  return (
    <div className="px-4 py-4 pb-8">
      <h1 className="font-mono font-bold text-dracula-purple text-lg mb-5">Settings</h1>

      <Section title="Locations">
        <AddressField
          label="🏠 Home Address"
          value={settings.homeAddress}
          apiKey={keys.googleMaps}
          onSave={addr => updateNested('homeAddress', { ...addr, label: 'Home' })}
        />
        <AddressField
          label="💼 Work Address"
          value={settings.workAddress}
          apiKey={keys.googleMaps}
          onSave={addr => updateNested('workAddress', { ...addr, label: 'Work' })}
        />
        <div className="mb-0">
          <label className="text-xs text-dracula-comment block mb-1">⏰ Preferred Departure Time</label>
          <input
            type="time"
            value={settings.preferredDepartureTime}
            onChange={e => updateSettings({ preferredDepartureTime: e.target.value })}
            className="bg-dracula-line/30 border border-dracula-line rounded-lg px-3 py-2 text-dracula-fg text-sm focus:outline-none focus:border-dracula-purple"
          />
          <p className="text-xs text-dracula-comment mt-1">Used to calculate lateness and adjust mode priority.</p>
        </div>
      </Section>

      <Section title="API Keys">
        <p className="text-xs text-dracula-comment mb-3">Keys are stored only on this device. Never sent to any server.</p>
        {[
          { key: 'googleMaps', label: 'Google Maps API Key', hint: 'Enable Directions, Geocoding. Get at console.cloud.google.com' },
          { key: 'openWeatherMap', label: 'OpenWeatherMap API Key', hint: 'Free at openweathermap.org/api' },
          { key: 'ctaTrains', label: 'CTA Train Tracker Key', hint: 'Free at transitchicago.com/developers' },
          { key: 'ctaBuses', label: 'CTA Bus Tracker Key', hint: 'Free at transitchicago.com/developers' },
        ].map(({ key, label, hint }) => (
          <Input
            key={key}
            label={label}
            value={keys[key]}
            onChange={v => { const updated = { ...keys, [key]: v }; setKeys(updated); saveKeys(updated) }}
            type="password"
            placeholder="Paste key here…"
            hint={hint}
          />
        ))}
        {keysSaved && (
          <p className="text-xs text-dracula-green mt-1">✓ Keys saved automatically</p>
        )}
      </Section>

      <Section title="Transport Modes">
        <div className="grid grid-cols-3 gap-2">
          {MODE_KEYS.map(k => {
            const m = MODES[k]
            const enabled = settings.enabledModes[k]
            return (
              <button
                key={k}
                onClick={() => updateNested('enabledModes', { [k]: !enabled })}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${
                  enabled
                    ? 'bg-dracula-line/20 border-2'
                    : 'border-dracula-line text-dracula-comment opacity-50'
                }`}
                style={enabled ? { borderColor: m.color, color: m.color } : {}}
              >
                <span className="text-xl">{m.icon}</span>
                <span className="font-medium leading-tight text-center">{m.label}</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Cost Rates">
        <p className="text-xs text-dracula-comment mb-3">Used to estimate commute costs.</p>
        {[
          { key: 'gasPerMile', label: 'Gas cost per mile ($)' },
          { key: 'parkingCostDollars', label: 'Daily parking cost ($)' },
          { key: 'lyftEstimatePerMile', label: 'Lyft estimate per mile ($)' },
          { key: 'limeUnlockCost', label: 'Lime unlock cost ($)' },
          { key: 'limeRatePerMin', label: 'Lime rate per minute ($)' },
          { key: 'divvySingleRideCost', label: 'Divvy single ride ($)' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3 mb-2">
            <label className="text-xs text-dracula-comment flex-1">{label}</label>
            <div className="relative w-24">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-dracula-comment text-xs">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={rates[key]}
                onChange={e => setRates(r => ({ ...r, [key]: e.target.value }))}
                className="w-full bg-dracula-line/30 border border-dracula-line rounded-lg pl-5 pr-2 py-1.5 text-dracula-fg text-sm focus:outline-none focus:border-dracula-purple"
              />
            </div>
          </div>
        ))}
        <button
          onClick={saveRates}
          className={`mt-2 text-sm px-4 py-2 rounded-lg border transition-colors ${
            ratesSaved
              ? 'bg-dracula-green/20 border-dracula-green text-dracula-green'
              : 'border-dracula-purple text-dracula-purple hover:bg-dracula-purple/10'
          }`}
        >
          {ratesSaved ? '✓ Rates Saved' : 'Save Cost Rates'}
        </button>
      </Section>

      <Section title="Data">
        <button
          onClick={handleClearData}
          className="text-sm px-4 py-2 rounded-lg border border-dracula-red/50 text-dracula-red hover:bg-dracula-red/10 transition-colors"
        >
          🗑 Clear All Data
        </button>
        <p className="text-xs text-dracula-comment mt-2">Deletes all trips and settings from this device.</p>
      </Section>
    </div>
  )
}
