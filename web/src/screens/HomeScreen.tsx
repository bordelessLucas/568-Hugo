import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  dimensionWarnings,
  filterMapMarksForTruck,
  formatRouteSummary,
  listPilotMarks,
  ROUTE_STATUS_LABEL,
  type GeoPoint,
  type RouteResult,
} from '@rotatrucks/back'
import { AppFrame } from '../components/AppFrame.tsx'
import { PlaceSearch } from '../components/PlaceSearch.tsx'
import { RouteMap } from '../components/RouteMap.tsx'
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
  const [routing, setRouting] = useState(false)
  const truck = auth.truck
  const tags = routeTags(truck, result)

  const marks = useMemo(() => {
    const pilot = listPilotMarks('pilot-barra-velha').map((mark) => ({
      id: mark.id,
      latitude: mark.latitude,
      longitude: mark.longitude,
      status: mark.status,
      truckType: mark.truckType,
      urgency: mark.urgency === 'extreme' ? ('extreme' as const) : ('normal' as const),
      label: mark.label,
    }))
    return filterMapMarksForTruck(pilot, truck?.type ?? null)
  }, [truck?.type])

  const path = result?.status === 'compatible' ? result.path : []

  useEffect(() => {
    if (!destination || !location.point || !truck) {
      setResult(null)
      setRouting(false)
      return
    }
    let active = true
    setRouting(true)
    void requestTruckRoute({ origin: location.point, destination }).then((next) => {
      if (!active) return
      setResult(next)
      setRouting(false)
    })
    return () => {
      active = false
    }
  }, [destination, location.point, truck])

  const statusLine = routeStatusLine(routing, result, Boolean(destination && truck))

  return (
    <AppFrame current="map">
      <section className="relative min-h-0 flex-1" aria-label="Mapa">
        <RouteMap
          userLocation={location.point}
          destination={destination ?? focus}
          focus={focus}
          path={path}
          marks={marks}
          blocked={tags.includes('Não passa')}
          onPick={(point) => {
            setDestination(point)
            setFocus(point)
            setResult(null)
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex flex-col items-center gap-2 px-4">
          <PlaceSearch
            near={location.point}
            tags={tags}
            onSelect={(place: PlaceHit) => {
              setDestination(place.point)
              setFocus(place.point)
              setResult(null)
            }}
            onClear={() => {
              setDestination(null)
              setFocus(null)
              setResult(null)
            }}
          />
          {statusLine ? (
            <p
              className={[
                'pointer-events-none max-w-xl rounded-full px-4 py-2 font-body text-xs font-bold shadow',
                result?.status === 'blocked'
                  ? 'bg-danger text-white'
                  : 'bg-surface text-ink border border-line',
              ].join(' ')}
            >
              {statusLine}
            </p>
          ) : null}
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

function routeStatusLine(
  routing: boolean,
  result: RouteResult | null,
  ready: boolean,
): string | null {
  if (!ready) return null
  if (routing) return ROUTE_STATUS_LABEL.loading
  if (!result) return null
  if (result.status === 'compatible') {
    return `${ROUTE_STATUS_LABEL.compatible} · ${formatRouteSummary(result)}`
  }
  if (result.status === 'blocked') return result.message || ROUTE_STATUS_LABEL.blocked
  return result.message || ROUTE_STATUS_LABEL.unavailable
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
