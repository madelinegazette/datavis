import { createContext, useContext, useState, useCallback } from 'react'
import { useSettings } from '../hooks/useSettings'
import { useTripLog } from '../hooks/useTripLog'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { settings, update: updateSettings, updateNested: updateSettingsNested } = useSettings()
  const { trips, addTrip, removeTrip, exportTrips } = useTripLog()

  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)

  // Active session state
  const [destination, setDestination] = useState(null)
  const [rankedOptions, setRankedOptions] = useState([])
  const [routeLoading, setRouteLoading] = useState(false)

  const updateWeather = useCallback((data) => setWeather(data), [])

  return (
    <AppContext.Provider value={{
      settings, updateSettings, updateSettingsNested,
      trips, addTrip, removeTrip, exportTrips,
      weather, setWeather: updateWeather, weatherLoading, setWeatherLoading,
      location, setLocation, locationError, setLocationError,
      destination, setDestination,
      rankedOptions, setRankedOptions,
      routeLoading, setRouteLoading,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
