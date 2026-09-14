import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import type { RegisterUserInput, SignInInput } from '../domain/user'
import { getFirebaseAuth } from './firebase'
import { saveUserProfile } from './user.service'

export interface AuthSession {
  uid: string
  email: string | null
  displayName: string | null
}

function toSession(user: User): AuthSession {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  }
}

function assertEmail(email: string): string {
  const normalized = email.trim().toLowerCase()
  if (normalized === '' || !normalized.includes('@')) {
    throw new Error('Informe um e-mail valido.')
  }
  return normalized
}

function assertPassword(password: string): void {
  if (password.length < 6) {
    throw new Error('A senha precisa ter pelo menos 6 caracteres.')
  }
}

export async function signIn(input: SignInInput): Promise<AuthSession> {
  const email = assertEmail(input.email)
  assertPassword(input.password)
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, input.password)
  return toSession(credential.user)
}

export async function registerUser(input: RegisterUserInput): Promise<AuthSession> {
  const name = input.name.trim()
  if (name === '') {
    throw new Error('Informe o nome.')
  }
  const email = assertEmail(input.email)
  assertPassword(input.password)

  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, input.password)
  await updateProfile(credential.user, { displayName: name })
  try {
    await saveUserProfile({
      id: credential.user.uid,
      name,
      email,
      createdAt: new Date().toISOString(),
    })
  } catch {
    await signOut(getFirebaseAuth())
    throw new Error('Nao foi possivel salvar o perfil. Tente criar a conta de novo.')
  }

  return {
    uid: credential.user.uid,
    email: credential.user.email,
    displayName: name,
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  const normalized = assertEmail(email)
  await sendPasswordResetEmail(getFirebaseAuth(), normalized)
}

export function signOutUser(): Promise<void> {
  return signOut(getFirebaseAuth())
}

export function observeAuthSession(
  onChange: (session: AuthSession | null) => void,
): () => void {
  return onAuthStateChanged(getFirebaseAuth(), (user) => {
    onChange(user ? toSession(user) : null)
  })
}
