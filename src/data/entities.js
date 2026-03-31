const MO = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export { MO };

export function createInitialEntities() {
  return [
    {
      n: "Elevate Capital", type: "OpCo", pct: 40, cash0: 45000,
      rev: MO.map(() => [{ n: "Services financiers", v: 60000 }]),
      fixe: MO.map(() => [
        { n: "Salaires", v: 13500 }, { n: "Loyer bureau", v: 2310 },
        { n: "Frais juridiques", v: 2000 }, { n: "Logiciels", v: 667 },
      ]),
      variable: MO.map(() => [
        { n: "Marketing", v: 5000 }, { n: "Sous-traitance", v: 5113 },
        { n: "Déplacements", v: 1000 },
      ]),
    },
    {
      n: "Mellix", type: "OpCo", pct: 100, cash0: 30000,
      rev: MO.map(() => [{ n: "Revenus immobiliers", v: 22727 }]),
      fixe: MO.map(() => [
        { n: "Logiciels", v: 393 }, { n: "Assurances", v: 125 }, { n: "Frais REQ", v: 167 },
      ]),
      variable: MO.map(() => [{ n: "Frais bureau", v: 150 }, { n: "Autres", v: 175 }]),
    },
    {
      n: "4Stays", type: "OpCo", pct: 100, cash0: 15000,
      rev: MO.map(() => [{ n: "Revenus STR", v: 20000 }]),
      fixe: MO.map(() => [
        { n: "Salaires", v: 3000 }, { n: "Logiciels", v: 60 }, { n: "Assurances", v: 380 },
      ]),
      variable: MO.map(() => [
        { n: "Ménage", v: 1500 }, { n: "Marketing", v: 1000 }, { n: "Entretien", v: 1250 },
      ]),
    },
    {
      n: "Groupe O", type: "Holding", pct: 100, cash0: 20000,
      rev: MO.map(() => [{ n: "Revenus diversifiés", v: 11917 }]),
      fixe: MO.map(() => [
        { n: "Salaires", v: 4000 }, { n: "Frais bureau", v: 600 }, { n: "Logiciels", v: 300 },
      ]),
      variable: MO.map(() => [
        { n: "Marketing", v: 1000 }, { n: "Sous-traitance", v: 667 }, { n: "Autres", v: 350 },
      ]),
    },
    {
      n: "RenoConnect", type: "OpCo", pct: 100, cash0: 12000,
      rev: MO.map(() => [{ n: "Services rénovation", v: 25000 }]),
      fixe: MO.map(() => [
        { n: "Salaires", v: 4000 }, { n: "Logiciels", v: 300 }, { n: "Frais bureau", v: 180 },
      ]),
      variable: MO.map(() => [
        { n: "Marketing", v: 3000 }, { n: "Sous-traitance", v: 2333 }, { n: "Autres", v: 187 },
      ]),
    },
  ];
}
