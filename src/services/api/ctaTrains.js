import STATIONS from '../../data/ctaStations.json'
import { haversineDistance } from '../../utils/geo'

const BASE = 'https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx'

export function findNearestStation(lat, lng) {
  let best = null
  let bestDist = Infinity
  for (const s of STATIONS) {
    const d = haversineDistance(lat, lng, s.lat, s.lng)
    if (d < bestDist) {
      bestDist = d
      best = { ...s, distanceMiles: Math.round(d * 10) / 10 }
    }
  }
  return best
}

export async function fetchTrainArrivals(mapId, apiKey) {
  const params = new URLSearchParams({ key: apiKey, mapid: mapId, max: 5, outputType: 'JSON' })
  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error(`CTA Train API ${res.status}`)
  const data = await res.json()
  const arrivals = data.ctatt?.eta ?? []
  return arrivals.map(a => ({
    route: a.rt,
    destName: a.destNm,
    arrT: a.arrT,
    minutesAway: Math.max(0, Math.round((new Date(a.arrT) - Date.now()) / 60000)),
    isApproaching: a.isApp === '1',
    isDelayed: a.isDly === '1',
  }))
}
