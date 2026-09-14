export const GENDERS = ['homem', 'mulher', 'nao_informado'] as const

export type Gender = (typeof GENDERS)[number]

const GENDER_SET: ReadonlySet<string> = new Set(GENDERS)

export function isGender(value: string): value is Gender {
  return GENDER_SET.has(value)
}

export const GENDER_LABELS: Record<Gender, string> = {
  homem: 'Homem',
  mulher: 'Mulher',
  nao_informado: 'Prefiro não informar',
}

export interface UserProfile {
  id: string
  name: string
  email: string
  createdAt: string
  gender: Gender | null
  onboardingDismissed: boolean
  activeTruckId: string | null
}

export interface RegisterUserInput {
  name: string
  email: string
  password: string
}

export interface SignInInput {
  email: string
  password: string
}
