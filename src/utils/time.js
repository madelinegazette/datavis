export function latenessScore(preferredTime) {
  const [h, m] = preferredTime.split(':').map(Number)
  const now = new Date()
  const preferred = new Date()
  preferred.setHours(h, m, 0, 0)
  const minutesLate = (now - preferred) / 60000
  return Math.min(1, Math.max(0, minutesLate / 30))
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function minutesToDisplay(min) {
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

export function isNighttime() {
  const h = new Date().getHours()
  return h >= 22 || h < 5
}
