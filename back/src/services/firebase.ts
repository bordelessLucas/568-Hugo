import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'

export interface FirebaseClientConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId?: string
}

let firebaseApp: FirebaseApp | undefined
let firebaseAuth: Auth | undefined
let firestoreDb: Firestore | undefined
let firebaseStorage: FirebaseStorage | undefined

export function initFirebase(config: FirebaseClientConfig): FirebaseApp {
  if (firebaseApp && firebaseAuth && firestoreDb) {
    return firebaseApp
  }

  firebaseApp = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    ...(config.measurementId ? { measurementId: config.measurementId } : {}),
  })
  firebaseAuth = getAuth(firebaseApp)
  firestoreDb = getFirestore(firebaseApp)
  return firebaseApp
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    throw new Error('Firebase nao inicializado.')
  }
  return firebaseAuth
}

export function getFirestoreDb(): Firestore {
  if (!firestoreDb) {
    throw new Error('Firebase nao inicializado.')
  }
  return firestoreDb
}

export async function getFirebaseStorage(): Promise<FirebaseStorage> {
  if (!firebaseApp) {
    throw new Error('Firebase nao inicializado.')
  }
  if (!firebaseStorage) {
    const { getStorage } = await import('firebase/storage')
    firebaseStorage = getStorage(firebaseApp)
  }
  return firebaseStorage
}
