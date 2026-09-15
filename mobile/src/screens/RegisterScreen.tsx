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

export function RegisterScreen() {
  const auth = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setError('')
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    try {
      await auth.register({ name, email, password })
      router.replace('/home')
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <StatusBar style="light" />
      <BrandBand />
      <View style={styles.stack}>
        <View style={styles.lead}>
          <Icon name="person-add-outline" size={22} color={tokens.color.brand} />
          <Heading>Criar conta</Heading>
        </View>
        <Body>Nome, e-mail e senha. O caminhão entra na etapa seguinte.</Body>
        <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" icon="user" />
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
          placeholder="Mínimo de 6 caracteres"
          icon="lock"
          secure
        />
        <Input
          label="Confirmar senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repita a senha"
          icon="lock"
          secure
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label="Criar conta"
          loading={loading}
          onPress={() => {
            void handleRegister()
          }}
        />
        <Button label="Já tenho conta" variant="outline" onPress={() => router.replace('/login')} />
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: tokens.space[4],
    paddingTop: tokens.space[8],
  },
  lead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[3],
  },
  error: {
    color: tokens.color.danger,
    fontFamily: tokens.font.body,
    fontSize: tokens.size.caption,
  },
})
