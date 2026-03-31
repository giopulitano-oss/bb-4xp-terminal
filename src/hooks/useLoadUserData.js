import { useState, useEffect } from "react";
import { loadUserState } from "../firebase/firestoreService";
import { loadFromLocalStorage } from "./useFirestoreSync";

export default function useLoadUserData({ uid, applyState }) {
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // 1. Load from localStorage IMMEDIATELY (no waiting)
    const localData = loadFromLocalStorage();
    if (localData) {
      applyState(localData);
      setSource("localStorage");
    }
    setLoading(false);

    // 2. Try Firestore in background — if newer, overwrite
    if (uid) {
      const timeout = setTimeout(() => { /* give up after 5s */ }, 5000);
      loadUserState(uid)
        .then((fsData) => {
          clearTimeout(timeout);
          if (cancelled || !fsData) return;
          const fsDate = fsData._date ? new Date(fsData._date).getTime() : 0;
          const localDate = localData?._date ? new Date(localData._date).getTime() : 0;
          if (fsDate > localDate) {
            applyState(fsData);
            setSource("firestore");
          }
        })
        .catch(() => { clearTimeout(timeout); });
    }

    return () => { cancelled = true; };
  }, [uid]);

  return { loading, source };
}
