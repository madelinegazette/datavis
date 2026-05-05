export function formatCost(dollars) {
  if (dollars == null) return '—'
  if (dollars < 0.50) return 'Free'
  return `$${dollars.toFixed(2)}`
}

export function formatMiles(miles) {
  if (miles == null) return '—'
  return `${miles.toFixed(1)} mi`
}

export function formatTemp(f) {
  return `${Math.round(f)}°F`
}
