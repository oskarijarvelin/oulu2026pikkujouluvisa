import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, signInAnonymously, Auth } from "firebase/auth";

let database: Database | null = null;
let auth: Auth | null = null;

export function initFirebase() {
  if (!getApps().length) {
    // Provide your Firebase config via env vars (NEXT_PUBLIC_*)
    // Set these in .env.local and do NOT commit them.
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  }
  
  if (!database) {
    database = getDatabase(getApp());
  }
  
  if (!auth) {
    auth = getAuth(getApp());
  }
  
  return database;
}

export function getDb(): Database {
  if (!database) {
    database = initFirebase();
  }
  return database;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    initFirebase();
  }
  return auth!;
}

/**
 * Ensures the user is authenticated with Firebase using anonymous auth.
 * This is required before writing to the database.
 * @returns Promise that resolves when authentication is complete
 */
export async function ensureAuthenticated(): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  
  // If already authenticated, return immediately
  if (firebaseAuth.currentUser) {
    return;
  }
  
  // Sign in anonymously
  await signInAnonymously(firebaseAuth);
}