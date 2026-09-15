import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { isReportStatus, normalizeReportUrgency, type NewReport, type Report } from '../domain/report'
import { assertTruckDraft, isTruckType, type NewTruck, type Truck, type TruckType } from '../domain/truck'
import { getFirebaseAuth, getFirestoreDb } from './firebase'

const USERS = 'users'
const TRUCKS = 'trucks'
const REPORTS = 'reports'

function asRecord(data: DocumentData): Record<string, unknown> {
  return data
}

function readString(data: Record<string, unknown>, key: string): string {
  const value = data[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('Campo inválido: ' + key)
  }
  return value
}

function readOptionalString(data: Record<string, unknown>, key: string): string {
  const value = data[key]
  if (value === undefined || value === null) {
    return ''
  }
  if (typeof value !== 'string') {
    throw new Error('Campo inválido: ' + key)
  }
  return value
}

function readNumber(data: Record<string, unknown>, key: string): number {
  const value = data[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Campo inválido: ' + key)
  }
  return value
}

function readCreatedAt(data: Record<string, unknown>): string {
  const value = data.createdAt
  if (typeof value === 'string' && value.trim() !== '') {
    return value
  }
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  throw new Error('Campo inválido: createdAt')
}

function parseTruck(id: string, data: DocumentData): Truck {
  const record = asRecord(data)
  const type = readString(record, 'type')
  if (!isTruckType(type)) {
    throw new Error('Tipo de caminhão inválido: ' + type)
  }
  return {
    id,
    userId: readString(record, 'userId'),
    type,
    heightMeters: readNumber(record, 'heightMeters'),
    widthMeters: readNumber(record, 'widthMeters'),
    lengthMeters: readNumber(record, 'lengthMeters'),
    totalWeightKg: readNumber(record, 'totalWeightKg'),
  }
}

function parseReport(id: string, data: DocumentData): Report {
  const record = asRecord(data)
  const status = readString(record, 'status')
  const truckType = readString(record, 'truckType')
  if (!isReportStatus(status)) {
    throw new Error('Status inválido: ' + status)
  }
  if (!isTruckType(truckType)) {
    throw new Error('Tipo de caminhão inválido: ' + truckType)
  }
  return {
    id,
    status,
    notes: readOptionalString(record, 'notes'),
    latitude: readNumber(record, 'latitude'),
    longitude: readNumber(record, 'longitude'),
    truckType,
    authorId: readString(record, 'authorId'),
    createdAt: readCreatedAt(record),
    urgency: normalizeReportUrgency(record.urgency),
  }
}

function assertLocation(latitude: number, longitude: number): void {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error('Localização inválida.')
  }
}

export async function createTruck(truck: NewTruck): Promise<Truck> {
  assertTruckDraft(truck)
  const created = await addDoc(collection(getFirestoreDb(), USERS, truck.userId, TRUCKS), {
    userId: truck.userId,
    type: truck.type,
    heightMeters: truck.heightMeters,
    widthMeters: truck.widthMeters,
    lengthMeters: truck.lengthMeters,
    totalWeightKg: truck.totalWeightKg,
  })
  return { ...truck, id: created.id }
}

export async function updateTruck(truck: Truck): Promise<Truck> {
  assertTruckDraft(truck)
  const uid = getFirebaseAuth().currentUser?.uid
  if (!uid || truck.userId !== uid) {
    throw new Error('Caminhão sem dono autenticado.')
  }
  if (truck.id.trim() === '') {
    throw new Error('Caminhão sem identificador.')
  }
  await updateDoc(doc(getFirestoreDb(), USERS, truck.userId, TRUCKS, truck.id), {
    userId: truck.userId,
    type: truck.type,
    heightMeters: truck.heightMeters,
    widthMeters: truck.widthMeters,
    lengthMeters: truck.lengthMeters,
    totalWeightKg: truck.totalWeightKg,
  })
  return truck
}

export async function getUserTruck(userId: string): Promise<Truck | null> {
  const trucks = await listTrucksByUser(userId)
  return trucks[0] ?? null
}

export async function listTrucksByUser(userId: string): Promise<Truck[]> {
  const snapshot = await getDocs(collection(getFirestoreDb(), USERS, userId, TRUCKS))
  return snapshot.docs.map((item) => parseTruck(item.id, item.data()))
}

export async function createReport(report: NewReport): Promise<Report> {
  assertLocation(report.latitude, report.longitude)
  if (!isTruckType(report.truckType)) {
    throw new Error('Tipo de caminhão inválido.')
  }
  if (!isReportStatus(report.status)) {
    throw new Error('Status inválido.')
  }
  const uid = getFirebaseAuth().currentUser?.uid
  if (!uid || report.authorId !== uid) {
    throw new Error('Ocorrência sem autor autenticado.')
  }
  if (report.notes.length > 500) {
    throw new Error('Observações com no máximo 500 caracteres.')
  }
  const urgency = normalizeReportUrgency(report.urgency)
  if (urgency === 'extreme' && report.notes.trim().length < 8) {
    throw new Error('Na urgência extrema, descreva o que aconteceu (mínimo 8 caracteres).')
  }
  const created = await addDoc(collection(getFirestoreDb(), REPORTS), {
    authorId: uid,
    truckType: report.truckType,
    status: report.status,
    notes: report.notes.trim(),
    latitude: report.latitude,
    longitude: report.longitude,
    urgency,
    createdAt: serverTimestamp(),
  })
  return {
    ...report,
    authorId: uid,
    notes: report.notes.trim(),
    urgency,
    id: created.id,
    createdAt: new Date().toISOString(),
  }
}

export async function listReportsByTruckType(truckType: TruckType): Promise<Report[]> {
  const reportsQuery = query(
    collection(getFirestoreDb(), REPORTS),
    where('truckType', '==', truckType),
  )
  const snapshot = await getDocs(reportsQuery)
  return snapshot.docs.map((item) => parseReport(item.id, item.data()))
}

export async function listRecentReports(limitCount = 40): Promise<Report[]> {
  const size = Math.min(Math.max(limitCount, 1), 100)
  const reportsQuery = query(
    collection(getFirestoreDb(), REPORTS),
    orderBy('createdAt', 'desc'),
    limit(size),
  )
  const snapshot = await getDocs(reportsQuery)
  return snapshot.docs.flatMap((item) => {
    try {
      return [parseReport(item.id, item.data())]
    } catch {
      return []
    }
  })
}
