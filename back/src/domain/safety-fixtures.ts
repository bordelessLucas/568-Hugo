import type { OfficialRestriction } from './official-restriction'
import type { SafePlace } from './safe-place'

export const DEMO_OFFICIAL_RESTRICTIONS: OfficialRestriction[] = [{
  id: 'demo-height', title: 'Viaduto da Avenida Central', description: 'Limite de altura cadastrado para validar a compatibilidade do caminhão.',
  latitude: -26.632, longitude: -48.684, sourceStatus: 'demo', timezone: 'America/Sao_Paulo',
  limits: { maxHeightMeters: 4.2 }, affectedTruckTypes: [], effect: 'blocked',
}, {
  id: 'demo-weight', title: 'Ponte do Rio Itajaí', description: 'Limite de peso e passagem controlada para veículos pesados.',
  latitude: -26.641, longitude: -48.692, sourceStatus: 'demo', timezone: 'America/Sao_Paulo',
  limits: { maxWeightKg: 32000 }, affectedTruckTypes: [], effect: 'warning',
}]

export const DEMO_SAFE_PLACES: SafePlace[] = [
  { id: 'demo-safe-1', name: 'Parada Horizonte', category: 'truck_stop', latitude: -26.625, longitude: -48.68, address: 'BR-101, km 88', openingHours: '24 horas', services: ['truck_parking', 'lighting', 'restroom', 'food'], audience: 'all', origin: 'demo', ratingAverage: 4.2, ratingCount: 18 },
  { id: 'demo-safe-2', name: 'Pátio Caminho do Sul', category: 'service_area', latitude: -26.65, longitude: -48.69, address: 'BR-101, km 92', openingHours: '24 horas', services: ['truck_parking', 'lighting', 'security', 'restroom', 'shower', 'overnight'], audience: 'women_recommended', origin: 'demo', ratingAverage: 4.6, ratingCount: 9 },
  { id: 'demo-safe-3', name: 'Posto Serra Azul', category: 'gas_station', latitude: -26.617, longitude: -48.671, address: 'Rodovia SC-414, km 4', openingHours: '06h às 23h', services: ['truck_parking', 'lighting', 'food', 'repair'], audience: 'all', origin: 'demo', ratingAverage: 4.4, ratingCount: 31 },
  { id: 'demo-safe-4', name: 'Área de Apoio Aurora', category: 'service_area', latitude: -26.659, longitude: -48.704, address: 'BR-101, km 95', openingHours: '24 horas', services: ['truck_parking', 'lighting', 'security', 'restroom', 'shower', 'food', 'overnight'], audience: 'women_recommended', origin: 'demo', ratingAverage: 4.8, ratingCount: 24 },
]
