export function buildLyftLink(origin, dest) {
  return `https://lyft.com/ride?id=lyft&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&destination[latitude]=${dest.lat}&destination[longitude]=${dest.lng}`
}

export function buildLimeLink(origin) {
  // Lime doesn't have a public destination deep link; open map centered on user location
  return `https://web.lime.bike/map?lat=${origin.lat}&lng=${origin.lng}`
}

export function buildCTALink() {
  return 'https://www.transitchicago.com/travel-information/'
}

export function buildGoogleMapsLink(origin, dest, mode = 'transit') {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest.lat},${dest.lng}&travelmode=${mode}`
}
