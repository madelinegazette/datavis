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
import { haversineDistance } from '../../utils/geo'

function isAtOrigin(origin, address) {
  if (!origin || !address?.lat) return false
  return haversineDistance(origin.lat, origin.lng, address.lat, address.lng) < 0.15
}

function buildOptions(directions, ctaArrivals, busPredictions, divvyStations, settings, origin) {
  const enabled = settings.enabledModes
  const rates = settings.costRates
  const atWork = isAtOrigin(origin, settings.workAddress)
  const opts = []

  if (enabled.bike && directions.biking) {
    opts.push({ mode: 'bike', ...directions.biking, walkMinutes: 0, waitMinutes: 0, transfers: 0 })
  }
  if (enabled.walk && directions.walking) {
    opts.push({ mode: 'walk', ...directions.walking, walkMinutes: 0, waitMinutes: 0, transfers: 0 })
  }
  if (enabled.limeScooter && directions.biking) {
    const cost = rates.limeUnlockCost + rates.limeRatePerMin * (directions.biking.durationMinutes ?? 20)
    opts.push({ mode: 'limeScooter', ...directions.biking, walkMinutes: 2, waitMinutes: 2, transfers: 0, precomputedCost: cost })
  }
  if (enabled.divvyBike && directions.biking) {
    const station = divvyStations.find(s => s.bikesAvailable > 0)
    const walkToStation = station ? Math.round(station.distanceMiles * 20) : 5
    opts.push({
      mode: 'divvyBike',
      ...directions.biking,
      durationMinutes: (directions.biking.durationMinutes ?? 0) + walkToStation,
      walkMinutes: walkToStation,
      waitMinutes: 0,
      transfers: 0,
      precomputedCost: rates.divvySingleRideCost,
      alerts: divvyStations.length === 0 ? ['No Divvy stations nearby'] :
               station ? [] : ['No bikes available at nearest station'],
    })
  }
  if (enabled.ctaTrain && directions.transit) {
    const trainDeps = ctaArrivals.slice(0, 3).map(a => a.minutesAway)
    opts.push({
      mode: 'ctaTrain',
      ...directions.transit,
      walkMinutes: 5,
      waitMinutes: trainDeps[0] ?? 8,
      transfers: directions.transit.transitDetails?.length > 1 ? 1 : 0,
      departures: trainDeps,
      precomputedCost: 2.50,
      alerts: ctaArrivals.some(a => a.isDelayed) ? ['Delays reported on this line'] : [],
    })
  }
  if (enabled.ctaBus && directions.transit) {
    const busDeps = busPredictions.slice(0, 3).map(p => p.minutesAway)
    opts.push({
      mode: 'ctaBus',
      ...directions.transit,
      durationMinutes: (directions.transit.durationMinutes ?? 0) + 5,
      walkMinutes: 3,
      waitMinutes: busDeps[0] ?? 10,
      transfers: 0,
      departures: busDeps,
      precomputedCost: 2.50,
      alerts: busPredictions.some(p => p.isDelayed) ? ['Bus delays reported'] : [],
    })
  }
  if (directions.driving) {
    const gasCost = (directions.driving.distanceMiles ?? 4) * rates.gasPerMile
    if (enabled.lyft) {
      const lyftCost = Math.max(5, 1.80 + 1.85 * (directions.driving.distanceMiles ?? 4) + 0.30 * (directions.driving.durationMinutes ?? 20))
      opts.push({ mode: 'lyft', ...directions.driving, walkMinutes: 0, waitMinutes: 5, transfers: 0, precomputedCost: lyftCost })
    }
    if (!atWork && enabled.driveAndPark) {
      opts.push({ mode: 'driveAndPark', ...directions.driving, walkMinutes: 3, waitMinutes: 0, transfers: 0, precomputedCost: gasCost + rates.parkingCostDollars })
    }
    if (!atWork && enabled.driveDropOff) {
      opts.push({ mode: 'driveDropOff', ...directions.driving, walkMinutes: 1, waitMinutes: 0, transfers: 0, precomputedCost: gasCost * 2 })
    }
  }

  return opts
}

export function Dashboard() {
  const { settings, weather, setWeather, setWeatherLoading, location, setLocation, setLocationError, rankedOptions, setRankedOptions, routeLoading, setRouteLoading, destination, setDestination, addTrip } = useApp()

  const [error, setError] = useState(null)
  const [wearItems, setWearItems] = useState([])
  const [acceptedMode, setAcceptedMode] = useState(null)

  const fallback = settings.homeAddress ?? { lat: 41.8781, lng: -87.6298 }
  const geo = useGeolocation(fallback)

  useEffect(() => {
    if (geo.location) setLocation(geo.location)
    if (geo.error) setLocationError(geo.error)
  }, [geo.location, geo.error])

  useEffect(() => {
    if (!geo.location || !settings.apiKeys.openWeatherMap) return
    setWeatherLoading(true)
    fetchCurrentWeather(geo.location.lat, geo.location.lng, settings.apiKeys.openWeatherMap)
      .then(w => { setWeather(w); setWeatherLoading(false) })
      .catch(() => setWeatherLoading(false))
  }, [geo.location?.lat, geo.location?.lng, settings.apiKeys.openWeatherMap])

  useEffect(() => {
    if (weather && rankedOptions.length > 0) {
      setWearItems(wearRecommendation(weather, rankedOptions[0].mode))
    }
  }, [weather, rankedOptions])

  const handleGo = useCallback(async (dest) => {
    const origin = geo.location ?? fallback
    const isDemo = !settings.apiKeys.googleMaps

    let resolvedDest = dest
    if (!isDemo && dest.needsGeocode) {
      try {
        resolvedDest = await geocodeAddress(dest.formatted, settings.apiKeys.googleMaps)
      } catch {
        setError('Could not geocode that address. Check your Google Maps API key.')
        return
      }
    }

    setDestination(resolvedDest)
    setRouteLoading(true)
    setError(null)

    try {
      let directions, crimeScore, divvyStations

      if (isDemo) {
        directions = {
          biking:  { durationMinutes: 22, distanceMiles: 4.1 },
          walking: { durationMinutes: 58, distanceMiles: 3.9 },
          transit: { durationMinutes: 31, distanceMiles: 5.2, transitDetails: [] },
          driving: { durationMinutes: 17, distanceMiles: 4.3 },
        }
        crimeScore = 0.62
        divvyStations = [{ bikesAvailable: 3, distanceMiles: 0.15 }]
      } else {
        ;[directions, crimeScore, divvyStations] = await Promise.all([
          fetchAllDirections(origin, resolvedDest, settings.apiKeys.googleMaps),
          fetchCrimeScore(origin, resolvedDest),
          fetchNearbyDivvyStations(origin.lat, origin.lng),
        ])
      }

      let ctaArrivals = isDemo ? [{ minutesAway: 4 }, { minutesAway: 11 }, { minutesAway: 19 }] : []
      let busPredictions = isDemo ? [{ minutesAway: 6 }, { minutesAway: 14 }] : []
      if (!isDemo && settings.apiKeys.ctaTrains) {
        try {
          const station = findNearestStation(origin.lat, origin.lng)
          if (station && station.distanceMiles < 0.75) {
            ctaArrivals = await fetchTrainArrivals(station.mapid, settings.apiKeys.ctaTrains)
          }
        } catch { /* ignore */ }
      }
      if (!isDemo && settings.apiKeys.ctaBuses) {
        try {
          const stops = findNearbyStops(origin.lat, origin.lng)
          if (stops.length > 0) {
            busPredictions = await fetchBusPredictions(stops[0].stpid, settings.apiKeys.ctaBuses)
          }
        } catch { /* ignore */ }
      }

      const rawOptions = buildOptions(directions, ctaArrivals, busPredictions, divvyStations, settings, origin)
      const lateness = latenessScore(settings.preferredDepartureTime)
      const ranked = rankOptions(rawOptions, weather, crimeScore, settings, lateness)
      setRankedOptions(ranked)
    } catch (err) {
      setError('Failed to load routes. Check your connection.')
    } finally {
      setRouteLoading(false)
    }
  }, [geo.location, settings, weather])

  const handleAcceptTrip = useCallback((option) => {
    addTrip({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      arrivalTimestamp: Date.now() + (option.durationMinutes ?? 20) * 60000,
      durationMinutes: option.durationMinutes,
      predictedDurationMinutes: option.durationMinutes,
      mode: option.mode,
      origin: geo.location ?? fallback,
      destination,
      distanceMiles: option.distanceMiles,
      costDollars: option.estimatedCost,
      weatherSnapshot: weather ? {
        tempF: weather.tempF,
        condition: weather.condition,
        windMph: weather.windMph,
        precipChance: weather.precipChance,
      } : null,
      wasTopPick: option.rank === 1,
      notes: '',
    })
    setAcceptedMode(option.mode)
    setTimeout(() => setAcceptedMode(null), 3000)
  }, [geo.location, destination, weather, addTrip])

  const topMode = rankedOptions[0]?.mode

  return (
    <div className="flex flex-col pb-4">
      <WeatherStrip />
      <DestinationBar onGo={handleGo} />

      {!settings.apiKeys.googleMaps && (
        <div className="mx-4 mt-3 text-xs text-dracula-comment font-mono bg-dracula-line/10 border-l-2 border-dracula-comment/40 px-3 py-2">
          Demo mode — add a Google Maps key in Settings for live routes.
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
          <div className="flex flex-col items-center gap-3 py-12 text-dracula-comment">
            <Spinner size="lg" />
            <span className="text-xs font-mono uppercase tracking-widest">Calculating routes</span>
          </div>
        )}

        {!routeLoading && rankedOptions.length === 0 && !error && (
          <div className="py-12 text-dracula-comment font-mono text-xs uppercase tracking-widest text-center">
            Enter a destination above.
          </div>
        )}

        {!routeLoading && rankedOptions.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-xs text-dracula-comment font-mono uppercase tracking-wider">
              {rankedOptions.length} options ranked
            </div>
            {acceptedMode && (
              <div className="text-xs font-mono text-dracula-green border-l-2 border-dracula-green px-3 py-2 uppercase tracking-wider">
                Trip logged — safe travels.
              </div>
            )}
            {rankedOptions.map((opt, i) => (
              <TransportCard
                key={opt.mode}
                option={opt}
                isTop={i === 0}
                origin={geo.location ?? fallback}
                destination={destination}
                onAccept={handleAcceptTrip}
                accepted={acceptedMode === opt.mode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
