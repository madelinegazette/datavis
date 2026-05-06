import { EASE_EFFORT } from '../constants/transport'
import { isNighttime } from '../utils/time'

function weatherSeverity(weather) {
  if (!weather) return 0
  let score = 0
  if (weather.precipChance > 0.5) score += 0.25
  if (weather.precipMmHour > 2.5) score += 0.20
  if (weather.windMph > 20) score += 0.20
  if (weather.tempF < 25 || weather.tempF > 95) score += 0.35
  else if (weather.tempF < 35 || weather.tempF > 90) score += 0.15
  return Math.min(1, score)
}

function computeWeights(lateness, severity) {
  const baseCost = 0.15
  const costCut = Math.min(0.10, lateness * 0.10) + Math.min(0.10, severity * 0.10)
  const costWeight = Math.max(0.05, baseCost - costCut)
  const reclaimed = baseCost - costWeight
  const speedWeight  = 0.35 + reclaimed * 0.65 * lateness
  const safetyWeight = 0.25 + reclaimed * 0.65 * severity
  const easeWeight   = Math.max(0.05, 1.0 - speedWeight - safetyWeight - costWeight)
  return { speed: speedWeight, ease: easeWeight, safety: safetyWeight, cost: costWeight }
}

function computeEaseScore(option) {
  const effort = EASE_EFFORT[option.mode] ?? 60
  const walkPenalty = Math.max(0, (option.walkMinutes ?? 0) - 5) * 3
  const waitPenalty = Math.max(0, (option.waitMinutes ?? 0) - 5) * 3
  const transferPenalty = (option.transfers ?? 0) * 12
  return Math.max(0, Math.min(100, effort - walkPenalty - waitPenalty - transferPenalty))
}

function computeSafetyScore(option, weather, crimeScore) {
  const exposed = ['bike', 'walk', 'limeScooter', 'divvyBike']
  const isExposed = exposed.includes(option.mode)
  const isNight = isNighttime()

  let base = (crimeScore ?? 0.6) * 100

  // Weather penalties for exposed modes
  if (isExposed && weather) {
    if (weather.precipChance > 0.5) base -= 15
    if (weather.conditionCode >= 200 && weather.conditionCode < 300) base -= 30 // thunderstorm
    if (weather.conditionCode >= 600 && weather.conditionCode < 700) base -= 20 // snow
    if (weather.tempF < 20) base -= 20
    if (weather.windMph > 25) base -= 15
  }

  if (isNight && isExposed) base -= 12

  return Math.max(0, Math.min(100, base))
}

function estimateCost(option, settings) {
  if (option.precomputedCost != null) return option.precomputedCost
  const { costRates } = settings
  switch (option.mode) {
    case 'bike': case 'walk': return 0.10
    case 'ctaBus': case 'ctaTrain': return 2.50
    case 'limeScooter':
      return costRates.limeUnlockCost + costRates.limeRatePerMin * (option.durationMinutes ?? 20)
    case 'divvyBike':
      return costRates.divvySingleRideCost
    case 'lyft':
      return Math.max(5, (option.distanceMiles ?? 4) * costRates.lyftEstimatePerMile)
    case 'driveAndPark':
      return (option.distanceMiles ?? 4) * costRates.gasPerMile + costRates.parkingCostDollars
    case 'driveDropOff':
      return (option.distanceMiles ?? 4) * costRates.gasPerMile * 2
    default: return 5
  }
}

export function rankOptions(options, weather, crimeScore, settings, latenessScoreValue) {
  const severity = weatherSeverity(weather)
  const weights = computeWeights(latenessScoreValue, severity)

  const fastest = Math.min(...options.map(o => o.durationMinutes ?? Infinity))
  const cheapest = Math.min(...options.map(o => estimateCost(o, settings)))

  return options
    .map(option => {
      const cost = estimateCost(option, settings)
      const speedRaw = option.durationMinutes ? Math.min(100, 100 * fastest / option.durationMinutes) : 0
      const easeRaw = computeEaseScore(option)
      const safetyRaw = computeSafetyScore(option, weather, crimeScore)
      const costRaw = cheapest > 0 ? Math.min(100, 100 * cheapest / cost) : 100

      const score =
        speedRaw  * weights.speed  +
        easeRaw   * weights.ease   +
        safetyRaw * weights.safety +
        costRaw   * weights.cost

      return {
        ...option,
        estimatedCost: cost,
        score: Math.round(score * 10) / 10,
        scoreBreakdown: {
          speed: Math.round(speedRaw * weights.speed * 10) / 10,
          ease:  Math.round(easeRaw  * weights.ease  * 10) / 10,
          safety:Math.round(safetyRaw* weights.safety* 10) / 10,
          cost:  Math.round(costRaw  * weights.cost  * 10) / 10,
        },
        weights,
      }
    })
    .sort((a, b) => b.score - a.score)
    .map((o, i) => ({ ...o, rank: i + 1 }))
}
