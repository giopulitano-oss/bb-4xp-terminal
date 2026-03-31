import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export async function loadUserState(uid) {
  const snap = await getDoc(doc(db, "users", uid, "data", "state"));
  return snap.exists() ? snap.data() : null;
}

export async function saveUserState(uid, stateObj) {
  await setDoc(doc(db, "users", uid, "data", "state"), {
    ...stateObj,
    _updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function saveUserProfile(uid, profile) {
  await setDoc(doc(db, "users", uid, "profile", "info"), {
    ...profile,
    _updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function loadAllowedEmails() {
  const snap = await getDoc(doc(db, "config", "allowedUsers"));
  return snap.exists() ? (snap.data().emails || []) : [];
}
