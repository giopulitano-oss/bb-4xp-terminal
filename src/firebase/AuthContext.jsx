import React, { createContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./config";
import { loadAllowedEmails, saveUserProfile } from "./firestoreService";

export const AuthContext = createContext(null);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        setAuthorized(true);
        // Save profile in background — don't block auth flow
        saveUserProfile(fbUser.uid, {
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email,
          lastLogin: new Date().toISOString(),
        }).catch(() => {});
      } else {
        setUser(null);
        setAuthorized(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        // Auto-create account for new users
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (createErr) {
          setAuthError(createErr.message);
        }
      } else {
        setAuthError(err.message);
      }
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setAuthError(err.message);
      }
    }
  };

  const signOut = () => fbSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, authorized, authError, signInWithEmail, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
