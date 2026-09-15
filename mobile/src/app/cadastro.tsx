import { Redirect } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { RegisterScreen } from '@/screens/RegisterScreen'

export default function CadastroRoute() {
  const auth = useAuth()
  if (auth.status === 'authenticated') {
    return <Redirect href="/home" />
  }
  return <RegisterScreen />
}
