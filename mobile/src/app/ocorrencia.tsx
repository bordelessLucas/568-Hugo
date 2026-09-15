import { Redirect } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { ReportScreen } from '@/screens/ReportScreen'

export default function OcorrenciaRoute() {
  const auth = useAuth()
  if (auth.status === 'anonymous') {
    return <Redirect href="/login" />
  }
  return <ReportScreen />
}
