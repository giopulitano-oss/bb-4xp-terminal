import { useState } from 'react';
import { C, FONT_MONO } from '../../styles/theme';
import { fm } from '../../utils/format';

export default function EditableCell({ value, onChange, type = "number", w = 70, suffix = "", color = C.tx }) {
  const [ed, setEd] = useState(false);
  const [tmp, setTmp] = useState(String(value));

  if (ed) {
    return (
      <input
        autoFocus
        type={type}
        value={tmp}
        onChange={(e) => setTmp(e.target.value)}
        onBlur={() => {
          setEd(false);
          onChange(type === "number" ? parseFloat(tmp) || 0 : tmp);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.target.blur();
          if (e.key === "Escape") setEd(false);
        }}
        style={{
          width: w,
          background: C.bg,
          border: `1px solid ${C.g}44`,
          borderRadius: 2,
          color: C.g,
          fontFamily: FONT_MONO,
          fontSize: 8.5,
          padding: "1px 3px",
          textAlign: "right",
          outline: "none",
        }}
      />
    );
  }

  return (
    <span
      onClick={() => { setTmp(String(value)); setEd(true); }}
      style={{
        cursor: "pointer",
        fontFamily: FONT_MONO,
        color,
        borderBottom: `1px dashed ${C.bd}`,
        fontSize: 9,
        padding: "0 1px",
      }}
      title="Cliquer pour modifier"
    >
      {typeof value === "number" && Math.abs(value) >= 1000 ? fm(value) : value}
      {suffix}
    </span>
  );
}
