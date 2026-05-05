import { useState, useCallback } from 'react'
import { storage } from '../services/storage'

export function useTripLog() {
  const [trips, setTrips] = useState(() => storage.getTrips())

  const addTrip = useCallback((entry) => {
    storage.saveTrip(entry)
    setTrips(storage.getTrips())
  }, [])

  const removeTrip = useCallback((id) => {
    storage.deleteTrip(id)
    setTrips(storage.getTrips())
  }, [])

  const exportTrips = useCallback(() => {
    const blob = storage.exportTripsJSON()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commute-trips-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  return { trips, addTrip, removeTrip, exportTrips }
}
