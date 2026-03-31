export const INIT_ACQ = [
  { n: "220 De la Comtesse, St-Jérôme", type: "Multi", prix: 1850000, mdf: 305294, opex: 24294, revProj: 0, date: "2026-04", notes: "Financement", appr: 8.0, status: "Financement" },
  { n: "2498 Sherbrooke E, MTL", type: "Multi", prix: 2520000, mdf: 556526, opex: 29526, revProj: 0, date: "2026-04", notes: "Financement", appr: 5.5, status: "Financement" },
  { n: "1940 Grands Monts, Sherbrooke", type: "Multi", prix: 1775000, mdf: 357294, opex: 28294, revProj: 0, date: "2026-06", notes: "Hyp $1.446M", appr: 5.5, status: "Action requise" },
  { n: "8 Rue Perron, Repentigny", type: "Multi", prix: 1600000, mdf: 427937, opex: 27937, revProj: 0, date: "2026-06", notes: "Hyp $1.2M", appr: 6.0, status: "Financement" },
];

export const INIT_PIPELINE = [
  { n: "6-plex Trois-Rivières", loc: "Trois-Riv.", px: 480000, noiEst: 42000, capR: 8.75, ltvTgt: 75, score: 88, status: "Analyse" },
  { n: "12-plex Sherbrooke", loc: "Sherbrooke", px: 1100000, noiEst: 82000, capR: 7.45, ltvTgt: 70, score: 82, status: "Offre" },
  { n: "Terrain Shawinigan", loc: "Shawinigan", px: 120000, noiEst: 0, capR: 0, ltvTgt: 0, score: 65, status: "Veille" },
];

export const INIT_DEVS = [
  {
    id: 1, n: "Micro Chalet", loc: "—", type: "Micro-chalet", status: "En analyse",
    terrain: 0, construction: 250000, softCosts: 0, contingencyPct: 10,
    mdf: 250000, debtConst: 0, debtRate: 7.5, debtDur: 18,
    revStab: 0, opexProj: 0, capRateStab: 6.5, dureesMois: 12,
    dateDebut: "2026-09", dateFinConst: "2027-09", dateStab: "2028-01", dateRefi: "2028-06",
  },
  {
    id: 2, n: "12 Logements Lachute", loc: "Lachute", type: "Multi", status: "En analyse",
    terrain: 0, construction: 0, softCosts: 0, contingencyPct: 10,
    mdf: 0, debtConst: 0, debtRate: 7, debtDur: 24,
    revStab: 0, opexProj: 0, capRateStab: 6, dureesMois: 18,
    dateDebut: "2027-01", dateFinConst: "2028-06", dateStab: "2029-01", dateRefi: "2029-06",
  },
  {
    id: 3, n: "Flip Laval", loc: "Laval", type: "Mixte", status: "En analyse",
    terrain: 539000, construction: 0, softCosts: 350000, contingencyPct: 10,
    mdf: 889000, debtConst: 0, debtRate: 7, debtDur: 12,
    revStab: 0, opexProj: 0, capRateStab: 6, dureesMois: 10,
    dateDebut: "2026-08", dateFinConst: "2027-06", dateStab: "2027-09", dateRefi: "2027-12",
  },
];
