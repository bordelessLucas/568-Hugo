import type { OfficialRestriction } from './official-restriction'
import type { SafePlace } from './safe-place'

export const DEMO_OFFICIAL_RESTRICTIONS: OfficialRestriction[] = [{
  id: 'demo-height', title: 'Demonstração: limite de altura', description: 'Regra simulada para validar compatibilidade.',
  latitude: -26.632, longitude: -48.684, sourceStatus: 'demo', timezone: 'America/Sao_Paulo',
  limits: { maxHeightMeters: 4.2 }, affectedTruckTypes: [], effect: 'blocked',
}]

export const DEMO_SAFE_PLACES: SafePlace[] = [
  { id: 'demo-safe-1', name: 'Demonstração: Parada Norte', category: 'truck_stop', latitude: -26.625, longitude: -48.68, services: ['truck_parking', 'lighting', 'restroom', 'food'], audience: 'all', origin: 'demo', ratingAverage: 4.2, ratingCount: 18 },
  { id: 'demo-safe-2', name: 'Demonstração: Apoio Sul', category: 'service_area', latitude: -26.65, longitude: -48.69, services: ['truck_parking', 'lighting', 'security', 'restroom', 'shower', 'overnight'], audience: 'women_recommended', origin: 'demo', ratingAverage: 4.6, ratingCount: 9 },
]
