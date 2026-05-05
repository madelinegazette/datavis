const DIRECTIONS_BASE = 'https://maps.googleapis.com/maps/api/directions/json'

function parseDuration(legs) {
  return legs.reduce((s, l) => s + (l.duration_in_traffic?.value ?? l.duration.value), 0)
}

function parseDistance(legs) {
  return legs.reduce((s, l) => s + l.distance.value, 0)
}

async function fetchDirections(origin, dest, mode, apiKey, extra = {}) {
  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${dest.lat},${dest.lng}`,
    mode,
    key: apiKey,
    departure_time: 'now',
    ...extra,
  })

  const res = await fetch(`${DIRECTIONS_BASE}?${params}`)
  if (!res.ok) throw new Error(`Directions API ${res.status}`)
  const data = await res.json()
  if (data.status !== 'OK') throw new Error(`Directions: ${data.status}`)

  const route = data.routes[0]
  const legs = route.legs
  const durationSec = parseDuration(legs)
  const distanceM = parseDistance(legs)

  return {
    durationMinutes: Math.round(durationSec / 60),
    distanceMiles: Math.round(distanceM / 1609.34 * 10) / 10,
    polyline: route.overview_polyline?.points ?? '',
    steps: legs.flatMap(l => l.steps ?? []),
    warnings: route.warnings ?? [],
    transitDetails: legs.flatMap(l =>
      (l.steps ?? [])
        .filter(s => s.travel_mode === 'TRANSIT')
        .map(s => s.transit_details)
    ).filter(Boolean),
  }
}

export async function fetchAllDirections(origin, dest, apiKey) {
  const [biking, walking, transit, driving] = await Promise.allSettled([
    fetchDirections(origin, dest, 'bicycling', apiKey),
    fetchDirections(origin, dest, 'walking', apiKey),
    fetchDirections(origin, dest, 'transit', apiKey, { transit_mode: 'bus|subway' }),
    fetchDirections(origin, dest, 'driving', apiKey, { traffic_model: 'best_guess' }),
  ])

  return {
    biking:  biking.status  === 'fulfilled' ? biking.value  : null,
    walking: walking.status === 'fulfilled' ? walking.value : null,
    transit: transit.status === 'fulfilled' ? transit.value : null,
    driving: driving.status === 'fulfilled' ? driving.value : null,
  }
}

// Geocode an address string to lat/lng
export async function geocodeAddress(address, apiKey) {
  const params = new URLSearchParams({ address, key: apiKey })
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`)
  if (!res.ok) throw new Error(`Geocode API ${res.status}`)
  const data = await res.json()
  if (data.status !== 'OK') throw new Error(`Geocode: ${data.status}`)
  const loc = data.results[0].geometry.location
  return { lat: loc.lat, lng: loc.lng, formatted: data.results[0].formatted_address }
}
