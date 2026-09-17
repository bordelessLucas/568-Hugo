import { collection, getDocs } from 'firebase/firestore'
import { assertOfficialRestriction, type OfficialRestriction } from '../domain/official-restriction'
import { assertSafePlace, type SafePlace } from '../domain/safe-place'
import { DEMO_OFFICIAL_RESTRICTIONS, DEMO_SAFE_PLACES } from '../domain/safety-fixtures'
import { getFirestoreDb } from './firebase'

function validRestriction(id: string, data: unknown): OfficialRestriction | null { try { const item = { ...(data as object), id } as OfficialRestriction; assertOfficialRestriction(item); return item } catch { return null } }
function validSafePlace(id: string, data: unknown): SafePlace | null { try { const item = { ...(data as object), id } as SafePlace; assertSafePlace(item); return item } catch { return null } }
export async function listOfficialRestrictions(): Promise<OfficialRestriction[]> { try { const snap = await getDocs(collection(getFirestoreDb(), 'officialRestrictions')); const items = snap.docs.flatMap((doc) => { const item = validRestriction(doc.id, doc.data()); return item ? [item] : [] }); return items.length ? items : DEMO_OFFICIAL_RESTRICTIONS } catch { return DEMO_OFFICIAL_RESTRICTIONS } }
export async function listSafePlaces(): Promise<SafePlace[]> { try { const snap = await getDocs(collection(getFirestoreDb(), 'safePlaces')); const items = snap.docs.flatMap((doc) => { const item = validSafePlace(doc.id, doc.data()); return item ? [item] : [] }); return items.length ? items : DEMO_SAFE_PLACES } catch { return DEMO_SAFE_PLACES } }
