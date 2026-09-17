import { isTruckType, type Truck, type TruckType } from './truck'

export type RestrictionSourceStatus = 'verified' | 'demo' | 'expired'
export type RestrictionEffect = 'warning' | 'blocked'
export interface RestrictionTimeWindow { start: string; end: string }
export interface RestrictionLimits {
  maxHeightMeters?: number
  maxWidthMeters?: number
  maxLengthMeters?: number
  maxWeightKg?: number
}
export interface OfficialRestriction {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  address?: string
  authority?: string
  sourceUrl?: string
  sourceStatus: RestrictionSourceStatus
  verifiedAt?: string
  validFrom?: string
  validUntil?: string
  weekdays?: number[]
  timeWindows?: RestrictionTimeWindow[]
  timezone: 'America/Sao_Paulo'
  limits: RestrictionLimits
  affectedTruckTypes: TruckType[]
  effect: RestrictionEffect
}
export type RestrictionEvaluationStatus = 'not_applicable' | 'warning' | 'blocked'
export interface RestrictionEvaluation { status: RestrictionEvaluationStatus; reasons: string[] }

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/

export function assertOfficialRestriction(item: OfficialRestriction): void {
  if (!item.id.trim() || !item.title.trim() || !item.description.trim()) throw new Error('Restrição sem identificação.')
  if (!Number.isFinite(item.latitude) || item.latitude < -90 || item.latitude > 90 ||
      !Number.isFinite(item.longitude) || item.longitude < -180 || item.longitude > 180) throw new Error('Localização inválida.')
  if (!['verified', 'demo', 'expired'].includes(item.sourceStatus)) throw new Error('Estado da fonte inválido.')
  if (!['warning', 'blocked'].includes(item.effect)) throw new Error('Efeito inválido.')
  if (item.timezone !== 'America/Sao_Paulo') throw new Error('Fuso horário inválido.')
  if (item.sourceStatus === 'verified' && (!item.authority?.trim() || !item.sourceUrl?.startsWith('https://') || !validIso(item.verifiedAt))) {
    throw new Error('Restrição verificada exige fonte HTTPS, órgão e data de verificação.')
  }
  for (const value of Object.values(item.limits)) if (!Number.isFinite(value) || (value ?? 0) <= 0) throw new Error('Limite inválido.')
  if (Object.keys(item.limits).length === 0 && item.affectedTruckTypes.length === 0) throw new Error('Informe ao menos um critério da restrição.')
  if (!item.affectedTruckTypes.every(isTruckType)) throw new Error('Tipo de caminhão inválido.')
  if (item.weekdays && !item.weekdays.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)) throw new Error('Dia da semana inválido.')
  if (item.timeWindows && !item.timeWindows.every((window) => timePattern.test(window.start) && timePattern.test(window.end))) throw new Error('Janela de horário inválida.')
  if (item.validFrom && !datePattern.test(item.validFrom)) throw new Error('Vigência inicial inválida.')
  if (item.validUntil && !datePattern.test(item.validUntil)) throw new Error('Vigência final inválida.')
}

function validIso(value?: string): boolean { return Boolean(value && !Number.isNaN(Date.parse(value))) }

function localParts(at: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
  }).formatToParts(at)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}`, weekday: weekdays[get('weekday')] ?? 0 }
}

function withinWindow(time: string, window: RestrictionTimeWindow): boolean {
  return window.start <= window.end
    ? time >= window.start && time <= window.end
    : time >= window.start || time <= window.end
}

export function evaluateOfficialRestriction(item: OfficialRestriction, truck: Truck, at: Date): RestrictionEvaluation {
  assertOfficialRestriction(item)
  const local = localParts(at)
  if (item.sourceStatus === 'expired' || (item.validFrom && local.date < item.validFrom) || (item.validUntil && local.date > item.validUntil)) return { status: 'not_applicable', reasons: [] }
  if (item.weekdays?.length && !item.weekdays.includes(local.weekday)) return { status: 'not_applicable', reasons: [] }
  if (item.timeWindows?.length && !item.timeWindows.some((window) => withinWindow(local.time, window))) return { status: 'not_applicable', reasons: [] }
  const reasons: string[] = []
  if (item.limits.maxHeightMeters && truck.heightMeters > item.limits.maxHeightMeters) reasons.push(`Altura acima de ${item.limits.maxHeightMeters.toFixed(2)} m.`)
  if (item.limits.maxWidthMeters && truck.widthMeters > item.limits.maxWidthMeters) reasons.push(`Largura acima de ${item.limits.maxWidthMeters.toFixed(2)} m.`)
  if (item.limits.maxLengthMeters && truck.lengthMeters > item.limits.maxLengthMeters) reasons.push(`Comprimento acima de ${item.limits.maxLengthMeters.toFixed(2)} m.`)
  if (item.limits.maxWeightKg && truck.totalWeightKg > item.limits.maxWeightKg) reasons.push(`Peso acima de ${item.limits.maxWeightKg} kg.`)
  if (item.affectedTruckTypes.includes(truck.type)) reasons.push('Restrição aplicável ao tipo do caminhão.')
  return reasons.length ? { status: item.effect, reasons } : { status: 'not_applicable', reasons: [] }
}

export function formatRestrictionReason(result: RestrictionEvaluation): string {
  return result.reasons.join(' ')
}
