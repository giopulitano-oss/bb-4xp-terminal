import { C, FONT_MONO } from '../../styles/theme';

export default function KPI({ label, value, color }) {
  return (
    <div
      style={{
        background: C.p2,
        border: "1px solid " + C.bd,
        borderRadius: 3,
        padding: "5px 6px",
      }}
    >
      <div style={{ fontSize: 6, color: C.ft, fontFamily: FONT_MONO, letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: FONT_MONO, color }}>
        {value}
      </div>
    </div>
  );
}
