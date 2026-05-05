import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export function DestinationBar({ onGo }) {
  const { settings } = useApp()
  const [input, setInput] = useState(settings.workAddress?.formatted ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return
    // If matches saved work address, use its coords
    if (settings.workAddress && input.trim() === settings.workAddress.formatted) {
      onGo(settings.workAddress)
    } else {
      // Pass as a string to geocode
      onGo({ formatted: input.trim(), needsGeocode: true })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-b border-dracula-line">
      <div className="text-xs text-dracula-comment font-mono uppercase tracking-wider mb-2">
        Destination
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Where are you going?"
          className="flex-1 bg-dracula-line/30 border border-dracula-line rounded-lg px-3 py-2 text-dracula-fg text-sm placeholder-dracula-comment focus:outline-none focus:border-dracula-purple transition-colors"
        />
        <button
          type="submit"
          className="bg-dracula-purple text-dracula-bg font-semibold text-sm px-4 py-2 rounded-lg active:opacity-80 transition-opacity whitespace-nowrap"
        >
          Go →
        </button>
      </div>
      {settings.workAddress && (
        <button
          type="button"
          className="text-xs text-dracula-comment hover:text-dracula-cyan mt-1 transition-colors"
          onClick={() => setInput(settings.workAddress.formatted)}
        >
          📍 {settings.workAddress.label || 'Work'}
        </button>
      )}
    </form>
  )
}
