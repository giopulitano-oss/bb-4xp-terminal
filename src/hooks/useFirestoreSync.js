import { useEffect, useRef, useState } from "react";
import { saveUserState } from "../firebase/firestoreService";

const LS_KEY = "4xp_terminal_state";
const LS_VERSION = "v9";
const DEBOUNCE_MS = 400;
const POLL_MS = 500;
const FIRESTORE_DEBOUNCE_MS = 3000;

// ── localStorage: PRIMARY storage ──

export function saveToLocalStorage(state) {
  try {
    const wrapped = { _v: LS_VERSION, _ts: Date.now(), data: state };
    localStorage.setItem(LS_KEY, JSON.stringify(wrapped));
    return true;
  } catch (err) {
    console.warn("localStorage save failed:", err.message);
    return false;
  }
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Support both wrapped and unwrapped formats
    if (parsed && parsed.data) return parsed.data;
    if (parsed && parsed.pr) return parsed; // old format
    return null;
  } catch (err) {
    console.warn("localStorage load failed:", err.message);
    return null;
  }
}

export function resetLocalStorage() {
  try {
    localStorage.removeItem(LS_KEY);
    return true;
  } catch (_) {
    return false;
  }
}

export function getLocalStorageInfo() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      version: parsed._v || "unknown",
      timestamp: parsed._ts ? new Date(parsed._ts).toISOString() : "unknown",
      sizeKB: Math.round(raw.length / 1024),
    };
  } catch (_) {
    return null;
  }
}

// ── Sync hook ──

export default function useFirestoreSync({ uid, getState, isReady }) {
  const [saveStatus, setSaveStatus] = useState("idle");
  const localTimerRef = useRef(null);
  const firestoreTimerRef = useRef(null);
  const prevJsonRef = useRef(null);
  const getStateRef = useRef(getState);
  const uidRef = useRef(uid);

  getStateRef.current = getState;
  uidRef.current = uid;

  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      const currentState = getStateRef.current();
      const currentJson = JSON.stringify(currentState);

      // First snapshot
      if (prevJsonRef.current === null) {
        prevJsonRef.current = currentJson;
        return;
      }

      // No changes
      if (currentJson === prevJsonRef.current) return;

      prevJsonRef.current = currentJson;
      setSaveStatus("pending");

      // 1. Debounced localStorage save (fast, 400ms)
      if (localTimerRef.current) clearTimeout(localTimerRef.current);
      localTimerRef.current = setTimeout(() => {
        const ok = saveToLocalStorage(getStateRef.current());
        if (ok) {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 1500);
        }
      }, DEBOUNCE_MS);

      // 2. Debounced Firestore save (slower, 3s, optional)
      if (uidRef.current) {
        if (firestoreTimerRef.current) clearTimeout(firestoreTimerRef.current);
        firestoreTimerRef.current = setTimeout(async () => {
          try {
            await saveUserState(uidRef.current, getStateRef.current());
          } catch (_) {
            // Firestore save failed — localStorage already has the data
          }
        }, FIRESTORE_DEBOUNCE_MS);
      }
    }, POLL_MS);

    return () => {
      clearInterval(interval);
      if (localTimerRef.current) clearTimeout(localTimerRef.current);
      if (firestoreTimerRef.current) clearTimeout(firestoreTimerRef.current);
    };
  }, [isReady]);

  return { saveStatus };
}
