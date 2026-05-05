const TRIPS_KEY = 'ccd_trips_v1'
const SETTINGS_KEY = 'ccd_settings_v1'

export const DEFAULT_SETTINGS = {
  version: 1,
  homeAddress: null,
  workAddress: null,
  apiKeys: {
    googleMaps: '',
    openWeatherMap: '',
    ctaTrains: '',
    ctaBuses: '',
  },
  enabledModes: {
    bike: true,
    walk: true,
    ctaBus: true,
    ctaTrain: true,
    limeScooter: true,
    divvyBike: true,
    lyft: true,
    driveAndPark: true,
    driveDropOff: true,
  },
  costRates: {
    gasPerMile: 0.21,
    parkingCostDollars: 20,
    lyftEstimatePerMile: 1.80,
    limeUnlockCost: 1.00,
    limeRatePerMin: 0.32,
    divvySingleRideCost: 1.00,
  },
  preferredDepartureTime: '08:30',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const storage = {
  getSettings() {
    const saved = read(SETTINGS_KEY, {})
    return { ...DEFAULT_SETTINGS, ...saved, apiKeys: { ...DEFAULT_SETTINGS.apiKeys, ...(saved.apiKeys || {}) }, enabledModes: { ...DEFAULT_SETTINGS.enabledModes, ...(saved.enabledModes || {}) }, costRates: { ...DEFAULT_SETTINGS.costRates, ...(saved.costRates || {}) } }
  },

  saveSettings(settings) {
    return write(SETTINGS_KEY, settings)
  },

  getTrips() {
    return read(TRIPS_KEY, [])
  },

  saveTrip(entry) {
    const trips = storage.getTrips()
    trips.push(entry)
    return write(TRIPS_KEY, trips)
  },

  deleteTrip(id) {
    const trips = storage.getTrips().filter(t => t.id !== id)
    return write(TRIPS_KEY, trips)
  },

  exportTripsJSON() {
    const data = JSON.stringify(storage.getTrips(), null, 2)
    return new Blob([data], { type: 'application/json' })
  },

  clearAll() {
    localStorage.removeItem(TRIPS_KEY)
    localStorage.removeItem(SETTINGS_KEY)
  },
}
