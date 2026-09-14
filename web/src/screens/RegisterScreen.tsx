import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout.tsx'
import { Button } from '../components/Button.tsx'
import { Input } from '../components/Input.tsx'
import { Body, Heading } from '../components/Typography.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { toUserMessage } from '../lib/auth-errors.ts'

export function RegisterScreen() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setFormError('')
    setConfirmError('')
    if (password !== confirmPassword) {
      setConfirmError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    try {
      await auth.register({ name, email, password })
    } catch (caught) {
      setFormError(toUserMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Heading>Criar conta</Heading>
          <Body>Nome, e-mail e senha. O caminhão entra na etapa seguinte.</Body>
        </div>

        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            void handleRegister()
          }}
        >
          <Input
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            icon="user"
          />
          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            icon="mail"
            type="email"
            error={formError}
          />
          <div className="grid gap-5 sm:grid-cols-2">
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
              error={confirmError}
            />
          </div>
          <Button label="Criar conta" loading={loading} onPress={() => void handleRegister()} />
        </form>

        <p className="flex flex-wrap items-center gap-2 font-body text-sm text-muted">
          Já tem conta?
          <Button
            label="Entrar"
            variant="outline"
            block={false}
            quiet
            onPress={handleBackToLogin}
          />
        </p>
      </div>
    </AuthLayout>
  )
}
