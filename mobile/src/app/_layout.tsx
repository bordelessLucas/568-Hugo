import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito'
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
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
    return <SplashScreen />
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
    return <SplashScreen />
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      {auth.status === 'authenticated' && auth.onboardingOpen ? <OnboardingModal /> : null}
    </>
  )
}

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        accessibilityLabel="RotaTruck"
      />
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>RotaTruck</Text>
        <Text style={styles.tagline}>Carregando sua rota segura</Text>
      </View>
      <ActivityIndicator color={tokens.color.accent} />
    </View>
  )
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space[5],
    padding: tokens.space[6],
    backgroundColor: tokens.color.brand,
  },
  logo: {
    width: 132,
    height: 132,
  },
  brandBlock: {
    alignItems: 'center',
    gap: tokens.space[2],
  },
  brand: {
    color: tokens.color.onBrand,
    fontFamily: tokens.font.sign,
    fontSize: tokens.size.title,
  },
  tagline: {
    color: tokens.color.onBrandMuted,
    fontFamily: tokens.font.bodyMedium,
    fontSize: tokens.size.body,
  },
})
