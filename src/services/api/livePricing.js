import { fetchChicagoGasPrice } from './gasPrices'

// 2004 Honda Accord 4-cyl: EPA 24 city / 34 hwy — use 26 for Chicago city driving
const ACCORD_MPG = 26

const DIVVY_PRICING_URL = 'https://gbfs.divvybikes.com/gbfs/en/system_pricing_plans.json'
const DIVVY_CACHE_KEY = 'ccd_divvy_price_v1'
const DIVVY_CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours

async function fetchDivvyPerRide() {
  try {
    const cached = JSON.parse(localStorage.getItem(DIVVY_CACHE_KEY) || 'null')
    if (cached && Date.now() - cached.ts < DIVVY_CACHE_TTL) return cached.price
  } catch {}

  try {
    const res = await fetch(DIVVY_PRICING_URL)
    if (!res.ok) throw new Error()
    const data = await res.json()
    const plans = data.data?.plans ?? []
    // Find the single-ride / pay-per-ride plan (lowest one-time price)
    const perRide = plans
      .filter(p => p.price != null && p.price < 10)
      .sort((a, b) => a.price - b.price)[0]
    if (perRide?.price) {
      localStorage.setItem(DIVVY_CACHE_KEY, JSON.stringify({ price: perRide.price, ts: Date.now() }))
      return perRide.price
    }
  } catch {}

  return 3.30 // Divvy single-ride fallback
}

export async function fetchLivePricing(distanceMiles = 4, durationMinutes = 20) {
  const [gasResult, divvyResult] = await Promise.allSettled([
    fetchChicagoGasPrice(),
    fetchDivvyPerRide(),
  ])

  const gasPricePerGallon = gasResult.status === 'fulfilled' ? gasResult.value : 3.45
  const divvyPerRide = divvyResult.status === 'fulfilled' ? divvyResult.value : 3.30
  const gasPerMile = gasPricePerGallon / ACCORD_MPG

  // Lime Chicago: $1.00 unlock + $0.39/min (as of 2025)
  const limeTotal = 1.00 + 0.39 * durationMinutes

  // Lyft Chicago estimate: $1.80 base + $1.85/mile + $0.30/min (no surge)
  const lyftEstimate = Math.max(5.00, 1.80 + 1.85 * distanceMiles + 0.30 * durationMinutes)

  return {
    gasPricePerGallon,
    gasPerMile,
    accordMpg: ACCORD_MPG,
    divvyPerRide,
    limeTotal,
    lyftEstimate,
    driveGas: gasPerMile * distanceMiles,
    driveAndParkTotal: gasPerMile * distanceMiles + 20, // gas + typical Chicago parking
    driveDropOffTotal: gasPerMile * distanceMiles * 2, // round-trip gas
  }
}
