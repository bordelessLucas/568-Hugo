import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  applyTheme,
  readSettings,
  writeSettings,
  type AppSettings,
  type PlanModel,
  type ThemeMode,
} from '../lib/settings.ts'

interface SettingsContextValue extends AppSettings {
  setTheme: (theme: ThemeMode) => void
  setPlan: (plan: PlanModel) => void
  setNotifications: (enabled: boolean) => Promise<string>
  setSounds: (enabled: boolean) => void
  setShareLocation: (enabled: boolean) => void
  setSignReports: (enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const initial = readSettings()
    applyTheme(initial.theme)
    return initial
  })

  const update = (next: AppSettings) => {
    setSettings(next)
    writeSettings(next)
    applyTheme(next.theme)
  }

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      setTheme: (theme) => update({ ...settings, theme }),
      setPlan: (plan) => update({ ...settings, plan }),
      setNotifications: async (enabled) => {
        if (!enabled) {
          update({ ...settings, notifications: false })
          return ''
        }
        if (!('Notification' in window)) {
          return 'Este navegador não mostra notificações.'
        }
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          update({ ...settings, notifications: false })
          return 'O navegador bloqueou as notificações.'
        }
        update({ ...settings, notifications: true })
        return ''
      },
      setSounds: (sounds) => update({ ...settings, sounds }),
      setShareLocation: (shareLocation) => update({ ...settings, shareLocation }),
      setSignReports: (signReports) => update({ ...settings, signReports }),
    }),
    [settings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext)
  if (!value) {
    throw new Error('useSettings precisa estar dentro de SettingsProvider.')
  }
  return value
}
