import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito'
import { ActivityIndicator, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { tokens } from '@rotatrucks/back/tokens'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { OnboardingModal } from '@/components/OnboardingModal'

export default function RootLayout() {
  const [ready] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  })

  if (!ready) {
    return null
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}

function RootNavigator() {
  const auth = useAuth()

  if (auth.status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.color.fog }}>
        <ActivityIndicator color={tokens.color.brand} />
      </View>
    )
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      {auth.status === 'authenticated' && auth.onboardingOpen ? <OnboardingModal /> : null}
    </>
  )
}
