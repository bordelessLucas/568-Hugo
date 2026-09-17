import { isTruckType, type TruckType } from './truck'

export const REPORT_STATUSES = ['passa', 'nao_passa'] as const

export type ReportStatus = (typeof REPORT_STATUSES)[number]

const REPORT_STATUS_SET: ReadonlySet<string> = new Set(REPORT_STATUSES)

export function isReportStatus(value: string): value is ReportStatus {
  return REPORT_STATUS_SET.has(value)
}

export const ALERT_URGENCIES = ['normal', 'extreme'] as const
export type AlertUrgency = (typeof ALERT_URGENCIES)[number]

const URGENCY_SET: ReadonlySet<string> = new Set(ALERT_URGENCIES)

export function isAlertUrgency(value: string): value is AlertUrgency {
  return URGENCY_SET.has(value)
}

export function normalizeReportUrgency(value: unknown): AlertUrgency {
  if (typeof value === 'string' && isAlertUrgency(value)) return value
  return 'normal'
}

export const REPORT_CATEGORIES = [
  'route_condition',
  'accident',
  'road_block',
  'robbery_risk',
  'unsafe_place',
] as const

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]

export const REPORT_CATEGORY_OPTIONS: Record<
  ReportCategory,
  { label: string; description: string }
> = {
  route_condition: {
    label: 'Condição da via',
    description: 'Altura, peso, largura ou outra condição para o caminhão.',
  },
  accident: {
    label: 'Acidente',
    description: 'Acidente na pista ou no acostamento.',
  },
  road_block: {
    label: 'Bloqueio',
    description: 'Via fechada, obra, barreira ou manifestação.',
  },
  robbery_risk: {
    label: 'Risco de roubo',
    description: 'Suspeita, tentativa ou risco imediato no trecho.',
  },
  unsafe_place: {
    label: 'Local inseguro',
    description: 'Parada ou trecho sem iluminação, vigilância ou estrutura.',
  },
}

const REPORT_CATEGORY_SET: ReadonlySet<string> = new Set(REPORT_CATEGORIES)

export function isReportCategory(value: string): value is ReportCategory {
  return REPORT_CATEGORY_SET.has(value)
}

export function normalizeReportCategory(value: unknown): ReportCategory {
  if (typeof value === 'string' && isReportCategory(value)) return value
  return 'route_condition'
}

export function reportCategoryRequiresNotes(category: ReportCategory): boolean {
  return category !== 'route_condition'
}

export interface ReportLocation {
  latitude: number
  longitude: number
}

export interface Report extends ReportLocation {
  id: string
  category: ReportCategory
  status: ReportStatus
  notes: string
  truckType: TruckType
  authorId: string
  createdAt: string
  /** normal = aviso de rota; extreme = acidente grave / urgência (aparece sem destino). */
  urgency: AlertUrgency
}

export type NewReport = Omit<Report, 'id' | 'createdAt'>

export function formatReportLabel(category: ReportCategory, status: ReportStatus): string {
  const categoryLabel = REPORT_CATEGORY_OPTIONS[category].label
  if (category === 'robbery_risk' || category === 'unsafe_place') return categoryLabel
  const passLabel = category === 'route_condition' ? 'passa' : 'passa com atenção'
  return `${categoryLabel}: ${status === 'passa' ? passLabel : 'não passa'}`
}

export function assertReportDraft(report: NewReport): void {
  if (!isReportCategory(report.category)) {
    throw new Error('Escolha uma categoria válida para a ocorrência.')
  }
  if (!isTruckType(report.truckType)) {
    throw new Error('Tipo de caminhão inválido.')
  }
  if (!isReportStatus(report.status)) {
    throw new Error('Situação da via inválida.')
  }
  if (!isAlertUrgency(report.urgency)) {
    throw new Error('Urgência inválida.')
  }
  if (
    !Number.isFinite(report.latitude) ||
    !Number.isFinite(report.longitude) ||
    report.latitude < -90 ||
    report.latitude > 90 ||
    report.longitude < -180 ||
    report.longitude > 180
  ) {
    throw new Error('Localização inválida.')
  }
  if (report.authorId.trim() === '') {
    throw new Error('Ocorrência sem autor.')
  }
  const notes = report.notes.trim()
  if (notes.length > 500) {
    throw new Error('Observações com no máximo 500 caracteres.')
  }
  if ((reportCategoryRequiresNotes(report.category) || report.urgency === 'extreme') && notes.length < 8) {
    throw new Error('Descreva o que aconteceu com pelo menos 8 caracteres.')
  }
}
