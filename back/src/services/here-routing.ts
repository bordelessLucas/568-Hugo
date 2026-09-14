import { decode } from '@here/flexpolyline'
import {
  ROUTE_BLOCKED_MESSAGE,
  ROUTE_UNAVAILABLE_MESSAGE,
  buildHereRouteSearchParams,
  type GeoPoint,
  type RouteResult,
} from '../domain/route'
import type { TruckDimensions, TruckType } from '../domain/truck'

const HERE_ROUTES = 'https://router.hereapi.com/v8/routes'

const BLOCKED_CODES = new Set([
  'noRouteFound',
  'violatedVehicleRestriction',
  'violatedTransportModeInRouteHandleDecoding',
])

export async function calculateHereTruckRoute(input: {
  apiKey: string | undefined
  origin: GeoPoint
  destination: GeoPoint
  truck: (TruckDimensions & { type: TruckType }) | null
  departureTime?: Date
}): Promise<RouteResult> {
  if (!input.apiKey) {
    return { status: 'unavailable', message: ROUTE_UNAVAILABLE_MESSAGE }
  }
  if (!input.truck) {
    return { status: 'unavailable', message: 'Cadastre um caminhão antes de calcular a rota.' }
  }
  if (!isPoint(input.origin) || !isPoint(input.destination)) {
    return { status: 'unavailable', message: 'Origem ou destino inválido.' }
  }

  const params = buildHereRouteSearchParams({
    origin: input.origin,
    destination: input.destination,
    truck: input.truck,
    departureTime: input.departureTime ?? new Date(),
  })
  params.set('apiKey', input.apiKey)

  let response: Response
  try {
    response = await fetch(HERE_ROUTES + '?' + params.toString())
  } catch {
    return { status: 'unavailable', message: 'Sem conexão com o roteamento. Tente de novo.' }
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    return { status: 'unavailable', message: 'Resposta inválida do roteamento.' }
  }

  return parseHereRoute(body, response.ok)
}

function parseHereRoute(body: unknown, ok: boolean): RouteResult {
  if (!isRecord(body)) {
    return { status: 'unavailable', message: 'Resposta inválida do roteamento.' }
  }

  const notices = readNotices(body.notices)
  const blocked = firstBlocked(notices)
  if (blocked) {
    return { status: 'blocked', message: blocked }
  }
  if (!ok) {
    return { status: 'unavailable', message: ROUTE_UNAVAILABLE_MESSAGE }
  }

  const routes = body.routes
  if (!Array.isArray(routes) || routes.length === 0) {
    return { status: 'blocked', message: ROUTE_BLOCKED_MESSAGE }
  }

  const first = routes[0]
  if (!isRecord(first) || !Array.isArray(first.sections) || first.sections.length === 0) {
    return { status: 'blocked', message: ROUTE_BLOCKED_MESSAGE }
  }

  const path: GeoPoint[] = []
  let distanceMeters = 0
  let durationSeconds = 0

  for (const section of first.sections) {
    if (!isRecord(section)) {
      return { status: 'unavailable', message: 'Resposta inválida do roteamento.' }
    }
    const sectionBlocked = firstBlocked(readNotices(section.notices))
    if (sectionBlocked) {
      return { status: 'blocked', message: sectionBlocked }
    }
    const encoded = section.polyline
    if (typeof encoded !== 'string' || encoded === '') {
      return { status: 'unavailable', message: 'A rota veio sem geometria.' }
    }
    path.push(...decodePath(encoded))
    const summary = isRecord(section.summary) ? section.summary : null
    if (summary) {
      distanceMeters += readFinite(summary.length)
      durationSeconds += readFinite(summary.duration)
    }
  }

  if (path.length < 2) {
    return { status: 'blocked', message: ROUTE_BLOCKED_MESSAGE }
  }

  return {
    status: 'compatible',
    distanceMeters,
    durationSeconds,
    path,
  }
}

function decodePath(encoded: string): GeoPoint[] {
  const decoded = decode(encoded)
  return decoded.polyline.map((pair) => ({
    latitude: pair[0] ?? 0,
    longitude: pair[1] ?? 0,
  }))
}

function readNotices(value: unknown): Array<{ code: string; title: string; severity: string }> {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!isRecord(item)) return []
    return [
      {
        code: typeof item.code === 'string' ? item.code : '',
        title: typeof item.title === 'string' ? item.title : '',
        severity: typeof item.severity === 'string' ? item.severity : '',
      },
    ]
  })
}

function firstBlocked(notices: Array<{ code: string; title: string; severity: string }>): string | null {
  const critical = notices.find((notice) => notice.severity === 'critical' || BLOCKED_CODES.has(notice.code))
  if (!critical) return null
  if (critical.code === 'violatedVehicleRestriction') {
    return 'A rota viola uma restrição do caminhão. Não há caminho compatível.'
  }
  return ROUTE_BLOCKED_MESSAGE
}

function isPoint(point: GeoPoint): boolean {
  return (
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readFinite(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
