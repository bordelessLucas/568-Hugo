import type { ReportStatus } from './report'
import type { TruckType } from './truck'
import type { RouteResult } from './route'

/** Textos simples para estados de rota (motorista). */
export const ROUTE_STATUS_LABEL = {
  loading: 'Calculando rota para o seu caminhão…',
  compatible: 'Rota ok para o seu caminhão',
  blocked: 'Não passa com este caminhão.',
  unavailable: 'Rota ainda não disponível. Tente de novo.',
} as const

export function formatRouteSummary(result: Extract<RouteResult, { status: 'compatible' }>): string {
  const km = result.distanceMeters / 1000
  const minutes = Math.max(1, Math.round(result.durationSeconds / 60))
  const kmLabel = km < 10 ? km.toFixed(1).replace('.', ',') : String(Math.round(km))
  return `${kmLabel} km · cerca de ${minutes} min`
}

export interface MapMarkLike {
  id: string
  status: ReportStatus
  truckType: TruckType
  urgency?: 'normal' | 'extreme'
}

/** Marcas no mapa: extremos e “não passa” para todos; demais só do tipo do caminhão. */
export function filterMapMarksForTruck<T extends MapMarkLike>(
  marks: T[],
  truckType: TruckType | null,
): T[] {
  if (!truckType) return marks
  return marks.filter((mark) => {
    if (mark.urgency === 'extreme') return true
    if (mark.status === 'nao_passa') return true
    return mark.truckType === truckType
  })
}
