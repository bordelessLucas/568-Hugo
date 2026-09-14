import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { onRequest } from 'firebase-functions/v2/https'
import { calculateHereTruckRoute } from '@rotatrucks/back/here'
import { isTruckType, type GeoPoint } from '@rotatrucks/back'

initializeApp()

export const calculateTruckRoute = onRequest(
  { region: 'southamerica-east1', cors: true, secrets: ['HERE_API_KEY'] },
  async (request, response) => {
    if (request.method !== 'POST') {
      response.status(405).json({ status: 'unavailable', message: 'Use POST.' })
      return
    }

    const token = readBearer(request.header('authorization'))
    if (!token) {
      response.status(401).json({ status: 'unavailable', message: 'Entre na conta.' })
      return
    }

    let uid = ''
    try {
      const decoded = await getAuth().verifyIdToken(token)
      uid = decoded.uid
    } catch {
      response.status(401).json({ status: 'unavailable', message: 'Sessão inválida.' })
      return
    }

    const origin = readPoint(request.body, 'origin')
    const destination = readPoint(request.body, 'destination')
    if (!origin || !destination) {
      response.status(400).json({ status: 'unavailable', message: 'Origem ou destino inválido.' })
      return
    }

    const truck = await loadActiveTruck(uid)
    const result = await calculateHereTruckRoute({
      apiKey: process.env.HERE_API_KEY,
      origin,
      destination,
      truck,
    })
    response.status(200).json(result)
  },
)

async function loadActiveTruck(uid: string) {
  const db = getFirestore()
  const profile = await db.collection('users').doc(uid).get()
  const activeId = profile.get('activeTruckId')
  const trucks = await db.collection('users').doc(uid).collection('trucks').get()
  const chosen =
    trucks.docs.find((item) => item.id === activeId) ?? trucks.docs[0] ?? null
  if (!chosen) return null
  const data = chosen.data()
  const type = data.type
  if (typeof type !== 'string' || !isTruckType(type)) return null
  return {
    type,
    heightMeters: readNumber(data.heightMeters),
    widthMeters: readNumber(data.widthMeters),
    lengthMeters: readNumber(data.lengthMeters),
    totalWeightKg: readNumber(data.totalWeightKg),
  }
}

function readBearer(header: string | undefined): string | null {
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice('Bearer '.length).trim()
  return token === '' ? null : token
}

function readPoint(body: unknown, key: string): GeoPoint | null {
  if (typeof body !== 'object' || body === null || !(key in body)) return null
  const value = (body as Record<string, unknown>)[key]
  if (typeof value !== 'object' || value === null) return null
  const point = value as Record<string, unknown>
  if (typeof point.latitude !== 'number' || typeof point.longitude !== 'number') return null
  return { latitude: point.latitude, longitude: point.longitude }
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}
