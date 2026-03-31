export const INIT_PR = [
  { n: "70 Montée Source", t: "Multi", v: 775000, rev: 72000, d: 0, noi: 46500, pmtHyp: 0, termes: 25, taux: 0, appr: 5.5, units: 4, acq: 2020, pxAcq: 400000, capex: 75000, maturity: 0, loc: "Laurentides", vacancy: 2, noiGr: 3.0, exitCap: 6.5, loyerGr: 4.0 },
  { n: "10 Montée Source", t: "Multi", v: 800000, rev: 66000, d: 0, noi: 51000, pmtHyp: 0, termes: 25, taux: 0, appr: 5.5, units: 4, acq: 2021, pxAcq: 525000, capex: 40000, maturity: 0, loc: "Laurentides", vacancy: 2, noiGr: 3.0, exitCap: 6.5, loyerGr: 4.0 },
  { n: "1974 L-O David, MTL", t: "Multi", v: 790000, rev: 57600, d: 448000, noi: 39200, pmtHyp: 30588, termes: 25, taux: 5.09, appr: 4.5, units: 4, acq: 2022, pxAcq: 660000, capex: 40000, maturity: 2027, loc: "Montréal", vacancy: 3, noiGr: 3.0, exitCap: 6.5, loyerGr: 4.0 },
  { n: "74 Fortier, Amqui", t: "Multi", v: 365000, rev: 43560, d: 240000, noi: 31000, pmtHyp: 18024, termes: 25, taux: 5.24, appr: 3.0, units: 3, acq: 2023, pxAcq: 265000, capex: 50000, maturity: 2028, loc: "Bas-St-Laurent", vacancy: 4, noiGr: 2.0, exitCap: 7.5, loyerGr: 3.0 },
  { n: "403 Woodbine", t: "Multi", v: 545000, rev: 0, d: 0, noi: 0, pmtHyp: 0, termes: 25, taux: 0, appr: 3.0, units: 3, acq: 2024, pxAcq: 400000, capex: 145000, maturity: 0, loc: "Montréal", vacancy: 0, noiGr: 3.0, exitCap: 6.5, loyerGr: 4.0 },
  { n: "Chalet Prestige", t: "Chalet Premium", v: 1200000, rev: 150000, d: 720000, noi: 99000, pmtHyp: 56700, termes: 25, taux: 5.79, appr: 5.0, units: 1, acq: 2024, pxAcq: 1050000, capex: 75000, maturity: 2029, loc: "Mont-Tremblant", vacancy: 8, noiGr: 4.0, exitCap: 6.0, loyerGr: 5.0 },
  { n: "220 De la Comtesse, StJer", t: "Multi", v: 1850000, rev: 139380, d: 1380000, noi: 102600, pmtHyp: 96348, termes: 25, taux: 4.89, appr: 4.5, units: 6, acq: 2025, pxAcq: 1850000, capex: 0, maturity: 2030, loc: "St-Jérôme", vacancy: 3, noiGr: 3.0, exitCap: 6.5, loyerGr: 4.0 },
  { n: "2498 Sherbrooke E, MTL", t: "Multi", v: 2520000, rev: 166848, d: 1963474, noi: 128850, pmtHyp: 132420, termes: 25, taux: 4.49, appr: 4.0, units: 10, acq: 2025, pxAcq: 2520000, capex: 0, maturity: 2030, loc: "Montréal", vacancy: 3, noiGr: 3.0, exitCap: 6.5, loyerGr: 4.0 },
  { n: "Terrain Sablière", t: "Terrain", v: 300000, rev: 0, d: 0, noi: 0, pmtHyp: 0, termes: 0, taux: 0, appr: 8.0, units: 0, acq: 2023, pxAcq: 125000, capex: 0, maturity: 0, loc: "Laurentides", vacancy: 0, noiGr: 0, exitCap: 0, loyerGr: 0 },
  { n: "Terrain Nature", t: "Terrain", v: 100000, rev: 0, d: 0, noi: 0, pmtHyp: 0, termes: 0, taux: 0, appr: 5.0, units: 0, acq: 2024, pxAcq: 50000, capex: 0, maturity: 0, loc: "Lanaudière", vacancy: 0, noiGr: 0, exitCap: 0, loyerGr: 0 },
  { n: "Terrain Morin-Heights", t: "Terrain", v: 80000, rev: 0, d: 0, noi: 0, pmtHyp: 0, termes: 0, taux: 0, appr: 6.0, units: 0, acq: 2025, pxAcq: 80000, capex: 0, maturity: 0, loc: "Laurentides", vacancy: 0, noiGr: 0, exitCap: 0, loyerGr: 0 },
  { n: "Cash & Liquidités", t: "Liq", v: 75000, rev: 0, d: 0, noi: 0, pmtHyp: 0, termes: 0, taux: 0, appr: 0, units: 0, acq: 0, pxAcq: 0, capex: 0, maturity: 0, loc: "—", vacancy: 0, noiGr: 0, exitCap: 0, loyerGr: 0 },
  { n: "Prêts privés actifs", t: "Fin", v: 1472500, rev: 0, d: 0, noi: 0, pmtHyp: 0, termes: 0, taux: 0, appr: 0, units: 0, acq: 0, pxAcq: 0, capex: 0, maturity: 0, loc: "—", vacancy: 0, noiGr: 1.0, exitCap: 0, loyerGr: 0 },
];

export const SECTOR_MULTIPLES = {
  "Immobilier":          { low: 8,  mid: 10, high: 14 },
  "Services Financiers": { low: 10, mid: 12, high: 18 },
  "Construction / Réno": { low: 4,  mid: 6,  high: 8  },
  "Hospitalité / STR":   { low: 6,  mid: 8,  high: 12 },
  "Holding / Diversifié":{ low: 5,  mid: 8,  high: 10 },
  "Tech / SaaS":         { low: 12, mid: 20, high: 30 },
  "Services Prof.":      { low: 5,  mid: 7,  high: 10 },
};
