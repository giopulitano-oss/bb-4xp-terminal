export function calcIRR(cashflows, guess = 0.1) {
  let r = guess;
  for (let i = 0; i < 100; i++) {
    let npv = 0, dnpv = 0;
    for (let t = 0; t < cashflows.length; t++) {
      npv += cashflows[t] / Math.pow(1 + r, t);
      dnpv -= (t * cashflows[t]) / Math.pow(1 + r, t + 1);
    }
    if (Math.abs(dnpv) < 1e-10) break;
    const nr = r - npv / dnpv;
    if (Math.abs(nr - r) < 1e-7) return nr;
    r = nr;
  }
  return r;
}
