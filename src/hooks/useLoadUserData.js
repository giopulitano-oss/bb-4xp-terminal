import { useState, useEffect } from "react";
import { loadUserState } from "../firebase/firestoreService";
import { loadFromLocalStorage } from "./useFirestoreSync";

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
      try {
        const data = await loadUserState(uid);
        if (!cancelled && data) {
          applyState(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Firestore load failed, trying localStorage:", err);
        if (!cancelled) setError(err.message);
      }

      // Fallback: load from localStorage if Firestore failed or returned nothing
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
