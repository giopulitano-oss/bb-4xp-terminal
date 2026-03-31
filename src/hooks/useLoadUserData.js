import { useState, useEffect } from "react";
import { loadUserState } from "../firebase/firestoreService";
import { loadFromLocalStorage } from "./useFirestoreSync";

const FIRESTORE_TIMEOUT_MS = 4000;

export default function useLoadUserData({ uid, applyState }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // "firestore" | "localStorage" | null

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1. Always load localStorage first (instant)
      const localData = loadFromLocalStorage();

      // 2. Try Firestore if logged in (with timeout)
      if (uid) {
        try {
          const fsData = await Promise.race([
            loadUserState(uid),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("timeout")), FIRESTORE_TIMEOUT_MS)
            ),
          ]);

          if (!cancelled && fsData) {
            // Use Firestore if it's newer or local is empty
            const fsDate = fsData._date ? new Date(fsData._date).getTime() : 0;
            const localDate = localData?._date ? new Date(localData._date).getTime() : 0;

            if (fsDate >= localDate) {
              applyState(fsData);
              setSource("firestore");
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Firestore load skipped:", err.message);
        }
      }

      // 3. Fallback to localStorage
      if (!cancelled && localData) {
        applyState(localData);
        setSource("localStorage");
      }

      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [uid]);

  return { loading, error, source };
}
