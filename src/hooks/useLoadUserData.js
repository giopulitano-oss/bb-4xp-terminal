import { useState, useEffect } from "react";
import { loadUserState } from "../firebase/firestoreService";
import { loadFromLocalStorage } from "./useFirestoreSync";

const LOAD_TIMEOUT_MS = 5000;

export default function useLoadUserData({ uid, applyState }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      // Race Firestore load against a timeout
      try {
        const data = await Promise.race([
          loadUserState(uid),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), LOAD_TIMEOUT_MS)
          ),
        ]);
        if (!cancelled && data) {
          applyState(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Firestore load failed or timed out, trying localStorage:", err.message);
        if (!cancelled) setError(err.message);
      }

      // Fallback: load from localStorage
      if (!cancelled) {
        const local = loadFromLocalStorage();
        if (local) {
          console.log("Loaded state from localStorage backup");
          applyState(local);
        }
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [uid]);

  return { loading, error };
}
