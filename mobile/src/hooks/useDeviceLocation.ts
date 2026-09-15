import { useEffect, useState } from 'react'
import type { GeoPoint } from '@rotatrucks/back'
import * as Location from 'expo-location'

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

    let active = true
    setStatus('pending')
    void (async () => {
      const permission = await Location.requestForegroundPermissionsAsync()
      if (!active) return
      if (permission.status !== 'granted') {
        setStatus('denied')
        return
      }
      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        if (!active) return
        setPoint({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        })
        setStatus('ready')
      } catch {
        if (active) setStatus('denied')
      }
    })()

    return () => {
      active = false
    }
  }, [enabled])

  return { point, status }
}
