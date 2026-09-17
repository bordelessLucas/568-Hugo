import { evaluateOfficialRestriction, type OfficialRestriction } from './official-restriction'
import { hasWomenFriendlySeal, type SafePlace, type SafePlaceService } from './safe-place'
import type { Truck } from './truck'

export interface SafetyMapMark { id: string; kind: 'restriction' | 'safe_place'; latitude: number; longitude: number; title: string; badge: string; tone: 'danger' | 'warning' | 'safe' | 'neutral'; details: string[]; sourceLabel: string }
export const SAFETY_SOURCE_LABELS = { verified: 'Fonte verificada', demo: 'Demonstração', expired: 'Fonte expirada', curated: 'Cadastro curado' } as const
const serviceLabels: Record<SafePlaceService, string> = { truck_parking: 'Estacionamento para caminhão', lighting: 'Iluminação', security: 'Vigilância', restroom: 'Banheiro', shower: 'Chuveiro', food: 'Alimentação', repair: 'Oficina', overnight: 'Pernoite' }

export function buildRestrictionMark(item: OfficialRestriction, truck: Truck | null, at: Date): SafetyMapMark {
  const evaluation = truck ? evaluateOfficialRestriction(item, truck, at) : null
  const status = evaluation?.status ?? 'not_applicable'
  return { id: `restriction:${item.id}`, kind: 'restriction', latitude: item.latitude, longitude: item.longitude, title: item.title,
    badge: truck ? status === 'blocked' ? 'Não passa' : status === 'warning' ? 'Atenção' : 'Não se aplica' : 'Verifique seu caminhão',
    tone: truck ? status === 'blocked' ? 'danger' : status === 'warning' ? 'warning' : 'neutral' : 'neutral',
    details: [item.description, ...(evaluation?.reasons ?? [])], sourceLabel: SAFETY_SOURCE_LABELS[item.sourceStatus] }
}
export function formatSafePlaceServices(place: SafePlace): string { return place.services.map((service) => serviceLabels[service]).join(' · ') }
export function buildSafePlaceMark(place: SafePlace): SafetyMapMark {
  const details = [formatSafePlaceServices(place), `Nota ${place.ratingAverage.toFixed(1)} (${place.ratingCount} avaliações)`]
  if (hasWomenFriendlySeal(place)) details.push('Ponto Amigo da Caminhoneira')
  return { id: `safe:${place.id}`, kind: 'safe_place', latitude: place.latitude, longitude: place.longitude, title: place.name, badge: 'Ponto seguro', tone: 'safe', details, sourceLabel: place.origin === 'demo' ? 'Demonstração' : 'Cadastro curado' }
}
