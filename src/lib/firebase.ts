import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

const firebaseEnvironment = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingVariables = Object.entries(firebaseEnvironment)
  .filter(([, value]) => typeof value !== 'string' || value.trim().length === 0)
  .map(([name]) => name)

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVariables.join(', ')}`,
  )
}

const app =
  getApps().find((existingApp) => existingApp.name === '[DEFAULT]') ??
  initializeApp({
    apiKey: firebaseEnvironment.VITE_FIREBASE_API_KEY,
    authDomain: firebaseEnvironment.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: firebaseEnvironment.VITE_FIREBASE_PROJECT_ID,
    storageBucket: firebaseEnvironment.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: firebaseEnvironment.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: firebaseEnvironment.VITE_FIREBASE_APP_ID,
  })

const auth = getAuth(app)

type FirestoreServices = {
  db: Firestore
  firestore: typeof import('firebase/firestore')
}

let firestoreServicesPromise: Promise<FirestoreServices> | undefined

function loadFirestore(): Promise<FirestoreServices> {
  if (!firestoreServicesPromise) {
    firestoreServicesPromise = import('firebase/firestore')
      .then((firestore) => ({
        db: firestore.getFirestore(app),
        firestore,
      }))
      .catch((error: unknown) => {
        firestoreServicesPromise = undefined
        throw error
      })
  }

  return firestoreServicesPromise
}

export { app, auth, loadFirestore }
