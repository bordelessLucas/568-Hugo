import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.tsx'
import { OnboardingModal } from './components/OnboardingModal.tsx'
import { HomeScreen } from './screens/HomeScreen.tsx'
import { LoginScreen } from './screens/LoginScreen.tsx'
import { ProfileScreen } from './screens/ProfileScreen.tsx'
import { RegisterScreen } from './screens/RegisterScreen.tsx'
import { SettingsScreen } from './screens/SettingsScreen.tsx'

function SetupOverlay() {
  const { status, onboardingOpen } = useAuth()
  if (status !== 'authenticated' || !onboardingOpen) return null
  return <OnboardingModal />
}

function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  if (status === 'loading') {
    return (
      <p className="grid min-h-dvh place-items-center font-body text-base text-muted">Conectando…</p>
    )
  }
  return children
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  if (status === 'anonymous') {
    return <Navigate to="/login" replace />
  }
  return children
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  if (status === 'authenticated') {
    return <Navigate to="/home" replace />
  }
  return children
}

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginScreen />
            </GuestOnly>
          }
        />
        <Route
          path="/cadastro"
          element={
            <GuestOnly>
              <RegisterScreen />
            </GuestOnly>
          }
        />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <Navigate to="/home" replace />
            </RequireAuth>
          }
        />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomeScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <RequireAuth>
              <SettingsScreen />
            </RequireAuth>
          }
        />
        <Route
          path="/perfil"
          element={
            <RequireAuth>
              <ProfileScreen />
            </RequireAuth>
          }
        />
      </Routes>
      <SetupOverlay />
    </AuthGate>
  )
}
