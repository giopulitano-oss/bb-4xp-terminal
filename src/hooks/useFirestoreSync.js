import { useEffect, useRef, useState } from "react";
import { saveUserState } from "../firebase/firestoreService";

const LS_KEY = "4xp_terminal_backup";
const DEBOUNCE_MS = 1500;
const POLL_MS = 500;

function saveToLocalStorage(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (_) { /* quota exceeded */ }
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
  const isSavingRef = useRef(false);
  const getStateRef = useRef(getState);
  const uidRef = useRef(uid);

  // Keep refs fresh without triggering effects
  getStateRef.current = getState;
  uidRef.current = uid;

  useEffect(() => {
    if (!uid || !isReady) return;

    const interval = setInterval(() => {
      const currentState = getStateRef.current();
      const currentJson = JSON.stringify(currentState);

      // First snapshot — don't save
      if (prevJsonRef.current === null) {
        prevJsonRef.current = currentJson;
        return;
      }

      // No changes
      if (currentJson === prevJsonRef.current) return;

      prevJsonRef.current = currentJson;

      // Save to localStorage immediately
      saveToLocalStorage(currentState);

      // Debounce Firestore save
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!isSavingRef.current) setSaveStatus("pending");

      timerRef.current = setTimeout(async () => {
        isSavingRef.current = true;
        setSaveStatus("saving");
        try {
          await saveUserState(uidRef.current, getStateRef.current());
          isSavingRef.current = false;
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (err) {
          console.error("Firestore save error:", err);
          isSavingRef.current = false;
          setSaveStatus("error");
        }
      }, DEBOUNCE_MS);
    }, POLL_MS);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [uid, isReady]); // Only re-run if uid or isReady changes

  return { saveStatus };
}
