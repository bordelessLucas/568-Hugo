import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assertReportDraft,
  formatReportLabel,
  normalizeReportCategory,
  type NewReport,
} from './report'
import { PILOT_MARKS } from './community'

function report(overrides: Partial<NewReport> = {}): NewReport {
  return {
    authorId: 'user-1',
    truckType: 'truck',
    category: 'route_condition',
    status: 'passa',
    notes: '',
    latitude: -26.63,
    longitude: -48.68,
    urgency: 'normal',
    ...overrides,
  }
}

test('normaliza categoria ausente ou desconhecida como condição da via', () => {
  assert.equal(normalizeReportCategory(undefined), 'route_condition')
  assert.equal(normalizeReportCategory('unknown'), 'route_condition')
})

test('formata rótulos simples para feed e alertas', () => {
  assert.equal(formatReportLabel('accident', 'nao_passa'), 'Acidente: não passa')
  assert.equal(formatReportLabel('road_block', 'passa'), 'Bloqueio: passa com atenção')
})

test('exige descrição nas categorias de segurança', () => {
  assert.throws(
    () => assertReportDraft(report({ category: 'accident', notes: 'curta' })),
    /pelo menos 8 caracteres/,
  )
})

test('permite condição da via sem descrição', () => {
  assert.doesNotThrow(() => assertReportDraft(report()))
})

test('exige descrição em urgência extrema', () => {
  assert.throws(
    () => assertReportDraft(report({ urgency: 'extreme', notes: '' })),
    /pelo menos 8 caracteres/,
  )
})

test('mantém apenas seeds demonstrativos sem alegações oficiais incorretas', () => {
  assert.ok(
    !PILOT_MARKS.some((mark) => /SC-401|4,5 m|DNIT/.test(mark.label + mark.notes + mark.source)),
  )
  assert.ok(PILOT_MARKS.every((mark) => mark.category))
})
