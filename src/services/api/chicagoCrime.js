// Chicago neighborhood safety tiers (fallback when API times out)
// Based on Chicago community areas, rough 0–1 scale (1 = safest)
const NEIGHBORHOOD_TIERS = {
  default: 0.55,
  loop: 0.70, river_north: 0.72, lincoln_park: 0.78, lakeview: 0.76,
  wicker_park: 0.68, bucktown: 0.68, logan_square: 0.62, ukranian_village: 0.65,
  west_town: 0.65, pilsen: 0.58, bridgeport: 0.60, hyde_park: 0.65,
  south_loop: 0.68, gold_coast: 0.80, streeterville: 0.78,
}

const VIOLENT_TYPES = ['ASSAULT', 'BATTERY', 'ROBBERY', 'HOMICIDE', 'CRIM SEXUAL ASSAULT']
const CRIME_API = 'https://data.cityofchicago.org/resource/ijzp-q8t2.json'

function bboxFromCoords(lat1, lng1, lat2, lng2, pad = 0.01) {
  return {
    minLat: Math.min(lat1, lat2) - pad,
    maxLat: Math.max(lat1, lat2) + pad,
    minLng: Math.min(lng1, lng2) - pad,
    maxLng: Math.max(lng1, lng2) + pad,
  }
}

export async function fetchCrimeScore(originCoords, destCoords) {
  const { minLat, maxLat, minLng, maxLng } = bboxFromCoords(
    originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng
  )

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)
  const where = [
    `date >= '${ninetyDaysAgo}T00:00:00.000'`,
    `latitude >= ${minLat}`, `latitude <= ${maxLat}`,
    `longitude >= ${minLng}`, `longitude <= ${maxLng}`,
    `(${VIOLENT_TYPES.map(t => `primary_type = '${t}'`).join(' OR ')})`,
  ].join(' AND ')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)

  try {
    const params = new URLSearchParams({ '$where': where, '$limit': 500, '$select': 'id' })
    const res = await fetch(`${CRIME_API}?${params}`, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) throw new Error('Crime API error')
    const data = await res.json()

    // Normalize: 0 crimes = 1.0 (safest), 100+ crimes = 0.3 (rough floor)
    const count = data.length
    const score = Math.max(0.30, 1.0 - (count / 100) * 0.70)
    return Math.round(score * 100) / 100
  } catch {
    clearTimeout(timeout)
    return NEIGHBORHOOD_TIERS.default
  }
}
