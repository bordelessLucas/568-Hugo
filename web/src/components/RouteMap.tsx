import { useEffect, useRef } from 'react'
import { LngLatBounds, Map, Marker, NavigationControl, Popup, type GeoJSONSource, type MapMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { GeoPoint, SafetyMapMark } from '@rotatrucks/back'
import { hereMapsConfigured } from '../lib/routing.ts'

const STYLE = 'https://tiles.openfreemap.org/styles/liberty'
const BRAZIL: [number, number] = [-51.9, -14.2]

export interface RouteMapMark {
  id: string
  latitude: number
  longitude: number
  status: 'passa' | 'nao_passa'
  label?: string
}

interface RouteMapProps {
  userLocation: GeoPoint | null
  destination: GeoPoint | null
  focus: GeoPoint | null
  path: GeoPoint[]
  marks?: RouteMapMark[]
  safetyMarks?: SafetyMapMark[]
  blocked?: boolean
  onPick: (point: GeoPoint) => void
}

export function RouteMap({
  userLocation,
  destination,
  focus,
  path,
  marks = [],
  safetyMarks = [],
  blocked = false,
  onPick,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const pickRef = useRef(onPick)
  const userMarker = useRef<Marker | null>(null)
  const destinationMarker = useRef<Marker | null>(null)
  const markMarkers = useRef<Marker[]>([])
  const safetyMarkers = useRef<Marker[]>([])

  pickRef.current = onPick

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = new Map({
      container,
      style: STYLE,
      center: BRAZIL,
      zoom: 3.4,
      attributionControl: { compact: true },
    })
    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')
    map.on('click', (event: MapMouseEvent) => {
      pickRef.current({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
    })
    mapRef.current = map

    const observer = new ResizeObserver(() => map.resize())
    observer.observe(container)

    return () => {
      observer.disconnect()
      userMarker.current?.remove()
      destinationMarker.current?.remove()
      markMarkers.current.forEach((marker) => marker.remove())
      safetyMarkers.current.forEach((marker) => marker.remove())
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !focus) return
    map.flyTo({ center: [focus.longitude, focus.latitude], zoom: 14 })
  }, [focus])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !userLocation) return
    const lngLat: [number, number] = [userLocation.longitude, userLocation.latitude]
    if (!userMarker.current) {
      userMarker.current = new Marker({ color: '#0073B8' }).setLngLat(lngLat).addTo(map)
      if (!focus) map.flyTo({ center: lngLat, zoom: 12 })
      return
    }
    userMarker.current.setLngLat(lngLat)
  }, [focus, userLocation])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!destination) {
      destinationMarker.current?.remove()
      destinationMarker.current = null
      return
    }
    const lngLat: [number, number] = [destination.longitude, destination.latitude]
    if (!destinationMarker.current) {
      destinationMarker.current = new Marker({
        color: blocked ? '#C5362B' : '#073049',
      })
        .setLngLat(lngLat)
        .addTo(map)
      return
    }
    destinationMarker.current.setLngLat(lngLat)
  }, [blocked, destination])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markMarkers.current.forEach((marker) => marker.remove())
    markMarkers.current = marks.map((mark) =>
      new Marker({ color: mark.status === 'passa' ? '#1B7A45' : '#C5362B' })
        .setLngLat([mark.longitude, mark.latitude])
        .addTo(map),
    )
  }, [marks])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    safetyMarkers.current.forEach((marker) => marker.remove())
    safetyMarkers.current = safetyMarks.map((mark) => new Marker({ color: mark.tone === 'danger' ? '#C5362B' : mark.tone === 'warning' ? '#D98600' : mark.tone === 'safe' ? '#1B7A45' : '#64748B' }).setLngLat([mark.longitude, mark.latitude]).setPopup(new Popup({ offset: 18 }).setHTML(`<strong>${escapeHtml(mark.title)}</strong><br>${escapeHtml(mark.badge)}<br><small>${escapeHtml(mark.sourceLabel)}</small>`)).addTo(map))
  }, [safetyMarks])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const draw = () => drawPath(map, path, blocked)
    if (map.isStyleLoaded()) draw()
    else map.once('load', draw)
  }, [blocked, path])

  return (
    <div className="relative h-full min-h-[52vh] w-full">
      <div ref={containerRef} className="absolute inset-0" />
      {!hereMapsConfigured() ? (
        <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-surface px-3 py-1.5 font-body text-xs font-bold text-muted">
          Mapa de apoio. A base HERE entra com a chave.
        </p>
      ) : null}
    </div>
  )
}

function escapeHtml(value: string): string { return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!) }

function drawPath(map: Map, path: GeoPoint[], blocked: boolean) {
  const existing = map.getSource('route')
  if (path.length < 2) {
    if (map.getLayer('route')) map.removeLayer('route')
    if (existing) map.removeSource('route')
    return
  }

  const first = path[0]
  if (!first) return
  const data = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: path.map((point) => [point.longitude, point.latitude]),
    },
  }

  const color = blocked ? '#C5362B' : '#0073B8'

  if (existing && existing.type === 'geojson') {
    ;(existing as GeoJSONSource).setData(data)
    if (map.getLayer('route')) {
      map.setPaintProperty('route', 'line-color', color)
    }
  } else {
    map.addSource('route', { type: 'geojson', data })
    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      paint: { 'line-color': color, 'line-width': 5 },
    })
  }

  const bounds = path.reduce(
    (box, point) => box.extend([point.longitude, point.latitude]),
    new LngLatBounds([first.longitude, first.latitude], [first.longitude, first.latitude]),
  )
  map.fitBounds(bounds, { padding: 64, maxZoom: 14 })
}
