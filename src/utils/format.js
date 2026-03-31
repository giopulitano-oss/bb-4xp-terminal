export function fm(n) {
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e4) return "$" + (n / 1000).toFixed(0) + "K";
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
  if (n <= -1e6) return "-$" + (Math.abs(n) / 1e6).toFixed(2) + "M";
  if (n <= -1e4) return "-$" + (Math.abs(n) / 1000).toFixed(0) + "K";
  return "$" + Math.round(n).toLocaleString();
}

export function pc(n) {
  return (n * 100).toFixed(1) + "%";
}
