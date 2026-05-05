import { haversineDistance } from '../../utils/geo'

const INFO_URL = 'https://gbfs.divvybikes.com/gbfs/en/station_information.json'
const STATUS_URL = 'https://gbfs.divvybikes.com/gbfs/en/station_status.json'

export async function fetchNearbyDivvyStations(lat, lng, radiusMiles = 0.5) {
  const [infoRes, statusRes] = await Promise.all([
    fetch(INFO_URL),
    fetch(STATUS_URL),
  ])
  if (!infoRes.ok || !statusRes.ok) throw new Error('Divvy GBFS unavailable')

  const [infoData, statusData] = await Promise.all([infoRes.json(), statusRes.json()])

  const statusMap = {}
  for (const s of statusData.data.stations) statusMap[s.station_id] = s

  return infoData.data.stations
    .map(s => {
      const status = statusMap[s.station_id] ?? {}
      return {
        id: s.station_id,
        name: s.name,
        lat: s.lat,
        lng: s.lon,
        bikesAvailable: status.num_bikes_available ?? 0,
        docksAvailable: status.num_docks_available ?? 0,
        distanceMiles: haversineDistance(lat, lng, s.lat, s.lon),
      }
    })
    .filter(s => s.distanceMiles <= radiusMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, 3)
}
