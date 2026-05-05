import { useState, useEffect } from 'react'

export function useGeolocation(fallbackCoords) {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(fallbackCoords)
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      () => {
        setError('Location access denied')
        setLocation(fallbackCoords)
        setLoading(false)
      },
      { timeout: 8000, maximumAge: 60000 }
    )
  }, [])

  return { location, error, loading }
}
