import {
  getFirebaseAuth,
  ROUTE_UNAVAILABLE_MESSAGE,
  type GeoPoint,
  type RouteResult,
} from '@rotatrucks/back'

export function routingConfigured(): boolean {
  return functionUrl() !== ''
}

export function hereMapsConfigured(): boolean {
  return (import.meta.env.VITE_HERE_MAPS_API_KEY ?? '').trim() !== ''
}

export async function requestTruckRoute(input: {
  origin: GeoPoint
  destination: GeoPoint
}): Promise<RouteResult> {
  const url = functionUrl()
  if (!url) {
    return { status: 'unavailable', message: ROUTE_UNAVAILABLE_MESSAGE }
  }

  const user = getFirebaseAuth().currentUser
  if (!user) {
    return { status: 'unavailable', message: 'Entre na conta para calcular a rota.' }
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + (await user.getIdToken()),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: input.origin,
        destination: input.destination,
      }),
    })
  } catch {
    return { status: 'unavailable', message: 'Sem conexão com o roteamento. Tente de novo.' }
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    return { status: 'unavailable', message: 'Resposta inválida do roteamento.' }
  }
  return parseRouteResult(body)
}

function functionUrl(): string {
  return (import.meta.env.VITE_ROUTE_FUNCTION_URL ?? '').trim()
}

function parseRouteResult(body: unknown): RouteResult {
  if (typeof body !== 'object' || body === null || !('status' in body)) {
    return { status: 'unavailable', message: 'Resposta inválida do roteamento.' }
  }
  const record = body as Record<string, unknown>
  if (record.status === 'unavailable' || record.status === 'blocked') {
    return {
      status: record.status,
      message: typeof record.message === 'string' ? record.message : ROUTE_UNAVAILABLE_MESSAGE,
    }
  }
  if (record.status !== 'compatible' || !Array.isArray(record.path)) {
    return { status: 'unavailable', message: 'Resposta inválida do roteamento.' }
  }
  const path = record.path.flatMap((point) => {
    if (typeof point !== 'object' || point === null) return []
    const item = point as Record<string, unknown>
    if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') return []
    return [{ latitude: item.latitude, longitude: item.longitude }]
  })
  if (path.length < 2) {
    return { status: 'unavailable', message: 'A rota veio sem geometria.' }
  }
  return {
    status: 'compatible',
    distanceMeters: typeof record.distanceMeters === 'number' ? record.distanceMeters : 0,
    durationSeconds: typeof record.durationSeconds === 'number' ? record.durationSeconds : 0,
    path,
  }
}
