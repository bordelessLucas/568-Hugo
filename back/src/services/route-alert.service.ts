import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { PILOT_MARKS } from '../domain/community'
import { formatReportLabel } from '../domain/report'
import {
  applyConfirmationVote,
  emptyAlertStats,
  haversineMeters,
  pickRouteAlert,
  ROUTE_ALERT,
  type AlertAnswer,
  type AlertStats,
  type EvaluatedRouteAlert,
  type RouteAlertSource,
  type TripAlertContext,
} from '../domain/route-alert'
import { listRecentReports } from './database.service'
import { getFirebaseAuth, getFirestoreDb } from './firebase'

const ALERT_STATS = 'alertStats'
const ALERT_CONFIRMATIONS = 'alertConfirmations'

function asRecord(data: DocumentData): Record<string, unknown> {
  return data
}

function readNumber(data: Record<string, unknown>, key: string, fallback = 0): number {
  const value = data[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  return fallback
}

function readString(data: Record<string, unknown>, key: string, fallback = ''): string {
  const value = data[key]
  if (typeof value === 'string') return value
  return fallback
}

function readCreatedAt(data: Record<string, unknown>): string {
  const value = data.updatedAt ?? data.createdAt
  if (typeof value === 'string' && value.trim() !== '') return value
  if (value instanceof Timestamp) return value.toDate().toISOString()
  return new Date().toISOString()
}

function parseStats(id: string, data: DocumentData): AlertStats {
  const record = asRecord(data)
  const continues = Math.max(0, Math.floor(readNumber(record, 'continues')))
  const cleared = Math.max(0, Math.floor(readNumber(record, 'cleared')))
  const priority = readString(record, 'priority') === 'low' ? 'low' : 'normal'
  const hidden = record.hidden === true
  return {
    alertId: id,
    continues,
    cleared,
    priority,
    hidden,
    updatedAt: readCreatedAt(record),
  }
}

export function alertIdForReport(reportId: string): string {
  return `report:${reportId}`
}

export function alertIdForPilot(pilotId: string): string {
  return `pilot:${pilotId}`
}

export async function listRouteAlertSources(limitReports = 60): Promise<RouteAlertSource[]> {
  const reports = await listRecentReports(limitReports)
  const fromReports: RouteAlertSource[] = reports.map((report) => ({
    id: alertIdForReport(report.id),
    kind: 'report',
    label: formatReportLabel(report.category, report.status),
    category: report.category,
    status: report.status,
    notes: report.notes || 'Sem observação.',
    truckType: report.truckType,
    latitude: report.latitude,
    longitude: report.longitude,
    urgency: report.urgency,
    createdAt: report.createdAt,
  }))

  const fromPilot: RouteAlertSource[] = PILOT_MARKS.map((mark) => ({
    id: alertIdForPilot(mark.id),
    kind: 'pilot',
    label: mark.label,
    category: mark.category,
    status: mark.status,
    notes: mark.notes,
    truckType: mark.truckType,
    latitude: mark.latitude,
    longitude: mark.longitude,
    urgency: mark.urgency === 'extreme' ? 'extreme' : 'normal',
  }))

  return [...fromPilot, ...fromReports]
}

export async function getAlertStats(alertId: string): Promise<AlertStats> {
  const snap = await getDoc(doc(getFirestoreDb(), ALERT_STATS, alertId))
  if (!snap.exists()) return emptyAlertStats(alertId)
  return parseStats(snap.id, snap.data())
}

export async function listAlertStats(alertIds: string[]): Promise<Map<string, AlertStats>> {
  const unique = [...new Set(alertIds.filter((id) => id.trim() !== ''))]
  const map = new Map<string, AlertStats>()
  await Promise.all(
    unique.map(async (id) => {
      map.set(id, await getAlertStats(id))
    }),
  )
  return map
}

export async function loadRouteAlertForTrip(
  ctx: TripAlertContext,
): Promise<EvaluatedRouteAlert | null> {
  const sources = await listRouteAlertSources()
  const nearby = sources.filter((source) => isRoughlyRelevant(source, ctx))
  if (nearby.length === 0) return null
  const stats = await listAlertStats(nearby.map((item) => item.id))
  return pickRouteAlert(nearby, stats, ctx)
}

/** Evita dezenas de leituras no Firestore a cada poll do celular. */
function isRoughlyRelevant(source: RouteAlertSource, ctx: TripAlertContext): boolean {
  const point = { latitude: source.latitude, longitude: source.longitude }
  if (!ctx.destination || !ctx.routeOrigin) {
    return (
      source.urgency === 'extreme' &&
      haversineMeters(ctx.user, point) <= ROUTE_ALERT.extremeNearMeters * 1.2
    )
  }
  const toUser = haversineMeters(ctx.user, point)
  const toDest = haversineMeters(point, ctx.destination)
  const routeLen = haversineMeters(ctx.routeOrigin, ctx.destination)
  // Folga: corredor + janela à frente + margem de “já passou”.
  const budget =
    routeLen + ROUTE_ALERT.aheadWindowMeters + ROUTE_ALERT.corridorHalfWidthMeters + 2000
  return toUser <= budget && toDest <= budget
}

/**
 * Registra a resposta do “Continua lá?”.
 * Um voto útil (continues/cleared) por usuário por aviso; unknown não conta na amostra.
 * “Liberou” baixa prioridade; com ≥5 votos e ≥80% liberou, o aviso some.
 * Usa transação para evitar corrida entre motoristas.
 */
export async function submitAlertConfirmation(input: {
  alertId: string
  answer: AlertAnswer
}): Promise<AlertStats> {
  const uid = getFirebaseAuth().currentUser?.uid
  if (!uid) throw new Error('Entre na conta para responder o aviso.')
  const alertId = input.alertId.trim()
  if (alertId === '') throw new Error('Aviso sem identificador.')
  if (input.answer !== 'continues' && input.answer !== 'cleared' && input.answer !== 'unknown') {
    throw new Error('Resposta inválida.')
  }

  const confirmationId = `${alertId}__${uid}`.replace(/[/\\]/g, '_')
  const db = getFirestoreDb()
  const confirmationRef = doc(db, ALERT_CONFIRMATIONS, confirmationId)
  const statsRef = doc(db, ALERT_STATS, alertId)

  return runTransaction(db, async (tx) => {
    const previous = await tx.get(confirmationRef)
    const statsSnap = await tx.get(statsRef)
    const previousAnswer =
      previous.exists() && typeof previous.data().answer === 'string'
        ? String(previous.data().answer)
        : null
    const current = statsSnap.exists()
      ? parseStats(alertId, statsSnap.data())
      : emptyAlertStats(alertId)

    tx.set(
      confirmationRef,
      {
        alertId,
        userId: uid,
        answer: input.answer,
        createdAt: previous.exists()
          ? (previous.data().createdAt ?? serverTimestamp())
          : serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    if (input.answer === 'unknown') {
      return current
    }

    if (previousAnswer === 'continues' || previousAnswer === 'cleared') {
      return current
    }

    const next = applyConfirmationVote(current, input.answer)
    tx.set(statsRef, {
      continues: next.continues,
      cleared: next.cleared,
      priority: next.priority,
      hidden: next.hidden,
      updatedAt: serverTimestamp(),
    })
    return next
  })
}

export function evaluateLocalRouteAlert(
  sources: RouteAlertSource[],
  statsById: ReadonlyMap<string, AlertStats>,
  ctx: TripAlertContext,
): EvaluatedRouteAlert | null {
  return pickRouteAlert(sources, statsById, ctx)
}
