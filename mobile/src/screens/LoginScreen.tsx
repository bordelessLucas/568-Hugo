import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Image, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { tokens } from '@rotatrucks/back/tokens'
import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Input } from '@/components/Input'
import { Icon } from '@/components/Icon'
import { Body, Heading } from '@/components/Typography'
import { useAuth } from '@/contexts/AuthContext'
import { toUserMessage } from '@/lib/auth-errors'
import { pressStyle } from '@/lib/press'

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
    <Container edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.stack}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                accessibilityLabel="RotaTruck"
              />
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.brandName}>RotaTruck</Text>
              <Text style={styles.brandSubline}>Rotas seguras para caminhoneiros</Text>
            </View>
          </View>
          <View style={styles.kicker}>
            <Icon name="shield-checkmark-outline" size={16} color={tokens.color.accent} />
            <Text style={styles.kickerText}>Acesso seguro</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Heading>Entre na rota</Heading>
          <Body tone="muted">Veja se a via passa para o seu caminhão antes de sair.</Body>
        </View>

        <View style={styles.card}>
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
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void handleForgotPassword()
              }}
              style={pressStyle(styles.actionLink, { opacity: 0.72 })}
            >
              <Icon name="key-outline" size={17} color={tokens.color.brand} />
              <Text style={styles.actionLabel} numberOfLines={2} adjustsFontSizeToFit>
                Esqueci minha senha
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/cadastro')}
              style={pressStyle(styles.actionLink, { opacity: 0.72 })}
            >
              <Icon name="person-add-outline" size={17} color={tokens.color.brand} />
              <Text style={styles.actionLabel} numberOfLines={2} adjustsFontSizeToFit>
                Criar conta
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  stack: {
    gap: tokens.space[5],
    paddingTop: 0,
    paddingBottom: tokens.space[8],
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginHorizontal: -tokens.space[5],
    paddingHorizontal: tokens.space[5],
    paddingTop: tokens.space[8],
    paddingBottom: tokens.space[5],
    gap: tokens.space[4],
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: tokens.color.brand,
    shadowColor: tokens.color.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space[4],
  },
  logoWrap: {
    width: 92,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 76,
    height: 76,
  },
  brandCopy: {
    flex: 1,
    gap: tokens.space[1],
  },
  brandName: {
    color: tokens.color.onBrand,
    fontFamily: tokens.font.sign,
    fontSize: 34,
    lineHeight: 38,
  },
  brandSubline: {
    color: tokens.color.onBrandMuted,
    fontFamily: tokens.font.bodyMedium,
    fontSize: tokens.size.label,
    lineHeight: 18,
  },
  titleBlock: {
    alignItems: 'center',
    gap: tokens.space[2],
  },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: tokens.space[2],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    backgroundColor: 'rgba(7,48,73,0.24)',
    paddingHorizontal: tokens.space[3],
    paddingVertical: tokens.space[2],
  },
  kickerText: {
    color: tokens.color.onBrand,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
  },
  card: {
    gap: tokens.space[4],
    padding: tokens.space[5],
    borderRadius: 24,
    borderWidth: 1,
    borderColor: tokens.color.line,
    backgroundColor: tokens.color.surface,
    shadowColor: tokens.color.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: tokens.space[2],
    paddingTop: tokens.space[1],
  },
  actionLink: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: tokens.space[2],
    paddingVertical: tokens.space[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space[2],
  },
  actionLabel: {
    flexShrink: 1,
    color: tokens.color.brand,
    fontFamily: tokens.font.label,
    fontSize: tokens.size.caption,
    lineHeight: 16,
    textAlign: 'center',
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
