import { useEffect, useState } from 'react'
import type { GeoPoint } from '@rotatrucks/back'
import * as Location from 'expo-location'

export type LocationStatus = 'pending' | 'ready' | 'denied' | 'unavailable'

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
    let subscription: Location.LocationSubscription | null = null
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
        if (!active) return
        // Continua para o watch — às vezes o fix único falha e o stream funciona.
      }

      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 25,
            timeInterval: 4000,
          },
          (next) => {
            if (!active) return
            setPoint({
              latitude: next.coords.latitude,
              longitude: next.coords.longitude,
            })
            setStatus('ready')
          },
        )
      } catch {
        if (!active) return
        setStatus((current) => (current === 'ready' ? current : 'unavailable'))
      }
    })()

    return () => {
      active = false
      subscription?.remove()
    }
  }, [enabled])

  return { point, status }
}
