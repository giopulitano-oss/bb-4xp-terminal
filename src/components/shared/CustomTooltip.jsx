import { C, FONT_MONO } from '../../styles/theme';
import { fm } from '../../utils/format';

export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div style={{ background: C.p1, border: `1px solid ${C.bd}`, padding: "4px 7px", borderRadius: 3 }}>
      <div style={{ fontSize: 7, color: C.dm, fontFamily: FONT_MONO }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 9, color: p.color || C.wh, fontFamily: FONT_MONO }}>
          {p.name}: {typeof p.value === "number" && Math.abs(p.value) > 100 ? fm(p.value) : String(p.value)}
        </div>
      ))}
    </div>
  );
}
