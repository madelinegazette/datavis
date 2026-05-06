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
      <div className="text-xs font-mono uppercase tracking-[0.15em] text-dracula-comment mb-2">
        Destination
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Address or place"
          className="flex-1 bg-transparent border-b border-dracula-line px-0 py-2 text-dracula-fg text-sm font-mono placeholder-dracula-comment/50 focus:outline-none focus:border-dracula-purple transition-colors"
        />
        <button
          type="submit"
          className="font-mono font-bold text-xs uppercase tracking-widest text-dracula-bg px-4 py-2 bg-dracula-purple active:opacity-80 transition-opacity whitespace-nowrap"
        >
          Go
        </button>
      </div>
      {settings.workAddress && (
        <button
          type="button"
          className="text-xs font-mono text-dracula-comment hover:text-dracula-cyan mt-2 uppercase tracking-wider transition-colors"
          onClick={() => setInput(settings.workAddress.formatted)}
        >
          {settings.workAddress.label || 'Work'}
        </button>
      )}
    </form>
  )
}
