import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD3F8vIIaC1vokFkzMrTz2KOcJYtoOZtE4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "xp-terminal-3276c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "xp-terminal-3276c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "xp-terminal-3276c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "317832102064",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:317832102064:web:bf00618d909b5c039d3b75",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
