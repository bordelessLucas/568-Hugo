import type { GeoPoint } from '@rotatrucks/back'

export interface PlaceHit {
  id: string
  label: string
  detail: string
  point: GeoPoint
}

const BRAZIL_BBOX = '-73.99,-33.75,-28.85,5.27'

export async function searchPlaces(query: string, near: GeoPoint | null): Promise<PlaceHit[]> {
  const text = query.trim()
  if (text.length < 3) return []

  const params = new URLSearchParams({
    q: text,
    limit: '6',
    lang: 'pt',
    bbox: BRAZIL_BBOX,
  })
  if (near) {
    params.set('lat', String(near.latitude))
    params.set('lon', String(near.longitude))
  }

  const response = await fetch('https://photon.komoot.io/api/?' + params.toString())
  if (!response.ok) {
    throw new Error('Não foi possível buscar agora.')
  }

  const body: unknown = await response.json()
  if (typeof body !== 'object' || body === null || !('features' in body)) return []
  const features = (body as { features: unknown }).features
  if (!Array.isArray(features)) return []

  return features.flatMap((feature, index) => {
    const place = readPlace(feature, index)
    return place ? [place] : []
  })
}

function readPlace(feature: unknown, index: number): PlaceHit | null {
  if (typeof feature !== 'object' || feature === null) return null
  const item = feature as { geometry?: unknown; properties?: unknown }
  if (typeof item.geometry !== 'object' || item.geometry === null) return null
  if (typeof item.properties !== 'object' || item.properties === null) return null

  const geometry = item.geometry as { coordinates?: unknown }
  const properties = item.properties as Record<string, unknown>
  if (!Array.isArray(geometry.coordinates)) return null
  const longitude = geometry.coordinates[0]
  const latitude = geometry.coordinates[1]
  if (typeof longitude !== 'number' || typeof latitude !== 'number') return null
  const country = text(properties.countrycode).toUpperCase()
  if (country !== '' && country !== 'BR') return null

  const label = readLabel(properties)
  if (!label) return null

  return {
    id: String(properties.osm_id ?? index) + '-' + latitude.toFixed(5),
    label,
    detail: readDetail(properties),
    point: { latitude, longitude },
  }
}

function readLabel(properties: Record<string, unknown>): string {
  const name = text(properties.name)
  const street = text(properties.street)
  const number = text(properties.housenumber)
  if (street && number) return street + ', ' + number
  return name || street
}

function readDetail(properties: Record<string, unknown>): string {
  return [text(properties.city) || text(properties.county), text(properties.state)]
    .filter((part) => part !== '')
    .join(' · ')
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}
