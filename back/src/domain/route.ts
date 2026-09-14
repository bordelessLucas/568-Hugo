import { TRUCK_AXLE_PROFILE, type TruckDimensions, type TruckType } from './truck'

export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface RouteQuery {
  origin: GeoPoint
  destination: GeoPoint
}

export interface CompatibleRoute {
  status: 'compatible'
  distanceMeters: number
  durationSeconds: number
  path: GeoPoint[]
}

export interface BlockedRoute {
  status: 'blocked'
  message: string
}

export interface UnavailableRoute {
  status: 'unavailable'
  message: string
}

export type RouteResult = CompatibleRoute | BlockedRoute | UnavailableRoute

export const ROUTE_UNAVAILABLE_MESSAGE =
  'A rota do caminhão entra quando a função e a chave da HERE estiverem ligadas.'

export const ROUTE_BLOCKED_MESSAGE = 'Não há rota compatível com este caminhão.'

export interface HereVehicleParams {
  heightCm: number
  widthCm: number
  lengthCm: number
  grossWeightKg: number
  currentWeightKg: number
  axleCount: number
  trailerCount: number
}

export function toHereVehicle(
  truck: TruckDimensions & { type: TruckType },
): HereVehicleParams {
  const axle = TRUCK_AXLE_PROFILE[truck.type]
  return {
    heightCm: metersToCm(truck.heightMeters),
    widthCm: metersToCm(truck.widthMeters),
    lengthCm: metersToCm(truck.lengthMeters),
    grossWeightKg: Math.round(truck.totalWeightKg),
    currentWeightKg: Math.round(truck.totalWeightKg),
    axleCount: axle.axleCount,
    trailerCount: axle.trailerCount,
  }
}

export function buildHereRouteSearchParams(input: {
  origin: GeoPoint
  destination: GeoPoint
  truck: TruckDimensions & { type: TruckType }
  departureTime: Date
}): URLSearchParams {
  const vehicle = toHereVehicle(input.truck)
  const params = new URLSearchParams()
  params.set('transportMode', 'truck')
  params.set('routingMode', 'fast')
  params.set('origin', formatPoint(input.origin))
  params.set('destination', formatPoint(input.destination))
  params.set('return', 'polyline,summary')
  params.set('spans', 'notices')
  params.set('lang', 'pt-BR')
  params.set('departureTime', input.departureTime.toISOString())
  params.set('vehicle[height]', String(vehicle.heightCm))
  params.set('vehicle[width]', String(vehicle.widthCm))
  params.set('vehicle[length]', String(vehicle.lengthCm))
  params.set('vehicle[grossWeight]', String(vehicle.grossWeightKg))
  params.set('vehicle[currentWeight]', String(vehicle.currentWeightKg))
  params.set('vehicle[axleCount]', String(vehicle.axleCount))
  if (vehicle.trailerCount > 0) {
    params.set('vehicle[trailerCount]', String(vehicle.trailerCount))
  }
  params.set('avoid[features]', 'uTurns,dirtRoad')
  return params
}

function metersToCm(meters: number): number {
  return Math.round(meters * 100)
}

function formatPoint(point: GeoPoint): string {
  return point.latitude + ',' + point.longitude
}
