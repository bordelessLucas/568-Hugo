import assert from 'node:assert/strict'
import test from 'node:test'
import { DEMO_OFFICIAL_RESTRICTIONS, DEMO_SAFE_PLACES } from './safety-fixtures'
import { buildRestrictionMark, buildSafePlaceMark, formatSafePlaceServices } from './safety-map'

test('mapa identifica fonte demonstrativa', () => {
  const mark = buildRestrictionMark(DEMO_OFFICIAL_RESTRICTIONS[0]!, null, new Date())
  assert.equal(mark.sourceLabel, 'Demonstração')
  assert.equal(mark.tone, 'neutral')
})

test('ponto seguro usa tom seguro e serviços em português', () => {
  const mark = buildSafePlaceMark(DEMO_SAFE_PLACES[0]!)
  assert.equal(mark.tone, 'safe')
  assert.match(formatSafePlaceServices(DEMO_SAFE_PLACES[0]!), /Estacionamento/)
})
