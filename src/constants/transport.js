export const MODES = {
  bike:        { key: 'bike',        label: 'Personal Bike', code: 'BK',  color: '#50fa7b', gMapsMode: 'bicycling' },
  walk:        { key: 'walk',        label: 'Walk',          code: 'WK',  color: '#8be9fd', gMapsMode: 'walking'   },
  ctaBus:      { key: 'ctaBus',      label: 'CTA Bus',       code: 'BUS', color: '#ffb86c', gMapsMode: 'transit'   },
  ctaTrain:    { key: 'ctaTrain',    label: 'CTA Train',     code: 'L',   color: '#bd93f9', gMapsMode: 'transit'   },
  limeScooter: { key: 'limeScooter', label: 'Lime Scooter',  code: 'SC',  color: '#f1fa8c', gMapsMode: 'bicycling' },
  divvyBike:   { key: 'divvyBike',   label: 'Divvy Bike',    code: 'DV',  color: '#ff79c6', gMapsMode: 'bicycling' },
  lyft:        { key: 'lyft',        label: 'Lyft',          code: 'LY',  color: '#ff5555', gMapsMode: 'driving'   },
  driveAndPark:{ key: 'driveAndPark',label: 'Drive + Park',  code: 'P+',  color: '#6272a4', gMapsMode: 'driving'   },
  driveDropOff:{ key: 'driveDropOff',label: 'Drop-off',      code: 'DR',  color: '#f8f8f2', gMapsMode: 'driving'   },
}

export const MODE_KEYS = Object.keys(MODES)

// Physical effort score (0 = most effort, 100 = least)
export const EASE_EFFORT = {
  bike:         40,
  walk:         35,
  ctaBus:       75,
  ctaTrain:     80,
  limeScooter:  65,
  divvyBike:    50,
  lyft:         95,
  driveAndPark: 85,
  driveDropOff: 90,
}

// Base cost in dollars for scoring (overridden by real data when available)
export const BASE_COST = {
  bike:         0.10,
  walk:         0.10,
  ctaBus:       2.50,
  ctaTrain:     2.50,
  limeScooter:  null, // computed: $1 unlock + $0.32/min
  divvyBike:    null, // computed: $1/30min single-ride
  lyft:         null, // computed: estimate
  driveAndPark: null, // computed: gas + parking
  driveDropOff: null, // computed: gas only
}
