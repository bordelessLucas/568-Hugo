import type { GeoPoint } from './route-alert'

export interface TrustedContact { id: string; name: string; phone: string; relationship?: string }
export interface EmergencyProtocol { id: string; userId: string; truckId: string | null; location: GeoPoint | null; createdAt: string; status: 'active' | 'closed'; channels: Array<{ kind: 'call' | 'sms' | 'push'; state: 'prepared' | 'handed_to_os' | 'unavailable' }> }
export type EmergencyTransportResult = EmergencyProtocol['channels'][number]
export function assertTrustedContacts(contacts: TrustedContact[]): void {
  if (contacts.length > 3) throw new Error('Cadastre no máximo três contatos de confiança.')
  for (const contact of contacts) {
    if (!contact.id.trim() || contact.name.trim().length < 2) throw new Error('Contato sem nome válido.')
    if (!/^\+[1-9]\d{9,14}$/.test(contact.phone)) throw new Error('Informe o telefone no formato internacional.')
  }
}
export function createEmergencyProtocol(input: { userId: string; truckId: string | null; location: GeoPoint | null; now?: Date }): EmergencyProtocol {
  const now = input.now ?? new Date()
  return { id: `sos-${now.getTime()}`, userId: input.userId, truckId: input.truckId, location: input.location, createdAt: now.toISOString(), status: 'active', channels: [] }
}
export function buildEmergencyMessage(protocol: EmergencyProtocol): string {
  const location = protocol.location ? `https://maps.google.com/?q=${protocol.location.latitude},${protocol.location.longitude}` : 'Localização indisponível.'
  return `SOS RotaTrucks ${protocol.id}. Preciso de ajuda. Localização: ${location}. Em rodovia federal, ligue 191.`
}
