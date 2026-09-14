import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout.tsx'
import { Button } from '../components/Button.tsx'
import { Input } from '../components/Input.tsx'
import { Body, Heading } from '../components/Typography.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import { toUserMessage } from '../lib/auth-errors.ts'

export function LoginScreen() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setNotice('')
    setLoading(true)
    try {
      await auth.signIn({ email, password })
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    setNotice('')
    if (email.trim() === '') {
      setError('Informe o e-mail para recuperar a senha.')
      return
    }
    setLoading(true)
    try {
      await auth.resetPassword(email)
      setNotice('Enviamos um link para o seu e-mail.')
    } catch (caught) {
      setError(toUserMessage(caught))
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = () => {
    navigate('/cadastro')
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Heading>Entrar</Heading>
          <Body>Use o e-mail da sua conta para ver as rotas do seu caminhão.</Body>
        </div>

        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            void handleLogin()
          }}
        >
          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            icon="mail"
            type="email"
            error={error}
          />
          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            icon="lock"
            secure
          />
          <div className="flex justify-end">
            <Button
              label="Esqueci minha senha"
              variant="outline"
              block={false}
              quiet
              disabled={loading}
              onPress={() => {
                void handleForgotPassword()
              }}
            />
          </div>
          {notice ? <p className="font-body text-sm text-brand">{notice}</p> : null}
          <Button label="Entrar" loading={loading} onPress={() => void handleLogin()} />
        </form>

        <p className="flex flex-wrap items-center gap-2 font-body text-sm text-muted">
          Ainda não tem conta?
          <Button
            label="Criar conta"
            variant="outline"
            block={false}
            quiet
            onPress={handleCreateAccount}
          />
        </p>
      </div>
    </AuthLayout>
  )
}
