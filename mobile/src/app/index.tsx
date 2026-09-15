import { Redirect } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'

export default function Index() {
  const auth = useAuth()
  if (auth.status === 'authenticated') {
    return <Redirect href="/home" />
  }
  return <Redirect href="/login" />
}
