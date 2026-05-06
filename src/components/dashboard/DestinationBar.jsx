import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export function DestinationBar({ onGo }) {
  const { settings } = useApp()
  const [input, setInput] = useState('')

  const saved = [
    settings.workAddress && { label: settings.workAddress.label || 'Work', addr: settings.workAddress },
    settings.homeAddress && { label: settings.homeAddress.label || 'Home', addr: settings.homeAddress },
  ].filter(Boolean)

  function handleSubmit(e) {
    e.preventDefault()
    const val = input.trim()
    if (!val) return
    const match = [settings.workAddress, settings.homeAddress].find(a => a?.formatted === val)
    if (match?.lat) {
      onGo(match)
    } else {
      onGo({ formatted: val, needsGeocode: true })
    }
  }

  function handleQuick(addr) {
    if (addr.lat) {
      onGo(addr)
    } else {
      setInput(addr.formatted ?? '')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-b border-dracula-line">
      <div className="flex gap-2 mb-1">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Where to?"
          autoComplete="off"
          className="flex-1 bg-transparent border-b border-dracula-line px-0 py-2 text-dracula-fg text-sm font-mono placeholder-dracula-comment/40 focus:outline-none focus:border-dracula-purple transition-colors"
        />
        <button
          type="submit"
          className="font-mono font-bold text-xs uppercase tracking-widest text-dracula-bg px-4 py-2 bg-dracula-purple flex-shrink-0"
        >
          Go
        </button>
      </div>
      {saved.length > 0 && (
        <div className="flex gap-3 mt-2">
          {saved.map(({ label, addr }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleQuick(addr)}
              className="text-xs font-mono uppercase tracking-wider text-dracula-comment hover:text-dracula-purple transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
