import BUS_STOPS from '../../data/ctaBusStops.json'
import { haversineDistance } from '../../utils/geo'

const BASE = 'https://www.ctabustracker.com/bustime/api/v2'

export function findNearbyStops(lat, lng, radiusMiles = 0.25) {
  return BUS_STOPS
    .map(s => ({ ...s, distanceMiles: haversineDistance(lat, lng, s.lat, s.lng) }))
    .filter(s => s.distanceMiles <= radiusMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, 5)
}

export async function fetchBusPredictions(stopId, apiKey) {
  const params = new URLSearchParams({ key: apiKey, stpid: stopId, top: 3, format: 'json' })
  const res = await fetch(`${BASE}/getpredictions?${params}`)
  if (!res.ok) throw new Error(`CTA Bus API ${res.status}`)
  const data = await res.json()
  const preds = data['bustime-response']?.prd ?? []
  return preds.map(p => ({
    route: p.rt,
    direction: p.rtdir,
    stopName: p.stpnm,
    prdtm: p.prdtm,
    minutesAway: p.prdctdn === 'DUE' ? 0 : parseInt(p.prdctdn, 10),
    isDelayed: p.dly,
  }))
}
