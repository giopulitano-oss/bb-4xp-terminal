import { C, FONT_MONO } from '../../styles/theme';

export default function Tag({ children, c }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 5px",
        fontSize: 7,
        fontWeight: 700,
        borderRadius: 2,
        fontFamily: FONT_MONO,
        background: c || C.g,
        color: C.bg,
      }}
    >
      {children}
    </span>
  );
}
