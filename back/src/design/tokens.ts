export const tokens = {
  color: {
    brand: '#0073B8',
    accent: '#FF9C1A',
    accentInk: '#1F1404',
    fog: '#F2F8FC',
    surface: '#FFFFFF',
    ink: '#073049',
    muted: '#4E6A7C',
    line: '#C9DDE8',
    onBrand: '#FFFFFF',
    onBrandMuted: '#D7ECF7',
    danger: '#C5362B',
    pass: '#1B7A45',
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    12: 48,
  },
  radius: {
    field: 12,
    button: 14,
  },
  size: {
    control: 52,
    caption: 13,
    body: 16,
    label: 14,
    title: 36,
  },
  font: {
    sign: 'Nunito_800ExtraBold',
    body: 'Nunito_400Regular',
    bodyMedium: 'Nunito_600SemiBold',
    label: 'Nunito_700Bold',
  },
} as const

export type Tokens = typeof tokens
