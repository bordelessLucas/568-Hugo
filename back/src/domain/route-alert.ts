import type { ReportStatus, AlertUrgency, ReportCategory } from './report'
import type { TruckType } from './truck'

export type { AlertUrgency }

export type AlertAnswer = 'continues' | 'cleared' | 'unknown'

export type AlertPhase = 'ahead' | 'confirm' | 'none'

export type AlertPriority = 'normal' | 'low'

export interface GeoPoint {
  latitude: number
  longitude: number
}

/** Parâmetros do MVP (sem HERE): corredor em linha reta eu → destino. */
export const ROUTE_ALERT = {
  /** Metade do corredor em metros (~2–3 km total). */
  corridorHalfWidthMeters: 2500,
  /** Distância máxima à frente para mostrar o cartão. */
  aheadWindowMeters: 8000,
  /** Depois de passar o ponto, dispara “Continua lá?”. */
  passedMeters: 400,
  /** Sem destino: só urgência extrema neste raio. */
  extremeNearMeters: 1500,
  /** Cooldown após fechar o cartão (ms). */
  dismissCooldownMs: 5 * 60 * 1000,
  /** % de “liberou” para esconder o aviso. */
  clearHideRatio: 0.8,
  /** Amostra mínima antes de esconder. */
  clearHideMinVotes: 5,
  /** Tempo para o cartão “Continua lá?” sumir sozinho (ms). */
  confirmAutoDismissMs: 90_000,
} as const

export interface RouteAlertSource {
  id: string
  kind: 'report' | 'pilot'
  label: string
  category: ReportCategory
  status: ReportStatus
  notes: string
  truckType: TruckType
  latitude: number
  longitude: number
  urgency: AlertUrgency
  createdAt?: string
}

export interface AlertStats {
  alertId: string
  continues: number
  cleared: number
  priority: AlertPriority
  hidden: boolean
  updatedAt: string
}

export interface EvaluatedRouteAlert {
  source: RouteAlertSource
  stats: AlertStats
  phase: Exclude<AlertPhase, 'none'>
  distanceMeters: number
  /** Distância ao longo da rota a partir do usuário (negativo = atrás). */
  alongMeters: number
  priority: AlertPriority
}

export interface TripAlertContext {
  user: GeoPoint
  /** Início fixo do trajeto (capturado ao escolher o destino). */
  routeOrigin: GeoPoint | null
  destination: GeoPoint | null
  /**
   * Geometria da rota (HERE ou fixture). Quando ausente, usa reta origem→destino.
   */
  path?: ReadonlyArray<GeoPoint> | null
  truckType: TruckType | null
  /** IDs já vistos neste trajeto (Entendi). */
  seenIds: ReadonlySet<string>
  /** IDs com “Continua lá?” já respondido neste trajeto. */
  confirmedIds: ReadonlySet<string>
  /** IDs dispensados com cooldown ainda ativo. */
  dismissedUntil: ReadonlyMap<string, number>
  nowMs?: number
}

export function emptyAlertStats(alertId: string, nowIso = new Date().toISOString()): AlertStats {
  return {
    alertId,
    continues: 0,
    cleared: 0,
    priority: 'normal',
    hidden: false,
    updatedAt: nowIso,
  }
}

export function applyConfirmationVote(
  stats: AlertStats,
  answer: AlertAnswer,
  nowIso = new Date().toISOString(),
): AlertStats {
  if (answer === 'unknown') {
    return { ...stats, updatedAt: nowIso }
  }

  const continues = stats.continues + (answer === 'continues' ? 1 : 0)
  const cleared = stats.cleared + (answer === 'cleared' ? 1 : 0)
  const sample = continues + cleared
  const clearRatio = sample > 0 ? cleared / sample : 0
  const hidden =
    sample >= ROUTE_ALERT.clearHideMinVotes && clearRatio >= ROUTE_ALERT.clearHideRatio
  const priority: AlertPriority =
    cleared > 0 && !hidden ? 'low' : hidden ? 'low' : 'normal'

  return {
    alertId: stats.alertId,
    continues,
    cleared,
    priority,
    hidden,
    updatedAt: nowIso,
  }
}

export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const earth = 6371000
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Projeta o ponto no segmento A→B. Retorna distância perpendicular e progresso 0–1. */
export function projectOnSegment(
  point: GeoPoint,
  start: GeoPoint,
  end: GeoPoint,
): { distanceMeters: number; t: number; alongFromStartMeters: number } {
  const ax = start.longitude
  const ay = start.latitude
  const bx = end.longitude
  const by = end.latitude
  const px = point.longitude
  const py = point.latitude
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  if (len2 === 0) {
    return {
      distanceMeters: haversineMeters(point, start),
      t: 0,
      alongFromStartMeters: 0,
    }
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2))
  const closest: GeoPoint = {
    latitude: ay + t * dy,
    longitude: ax + t * dx,
  }
  const routeLength = haversineMeters(start, end)
  return {
    distanceMeters: haversineMeters(point, closest),
    t,
    alongFromStartMeters: routeLength * t,
  }
}

function matchesTruck(source: RouteAlertSource, truckType: TruckType | null): boolean {
  if (!truckType) return true
  // Avisos extremos valem para todos; demais preferem o tipo do caminhão.
  if (source.urgency === 'extreme') return true
  return source.truckType === truckType || source.status === 'nao_passa'
}

/** Distância acumulada ao longo de uma polyline até o ponto mais próximo. */
export function progressAlongPath(
  point: GeoPoint,
  path: ReadonlyArray<GeoPoint>,
): { distanceMeters: number; alongFromStartMeters: number } | null {
  if (path.length < 2) return null
  let bestDist = Number.POSITIVE_INFINITY
  let bestAlong = 0
  let walked = 0
  for (let i = 0; i < path.length - 1; i += 1) {
    const start = path[i]
    const end = path[i + 1]
    if (!start || !end) continue
    const segLen = haversineMeters(start, end)
    const proj = projectOnSegment(point, start, end)
    if (proj.distanceMeters < bestDist) {
      bestDist = proj.distanceMeters
      bestAlong = walked + proj.alongFromStartMeters
    }
    walked += segLen
  }
  if (!Number.isFinite(bestDist)) return null
  return { distanceMeters: bestDist, alongFromStartMeters: bestAlong }
}

function corridorEnds(
  ctx: TripAlertContext,
): { start: GeoPoint; end: GeoPoint } | null {
  if (ctx.routeOrigin && ctx.destination) {
    return { start: ctx.routeOrigin, end: ctx.destination }
  }
  return null
}

function isCoolingDown(
  alertId: string,
  dismissedUntil: ReadonlyMap<string, number>,
  nowMs: number,
): boolean {
  const until = dismissedUntil.get(alertId)
  return typeof until === 'number' && until > nowMs
}

function rankAlert(a: EvaluatedRouteAlert, b: EvaluatedRouteAlert): number {
  if (a.source.urgency !== b.source.urgency) {
    return a.source.urgency === 'extreme' ? -1 : 1
  }
  if (a.priority !== b.priority) {
    return a.priority === 'normal' ? -1 : 1
  }
  if (a.source.status !== b.source.status) {
    return a.source.status === 'nao_passa' ? -1 : 1
  }
  return a.distanceMeters - b.distanceMeters
}

/**
 * Escolhe o próximo cartão para a Home.
 * Sem destino: somente urgência extrema perto do usuário.
 * Com destino: avisos no corredor à frente; após passar, fase confirm.
 */
export function pickRouteAlert(
  sources: RouteAlertSource[],
  statsById: ReadonlyMap<string, AlertStats>,
  ctx: TripAlertContext,
): EvaluatedRouteAlert | null {
  const nowMs = ctx.nowMs ?? Date.now()
  const candidates: EvaluatedRouteAlert[] = []

  for (const source of sources) {
    if (!matchesTruck(source, ctx.truckType)) continue
    const stats = statsById.get(source.id) ?? emptyAlertStats(source.id)
    if (stats.hidden) continue
    if (isCoolingDown(source.id, ctx.dismissedUntil, nowMs)) continue

    const point: GeoPoint = {
      latitude: source.latitude,
      longitude: source.longitude,
    }

    const ends = corridorEnds(ctx)
    if (!ends) {
      if (source.urgency !== 'extreme') continue
      const distanceMeters = haversineMeters(ctx.user, point)
      if (distanceMeters > ROUTE_ALERT.extremeNearMeters) continue
      if (ctx.seenIds.has(source.id)) continue
      candidates.push({
        source,
        stats,
        phase: 'ahead',
        distanceMeters,
        alongMeters: distanceMeters,
        priority: stats.priority,
      })
      continue
    }

    const path = ctx.path && ctx.path.length >= 2 ? ctx.path : [ends.start, ends.end]
    const userProg = progressAlongPath(ctx.user, path)
    const alertProg = progressAlongPath(point, path)
    if (!userProg || !alertProg) continue
    if (alertProg.distanceMeters > ROUTE_ALERT.corridorHalfWidthMeters) continue

    const alongMeters = alertProg.alongFromStartMeters - userProg.alongFromStartMeters
    const distanceMeters = haversineMeters(ctx.user, point)

    if (alongMeters > ROUTE_ALERT.passedMeters) {
      if (alongMeters > ROUTE_ALERT.aheadWindowMeters) continue
      if (ctx.seenIds.has(source.id)) continue
      candidates.push({
        source,
        stats,
        phase: 'ahead',
        distanceMeters,
        alongMeters,
        priority: stats.priority,
      })
      continue
    }

    if (alongMeters < -ROUTE_ALERT.passedMeters) {
      if (ctx.confirmedIds.has(source.id)) continue
      if (!ctx.seenIds.has(source.id) && source.urgency !== 'extreme') continue
      candidates.push({
        source,
        stats,
        phase: 'confirm',
        distanceMeters,
        alongMeters,
        priority: stats.priority,
      })
    }
  }

  if (candidates.length === 0) return null

  // Preferir confirm sobre ahead quando ambos existem (já passou).
  const confirms = candidates.filter((item) => item.phase === 'confirm')
  const pool = confirms.length > 0 ? confirms : candidates
  return [...pool].sort(rankAlert)[0] ?? null
}

export function formatDistanceLabel(meters: number): string {
  if (meters < 1000) {
    return `~${Math.max(50, Math.round(meters / 50) * 50)} m`
  }
  const km = meters / 1000
  return `~${km < 10 ? km.toFixed(1).replace('.', ',') : Math.round(km)} km`
}

export const ALERT_URGENCY_LABEL: Record<AlertUrgency, string> = {
  normal: 'Aviso na rota',
  extreme: 'Urgência extrema',
}

export const ALERT_STATUS_LABEL: Record<ReportStatus, string> = {
  passa: 'Passa',
  nao_passa: 'Não passa',
}
