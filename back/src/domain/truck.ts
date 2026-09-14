export const TRUCK_TYPES = [
  'toco',
  'truck',
  'carreta_2_eixos',
  'bitruck',
  'bitrem',
] as const

export type TruckType = (typeof TRUCK_TYPES)[number]

const TRUCK_TYPE_SET: ReadonlySet<string> = new Set(TRUCK_TYPES)

export function isTruckType(value: string): value is TruckType {
  return TRUCK_TYPE_SET.has(value)
}

export interface TruckDimensions {
  heightMeters: number
  widthMeters: number
  lengthMeters: number
  totalWeightKg: number
}

export const TRUCK_AXLE_PROFILE: Record<TruckType, { axleCount: number; trailerCount: number }> = {
  toco: { axleCount: 2, trailerCount: 0 },
  truck: { axleCount: 3, trailerCount: 0 },
  carreta_2_eixos: { axleCount: 5, trailerCount: 1 },
  bitruck: { axleCount: 4, trailerCount: 0 },
  bitrem: { axleCount: 7, trailerCount: 2 },
}

export const TRUCK_TYPE_OPTIONS: Record<TruckType, { label: string; hint: string }> = {
  toco: { label: 'Toco', hint: 'Rígido, dois eixos' },
  truck: { label: 'Truck', hint: 'Rígido, três eixos' },
  carreta_2_eixos: { label: 'Carreta 2 eixos', hint: 'Cavalo e semirreboque' },
  bitruck: { label: 'Bitruck', hint: 'Rígido, quatro eixos' },
  bitrem: { label: 'Bitrem', hint: 'Duas composições' },
}

export const NATIONAL_DIMENSION_LIMITS = {
  heightMeters: 4.4,
  widthMeters: 2.6,
  lengthMeters: 19.8,
} as const

const DIMENSION_CAPS = {
  heightMeters: 8,
  widthMeters: 5,
  lengthMeters: 30,
  totalWeightKg: 200_000,
} as const

export function dimensionWarnings(dimensions: TruckDimensions): string[] {
  const notes: string[] = []
  if (dimensions.heightMeters > NATIONAL_DIMENSION_LIMITS.heightMeters) {
    notes.push('Altura acima de 4,40 m, o limite nacional citado.')
  }
  if (dimensions.widthMeters > NATIONAL_DIMENSION_LIMITS.widthMeters) {
    notes.push('Largura acima de 2,60 m, o limite nacional citado.')
  }
  if (dimensions.lengthMeters > NATIONAL_DIMENSION_LIMITS.lengthMeters) {
    notes.push('Comprimento acima de 19,80 m, o limite nacional citado.')
  }
  return notes
}

export function assertTruckDraft(truck: Omit<Truck, 'id'>): void {
  if (truck.userId.trim() === '') {
    throw new Error('Caminhão sem usuário.')
  }
  if (!isTruckType(truck.type)) {
    throw new Error('Escolha o tipo de caminhão.')
  }
  assertMeasure('altura', truck.heightMeters, DIMENSION_CAPS.heightMeters)
  assertMeasure('largura', truck.widthMeters, DIMENSION_CAPS.widthMeters)
  assertMeasure('comprimento', truck.lengthMeters, DIMENSION_CAPS.lengthMeters)
  assertMeasure('peso', truck.totalWeightKg, DIMENSION_CAPS.totalWeightKg)
}

function assertMeasure(label: string, value: number, max: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Informe ' + label + ' maior que zero.')
  }
  if (value > max) {
    throw new Error('O valor de ' + label + ' está fora do intervalo aceito.')
  }
}

export interface Truck extends TruckDimensions {
  id: string
  userId: string
  type: TruckType
}

export type NewTruck = Omit<Truck, 'id'>
