import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Linking from 'expo-linking'
import * as SMS from 'expo-sms'
import { assertTrustedContacts, buildEmergencyMessage, type EmergencyProtocol, type EmergencyTransportResult, type TrustedContact } from '@rotatrucks/back'

const keyFor = (kind: 'contacts' | 'protocols', userId: string) => `rotatrucks-${kind}:${userId}`

export async function loadTrustedContacts(userId: string): Promise<TrustedContact[]> {
  try {
    const raw = await AsyncStorage.getItem(keyFor('contacts', userId))
    if (!raw) return []
    const contacts = JSON.parse(raw) as TrustedContact[]
    assertTrustedContacts(contacts)
    return contacts
  } catch { return [] }
}

export async function saveTrustedContacts(userId: string, contacts: TrustedContact[]): Promise<void> {
  assertTrustedContacts(contacts)
  await AsyncStorage.setItem(keyFor('contacts', userId), JSON.stringify(contacts))
}

export async function saveEmergencyProtocol(protocol: EmergencyProtocol): Promise<void> {
  const key = keyFor('protocols', protocol.userId)
  const raw = await AsyncStorage.getItem(key)
  const protocols = raw ? (JSON.parse(raw) as EmergencyProtocol[]) : []
  await AsyncStorage.setItem(key, JSON.stringify([protocol, ...protocols.filter((item) => item.id !== protocol.id)].slice(0, 20)))
}

export async function loadActiveEmergencyProtocol(userId: string): Promise<EmergencyProtocol | null> {
  try {
    const raw = await AsyncStorage.getItem(keyFor('protocols', userId))
    const protocols = raw ? (JSON.parse(raw) as EmergencyProtocol[]) : []
    return protocols.find((item) => item.status === 'active') ?? null
  } catch { return null }
}

export async function callPrf(): Promise<EmergencyTransportResult> {
  try {
    if (!(await Linking.canOpenURL('tel:191'))) return { kind: 'call', state: 'unavailable' }
    await Linking.openURL('tel:191')
    return { kind: 'call', state: 'handed_to_os' }
  } catch { return { kind: 'call', state: 'unavailable' } }
}

export async function prepareEmergencySms(contacts: TrustedContact[], protocol: EmergencyProtocol): Promise<EmergencyTransportResult> {
  try {
    if (contacts.length === 0 || !(await SMS.isAvailableAsync())) return { kind: 'sms', state: 'unavailable' }
    await SMS.sendSMSAsync(contacts.map((contact) => contact.phone), buildEmergencyMessage(protocol))
    return { kind: 'sms', state: 'handed_to_os' }
  } catch { return { kind: 'sms', state: 'unavailable' } }
}
