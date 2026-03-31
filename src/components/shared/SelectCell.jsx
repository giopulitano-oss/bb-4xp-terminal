import { useState } from 'react';
import { C, FONT_MONO } from '../../styles/theme';

export default function SelectCell({ value, options, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <span
        onClick={() => setOpen(!open)}
        style={{
          cursor: "pointer",
          fontFamily: FONT_MONO,
          color: C.cy,
          borderBottom: `1px dashed ${C.bd}`,
          fontSize: 8,
          padding: "0 1px",
        }}
      >
        {value} ▾
      </span>
      {open && (
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 0,
            zIndex: 999,
            background: C.p1,
            border: `1px solid ${C.bd}`,
            borderRadius: 3,
            padding: 2,
            minWidth: 130,
            maxHeight: 180,
            overflowY: "auto",
          }}
        >
          {options.map((o) => (
            <div
              key={o}
              onClick={() => { onChange(o); setOpen(false); }}
              style={{
                padding: "3px 6px",
                fontSize: 8,
                fontFamily: FONT_MONO,
                cursor: "pointer",
                color: o === value ? C.g : C.tx,
                background: o === value ? C.g + "12" : "transparent",
                borderRadius: 2,
              }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
