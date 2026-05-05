const EXPOSED = ['bike', 'walk', 'limeScooter', 'divvyBike']

export function wearRecommendation(weather, mode) {
  if (!weather) return []
  const isExposed = EXPOSED.includes(mode)
  const items = []
  const { tempF, precipChance, precipMmHour, windMph, conditionCode, conditionIcon } = weather

  // Thunderstorm
  if (conditionCode >= 200 && conditionCode < 300) {
    if (isExposed) items.push({ icon: '⚡', text: 'Lightning risk — avoid biking/scooting', urgent: true })
    items.push({ icon: '☔', text: 'Heavy rain — shelter until storm passes', urgent: true })
    return items
  }

  // Snow
  if (conditionCode >= 600 && conditionCode < 700) {
    items.push({ icon: '🥾', text: 'Waterproof boots recommended' })
    if (isExposed) items.push({ icon: '⚠️', text: 'Slippery roads — consider transit', urgent: true })
  }

  // Rain
  if (precipChance > 0.4 || precipMmHour > 1) {
    items.push({ icon: '☂️', text: 'Bring umbrella or rain jacket' })
    if (isExposed) items.push({ icon: '🧥', text: 'Waterproof jacket — you will get wet' })
    if (['bike', 'walk', 'limeScooter'].includes(mode)) items.push({ icon: '👟', text: 'Waterproof shoes' })
  }

  // Temperature layers
  if (tempF < 20) {
    items.push({ icon: '🧥', text: 'Heavy winter coat required' })
    items.push({ icon: '🧤', text: 'Gloves + hat + scarf' })
    if (isExposed) items.push({ icon: '🔥', text: 'Hand warmers recommended' })
  } else if (tempF < 35) {
    items.push({ icon: '🧥', text: 'Winter coat + gloves + hat' })
  } else if (tempF < 50) {
    items.push({ icon: '🧥', text: 'Medium jacket, consider gloves' })
  } else if (tempF < 65) {
    items.push({ icon: '👕', text: 'Light jacket or layers' })
  } else if (tempF > 85) {
    if (isExposed) {
      items.push({ icon: '💧', text: 'Bring water bottle' })
      items.push({ icon: '🧴', text: 'Sunscreen' })
    }
    items.push({ icon: '👕', text: 'Light, breathable clothing' })
  }

  // Wind
  if (windMph > 20) {
    if (['bike', 'limeScooter', 'divvyBike'].includes(mode)) {
      items.push({ icon: '💨', text: `${windMph}mph wind — strong headwind possible`, urgent: true })
    } else if (mode === 'walk') {
      items.push({ icon: '💨', text: 'Windbreaker recommended' })
    }
  }

  // Sweaty commute
  if (isExposed && !items.some(i => i.urgent)) {
    items.push({ icon: '👔', text: 'Consider fresh clothes at destination' })
  }

  // Nighttime safety
  const hour = new Date().getHours()
  if ((hour >= 21 || hour < 6) && isExposed) {
    items.push({ icon: '🔦', text: 'Low visibility — use lights/reflectors' })
  }

  return items
}
