import type { TruckType } from './truck'

export const REPORT_STATUSES = ['passa', 'nao_passa'] as const

export type ReportStatus = (typeof REPORT_STATUSES)[number]

const REPORT_STATUS_SET: ReadonlySet<string> = new Set(REPORT_STATUSES)

export function isReportStatus(value: string): value is ReportStatus {
  return REPORT_STATUS_SET.has(value)
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
}

export type NewReport = Omit<Report, 'id' | 'createdAt'>
