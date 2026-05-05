import { useState, useCallback } from 'react'
import { storage } from '../services/storage'

export function useSettings() {
  const [settings, setSettings] = useState(() => storage.getSettings())

  const update = useCallback((patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      storage.saveSettings(next)
      return next
    })
  }, [])

  const updateNested = useCallback((key, patch) => {
    setSettings(prev => {
      const next = { ...prev, [key]: { ...prev[key], ...patch } }
      storage.saveSettings(next)
      return next
    })
  }, [])

  return { settings, update, updateNested }
}
