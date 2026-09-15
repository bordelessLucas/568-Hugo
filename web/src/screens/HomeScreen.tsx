import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dimensionWarnings, type GeoPoint, type RouteResult } from '@rotatrucks/back'
import { AppFrame } from '../components/AppFrame.tsx'
import { MockMap } from '../components/MockMap.tsx'
import { PlaceSearch } from '../components/PlaceSearch.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useSettings } from '../contexts/SettingsContext.tsx'
import { useDeviceLocation } from '../hooks/useDeviceLocation.ts'
import type { PlaceHit } from '../lib/places.ts'
import { requestTruckRoute } from '../lib/routing.ts'

export function HomeScreen() {
  const auth = useAuth()
  const settings = useSettings()
  const navigate = useNavigate()
  const location = useDeviceLocation(settings.shareLocation)
  const [destination, setDestination] = useState<GeoPoint | null>(null)
  const [focus, setFocus] = useState<GeoPoint | null>(null)
  const [result, setResult] = useState<RouteResult | null>(null)
  const truck = auth.truck
  const tags = routeTags(truck, result)

  useEffect(() => {
    if (!destination || !location.point || !truck) return
    let active = true
    void requestTruckRoute({ origin: location.point, destination }).then((next) => {
      if (active) setResult(next)
    })
    return () => {
      active = false
    }
  }, [destination, location.point, truck])

  return (
    <AppFrame current="map">
      <section className="relative min-h-0 flex-1" aria-label="Mapa">
        <MockMap
          userLocation={location.point}
          destination={destination ?? focus}
          blocked={tags.includes('Não passa')}
        />
        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
          <PlaceSearch
            near={location.point}
            tags={tags}
            onSelect={(place: PlaceHit) => {
              setDestination(place.point)
              setFocus(place.point)
              setResult(null)
            }}
          />
        </div>
        <div className="pointer-events-none absolute right-4 bottom-4 z-20">
          <button
            type="button"
            onClick={() => navigate('/ocorrencia')}
            className="pointer-events-auto flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-[18px] border border-white/40 bg-accent text-accent-ink shadow-[0_6px_18px_rgba(31,20,4,0.28)]"
            aria-label="Marcar ocorrência"
            title="Opcional. Registra passa ou não passa."
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 3.5 21 19H3L12 3.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="1" fill="currentColor" />
            </svg>
            <span className="font-body text-[10px] font-bold">Ocorrência</span>
          </button>
        </div>
      </section>
    </AppFrame>
  )
}

function routeTags(
  truck: { heightMeters: number; widthMeters: number; lengthMeters: number; totalWeightKg: number } | null,
  result: RouteResult | null,
): string[] {
  const tags: string[] = []
  if (!truck) tags.push('Sem caminhão')
  if (truck && dimensionWarnings(truck).length > 0) tags.push('Não passa')
  if (result?.status === 'blocked' && !tags.includes('Não passa')) tags.push('Não passa')
  return tags
}
