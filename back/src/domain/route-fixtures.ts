import type { CompatibleRoute, GeoPoint, RouteResult } from './route'

/** Polyline curta ao redor de Barra Velha / SC para testar UI e avisos sem chave HERE. */
export const FIXTURE_BARRA_VELHA_PATH: GeoPoint[] = [
  { latitude: -26.64, longitude: -48.71 },
  { latitude: -26.637, longitude: -48.702 },
  { latitude: -26.6355, longitude: -48.6902 },
  { latitude: -26.6332, longitude: -48.687 },
  { latitude: -26.632, longitude: -48.6849 },
  { latitude: -26.628, longitude: -48.678 },
]

export const FIXTURE_COMPATIBLE_ROUTE: CompatibleRoute = {
  status: 'compatible',
  distanceMeters: 4200,
  durationSeconds: 480,
  path: FIXTURE_BARRA_VELHA_PATH,
}

export const FIXTURE_BLOCKED_ROUTE: RouteResult = {
  status: 'blocked',
  message: 'Não há rota compatível com este caminhão.',
}

export const FIXTURE_UNAVAILABLE_ROUTE: RouteResult = {
  status: 'unavailable',
  message: 'A rota do caminhão entra quando a função e a chave da HERE estiverem ligadas.',
}

/** Corpo mínimo blocked (Router v8) — parseável offline sem polyline. */
export const FIXTURE_HERE_BLOCKED_BODY = {
  routes: [],
  notices: [
    {
      code: 'violatedVehicleRestriction',
      title: 'Vehicle restriction',
      severity: 'critical',
    },
  ],
}

/** Estrutura de sucesso (polyline real vem da API; use FIXTURE_COMPATIBLE_ROUTE no app). */
export const FIXTURE_HERE_OK_BODY = {
  routes: [
    {
      sections: [
        {
          summary: { length: 4200, duration: 480 },
          notices: [],
        },
      ],
    },
  ],
  notices: [],
}

