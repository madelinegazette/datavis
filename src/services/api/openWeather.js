const BASE = 'https://api.openweathermap.org/data/2.5'

function toF(k) { return Math.round((k - 273.15) * 9 / 5 + 32) }
function mpsToMph(mps) { return Math.round(mps * 2.237) }

function normalizeCondition(item) {
  return {
    tempF: toF(item.main.temp),
    feelsLikeF: toF(item.main.feels_like),
    humidity: item.main.humidity,
    condition: item.weather[0]?.description ?? '',
    conditionCode: item.weather[0]?.id ?? 800,
    conditionIcon: item.weather[0]?.icon ?? '01d',
    windMph: mpsToMph(item.wind?.speed ?? 0),
    windGustMph: mpsToMph(item.wind?.gust ?? 0),
    precipChance: item.pop ?? 0,
    precipMmHour: item.rain?.['1h'] ?? item.snow?.['1h'] ?? 0,
    visibility: item.visibility ? Math.round(item.visibility / 1609) : 10,
  }
}

export async function fetchCurrentWeather(lat, lng, apiKey) {
  const res = await fetch(
    `${BASE}/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&cnt=8`
  )
  if (!res.ok) throw new Error(`Weather API ${res.status}`)
  const data = await res.json()

  const current = normalizeCondition(data.list[0])
  current.sunrise = data.city.sunrise * 1000
  current.sunset = data.city.sunset * 1000
  current.hourly = data.list.slice(0, 6).map(normalizeCondition)

  return current
}
