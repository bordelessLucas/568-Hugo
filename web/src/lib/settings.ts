export type ThemeMode = 'light' | 'dark'
export type PlanModel = 'gratuito' | 'premium' | 'frotas'

export interface AppSettings {
  theme: ThemeMode
  plan: PlanModel
  notifications: boolean
  sounds: boolean
  shareLocation: boolean
  signReports: boolean
  womenSafeMode: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  plan: 'gratuito',
  notifications: false,
  sounds: true,
  shareLocation: true,
  signReports: true,
  womenSafeMode: false,
}

const KEY = 'rotatrucks-settings'

export function readSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SETTINGS
    const record = parsed as Record<string, unknown>
    return {
      theme: record.theme === 'dark' ? 'dark' : 'light',
      plan: record.plan === 'premium' || record.plan === 'frotas' ? record.plan : 'gratuito',
      notifications: record.notifications === true,
      sounds: record.sounds !== false,
      shareLocation: record.shareLocation !== false,
      signReports: record.signReports !== false,
      womenSafeMode: record.womenSafeMode === true,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function writeSettings(settings: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings))
}

export function applyTheme(theme: ThemeMode): void {
  document.documentElement.dataset.theme = theme
}
