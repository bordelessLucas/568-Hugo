import { useState } from 'react'
import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Input } from '@/components/Input'
import { Body, Heading } from '@/components/Typography'
import { BrandBand } from '@/components/BrandBand'

export function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    router.push('/home')
  }
  const handleForgotPassword = () => {}
  const handleCreateAccount = () => {
    router.push('/cadastro')
  }

  return (
    <Container>
      <BrandBand />
      <View style={styles.stack}>
        <Heading>Entre na rota</Heading>
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
        <Button label="Entrar" onPress={handleLogin} />
        <Button
          label="Esqueci minha senha"
          variant="outline"
          block={false}
          onPress={handleForgotPassword}
        />
        <View style={styles.spacer} />
        <Button label="Criar conta" variant="secondary" onPress={handleCreateAccount} />
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
  spacer: {
    flexGrow: 1,
  },
})
