import React, { useState, useContext } from "react";
import { AuthContext } from "../firebase/AuthContext";
import { C, FONT_MONO as M, FONT_SANS as S } from "../styles/theme";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, authError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await signInWithEmail(email, password);
    setSubmitting(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    background: C.bg,
    border: `1px solid ${C.bd}`,
    borderRadius: 4,
    color: C.tx,
    fontFamily: M,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

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
        border: `1px solid ${C.bd}`,
        borderRadius: 8,
        padding: "40px 36px",
        width: 380,
        maxWidth: "90vw",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <div style={{
              background: C.g,
              borderRadius: 3,
              padding: "3px 8px",
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.bg, fontFamily: M }}>BB</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.wh }}>BLOOMBERG</span>
            <span style={{ fontSize: 13, color: C.dm }}>Quantum</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.cy, fontFamily: M, letterSpacing: 1.5 }}>
            4XP REAL ESTATE
          </div>
          <div style={{ fontSize: 11, color: C.dm, marginTop: 8 }}>
            Terminal CIO — Accès sécurisé
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, color: C.dm, fontFamily: M, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@entreprise.com"
              style={inputStyle}
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, color: C.dm, fontFamily: M, letterSpacing: 0.8, display: "block", marginBottom: 4 }}>
              MOT DE PASSE
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              required
            />
          </div>

          {authError && (
            <div style={{
              padding: "8px 12px",
              background: C.rd + "15",
              border: `1px solid ${C.rd}44`,
              borderRadius: 4,
              color: C.rd,
              fontSize: 11,
              fontFamily: M,
              marginBottom: 14,
            }}>
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "11px",
              background: C.g,
              border: "none",
              borderRadius: 4,
              color: C.bg,
              fontFamily: M,
              fontSize: 12,
              fontWeight: 700,
              cursor: submitting ? "wait" : "pointer",
              letterSpacing: 1,
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "CONNEXION..." : "SIGN IN"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.bd }} />
          <span style={{ fontSize: 10, color: C.ft, fontFamily: M }}>OU</span>
          <div style={{ flex: 1, height: 1, background: C.bd }} />
        </div>

        {/* Google sign-in */}
        <button
          onClick={signInWithGoogle}
          style={{
            width: "100%",
            padding: "11px",
            background: "transparent",
            border: `1px solid ${C.bl}66`,
            borderRadius: 4,
            color: C.bl,
            fontFamily: M,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: 0.5,
          }}
        >
          CONNEXION AVEC GOOGLE
        </button>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 10, color: C.ft, fontFamily: M }}>
          Première connexion? Un compte sera créé automatiquement.
        </div>
      </div>
    </div>
  );
}
