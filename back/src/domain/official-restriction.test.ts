import assert from 'node:assert/strict'
import test from 'node:test'
import type { Truck } from './truck'
import {
  assertOfficialRestriction,
  evaluateOfficialRestriction,
  type OfficialRestriction,
} from './official-restriction'

const truck: Truck = {
  id: 'truck-1', userId: 'user-1', type: 'truck',
  heightMeters: 4.5, widthMeters: 2.5, lengthMeters: 12, totalWeightKg: 20_000,
}

function restriction(overrides: Partial<OfficialRestriction> = {}): OfficialRestriction {
  return {
    id: 'restriction-1', title: 'Ponte baixa', description: 'Limite demonstrativo',
    latitude: -26.63, longitude: -48.68, sourceStatus: 'demo',
    timezone: 'America/Sao_Paulo', limits: { maxHeightMeters: 4.4 },
    affectedTruckTypes: [], effect: 'blocked', ...overrides,
  }
}

test('restrição bloqueia caminhão acima da altura máxima', () => {
  const result = evaluateOfficialRestriction(restriction(), truck, new Date('2026-09-17T15:00:00-03:00'))
  assert.equal(result.status, 'blocked')
  assert.match(result.reasons.join(' '), /altura/i)
})

test('restrição não se aplica quando as dimensões estão dentro do limite', () => {
  const result = evaluateOfficialRestriction(restriction({ limits: { maxWeightKg: 25_000 } }), truck, new Date())
  assert.equal(result.status, 'not_applicable')
})

test('restrição por tipo usa o efeito configurado', () => {
  const result = evaluateOfficialRestriction(
    restriction({ limits: {}, affectedTruckTypes: ['truck'], effect: 'warning' }), truck, new Date(),
  )
  assert.equal(result.status, 'warning')
  assert.match(result.reasons.join(' '), /tipo/i)
})

test('janela que cruza meia-noite permanece ativa', () => {
  const result = evaluateOfficialRestriction(
    restriction({ timeWindows: [{ start: '22:00', end: '05:00' }] }),
    truck,
    new Date('2026-09-17T23:30:00-03:00'),
  )
  assert.equal(result.status, 'blocked')
})

test('restrição verificada exige URL HTTPS e data', () => {
  assert.throws(() => assertOfficialRestriction(restriction({ sourceStatus: 'verified' })), /fonte/i)
})

test('restrição exige limite ou tipo de caminhão', () => {
  assert.throws(() => assertOfficialRestriction(restriction({ limits: {}, affectedTruckTypes: [] })), /critério/i)
})
