import { Redirect } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { LoginScreen } from '@/screens/LoginScreen'

export default function LoginRoute() {
  const auth = useAuth()
  if (auth.status === 'authenticated') {
    return <Redirect href="/home" />
  }
  return <LoginScreen />
}
