import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if Firebase keys are configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.apiKey !== ""
);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn("Firebase initialization warning:", err);
  }
}

/**
 * Login user using Firebase Auth or local Demo mode fallback
 */
export async function loginWithUsernameOrEmail(identifier, password) {
  // Convert username to email format if user typed username without @
  const email = identifier.includes('@')
    ? identifier
    : `${identifier.trim().toLowerCase()}@agrinexus.gov.in`;

  if (isFirebaseConfigured && auth) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  // Demo fallback authentication
  if (!password || password.length < 4) {
    throw new Error("Password must be at least 4 characters.");
  }

  const demoUser = {
    uid: `demo_${Date.now()}`,
    email: email,
    displayName: identifier.includes('@') ? identifier.split('@')[0] : identifier,
    isDemoMode: true
  };

  localStorage.setItem('agrinexus_user', JSON.stringify(demoUser));
  return demoUser;
}

/**
 * Register user using Firebase Auth or local Demo mode fallback
 */
export async function registerUser(username, email, password) {
  const targetEmail = email || `${username.trim().toLowerCase()}@agrinexus.gov.in`;

  if (isFirebaseConfigured && auth) {
    const userCredential = await createUserWithEmailAndPassword(auth, targetEmail, password);
    if (username) {
      await updateProfile(userCredential.user, { displayName: username });
    }
    return userCredential.user;
  }

  // Demo fallback registration
  const demoUser = {
    uid: `demo_${Date.now()}`,
    email: targetEmail,
    displayName: username || 'Farmer',
    isDemoMode: true
  };

  localStorage.setItem('agrinexus_user', JSON.stringify(demoUser));
  return demoUser;
}

/**
 * Logout current user
 */
export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  localStorage.removeItem('agrinexus_user');
}

/**
 * Listen for Auth State Changes
 */
export function subscribeAuthState(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  }

  // Fallback to local storage state for Demo mode
  const stored = localStorage.getItem('agrinexus_user');
  if (stored) {
    try {
      callback(JSON.parse(stored));
    } catch {
      callback(null);
    }
  } else {
    callback(null);
  }

  return () => {};
}

export { auth, db };
