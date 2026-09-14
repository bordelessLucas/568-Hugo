import { useEffect, useState } from 'react'
import type { GeoPoint } from '@rotatrucks/back'

type LocationStatus = 'pending' | 'ready' | 'denied'

export function useDeviceLocation(enabled = true) {
  const [point, setPoint] = useState<GeoPoint | null>(null)
  const [status, setStatus] = useState<LocationStatus>(enabled ? 'pending' : 'denied')

  useEffect(() => {
    if (!enabled) {
      setPoint(null)
      setStatus('denied')
      return
    }
    if (!navigator.geolocation) {
      setStatus('denied')
      return
    }
    setStatus('pending')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPoint({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setStatus('ready')
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    )
  }, [enabled])

  return { point, status }
}
