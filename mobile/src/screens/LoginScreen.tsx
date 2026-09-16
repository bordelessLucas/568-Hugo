import { useState } from 'react'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Input } from '@/components/Input'
import { BrandBand } from '@/components/BrandBand'
import { Icon } from '@/components/Icon'
import { Body, Heading } from '@/components/Typography'
import { useAuth } from '@/contexts/AuthContext'
import { toUserMessage } from '@/lib/auth-errors'

export function LoginScreen() {
  const auth = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetNotice, setResetNotice] = useState('')

  const handleLogin = async () => {
    setError('')
    setResetNotice('')
    setLoading(true)
    try {
      await auth.signIn({ email, password })
      router.replace('/home')
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    setResetNotice('')
    if (!email.trim()) {
      setError('Informe o e-mail para redefinir a senha.')
      return
    }
    try {
      await auth.resetPassword(email)
      setResetNotice('Se o e-mail existir, enviamos o link de redefinição.')
    } catch (caught) {
      setError(toUserMessage(caught))
    }
  }

  return (
    <Container>
      <StatusBar style="light" />
      <BrandBand />
      <View style={styles.stack}>
        <View style={styles.lead}>
          <Icon name="map-outline" size={22} color={tokens.color.brand} />
          <Heading>Entre na rota</Heading>
        </View>
        <Body>Veja se a via passa para o seu caminhão.</Body>
        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@email.com"
          icon="mail"
          keyboard="email"
        />
        <Input
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Sua senha"
          icon="lock"
          secure
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {resetNotice ? <Text style={styles.notice}>{resetNotice}</Text> : null}
        <Button
          label="Entrar"
          loading={loading}
          onPress={() => {
            void handleLogin()
          }}
        />
        <Button
          label="Esqueci minha senha"
          variant="outline"
          block={false}
          onPress={() => {
            void handleForgotPassword()
          }}
        />
        <View style={styles.spacer} />
        <Button label="Criar conta" variant="secondary" onPress={() => router.push('/cadastro')} />
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: tokens.space[4],
    paddingTop: tokens.space[8],
    flexGrow: 1,
  },
  lead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
  },
  spacer: {
    flexGrow: 1,
  },
  error: {
    color: tokens.color.danger,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
  notice: {
    color: tokens.color.pass,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
})
