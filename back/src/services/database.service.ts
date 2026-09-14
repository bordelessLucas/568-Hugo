import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { isReportStatus, type NewReport, type Report } from '../domain/report'
import { assertTruckDraft, isTruckType, type NewTruck, type Truck, type TruckType } from '../domain/truck'
import { getFirestoreDb } from './firebase'

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
  const created = await addDoc(collection(getFirestoreDb(), REPORTS), {
    ...report,
    createdAt: serverTimestamp(),
  })
  return {
    ...report,
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
