// Bloomberg Terminal color palette
export const C = {
  bg: "#0A0C10",
  p1: "#111318",
  p2: "#171A22",
  bd: "#282D3A",
  tx: "#C8CDD8",
  dm: "#687080",
  ft: "#4A5060",
  wh: "#E8ECF2",
  g:  "#00E676",
  gd: "#00C853",
  rd: "#FF3D57",
  am: "#FFB300",
  bl: "#448AFF",
  cy: "#18FFFF",
  pu: "#B388FF",
  pk: "#FF80AB",
  or: "#FF9100",
};

// Font families
export const FONT_MONO = "'JetBrains Mono', monospace";
export const FONT_SANS = "'DM Sans', sans-serif";

// Shared box style for card panels
export const boxStyle = {
  background: C.p1,
  border: `1px solid ${C.bd}22`,
  borderRadius: 4,
  padding: "8px 10px",
  marginBottom: 6,
};

// Tab button style generator
export const tabStyle = (activeTab, id) => ({
  padding: "5px 8px",
  border: "none",
  cursor: "pointer",
  fontFamily: FONT_MONO,
  fontSize: 7,
  fontWeight: 600,
  letterSpacing: 0.8,
  background: activeTab === id ? C.g + "18" : "transparent",
  borderTop: activeTab === id ? "2px solid " + C.g : "2px solid transparent",
  color: activeTab === id ? C.g : C.dm,
  whiteSpace: "nowrap",
});
