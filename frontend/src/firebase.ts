// src/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

// TODO: Add your Firebase project's configuration here
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

console.log('[Firebase Config] VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY)
console.log('[Firebase Config] VITE_FIREBASE_AUTH_DOMAIN:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
console.log('[Firebase Config] VITE_FIREBASE_DATABASE_URL:', import.meta.env.VITE_FIREBASE_DATABASE_URL)
console.log('[Firebase Config] VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID)
console.log('[Firebase Config] VITE_FIREBASE_STORAGE_BUCKET:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET)
console.log('[Firebase Config] VITE_FIREBASE_MESSAGING_SENDER_ID:', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID)
console.log('[Firebase Config] VITE_FIREBASE_APP_ID:', import.meta.env.VITE_FIREBASE_APP_ID)

const app = initializeApp(firebaseConfig)

// Get a reference to the database service and export it for use in other modules
export const db = getDatabase(app)
export const auth = getAuth(app)
