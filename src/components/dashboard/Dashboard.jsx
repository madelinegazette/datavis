import { useEffect, useState, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { useGeolocation } from '../../hooks/useGeolocation'
import { WeatherStrip } from './WeatherStrip'
import { WearRecommendation } from './WearRecommendation'
import { DestinationBar } from './DestinationBar'
import { TransportCard } from './TransportCard'
import { Spinner } from '../common/Spinner'
import { ErrorBanner } from '../common/ErrorBanner'
import { fetchCurrentWeather } from '../../services/api/openWeather'
import { fetchAllDirections, geocodeAddress } from '../../services/api/googleMaps'
import { fetchTrainArrivals, findNearestStation } from '../../services/api/ctaTrains'
import { fetchBusPredictions, findNearbyStops } from '../../services/api/ctaBuses'
import { fetchNearbyDivvyStations } from '../../services/api/divvy'
import { fetchCrimeScore } from '../../services/api/chicagoCrime'
import { rankOptions } from '../../services/scoring'
import { wearRecommendation } from '../../services/wearRecommendation'
import { latenessScore } from '../../utils/time'
import { MODES } from '../../constants/transport'

function buildOptions(directions, ctaArrivals, busPredictions, divvyStations, settings) {
  const enabled = settings.enabledModes
  const opts = []

  if (enabled.bike && directions.biking) {
    opts.push({ mode: 'bike', ...directions.biking, walkMinutes: 0, waitMinutes: 0, transfers: 0 })
  }
  if (enabled.walk && directions.walking) {
    opts.push({ mode: 'walk', ...directions.walking, walkMinutes: 0, waitMinutes: 0, transfers: 0 })
  }
  if (enabled.limeScooter && directions.biking) {
    opts.push({ mode: 'limeScooter', ...directions.biking, walkMinutes: 2, waitMinutes: 2, transfers: 0 })
  }

  // Divvy
  if (enabled.divvyBike && directions.biking) {
    const station = divvyStations.find(s => s.bikesAvailable > 0)
    const walkToStation = station ? Math.round(station.distanceMiles * 20) : 5 // rough walk min
    opts.push({
      mode: 'divvyBike',
      ...directions.biking,
      durationMinutes: (directions.biking.durationMinutes ?? 0) + walkToStation,
      walkMinutes: walkToStation,
      waitMinutes: 0,
      transfers: 0,
      alerts: divvyStations.length === 0 ? ['No Divvy stations nearby'] :
               station ? [] : ['No bikes available at nearest station'],
    })
  }

  // CTA Train
  if (enabled.ctaTrain && directions.transit) {
    const trainDeps = ctaArrivals.slice(0, 3).map(a => a.minutesAway)
    const waitMin = trainDeps[0] ?? 8
    opts.push({
      mode: 'ctaTrain',
      ...directions.transit,
      walkMinutes: 5,
      waitMinutes: waitMin,
      transfers: directions.transit.transitDetails?.length > 1 ? 1 : 0,
      departures: trainDeps,
      alerts: ctaArrivals.some(a => a.isDelayed) ? ['Delays reported on this line'] : [],
    })
  }

  // CTA Bus
  if (enabled.ctaBus && directions.transit) {
    const busDeps = busPredictions.slice(0, 3).map(p => p.minutesAway)
    const waitMin = busDeps[0] ?? 10
    opts.push({
      mode: 'ctaBus',
      ...directions.transit,
      durationMinutes: (directions.transit.durationMinutes ?? 0) + 5,
      walkMinutes: 3,
      waitMinutes: waitMin,
      transfers: 0,
      departures: busDeps,
      alerts: busPredictions.some(p => p.isDelayed) ? ['Bus delays reported'] : [],
    })
  }

  // Driving options
  if (directions.driving) {
    if (enabled.lyft) {
      opts.push({ mode: 'lyft', ...directions.driving, walkMinutes: 0, waitMinutes: 5, transfers: 0 })
    }
    if (enabled.driveAndPark) {
      opts.push({ mode: 'driveAndPark', ...directions.driving, walkMinutes: 3, waitMinutes: 0, transfers: 0 })
    }
    if (enabled.driveDropOff) {
      opts.push({ mode: 'driveDropOff', ...directions.driving, walkMinutes: 1, waitMinutes: 0, transfers: 0 })
    }
  }

  return opts
}

export function Dashboard() {
  const { settings, weather, setWeather, setWeatherLoading, location, setLocation, setLocationError, rankedOptions, setRankedOptions, routeLoading, setRouteLoading, destination, setDestination } = useApp()

  const [error, setError] = useState(null)
  const [wearItems, setWearItems] = useState([])

  const fallback = settings.homeAddress ?? { lat: 41.8781, lng: -87.6298 }
  const geo = useGeolocation(fallback)

  // Sync geolocation into context
  useEffect(() => {
    if (geo.location) setLocation(geo.location)
    if (geo.error) setLocationError(geo.error)
  }, [geo.location, geo.error])

  // Load weather whenever location is known
  useEffect(() => {
    if (!geo.location || !settings.apiKeys.openWeatherMap) return
    setWeatherLoading(true)
    fetchCurrentWeather(geo.location.lat, geo.location.lng, settings.apiKeys.openWeatherMap)
      .then(w => { setWeather(w); setWeatherLoading(false) })
      .catch(() => setWeatherLoading(false))
  }, [geo.location?.lat, geo.location?.lng, settings.apiKeys.openWeatherMap])

  // Update wear recommendation when weather or top option changes
  useEffect(() => {
    if (weather && rankedOptions.length > 0) {
      setWearItems(wearRecommendation(weather, rankedOptions[0].mode))
    }
  }, [weather, rankedOptions])

  const handleGo = useCallback(async (dest) => {
    const origin = geo.location ?? fallback
    if (!settings.apiKeys.googleMaps) {
      setError('Add your Google Maps API key in Settings to get route options.')
      return
    }

    let resolvedDest = dest
    if (dest.needsGeocode) {
      try {
        resolvedDest = await geocodeAddress(dest.formatted, settings.apiKeys.googleMaps)
      } catch {
        setError('Could not find that address. Try again.')
        return
      }
    }

    setDestination(resolvedDest)
    setRouteLoading(true)
    setError(null)

    try {
      const [directions, crimeScore, divvyStations] = await Promise.all([
        fetchAllDirections(origin, resolvedDest, settings.apiKeys.googleMaps),
        fetchCrimeScore(origin, resolvedDest),
        fetchNearbyDivvyStations(origin.lat, origin.lng),
      ])

      // CTA real-time (optional, fail silently)
      let ctaArrivals = []
      let busPredictions = []
      if (settings.apiKeys.ctaTrains) {
        try {
          const station = findNearestStation(origin.lat, origin.lng)
          if (station && station.distanceMiles < 0.75) {
            ctaArrivals = await fetchTrainArrivals(station.mapid, settings.apiKeys.ctaTrains)
          }
        } catch { /* ignore */ }
      }
      if (settings.apiKeys.ctaBuses) {
        try {
          const stops = findNearbyStops(origin.lat, origin.lng)
          if (stops.length > 0) {
            busPredictions = await fetchBusPredictions(stops[0].stpid, settings.apiKeys.ctaBuses)
          }
        } catch { /* ignore */ }
      }

      const rawOptions = buildOptions(directions, ctaArrivals, busPredictions, divvyStations, settings)
      const lateness = latenessScore(settings.preferredDepartureTime)
      const ranked = rankOptions(rawOptions, weather, crimeScore, settings, lateness)
      setRankedOptions(ranked)
    } catch (err) {
      setError('Failed to load routes. Check your API key and connection.')
    } finally {
      setRouteLoading(false)
    }
  }, [geo.location, settings, weather])

  // Auto-load if work address is saved and we have an API key
  useEffect(() => {
    if (settings.workAddress && settings.apiKeys.googleMaps && geo.location && !rankedOptions.length && !routeLoading) {
      handleGo(settings.workAddress)
    }
  }, [geo.location?.lat, geo.location?.lng, settings.apiKeys.googleMaps])

  const topMode = rankedOptions[0]?.mode

  return (
    <div className="flex flex-col pb-4">
      <WeatherStrip />
      <DestinationBar onGo={handleGo} />

      {!settings.apiKeys.openWeatherMap && (
        <div className="mx-4 mt-3 text-xs text-dracula-comment bg-dracula-line/20 rounded-lg px-3 py-2">
          💡 Add API keys in <strong>Settings</strong> to enable weather, routes, and real-time transit.
        </div>
      )}

      {error && (
        <div className="px-4 mt-3">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {topMode && <WearRecommendation items={wearItems} />}

      <div className="px-4 mt-4">
        {routeLoading && (
          <div className="flex flex-col items-center gap-3 py-10 text-dracula-comment">
            <Spinner size="lg" />
            <span className="text-sm">Calculating best routes…</span>
          </div>
        )}

        {!routeLoading && rankedOptions.length === 0 && !error && (
          <div className="text-center py-10 text-dracula-comment">
            <div className="text-4xl mb-3">🗺️</div>
            <div className="text-sm">Enter your destination above to see commute options.</div>
          </div>
        )}

        {!routeLoading && rankedOptions.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-xs text-dracula-comment font-mono uppercase tracking-wider">
              {rankedOptions.length} options ranked
            </div>
            {rankedOptions.map((opt, i) => (
              <TransportCard
                key={opt.mode}
                option={opt}
                isTop={i === 0}
                origin={geo.location ?? fallback}
                destination={destination}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
