import { useState, useEffect } from "react";
import { loadUserState } from "../firebase/firestoreService";

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
        }
      } catch (err) {
        console.error("Firestore load error:", err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [uid]);

  return { loading, error };
}
