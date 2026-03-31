import React, { useContext } from "react";
import { AuthContext } from "../firebase/AuthContext";
import { C, FONT_MONO as M, FONT_SANS as S } from "../styles/theme";
import LoginPage from "./LoginPage";

export default function AuthGuard({ children }) {
  const { user, loading, authorized, signOut } = useContext(AuthContext);

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: `3px solid ${C.bd}`,
          borderTopColor: C.g,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ color: C.dm, fontFamily: M, fontSize: 11 }}>CHARGEMENT...</span>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <LoginPage />;
  }

  // Logged in but not authorized
  if (!authorized) {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: S,
      }}>
        <div style={{
          background: C.p1,
          border: `1px solid ${C.rd}44`,
          borderRadius: 8,
          padding: "40px 36px",
          width: 380,
          maxWidth: "90vw",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>&#x26D4;</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.rd, fontFamily: M, marginBottom: 8 }}>
            ACCÈS NON AUTORISÉ
          </div>
          <div style={{ fontSize: 12, color: C.dm, marginBottom: 6 }}>
            Le compte <strong style={{ color: C.tx }}>{user.email}</strong> n'est pas autorisé à accéder à cette application.
          </div>
          <div style={{ fontSize: 11, color: C.ft, marginBottom: 24 }}>
            Contactez l'administrateur pour obtenir l'accès.
          </div>
          <button
            onClick={signOut}
            style={{
              padding: "10px 24px",
              background: "transparent",
              border: `1px solid ${C.rd}66`,
              borderRadius: 4,
              color: C.rd,
              fontFamily: M,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            SE DÉCONNECTER
          </button>
        </div>
      </div>
    );
  }

  // Authorized
  return children;
}
