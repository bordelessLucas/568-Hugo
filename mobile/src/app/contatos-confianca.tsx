import { Redirect } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { TrustedContactsScreen } from '@/screens/TrustedContactsScreen'

export default function TrustedContactsRoute() {
  const auth = useAuth()
  if (auth.status === 'anonymous') return <Redirect href="/login" />
  return <TrustedContactsScreen />
}
