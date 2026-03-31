import { useEffect, useRef, useState } from "react";
import { saveUserState } from "../firebase/firestoreService";

const LS_KEY = "4xp_terminal_backup";

function saveToLocalStorage(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (_) { /* quota exceeded — ignore */ }
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export default function useFirestoreSync({ uid, getState, isReady }) {
  const [saveStatus, setSaveStatus] = useState("idle");
  const timerRef = useRef(null);
  const prevJsonRef = useRef(null);
  const getStateRef = useRef(getState);
  const mountedRef = useRef(true);

  // Keep getState ref current without triggering effects
  useEffect(() => {
    getStateRef.current = getState;
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Sync effect — runs on every render but only saves when state changed
  useEffect(() => {
    if (!uid || !isReady) return;

    const currentState = getStateRef.current();
    const currentJson = JSON.stringify(currentState);

    // First call: snapshot current state, don't save
    if (prevJsonRef.current === null) {
      prevJsonRef.current = currentJson;
      return;
    }

    // No changes — nothing to do
    if (currentJson === prevJsonRef.current) return;

    prevJsonRef.current = currentJson;

    // Immediately save to localStorage (instant, no network needed)
    saveToLocalStorage(currentState);

    setSaveStatus("pending");

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      setSaveStatus("saving");
      try {
        await saveUserState(uid, getStateRef.current());
        if (mountedRef.current) {
          setSaveStatus("saved");
          setTimeout(() => {
            if (mountedRef.current) setSaveStatus("idle");
          }, 2000);
        }
      } catch (err) {
        console.error("Firestore save error:", err);
        if (mountedRef.current) setSaveStatus("error");
      }
    }, 1500);
  });

  return { saveStatus };
}
