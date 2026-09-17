import { haversineMeters, type GeoPoint } from './route-alert'

export const SAFE_PLACE_SERVICES = ['truck_parking', 'lighting', 'security', 'restroom', 'shower', 'food', 'repair', 'overnight'] as const
export type SafePlaceService = (typeof SAFE_PLACE_SERVICES)[number]
export interface SafePlace {
  id: string
  name: string
  category: 'truck_stop' | 'gas_station' | 'restaurant' | 'service_area'
  latitude: number
  longitude: number
  address?: string
  openingHours?: string
  services: SafePlaceService[]
  audience: 'all' | 'women_recommended'
  origin: 'curated' | 'demo'
  verifiedAt?: string
  ratingAverage: number
  ratingCount: number
}

const serviceSet: ReadonlySet<string> = new Set(SAFE_PLACE_SERVICES)
const sealServices: SafePlaceService[] = ['restroom', 'shower', 'lighting', 'security']

export function assertSafePlace(place: SafePlace): void {
  if (!place.id.trim() || !place.name.trim()) throw new Error('Ponto seguro sem identificação.')
  if (!['truck_stop', 'gas_station', 'restaurant', 'service_area'].includes(place.category)) throw new Error('Categoria inválida.')
  if (!Number.isFinite(place.latitude) || place.latitude < -90 || place.latitude > 90 || !Number.isFinite(place.longitude) || place.longitude < -180 || place.longitude > 180) throw new Error('Localização inválida.')
  if (!place.services.every((service) => serviceSet.has(service))) throw new Error('Serviço inválido.')
  if (!['all', 'women_recommended'].includes(place.audience) || !['curated', 'demo'].includes(place.origin)) throw new Error('Classificação inválida.')
  if (place.origin === 'curated' && (!place.verifiedAt || Number.isNaN(Date.parse(place.verifiedAt)))) throw new Error('Ponto curado exige data de verificação.')
  if (!Number.isFinite(place.ratingAverage) || place.ratingAverage < 0 || place.ratingAverage > 5 || !Number.isInteger(place.ratingCount) || place.ratingCount < 0) throw new Error('Avaliação inválida.')
}

export function hasWomenFriendlySeal(place: SafePlace): boolean {
  return place.origin === 'curated' && place.audience === 'women_recommended' && Boolean(place.verifiedAt && !Number.isNaN(Date.parse(place.verifiedAt))) && sealServices.every((service) => place.services.includes(service))
}

export function sortSafePlacesByDistance(places: SafePlace[], origin: GeoPoint | null): SafePlace[] {
  if (!origin) return [...places]
  return [...places].sort((a, b) => haversineMeters(origin, a) - haversineMeters(origin, b))
}
