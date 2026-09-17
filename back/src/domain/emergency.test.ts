import assert from 'node:assert/strict'
import test from 'node:test'
import { assertTrustedContacts, buildEmergencyMessage, createEmergencyProtocol } from './emergency'

test('contatos de confiança são limitados a três', () => {
  const contacts = Array.from({ length: 4 }, (_, index) => ({ id: String(index), name: `Contato ${index}`, phone: '+5547999999999' }))
  assert.throws(() => assertTrustedContacts(contacts), /três/i)
})

test('contato exige telefone internacional válido', () => {
  assert.throws(() => assertTrustedContacts([{ id: '1', name: 'Ana', phone: '123' }]), /telefone/i)
})

test('protocolo registra caminhão localização e horário', () => {
  const protocol = createEmergencyProtocol({ userId: 'u1', truckId: 't1', location: { latitude: -26.63, longitude: -48.68 }, now: new Date('2026-09-17T12:00:00Z') })
  assert.equal(protocol.status, 'active')
  assert.equal(protocol.truckId, 't1')
  assert.match(buildEmergencyMessage(protocol), /maps\.google\.com/)
  assert.match(buildEmergencyMessage(protocol), /191/)
})

test('protocolo funciona sem GPS sem inventar coordenadas', () => {
  const protocol = createEmergencyProtocol({ userId: 'u1', truckId: null, location: null, now: new Date() })
  assert.match(buildEmergencyMessage(protocol), /localização indisponível/i)
})
