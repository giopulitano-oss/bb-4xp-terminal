import { useEffect, useRef, useState, useCallback } from "react";
import { saveUserState } from "../firebase/firestoreService";

export default function useFirestoreSync({ uid, getState, isReady }) {
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | pending | saving | saved | error
  const timerRef = useRef(null);
  const prevStateRef = useRef(null);
  const isFirstRender = useRef(true);

  const stableGetState = useCallback(getState, [getState]);

  useEffect(() => {
    if (!uid || !isReady) return;

    // Skip first render (initial load from Firestore)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevStateRef.current = JSON.stringify(stableGetState());
      return;
    }

    const currentState = JSON.stringify(stableGetState());
    if (currentState === prevStateRef.current) return;

    prevStateRef.current = currentState;
    setSaveStatus("pending");

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await saveUserState(uid, stableGetState());
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err) {
        console.error("Firestore save error:", err);
        setSaveStatus("error");
      }
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  });

  return { saveStatus };
}
