import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_SETTINGS,
  readSettings,
  writeSettings,
  type AppSettings,
  type PlanModel,
  type ThemeMode,
} from '@/lib/settings'

interface SettingsContextValue extends AppSettings {
  ready: boolean
  setTheme: (theme: ThemeMode) => void
  setPlan: (plan: PlanModel) => void
  setNotifications: (enabled: boolean) => void
  setSounds: (enabled: boolean) => void
  setShareLocation: (enabled: boolean) => void
  setSignReports: (enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void readSettings().then((initial) => {
      setSettings(initial)
      setReady(true)
    })
  }, [])

  const update = (next: AppSettings) => {
    setSettings(next)
    void writeSettings(next)
  }

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      ready,
      setTheme: (theme) => update({ ...settings, theme }),
      setPlan: (plan) => update({ ...settings, plan }),
      setNotifications: (notifications) => update({ ...settings, notifications }),
      setSounds: (sounds) => update({ ...settings, sounds }),
      setShareLocation: (shareLocation) => update({ ...settings, shareLocation }),
      setSignReports: (signReports) => update({ ...settings, signReports }),
    }),
    [ready, settings],
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
