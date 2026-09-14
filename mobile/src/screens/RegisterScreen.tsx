import { useState } from 'react'
import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Input } from '@/components/Input'
import { Body, Heading } from '@/components/Typography'
import { BrandBand } from '@/components/BrandBand'

export function RegisterScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRegister = () => {}
  const handleBackToLogin = () => {
    router.replace('/login')
  }

  return (
    <Container>
      <BrandBand />
      <View style={styles.stack}>
        <Heading>Criar conta</Heading>
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
        <Button label="Criar conta" onPress={handleRegister} />
        <Button label="Já tenho conta" variant="outline" onPress={handleBackToLogin} />
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: tokens.space[4],
    paddingTop: tokens.space[8],
  },
})
