import { C, FONT_MONO } from '../../styles/theme';

export default function Heading({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
      <div style={{ width: 2, height: 10, background: C.g, borderRadius: 1 }} />
      <span
        style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontFamily: FONT_MONO,
          color: C.g,
        }}
      >
        {children}
      </span>
    </div>
  );
}
