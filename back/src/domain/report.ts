import type { TruckType } from './truck'

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

export interface ReportLocation {
  latitude: number
  longitude: number
}

export interface Report extends ReportLocation {
  id: string
  status: ReportStatus
  notes: string
  truckType: TruckType
  authorId: string
  createdAt: string
  /** normal = aviso de rota; extreme = acidente grave / urgência (aparece sem destino). */
  urgency: AlertUrgency
}

export type NewReport = Omit<Report, 'id' | 'createdAt'>
