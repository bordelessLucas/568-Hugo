import { doc, getDoc, setDoc, updateDoc, type DocumentData } from 'firebase/firestore'
import { isGender, type Gender, type UserProfile } from '../domain/user'
import { getFirestoreDb } from './firebase'

const USERS = 'users'

function asRecord(data: DocumentData): Record<string, unknown> {
  return data
}

function readString(data: Record<string, unknown>, key: string): string {
  const value = data[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('Campo invalido: ' + key)
  }
  return value
}

function readCreatedAt(data: Record<string, unknown>): string {
  const value = data.createdAt
  if (typeof value === 'string' && value.trim() !== '') {
    return value
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    const date = value.toDate()
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date.toISOString()
    }
  }
  throw new Error('Campo invalido: createdAt')
}

export interface UserSetupUpdate {
  gender?: Gender
  onboardingDismissed?: boolean
  activeTruckId?: string
}

export async function saveUserProfile(
  profile: Pick<UserProfile, 'id' | 'name' | 'email' | 'createdAt'>,
): Promise<void> {
  await setDoc(
    doc(getFirestoreDb(), USERS, profile.id),
    {
      name: profile.name,
      email: profile.email,
      createdAt: profile.createdAt,
    },
    { merge: true },
  )
}

export async function updateUserSetup(userId: string, input: UserSetupUpdate): Promise<void> {
  const payload: Record<string, string | boolean> = {}
  if (input.gender !== undefined) {
    payload.gender = input.gender
  }
  if (input.onboardingDismissed !== undefined) {
    payload.onboardingDismissed = input.onboardingDismissed
  }
  if (input.activeTruckId !== undefined && input.activeTruckId.trim() !== '') {
    payload.activeTruckId = input.activeTruckId
  }
  if (Object.keys(payload).length === 0) {
    return
  }
  await updateDoc(doc(getFirestoreDb(), USERS, userId), payload)
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(getFirestoreDb(), USERS, userId))
  if (!snapshot.exists()) {
    return null
  }
  const record = asRecord(snapshot.data())
  return {
    id: snapshot.id,
    name: readString(record, 'name'),
    email: readString(record, 'email'),
    createdAt: readCreatedAt(record),
    gender: readGender(record),
    onboardingDismissed: record.onboardingDismissed === true,
    activeTruckId: readOptionalId(record, 'activeTruckId'),
  }
}

function readOptionalId(data: Record<string, unknown>, key: string): string | null {
  const value = data[key]
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  return value
}

function readGender(data: Record<string, unknown>): Gender | null {
  const value = data.gender
  if (value === undefined || value === null) {
    return null
  }
  if (typeof value !== 'string' || !isGender(value)) {
    return null
  }
  return value
}
