import assert from 'node:assert/strict'
import test from 'node:test'
import { assertSafePlace, filterSafePlaces, hasWomenFriendlySeal, rankSafePlaces, sortSafePlacesByDistance, type SafePlace } from './safe-place'

function place(overrides: Partial<SafePlace> = {}): SafePlace {
  return {
    id: 'place-1', name: 'Parada teste', category: 'truck_stop', latitude: -26.63,
    longitude: -48.68, services: ['truck_parking'], audience: 'all', origin: 'demo',
    ratingAverage: 0, ratingCount: 0, ...overrides,
  }
}

test('ponto amigo exige origem curada, verificação e serviços mínimos', () => {
  assert.equal(hasWomenFriendlySeal(place({
    origin: 'curated', audience: 'women_recommended', verifiedAt: '2026-09-17T12:00:00Z',
    services: ['restroom', 'shower', 'lighting', 'security'],
  })), true)
  assert.equal(hasWomenFriendlySeal(place({ audience: 'women_recommended', services: ['restroom', 'shower', 'lighting', 'security'] })), false)
})

test('pontos são ordenados por distância quando existe origem', () => {
  const far = place({ id: 'far', latitude: -27 })
  const near = place({ id: 'near', latitude: -26.631 })
  assert.deepEqual(sortSafePlacesByDistance([far, near], { latitude: -26.63, longitude: -48.68 }).map((item) => item.id), ['near', 'far'])
})

test('ordem é preservada sem localização', () => {
  assert.deepEqual(sortSafePlacesByDistance([place({ id: 'b' }), place({ id: 'a' })], null).map((item) => item.id), ['b', 'a'])
})

test('ponto curado exige data e avaliação válida', () => {
  assert.throws(() => assertSafePlace(place({ origin: 'curated' })), /verificação/i)
  assert.throws(() => assertSafePlace(place({ ratingAverage: 6 })), /avaliação/i)
  assert.throws(() => assertSafePlace(place({ ratingCount: -1 })), /avaliação/i)
})

test('filtra pontos por busca, serviço e recomendação feminina', () => {
  const places = [
    place({ id: 'a', name: 'Parada Horizonte', services: ['truck_parking', 'shower'] }),
    place({ id: 'b', name: 'Posto Aurora', services: ['truck_parking', 'security'], audience: 'women_recommended' }),
  ]
  assert.deepEqual(filterSafePlaces(places, { query: 'aurora', services: [], womenRecommended: false }).map((item) => item.id), ['b'])
  assert.deepEqual(filterSafePlaces(places, { query: '', services: ['shower'], womenRecommended: false }).map((item) => item.id), ['a'])
  assert.deepEqual(filterSafePlaces(places, { query: '', services: [], womenRecommended: true }).map((item) => item.id), ['b'])
})

test('ordena pontos por nota e estrutura', () => {
  const simple = place({ id: 'simple', ratingAverage: 4.9, services: ['truck_parking'] })
  const complete = place({ id: 'complete', ratingAverage: 4.2, services: ['truck_parking', 'security', 'shower'] })
  assert.deepEqual(rankSafePlaces([complete, simple], null, 'rating').map((item) => item.id), ['simple', 'complete'])
  assert.deepEqual(rankSafePlaces([simple, complete], null, 'structure').map((item) => item.id), ['complete', 'simple'])
})
