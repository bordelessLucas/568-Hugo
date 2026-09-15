import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import {
  assertCommunityDraft,
  buildCommunityFeed,
  PILOT_COMMUNITY,
  PILOT_MARKS,
  type Community,
  type CommunityFeedItem,
  type CommunityStatus,
  type NewCommunity,
} from '../domain/community'
import { listRecentReports } from './database.service'
import { getFirebaseAuth, getFirestoreDb } from './firebase'

const COMMUNITIES = 'communities'

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
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') throw new Error('Campo inválido: ' + key)
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
  if (typeof value === 'string' && value.trim() !== '') return value
  if (value instanceof Timestamp) return value.toDate().toISOString()
  throw new Error('Campo inválido: createdAt')
}

function isCommunityStatus(value: string): value is CommunityStatus {
  return value === 'pending' || value === 'approved' || value === 'rejected'
}

function parseCommunity(id: string, data: DocumentData): Community {
  const record = asRecord(data)
  const status = readString(record, 'status')
  if (!isCommunityStatus(status)) {
    throw new Error('Status de comunidade inválido: ' + status)
  }
  return {
    id,
    name: readString(record, 'name'),
    description: readOptionalString(record, 'description'),
    city: readString(record, 'city'),
    state: readString(record, 'state').toUpperCase(),
    creatorId: readString(record, 'creatorId'),
    status,
    createdAt: readCreatedAt(record),
    latitude: readNumber(record, 'latitude'),
    longitude: readNumber(record, 'longitude'),
  }
}

export function listPilotCommunities(): Community[] {
  return [PILOT_COMMUNITY]
}

export function listPilotMarks(communityId?: string) {
  if (!communityId) return PILOT_MARKS
  return PILOT_MARKS.filter((item) => item.communityId === communityId)
}

export async function createCommunity(input: NewCommunity): Promise<Community> {
  assertCommunityDraft(input)
  const uid = getFirebaseAuth().currentUser?.uid
  if (!uid || input.creatorId !== uid) {
    throw new Error('Comunidade sem autor autenticado.')
  }
  const created = await addDoc(collection(getFirestoreDb(), COMMUNITIES), {
    name: input.name.trim(),
    description: input.description.trim(),
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    creatorId: uid,
    status: 'pending',
    latitude: input.latitude,
    longitude: input.longitude,
    createdAt: serverTimestamp(),
  })
  return {
    ...input,
    name: input.name.trim(),
    description: input.description.trim(),
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    creatorId: uid,
    id: created.id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
}

export async function listApprovedCommunities(): Promise<Community[]> {
  const snapshot = await getDocs(
    query(collection(getFirestoreDb(), COMMUNITIES), where('status', '==', 'approved')),
  )
  return snapshot.docs.map((item) => parseCommunity(item.id, item.data()))
}

export async function listCommunitiesByCreator(creatorId: string): Promise<Community[]> {
  const snapshot = await getDocs(
    query(collection(getFirestoreDb(), COMMUNITIES), where('creatorId', '==', creatorId)),
  )
  return snapshot.docs.map((item) => parseCommunity(item.id, item.data()))
}

export async function listVisibleCommunities(userId: string): Promise<Community[]> {
  const [approved, mine] = await Promise.all([
    listApprovedCommunities(),
    listCommunitiesByCreator(userId),
  ])
  const byId = new Map<string, Community>()
  for (const item of listPilotCommunities()) byId.set(item.id, item)
  for (const item of approved) byId.set(item.id, item)
  for (const item of mine) byId.set(item.id, item)
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

export async function getCommunity(communityId: string, viewerId: string): Promise<Community | null> {
  if (communityId === PILOT_COMMUNITY.id) return PILOT_COMMUNITY
  const snap = await getDoc(doc(getFirestoreDb(), COMMUNITIES, communityId))
  if (!snap.exists()) return null
  const community = parseCommunity(snap.id, snap.data())
  if (community.status !== 'approved' && community.creatorId !== viewerId) {
    throw new Error('Esta comunidade ainda não está disponível.')
  }
  return community
}

export async function updatePendingCommunity(input: Community): Promise<Community> {
  const uid = getFirebaseAuth().currentUser?.uid
  if (!uid || input.creatorId !== uid) {
    throw new Error('Só quem pediu a comunidade pode editar o pedido.')
  }
  if (input.system || input.id === PILOT_COMMUNITY.id) {
    throw new Error('A comunidade piloto não pode ser editada.')
  }
  if (input.status !== 'pending') {
    throw new Error('Só dá para editar enquanto o pedido aguarda aprovação.')
  }
  assertCommunityDraft({
    name: input.name,
    description: input.description,
    city: input.city,
    state: input.state,
    creatorId: input.creatorId,
    latitude: input.latitude,
    longitude: input.longitude,
  })
  const ref = doc(getFirestoreDb(), COMMUNITIES, input.id)
  const current = await getDoc(ref)
  if (!current.exists()) throw new Error('Pedido não encontrado.')
  const existing = parseCommunity(current.id, current.data())
  if (existing.status !== 'pending' || existing.creatorId !== uid) {
    throw new Error('Só dá para editar enquanto o pedido aguarda aprovação.')
  }
  await updateDoc(ref, {
    name: input.name.trim(),
    description: input.description.trim(),
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    latitude: input.latitude,
    longitude: input.longitude,
    status: 'pending',
    creatorId: uid,
  })
  return {
    ...existing,
    name: input.name.trim(),
    description: input.description.trim(),
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    latitude: input.latitude,
    longitude: input.longitude,
  }
}

export async function deletePendingCommunity(communityId: string, creatorId: string): Promise<void> {
  const uid = getFirebaseAuth().currentUser?.uid
  if (!uid || creatorId !== uid) {
    throw new Error('Só quem pediu a comunidade pode cancelar o pedido.')
  }
  if (communityId === PILOT_COMMUNITY.id) {
    throw new Error('A comunidade piloto não pode ser removida.')
  }
  const ref = doc(getFirestoreDb(), COMMUNITIES, communityId)
  const current = await getDoc(ref)
  if (!current.exists()) return
  const existing = parseCommunity(current.id, current.data())
  if (existing.creatorId !== uid || existing.status !== 'pending') {
    throw new Error('Só dá para cancelar enquanto o pedido aguarda aprovação.')
  }
  await deleteDoc(ref)
}

export async function loadCommunityDetail(
  communityId: string,
  viewerId: string,
): Promise<{ community: Community; feed: CommunityFeedItem[] }> {
  const community = await getCommunity(communityId, viewerId)
  if (!community) throw new Error('Comunidade não encontrada.')
  const reports = await listRecentReports(40)
  return {
    community,
    feed: buildCommunityFeed(community, reports),
  }
}
