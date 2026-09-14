import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createTruck,
  getUserProfile,
  saveUserProfile,
  listTrucksByUser,
  observeAuthSession,
  registerUser,
  sendPasswordReset,
  signIn,
  signOutUser,
  updateUserSetup,
  type AuthSession,
  type Gender,
  type NewTruck,
  type Truck,
  type UserProfile,
} from '@rotatrucks/back'
import type { RegisterUserInput, SignInInput } from '@rotatrucks/back'
import { connectBackend } from '../lib/backend.ts'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  status: AuthStatus
  session: AuthSession | null
  profile: UserProfile | null
  trucks: Truck[]
  truck: Truck | null
  truckPending: boolean
  needsOnboarding: boolean
  onboardingOpen: boolean
  openOnboarding: () => void
  signIn: (input: SignInInput) => Promise<void>
  register: (input: RegisterUserInput) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
  completeOnboarding: (input: { gender: Gender; truck: NewTruck }) => Promise<void>
  dismissOnboarding: (gender: Gender | null) => Promise<void>
  addTruck: (truck: NewTruck) => Promise<void>
  selectTruck: (truckId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function rememberActiveTruck(userId: string, truckId: string): Promise<void> {
  try {
    await updateUserSetup(userId, { activeTruckId: truckId })
  } catch {
    return
  }
}

function pickActive(trucks: Truck[], activeId: string | null): Truck | null {
  if (trucks.length === 0) return null
  return trucks.find((item) => item.id === activeId) ?? trucks[0] ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [truck, setTruck] = useState<Truck | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [dismissedLocal, setDismissedLocal] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  useEffect(() => {
    connectBackend()
    let active = true
    const unsubscribe = observeAuthSession((next) => {
      if (!next) {
        if (active) {
          setSession(null)
          setProfile(null)
          setTrucks([])
          setTruck(null)
          setDismissedLocal(false)
          setOnboardingOpen(false)
          setStatus('anonymous')
        }
        return
      }
      void Promise.all([getUserProfile(next.uid), listTrucksByUser(next.uid)])
        .then(([loadedProfile, loadedTrucks]) => {
          if (!active) return
          setSession({
            ...next,
            displayName: loadedProfile?.name ?? next.displayName,
          })
          setProfile(loadedProfile)
          setTrucks(loadedTrucks)
          setTruck(pickActive(loadedTrucks, loadedProfile?.activeTruckId ?? null))
          setStatus('authenticated')
        })
        .catch(() => {
          if (!active) return
          setSession(next)
          setProfile(null)
          setTrucks([])
          setTruck(null)
          setStatus('authenticated')
        })
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const truckPending = status === 'authenticated' && trucks.length === 0
  const needsOnboarding =
    truckPending && !dismissedLocal && profile?.onboardingDismissed !== true

  useEffect(() => {
    if (status !== 'authenticated' || trucks.length > 0) {
      setOnboardingOpen(false)
      return
    }
    if (!needsOnboarding) return
    setOnboardingOpen(true)
  }, [needsOnboarding, status, trucks.length])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      profile,
      trucks,
      truck,
      truckPending,
      needsOnboarding,
      onboardingOpen,
      openOnboarding: () => {
        if (trucks.length > 0) return
        setOnboardingOpen(true)
      },
      signIn: async (input) => {
        await signIn(input)
      },
      register: async (input) => {
        await registerUser(input)
      },
      resetPassword: (email) => sendPasswordReset(email),
      signOut: () => signOutUser(),
      completeOnboarding: async (input) => {
        if (!session) throw new Error('Entre na conta para salvar o caminhão.')
        if (!profile) {
          await saveUserProfile({
            id: session.uid,
            name: session.displayName?.trim() || 'Motorista',
            email: (session.email ?? '').trim().toLowerCase(),
            createdAt: new Date().toISOString(),
          })
        }
        const saved = await createTruck({ ...input.truck, userId: session.uid })
        await updateUserSetup(session.uid, {
          gender: input.gender,
          onboardingDismissed: false,
          activeTruckId: saved.id,
        })
        setProfile((current) =>
          current
            ? {
                ...current,
                gender: input.gender,
                onboardingDismissed: false,
                activeTruckId: saved.id,
              }
            : current,
        )
        setTrucks((current) => [...current, saved])
        setTruck(saved)
      },
      dismissOnboarding: async (gender) => {
        setDismissedLocal(true)
        setOnboardingOpen(false)
        if (!session) return
        try {
          await updateUserSetup(session.uid, {
            ...(gender ? { gender } : {}),
            onboardingDismissed: true,
          })
          setProfile((current) =>
            current
              ? {
                  ...current,
                  gender: gender ?? current.gender,
                  onboardingDismissed: true,
                }
              : current,
          )
        } catch {
          return
        }
      },
      addTruck: async (draft) => {
        if (!session) throw new Error('Entre na conta para salvar o caminhão.')
        const saved = await createTruck(draft)
        await rememberActiveTruck(session.uid, saved.id)
        setProfile((current) => (current ? { ...current, activeTruckId: saved.id } : current))
        setTrucks((current) => [...current, saved])
        setTruck(saved)
      },
      selectTruck: async (truckId) => {
        if (!session) throw new Error('Entre na conta para escolher o caminhão.')
        const chosen = trucks.find((item) => item.id === truckId)
        if (!chosen) throw new Error('Caminhão não encontrado.')
        await rememberActiveTruck(session.uid, truckId)
        setProfile((current) => (current ? { ...current, activeTruckId: truckId } : current))
        setTruck(chosen)
      },
    }),
    [needsOnboarding, onboardingOpen, profile, session, status, truck, truckPending, trucks],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth precisa estar dentro de AuthProvider.')
  }
  return value
}
