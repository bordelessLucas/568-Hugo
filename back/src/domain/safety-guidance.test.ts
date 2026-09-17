import assert from 'node:assert/strict'
import test from 'node:test'
import { pickSafetyGuidance, SAFETY_COMMAND_LABELS, type SafetyGuidanceCandidate } from './safety-guidance'

const candidate = (id: string, command: SafetyGuidanceCandidate['command'], distanceMeters: number): SafetyGuidanceCandidate => ({ id, command, distanceMeters, title: id, reason: 'Motivo' })

test('orientação escolhe bloqueio antes de risco e parada', () => {
  const result = pickSafetyGuidance([candidate('safe', 'SAFE_STOP', 100), candidate('risk', 'RISK_AHEAD', 200), candidate('stop', 'STOP', 800)])
  assert.equal(result?.id, 'stop')
})

test('orientação desempata pela menor distância', () => {
  assert.equal(pickSafetyGuidance([candidate('far', 'SLOW_DOWN', 900), candidate('near', 'SLOW_DOWN', 200)])?.id, 'near')
})

test('comandos usam texto operacional curto', () => {
  assert.equal(SAFETY_COMMAND_LABELS.STOP, 'NÃO PASSA - DESVIE')
  assert.equal(SAFETY_COMMAND_LABELS.SAFE_STOP, 'PARADA SEGURA PRÓXIMA')
})
