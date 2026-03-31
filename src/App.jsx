import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend, Area, AreaChart,
} from 'recharts';

import { C, FONT_MONO as M, FONT_SANS as S, boxStyle as bx, tabStyle } from './styles/theme';
import { fm, pc } from './utils/format';
import { calcIRR } from './utils/calc';
import {
  INIT_PR, INIT_OP, FUND_OVERVIEW, FUNDING_NEW, PIPELINE_INV,
  ORG, PROVS, CITIES, RATES, INIT_ACQ, INIT_PIPELINE, INIT_DEVS,
  SECTOR_MULTIPLES, MO, createInitialEntities, INIT_FUNDING_SCHED,
} from './data';
import {
  Tag as Tg, Heading as Hd, EditableCell as EC,
  SelectCell as SC, KPI, CustomTooltip as Tp,
} from './components/shared';
import { AuthContext } from './firebase/AuthContext';
import useFirestoreSync from './hooks/useFirestoreSync';
import useLoadUserData from './hooks/useLoadUserData';

export default function App() {
  const { user, signOut } = useContext(AuthContext);
  const _S = typeof window !== "undefined" && window._4XP_STATE ? window._4XP_STATE : null;
  const [tab, setTab] = useState("dash");
  const [cr, setCr] = useState(_S ? _S.cr : 7);
  const [em, setEm] = useState(_S ? _S.em : 10);
  const [om, setOm] = useState(_S ? _S.om : 5);
  const [ld, setLd] = useState(_S ? _S.ld : 15);
  const [ck, setCk] = useState(new Date());
  const [pr, setPr] = useState(_S ? _S.pr : INIT_PR);
  const [op, setOp] = useState(_S ? _S.op : INIT_OP);
  const [std, setStd] = useState(_S ? _S.std : 1250000);
  const [stdRate, setStdRate] = useState(_S ? _S.stdRate : 8.0);
  const [fundInv, setFundInv] = useState(_S ? _S.fundInv : FUND_OVERVIEW.investors);
  const [fundingInv, setFundingInv] = useState(_S ? _S.fundingInv : FUNDING_NEW.investors);
  const [pipeInv, setPipeInv] = useState(_S ? _S.pipeInv : PIPELINE_INV.investors);
  const [opExpSel, setOpExpSel] = useState(null);
  const [mcRuns, setMcRuns] = useState(null);
  const [mcL, setMcL] = useState(false);
  const [mcSims, setMcSims] = useState(5000);
  // ── PROJECTION PARAMS ──
  const [projDefAppr, setProjDefAppr] = useState(_S ? _S.projDefAppr : 5.0);
  const [projDefRate, setProjDefRate] = useState(_S ? _S.projDefRate : 4.5);
  const [projAmortYrs, setProjAmortYrs] = useState(_S ? _S.projAmortYrs : 25);
  const [allocView, setAllocView] = useState("class"); // "class" or "asset"
  const [allocThreshold, setAllocThreshold] = useState(2);
  const [wfSel, setWfSel] = useState("all");
  const [cfScenario, setCfScenario] = useState("base"); // base, stress, upside
  const [cfTaxRate, setCfTaxRate] = useState(_S ? _S.cfTaxRate : 26.5);
  const [cfDistTarget, setCfDistTarget] = useState(_S ? _S.cfDistTarget : 50);
  const [cfoSel, setCfoSel] = useState(0);
  const [cfoView, setCfoView] = useState("entity");
  const MO = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const [entities, setEntities] = useState(() => {
    if (_S && _S.entities) return _S.entities;
    const iRev = INIT_PR.reduce((a, p) => a + (p.rev || 0), 0);
    const iPmt = INIT_PR.reduce((a, p) => a + (p.pmtHyp || 0), 0);
    return [{
      n: "Elevate Capital",
      type: "OpCo",
      pct: 40,
      rev: MO.map(() => [{
        n: "Services financiers",
        v: 60000
      }]),
      fixe: MO.map(() => [{
        n: "Salaires",
        v: 13500
      }, {
        n: "Loyer bureau",
        v: 2310
      }, {
        n: "Frais juridiques",
        v: 2000
      }, {
        n: "Logiciels",
        v: 667
      }]),
      variable: MO.map(() => [{
        n: "Marketing",
        v: 5000
      }, {
        n: "Sous-traitance",
        v: 5113
      }, {
        n: "Déplacements",
        v: 1000
      }]),
      cash0: 45000
    }, {
      n: "Mellix",
      type: "OpCo",
      pct: 100,
      rev: MO.map(() => [{
        n: "Revenus immobiliers",
        v: 22727
      }]),
      fixe: MO.map(() => [{
        n: "Logiciels",
        v: 393
      }, {
        n: "Assurances",
        v: 125
      }, {
        n: "Frais REQ",
        v: 167
      }]),
      variable: MO.map(() => [{
        n: "Frais bureau",
        v: 150
      }, {
        n: "Autres",
        v: 175
      }]),
      cash0: 30000
    }, {
      n: "4Stays",
      type: "OpCo",
      pct: 100,
      rev: MO.map(() => [{
        n: "Revenus STR",
        v: 20000
      }]),
      fixe: MO.map(() => [{
        n: "Salaires",
        v: 3000
      }, {
        n: "Logiciels",
        v: 60
      }, {
        n: "Assurances",
        v: 380
      }]),
      variable: MO.map(() => [{
        n: "Ménage",
        v: 1500
      }, {
        n: "Marketing",
        v: 1000
      }, {
        n: "Entretien",
        v: 1250
      }]),
      cash0: 15000
    }, {
      n: "Groupe O",
      type: "Holding",
      pct: 100,
      rev: MO.map(() => [{
        n: "Revenus diversifiés",
        v: 11917
      }]),
      fixe: MO.map(() => [{
        n: "Salaires",
        v: 4000
      }, {
        n: "Frais bureau",
        v: 600
      }, {
        n: "Logiciels",
        v: 300
      }]),
      variable: MO.map(() => [{
        n: "Marketing",
        v: 1000
      }, {
        n: "Sous-traitance",
        v: 667
      }, {
        n: "Autres",
        v: 350
      }]),
      cash0: 20000
    }, {
      n: "RenoConnect",
      type: "OpCo",
      pct: 100,
      rev: MO.map(() => [{
        n: "Services rénovation",
        v: 25000
      }]),
      fixe: MO.map(() => [{
        n: "Salaires",
        v: 4000
      }, {
        n: "Logiciels",
        v: 300
      }, {
        n: "Frais bureau",
        v: 180
      }]),
      variable: MO.map(() => [{
        n: "Marketing",
        v: 3000
      }, {
        n: "Sous-traitance",
        v: 2333
      }, {
        n: "Autres",
        v: 187
      }]),
      cash0: 12000
    }];
  });
  const addEnt = () => setEntities(p => [...p, {
    n: "Nouvelle société",
    type: "OpCo",
    pct: 100,
    rev: MO.map(() => [{
      n: "Revenu",
      v: 0
    }]),
    fixe: MO.map(() => [{
      n: "Dép. fixe",
      v: 0
    }]),
    variable: MO.map(() => [{
      n: "Dép. var.",
      v: 0
    }]),
    cash0: 0
  }]);
  const updEntField = (ei, f, v) => setEntities(p => {
    const n = [...p];
    n[ei] = {
      ...n[ei],
      [f]: v
    };
    return n;
  });
  const addLine = (ei, cat, lbl) => setEntities(p => {
    const n = [...p];
    n[ei] = {
      ...n[ei],
      [cat]: n[ei][cat].map(m => [...m, {
        n: lbl,
        v: 0
      }])
    };
    return n;
  });
  const updLine = (ei, cat, mi, li, f, v) => setEntities(p => {
    const n = [...p];
    const c = n[ei][cat].map(m => m.map(l => ({
      ...l
    })));
    c[mi][li] = {
      ...c[mi][li],
      [f]: v
    };
    n[ei] = {
      ...n[ei],
      [cat]: c
    };
    return n;
  });
  const [detAsset, setDetAsset] = useState(null);
  const [detDebt, setDetDebt] = useState(null);
  const [portView, setPortView] = useState("overview"); // overview, assets, debts, insights
  // ── ACQ STATE ──
  const [acqs, setAcqs] = useState(_S ? _S.acqs : INIT_ACQ.map((a, i) => ({
    ...a,
    id: i,
    type: "Multi",
    capex: 0,
    apprPrev: 5.0
  })));
  const addAcq = () => setAcqs(p => [...p, {
    id: Date.now(),
    n: "Nouvelle propriété",
    status: "Analyse",
    mdf: 0,
    capex: 0,
    total: 0,
    date: "2026-09-01",
    notes: "",
    mois: 9,
    type: "Multi"
  }]);
  const updAcq = (i, f, v) => setAcqs(p => {
    const n = [...p];
    n[i] = {
      ...n[i],
      [f]: v
    };
    return n;
  });
  const rmAcq = i => setAcqs(p => p.filter((_, idx) => idx !== i));
  // ── DEV STATE ──
  const [devs, setDevs] = useState(_S ? _S.devs : [{
    id: 1,
    n: "Micro Chalet",
    loc: "—",
    type: "Micro-chalet",
    status: "En analyse",
    terrain: 0,
    construction: 250000,
    softCosts: 0,
    contingencyPct: 10,
    mdf: 250000,
    debtConst: 0,
    debtRate: 7.5,
    debtDur: 18,
    revStab: 0,
    opexProj: 0,
    capRateStab: 6.5,
    dureesMois: 12,
    dateDebut: "2026-09",
    dateFinConst: "2027-09",
    dateStab: "2028-01",
    dateRefi: "2028-06"
  }, {
    id: 2,
    n: "12 Logements Lachute",
    loc: "Lachute",
    type: "Multi",
    status: "En analyse",
    terrain: 0,
    construction: 0,
    softCosts: 0,
    contingencyPct: 10,
    mdf: 0,
    debtConst: 0,
    debtRate: 7,
    debtDur: 24,
    revStab: 0,
    opexProj: 0,
    capRateStab: 6,
    dureesMois: 18,
    dateDebut: "2027-01",
    dateFinConst: "2028-06",
    dateStab: "2029-01",
    dateRefi: "2029-06"
  }, {
    id: 3,
    n: "Flip Laval",
    loc: "Laval",
    type: "Mixte",
    status: "En analyse",
    terrain: 539000,
    construction: 0,
    softCosts: 350000,
    contingencyPct: 10,
    mdf: 889000,
    debtConst: 0,
    debtRate: 7,
    debtDur: 12,
    revStab: 0,
    opexProj: 0,
    capRateStab: 6,
    dureesMois: 10,
    dateDebut: "2026-08",
    dateFinConst: "2027-06",
    dateStab: "2027-09",
    dateRefi: "2027-12"
  }]);
  const [acqSubView, setAcqSubView] = useState("acq"); // "acq" | "dev"
  const addDev = () => setDevs(p => [...p, {
    id: Date.now(),
    n: "Nouveau projet",
    loc: "—",
    type: "Multi",
    status: "Pré-développement",
    terrain: 0,
    construction: 0,
    softCosts: 0,
    contingencyPct: 10,
    mdf: 0,
    debtConst: 0,
    debtRate: 7,
    debtDur: 18,
    revStab: 0,
    opexProj: 0,
    capRateStab: 6,
    dureesMois: 12,
    dateDebut: "2027-01",
    dateFinConst: "2028-01",
    dateStab: "2028-06",
    dateRefi: "2028-12"
  }]);
  const updDev = (i, f, v) => setDevs(p => {
    const n = [...p];
    n[i] = {
      ...n[i],
      [f]: v
    };
    return n;
  });
  const rmDev = i => setDevs(p => p.filter((_, idx) => idx !== i));
  // ── ORG STATE ──
  const [orgSel, setOrgSel] = useState(null);
  const [orgClA, setOrgClA] = useState(_S ? _S.orgClA : ORG.hold.clA.map(s => ({
    ...s
  })));
  const [orgClB, setOrgClB] = useState(_S ? _S.orgClB : ORG.hold.clB.map(s => ({
    ...s
  })));
  const [orgReSubs, setOrgReSubs] = useState(_S ? _S.orgReSubs : ORG.re.subs.map(s => ({
    ...s,
    code: s.n
  })));
  const [orgOpcos, setOrgOpcos] = useState(_S ? _S.orgOpcos : ORG.opco.entities.map(e => ({
    ...e,
    code: e.num || ""
  })));
  const [orgCA, setOrgCA] = useState(_S ? _S.orgCA : ORG.ca.map(m => ({
    ...m
  })));
  const updOrgA = (i, f, v) => setOrgClA(p => {
    const n = [...p];
    n[i] = {
      ...n[i],
      [f]: v
    };
    return n;
  });
  const updOrgB = (i, f, v) => setOrgClB(p => {
    const n = [...p];
    n[i] = {
      ...n[i],
      [f]: v
    };
    return n;
  });
  const updOrgRe = (i, f, v) => setOrgReSubs(p => {
    const n = [...p];
    n[i] = {
      ...n[i],
      [f]: v
    };
    return n;
  });
  const updOrgOp = (i, f, v) => setOrgOpcos(p => {
    const n = [...p];
    n[i] = {
      ...n[i],
      [f]: v
    };
    return n;
  });
  const addOrgSub = pole => {
    if (pole === "re") setOrgReSubs(p => [...p, {
      n: "Nouvelle société",
      desc: "—",
      own: "4XP RE 100%",
      code: "XXXX-XXXX QC"
    }]);else setOrgOpcos(p => [...p, {
      n: "Nouvelle entité",
      desc: "—",
      sh: [{
        n: "4XP OpCo",
        p: 100
      }],
      code: ""
    }]);
  };
  useEffect(() => {
    const t = setInterval(() => setCk(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── SAVE / EXPORT / IMPORT ──
  const triggerImport = () => {
    const inp = document.getElementById("_4xp_import");
    if (inp) inp.click();
  };
  const getState = () => ({
    pr,
    op,
    std,
    stdRate,
    fundInv,
    fundingInv,
    pipeInv,
    cr,
    em,
    om,
    ld,
    projDefAppr,
    projDefRate,
    projAmortYrs,
    cfTaxRate,
    cfDistTarget,
    acqs,
    devs,
    entities,
    orgClA,
    orgClB,
    orgCA,
    orgReSubs,
    orgOpcos,
    _v: "v9",
    _date: new Date().toISOString()
  });
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "4XP_Terminal_" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const importJSON = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.pr) setPr(d.pr);
        if (d.op) setOp(d.op);
        if (d.std !== undefined) setStd(d.std);
        if (d.stdRate !== undefined) setStdRate(d.stdRate);
        if (d.fundInv) setFundInv(d.fundInv);
        if (d.fundingInv) setFundingInv(d.fundingInv);
        if (d.pipeInv) setPipeInv(d.pipeInv);
        if (d.cr !== undefined) setCr(d.cr);
        if (d.em !== undefined) setEm(d.em);
        if (d.om !== undefined) setOm(d.om);
        if (d.ld !== undefined) setLd(d.ld);
        if (d.projDefAppr !== undefined) setProjDefAppr(d.projDefAppr);
        if (d.projDefRate !== undefined) setProjDefRate(d.projDefRate);
        if (d.projAmortYrs !== undefined) setProjAmortYrs(d.projAmortYrs);
        if (d.cfTaxRate !== undefined) setCfTaxRate(d.cfTaxRate);
        if (d.cfDistTarget !== undefined) setCfDistTarget(d.cfDistTarget);
        if (d.acqs) setAcqs(d.acqs);
        if (d.devs) setDevs(d.devs);
        if (d.entities) setEntities(d.entities);
        if (d.orgClA) setOrgClA(d.orgClA);
        if (d.orgClB) setOrgClB(d.orgClB);
        if (d.orgCA) setOrgCA(d.orgCA);
        if (d.orgReSubs) setOrgReSubs(d.orgReSubs);
        if (d.orgOpcos) setOrgOpcos(d.orgOpcos);
        alert("Import réussi — " + (d._date ? d._date.slice(0, 10) : ""));
      } catch (err) {
        alert("Erreur import: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── FIREBASE SYNC ──
  const applyState = useCallback((d) => {
    if (d.pr) setPr(d.pr);
    if (d.op) setOp(d.op);
    if (d.std !== undefined) setStd(d.std);
    if (d.stdRate !== undefined) setStdRate(d.stdRate);
    if (d.fundInv) setFundInv(d.fundInv);
    if (d.fundingInv) setFundingInv(d.fundingInv);
    if (d.pipeInv) setPipeInv(d.pipeInv);
    if (d.cr !== undefined) setCr(d.cr);
    if (d.em !== undefined) setEm(d.em);
    if (d.om !== undefined) setOm(d.om);
    if (d.ld !== undefined) setLd(d.ld);
    if (d.projDefAppr !== undefined) setProjDefAppr(d.projDefAppr);
    if (d.projDefRate !== undefined) setProjDefRate(d.projDefRate);
    if (d.projAmortYrs !== undefined) setProjAmortYrs(d.projAmortYrs);
    if (d.cfTaxRate !== undefined) setCfTaxRate(d.cfTaxRate);
    if (d.cfDistTarget !== undefined) setCfDistTarget(d.cfDistTarget);
    if (d.acqs) setAcqs(d.acqs);
    if (d.devs) setDevs(d.devs);
    if (d.entities) setEntities(d.entities);
    if (d.orgClA) setOrgClA(d.orgClA);
    if (d.orgClB) setOrgClB(d.orgClB);
    if (d.orgCA) setOrgCA(d.orgCA);
    if (d.orgReSubs) setOrgReSubs(d.orgReSubs);
    if (d.orgOpcos) setOrgOpcos(d.orgOpcos);
  }, []);

  const { loading: fbLoading } = useLoadUserData({ uid: user?.uid, applyState });
  const { saveStatus } = useFirestoreSync({ uid: user?.uid, getState, isReady: !fbLoading });

  // ── COMPUTED ──
  const TASSETS = pr.reduce((a, p) => a + p.v, 0);
  const LTD = pr.reduce((a, p) => a + p.d, 0);
  const DEBT = LTD + std;
  const NOI = pr.reduce((a, p) => a + p.noi, 0);
  const OPNET = op.reduce((a, o) => a + o.net, 0);
  const OPREV = op.reduce((a, o) => a + o.rev, 0);
  const DS = 442080;
  const EQ = TASSETS - DEBT;
  const EB = NOI + OPNET;
  const gLTV = TASSETS > 0 ? DEBT / TASSETS : 0;
  const totalUnits = pr.reduce((a, p) => a + p.units, 0);
  const wDebt = pr.reduce((a, p) => a + p.d * (p.taux / 100), 0) + std * (stdRate / 100);
  const tDebtR = pr.reduce((a, p) => a + (p.d > 0 ? p.d : 0), 0) + std;
  const wRate = tDebtR > 0 ? wDebt / tDebtR * 100 : 0;
  const incV = NOI / (cr / 100) - DEBT + OPNET * om;
  const ebV = EB * em - DEBT + 75000;
  const blend = EQ * 0.3 + incV * 0.35 + ebV * 0.35;
  const final = blend * (1 - ld / 100);
  const updatePr = (i, f, v) => setPr(p => {
    const n = [...p];
    n[i] = {
      ...n[i],
      [f]: v
    };
    return n;
  });
  const addProperty = () => setPr(p => [...p, {
    n: "Nouvelle propriété",
    t: "Multi",
    v: 0,
    rev: 0,
    d: 0,
    noi: 0,
    pmtHyp: 0,
    termes: 25,
    taux: 4.0,
    appr: 5.0,
    units: 0,
    acq: 2026,
    pxAcq: 0,
    capex: 0,
    maturity: 0,
    loc: "—",
    vacancy: 0,
    noiGr: 3.0,
    exitCap: 6.5,
    loyerGr: 4.0
  }]);
  const removePr = i => setPr(p => p.filter((_, idx) => idx !== i));
  const addExpItem = opIdx => setOp(p => {
    const n = [...p];
    n[opIdx] = {
      ...n[opIdx],
      exp: [...(n[opIdx].exp || []), {
        cat: "Nouvelle dépense",
        amt: 0
      }]
    };
    return n;
  });
  const updateExp = (opIdx, expIdx, field, val) => setOp(p => {
    const n = [...p];
    const e = [...n[opIdx].exp];
    e[expIdx] = {
      ...e[expIdx],
      [field]: val
    };
    n[opIdx] = {
      ...n[opIdx],
      exp: e
    };
    const totalExp = e.reduce((a, x) => a + x.amt, 0);
    n[opIdx].net = n[opIdx].rev - totalExp;
    n[opIdx].mg = n[opIdx].rev > 0 ? parseFloat((n[opIdx].net / n[opIdx].rev * 100).toFixed(1)) : 0;
    return n;
  });
  const removeExp = (opIdx, expIdx) => setOp(p => {
    const n = [...p];
    n[opIdx] = {
      ...n[opIdx],
      exp: n[opIdx].exp.filter((_, i) => i !== expIdx)
    };
    const totalExp = n[opIdx].exp.reduce((a, x) => a + x.amt, 0);
    n[opIdx].net = n[opIdx].rev - totalExp;
    n[opIdx].mg = n[opIdx].rev > 0 ? parseFloat((n[opIdx].net / n[opIdx].rev * 100).toFixed(1)) : 0;
    return n;
  });

  // ── RE NET VALUE & OPCO VALUE ──
  const REREV = pr.reduce((a, p) => a + p.rev, 0);
  const REPMTHYP = pr.reduce((a, p) => a + p.pmtHyp, 0);
  const RE_NET = TASSETS - DEBT;
  const RE_INCOME_VAL = NOI > 0 ? NOI / (cr / 100) : 0;
  const OPCO_VAL = op.reduce((a, o) => a + o.net * o.mult, 0);
  const TOTAL_OPEXP = op.reduce((a, o) => a + (o.exp || []).reduce((b, e) => b + e.amt, 0), 0);

  // ── ACQ COMPUTED (synced to FUND) ──
  const acqTotalCapReq = acqs.reduce((a, x) => a + (x.mdf || 0) + (x.capex || 0), 0);
  // Dev computed
  const devTotalCost = devs.reduce((a, d) => a + d.terrain + d.construction + d.softCosts + Math.round((d.terrain + d.construction + d.softCosts) * d.contingencyPct / 100), 0);
  const devTotalMdf = devs.reduce((a, d) => a + d.mdf, 0);
  const devTotalDebt = devs.reduce((a, d) => a + d.debtConst, 0);
  const devTotalCapReq = devTotalMdf;
  const totalCapReqAll = acqTotalCapReq + devTotalCapReq;
  const acqByMonth = {};
  acqs.forEach(a => {
    const m = a.mois || parseInt((a.date || "").split("-")[1]) || 0;
    if (m > 0) {
      if (!acqByMonth[m]) acqByMonth[m] = 0;
      acqByMonth[m] += (a.mdf || 0) + (a.capex || 0);
    }
  });
  const acqCapCalls = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"].map((m, i) => ({
    m,
    montant: acqByMonth[i + 1] || 0
  }));
  const totalFundAvail = fundInv.reduce((a, inv) => a + inv.cap, 0) + fundingInv.reduce((a, inv) => a + inv.cap, 0);
  const acqGap = totalCapReqAll - totalFundAvail;

  // ── BILAN PROJECTION ENGINE ──
  const projYears = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040];
  const projData = (() => {
    const rows = [];
    for (let yi = 0; yi < projYears.length; yi++) {
      const yr = projYears[yi];
      const yearsOut = yr - 2026;
      let totalAssets = 0;
      let totalDebt = 0;
      // Per-asset projection
      pr.forEach(p => {
        const apprRate = p.appr > 0 ? p.appr / 100 : projDefAppr / 100;
        const projVal = p.v * Math.pow(1 + apprRate, yearsOut);
        totalAssets += projVal;
        // Debt amortization
        if (p.d > 0 && p.taux > 0) {
          const rate = p.taux / 100;
          const monthlyRate = rate / 12;
          const termes = (p.termes || projAmortYrs) * 12;
          const pmt = p.d * monthlyRate / (1 - Math.pow(1 + monthlyRate, -termes));
          let balance = p.d;
          const monthsElapsed = yearsOut * 12;
          for (let m = 0; m < monthsElapsed && balance > 0; m++) {
            const intPart = balance * monthlyRate;
            const princPart = pmt - intPart;
            balance = Math.max(0, balance - princPart);
          }
          totalDebt += balance;
        } else if (p.d > 0) {
          // Interest-only or no rate defined — debt stays flat
          totalDebt += p.d;
        }
      });
      // Add short-term debt (diminishes if not renewed — assume flat for conservatism)
      totalDebt += std;
      const nav = totalAssets - totalDebt;
      const ltv = totalAssets > 0 ? totalDebt / totalAssets : 0;
      rows.push({
        yr,
        assets: Math.round(totalAssets),
        debt: Math.round(totalDebt),
        nav: Math.round(nav),
        ltv
      });
    }
    return rows;
  })();
  const projKeyYears = projData.filter(r => [2026, 2030, 2035, 2040].includes(r.yr));
  const projChartData = projData.map(r => ({
    yr: String(r.yr),
    Actifs: r.assets,
    Dette: r.debt,
    "Valeur nette": r.nav
  }));

  // ── CFO CASH FLOW WATERFALL ──
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const cfMonths = monthNames.map((m, i) => {
    const loyers = REREV / 12;
    const opcoRev = OPREV / 12;
    const hypPmt = REPMTHYP / 12;
    const invInt = std * (stdRate / 100) / 12;
    const opcoExp = TOTAL_OPEXP / 12;
    const capex = pr.reduce((a, p) => a + p.capex, 0) / 12;
    const inflow = loyers + opcoRev;
    const outflow = hypPmt + invInt + opcoExp + capex;
    const net = inflow - outflow;
    return {
      m,
      inflow: Math.round(inflow),
      outflow: Math.round(outflow),
      net: Math.round(net),
      loyers: Math.round(loyers),
      opcoRev: Math.round(opcoRev),
      hypPmt: Math.round(hypPmt),
      invInt: Math.round(invInt),
      opcoExp: Math.round(opcoExp)
    };
  });
  const cumulCF = cfMonths.reduce((arr, m, i) => {
    arr.push({
      ...m,
      cumul: (arr[i - 1] && arr[i - 1].cumul || 75000) + m.net
    });
    return arr;
  }, []);

  // ── COVENANT MONITOR ──
  const covenants = [{
    n: "LTV Global",
    val: gLTV,
    threshold: 0.65,
    op: "<=",
    unit: "%",
    fmt: v => pc(v),
    status: gLTV <= 0.65 ? "OK" : gLTV <= 0.75 ? "WATCH" : "BREACH"
  }, {
    n: "DSCR (NOI/DS)",
    val: NOI / DS,
    threshold: 1.5,
    op: ">=",
    unit: "x",
    fmt: v => v.toFixed(2) + "x",
    status: NOI / DS >= 1.5 ? "OK" : NOI / DS >= 1.2 ? "WATCH" : "BREACH"
  }, {
    n: "Réserve investissement (3%)",
    val: 75000,
    threshold: TASSETS * 0.03,
    op: ">=",
    unit: "$",
    fmt: v => fm(v),
    status: 75000 >= TASSETS * 0.03 ? "OK" : "BREACH"
  }, {
    n: "Ratio dette CT / dette totale",
    val: std / DEBT,
    threshold: 0.20,
    op: "<=",
    unit: "%",
    fmt: v => pc(v),
    status: std / DEBT <= 0.20 ? "OK" : "WATCH"
  }, {
    n: "Leverage (Actifs/Equity)",
    val: TASSETS / EQ,
    threshold: 2.5,
    op: "<=",
    unit: "x",
    fmt: v => v.toFixed(1) + "x",
    status: TASSETS / EQ <= 2.5 ? "OK" : TASSETS / EQ <= 3.5 ? "WATCH" : "BREACH"
  }, {
    n: "Cash / Service dette mensuel",
    val: 75000 / (DS / 12),
    threshold: 3,
    op: ">=",
    unit: "mois",
    fmt: v => v.toFixed(1) + " mois",
    status: 75000 / (DS / 12) >= 3 ? "OK" : "WATCH"
  }, {
    n: "Taux moyen investisseurs",
    val: FUND_OVERVIEW.tauxMoyen / 100,
    threshold: 0.13,
    op: "<=",
    unit: "%",
    fmt: v => (v * 100).toFixed(1) + "%",
    status: FUND_OVERVIEW.tauxMoyen <= 13 ? "OK" : "WATCH"
  }];

  // ── PERFORMANCE ATTRIBUTION ──
  const perfAttrib = pr.filter(p => p.pxAcq > 0 && p.acq > 0).map(p => {
    const yrs = Math.max(1, 2026 - p.acq);
    const totalReturn = (p.v - p.pxAcq) / p.pxAcq;
    const apprReturn = p.appr * yrs / 100;
    const noiYield = p.noi > 0 ? p.noi * yrs / p.pxAcq : 0;
    const levReturn = p.d > 0 ? (p.v - p.pxAcq) / (p.pxAcq - p.d) - totalReturn : 0;
    const volatility = Math.abs(p.appr - 5) * 0.8 + (p.vacancy || 0) * 0.5 + p.d / Math.max(1, p.v) * 10;
    const sharpe = volatility > 0 ? (totalReturn / yrs * 100 - 3) / volatility : 0;
    return {
      ...p,
      yrs,
      totalReturn,
      apprReturn,
      noiYield,
      levReturn,
      volatility,
      sharpe
    };
  });

  // ── MONTE CARLO ENGINE ──
  const runMonteCarlo = useCallback(() => {
    setMcL(true);
    setTimeout(() => {
      const results = [];
      for (let s = 0; s < mcSims; s++) {
        let nav = EQ;
        let noi = NOI;
        let assets = TASSETS;
        let debt = DEBT;
        for (let y = 0; y < 5; y++) {
          const apprShock = (Math.random() * 2 - 1) * 0.12 + 0.05;
          const noiShock = (Math.random() * 2 - 1) * 0.15 + 0.03;
          const rateShock = (Math.random() * 2 - 1) * 0.02;
          assets *= 1 + apprShock;
          noi *= 1 + noiShock;
          const intCost = debt * (wRate / 100 + rateShock);
          nav = assets - debt;
        }
        results.push(Math.round(nav));
      }
      results.sort((a, b) => a - b);
      const p5 = results[Math.floor(mcSims * 0.05)];
      const p25 = results[Math.floor(mcSims * 0.25)];
      const p50 = results[Math.floor(mcSims * 0.50)];
      const p75 = results[Math.floor(mcSims * 0.75)];
      const p95 = results[Math.floor(mcSims * 0.95)];
      const mean = Math.round(results.reduce((a, v) => a + v, 0) / mcSims);
      const negCount = results.filter(v => v < 0).length;
      const hist = [];
      const mn = Math.min(...results);
      const mx = Math.max(...results);
      const bw = (mx - mn) / 20;
      for (let b = 0; b < 20; b++) {
        const lo = mn + b * bw;
        const hi = lo + bw;
        const ct = results.filter(v => v >= lo && v < hi).length;
        hist.push({
          range: fm(Math.round(lo)),
          count: ct,
          lo,
          hi
        });
      }
      setMcRuns({
        p5,
        p25,
        p50,
        p75,
        p95,
        mean,
        negCount,
        negPct: (negCount / mcSims * 100).toFixed(1),
        hist,
        var95: p5,
        es: Math.round(results.slice(0, Math.floor(mcSims * 0.05)).reduce((a, v) => a + v, 0) / Math.floor(mcSims * 0.05)),
        total: mcSims
      });
      setMcL(false);
    }, 100);
  }, [EQ, NOI, TASSETS, DEBT, wRate, mcSims]);

  // ── INVESTOR RELATIONS ──
  const irData = FUND_OVERVIEW.investors.map(inv => {
    const months = 12;
    const monthlyRate = inv.taux / 100 / 12;
    const intAnnual = inv.type === "Composé" ? inv.cap * (Math.pow(1 + monthlyRate, months) - 1) : inv.cap * inv.taux / 100;
    const isOverdue = inv.ech === "Over" || inv.ech !== "—" && inv.ech < "2026-04";
    return {
      ...inv,
      intAnnual: Math.round(intAnnual),
      intMonthly: Math.round(intAnnual / 12),
      isOverdue
    };
  });
  const totalIntAnnual = irData.reduce((a, inv) => a + inv.intAnnual, 0);
  const totalIntMonthly = Math.round(totalIntAnnual / 12);
  const spreadNet = NOI > 0 ? ((NOI + OPNET) / TASSETS * 100 - FUND_OVERVIEW.tauxMoyen).toFixed(2) : "—";

  // ── TAX ──
  const ccaRates = {
    "Multi": 4,
    "Chalet": 4,
    "Chalet Premium": 4,
    "Terrain": 0,
    "Comm": 4,
    "Fin": 0,
    "Liq": 0
  };
  const taxData = pr.filter(p => p.v > 0 && ccaRates[p.t] > 0).map(p => {
    const ccaRate = ccaRates[p.t] || 0;
    const ccaAnnual = p.v * ccaRate / 100;
    const taxSaved = ccaAnnual * 0.265;
    return {
      n: p.n,
      t: p.t,
      v: p.v,
      ccaRate,
      ccaAnnual: Math.round(ccaAnnual),
      taxSaved: Math.round(taxSaved)
    };
  });
  const totalCCA = taxData.reduce((a, t) => a + t.ccaAnnual, 0);
  const totalTaxSaved = taxData.reduce((a, t) => a + t.taxSaved, 0);
  const updateOp = (i, f, v) => {
    setOp(p => {
      const n = [...p];
      n[i] = {
        ...n[i],
        [f]: v
      };
      if (f === "rev" || f === "net") n[i].mg = n[i].rev > 0 ? parseFloat((n[i].net / n[i].rev * 100).toFixed(1)) : 0;
      if (f === "sect") {
        const sm = SECTOR_MULTIPLES[v];
        if (sm) n[i].mult = sm.mid;
      }
      return n;
    });
  };

  // ── CAPITAL ALLOCATION SCORING ──
  const capitalOptions = [...pr.filter(p => p.d > 0 && p.d / p.v > 0.7).map(p => ({
    action: `Paydown ${p.n}`,
    type: "Delever",
    roi: p.taux + 2 || 6,
    risk: -15,
    impact: `LTV ${pc(p.d / p.v)} → réduction`,
    priority: p.d / p.v > 0.8 ? 95 : 80,
    color: C.am
  })), ...(std > 0 ? [{
    action: "Rembourser dette CT",
    type: "Delever",
    roi: stdRate,
    risk: -20,
    impact: `${fm(std)} @ ${stdRate}% — coût élevé`,
    priority: 98,
    color: C.rd
  }] : []), ...acqs.filter(a => a.mdf > 0).map(a => ({
    action: `Acquérir: ${a.n}`,
    type: "Acquire",
    roi: a.apprPrev || 5,
    risk: 10,
    impact: `MDF ${fm(a.mdf)} · ${a.type}`,
    priority: 75,
    color: C.g
  })), ...pr.filter(p => p.noi > 0 && p.capex > 0).slice(0, 2).map(p => ({
    action: `Capex: ${p.n}`,
    type: "Optimize",
    roi: (p.noiGr || 3) + 2,
    risk: 5,
    impact: `NOI +${p.noiGr || 3}%/an via améliorations`,
    priority: 60,
    color: C.cy
  }))].sort((a, b) => b.priority - a.priority);

  // ── MATURITY WALL ──
  const maturities = pr.filter(p => p.maturity > 0).map(p => ({
    n: p.n,
    year: p.maturity,
    debt: p.d,
    rate: p.taux,
    estNewRate: p.maturity <= 2027 ? 4.8 : p.maturity <= 2029 ? 4.3 : 4.0
  })).sort((a, b) => a.year - b.year);
  const matWallData = {};
  maturities.forEach(m => {
    if (!matWallData[m.year]) matWallData[m.year] = {
      year: m.year,
      total: 0,
      count: 0
    };
    matWallData[m.year].total += m.debt;
    matWallData[m.year].count += 1;
  });

  // ── CONCENTRATION ──
  const byLoc = {};
  pr.forEach(p => {
    if (p.loc !== "—") {
      byLoc[p.loc] = (byLoc[p.loc] || 0) + p.v;
    }
  });
  const byType = {};
  pr.forEach(p => {
    byType[p.t] = (byType[p.t] || 0) + p.v;
  });
  const ts = id => ({
    padding: "5px 8px",
    border: "none",
    cursor: "pointer",
    fontFamily: M,
    fontSize: 7,
    fontWeight: 600,
    letterSpacing: 0.8,
    background: tab === id ? C.g + "18" : "transparent",
    borderTop: tab === id ? "2px solid " + C.g : "2px solid transparent",
    color: tab === id ? C.g : C.dm,
    whiteSpace: "nowrap"
  });
  const kpi = (l, v, c) => <div key={l} style={{
    background: C.p2,
    border: "1px solid " + C.bd,
    borderRadius: 3,
    padding: "5px 6px"
  }}> <div style={{
      fontSize: 6,
      color: C.ft,
      fontFamily: M,
      letterSpacing: 1
    }}>{l}</div> <div style={{
      fontSize: 13,
      fontWeight: 700,
      fontFamily: M,
      color: c
    }}>{v}</div></div>;
  const riskScenarios = [{
    name: "Base Case",
    noiAdj: 0,
    assetAdj: 0,
    opcoAdj: 0,
    rateAdj: 0,
    color: C.bl
  }, {
    name: "Récession légère",
    noiAdj: -10,
    assetAdj: -5,
    opcoAdj: -15,
    rateAdj: 0.5,
    color: C.am
  }, {
    name: "Hausse taux +200bps",
    noiAdj: 0,
    assetAdj: -10,
    opcoAdj: -5,
    rateAdj: 2.0,
    color: C.or
  }, {
    name: "Correction -20%",
    noiAdj: -15,
    assetAdj: -20,
    opcoAdj: -10,
    rateAdj: 0,
    color: C.rd
  }, {
    name: "Crise combinée",
    noiAdj: -20,
    assetAdj: -25,
    opcoAdj: -25,
    rateAdj: 2.0,
    color: "#C62828"
  }, {
    name: "Haussier",
    noiAdj: 10,
    assetAdj: 10,
    opcoAdj: 20,
    rateAdj: -0.5,
    color: C.g
  }];
  return <div style={{
    background: C.bg,
    color: C.tx,
    minHeight: "100vh",
    fontFamily: S
  }}> <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" /> <div style={{
      background: C.p1,
      display: "flex",
      gap: 12,
      padding: "2px 14px",
      borderBottom: "1px solid " + C.bd + "33",
      overflow: "hidden",
      alignItems: "center"
    }}>{[["BoC", "2.25%", C.am], ["QC", "$535K +7.1%", C.g], ["MTL", "+6.1%", C.g], ["GTA", "-7.9%", C.rd], ["4XP", fm(EQ), EQ > 0 ? C.g : C.rd], ["LTV", pc(gLTV), gLTV > 0.7 ? C.rd : C.am], ["W.AVG", wRate.toFixed(2) + "%", C.cy], ["UNITS", String(totalUnits), C.bl]].map(([l, v, cl]) => <div key={l} style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        whiteSpace: "nowrap"
      }}> <span style={{
          fontSize: 6.5,
          color: C.ft,
          fontFamily: M
        }}>{l}</span> <span style={{
          fontSize: 8.5,
          color: cl,
          fontFamily: M,
          fontWeight: 600
        }}>{v}</span></div>)}</div> <div style={{
      background: C.p1,
      padding: "0 14px"
    }}> <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 36
      }}> <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8
        }}> <div style={{
            background: "linear-gradient(135deg," + C.g + "," + C.gd + ")",
            borderRadius: 2,
            padding: "2px 6px"
          }}> <span style={{
              fontSize: 10,
              fontWeight: 800,
              color: C.bg,
              fontFamily: M
            }}>BB</span></div> <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.wh
          }}>BLOOMBERG</span> <span style={{
            fontSize: 9,
            color: C.dm
          }}>Quantum</span> <span style={{
            color: C.ft
          }}>|</span> <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.cy
          }}>4XP REAL ESTATE</span> <Tg c={C.bl}>PRIVATE</Tg> <Tg c={C.pu}>CIO v6</Tg></div> <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>{[["BLEND", fm(blend), C.cy], ["FINAL", fm(final), C.g]].map(([l, v, cl]) => <div key={l} style={{
            textAlign: "right"
          }}> <div style={{
              fontSize: 6,
              color: C.ft,
              fontFamily: M,
              letterSpacing: 1
            }}>{l}</div> <div style={{
              fontSize: 10,
              color: cl,
              fontWeight: 600,
              fontFamily: M
            }}>{v}</div></div>)} <span style={{
            fontSize: 7,
            color: C.ft,
            fontFamily: M
          }}>{ck.toLocaleTimeString()}</span> <div style={{
            display: "flex",
            gap: 3
          }}> <button onClick={exportJSON} style={{
              padding: "2px 6px",
              border: `1px solid ${C.g}44`,
              borderRadius: 2,
              background: C.g + "12",
              color: C.g,
              fontFamily: M,
              fontSize: 6,
              fontWeight: 600,
              cursor: "pointer"
            }}>EXPORT</button> <button onClick={() => triggerImport()} style={{
              padding: "2px 6px",
              border: `1px solid ${C.cy}44`,
              borderRadius: 2,
              background: C.cy + "12",
              color: C.cy,
              fontFamily: M,
              fontSize: 6,
              fontWeight: 600,
              cursor: "pointer"
            }}>IMPORT</button> <button onClick={signOut} style={{
              padding: "2px 6px",
              border: `1px solid ${C.rd}44`,
              borderRadius: 2,
              background: C.rd + "12",
              color: C.rd,
              fontFamily: M,
              fontSize: 6,
              fontWeight: 600,
              cursor: "pointer"
            }}>LOGOUT</button></div> <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: saveStatus === "saved" ? C.g : saveStatus === "saving" || saveStatus === "pending" ? C.am : saveStatus === "error" ? C.rd : C.ft,
              transition: "background 0.3s"
            }} />
            <span style={{ fontSize: 6, color: C.ft, fontFamily: M }}>
              {user?.email?.split("@")[0]}
            </span>
          </div> <input id="_4xp_import" type="file" accept=".json" onChange={importJSON} style={{
            display: "none"
          }} /></div></div> <div style={{
        display: "flex",
        overflowX: "auto"
      }}>{[["dash", "DASH"], ["port", "PORTFOLIO"], ["opco", "OPCOS"], ["acq", "ACQ & DEV"], ["val", "VALUATION"], ["hypo", "HYPOTHÈQUES"], ["cfo", "CFO"], ["perf", "PERF"], ["ir", "IR"], ["fund", "FUND"], ["org", "ORG"], ["mkt", "MARKET"], ["risk", "RISK"]].map(([id, l]) => <button key={id} onClick={() => setTab(id)} style={ts(id)}>{l}</button>)}</div></div> <div style={{
      padding: "10px 14px",
      maxWidth: 1440,
      margin: "0 auto"
    }}>{tab === "dash" && <div> <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 5,
          marginBottom: 8
        }}>{kpi("ASSETS", fm(TASSETS), C.wh)}{kpi("DEBT", fm(DEBT), C.rd)}{kpi("NAV", fm(EQ), EQ > 0 ? C.g : C.rd)}{kpi("NOI", fm(NOI), C.am)}{kpi("OPCO NET", fm(OPNET), C.cy)}{kpi("EBITDA", fm(EB), C.wh)}{kpi("LTV", pc(gLTV), gLTV > 0.7 ? C.rd : C.am)}{kpi("DSCR", (NOI / DS).toFixed(2) + "x", C.g)}</div> <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 7
        }}> <div style={bx}> <Hd>Valuation</Hd>{[["NAV (Immobilier net)", RE_NET, C.bl], ["EV (Valeur OpCos)", OPCO_VAL, C.cy]].map(([l, v, cl]) => <div key={l} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: "1px solid " + C.bd + "22"
            }}> <span style={{
                fontSize: 9.5
              }}>{l}</span> <span style={{
                fontSize: 11,
                fontWeight: 700,
                fontFamily: M,
                color: cl
              }}>{fm(v)}</span></div>)} <div style={{
              padding: "6px 0 2px",
              borderTop: "1px solid " + C.g + "33"
            }}> <div style={{
                display: "flex",
                justifyContent: "space-between"
              }}> <span style={{
                  fontSize: 10,
                  fontWeight: 700
                }}>NAV + EV = TOTAL</span> <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: M,
                  color: C.g
                }}>{fm(RE_NET + OPCO_VAL)}</span></div></div> <div style={{
              marginTop: 6,
              fontSize: 7,
              color: C.dm,
              fontFamily: M
            }}>Détail OpCos:</div>{op.map((o, i) => <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "2px 0",
              borderBottom: "1px solid " + C.bd + "08"
            }}> <span style={{
                fontSize: 7.5,
                color: C.tx
              }}>{o.n}</span> <span style={{
                fontSize: 8,
                fontFamily: M,
                color: C.cy
              }}>{fm(o.net * o.mult)}</span></div>)}</div> <div style={bx}> <Hd>Unit Economics</Hd>{[["Portes totales", totalUnits, C.bl], ["NOI / Porte", totalUnits > 0 ? fm(Math.round(NOI / totalUnits)) : "—", C.g], ["Valeur / Porte", totalUnits > 0 ? fm(Math.round(TASSETS / totalUnits)) : "—", C.wh], ["Dette / Porte", totalUnits > 0 ? fm(Math.round(DEBT / totalUnits)) : "—", C.rd], ["Equity / Porte", totalUnits > 0 ? fm(Math.round(EQ / totalUnits)) : "—", C.cy]].map(([l, v, cl]) => <div key={l} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "3px 0",
              borderBottom: "1px solid " + C.bd + "11"
            }}> <span style={{
                fontSize: 9
              }}>{l}</span> <span style={{
                fontSize: 10,
                fontWeight: 600,
                fontFamily: M,
                color: cl
              }}>{v}</span></div>)}</div> <div style={bx}> <Hd>Prochaines maturités</Hd>{maturities.slice(0, 5).map(m => <div key={m.n} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "3px 0",
              borderBottom: "1px solid " + C.bd + "11",
              alignItems: "center"
            }}> <div> <div style={{
                  fontSize: 8.5
                }}>{m.n}</div> <div style={{
                  fontSize: 6.5,
                  color: C.ft,
                  fontFamily: M
                }}>{m.rate}% → ~{m.estNewRate}%</div></div> <div style={{
                textAlign: "right"
              }}> <Tg c={m.year <= 2027 ? C.rd : m.year <= 2029 ? C.am : C.g}>{m.year}</Tg> <div style={{
                  fontSize: 7,
                  color: C.dm,
                  fontFamily: M
                }}>{fm(m.debt)}</div></div></div>)}</div></div> <div style={{
          ...bx,
          marginTop: 8
        }}> <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8
          }}> <div> <Hd>Projection du bilan — 2026 à 2040</Hd> <div style={{
                fontSize: 7,
                color: C.dm,
                lineHeight: 1.4
              }}>Actifs (appréciation composée par actif) · Dette (amortissement réel par hypothèque) · Valeur nette</div></div> <div style={{
              display: "flex",
              gap: 10,
              alignItems: "center"
            }}>{[["Appr. défaut", projDefAppr, setProjDefAppr, 1, 12, 0.5, "%"], ["Taux défaut", projDefRate, setProjDefRate, 2, 8, 0.25, "%"], ["Amort (ans)", projAmortYrs, setProjAmortYrs, 15, 30, 1, "a"]].map(([l, v, fn, mn, mx, st, su]) => <div key={l} style={{
                textAlign: "center"
              }}> <div style={{
                  fontSize: 6,
                  color: C.ft,
                  fontFamily: M
                }}>{l}</div> <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3
                }}> <input type="range" min={mn} max={mx} step={st} value={v} onChange={e => fn(Number(e.target.value))} style={{
                    width: 60,
                    accentColor: C.g,
                    height: 3
                  }} /> <span style={{
                    fontSize: 9,
                    fontWeight: 600,
                    fontFamily: M,
                    color: C.g
                  }}>{v}{su}</span></div></div>)}</div></div> <div style={{
            height: 220,
            marginBottom: 10
          }}> <ResponsiveContainer> <AreaChart data={projChartData}> <XAxis dataKey="yr" tick={{
                  fontSize: 8,
                  fill: C.dm
                }} axisLine={{
                  stroke: C.bd
                }} tickLine={false} /> <YAxis tick={{
                  fontSize: 7,
                  fill: C.ft
                }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000000 ? (v / 1000000).toFixed(1) + "M" : Math.round(v / 1000) + "K"} /> <Tooltip content={Tp} /> <Area type="monotone" dataKey="Actifs" stroke={C.bl} fill={C.bl + "12"} strokeWidth={2.5} dot={{
                  r: 0
                }} activeDot={{
                  r: 4,
                  fill: C.bl
                }} /> <Area type="monotone" dataKey="Dette" stroke={C.rd} fill={C.rd + "08"} strokeWidth={2} dot={{
                  r: 0
                }} activeDot={{
                  r: 4,
                  fill: C.rd
                }} /> <Area type="monotone" dataKey="Valeur nette" stroke={C.g} fill={C.g + "10"} strokeWidth={2.5} dot={{
                  r: 0
                }} activeDot={{
                  r: 4,
                  fill: C.g
                }} /> <Legend wrapperStyle={{
                  fontSize: 8,
                  fontFamily: M
                }} /></AreaChart></ResponsiveContainer></div> <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10
          }}> <div> <div style={{
                display: "grid",
                gridTemplateColumns: ".4fr .8fr .8fr .8fr .5fr",
                gap: 2,
                fontSize: 6.5,
                fontFamily: M,
                color: C.dm,
                padding: "2px 0",
                borderBottom: "1px solid " + C.g + "33",
                fontWeight: 700
              }}> <span>ANNÉE</span> <span style={{
                  textAlign: "right"
                }}>ACTIFS</span> <span style={{
                  textAlign: "right"
                }}>DETTE</span> <span style={{
                  textAlign: "right"
                }}>VALEUR NETTE</span> <span style={{
                  textAlign: "right"
                }}>LTV</span></div>{projKeyYears.map((r, i) => <div key={i} style={{
                display: "grid",
                gridTemplateColumns: ".4fr .8fr .8fr .8fr .5fr",
                gap: 2,
                fontSize: 9.5,
                padding: "5px 0",
                borderBottom: "1px solid " + C.bd + "12",
                alignItems: "center"
              }}> <span style={{
                  fontWeight: 700,
                  color: C.wh
                }}>{r.yr}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.bl,
                  fontWeight: 600
                }}>{fm(r.assets)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.rd
                }}>{fm(r.debt)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.g,
                  fontWeight: 700
                }}>{fm(r.nav)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: r.ltv > 0.6 ? C.am : C.g,
                  fontSize: 8
                }}>{pc(r.ltv)}</span></div>)}{projKeyYears.length >= 2 && (() => {
                const first = projKeyYears[0];
                const last = projKeyYears[projKeyYears.length - 1];
                const yrs = last.yr - first.yr;
                const assetCAGR = Math.pow(last.assets / first.assets, 1 / yrs) - 1;
                const navCAGR = first.nav > 0 ? Math.pow(last.nav / first.nav, 1 / yrs) - 1 : 0;
                return <div style={{
                  display: "grid",
                  gridTemplateColumns: ".4fr .8fr .8fr .8fr .5fr",
                  gap: 2,
                  fontSize: 8,
                  padding: "6px 0",
                  borderTop: "1px solid " + C.g + "33",
                  marginTop: 3,
                  fontWeight: 600
                }}> <span style={{
                    color: C.dm
                  }}>CAGR</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.bl
                  }}>{(assetCAGR * 100).toFixed(1)}%</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.g,
                    fontSize: 7
                  }}>↓ {fm(first.debt - last.debt)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.g
                  }}>{(navCAGR * 100).toFixed(1)}%</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.g,
                    fontSize: 7
                  }}>{pc(first.ltv)}→{pc(last.ltv)}</span></div>;
              })()}</div> <div style={{
              padding: "6px 10px",
              background: C.bg,
              borderRadius: 4,
              border: `1px solid ${C.bd}`
            }}> <div style={{
                fontSize: 8,
                color: C.g,
                fontFamily: M,
                letterSpacing: 1,
                marginBottom: 6
              }}>ANALYSE PROJECTION</div>{(() => {
                const f = projKeyYears[0];
                const l = projKeyYears[projKeyYears.length - 1];
                if (!f || !l) return null;
                const yrs = l.yr - f.yr;
                const assetGrowth = ((l.assets - f.assets) / f.assets * 100).toFixed(0);
                const debtReduction = ((f.debt - l.debt) / f.debt * 100).toFixed(0);
                const navGrowth = f.nav > 0 ? ((l.nav - f.nav) / f.nav * 100).toFixed(0) : "∞";
                const assetCAGR = (Math.pow(l.assets / f.assets, 1 / yrs) - 1) * 100;
                const navCAGR = f.nav > 0 ? (Math.pow(l.nav / f.nav, 1 / yrs) - 1) * 100 : 0;
                const lines = [{
                  icon: "▲",
                  cl: C.bl,
                  txt: `Actifs: ${fm(f.assets)} → ${fm(l.assets)} (+${assetGrowth}% sur ${yrs}a, CAGR ${assetCAGR.toFixed(1)}%)`
                }, {
                  icon: "▼",
                  cl: C.g,
                  txt: `Dette: ${fm(f.debt)} → ${fm(l.debt)} (−${debtReduction}% par amortissement composé)`
                }, {
                  icon: "◆",
                  cl: C.g,
                  txt: `Valeur nette: ${fm(f.nav)} → ${fm(l.nav)} (+${navGrowth}%, CAGR ${navCAGR.toFixed(1)}%)`
                }, {
                  icon: "◇",
                  cl: C.cy,
                  txt: `LTV: ${pc(f.ltv)} → ${pc(l.ltv)} (amélioration par double effet)`
                }];
                return lines.map((line, i) => <div key={i} style={{
                  padding: "4px 0",
                  borderBottom: i < lines.length - 1 ? "1px solid " + C.bd + "15" : "none"
                }}> <span style={{
                    color: line.cl,
                    fontSize: 9
                  }}>{line.icon} </span> <span style={{
                    fontSize: 8.5,
                    color: C.tx,
                    lineHeight: 1.5
                  }}>{line.txt}</span></div>);
              })()} <div style={{
                marginTop: 8,
                padding: "5px 6px",
                background: C.p2,
                borderRadius: 3
              }}> <div style={{
                  fontSize: 6.5,
                  color: C.ft,
                  fontFamily: M,
                  letterSpacing: 0.5
                }}>HYPOTHÈSES</div> <div style={{
                  fontSize: 7.5,
                  color: C.dm,
                  lineHeight: 1.6
                }}>Appréciation: par actif (sinon défaut {projDefAppr}%) · Amortissement: par hypothèque (taux réel + terme) · Dette CT ({fm(std)}): projetée flat (conservateur) · Année 0 = 2026 · Calcul composé annuel</div></div></div></div></div></div>}{tab === "port" && <div> <div style={{
          display: "flex",
          gap: 3,
          marginBottom: 8,
          padding: "4px 0",
          borderBottom: "1px solid " + C.bd
        }}>{[["overview", "OVERVIEW"], ["assets", "ACTIFS"], ["debts", "DETTES"], ["insights", "INSIGHTS"]].map(([v, l]) => <span key={v} onClick={() => {
            setPortView(v);
            setDetAsset(null);
            setDetDebt(null);
          }} style={{
            padding: "4px 12px",
            borderRadius: 3,
            fontSize: 8,
            fontFamily: M,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: 1,
            background: portView === v ? C.g + "18" : "transparent",
            color: portView === v ? C.g : C.dm,
            border: `1px solid ${portView === v ? C.g + "44" : "transparent"}`
          }}>{l}</span>)}</div>{detAsset !== null && (() => {
          const i = detAsset;
          const p = pr[i];
          if (!p) return null;
          const U = (f, v) => updatePr(i, f, v);
          const eq = p.v - p.d;
          const mdf = p.pxAcq > 0 ? Math.max(0, p.pxAcq - p.d) : eq;
          const cashReq = mdf + p.capex;
          const opex = Math.max(0, (p.rev || 0) - p.noi);
          const mRate = p.taux > 0 ? p.taux / 100 / 12 : 0;
          const terme = (p.termes || 25) * 12;
          const pmt = p.d > 0 && mRate > 0 ? p.d * mRate / (1 - Math.pow(1 + mRate, -terme)) * 12 : p.pmtHyp || 0;
          const intAn = p.d * (p.taux / 100);
          const princAn = pmt > 0 ? pmt - intAn : 0;
          const dscr = pmt > 0 ? p.noi / pmt : 99;
          const cf = p.noi - pmt;
          const roi = cashReq > 0 ? cf / cashReq * 100 : 0;
          const pLTV = p.v > 0 ? p.d / p.v : 0;
          const breakVac = p.rev > 0 && pmt > 0 ? (p.rev - pmt) / p.rev * 100 : 100;
          const breakRate = p.d > 0 && p.noi > 0 ? p.noi / p.d * 100 : 99;
          const rw = (l, content, bdr) => <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "3px 0",
            borderBottom: "1px solid " + C.bd + (bdr || "08"),
            alignItems: "center"
          }}> <span style={{
              fontSize: 8,
              color: C.ft
            }}>{l}</span>{content}</div>;
          return <div style={{
            ...bx,
            marginBottom: 8,
            borderLeft: "3px solid " + C.bl
          }}> <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8
            }}> <div> <EC value={p.n} type="text" onChange={v => U("n", v)} w={200} color={C.wh} /> <div style={{
                  fontSize: 8,
                  color: C.dm,
                  fontFamily: M
                }}>{p.t} · {p.loc} · Acq: {p.acq}</div></div> <span onClick={() => setDetAsset(null)} style={{
                cursor: "pointer",
                fontSize: 12,
                color: C.dm,
                fontFamily: M
              }}>✕ FERMER</span></div> <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 8
            }}> <div> <div style={{
                  fontSize: 7,
                  color: C.g,
                  fontFamily: M,
                  letterSpacing: 1,
                  marginBottom: 4
                }}>STRUCTURE FINANCIÈRE ✎</div>{rw("Prix d'achat", <EC value={p.pxAcq} onChange={v => U("pxAcq", v)} w={75} color={C.dm} />)}{rw("Mise de fonds", <EC value={mdf} onChange={v => {
                  U("pxAcq", v + p.d);
                }} w={75} color={C.am} />)}{rw("CAPEX", <EC value={p.capex} onChange={v => U("capex", v)} w={75} color={C.rd} />)}{rw("Cash total investi", <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: M,
                  color: C.am
                }}>{fm(cashReq)}</span>, "18")}{rw("Dette (hyp.)", <EC value={p.d} onChange={v => U("d", v)} w={75} color={C.rd} />)}{rw("Taux", <EC value={p.taux} onChange={v => U("taux", v)} w={40} suffix="%" color={C.cy} />)}{rw("Amortissement", <EC value={p.termes || 25} onChange={v => U("termes", v)} w={35} suffix="a" color={C.dm} />)}{rw("LTV", <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  fontFamily: M,
                  color: pLTV > 0.75 ? C.rd : pLTV > 0.65 ? C.am : C.g
                }}>{pLTV > 0 ? pc(pLTV) : "—"}</span>)}</div> <div> <div style={{
                  fontSize: 7,
                  color: C.g,
                  fontFamily: M,
                  letterSpacing: 1,
                  marginBottom: 4
                }}>PERFORMANCE ✎</div>{rw("Revenus bruts/an", <EC value={p.rev || 0} onChange={v => {
                  U("rev", v);
                  if (p.noi === 0 || p.noi === (p.rev || 0)) U("noi", v);
                }} w={75} color={C.wh} />)}{rw("Revenus/mois", <EC value={Math.round((p.rev || 0) / 12)} onChange={v => U("rev", v * 12)} w={75} color={C.dm} />)}{rw("OPEX", <EC value={opex} onChange={v => U("noi", (p.rev || 0) - v)} w={75} color={C.rd} />)}{rw("NOI", <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: M,
                  color: C.g
                }}>{fm(p.noi)}</span>, "18")}{rw("Svc dette/an", <span style={{
                  fontSize: 9,
                  fontFamily: M,
                  color: C.am
                }}>{fm(Math.round(pmt))}</span>)}{rw("Cashflow net", <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: M,
                  color: cf >= 0 ? C.g : C.rd
                }}>{fm(Math.round(cf))}</span>, "18")}{rw("DSCR", <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: M,
                  color: dscr >= 1.25 ? C.g : dscr >= 1 ? C.am : C.rd
                }}>{dscr < 50 ? dscr.toFixed(2) + "x" : "∞"}</span>, "18")}{rw("ROI", <span style={{
                  fontSize: 9,
                  fontFamily: M,
                  color: roi > 8 ? C.g : roi > 3 ? C.am : C.rd
                }}>{roi.toFixed(1)}%</span>)}{rw("Appréciation", <EC value={p.appr} onChange={v => U("appr", v)} w={35} suffix="%" color={C.cy} />)}</div> <div> <div style={{
                  fontSize: 7,
                  color: C.g,
                  fontFamily: M,
                  letterSpacing: 1,
                  marginBottom: 4
                }}>IRR & STRATÉGIE DE SORTIE ✎</div>{rw("Exit Cap Rate", <EC value={p.exitCap || 6.5} onChange={v => U("exitCap", v)} w={35} suffix="%" color={C.cy} />)}{rw("Croiss. loyers", <EC value={p.loyerGr || 4} onChange={v => U("loyerGr", v)} w={30} suffix="%" color={C.am} />)}{rw("Vacance", <EC value={p.vacancy || 0} onChange={v => U("vacancy", v)} w={30} suffix="%" color={C.rd} />)}{rw("Horizon", <span style={{
                  fontSize: 9,
                  fontFamily: M,
                  color: C.dm
                }}>5 ans</span>)}{(() => {
                  const horizon = 5;
                  const lGr = (p.loyerGr || 4) / 100;
                  const exitCapR = (p.exitCap || 6.5) / 100;
                  const vacR = (p.vacancy || 0) / 100;
                  // 5-year projection
                  const yrs = [];
                  let projNoi = p.noi,
                    projDebt = p.d,
                    cumCF = 0;
                  for (let y = 1; y <= horizon; y++) {
                    projNoi = y === 1 ? p.noi : projNoi * (1 + lGr);
                    const adjNoi = projNoi * (1 - vacR);
                    const yrCF = adjNoi - pmt;
                    const yrInt = projDebt * (p.taux / 100);
                    const yrPrinc = pmt > 0 ? Math.min(pmt - yrInt, projDebt) : 0;
                    projDebt = Math.max(0, projDebt - yrPrinc);
                    cumCF += yrCF;
                    yrs.push({
                      y: 2026 + y,
                      noi: Math.round(adjNoi),
                      cf: Math.round(yrCF),
                      debt: Math.round(projDebt),
                      cumCF: Math.round(cumCF)
                    });
                  }
                  const exitVal = exitCapR > 0 ? yrs[horizon - 1].noi / exitCapR : 0;
                  const exitEq = exitVal - yrs[horizon - 1].debt;
                  const moic = cashReq > 0 ? (cumCF + exitEq) / cashReq : 0;
                  // IRR Newton
                  const irrCFs = [-cashReq];
                  yrs.forEach((yr, idx) => {
                    irrCFs.push(idx < horizon - 1 ? yr.cf : yr.cf + exitEq);
                  });
                  let irrVal = 0.12;
                  for (let it = 0; it < 100; it++) {
                    let npv = 0,
                      dnpv = 0;
                    for (let j = 0; j < irrCFs.length; j++) {
                      npv += irrCFs[j] / Math.pow(1 + irrVal, j);
                      dnpv -= j * irrCFs[j] / Math.pow(1 + irrVal, j + 1);
                    }
                    if (Math.abs(dnpv) < 0.001) break;
                    const ni = irrVal - npv / dnpv;
                    if (Math.abs(ni - irrVal) < 0.0001) {
                      irrVal = ni;
                      break;
                    }
                    irrVal = Math.max(-0.5, Math.min(3, ni));
                  }
                  return <React.Fragment> <div style={{
                      marginTop: 6,
                      padding: 6,
                      background: C.bg,
                      borderRadius: 3,
                      border: `1px solid ${C.g}22`
                    }}>{[["IRR", (irrVal * 100).toFixed(1) + "%", irrVal > 0.15 ? C.g : irrVal > 0.08 ? C.cy : C.am], ["MOIC", moic.toFixed(2) + "x", moic > 2 ? C.g : moic > 1.5 ? C.cy : C.am], ["Valeur sortie Y5", fm(Math.round(exitVal)), C.bl], ["Equity sortie", fm(Math.round(exitEq)), C.g], ["CF cumulé 5a", fm(Math.round(cumCF)), cumCF > 0 ? C.g : C.rd]].map(([l, v, cl]) => <div key={l} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "2px 0",
                        borderBottom: "1px solid " + C.bd + "08"
                      }}> <span style={{
                          fontSize: 8,
                          color: C.ft
                        }}>{l}</span> <span style={{
                          fontSize: l === "IRR" || l === "MOIC" ? 11 : 9,
                          fontWeight: l === "IRR" || l === "MOIC" ? 700 : 600,
                          fontFamily: M,
                          color: cl
                        }}>{v}</span></div>)}</div></React.Fragment>;
                })()}</div> <div> <div style={{
                  fontSize: 7,
                  color: C.g,
                  fontFamily: M,
                  letterSpacing: 1,
                  marginBottom: 4
                }}>SENSIBILITÉ IRR</div>{(() => {
                  const calcIRRFor = (exitCapAdj, rateAdj, revAdj) => {
                    const ecr = ((p.exitCap || 6.5) + exitCapAdj) / 100;
                    const newRate = (p.taux + rateAdj) / 100;
                    const mR2 = newRate / 12;
                    const t2 = (p.termes || 25) * 12;
                    const pmt2 = p.d > 0 && mR2 > 0 ? p.d * mR2 / (1 - Math.pow(1 + mR2, -t2)) * 12 : pmt;
                    let pN = p.noi * revAdj,
                      pD = p.d;
                    const cfs = [-cashReq];
                    for (let y = 1; y <= 5; y++) {
                      pN *= 1 + (p.loyerGr || 4) / 100;
                      const aN = pN * (1 - (p.vacancy || 0) / 100);
                      const yCF = aN - pmt2;
                      const yI = pD * newRate;
                      pD = Math.max(0, pD - (pmt2 > 0 ? pmt2 - yI : 0));
                      cfs.push(y < 5 ? yCF : yCF + (ecr > 0 ? aN / ecr : 0) - pD);
                    }
                    let ir = 0.12;
                    for (let it = 0; it < 80; it++) {
                      let np = 0,
                        dn = 0;
                      for (let j = 0; j < cfs.length; j++) {
                        np += cfs[j] / Math.pow(1 + ir, j);
                        dn -= j * cfs[j] / Math.pow(1 + ir, j + 1);
                      }
                      if (Math.abs(dn) < 0.001) break;
                      ir = Math.max(-0.5, Math.min(3, ir - np / dn));
                    }
                    return ir * 100;
                  };
                  const scenarios = [["🟢 Optimiste", 0, 0, 1.1, "Rev +10%"], ["⚪ Base", 0, 0, 1, "Actuel"], ["🟡 Modéré", 0.5, 0.5, 1, "Cap +50bps, Taux +50bps"], ["🔴 Stress", 1, 1, 0.9, "Cap +100, Taux +100, Rev -10%"]];
                  return <React.Fragment>{scenarios.map(([label, ecAdj, rAdj, revM, desc]) => {
                      const sIRR = calcIRRFor(ecAdj, rAdj, revM);
                      return <div key={label} style={{
                        padding: "3px 0",
                        borderBottom: "1px solid " + C.bd + "08"
                      }}> <div style={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}> <span style={{
                            fontSize: 8,
                            color: C.wh
                          }}>{label}</span> <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            fontFamily: M,
                            color: sIRR > 15 ? C.g : sIRR > 8 ? C.cy : sIRR > 0 ? C.am : C.rd
                          }}>{sIRR.toFixed(1)}%</span></div> <div style={{
                          fontSize: 6.5,
                          color: C.ft
                        }}>{desc}</div></div>;
                    })} <div style={{
                      marginTop: 6,
                      fontSize: 7,
                      color: C.ft,
                      fontFamily: M
                    }}>Cap Rate sortie → IRR</div>{[5, 5.5, 6, 6.5, 7, 7.5, 8].map(ec => {
                      const sIRR = calcIRRFor(ec - (p.exitCap || 6.5), 0, 1);
                      return <div key={ec} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "1px 0",
                        background: ec === (p.exitCap || 6.5) ? C.g + "08" : "transparent"
                      }}> <span style={{
                          fontSize: 7.5,
                          color: ec === (p.exitCap || 6.5) ? C.wh : C.ft
                        }}>{ec}%{ec === (p.exitCap || 6.5) ? " ←" : ""}</span> <span style={{
                          fontSize: 8,
                          fontFamily: M,
                          fontWeight: 600,
                          color: sIRR > 15 ? C.g : sIRR > 8 ? C.cy : C.am
                        }}>{sIRR.toFixed(1)}%</span></div>;
                    })}</React.Fragment>;
                })()}</div></div>{(() => {
              const horizon = 5;
              const lGr = (p.loyerGr || 4) / 100;
              const exitCapR = (p.exitCap || 6.5) / 100;
              const vacR = (p.vacancy || 0) / 100;
              const yrs = [];
              let pN = p.noi,
                pD = p.d,
                cum = 0;
              for (let y = 1; y <= horizon; y++) {
                pN = y === 1 ? p.noi : pN * (1 + lGr);
                const aN = pN * (1 - vacR);
                const yCF = aN - pmt;
                const yI = pD * (p.taux / 100);
                const yP = pmt > 0 ? Math.min(pmt - yI, pD) : 0;
                pD = Math.max(0, pD - yP);
                cum += yCF;
                yrs.push({
                  y: 2026 + y,
                  rev: Math.round(p.rev ? p.rev * Math.pow(1 + lGr, y) : 0),
                  noi: Math.round(aN),
                  pmt: Math.round(pmt),
                  cf: Math.round(yCF),
                  debt: Math.round(pD),
                  cum: Math.round(cum)
                });
              }
              return <div style={{
                marginTop: 8
              }}> <div style={{
                  fontSize: 7,
                  color: C.g,
                  fontFamily: M,
                  letterSpacing: 1,
                  marginBottom: 3
                }}>PROJECTION 5 ANS</div> <div style={{
                  display: "grid",
                  gridTemplateColumns: ".4fr .7fr .7fr .6fr .7fr .7fr .7fr",
                  gap: 2,
                  fontSize: 6.5,
                  fontFamily: M,
                  color: C.dm,
                  padding: "2px 0",
                  borderBottom: "1px solid " + C.g + "33",
                  fontWeight: 700
                }}> <span>ANNÉE</span> <span style={{
                    textAlign: "right"
                  }}>REVENUS</span> <span style={{
                    textAlign: "right"
                  }}>NOI</span> <span style={{
                    textAlign: "right"
                  }}>SVC DETTE</span> <span style={{
                    textAlign: "right"
                  }}>CASHFLOW</span> <span style={{
                    textAlign: "right"
                  }}>SOLDE HYP</span> <span style={{
                    textAlign: "right"
                  }}>CF CUMULÉ</span></div>{yrs.map((r, idx) => <div key={idx} style={{
                  display: "grid",
                  gridTemplateColumns: ".4fr .7fr .7fr .6fr .7fr .7fr .7fr",
                  gap: 2,
                  fontSize: 9,
                  padding: "3px 0",
                  borderBottom: "1px solid " + C.bd + "10"
                }}> <span style={{
                    fontWeight: 600,
                    color: C.wh
                  }}>{r.y}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M
                  }}>{fm(r.rev)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.g
                  }}>{fm(r.noi)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.am
                  }}>{fm(r.pmt)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    fontWeight: 600,
                    color: r.cf >= 0 ? C.g : C.rd
                  }}>{fm(r.cf)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.rd
                  }}>{fm(r.debt)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: r.cum >= 0 ? C.g : C.rd
                  }}>{fm(r.cum)}</span></div>)}</div>;
            })()}</div>;
        })()}{detDebt !== null && (() => {
          const p = pr.filter(x => x.d > 0)[detDebt];
          if (!p) return null;
          const mRate = p.taux / 100 / 12;
          const terme = (p.termes || 25) * 12;
          const pmt = mRate > 0 ? p.d * mRate / (1 - Math.pow(1 + mRate, -terme)) : 0;
          const pmtAn = pmt * 12;
          const intAn = p.d * (p.taux / 100);
          const princAn = pmtAn - intAn;
          const totalCost = pmt * terme;
          const totalInt = totalCost - p.d;
          const pLTV = p.v > 0 ? p.d / p.v : 0;
          // Amortization schedule (first 5 years)
          const amortSched = [];
          let bal = p.d;
          for (let y = 1; y <= 5 && bal > 0; y++) {
            const yrInt = bal * (p.taux / 100);
            const yrPrinc = Math.min(pmtAn - yrInt, bal);
            bal = Math.max(0, bal - yrPrinc);
            amortSched.push({
              y: 2025 + y,
              int: Math.round(yrInt),
              princ: Math.round(yrPrinc),
              bal: Math.round(bal),
              pmt: Math.round(pmtAn)
            });
          }
          return <div style={{
            ...bx,
            marginBottom: 8,
            borderLeft: "3px solid " + C.rd
          }}> <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8
            }}> <div> <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.wh
                }}>Dette — {p.n}</div> <div style={{
                  fontSize: 8,
                  color: C.dm,
                  fontFamily: M
                }}>{p.t} · Éch: {p.maturity || "—"} · {p.loc}</div></div> <span onClick={() => setDetDebt(null)} style={{
                cursor: "pointer",
                fontSize: 12,
                color: C.dm,
                fontFamily: M
              }}>✕ FERMER</span></div> <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1.5fr",
              gap: 10
            }}> <div> <div style={{
                  fontSize: 7,
                  color: C.rd,
                  fontFamily: M,
                  letterSpacing: 1,
                  marginBottom: 4
                }}>STRUCTURE</div>{[["Solde actuel", fm(p.d), C.rd], ["Taux", p.taux + "% fixe", C.cy], ["Amortissement", (p.termes || 25) + " ans", C.dm], ["Échéance", p.maturity || "—", p.maturity && p.maturity <= 2028 ? C.rd : C.g], ["Pmt mensuel", fm(Math.round(pmt)), C.am], ["Pmt annuel", fm(Math.round(pmtAn)), C.am], ["Portion intérêts/an", fm(Math.round(intAn)), C.rd], ["Portion capital/an", fm(Math.round(princAn)), C.g], ["Coût total dette", fm(Math.round(totalCost)), C.rd], ["Intérêts totaux", fm(Math.round(totalInt)), C.rd], ["LTV", pc(pLTV), pLTV > 0.75 ? C.rd : C.g]].map(([l, v, cl]) => <div key={l} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px 0",
                  borderBottom: "1px solid " + C.bd + "08"
                }}> <span style={{
                    fontSize: 8,
                    color: C.ft
                  }}>{l}</span> <span style={{
                    fontSize: 9,
                    fontWeight: 600,
                    fontFamily: M,
                    color: cl
                  }}>{v}</span></div>)}</div> <div> <div style={{
                  fontSize: 7,
                  color: C.rd,
                  fontFamily: M,
                  letterSpacing: 1,
                  marginBottom: 4
                }}>IMPACT PORTEFEUILLE</div>{[["DSCR actif", p.noi > 0 && pmtAn > 0 ? (p.noi / pmtAn).toFixed(2) + "x" : "∞", p.noi / pmtAn >= 1.25 ? C.g : C.am], ["% dette totale", pc(p.d / DEBT), C.dm], ["NOI couverture", fm(p.noi), C.g], ["Marge sécurité", fm(Math.round(p.noi - pmtAn)), p.noi > pmtAn ? C.g : C.rd]].map(([l, v, cl]) => <div key={l} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px 0",
                  borderBottom: "1px solid " + C.bd + "08"
                }}> <span style={{
                    fontSize: 8,
                    color: C.ft
                  }}>{l}</span> <span style={{
                    fontSize: 9,
                    fontWeight: 600,
                    fontFamily: M,
                    color: cl
                  }}>{v}</span></div>)} <div style={{
                  fontSize: 7,
                  color: C.rd,
                  fontFamily: M,
                  letterSpacing: 1,
                  marginTop: 8,
                  marginBottom: 4
                }}>SENSIBILITÉ TAUX</div>{[p.taux - 1, p.taux, p.taux + 1, p.taux + 2, p.taux + 3].map(r => {
                  const mR = r / 100 / 12;
                  const newPmt = mR > 0 ? p.d * mR / (1 - Math.pow(1 + mR, -terme)) * 12 : 0;
                  const delta = newPmt - pmtAn;
                  return <div key={r} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.bd + "08",
                    background: r === p.taux ? C.g + "08" : "transparent"
                  }}> <span style={{
                      fontSize: 8,
                      color: r === p.taux ? C.wh : C.ft
                    }}>{r.toFixed(1)}%</span> <span style={{
                      fontSize: 8,
                      fontFamily: M,
                      color: C.am
                    }}>{fm(Math.round(newPmt))}/an</span> <span style={{
                      fontSize: 7,
                      fontFamily: M,
                      color: delta > 0 ? C.rd : C.g
                    }}>{delta > 0 ? "+" : ""}{fm(Math.round(delta))}</span></div>;
                })}</div> <div> <div style={{
                  fontSize: 7,
                  color: C.rd,
                  fontFamily: M,
                  letterSpacing: 1,
                  marginBottom: 4
                }}>CALENDRIER D'AMORTISSEMENT</div> <div style={{
                  display: "grid",
                  gridTemplateColumns: ".4fr .6fr .6fr .6fr .7fr",
                  gap: 2,
                  fontSize: 6.5,
                  fontFamily: M,
                  color: C.dm,
                  padding: "2px 0",
                  borderBottom: "1px solid " + C.g + "33",
                  fontWeight: 700
                }}> <span>ANNÉE</span> <span style={{
                    textAlign: "right"
                  }}>PMT</span> <span style={{
                    textAlign: "right"
                  }}>INTÉRÊTS</span> <span style={{
                    textAlign: "right"
                  }}>CAPITAL</span> <span style={{
                    textAlign: "right"
                  }}>SOLDE</span></div>{amortSched.map((r, i) => <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: ".4fr .6fr .6fr .6fr .7fr",
                  gap: 2,
                  fontSize: 8.5,
                  padding: "3px 0",
                  borderBottom: "1px solid " + C.bd + "10"
                }}> <span style={{
                    fontWeight: 600,
                    color: C.wh
                  }}>{r.y}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.am
                  }}>{fm(r.pmt)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.rd
                  }}>{fm(r.int)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.g
                  }}>{fm(r.princ)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.wh
                  }}>{fm(r.bal)}</span></div>)}</div></div></div>;
        })()}{portView === "insights" && (() => {
          const ranked = pr.filter(p => p.v > 0 && p.t !== "Liq" && p.t !== "Fin").map(p => {
            const cf = p.noi - (p.pmtHyp || 0);
            const eq = p.pxAcq > 0 ? Math.max(1, p.pxAcq - p.d + p.capex) : Math.max(1, p.v - p.d);
            const roi = cf / eq * 100;
            const ltv = p.v > 0 ? p.d / p.v : 0;
            const dscr = p.pmtHyp > 0 ? p.noi / p.pmtHyp : 99;
            const intCost = p.d * p.taux / 100;
            return {
              n: p.n,
              t: p.t,
              v: p.v,
              roi,
              cf,
              ltv,
              dscr,
              intCost,
              appr: p.appr,
              d: p.d,
              taux: p.taux
            };
          });
          const best = [...ranked].sort((a, b) => b.roi - a.roi)[0];
          const riskiest = [...ranked].sort((a, b) => a.dscr - b.dscr)[0];
          const costliest = [...ranked].sort((a, b) => b.intCost - a.intCost)[0];
          return <div style={bx}> <Hd>Portfolio Insights</Hd> <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginBottom: 10
            }}>{[["ACTIF LE PLUS PERFORMANT", best, C.g, `ROI ${best.roi.toFixed(1)}% · CF ${fm(Math.round(best.cf))}/an · Appr ${best.appr}%`], ["ACTIF LE PLUS RISQUÉ", riskiest, C.rd, `DSCR ${riskiest.dscr < 50 ? riskiest.dscr.toFixed(2) + "x" : "∞"} · LTV ${pc(riskiest.ltv)}`], ["DETTE LA PLUS COÛTEUSE", costliest, C.am, `Int: ${fm(Math.round(costliest.intCost))}/an · Taux ${costliest.taux}% · Solde ${fm(costliest.d)}`]].map(([title, asset, cl, detail], i) => <div key={i} style={{
                padding: 10,
                background: cl + "06",
                border: `1px solid ${cl}18`,
                borderRadius: 4
              }}> <div style={{
                  fontSize: 7,
                  color: cl,
                  fontFamily: M,
                  letterSpacing: 1,
                  marginBottom: 4
                }}>{title}</div> <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.wh,
                  marginBottom: 2
                }}>{asset.n}</div> <div style={{
                  fontSize: 8,
                  color: C.dm
                }}>{asset.t} · Valeur {fm(asset.v)}</div> <div style={{
                  fontSize: 8,
                  color: cl,
                  marginTop: 4
                }}>{detail}</div></div>)}</div> <div style={{
              fontSize: 7,
              color: C.g,
              fontFamily: M,
              letterSpacing: 0.5,
              marginBottom: 4
            }}>OPPORTUNITÉS D'OPTIMISATION</div> <div style={{
              fontSize: 8.5,
              color: C.tx,
              lineHeight: 1.7
            }}>{ranked.filter(a => a.dscr < 1.25 && a.dscr > 0 && a.dscr < 50).length > 0 && <React.Fragment> <span style={{
                  color: C.am
                }}>●</span>  <span style={{
                  fontWeight: 600
                }}>Refinancement:</span> {ranked.filter(a => a.dscr < 1.25 && a.dscr > 0 && a.dscr < 50).map(a => a.n).join(", ")} — DSCR serré, explorer taux plus bas ou amortissement plus long. </React.Fragment>}{ranked.filter(a => a.ltv > 0.75).length > 0 && <React.Fragment> <span style={{
                  color: C.rd
                }}>●</span>  <span style={{
                  fontWeight: 600
                }}>Deleveraging:</span> {ranked.filter(a => a.ltv > 0.75).map(a => a.n + " (" + pc(a.ltv) + ")").join(", ")} — LTV élevé, considérer apport additionnel. </React.Fragment>}{ranked.filter(a => a.roi < 3 && a.roi > 0).length > 0 && <React.Fragment> <span style={{
                  color: C.cy
                }}>●</span>  <span style={{
                  fontWeight: 600
                }}>Repositionnement:</span> {ranked.filter(a => a.roi < 3 && a.roi > 0).map(a => a.n).join(", ")} — ROI faible, augmenter loyers ou réduire charges. </React.Fragment>} <span style={{
                color: C.g
              }}>●</span>  <span style={{
                fontWeight: 600
              }}>Meilleure allocation:</span>{" concentrer le capital sur les actifs \xE0 IRR > 12% pour maximiser le rendement pond\xE9r\xE9."}</div></div>;
        })()}{portView === "debts" && <div style={bx}> <Hd>Dettes & Hypothèques — Cliquer pour détail</Hd> <div style={{
            display: "grid",
            gridTemplateColumns: "1.4fr .7fr .5fr .5fr .5fr .5fr .4fr",
            gap: 2,
            fontSize: 6.5,
            fontFamily: M,
            color: C.dm,
            padding: "2px 0",
            borderBottom: "1px solid " + C.g + "33",
            fontWeight: 700
          }}> <span>ACTIF ASSOCIÉ</span> <span style={{
              textAlign: "right"
            }}>SOLDE</span> <span style={{
              textAlign: "right"
            }}>TAUX</span> <span style={{
              textAlign: "right"
            }}>PMT/AN</span> <span style={{
              textAlign: "right"
            }}>ÉCHÉANCE</span> <span style={{
              textAlign: "right"
            }}>DSCR</span> <span style={{
              textAlign: "right"
            }}>LTV</span></div>{pr.filter(p => p.d > 0).map((p, i) => {
            const pmt = p.pmtHyp || 0;
            const dscr = pmt > 0 ? p.noi / pmt : 99;
            const ltv = p.v > 0 ? p.d / p.v : 0;
            return <div key={i} onClick={() => setDetDebt(i)} style={{
              display: "grid",
              gridTemplateColumns: "1.4fr .7fr .5fr .5fr .5fr .5fr .4fr",
              gap: 2,
              fontSize: 9,
              padding: "5px 0",
              borderBottom: "1px solid " + C.bd + "12",
              cursor: "pointer",
              alignItems: "center"
            }} onMouseEnter={e => e.currentTarget.style.background = C.g + "06"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}> <div> <div style={{
                  fontSize: 9,
                  color: C.wh,
                  fontWeight: 600
                }}>{p.n}</div> <div style={{
                  fontSize: 6.5,
                  color: C.ft
                }}>{p.t} · {p.loc}</div></div> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: C.rd,
                fontWeight: 600
              }}>{fm(p.d)}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: C.cy
              }}>{p.taux}%</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: C.am
              }}>{fm(pmt)}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: p.maturity && p.maturity <= 2028 ? C.rd : C.g
              }}>{p.maturity || "—"}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: dscr >= 1.25 ? C.g : dscr >= 1 ? C.am : C.rd
              }}>{dscr < 50 ? dscr.toFixed(2) + "x" : "∞"}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: ltv > 0.75 ? C.rd : ltv > 0.65 ? C.am : C.g
              }}>{pc(ltv)}</span></div>;
          })}</div>}{portView === "assets" && <div style={bx}> <Hd>Actifs — Cliquer pour fiche détaillée (IRR, MOIC, Exit)</Hd> <div style={{
            display: "grid",
            gridTemplateColumns: "1.5fr .6fr .5fr .45fr .5fr .45fr .4fr .45fr",
            gap: 4,
            fontSize: 6.5,
            fontFamily: M,
            color: C.dm,
            padding: "2px 4px",
            borderBottom: "1px solid " + C.g + "33",
            fontWeight: 700
          }}> <span>ACTIF</span> <span style={{
              textAlign: "right"
            }}>VALEUR</span> <span style={{
              textAlign: "right"
            }}>NOI</span> <span style={{
              textAlign: "right"
            }}>DSCR</span> <span style={{
              textAlign: "right"
            }}>CF/AN</span> <span style={{
              textAlign: "right"
            }}>IRR</span> <span style={{
              textAlign: "right"
            }}>MOIC</span> <span style={{
              textAlign: "right"
            }}>APPR</span></div>{pr.filter(p => p.v > 0).map((p, idx) => {
            const realIdx = pr.indexOf(p);
            const eq = p.pxAcq > 0 ? Math.max(1, p.pxAcq - p.d + p.capex) : Math.max(1, p.v - p.d);
            const mR2 = p.taux > 0 ? p.taux / 100 / 12 : 0;
            const t2 = (p.termes || 25) * 12;
            const pmt2 = p.d > 0 && mR2 > 0 ? p.d * mR2 / (1 - Math.pow(1 + mR2, -t2)) * 12 : p.pmtHyp || 0;
            const cf = p.noi - pmt2;
            const dscr = pmt2 > 0 ? p.noi / pmt2 : 99;
            // Quick IRR
            let pN = p.noi,
              pD = p.d,
              cum = 0;
            const cfs2 = [-eq];
            for (let y = 1; y <= 5; y++) {
              pN *= 1 + (p.loyerGr || 4) / 100;
              const aN = pN * (1 - (p.vacancy || 0) / 100);
              const yCF = aN - pmt2;
              const yI = pD * (p.taux / 100);
              pD = Math.max(0, pD - (pmt2 > 0 ? pmt2 - yI : 0));
              cum += yCF;
              cfs2.push(y < 5 ? yCF : yCF + ((p.exitCap || 6.5) > 0 ? aN / ((p.exitCap || 6.5) / 100) : 0) - pD);
            }
            let ir = 0.12;
            for (let it = 0; it < 60; it++) {
              let np2 = 0,
                dn = 0;
              for (let j = 0; j < cfs2.length; j++) {
                np2 += cfs2[j] / Math.pow(1 + ir, j);
                dn -= j * cfs2[j] / Math.pow(1 + ir, j + 1);
              }
              if (Math.abs(dn) < 0.001) break;
              ir = Math.max(-0.5, Math.min(3, ir - np2 / dn));
            }
            const exitEq = cfs2[5] - (cfs2[5] > cum ? cum : 0);
            const moic = eq > 0 ? (cum + exitEq) / eq : 0;
            return <div key={idx} onClick={() => setDetAsset(realIdx)} style={{
              display: "grid",
              gridTemplateColumns: "1.5fr .6fr .5fr .45fr .5fr .45fr .4fr .45fr",
              gap: 4,
              padding: "6px 4px",
              borderBottom: "1px solid " + C.bd + "12",
              cursor: "pointer",
              alignItems: "center"
            }} onMouseEnter={e => e.currentTarget.style.background = C.g + "06"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}> <div> <div style={{
                  fontSize: 10,
                  color: C.wh,
                  fontWeight: 600
                }}>{p.n}</div> <div style={{
                  fontSize: 7,
                  color: C.ft,
                  fontFamily: M
                }}>{p.t} · {p.loc}</div></div> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: C.bl,
                fontWeight: 600
              }}>{fm(p.v)}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: C.g
              }}>{fm(p.noi)}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: dscr >= 1.25 ? C.g : C.am
              }}>{dscr < 50 ? dscr.toFixed(1) + "x" : "∞"}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: cf >= 0 ? C.g : C.rd
              }}>{fm(Math.round(cf))}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                fontWeight: 700,
                color: ir > 0.15 ? C.g : ir > 0.08 ? C.cy : C.am
              }}>{(ir * 100).toFixed(1)}%</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: moic > 2 ? C.g : C.cy
              }}>{moic.toFixed(2)}x</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: C.cy
              }}>{p.appr}%</span></div>;
          })}</div>}{portView === "overview" && <React.Fragment> <div style={{
            ...bx,
            marginBottom: 8
          }}> <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6
            }}> <Hd>Asset Portfolio</Hd> <div style={{
                display: "flex",
                gap: 8,
                alignItems: "center"
              }}> <button onClick={addProperty} style={{
                  padding: "3px 10px",
                  border: `1px solid ${C.g}44`,
                  borderRadius: 3,
                  background: C.g + "12",
                  color: C.g,
                  fontFamily: M,
                  fontSize: 7,
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: 1
                }}>+ AJOUTER</button> <span style={{
                  fontSize: 7,
                  color: C.dm,
                  fontFamily: M
                }}>DETTE CT:</span> <EC value={std} onChange={v => setStd(v)} w={80} color={C.rd} /> <div style={{
                  padding: "2px 8px",
                  background: C.g + "12",
                  border: `1px solid ${C.g}33`,
                  borderRadius: 3
                }}> <span style={{
                    fontSize: 7,
                    color: C.g,
                    fontFamily: M
                  }}>LTV GLOBAL: {pc(gLTV)}</span></div></div></div> <div style={{
              overflowX: "auto"
            }}> <div style={{
                display: "grid",
                gridTemplateColumns: "1.6fr .7fr .7fr .7fr .6fr .4fr .4fr .4fr .25fr",
                gap: 2,
                fontSize: 6.5,
                fontFamily: M,
                color: C.dm,
                padding: "2px 0",
                borderBottom: "1px solid " + C.g + "33",
                fontWeight: 700,
                minWidth: 800
              }}> <span>PROPERTY</span> <span style={{
                  textAlign: "right"
                }}>VALUE</span> <span style={{
                  textAlign: "right"
                }}>PRIX ACQ.</span> <span style={{
                  textAlign: "right"
                }}>HYPOTHÈQUE</span> <span style={{
                  textAlign: "right"
                }}>CAPEX</span> <span style={{
                  textAlign: "right"
                }}>APPR %</span> <span style={{
                  textAlign: "right"
                }}>VAL +1AN</span> <span style={{
                  textAlign: "right"
                }}>LTV</span> <span /></div>{pr.map((p, i) => {
                const pLTV = p.v > 0 && p.d > 0 ? p.d / p.v : 0;
                const val1 = Math.round(p.v * (1 + p.appr / 100));
                return <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr .7fr .7fr .7fr .6fr .4fr .4fr .4fr .25fr",
                  gap: 2,
                  fontSize: 9,
                  padding: "3px 0",
                  borderBottom: "1px solid " + C.bd + "12",
                  minWidth: 800,
                  alignItems: "center"
                }}> <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}> <EC value={p.n} type="text" onChange={v => updatePr(i, "n", v)} w={120} color={C.wh} /> <SC value={p.t} options={["Terrain", "Chalet", "Chalet Premium", "Multi", "Comm", "Fin", "Liq"]} onChange={v => updatePr(i, "t", v)} /></div> <div style={{
                    textAlign: "right"
                  }}> <EC value={p.v} onChange={v => updatePr(i, "v", v)} color={C.bl} /></div> <div style={{
                    textAlign: "right"
                  }}> <EC value={p.pxAcq} onChange={v => updatePr(i, "pxAcq", v)} color={C.dm} /></div> <div style={{
                    textAlign: "right"
                  }}> <EC value={p.d} onChange={v => updatePr(i, "d", v)} color={p.d ? C.am : C.ft} /></div> <div style={{
                    textAlign: "right"
                  }}> <EC value={p.capex} onChange={v => updatePr(i, "capex", v)} color={C.rd} /></div> <div style={{
                    textAlign: "right"
                  }}> <EC value={p.appr} onChange={v => updatePr(i, "appr", v)} w={30} suffix="%" color={p.appr > 5 ? C.g : p.appr > 0 ? C.am : C.ft} /></div> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.g,
                    fontSize: 8
                  }}>{val1 > 0 ? fm(val1) : "—"}</span> <div style={{
                    textAlign: "right"
                  }}> <span style={{
                      fontFamily: M,
                      fontSize: 8,
                      fontWeight: 600,
                      color: pLTV > 0.75 ? C.rd : pLTV > 0.65 ? C.am : pLTV > 0 ? C.g : C.ft
                    }}>{pLTV > 0 ? pc(pLTV) : "—"}</span></div> <div style={{
                    textAlign: "center"
                  }}> <span onClick={() => removePr(i)} style={{
                      cursor: "pointer",
                      fontSize: 8,
                      color: C.rd + "88",
                      fontFamily: M
                    }}>✕</span></div></div>;
              })} <div style={{
                display: "grid",
                gridTemplateColumns: "1.6fr .7fr .7fr .7fr .6fr .4fr .4fr .4fr .25fr",
                gap: 2,
                fontSize: 10,
                padding: "6px 0",
                borderTop: "1px solid " + C.g + "33",
                marginTop: 3,
                fontWeight: 700,
                minWidth: 800
              }}> <span>TOTAL ({pr.length} actifs)</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.wh
                }}>{fm(TASSETS)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.dm
                }}>{fm(pr.reduce((a, p) => a + p.pxAcq, 0))}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.am
                }}>{fm(LTD)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.rd
                }}>{fm(pr.reduce((a, p) => a + p.capex, 0))}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.g,
                  fontSize: 7
                }}>+{TASSETS > 0 ? (pr.reduce((a, p) => a + p.v * p.appr, 0) / TASSETS).toFixed(1) : "0"}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.g,
                  fontSize: 7
                }}>{fm(Math.round(pr.reduce((a, p) => a + p.v * (1 + p.appr / 100), 0)))}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: gLTV > 0.7 ? C.rd : C.am,
                  fontSize: 8
                }}>{pc(gLTV)}</span> <span /></div></div></div> <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginTop: 8
          }}> <div style={bx}> <Hd>Performance par actif</Hd> <div style={{
                display: "grid",
                gridTemplateColumns: "1.4fr .6fr .6fr .6fr .5fr .5fr",
                gap: 2,
                fontSize: 6.5,
                fontFamily: M,
                color: C.dm,
                padding: "2px 0",
                borderBottom: "1px solid " + C.g + "33",
                fontWeight: 700
              }}> <span>ACTIF</span> <span style={{
                  textAlign: "right"
                }}>REND. MOY</span> <span style={{
                  textAlign: "right"
                }}>MÉDIANE</span> <span style={{
                  textAlign: "right"
                }}>ÉCART-TYPE</span> <span style={{
                  textAlign: "right"
                }}>SHARPE</span> <span style={{
                  textAlign: "right"
                }}>CLASSE</span></div>{(() => {
                const riskData = pr.filter(p => p.v > 0 && p.t !== "Liq").map(p => {
                  const baseReturn = p.appr > 0 ? p.appr : 5;
                  const noiYield = p.v > 0 && p.noi > 0 ? p.noi / p.v * 100 : 0;
                  const totalReturn = baseReturn + noiYield;
                  const leverageFactor = p.d > 0 && p.v > 0 ? 1 + p.d / p.v * 0.3 : 1;
                  const vacancyPenalty = (p.vacancy || 0) * 0.15;
                  const vol = (Math.abs(baseReturn - 5) * 1.2 + vacancyPenalty + p.d / Math.max(1, p.v) * 8 + (p.t === "Terrain" ? 6 : p.t === "Chalet" || p.t === "Chalet Premium" ? 4 : 2)) * leverageFactor;
                  // Simulate 24 monthly returns
                  const seed = p.n.length * 7 + p.v;
                  const returns = [];
                  for (let m = 0; m < 24; m++) {
                    const pseudoRand = Math.sin(seed * (m + 1) * 0.7137) * 0.5 + 0.5;
                    const r = totalReturn / 12 + (pseudoRand - 0.5) * vol / Math.sqrt(12) * 2;
                    returns.push(parseFloat(r.toFixed(3)));
                  }
                  returns.sort((a, b) => a - b);
                  const min = returns[0];
                  const max = returns[returns.length - 1];
                  const q1 = returns[Math.floor(returns.length * 0.25)];
                  const q3 = returns[Math.floor(returns.length * 0.75)];
                  const median = returns[Math.floor(returns.length * 0.5)];
                  const mean = returns.reduce((a, v) => a + v, 0) / returns.length;
                  const stdDev = Math.sqrt(returns.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / returns.length);
                  const sharpe = stdDev > 0 ? (mean * 12 - 3) / (stdDev * Math.sqrt(12)) : 0;
                  const iqr = q3 - q1;
                  const outliers = returns.filter(r => r < q1 - 1.5 * iqr || r > q3 + 1.5 * iqr);
                  const whiskerLo = Math.max(min, q1 - 1.5 * iqr);
                  const whiskerHi = Math.min(max, q3 + 1.5 * iqr);
                  return {
                    n: p.n,
                    t: p.t,
                    returns,
                    min,
                    max,
                    q1,
                    q3,
                    median,
                    mean,
                    stdDev,
                    sharpe,
                    outliers,
                    whiskerLo,
                    whiskerHi,
                    vol,
                    totalReturn,
                    nObs: returns.length
                  };
                });
                return <React.Fragment>{riskData.map((r, i) => {
                    const shCl = r.sharpe > 1 ? C.g : r.sharpe > 0.3 ? C.cy : r.sharpe > 0 ? C.am : C.rd;
                    return <div key={i} style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr .6fr .6fr .6fr .5fr .5fr",
                      gap: 2,
                      fontSize: 9,
                      padding: "3px 0",
                      borderBottom: "1px solid " + C.bd + "12",
                      alignItems: "center"
                    }}> <div> <div style={{
                          fontSize: 8.5,
                          color: C.wh
                        }}>{r.n}</div> <div style={{
                          fontSize: 6.5,
                          color: C.ft,
                          fontFamily: M
                        }}>{r.t} · {r.nObs} obs</div></div> <span style={{
                        textAlign: "right",
                        fontFamily: M,
                        color: r.mean > 0 ? C.g : C.rd
                      }}>{(r.mean * 12).toFixed(1)}%</span> <span style={{
                        textAlign: "right",
                        fontFamily: M,
                        color: C.cy
                      }}>{(r.median * 12).toFixed(1)}%</span> <span style={{
                        textAlign: "right",
                        fontFamily: M,
                        color: r.stdDev > 2 ? C.rd : C.am
                      }}>{(r.stdDev * Math.sqrt(12)).toFixed(1)}%</span> <span style={{
                        textAlign: "right",
                        fontFamily: M,
                        fontWeight: 600,
                        color: shCl
                      }}>{r.sharpe.toFixed(2)}</span> <div style={{
                        textAlign: "right"
                      }}> <Tg c={r.vol < 4 ? C.g : r.vol < 8 ? C.am : C.rd}>{r.vol < 4 ? "LOW" : r.vol < 8 ? "MED" : "HIGH"}</Tg></div></div>;
                  })} <div style={{
                    gridColumn: "1 / -1"
                  }} /></React.Fragment>;
              })()}</div> <div style={bx}> <Hd>Distribution des rendements — Box Plot</Hd> <div style={{
                fontSize: 7,
                color: C.dm,
                marginBottom: 6
              }}>Rendements mensuels simulés (24 obs.) · Axe Y = rendement mensuel %</div>{(() => {
                const riskData = pr.filter(p => p.v > 0 && p.t !== "Liq").map(p => {
                  const baseReturn = p.appr > 0 ? p.appr : 5;
                  const noiYield = p.v > 0 && p.noi > 0 ? p.noi / p.v * 100 : 0;
                  const totalReturn = baseReturn + noiYield;
                  const leverageFactor = p.d > 0 && p.v > 0 ? 1 + p.d / p.v * 0.3 : 1;
                  const vacancyPenalty = (p.vacancy || 0) * 0.15;
                  const vol = (Math.abs(baseReturn - 5) * 1.2 + vacancyPenalty + p.d / Math.max(1, p.v) * 8 + (p.t === "Terrain" ? 6 : p.t === "Chalet" || p.t === "Chalet Premium" ? 4 : 2)) * leverageFactor;
                  const seed = p.n.length * 7 + p.v;
                  const returns = [];
                  for (let m = 0; m < 24; m++) {
                    const pseudoRand = Math.sin(seed * (m + 1) * 0.7137) * 0.5 + 0.5;
                    const r = totalReturn / 12 + (pseudoRand - 0.5) * vol / Math.sqrt(12) * 2;
                    returns.push(parseFloat(r.toFixed(3)));
                  }
                  returns.sort((a, b) => a - b);
                  const q1 = returns[Math.floor(returns.length * 0.25)];
                  const q3 = returns[Math.floor(returns.length * 0.75)];
                  const median = returns[Math.floor(returns.length * 0.5)];
                  const iqr = q3 - q1;
                  const whiskerLo = Math.max(returns[0], q1 - 1.5 * iqr);
                  const whiskerHi = Math.min(returns[returns.length - 1], q3 + 1.5 * iqr);
                  const outliers = returns.filter(r => r < q1 - 1.5 * iqr || r > q3 + 1.5 * iqr);
                  const mean = returns.reduce((a, v) => a + v, 0) / returns.length;
                  const stdDev = Math.sqrt(returns.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / returns.length);
                  return {
                    n: p.n.length > 14 ? p.n.slice(0, 13) + "…" : p.n,
                    t: p.t,
                    q1,
                    q3,
                    median,
                    whiskerLo,
                    whiskerHi,
                    outliers,
                    mean,
                    stdDev,
                    vol
                  };
                });

                // SVG dimensions
                const W = 520,
                  H = 260,
                  padL = 45,
                  padR = 10,
                  padT = 15,
                  padB = 45;
                const plotW = W - padL - padR;
                const plotH = H - padT - padB;
                const n = riskData.length;
                const bw = Math.min(28, plotW / n * 0.6);
                const gap = plotW / n;

                // Y scale
                const allVals = riskData.flatMap(d => [d.whiskerLo, d.whiskerHi, ...d.outliers]);
                const yMin = Math.min(...allVals) - 0.3;
                const yMax = Math.max(...allVals) + 0.3;
                const yScale = v => padT + plotH - (v - yMin) / (yMax - yMin) * plotH;
                const xPos = i => padL + gap * i + gap / 2;

                // Tick values
                const yTicks = [];
                const step = (yMax - yMin) / 6;
                for (let t = yMin; t <= yMax; t += step) yTicks.push(parseFloat(t.toFixed(2)));
                const boxColors = [C.bl, C.g, C.cy, C.am, C.pu, C.bl, C.g, C.cy, C.am, C.pu, C.bl];
                return <svg viewBox={`0 0 ${W} ${H}`} style={{
                  width: "100%",
                  height: "auto"
                }}>{yTicks.map((t, i) => <g key={i}> <line x1={padL} y1={yScale(t)} x2={W - padR} y2={yScale(t)} stroke={C.bd} strokeWidth="0.5" strokeDasharray="2,2" /> <text x={padL - 4} y={yScale(t) + 3} textAnchor="end" fill={C.ft} fontSize="7" fontFamily="JetBrains Mono">{t.toFixed(1)}%</text></g>)} <line x1={padL} y1={yScale(0)} x2={W - padR} y2={yScale(0)} stroke={C.dm} strokeWidth="0.8" />{riskData.map((d, i) => {
                    const x = xPos(i);
                    const cl = boxColors[i % boxColors.length];
                    return <g key={i}> <line x1={x} y1={yScale(d.whiskerHi)} x2={x} y2={yScale(d.whiskerLo)} stroke={cl} strokeWidth="1" /> <line x1={x - bw * 0.3} y1={yScale(d.whiskerHi)} x2={x + bw * 0.3} y2={yScale(d.whiskerHi)} stroke={cl} strokeWidth="1.5" /> <line x1={x - bw * 0.3} y1={yScale(d.whiskerLo)} x2={x + bw * 0.3} y2={yScale(d.whiskerLo)} stroke={cl} strokeWidth="1.5" /> <rect x={x - bw / 2} y={yScale(d.q3)} width={bw} height={yScale(d.q1) - yScale(d.q3)} fill={cl + "18"} stroke={cl} strokeWidth="1.2" rx="1" /> <line x1={x - bw / 2} y1={yScale(d.median)} x2={x + bw / 2} y2={yScale(d.median)} stroke="#fff" strokeWidth="2" /> <circle cx={x} cy={yScale(d.mean)} r="2.5" fill={cl} stroke="#fff" strokeWidth="0.5" />{d.outliers.map((o, j) => <circle key={j} cx={x} cy={yScale(o)} r="2" fill={C.rd} stroke={C.rd} strokeWidth="0.5" opacity="0.7" />)} <text x={x} y={H - 5} textAnchor="middle" fill={C.dm} fontSize="6.5" fontFamily="JetBrains Mono" transform={`rotate(-25, ${x}, ${H - 5})`}>{d.n}</text></g>;
                  })} <circle cx={padL + 5} cy={H - 38} r="2.5" fill={C.bl} stroke="#fff" strokeWidth="0.5" /> <text x={padL + 11} y={H - 35} fill={C.dm} fontSize="6" fontFamily="JetBrains Mono">● Moyenne</text> <line x1={padL + 65} y1={H - 38} x2={padL + 78} y2={H - 38} stroke="#fff" strokeWidth="2" /> <text x={padL + 82} y={H - 35} fill={C.dm} fontSize="6" fontFamily="JetBrains Mono">— Médiane</text> <circle cx={padL + 140} cy={H - 38} r="2" fill={C.rd} opacity="0.7" /> <text x={padL + 146} y={H - 35} fill={C.dm} fontSize="6" fontFamily="JetBrains Mono">● Outlier</text></svg>;
              })()}</div></div> <div style={{
            ...bx,
            marginTop: 8
          }}> <Hd>Analyse de risque — Synthèse</Hd>{(() => {
              const rd = pr.filter(p => p.v > 0 && p.t !== "Liq").map(p => {
                const baseReturn = p.appr > 0 ? p.appr : 5;
                const noiYield = p.v > 0 && p.noi > 0 ? p.noi / p.v * 100 : 0;
                const vol = (Math.abs(baseReturn - 5) * 1.2 + (p.vacancy || 0) * 0.15 + p.d / Math.max(1, p.v) * 8 + (p.t === "Terrain" ? 6 : p.t === "Chalet" || p.t === "Chalet Premium" ? 4 : 2)) * (p.d > 0 && p.v > 0 ? 1 + p.d / p.v * 0.3 : 1);
                const totalReturn = baseReturn + noiYield;
                const sharpe = vol > 0 ? (totalReturn - 3) / vol : 0;
                return {
                  n: p.n,
                  vol,
                  totalReturn,
                  sharpe,
                  ltv: p.d / Math.max(1, p.v)
                };
              });
              const mostVolatile = [...rd].sort((a, b) => b.vol - a.vol)[0];
              const leastVolatile = [...rd].sort((a, b) => a.vol - b.vol)[0];
              const bestSharpe = [...rd].sort((a, b) => b.sharpe - a.sharpe)[0];
              const avgVol = rd.reduce((a, r) => a + r.vol, 0) / rd.length;
              const highRiskCount = rd.filter(r => r.vol > 8).length;
              return <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10
              }}> <div> <div style={{
                    fontSize: 8,
                    color: C.rd,
                    fontFamily: M,
                    marginBottom: 3
                  }}>PLUS VOLATIL</div> <div style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: C.wh
                  }}>{mostVolatile.n}</div> <div style={{
                    fontSize: 7.5,
                    color: C.dm
                  }}>Vol: {mostVolatile.vol.toFixed(1)} · Rend: {mostVolatile.totalReturn.toFixed(1)}% · LTV: {pc(mostVolatile.ltv)}</div></div> <div> <div style={{
                    fontSize: 8,
                    color: C.g,
                    fontFamily: M,
                    marginBottom: 3
                  }}>MEILLEUR PROFIL RISQUE/RENDEMENT</div> <div style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: C.wh
                  }}>{bestSharpe.n}</div> <div style={{
                    fontSize: 7.5,
                    color: C.dm
                  }}>Sharpe: {bestSharpe.sharpe.toFixed(2)} · Rend: {bestSharpe.totalReturn.toFixed(1)}% · Vol: {bestSharpe.vol.toFixed(1)}</div></div> <div> <div style={{
                    fontSize: 8,
                    color: C.cy,
                    fontFamily: M,
                    marginBottom: 3
                  }}>SYNTHÈSE PORTEFEUILLE</div> <div style={{
                    fontSize: 7.5,
                    color: C.tx,
                    lineHeight: 1.6
                  }}>Vol. moyenne: {avgVol.toFixed(1)} · {highRiskCount} actif(s) à risque élevé · Actif le plus stable: {leastVolatile.n} (vol {leastVolatile.vol.toFixed(1)}) · 24 obs./actif · Rendements mensuels simulés à partir des paramètres réels du terminal</div></div></div>;
            })()}</div> <div style={{
            ...bx,
            marginTop: 8
          }}> <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8
            }}> <Hd>Allocation du capital</Hd> <div style={{
                display: "flex",
                gap: 8,
                alignItems: "center"
              }}> <div style={{
                  display: "flex",
                  gap: 2
                }}>{[["class", "PAR CLASSE"], ["asset", "PAR ACTIF"]].map(([v, l]) => <span key={v} onClick={() => setAllocView(v)} style={{
                    padding: "2px 8px",
                    borderRadius: 2,
                    fontSize: 7,
                    fontFamily: M,
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: 0.5,
                    background: allocView === v ? C.g + "18" : "transparent",
                    color: allocView === v ? C.g : C.dm,
                    border: `1px solid ${allocView === v ? C.g + "44" : C.bd}`
                  }}>{l}</span>)}</div> <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3
                }}> <span style={{
                    fontSize: 6.5,
                    color: C.ft,
                    fontFamily: M
                  }}>SEUIL AUTRES:</span> <input type="range" min={0} max={10} step={1} value={allocThreshold} onChange={e => setAllocThreshold(Number(e.target.value))} style={{
                    width: 50,
                    accentColor: C.g,
                    height: 3
                  }} /> <span style={{
                    fontSize: 8,
                    fontFamily: M,
                    color: C.g
                  }}>{allocThreshold}%</span></div></div></div>{(() => {
              const ALLOC_COLORS = [C.bl, C.g, C.cy, C.am, C.pu, C.pk, C.or, "#8BC34A", "#26A69A", "#5C6BC0", "#ef5350"];
              // Build allocation data
              let segments = [];
              if (allocView === "class") {
                const byClass = {};
                pr.forEach(p => {
                  const cls = p.t;
                  byClass[cls] = (byClass[cls] || 0) + p.v;
                });
                segments = Object.entries(byClass).map(([cls, val]) => ({
                  n: cls,
                  v: val
                }));
              } else {
                segments = pr.map(p => ({
                  n: p.n,
                  v: p.v,
                  cls: p.t
                }));
              }
              segments.sort((a, b) => b.v - a.v);
              const total = segments.reduce((a, s) => a + s.v, 0);
              // Apply threshold
              const main = [];
              let autresVal = 0;
              segments.forEach(s => {
                const pct = total > 0 ? s.v / total * 100 : 0;
                if (pct >= allocThreshold) main.push({
                  ...s,
                  pct
                });else {
                  autresVal += s.v;
                }
              });
              if (autresVal > 0) main.push({
                n: "Autres",
                v: autresVal,
                pct: total > 0 ? autresVal / total * 100 : 0
              });

              // Donut chart SVG
              const cx = 130,
                cy = 130,
                R = 110,
                r = 65;
              let cumAngle = -90;
              const arcs = main.map((s, i) => {
                const angle = s.v / total * 360;
                const startAngle = cumAngle;
                cumAngle += angle;
                const endAngle = cumAngle;
                const startRad = startAngle * Math.PI / 180;
                const endRad = endAngle * Math.PI / 180;
                const largeArc = angle > 180 ? 1 : 0;
                const x1o = cx + R * Math.cos(startRad);
                const y1o = cy + R * Math.sin(startRad);
                const x2o = cx + R * Math.cos(endRad);
                const y2o = cy + R * Math.sin(endRad);
                const x1i = cx + r * Math.cos(endRad);
                const y1i = cy + r * Math.sin(endRad);
                const x2i = cx + r * Math.cos(startRad);
                const y2i = cy + r * Math.sin(startRad);
                const path = `M ${x1o} ${y1o} A ${R} ${R} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${r} ${r} 0 ${largeArc} 0 ${x2i} ${y2i} Z`;
                const midAngle = (startAngle + endAngle) / 2 * Math.PI / 180;
                const labelR = (R + r) / 2;
                const lx = cx + labelR * Math.cos(midAngle);
                const ly = cy + labelR * Math.sin(midAngle);
                return {
                  ...s,
                  path,
                  lx,
                  ly,
                  color: ALLOC_COLORS[i % ALLOC_COLORS.length],
                  angle,
                  i
                };
              });

              // Concentration analysis
              const top3Pct = main.slice(0, 3).reduce((a, s) => a + s.pct, 0);
              const hhi = main.reduce((a, s) => a + Math.pow(s.pct, 2), 0);
              const concLevel = hhi > 3000 ? "ÉLEVÉE" : hhi > 1500 ? "MODÉRÉE" : "DIVERSIFIÉE";
              const concCl = hhi > 3000 ? C.rd : hhi > 1500 ? C.am : C.g;
              return <div style={{
                display: "grid",
                gridTemplateColumns: "280px 1fr",
                gap: 12
              }}> <div style={{
                  textAlign: "center"
                }}> <svg viewBox="0 0 260 260" style={{
                    width: 260,
                    height: 260
                  }}>{arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} stroke={C.bg} strokeWidth="1.5" opacity="0.85" />)}{arcs.filter(a => a.pct > 4).map((a, i) => <text key={i} x={a.lx} y={a.ly} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="7.5" fontFamily="JetBrains Mono" fontWeight="600">{a.pct.toFixed(0)}%</text>)} <circle cx={cx} cy={cy} r={r - 2} fill={C.bg} /> <text x={cx} y={cy - 12} textAnchor="middle" fill={C.ft} fontSize="7" fontFamily="JetBrains Mono" letterSpacing="1">PORTEFEUILLE</text> <text x={cx} y={cy + 5} textAnchor="middle" fill={C.wh} fontSize="14" fontFamily="JetBrains Mono" fontWeight="700">{fm(total)}</text> <text x={cx} y={cy + 20} textAnchor="middle" fill={C.g} fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">NAV: {fm(EQ)}</text></svg> <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    justifyContent: "center",
                    marginTop: 4
                  }}>{arcs.map((a, i) => <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3
                    }}> <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: a.color
                      }} /> <span style={{
                        fontSize: 7,
                        color: C.dm,
                        fontFamily: M
                      }}>{a.n}</span></div>)}</div></div> <div> <div style={{
                    display: "grid",
                    gridTemplateColumns: ".15fr 1.2fr .7fr .5fr .5fr",
                    gap: 2,
                    fontSize: 6.5,
                    fontFamily: M,
                    color: C.dm,
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.g + "33",
                    fontWeight: 700
                  }}> <span /> <span>{allocView === "class" ? "CLASSE" : "ACTIF"}</span> <span style={{
                      textAlign: "right"
                    }}>VALEUR</span> <span style={{
                      textAlign: "right"
                    }}>ALLOC %</span> <span style={{
                      textAlign: "right"
                    }}>CONTRIB. NAV</span></div>{main.map((s, i) => {
                    const navContrib = EQ > 0 ? s.v / total * EQ : 0;
                    return <div key={i} style={{
                      display: "grid",
                      gridTemplateColumns: ".15fr 1.2fr .7fr .5fr .5fr",
                      gap: 2,
                      fontSize: 9,
                      padding: "4px 0",
                      borderBottom: "1px solid " + C.bd + "12",
                      alignItems: "center"
                    }}> <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: ALLOC_COLORS[i % ALLOC_COLORS.length]
                      }} /> <span style={{
                        color: C.wh,
                        fontWeight: 600
                      }}>{s.n}</span> <span style={{
                        textAlign: "right",
                        fontFamily: M,
                        color: C.bl
                      }}>{fm(s.v)}</span> <span style={{
                        textAlign: "right",
                        fontFamily: M,
                        color: C.am
                      }}>{s.pct.toFixed(1)}%</span> <span style={{
                        textAlign: "right",
                        fontFamily: M,
                        color: C.g
                      }}>{fm(Math.round(navContrib))}</span></div>;
                  })} <div style={{
                    display: "grid",
                    gridTemplateColumns: ".15fr 1.2fr .7fr .5fr .5fr",
                    gap: 2,
                    fontSize: 9,
                    padding: "5px 0",
                    borderTop: "1px solid " + C.g + "33",
                    marginTop: 2,
                    fontWeight: 700
                  }}> <span /> <span>TOTAL</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.wh
                    }}>{fm(total)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.am
                    }}>100%</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.g
                    }}>{fm(EQ)}</span></div> <div style={{
                    marginTop: 10,
                    padding: "6px 8px",
                    background: C.bg,
                    borderRadius: 3,
                    border: `1px solid ${concCl}22`
                  }}> <div style={{
                      fontSize: 7.5,
                      color: concCl,
                      fontFamily: M,
                      letterSpacing: 0.5,
                      marginBottom: 4
                    }}>CONCENTRATION:  <span style={{
                        fontWeight: 700
                      }}>{concLevel}</span> (HHI: {Math.round(hhi)})</div> <div style={{
                      fontSize: 8,
                      color: C.tx,
                      lineHeight: 1.6
                    }}>Top 3 = {top3Pct.toFixed(0)}% du portefeuille.{main[0] && <React.Fragment> Dominante:  <span style={{
                          color: C.wh,
                          fontWeight: 600
                        }}>{main[0].n}</span> ({main[0].pct.toFixed(0)}%). </React.Fragment>}{top3Pct > 70 && <span style={{
                        color: C.am
                      }}> Risque de surconcentration — diversification recommandée. </span>}{top3Pct <= 70 && <span style={{
                        color: C.g
                      }}> Allocation relativement équilibrée. </span>}{main.some(s => s.n === "Liq" || s.n === "Encaisse") && main.find(s => s.n === "Liq" || s.n === "Encaisse").pct < 3 && <span style={{
                        color: C.am
                      }}> Position de liquidité faible ({main.find(s => s.n === "Liq" || s.n === "Encaisse").pct.toFixed(1)}%). </span>}</div></div></div></div>;
            })()}</div> <div style={{
            ...bx,
            marginTop: 8
          }}> <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8
            }}> <Hd>Advanced Cash Flow & Debt Analysis</Hd> <div style={{
                display: "flex",
                gap: 4,
                alignItems: "center"
              }}>{[["base", "BASE"], ["stress", "STRESS"], ["upside", "UPSIDE"]].map(([v, l]) => <span key={v} onClick={() => setCfScenario(v)} style={{
                  padding: "2px 8px",
                  borderRadius: 2,
                  fontSize: 7,
                  fontFamily: M,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: 0.5,
                  background: cfScenario === v ? (v === "stress" ? C.rd : v === "upside" ? C.g : C.bl) + "18" : "transparent",
                  color: cfScenario === v ? v === "stress" ? C.rd : v === "upside" ? C.g : C.bl : C.dm,
                  border: `1px solid ${cfScenario === v ? (v === "stress" ? C.rd : v === "upside" ? C.g : C.bl) + "44" : C.bd}`
                }}>{l}</span>)} <div style={{
                  width: 1,
                  height: 14,
                  background: C.bd,
                  margin: "0 4px"
                }} /> <span style={{
                  fontSize: 6.5,
                  color: C.ft,
                  fontFamily: M
                }}>TAXE:</span> <input type="range" min={0} max={40} step={0.5} value={cfTaxRate} onChange={e => setCfTaxRate(Number(e.target.value))} style={{
                  width: 40,
                  accentColor: C.cy,
                  height: 3
                }} /> <span style={{
                  fontSize: 8,
                  fontFamily: M,
                  color: C.cy
                }}>{cfTaxRate}%</span> <span style={{
                  fontSize: 6.5,
                  color: C.ft,
                  fontFamily: M,
                  marginLeft: 4
                }}>DIST:</span> <input type="range" min={0} max={100} step={5} value={cfDistTarget} onChange={e => setCfDistTarget(Number(e.target.value))} style={{
                  width: 40,
                  accentColor: C.am,
                  height: 3
                }} /> <span style={{
                  fontSize: 8,
                  fontFamily: M,
                  color: C.am
                }}>{cfDistTarget}%</span></div></div>{(() => {
              const scenMult = cfScenario === "stress" ? {
                rev: 0.85,
                rate: 1.25
              } : cfScenario === "upside" ? {
                rev: 1.15,
                rate: 0.9
              } : {
                rev: 1,
                rate: 1
              };

              // Build per-company CF data
              const cfData = op.map((o, idx) => {
                const rev = Math.round(o.rev * scenMult.rev);
                const opex = (o.exp || []).reduce((a, e) => a + e.amt, 0);
                const ebitda = rev - opex;
                const capex = 0;
                const cfo = ebitda - capex;
                const debtAlloc = Math.round(std / op.length);
                const intRate = stdRate * scenMult.rate;
                const interest = Math.round(debtAlloc * intRate / 100);
                const principal = Math.round(debtAlloc * 0.05);
                const debtService = interest + principal;
                const tda = cfo - debtService;
                const taxes = Math.round(Math.max(0, tda) * cfTaxRate / 100);
                const fcfe = tda - taxes;
                const distribution = Math.round(Math.max(0, fcfe) * cfDistTarget / 100);
                const retained = fcfe - distribution;
                const dscr = debtService > 0 ? cfo / debtService : 99;
                const debtEbitda = ebitda > 0 ? debtAlloc / ebitda : 99;
                const tdaRev = rev > 0 ? tda / rev * 100 : 0;
                const mgEbitda = rev > 0 ? ebitda / rev * 100 : 0;
                const cashConv = ebitda > 0 ? fcfe / ebitda * 100 : 0;
                const distRatio = fcfe > 0 ? distribution / fcfe * 100 : 0;
                const dscrBreak = debtService > 0 ? Math.round(rev - (debtService - ebitda + rev)) : 0;
                const addDebtCap = dscr > 1.25 ? Math.round((cfo - debtService) / (intRate / 100 + 0.05)) : 0;
                return {
                  n: o.n,
                  rev,
                  opex,
                  ebitda,
                  capex,
                  cfo,
                  interest,
                  principal,
                  debtService,
                  tda,
                  taxes,
                  fcfe,
                  distribution,
                  retained,
                  dscr,
                  debtEbitda,
                  tdaRev,
                  mgEbitda,
                  cashConv,
                  distRatio,
                  debtAlloc,
                  addDebtCap
                };
              });
              const cons = {
                rev: cfData.reduce((a, c) => a + c.rev, 0),
                opex: cfData.reduce((a, c) => a + c.opex, 0),
                ebitda: cfData.reduce((a, c) => a + c.ebitda, 0),
                cfo: cfData.reduce((a, c) => a + c.cfo, 0),
                debtService: cfData.reduce((a, c) => a + c.debtService, 0),
                tda: cfData.reduce((a, c) => a + c.tda, 0),
                taxes: cfData.reduce((a, c) => a + c.taxes, 0),
                fcfe: cfData.reduce((a, c) => a + c.fcfe, 0),
                distribution: cfData.reduce((a, c) => a + c.distribution, 0),
                retained: cfData.reduce((a, c) => a + c.retained, 0),
                interest: cfData.reduce((a, c) => a + c.interest, 0),
                principal: cfData.reduce((a, c) => a + c.principal, 0)
              };
              cons.dscr = cons.debtService > 0 ? cons.cfo / cons.debtService : 99;

              // Waterfall steps
              const wSteps = [{
                n: "Revenus",
                v: cons.rev,
                t: "total"
              }, {
                n: "OPEX",
                v: -cons.opex,
                t: "neg"
              }, {
                n: "EBITDA",
                v: cons.ebitda,
                t: "sub"
              }, {
                n: "Intérêts",
                v: -cons.interest,
                t: "neg"
              }, {
                n: "Principal",
                v: -cons.principal,
                t: "neg"
              }, {
                n: "TDA",
                v: cons.tda,
                t: "sub"
              }, {
                n: "Taxes",
                v: -cons.taxes,
                t: "neg"
              }, {
                n: "FCFE",
                v: cons.fcfe,
                t: "sub"
              }, {
                n: "Distribut.",
                v: -cons.distribution,
                t: "neg"
              }, {
                n: "Retenu",
                v: cons.retained,
                t: "final"
              }];

              // SVG
              const W = 560,
                HH = 200,
                pL = 50,
                pR = 8,
                pT = 12,
                pB = 30;
              const pW = W - pL - pR,
                pH = HH - pT - pB;
              const bW = Math.min(22, pW / wSteps.length * 0.55);
              const gp = pW / wSteps.length;
              let run = 0;
              const brs = wSteps.map(s => {
                const isSub = s.t === "sub" || s.t === "total" || s.t === "final";
                let y0, y1;
                if (isSub) {
                  y0 = 0;
                  y1 = s.v;
                  run = s.v;
                } else {
                  y0 = run;
                  y1 = run + s.v;
                  run += s.v;
                }
                return {
                  ...s,
                  y0,
                  y1
                };
              });
              const aV = brs.flatMap(b => [b.y0, b.y1]);
              const yMn = Math.min(0, ...aV) * 1.1,
                yMx = Math.max(...aV) * 1.1;
              const yS = v => pT + pH - (v - yMn) / (yMx - yMn) * pH;
              const xP = i => pL + gp * i + gp / 2;
              return <div> <div style={{
                  textAlign: "center",
                  marginBottom: 6
                }}> <Tg c={cfScenario === "stress" ? C.rd : cfScenario === "upside" ? C.g : C.bl}>{cfScenario === "stress" ? "STRESS: Rev -15% · Taux +25%" : cfScenario === "upside" ? "UPSIDE: Rev +15% · Taux -10%" : "BASE CASE"}</Tg></div> <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 180px",
                  gap: 8,
                  marginBottom: 8
                }}> <div> <svg viewBox={`0 0 ${W} ${HH}`} style={{
                      width: "100%",
                      height: "auto"
                    }}> <line x1={pL} y1={yS(0)} x2={W - pR} y2={yS(0)} stroke={C.dm} strokeWidth="0.6" />{brs.map((b, i) => {
                        const x = xP(i);
                        const isSub = b.t === "sub" || b.t === "total" || b.t === "final";
                        const cl = isSub ? b.t === "final" ? b.y1 >= 0 ? C.g : C.rd : C.bl : b.v >= 0 ? C.g : C.rd;
                        const top = Math.min(yS(b.y0), yS(b.y1));
                        const btm = Math.max(yS(b.y0), yS(b.y1));
                        const h = Math.max(1, btm - top);
                        return <g key={i}> <rect x={x - bW / 2} y={top} width={bW} height={h} fill={cl + (isSub ? "25" : "50")} stroke={cl} strokeWidth="1" rx="1.5" />{i > 0 && !isSub && <line x1={xP(i - 1) + bW / 2} y1={yS(b.y0)} x2={x - bW / 2} y2={yS(b.y0)} stroke={C.ft} strokeWidth="0.4" strokeDasharray="2,2" />} <text x={x} y={top - 4} textAnchor="middle" fill={cl} fontSize="6.5" fontFamily="JetBrains Mono" fontWeight="600">{b.v >= 0 ? fm(b.v) : "-" + fm(Math.abs(b.v))}</text> <text x={x} y={HH - 6} textAnchor="middle" fill={isSub ? C.wh : C.dm} fontSize="6" fontFamily="JetBrains Mono" fontWeight={isSub ? "700" : "400"}>{b.n}</text></g>;
                      })}</svg></div> <div> <div style={{
                      padding: 6,
                      background: C.bg,
                      borderRadius: 3,
                      border: `1px solid ${cons.fcfe >= 0 ? C.g : C.rd}22`,
                      textAlign: "center",
                      marginBottom: 5
                    }}> <div style={{
                        fontSize: 6.5,
                        color: C.ft,
                        fontFamily: M
                      }}>FCFE</div> <div style={{
                        fontSize: 16,
                        fontWeight: 700,
                        fontFamily: M,
                        color: cons.fcfe >= 0 ? C.g : C.rd
                      }}>{fm(cons.fcfe)}</div></div>{[["DSCR", cons.dscr.toFixed(2) + "x", cons.dscr >= 1.25 ? C.g : cons.dscr >= 1 ? C.am : C.rd], ["Dette/EBITDA", (cons.ebitda > 0 ? (std / cons.ebitda).toFixed(1) : "—") + "x", std / cons.ebitda < 3 ? C.g : C.am], ["Marge EBITDA", (cons.rev > 0 ? (cons.ebitda / cons.rev * 100).toFixed(0) : "0") + "%", C.cy], ["Cash Conv.", (cons.ebitda > 0 ? (cons.fcfe / cons.ebitda * 100).toFixed(0) : "0") + "%", C.bl], ["TDA/Rev", (cons.rev > 0 ? (cons.tda / cons.rev * 100).toFixed(0) : "0") + "%", C.am], ["Distribution", fm(cons.distribution), C.pu], ["Retenu", fm(cons.retained), cons.retained >= 0 ? C.g : C.rd]].map(([l, v, cl]) => <div key={l} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "2px 0",
                      borderBottom: "1px solid " + C.bd + "10"
                    }}> <span style={{
                        fontSize: 7.5,
                        color: C.dm
                      }}>{l}</span> <span style={{
                        fontSize: 8.5,
                        fontWeight: 600,
                        fontFamily: M,
                        color: cl
                      }}>{v}</span></div>)}</div></div> <div style={{
                  overflowX: "auto"
                }}> <div style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr .6fr .5fr .5fr .5fr .5fr .5fr .5fr .4fr .4fr .4fr",
                    gap: 2,
                    fontSize: 6,
                    fontFamily: M,
                    color: C.dm,
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.g + "33",
                    fontWeight: 700,
                    minWidth: 800
                  }}> <span>ENTREPRISE</span> <span style={{
                      textAlign: "right"
                    }}>REVENUS</span> <span style={{
                      textAlign: "right"
                    }}>EBITDA</span> <span style={{
                      textAlign: "right"
                    }}>SVC DETTE</span> <span style={{
                      textAlign: "right"
                    }}>TDA</span> <span style={{
                      textAlign: "right"
                    }}>FCFE</span> <span style={{
                      textAlign: "right"
                    }}>DSCR</span> <span style={{
                      textAlign: "right"
                    }}>DT/EBITDA</span> <span style={{
                      textAlign: "right"
                    }}>DISTRIB.</span> <span style={{
                      textAlign: "right"
                    }}>RETENU</span> <span style={{
                      textAlign: "right"
                    }}>+DETTE CAP</span></div>{cfData.map((c, i) => <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr .6fr .5fr .5fr .5fr .5fr .5fr .5fr .4fr .4fr .4fr",
                    gap: 2,
                    fontSize: 8.5,
                    padding: "3px 0",
                    borderBottom: "1px solid " + C.bd + "10",
                    minWidth: 800,
                    alignItems: "center"
                  }}> <span style={{
                      fontWeight: 600,
                      color: C.wh
                    }}>{c.n}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M
                    }}>{fm(c.rev)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.bl
                    }}>{fm(c.ebitda)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.am
                    }}>{fm(c.debtService)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: c.tda >= 0 ? C.g : C.rd
                    }}>{fm(c.tda)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      fontWeight: 700,
                      color: c.fcfe >= 0 ? C.g : C.rd
                    }}>{fm(c.fcfe)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: c.dscr >= 1.25 ? C.g : c.dscr >= 1 ? C.am : C.rd
                    }}>{c.dscr < 50 ? c.dscr.toFixed(2) + "x" : "∞"}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: c.debtEbitda < 3 ? C.g : C.am
                    }}>{c.debtEbitda < 50 ? c.debtEbitda.toFixed(1) + "x" : "—"}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.pu
                    }}>{fm(c.distribution)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: c.retained >= 0 ? C.g : C.rd
                    }}>{fm(c.retained)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: c.addDebtCap > 0 ? C.cy : C.ft
                    }}>{c.addDebtCap > 0 ? "+" + fm(c.addDebtCap) : "—"}</span></div>)} <div style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr .6fr .5fr .5fr .5fr .5fr .5fr .5fr .4fr .4fr .4fr",
                    gap: 2,
                    fontSize: 9,
                    padding: "5px 0",
                    borderTop: "1px solid " + C.g + "33",
                    marginTop: 2,
                    fontWeight: 700,
                    minWidth: 800
                  }}> <span>CONSOLIDÉ</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.wh
                    }}>{fm(cons.rev)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.bl
                    }}>{fm(cons.ebitda)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.am
                    }}>{fm(cons.debtService)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: cons.tda >= 0 ? C.g : C.rd
                    }}>{fm(cons.tda)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: cons.fcfe >= 0 ? C.g : C.rd
                    }}>{fm(cons.fcfe)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: cons.dscr >= 1.25 ? C.g : C.am
                    }}>{cons.dscr.toFixed(2)}x</span> <span style={{
                      textAlign: "right",
                      fontFamily: M
                    }}>{(std / cons.ebitda).toFixed(1)}x</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.pu
                    }}>{fm(cons.distribution)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: cons.retained >= 0 ? C.g : C.rd
                    }}>{fm(cons.retained)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.cy
                    }}>{fm(cfData.reduce((a, c) => a + c.addDebtCap, 0))}</span></div></div> <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 6,
                  marginTop: 10
                }}>{[["base", "BASE", {
                    rev: 1,
                    rate: 1
                  }], ["stress", "STRESS", {
                    rev: 0.85,
                    rate: 1.25
                  }], ["upside", "UPSIDE", {
                    rev: 1.15,
                    rate: 0.9
                  }]].map(([k, l, sm]) => {
                    const sRev = Math.round(op.reduce((a, o) => a + o.rev, 0) * sm.rev);
                    const sOpex = op.reduce((a, o) => a + (o.exp || []).reduce((b, e) => b + e.amt, 0), 0);
                    const sEbitda = sRev - sOpex;
                    const sInt = Math.round(std * stdRate * sm.rate / 100);
                    const sPrinc = Math.round(std * 0.05);
                    const sDS = sInt + sPrinc;
                    const sTDA = sEbitda - sDS;
                    const sTax = Math.round(Math.max(0, sTDA) * cfTaxRate / 100);
                    const sFCFE = sTDA - sTax;
                    const sDSCR = sDS > 0 ? sEbitda / sDS : 99;
                    const cl = k === "stress" ? C.rd : k === "upside" ? C.g : C.bl;
                    return <div key={k} style={{
                      padding: 8,
                      background: cl + "06",
                      border: `1px solid ${cl}18`,
                      borderRadius: 4,
                      cursor: "pointer"
                    }} onClick={() => setCfScenario(k)}> <div style={{
                        fontSize: 8,
                        color: cl,
                        fontFamily: M,
                        fontWeight: 700,
                        letterSpacing: 1,
                        marginBottom: 4
                      }}>{l}</div>{[["FCFE", fm(sFCFE), sFCFE >= 0 ? C.g : C.rd], ["DSCR", sDSCR.toFixed(2) + "x", sDSCR >= 1.25 ? C.g : sDSCR >= 1 ? C.am : C.rd], ["TDA", fm(sTDA), sTDA >= 0 ? C.g : C.rd]].map(([ll, vv, cc]) => <div key={ll} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "2px 0"
                      }}> <span style={{
                          fontSize: 7.5,
                          color: C.dm
                        }}>{ll}</span> <span style={{
                          fontSize: 9,
                          fontWeight: 700,
                          fontFamily: M,
                          color: cc
                        }}>{vv}</span></div>)}</div>;
                  })}</div> <div style={{
                  marginTop: 8,
                  padding: "6px 8px",
                  background: C.bg,
                  borderRadius: 3,
                  border: `1px solid ${C.bd}`
                }}> <div style={{
                    fontSize: 7.5,
                    color: C.g,
                    fontFamily: M,
                    letterSpacing: 0.5,
                    marginBottom: 4
                  }}>RÉSUMÉ EXÉCUTIF</div> <div style={{
                    fontSize: 8.5,
                    color: C.tx,
                    lineHeight: 1.7
                  }}>{cons.dscr >= 1.25 ? <React.Fragment> <span style={{
                        color: C.g
                      }}>●</span> Service de dette solide (DSCR {cons.dscr.toFixed(2)}{"x > 1.25x) \u2014 capacit\xE9 de levier disponible. "}</React.Fragment> : cons.dscr >= 1 ? <React.Fragment> <span style={{
                        color: C.am
                      }}>●</span> DSCR de {cons.dscr.toFixed(2)}x — zone de vigilance, marge de sécurité limitée. </React.Fragment> : <React.Fragment> <span style={{
                        color: C.rd
                      }}>●</span> DSCR critique ({cons.dscr.toFixed(2)}{"x < 1x) \u2014 incapacit\xE9 \xE0 servir la dette. "}</React.Fragment>}{cons.fcfe > 0 ? <React.Fragment> <span style={{
                        color: C.g
                      }}>●</span> FCFE positif ({fm(cons.fcfe)}) — distribution possible à {cfDistTarget}% = {fm(cons.distribution)}. </React.Fragment> : <React.Fragment> <span style={{
                        color: C.rd
                      }}>●</span> FCFE négatif — aucune distribution recommandée. </React.Fragment>} <span style={{
                      color: C.cy
                    }}>●</span> Cash conversion: {cons.ebitda > 0 ? (cons.fcfe / cons.ebitda * 100).toFixed(0) : 0}% de l'EBITDA converti en equity cash.{cfData.filter(c => c.addDebtCap > 0).length > 0 && <React.Fragment>  <span style={{
                        color: C.bl
                      }}>●</span> Capacité d'endettement additionnel: +{fm(cfData.reduce((a, c) => a + c.addDebtCap, 0))}{" (bas\xE9 sur DSCR > 1.25x). "}</React.Fragment>}{cfData.some(c => c.fcfe < 0) && <React.Fragment>  <span style={{
                        color: C.rd
                      }}>●</span> Attention: {cfData.filter(c => c.fcfe < 0).map(c => c.n).join(", ")} en FCFE négatif. </React.Fragment>}</div></div></div>;
            })()}</div></React.Fragment>}</div>}{tab === "opco" && <div> <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 7,
          marginBottom: 8
        }}>{op.map((o, idx) => {
            const sm = SECTOR_MULTIPLES[o.sect] || {
              low: 5,
              mid: 8,
              high: 12
            };
            const totalExp = (o.exp || []).reduce((a, e) => a + e.amt, 0);
            const isOpen = opExpSel === idx;
            return <div key={idx} style={bx}> <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
                alignItems: "center"
              }}> <EC value={o.n} type="text" onChange={v => updateOp(idx, "n", v)} w={130} color={C.wh} /> <Tg c={o.st === "Stable" ? C.g : o.st === "Growth" ? C.cy : C.am}>{o.st}</Tg></div> <div style={{
                marginBottom: 5
              }}> <div style={{
                  fontSize: 6.5,
                  color: C.ft,
                  fontFamily: M,
                  marginBottom: 2
                }}>SECTEUR</div> <SC value={o.sect} options={Object.keys(SECTOR_MULTIPLES)} onChange={v => updateOp(idx, "sect", v)} /></div> <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 3,
                marginBottom: 5
              }}>{[["Revenus", o.rev, "rev", C.wh], ["Dépenses", totalExp, null, C.rd], ["Net", o.net, null, C.g], ["Marge", null, null, C.cy]].map(([l, v, field, cl]) => <div key={l} style={{
                  padding: "3px 4px",
                  background: C.p3,
                  borderRadius: 2,
                  textAlign: "center"
                }}> <div style={{
                    fontSize: 6,
                    color: C.ft,
                    fontFamily: M
                  }}>{l}</div>{field ? <EC value={v} onChange={val => updateOp(idx, field, val)} w={55} color={cl} /> : l === "Marge" ? <div style={{
                    fontSize: 9.5,
                    fontWeight: 600,
                    fontFamily: M,
                    color: cl
                  }}>{o.mg.toFixed(1)}%</div> : <div style={{
                    fontSize: 9,
                    fontWeight: 600,
                    fontFamily: M,
                    color: cl
                  }}>{fm(v)}</div>}</div>)}</div> <div onClick={() => setOpExpSel(isOpen ? null : idx)} style={{
                cursor: "pointer",
                padding: "3px 6px",
                background: C.bg,
                borderRadius: 3,
                border: `1px solid ${C.bd}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4
              }}> <span style={{
                  fontSize: 7,
                  color: C.dm,
                  fontFamily: M
                }}>BREAKDOWN DÉPENSES ({(o.exp || []).length} postes)</span> <span style={{
                  fontSize: 8,
                  color: C.dm
                }}>{isOpen ? "▲" : "▼"}</span></div>{isOpen && <div style={{
                background: C.bg,
                borderRadius: 3,
                border: `1px solid ${C.bd}`,
                padding: 5,
                marginBottom: 4
              }}>{(o.exp || []).map((e, ei) => <div key={ei} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px 0",
                  borderBottom: "1px solid " + C.bd + "10",
                  alignItems: "center",
                  gap: 4
                }}> <EC value={e.cat} type="text" onChange={v => updateExp(idx, ei, "cat", v)} w={90} color={C.tx} /> <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}> <EC value={e.amt} onChange={v => updateExp(idx, ei, "amt", v)} w={55} color={C.rd} /> <span onClick={() => removeExp(idx, ei)} style={{
                      cursor: "pointer",
                      fontSize: 7,
                      color: C.rd + "66"
                    }}>✕</span></div></div>)} <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderTop: "1px solid " + C.g + "33",
                  marginTop: 3,
                  fontWeight: 700,
                  fontSize: 8.5
                }}> <span style={{
                    color: C.dm
                  }}>TOTAL DÉPENSES</span> <span style={{
                    fontFamily: M,
                    color: C.rd
                  }}>{fm(totalExp)}</span></div> <button onClick={() => addExpItem(idx)} style={{
                  width: "100%",
                  padding: "3px",
                  border: `1px dashed ${C.g}44`,
                  borderRadius: 2,
                  background: "transparent",
                  color: C.g,
                  fontFamily: M,
                  fontSize: 7,
                  cursor: "pointer",
                  marginTop: 3
                }}>+ Ajouter dépense</button></div>} <div style={{
                padding: "5px 6px",
                background: C.bg,
                borderRadius: 3,
                border: `1px solid ${C.bd}`
              }}> <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}> <div style={{
                    fontSize: 6.5,
                    color: C.g,
                    fontFamily: M
                  }}>{o.sect} · {sm.low}-{sm.high}x</div> <EC value={o.mult} onChange={v => updateOp(idx, "mult", v)} w={30} suffix="x" color={C.am} /></div> <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: M,
                  color: C.g,
                  textAlign: "center",
                  marginTop: 2
                }}>VAL: {fm(o.net * o.mult)}</div></div></div>;
          })} <div style={{
            ...bx,
            background: "linear-gradient(135deg," + C.p2 + "," + C.p3 + ")"
          }}> <Hd>Consolidated</Hd>{[["Rev Total", fm(OPREV), C.wh], ["Dépenses Total", fm(TOTAL_OPEXP), C.rd], ["Net Total", fm(OPNET), C.g], ["Marge Nette", pc(OPREV > 0 ? OPNET / OPREV : 0), C.cy], ["Val OpCo (mult.)", fm(OPCO_VAL), C.g]].map(([l, v, cl]) => <div key={l} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "3px 0",
              borderBottom: "1px solid " + C.bd + "22"
            }}> <span style={{
                fontSize: 9,
                color: C.dm
              }}>{l}</span> <span style={{
                fontSize: 11,
                fontWeight: 700,
                fontFamily: M,
                color: cl
              }}>{v}</span></div>)} <div style={{
              marginTop: 8
            }}> <Hd>Dépenses par catégorie (consolidé)</Hd>{(() => {
                const cats = {};
                op.forEach(o => (o.exp || []).forEach(e => {
                  cats[e.cat] = (cats[e.cat] || 0) + e.amt;
                }));
                return Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => <div key={cat} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px 0",
                  borderBottom: "1px solid " + C.bd + "10"
                }}> <span style={{
                    fontSize: 8,
                    color: C.dm
                  }}>{cat}</span> <span style={{
                    fontSize: 8.5,
                    fontFamily: M,
                    color: C.rd
                  }}>{fm(amt)}</span></div>);
              })()}</div></div></div> <div style={{
          ...bx,
          marginTop: 8
        }}> <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8
          }}> <Hd>Cash Flow Analysis — Waterfall</Hd> <div style={{
              display: "flex",
              gap: 3
            }}> <span onClick={() => setWfSel("all")} style={{
                padding: "2px 8px",
                borderRadius: 2,
                fontSize: 7,
                fontFamily: M,
                fontWeight: 600,
                cursor: "pointer",
                background: wfSel === "all" ? C.g + "18" : "transparent",
                color: wfSel === "all" ? C.g : C.dm,
                border: `1px solid ${wfSel === "all" ? C.g + "44" : C.bd}`
              }}>CONSOLIDÉ</span>{op.map((o, idx) => <span key={idx} onClick={() => setWfSel(idx)} style={{
                padding: "2px 8px",
                borderRadius: 2,
                fontSize: 7,
                fontFamily: M,
                fontWeight: 600,
                cursor: "pointer",
                background: wfSel === idx ? C.g + "18" : "transparent",
                color: wfSel === idx ? C.g : C.dm,
                border: `1px solid ${wfSel === idx ? C.g + "44" : C.bd}`
              }}>{o.n.length > 10 ? o.n.slice(0, 9) + "…" : o.n}</span>)}</div></div>{(() => {
            // Build waterfall data
            const src = wfSel === "all" ? op : [op[wfSel]].filter(Boolean);
            const rev = src.reduce((a, o) => a + o.rev, 0);
            const totalExp = src.reduce((a, o) => a + (o.exp || []).reduce((b, e) => b + e.amt, 0), 0);
            const ebitda = rev - totalExp;
            const capex = 0; // No separate capex for OpCos
            const cfOp = ebitda - capex;
            const debtService = wfSel === "all" ? Math.round(std * stdRate / 100) : Math.round(std * stdRate / 100 / op.length);
            const taxes = Math.round(Math.max(0, ebitda) * 0.265);
            const cfNet = cfOp - debtService - taxes;
            const tda = cfNet;
            const steps = [{
              n: "Revenus",
              v: rev,
              type: "total"
            }, {
              n: "OPEX",
              v: -totalExp,
              type: "neg"
            }, {
              n: "EBITDA",
              v: ebitda,
              type: "sub"
            }, {
              n: "CAPEX",
              v: -capex,
              type: capex > 0 ? "neg" : "zero"
            }, {
              n: "CF Opér.",
              v: cfOp,
              type: "sub"
            }, {
              n: "Svc Dette",
              v: -debtService,
              type: "neg"
            }, {
              n: "Taxes",
              v: -taxes,
              type: "neg"
            }, {
              n: "CF Net",
              v: cfNet,
              type: "sub"
            }, {
              n: "TDA",
              v: tda,
              type: "final"
            }];

            // SVG Waterfall
            const W = 580,
              H = 230,
              padL = 55,
              padR = 10,
              padT = 15,
              padB = 35;
            const plotW = W - padL - padR;
            const plotH = H - padT - padB;
            const barW = plotW / steps.length * 0.6;
            const gap = plotW / steps.length;

            // Calculate running positions
            let running = 0;
            const bars = steps.map((s, i) => {
              let y0, y1, barVal;
              if (s.type === "total" || s.type === "sub" || s.type === "final") {
                y0 = 0;
                y1 = s.v;
                barVal = s.v;
                running = s.v;
              } else if (s.type === "zero") {
                y0 = running;
                y1 = running;
                barVal = 0;
              } else {
                y0 = running;
                y1 = running + s.v;
                running += s.v;
                barVal = s.v;
              }
              return {
                ...s,
                y0,
                y1,
                barVal,
                running
              };
            });
            const allVals = bars.flatMap(b => [b.y0, b.y1, b.barVal]);
            const yMax = Math.max(...allVals) * 1.1;
            const yMin = Math.min(0, ...allVals) * 1.1;
            const yScale = v => padT + plotH - (v - yMin) / (yMax - yMin) * plotH;
            const xPos = i => padL + gap * i + gap / 2;

            // Ratios
            const tdaRevRatio = rev > 0 ? (tda / rev * 100).toFixed(1) : "—";
            const debtEbitda = ebitda > 0 ? (debtService / ebitda).toFixed(2) : "—";
            return <div> <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 200px",
                gap: 10
              }}> <div> <svg viewBox={`0 0 ${W} ${H}`} style={{
                    width: "100%",
                    height: "auto"
                  }}>{[0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax].map((v, i) => <g key={i}> <line x1={padL} y1={yScale(v)} x2={W - padR} y2={yScale(v)} stroke={C.bd} strokeWidth="0.4" strokeDasharray="2,3" /> <text x={padL - 4} y={yScale(v) + 3} textAnchor="end" fill={C.ft} fontSize="7" fontFamily="JetBrains Mono">{fm(Math.round(v))}</text></g>)} <line x1={padL} y1={yScale(0)} x2={W - padR} y2={yScale(0)} stroke={C.dm} strokeWidth="0.6" />{bars.map((b, i) => {
                      const x = xPos(i);
                      const isSub = b.type === "sub" || b.type === "total" || b.type === "final";
                      const cl = isSub ? b.type === "final" ? b.v >= 0 ? C.g : C.rd : C.bl : b.v >= 0 ? C.g : C.rd;
                      const top = Math.min(yScale(b.y0), yScale(b.y1));
                      const bottom = Math.max(yScale(b.y0), yScale(b.y1));
                      const barH = Math.max(1, bottom - top);
                      return <g key={i}> <rect x={x - barW / 2} y={top} width={barW} height={barH} fill={cl + (isSub ? "30" : "55")} stroke={cl} strokeWidth="1" rx="1.5" />{i > 0 && !isSub && <line x1={xPos(i - 1) + barW / 2 + 1} y1={yScale(b.y0)} x2={x - barW / 2 - 1} y2={yScale(b.y0)} stroke={C.ft} strokeWidth="0.5" strokeDasharray="2,2" />} <text x={x} y={top - 5} textAnchor="middle" fill={cl} fontSize="7.5" fontFamily="JetBrains Mono" fontWeight="600">{b.barVal >= 0 ? fm(b.barVal) : "-" + fm(Math.abs(b.barVal))}</text> <text x={x} y={H - 8} textAnchor="middle" fill={isSub ? C.wh : C.dm} fontSize="7" fontFamily="JetBrains Mono" fontWeight={isSub ? "700" : "400"}>{b.n}</text></g>;
                    })}</svg></div> <div> <div style={{
                    padding: "8px",
                    background: C.bg,
                    borderRadius: 4,
                    border: `1px solid ${tda >= 0 ? C.g : C.rd}22`,
                    marginBottom: 6,
                    textAlign: "center"
                  }}> <div style={{
                      fontSize: 7,
                      color: tda >= 0 ? C.g : C.rd,
                      fontFamily: M,
                      letterSpacing: 1
                    }}>TDA</div> <div style={{
                      fontSize: 18,
                      fontWeight: 700,
                      fontFamily: M,
                      color: tda >= 0 ? C.g : C.rd
                    }}>{fm(tda)}</div>{tda < 0 && <div style={{
                      fontSize: 7,
                      color: C.rd,
                      marginTop: 2
                    }}>⚠ CASH FLOW NÉGATIF</div>}</div>{[["Revenus", fm(rev), C.wh], ["OPEX", "-" + fm(totalExp), C.rd], ["EBITDA", fm(ebitda), C.bl], ["Svc dette", "-" + fm(debtService), C.am], ["Taxes (26.5%)", "-" + fm(taxes), C.rd], ["TDA / Revenus", tdaRevRatio + "%", parseFloat(tdaRevRatio) > 15 ? C.g : C.am], ["Dette / EBITDA", debtEbitda + "x", parseFloat(debtEbitda) < 2 ? C.g : C.rd]].map(([l, v, cl]) => <div key={l} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "3px 0",
                    borderBottom: "1px solid " + C.bd + "12"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.dm
                    }}>{l}</span> <span style={{
                      fontSize: 9,
                      fontWeight: 600,
                      fontFamily: M,
                      color: cl
                    }}>{v}</span></div>)}</div></div> <div style={{
                marginTop: 10
              }}> <div style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr .7fr .7fr .7fr .6fr .6fr .7fr .5fr",
                  gap: 2,
                  fontSize: 6.5,
                  fontFamily: M,
                  color: C.dm,
                  padding: "2px 0",
                  borderBottom: "1px solid " + C.g + "33",
                  fontWeight: 700
                }}> <span>ENTREPRISE</span> <span style={{
                    textAlign: "right"
                  }}>REVENUS</span> <span style={{
                    textAlign: "right"
                  }}>OPEX</span> <span style={{
                    textAlign: "right"
                  }}>EBITDA</span> <span style={{
                    textAlign: "right"
                  }}>SVC DETTE</span> <span style={{
                    textAlign: "right"
                  }}>TAXES</span> <span style={{
                    textAlign: "right"
                  }}>TDA</span> <span style={{
                    textAlign: "right"
                  }}>TDA/REV</span></div>{op.map((o, i) => {
                  const oExp = (o.exp || []).reduce((a, e) => a + e.amt, 0);
                  const oEbitda = o.rev - oExp;
                  const oDS = Math.round(std * stdRate / 100 / op.length);
                  const oTax = Math.round(Math.max(0, oEbitda) * 0.265);
                  const oTDA = oEbitda - oDS - oTax;
                  const oRatio = o.rev > 0 ? (oTDA / o.rev * 100).toFixed(0) : "—";
                  return <div key={i} onClick={() => setWfSel(i)} style={{
                    display: "grid",
                    gridTemplateColumns: "1.3fr .7fr .7fr .7fr .6fr .6fr .7fr .5fr",
                    gap: 2,
                    fontSize: 9,
                    padding: "4px 0",
                    borderBottom: "1px solid " + C.bd + "12",
                    cursor: "pointer",
                    background: wfSel === i ? C.g + "06" : "transparent",
                    alignItems: "center"
                  }}> <span style={{
                      fontWeight: 600,
                      color: C.wh
                    }}>{o.n}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M
                    }}>{fm(o.rev)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.rd
                    }}>{fm(oExp)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.bl
                    }}>{fm(oEbitda)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.am
                    }}>{fm(oDS)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: C.rd
                    }}>{fm(oTax)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      fontWeight: 700,
                      color: oTDA >= 0 ? C.g : C.rd
                    }}>{fm(oTDA)}</span> <span style={{
                      textAlign: "right",
                      fontFamily: M,
                      color: parseFloat(oRatio) > 15 ? C.g : C.am
                    }}>{oRatio}%</span></div>;
                })}</div> <div style={{
                marginTop: 8,
                padding: "6px 8px",
                background: C.bg,
                borderRadius: 3,
                border: `1px solid ${C.bd}`
              }}> <div style={{
                  fontSize: 7.5,
                  color: C.g,
                  fontFamily: M,
                  letterSpacing: 0.5,
                  marginBottom: 4
                }}>ANALYSE CF</div>{(() => {
                  const ranked = op.map((o, i) => {
                    const oExp = (o.exp || []).reduce((a, e) => a + e.amt, 0);
                    const oTDA = o.rev - oExp - Math.round(std * stdRate / 100 / op.length) - Math.round(Math.max(0, o.rev - oExp) * 0.265);
                    return {
                      n: o.n,
                      tda: oTDA,
                      mg: o.mg,
                      rev: o.rev
                    };
                  }).sort((a, b) => b.tda - a.tda);
                  const best = ranked[0];
                  const worst = ranked[ranked.length - 1];
                  const negatives = ranked.filter(r => r.tda < 0);
                  return <div style={{
                    fontSize: 8.5,
                    color: C.tx,
                    lineHeight: 1.6
                  }}> <span style={{
                      color: C.g
                    }}>●</span> Meilleur cash flow:  <span style={{
                      color: C.wh,
                      fontWeight: 600
                    }}>{best.n}</span> (TDA {fm(best.tda)}, marge {best.mg.toFixed(0)}%).{worst.tda < best.tda && <React.Fragment>  <span style={{
                        color: C.am
                      }}>●</span> Plus faible:  <span style={{
                        color: C.wh
                      }}>{worst.n}</span> (TDA {fm(worst.tda)}). </React.Fragment>}{negatives.length > 0 && <React.Fragment>  <span style={{
                        color: C.rd
                      }}>●</span> {negatives.length} entreprise(s) en TDA négatif — attention au service de dette. </React.Fragment>}{negatives.length === 0 && <React.Fragment>  <span style={{
                        color: C.g
                      }}>●</span> Toutes les OpCos génèrent du cash positif après dette et taxes. </React.Fragment>} <span style={{
                      color: C.cy
                    }}>●</span>{" Levier d'optimisation: r\xE9duction OPEX sur les entreprises \xE0 marge <50%."}</div>;
                })()}</div></div>;
          })()}</div></div>}{tab === "acq" && <div> <div style={{
          display: "flex",
          gap: 3,
          marginBottom: 8,
          padding: "4px 0",
          borderBottom: "1px solid " + C.bd
        }}>{[["acq", "ACQUISITIONS"], ["dev", "DÉVELOPPEMENT"], ["sum", "CONSOLIDÉ"]].map(([v, l]) => <span key={v} onClick={() => setAcqSubView(v)} style={{
            padding: "4px 12px",
            borderRadius: 3,
            fontSize: 8,
            fontFamily: M,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: 1,
            background: acqSubView === v ? C.g + "18" : "transparent",
            color: acqSubView === v ? C.g : C.dm,
            border: `1px solid ${acqSubView === v ? C.g + "44" : "transparent"}`
          }}>{l}</span>)}</div> <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 5,
          marginBottom: 8
        }}>{kpi("ACQ MDF", fm(acqTotalCapReq), C.am)}{kpi("DEV MDF", fm(devTotalCapReq), C.pu)}{kpi("TOTAL REQUIS", fm(totalCapReqAll), C.rd)}{kpi("CAPITAL DISPO", fm(totalFundAvail), C.g)}{kpi("GAP", acqGap > 0 ? fm(acqGap) : "Couvert", acqGap > 0 ? C.rd : C.g)}{kpi("% ACQ", totalCapReqAll > 0 ? Math.round(acqTotalCapReq / totalCapReqAll * 100) + "%" : "0%", C.am)}{kpi("% DEV", totalCapReqAll > 0 ? Math.round(devTotalCapReq / totalCapReqAll * 100) + "%" : "0%", C.pu)}</div>{acqSubView === "acq" && <div> <div style={bx}> <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6
            }}> <Hd>Pipeline acquisitions</Hd> <button onClick={addAcq} style={{
                padding: "3px 10px",
                border: `1px solid ${C.g}44`,
                borderRadius: 3,
                background: C.g + "12",
                color: C.g,
                fontFamily: M,
                fontSize: 7,
                fontWeight: 600,
                cursor: "pointer"
              }}>+ AJOUTER</button></div> <div style={{
              overflowX: "auto"
            }}> <div style={{
                display: "grid",
                gridTemplateColumns: "1.6fr .5fr .7fr .7fr .6fr .7fr .5fr .5fr .3fr",
                gap: 2,
                fontSize: 6,
                fontFamily: M,
                color: C.dm,
                padding: "2px 0",
                borderBottom: "1px solid " + C.g + "33",
                fontWeight: 700,
                minWidth: 800
              }}> <span>PROJET</span> <span style={{
                  textAlign: "center"
                }}>TYPE</span> <span style={{
                  textAlign: "right"
                }}>PRIX ACQ.</span> <span style={{
                  textAlign: "right"
                }}>MDF</span> <span style={{
                  textAlign: "right"
                }}>CAPEX</span> <span style={{
                  textAlign: "right"
                }}>CASH TOTAL</span> <span style={{
                  textAlign: "center"
                }}>DATE</span> <span style={{
                  textAlign: "center"
                }}>STATUT</span> <span /></div>{acqs.map((a, i) => {
                const cashTotal = (a.mdf || 0) + (a.capex || 0);
                return <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr .5fr .7fr .7fr .6fr .7fr .5fr .5fr .3fr",
                  gap: 2,
                  fontSize: 8.5,
                  padding: "4px 0",
                  borderBottom: "1px solid " + C.bd + "12",
                  minWidth: 800,
                  alignItems: "center"
                }}> <EC value={a.n} type="text" onChange={v => updAcq(i, "n", v)} w={150} color={C.wh} /> <div style={{
                    textAlign: "center"
                  }}> <SC value={a.type || "Multi"} options={["Multi", "Commercial", "Terrain", "Chalet", "Mixte"]} onChange={v => updAcq(i, "type", v)} /></div> <div style={{
                    textAlign: "right"
                  }}> <EC value={a.total || 0} onChange={v => updAcq(i, "total", v)} color={C.bl} /></div> <div style={{
                    textAlign: "right"
                  }}> <EC value={a.mdf} onChange={v => updAcq(i, "mdf", v)} color={C.am} /></div> <div style={{
                    textAlign: "right"
                  }}> <EC value={a.capex || 0} onChange={v => updAcq(i, "capex", v)} color={C.rd} /></div> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    fontWeight: 600,
                    color: C.pu
                  }}>{fm(cashTotal)}</span> <div style={{
                    textAlign: "center"
                  }}> <EC value={a.date || ""} type="text" onChange={v => updAcq(i, "date", v)} w={65} color={C.wh} /></div> <div style={{
                    textAlign: "center"
                  }}> <SC value={a.status} options={["Analyse", "Action requise", "Financement", "Offre", "Fermé"]} onChange={v => updAcq(i, "status", v)} /></div> <span onClick={() => rmAcq(i)} style={{
                    cursor: "pointer",
                    fontSize: 8,
                    color: C.rd + "88",
                    textAlign: "center"
                  }}>✕</span></div>;
              })} <div style={{
                display: "grid",
                gridTemplateColumns: "1.6fr .5fr .7fr .7fr .6fr .7fr .5fr .5fr .3fr",
                gap: 2,
                fontSize: 9,
                padding: "6px 0",
                borderTop: "1px solid " + C.g + "33",
                marginTop: 3,
                fontWeight: 700,
                minWidth: 800
              }}> <span>TOTAL ({acqs.length})</span> <span /> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.bl
                }}>{fm(acqs.reduce((a, x) => a + (x.total || 0), 0))}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.am
                }}>{fm(acqs.reduce((a, x) => a + (x.mdf || 0), 0))}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.rd
                }}>{fm(acqs.reduce((a, x) => a + (x.capex || 0), 0))}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.pu
                }}>{fm(acqTotalCapReq)}</span> <span /> <span /> <span /></div></div></div></div>}{acqSubView === "dev" && <div> <div style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 6
          }}> <button onClick={addDev} style={{
              padding: "3px 12px",
              border: `1px solid ${C.pu}44`,
              borderRadius: 3,
              background: C.pu + "12",
              color: C.pu,
              fontFamily: M,
              fontSize: 7,
              fontWeight: 600,
              cursor: "pointer"
            }}>+ NOUVEAU PROJET</button></div>{devs.map((d, i) => {
            const totalCost = d.terrain + d.construction + d.softCosts + Math.round((d.terrain + d.construction + d.softCosts) * d.contingencyPct / 100);
            const noiStab = d.revStab - d.opexProj;
            const valStab = d.capRateStab > 0 ? noiStab / (d.capRateStab / 100) : 0;
            const profit = valStab - totalCost;
            const roiProj = d.mdf > 0 ? profit / d.mdf * 100 : 0;
            const intConst = d.debtConst * d.debtRate / 100 * (d.debtDur / 12);
            return <div key={i} style={{
              ...bx,
              marginBottom: 8,
              borderLeft: "3px solid " + C.pu
            }}> <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6
              }}> <div> <EC value={d.n} type="text" onChange={v => updDev(i, "n", v)} w={200} color={C.wh} /> <div style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 2
                  }}> <EC value={d.loc} type="text" onChange={v => updDev(i, "loc", v)} w={80} color={C.dm} /> <SC value={d.type} options={["Micro-chalet", "Multi", "Commercial", "Mixte", "Terrain", "Industriel"]} onChange={v => updDev(i, "type", v)} /> <SC value={d.status} options={["Pré-développement", "En construction", "Stabilisation", "Complété"]} onChange={v => updDev(i, "status", v)} /></div></div> <span onClick={() => rmDev(i)} style={{
                  cursor: "pointer",
                  fontSize: 10,
                  color: C.rd + "88",
                  fontFamily: M
                }}>✕</span></div> <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 8
              }}> <div> <div style={{
                    fontSize: 7,
                    color: C.pu,
                    fontFamily: M,
                    letterSpacing: 1,
                    marginBottom: 4
                  }}>COÛTS & CAPITAL</div>{[["Terrain", d.terrain, "terrain"], ["Construction", d.construction, "construction"], ["Soft costs", d.softCosts, "softCosts"]].map(([l, v, f]) => <div key={l} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.bd + "08",
                    alignItems: "center"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>{l}</span> <EC value={v} onChange={val => updDev(i, f, val)} w={70} color={C.am} /></div>)} <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.bd + "08",
                    alignItems: "center"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>Contingency</span> <EC value={d.contingencyPct} onChange={v => updDev(i, "contingencyPct", v)} w={30} suffix="%" color={C.am} /></div> <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderTop: "1px solid " + C.g + "33",
                    marginTop: 2
                  }}> <span style={{
                      fontSize: 8.5,
                      fontWeight: 700
                    }}>COÛT TOTAL</span> <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: M,
                      color: C.rd
                    }}>{fm(totalCost)}</span></div></div> <div> <div style={{
                    fontSize: 7,
                    color: C.pu,
                    fontFamily: M,
                    letterSpacing: 1,
                    marginBottom: 4
                  }}>FINANCEMENT</div>{[["Mise de fonds", d.mdf, "mdf", C.am], ["Dette construction", d.debtConst, "debtConst", C.rd]].map(([l, v, f, cl]) => <div key={l} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.bd + "08",
                    alignItems: "center"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>{l}</span> <EC value={v} onChange={val => updDev(i, f, val)} w={70} color={cl} /></div>)} <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.bd + "08",
                    alignItems: "center"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>Taux dette const.</span> <EC value={d.debtRate} onChange={v => updDev(i, "debtRate", v)} w={35} suffix="%" color={C.cy} /></div> <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.bd + "08",
                    alignItems: "center"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>Durée (mois)</span> <EC value={d.debtDur} onChange={v => updDev(i, "debtDur", v)} w={30} color={C.dm} /></div> <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>Int. construction</span> <span style={{
                      fontSize: 9,
                      fontFamily: M,
                      color: C.rd
                    }}>{fm(Math.round(intConst))}</span></div></div> <div> <div style={{
                    fontSize: 7,
                    color: C.pu,
                    fontFamily: M,
                    letterSpacing: 1,
                    marginBottom: 4
                  }}>PROJECTIONS STABILISÉES</div>{[["Revenus stabilisés", d.revStab, "revStab", C.wh], ["OPEX projeté", d.opexProj, "opexProj", C.rd]].map(([l, v, f, cl]) => <div key={l} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.bd + "08",
                    alignItems: "center"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>{l}</span> <EC value={v} onChange={val => updDev(i, f, val)} w={70} color={cl} /></div>)} <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.bd + "08"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>NOI stabilisé</span> <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: M,
                      color: C.g
                    }}>{fm(noiStab)}</span></div> <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.bd + "08",
                    alignItems: "center"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>Cap rate stab.</span> <EC value={d.capRateStab} onChange={v => updDev(i, "capRateStab", v)} w={30} suffix="%" color={C.cy} /></div> <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.bd + "08"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>Valeur à stab.</span> <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: M,
                      color: C.bl
                    }}>{fm(Math.round(valStab))}</span></div> <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderTop: "1px solid " + (profit > 0 ? C.g : C.rd) + "33",
                    marginTop: 2
                  }}> <span style={{
                      fontSize: 8.5,
                      fontWeight: 700
                    }}>PROFIT (EQUITY CRÉÉE)</span> <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: M,
                      color: profit > 0 ? C.g : C.rd
                    }}>{profit > 0 ? "+" : ""}{fm(Math.round(profit))}</span></div> <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>ROI projeté</span> <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: M,
                      color: roiProj > 20 ? C.g : C.am
                    }}>{roiProj.toFixed(0)}%</span></div></div> <div> <div style={{
                    fontSize: 7,
                    color: C.pu,
                    fontFamily: M,
                    letterSpacing: 1,
                    marginBottom: 4
                  }}>TIMELINE</div>{[["Début projet", d.dateDebut, "dateDebut"], ["Fin construction", d.dateFinConst, "dateFinConst"], ["Stabilisation", d.dateStab, "dateStab"], ["Refinancement", d.dateRefi, "dateRefi"]].map(([l, v, f]) => <div key={l} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "3px 0",
                    borderBottom: "1px solid " + C.bd + "08",
                    alignItems: "center"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>{l}</span> <EC value={v} type="text" onChange={val => updDev(i, f, val)} w={65} color={C.wh} /></div>)} <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "3px 0",
                    alignItems: "center"
                  }}> <span style={{
                      fontSize: 8,
                      color: C.ft
                    }}>Durée totale</span> <EC value={d.dureesMois} onChange={v => updDev(i, "dureesMois", v)} w={30} suffix="m" color={C.cy} /></div></div></div></div>;
          })}</div>}{acqSubView === "sum" && <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8
        }}> <div style={bx}> <Hd>Acquisitions — {acqs.length} projets</Hd>{acqs.map((a, i) => <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "3px 0",
              borderBottom: "1px solid " + C.bd + "12"
            }}> <div> <div style={{
                  fontSize: 9,
                  color: C.wh
                }}>{a.n}</div> <div style={{
                  fontSize: 6.5,
                  color: C.ft
                }}>{a.type} · {a.status}</div></div> <span style={{
                fontSize: 10,
                fontFamily: M,
                color: C.am
              }}>{fm((a.mdf || 0) + (a.capex || 0))}</span></div>)} <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px 0",
              borderTop: "1px solid " + C.am + "33",
              marginTop: 3,
              fontWeight: 700
            }}> <span>TOTAL ACQ</span> <span style={{
                fontFamily: M,
                color: C.am
              }}>{fm(acqTotalCapReq)}</span></div></div> <div style={bx}> <Hd>Développement — {devs.length} projets</Hd>{devs.map((d, i) => {
              const totalCost = d.terrain + d.construction + d.softCosts + Math.round((d.terrain + d.construction + d.softCosts) * d.contingencyPct / 100);
              const noiStab = d.revStab - d.opexProj;
              const valStab = d.capRateStab > 0 ? noiStab / (d.capRateStab / 100) : 0;
              const profit = valStab - totalCost;
              return <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "3px 0",
                borderBottom: "1px solid " + C.bd + "12",
                alignItems: "center"
              }}> <div> <div style={{
                    fontSize: 9,
                    color: C.wh
                  }}>{d.n}</div> <div style={{
                    fontSize: 6.5,
                    color: C.ft
                  }}>{d.type} · {d.status} · {d.dureesMois}m</div></div> <div style={{
                  textAlign: "right"
                }}> <div style={{
                    fontSize: 10,
                    fontFamily: M,
                    color: C.pu
                  }}>{fm(d.mdf)}</div> <div style={{
                    fontSize: 7,
                    fontFamily: M,
                    color: profit > 0 ? C.g : C.rd
                  }}>Profit: {fm(Math.round(profit))}</div></div></div>;
            })} <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px 0",
              borderTop: "1px solid " + C.pu + "33",
              marginTop: 3,
              fontWeight: 700
            }}> <span>TOTAL DEV</span> <span style={{
                fontFamily: M,
                color: C.pu
              }}>{fm(devTotalCapReq)}</span></div></div> <div style={{
            ...bx,
            gridColumn: "1 / -1",
            textAlign: "center"
          }}> <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10
            }}> <div> <div style={{
                  fontSize: 7,
                  color: C.ft,
                  fontFamily: M
                }}>CAPITAL TOTAL REQUIS</div> <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: M,
                  color: C.rd
                }}>{fm(totalCapReqAll)}</div></div> <div> <div style={{
                  fontSize: 7,
                  color: C.ft,
                  fontFamily: M
                }}>CAPITAL DISPONIBLE</div> <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: M,
                  color: C.g
                }}>{fm(totalFundAvail)}</div></div> <div> <div style={{
                  fontSize: 7,
                  color: C.ft,
                  fontFamily: M
                }}>GAP</div> <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: M,
                  color: acqGap > 0 ? C.rd : C.g
                }}>{acqGap > 0 ? fm(acqGap) : "Couvert ✓"}</div></div></div></div></div>}</div>}{tab === "val" && <div> <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
          gap: 5,
          marginBottom: 8
        }}> <div style={{
            background: C.p2,
            border: `1px solid ${C.bl}33`,
            borderRadius: 4,
            padding: "8px 10px",
            textAlign: "center"
          }}> <div style={{
              fontSize: 6.5,
              color: C.bl,
              fontFamily: M,
              letterSpacing: 1
            }}>VALEUR IMMOBILIÈRE BRUTE</div> <div style={{
              fontSize: 16,
              fontWeight: 700,
              fontFamily: M,
              color: C.bl
            }}>{fm(TASSETS)}</div></div> <div style={{
            background: C.p2,
            border: `1px solid ${C.g}33`,
            borderRadius: 4,
            padding: "8px 10px",
            textAlign: "center"
          }}> <div style={{
              fontSize: 6.5,
              color: C.g,
              fontFamily: M,
              letterSpacing: 1
            }}>VALEUR NET IMMOBILIÈRE</div> <div style={{
              fontSize: 16,
              fontWeight: 700,
              fontFamily: M,
              color: C.g
            }}>{fm(RE_NET)}</div> <div style={{
              fontSize: 7,
              color: C.dm,
              fontFamily: M
            }}>Actifs - Dettes totales</div></div> <div style={{
            background: C.p2,
            border: `1px solid ${C.cy}33`,
            borderRadius: 4,
            padding: "8px 10px",
            textAlign: "center"
          }}> <div style={{
              fontSize: 6.5,
              color: C.cy,
              fontFamily: M,
              letterSpacing: 1
            }}>VALEUR OPCOS</div> <div style={{
              fontSize: 16,
              fontWeight: 700,
              fontFamily: M,
              color: C.cy
            }}>{fm(OPCO_VAL)}</div> <div style={{
              fontSize: 7,
              color: C.dm,
              fontFamily: M
            }}>EBITDA x Multiples</div></div> <div style={{
            background: C.p2,
            border: `1px solid ${C.am}33`,
            borderRadius: 4,
            padding: "8px 10px",
            textAlign: "center"
          }}> <div style={{
              fontSize: 6.5,
              color: C.am,
              fontFamily: M,
              letterSpacing: 1
            }}>VALEUR INCOME (CAP RATE)</div> <div style={{
              fontSize: 16,
              fontWeight: 700,
              fontFamily: M,
              color: C.am
            }}>{fm(Math.round(RE_INCOME_VAL))}</div> <div style={{
              fontSize: 7,
              color: C.dm,
              fontFamily: M
            }}>NOI / Cap Rate {cr}%</div></div> <div style={{
            background: C.p2,
            border: `1px solid ${C.g}33`,
            borderRadius: 4,
            padding: "8px 10px",
            textAlign: "center",
            borderWidth: 2
          }}> <div style={{
              fontSize: 6.5,
              color: C.g,
              fontFamily: M,
              letterSpacing: 1
            }}>VALEUR TOTALE GROUPE</div> <div style={{
              fontSize: 16,
              fontWeight: 700,
              fontFamily: M,
              color: C.g
            }}>{fm(Math.round(RE_NET + OPCO_VAL))}</div> <div style={{
              fontSize: 7,
              color: C.dm,
              fontFamily: M
            }}>RE Net + OpCo Val</div></div></div> <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 8
        }}> <div style={bx}> <Hd>Valeur nette immobilière — Détail</Hd>{[["Actifs immobiliers bruts", fm(TASSETS), C.bl], ["(−) Dette hypothécaire LT", "-" + fm(LTD), C.rd], ["(−) Dette CT investisseurs", "-" + fm(std), C.rd], ["= EQUITY NETTE (NAV)", fm(RE_NET), C.g]].map(([l, v, cl], i) => <div key={l} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: i === 3 ? "6px 0 3px" : "3px 0",
              borderBottom: i < 3 ? "1px solid " + C.bd + "12" : "none",
              borderTop: i === 3 ? "1px solid " + C.g + "33" : "none"
            }}> <span style={{
                fontSize: 9,
                fontWeight: i === 3 ? 700 : 400
              }}>{l}</span> <span style={{
                fontSize: i === 3 ? 13 : 10,
                fontWeight: i === 3 ? 700 : 600,
                fontFamily: M,
                color: cl
              }}>{v}</span></div>)} <div style={{
              marginTop: 8
            }}> <div style={{
                fontSize: 7,
                color: C.dm,
                fontFamily: M,
                marginBottom: 4
              }}>VALEUR PAR MÉTHODE</div>{[["Book Value (NAV)", RE_NET, C.bl], ["Income Value (NOI/" + cr + "%)", RE_INCOME_VAL - DEBT, C.am], ["Revenus bruts RE", REREV, C.wh], ["NOI Total", NOI, C.g], ["Paiements hyp. annuels", REPMTHYP, C.rd], ["Cashflow net (NOI - Pmt)", NOI - REPMTHYP, NOI - REPMTHYP > 0 ? C.g : C.rd]].map(([l, v, cl]) => <div key={l} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "2px 0",
                borderBottom: "1px solid " + C.bd + "10"
              }}> <span style={{
                  fontSize: 8,
                  color: C.dm
                }}>{l}</span> <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  fontFamily: M,
                  color: cl
                }}>{fm(Math.round(v))}</span></div>)}</div></div> <div style={bx}> <Hd>Valeur OpCos — Détail par entreprise</Hd>{op.map((o, i) => <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: "1px solid " + C.bd + "12",
              alignItems: "center"
            }}> <div> <div style={{
                  fontSize: 9,
                  color: C.wh
                }}>{o.n}</div> <div style={{
                  fontSize: 6.5,
                  color: C.ft,
                  fontFamily: M
                }}>Net {fm(o.net)} × {o.mult}x · Marge {o.mg.toFixed(0)}%</div></div> <span style={{
                fontSize: 11,
                fontWeight: 700,
                fontFamily: M,
                color: C.cy
              }}>{fm(o.net * o.mult)}</span></div>)} <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0 3px",
              borderTop: "1px solid " + C.cy + "33",
              marginTop: 3,
              fontWeight: 700
            }}> <span style={{
                fontSize: 10
              }}>TOTAL OpCo</span> <span style={{
                fontSize: 14,
                fontFamily: M,
                color: C.cy
              }}>{fm(OPCO_VAL)}</span></div></div></div> <div style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 8
        }}> <div style={bx}> <Hd>Assumptions</Hd>{[["Cap Rate %", cr, setCr, 4, 10, 0.5], ["EBITDA x", em, setEm, 4, 14, 1], ["OpCo x", om, setOm, 2, 10, 1], ["Liq Disc %", ld, setLd, 0, 30, 5]].map(([l, v, fn, mn, mx, st]) => <div key={l} style={{
              marginBottom: 7
            }}> <div style={{
                display: "flex",
                justifyContent: "space-between"
              }}> <span style={{
                  fontSize: 8,
                  color: C.dm
                }}>{l}</span> <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: M,
                  color: C.g
                }}>{v}{String(l).includes("%") ? "%" : "x"}</span></div> <input type="range" min={mn} max={mx} step={st} value={v} onChange={e => fn(Number(e.target.value))} style={{
                width: "100%",
                accentColor: C.g,
                height: 3
              }} /></div>)} <div style={{
              padding: 10,
              background: C.bg,
              borderRadius: 4,
              border: "1px solid " + C.g + "22",
              marginTop: 6
            }}> <div style={{
                fontSize: 7,
                color: C.g,
                fontFamily: M,
                letterSpacing: 1.5
              }}>FINAL BLEND VALUE</div> <div style={{
                fontSize: 22,
                fontWeight: 700,
                color: C.g,
                fontFamily: M
              }}>{fm(Math.round(final))}</div> <div style={{
                fontSize: 7,
                color: C.dm,
                fontFamily: M,
                marginTop: 3
              }}>RE Net: {fm(RE_NET)} + OpCo: {fm(OPCO_VAL)} = {fm(RE_NET + OPCO_VAL)}</div></div></div> <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}> <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 5
            }}>{[["NAV (RE Net)", RE_NET, "30%", C.bl], ["INCOME", incV, "25%", C.g], ["EBITDA", ebV, "25%", C.am], ["OpCo Val", OPCO_VAL, "20%", C.cy]].map(([l, v, w, cl]) => <div key={l} style={{
                ...bx,
                borderLeft: "3px solid " + cl
              }}> <div style={{
                  fontSize: 7,
                  color: C.dm,
                  fontFamily: M
                }}>{l}</div> <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: M,
                  color: C.wh
                }}>{fm(Math.round(v))}</div> <div style={{
                  fontSize: 7,
                  color: cl,
                  fontFamily: M
                }}>Poids: {w}</div></div>)}</div> <div style={bx}> <Hd>Waterfall</Hd> <div style={{
                height: 160
              }}> <ResponsiveContainer> <BarChart data={[{
                    n: "RE Brut",
                    v: TASSETS
                  }, {
                    n: "Dettes",
                    v: -DEBT
                  }, {
                    n: "RE Net",
                    v: RE_NET
                  }, {
                    n: "OpCo Val",
                    v: OPCO_VAL
                  }, {
                    n: "Disc " + ld + "%",
                    v: -(RE_NET + OPCO_VAL) * ld / 100
                  }, {
                    n: "FINAL",
                    v: (RE_NET + OPCO_VAL) * (1 - ld / 100)
                  }]}> <XAxis dataKey="n" tick={{
                      fontSize: 7,
                      fill: C.dm
                    }} axisLine={{
                      stroke: C.bd
                    }} tickLine={false} /> <YAxis tick={{
                      fontSize: 7,
                      fill: C.ft
                    }} axisLine={false} tickLine={false} tickFormatter={v => fm(v)} /> <Tooltip content={Tp} /> <Bar dataKey="v" radius={[2, 2, 0, 0]} barSize={22}>{[C.bl, C.rd, C.g, C.cy, C.rd, C.g].map((cl, i) => <Cell key={i} fill={cl} />)}</Bar></BarChart></ResponsiveContainer></div></div></div></div></div>}{tab === "hypo" && (() => {
        const debts = pr.filter(p => p.d > 0).map(p => {
          const ltv = p.v > 0 ? p.d / p.v : 0;
          const dscr = p.pmtHyp > 0 ? p.noi / p.pmtHyp : 999;
          const quality = dscr >= 2.0 && ltv < 0.6 ? "A" : dscr >= 1.5 && ltv < 0.7 ? "B" : dscr >= 1.2 && ltv < 0.8 ? "C" : "D";
          const qCl = quality === "A" ? C.g : quality === "B" ? C.cy : quality === "C" ? C.am : C.rd;
          const yrsLeft = p.maturity > 0 ? p.maturity - 2026 : 0;
          const urgency = p.maturity <= 2027 ? "URGENT" : p.maturity <= 2029 ? "À PLANIFIER" : "OK";
          const uCl = urgency === "URGENT" ? C.rd : urgency === "À PLANIFIER" ? C.am : C.g;
          const estRefiRate = p.maturity <= 2027 ? 4.8 : p.maturity <= 2029 ? 4.3 : 4.0;
          const deltaCost = p.d * (estRefiRate - p.taux) / 100;
          const intAnnuel = p.d * p.taux / 100;
          const princAnnuel = p.pmtHyp - intAnnuel;
          return {
            ...p,
            ltv,
            dscr,
            quality,
            qCl,
            yrsLeft,
            urgency,
            uCl,
            estRefiRate,
            deltaCost,
            intAnnuel,
            princAnnuel
          };
        }).sort((a, b) => (a.maturity || 9999) - (b.maturity || 9999));
        const totalDebtLT = debts.reduce((a, d) => a + d.d, 0);
        const totalPmtAn = debts.reduce((a, d) => a + d.pmtHyp, 0);
        const totalIntAn = debts.reduce((a, d) => a + d.intAnnuel, 0);
        const totalDelta = debts.reduce((a, d) => a + Math.max(0, d.deltaCost), 0);
        const matWall = {};
        debts.forEach(d => {
          if (d.maturity > 0) {
            if (!matWall[d.maturity]) matWall[d.maturity] = {
              year: d.maturity,
              total: 0,
              count: 0
            };
            matWall[d.maturity].total += d.d;
            matWall[d.maturity].count += 1;
          }
        });
        return <div> <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 5,
            marginBottom: 8
          }}>{kpi("DETTE HYP. TOTALE", fm(totalDebtLT), C.rd)}{kpi("PMT ANNUEL", fm(totalPmtAn), C.am)}{kpi("INTÉRÊTS/AN", fm(totalIntAn), C.rd)}{kpi("TAUX PONDÉRÉ", wRate.toFixed(2) + "%", C.cy)}{kpi("Δ COÛT AU REFI", "+" + fm(Math.round(totalDelta)), C.rd)}{kpi("DETTE CT", fm(std), C.or)}</div> <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 8
          }}> <div style={bx}> <Hd>Maturity Wall — Échéancier</Hd> <div style={{
                height: 180
              }}> <ResponsiveContainer> <BarChart data={Object.values(matWall)}> <XAxis dataKey="year" tick={{
                      fontSize: 9,
                      fill: C.dm
                    }} axisLine={{
                      stroke: C.bd
                    }} tickLine={false} /> <YAxis tick={{
                      fontSize: 7,
                      fill: C.ft
                    }} axisLine={false} tickLine={false} tickFormatter={v => fm(v)} /> <Tooltip content={Tp} /> <Bar dataKey="total" name="Dette \xE0 renouveler" radius={[3, 3, 0, 0]} barSize={35}>{Object.values(matWall).map((d, i) => <Cell key={i} fill={d.year <= 2027 ? C.rd : d.year <= 2029 ? C.am : C.g} />)}</Bar></BarChart></ResponsiveContainer></div></div> <div style={bx}> <Hd>Qualité de la dette</Hd> <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 5,
                marginBottom: 10
              }}>{[["A", "DSCR≥2 LTV<60%", C.g], ["B", "DSCR≥1.5 LTV<70%", C.cy], ["C", "DSCR≥1.2 LTV<80%", C.am], ["D", "Risque élevé", C.rd]].map(([grade, desc, cl]) => {
                  const cnt = debts.filter(d => d.quality === grade).length;
                  const amt = debts.filter(d => d.quality === grade).reduce((a, d) => a + d.d, 0);
                  return <div key={grade} style={{
                    padding: 8,
                    background: cl + "08",
                    border: `1px solid ${cl}22`,
                    borderRadius: 4,
                    textAlign: "center"
                  }}> <div style={{
                      fontSize: 20,
                      fontWeight: 700,
                      fontFamily: M,
                      color: cl
                    }}>{grade}</div> <div style={{
                      fontSize: 7,
                      color: C.dm
                    }}>{desc}</div> <div style={{
                      fontSize: 9,
                      fontFamily: M,
                      color: cl,
                      marginTop: 3
                    }}>{cnt} prêts · {fm(amt)}</div></div>;
                })}</div> <div style={{
                height: 100
              }}> <ResponsiveContainer> <BarChart data={debts.map(d => ({
                    n: d.n.length > 10 ? d.n.slice(0, 9) + "…" : d.n,
                    dscr: parseFloat(d.dscr.toFixed(2))
                  }))}> <XAxis dataKey="n" tick={{
                      fontSize: 6,
                      fill: C.dm
                    }} axisLine={{
                      stroke: C.bd
                    }} tickLine={false} /> <YAxis tick={{
                      fontSize: 7,
                      fill: C.ft
                    }} axisLine={false} tickLine={false} /> <Tooltip content={Tp} /> <Bar dataKey="dscr" name="DSCR" radius={[2, 2, 0, 0]} barSize={14}>{debts.map((d, i) => <Cell key={i} fill={d.qCl} />)}</Bar></BarChart></ResponsiveContainer></div></div></div> <div style={bx}> <Hd>Calendrier hypothécaire détaillé</Hd> <div style={{
              overflowX: "auto"
            }}> <div style={{
                display: "grid",
                gridTemplateColumns: "1.5fr .7fr .5fr .5fr .6fr .6fr .5fr .5fr .5fr .4fr .4fr",
                gap: 2,
                fontSize: 6,
                fontFamily: M,
                color: C.dm,
                padding: "2px 0",
                borderBottom: "1px solid " + C.g + "33",
                fontWeight: 700,
                minWidth: 900
              }}> <span>PROPRIÉTÉ</span> <span style={{
                  textAlign: "right"
                }}>SOLDE</span> <span style={{
                  textAlign: "right"
                }}>TAUX</span> <span style={{
                  textAlign: "right"
                }}>ÉCHÉANCE</span> <span style={{
                  textAlign: "right"
                }}>PMT/AN</span> <span style={{
                  textAlign: "right"
                }}>INTÉRÊTS/AN</span> <span style={{
                  textAlign: "right"
                }}>CAPITAL/AN</span> <span style={{
                  textAlign: "right"
                }}>DSCR</span> <span style={{
                  textAlign: "right"
                }}>LTV</span> <span style={{
                  textAlign: "center"
                }}>QUALITÉ</span> <span style={{
                  textAlign: "center"
                }}>URGENCE</span></div>{debts.map((d, i) => <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "1.5fr .7fr .5fr .5fr .6fr .6fr .5fr .5fr .5fr .4fr .4fr",
                gap: 2,
                fontSize: 8.5,
                padding: "4px 0",
                borderBottom: "1px solid " + C.bd + "12",
                minWidth: 900,
                alignItems: "center"
              }}> <div> <div style={{
                    fontSize: 8.5,
                    color: C.wh
                  }}>{d.n}</div> <div style={{
                    fontSize: 6,
                    color: C.ft
                  }}>{d.t} · {d.loc}</div></div> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.am,
                  fontWeight: 600
                }}>{fm(d.d)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.cy
                }}>{d.taux}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: d.maturity <= 2027 ? C.rd : d.maturity <= 2029 ? C.am : C.g,
                  fontWeight: 600
                }}>{d.maturity || "—"}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M
                }}>{fm(d.pmtHyp)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.rd
                }}>{fm(Math.round(d.intAnnuel))}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.g
                }}>{fm(Math.round(Math.max(0, d.princAnnuel)))}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  fontWeight: 600,
                  color: d.dscr >= 1.5 ? C.g : d.dscr >= 1.2 ? C.am : C.rd
                }}>{d.dscr < 100 ? d.dscr.toFixed(2) + "x" : "∞"}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: d.ltv > 0.75 ? C.rd : d.ltv > 0.65 ? C.am : C.g
                }}>{pc(d.ltv)}</span> <div style={{
                  textAlign: "center"
                }}> <Tg c={d.qCl}>{d.quality}</Tg></div> <div style={{
                  textAlign: "center"
                }}> <Tg c={d.uCl}>{d.urgency}</Tg></div></div>)} <div style={{
                display: "grid",
                gridTemplateColumns: "1.5fr .7fr .5fr .5fr .6fr .6fr .5fr .5fr .5fr .4fr .4fr",
                gap: 2,
                fontSize: 9,
                padding: "6px 0",
                borderTop: "1px solid " + C.g + "33",
                marginTop: 3,
                fontWeight: 700,
                minWidth: 900
              }}> <span>TOTAL ({debts.length} prêts)</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.rd
                }}>{fm(totalDebtLT)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.cy,
                  fontSize: 7.5
                }}>{wRate.toFixed(2)}%</span> <span /> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.am
                }}>{fm(totalPmtAn)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.rd
                }}>{fm(Math.round(totalIntAn))}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.g
                }}>{fm(Math.round(totalPmtAn - totalIntAn))}</span> <span /> <span /> <span /> <span /></div></div></div> <div style={{
            ...bx,
            marginTop: 8
          }}> <Hd>Impact refinancement estimé</Hd>{debts.filter(d => d.maturity > 0).map((d, i) => <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: "1px solid " + C.bd + "12",
              alignItems: "center"
            }}> <div> <div style={{
                  fontSize: 9,
                  color: C.wh
                }}>{d.n} — Éch. {d.maturity}</div> <div style={{
                  fontSize: 7,
                  color: C.ft,
                  fontFamily: M
                }}>Taux actuel {d.taux}% → estimé {d.estRefiRate}%</div></div> <div style={{
                textAlign: "right"
              }}> <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: M,
                  color: d.deltaCost > 0 ? C.rd : C.g
                }}>{d.deltaCost > 0 ? "+" : ""}{fm(Math.round(d.deltaCost))}/an</span></div></div>)} <div style={{
              marginTop: 6,
              padding: 6,
              background: C.rd + "08",
              border: `1px solid ${C.rd}18`,
              borderRadius: 3
            }}> <div style={{
                fontSize: 8,
                color: C.rd,
                fontFamily: M,
                fontWeight: 600
              }}>Coût additionnel total estimé au refi: +{fm(Math.round(totalDelta))}/an</div></div></div></div>;
      })()}{tab === "cfo" && (() => {
        const ent = entities[cfoSel] || entities[0];
        if (!ent) return <div>Aucune entité</div>;

        // Per-entity monthly calcs
        const entCalc = e => {
          const monthly = MO.map((m, mi) => {
            const rev = (e.rev[mi] || []).reduce((a, l) => a + l.v, 0);
            const fix = (e.fixe[mi] || []).reduce((a, l) => a + l.v, 0);
            const vr = (e.variable[mi] || []).reduce((a, l) => a + l.v, 0);
            const net = rev - fix - vr;
            return {
              m,
              rev,
              fix,
              vr,
              net
            };
          });
          let cash = e.cash0 || 0;
          monthly.forEach(mo => {
            cash += mo.net;
            mo.cash = cash;
          });
          const totRev = monthly.reduce((a, m) => a + m.rev, 0);
          const totExp = monthly.reduce((a, m) => a + m.fix + m.vr, 0);
          const totNet = monthly.reduce((a, m) => a + m.net, 0);
          const margin = totRev > 0 ? totNet / totRev * 100 : 0;
          const profitable = monthly.filter(m => m.net > 0).length;
          const burnRate = totNet < 0 ? Math.abs(totNet / 12) : 0;
          return {
            monthly,
            totRev,
            totExp,
            totNet,
            margin,
            profitable,
            burnRate,
            avgNet: totNet / 12
          };
        };
        const ec = entCalc(ent);

        // Consolidated
        const allCalcs = entities.map(e => entCalc(e));
        const consMo = MO.map((m, mi) => ({
          m,
          rev: allCalcs.reduce((a, c) => a + c.monthly[mi].rev, 0),
          exp: allCalcs.reduce((a, c) => a + c.monthly[mi].fix + c.monthly[mi].vr, 0),
          net: allCalcs.reduce((a, c) => a + c.monthly[mi].net, 0)
        }));
        let consCash = entities.reduce((a, e) => a + (e.cash0 || 0), 0);
        consMo.forEach(m => {
          consCash += m.net;
          m.cash = consCash;
        });
        const consTotRev = consMo.reduce((a, m) => a + m.rev, 0);
        const consTotNet = consMo.reduce((a, m) => a + m.net, 0);

        // Grid render helper
        const renderGrid = (eIdx, cat, label, cl) => {
          const e = entities[eIdx];
          const lines = e[cat][0] || [];
          return <div style={{
            marginBottom: 6
          }}> <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 2
            }}> <span style={{
                fontSize: 7,
                color: cl,
                fontFamily: M,
                letterSpacing: 1
              }}>{label}</span> <span onClick={() => addLine(eIdx, cat, label === "REVENUS" ? "Nouveau revenu" : "Nouvelle dépense")} style={{
                fontSize: 7,
                color: cl,
                cursor: "pointer",
                fontFamily: M
              }}>+ ligne</span></div> <div style={{
              overflowX: "auto"
            }}> <div style={{
                display: "grid",
                gridTemplateColumns: "1fr " + MO.map(() => ".55fr").join(" ") + " .6fr",
                gap: 1,
                fontSize: 6,
                fontFamily: M,
                color: C.dm,
                padding: "1px 0",
                borderBottom: "1px solid " + cl + "33",
                fontWeight: 700,
                minWidth: 800
              }}> <span>POSTE</span>{MO.map(m => <span key={m} style={{
                  textAlign: "right"
                }}>{m}</span>)} <span style={{
                  textAlign: "right"
                }}>TOTAL</span></div>{lines.map((line, li) => {
                const tot = e[cat].reduce((a, mo) => a + (mo[li] ? mo[li].v : 0), 0);
                return <div key={li} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr " + MO.map(() => ".55fr").join(" ") + " .6fr",
                  gap: 1,
                  fontSize: 8,
                  padding: "2px 0",
                  borderBottom: "1px solid " + C.bd + "08",
                  minWidth: 800,
                  alignItems: "center"
                }}> <EC value={line.n} type="text" onChange={v => MO.forEach((_, mi) => updLine(eIdx, cat, mi, li, "n", v))} w={80} color={C.wh} />{MO.map((_, mi) => <div key={mi} style={{
                    textAlign: "right"
                  }}> <EC value={e[cat][mi] && e[cat][mi][li] ? e[cat][mi][li].v : 0} onChange={v => updLine(eIdx, cat, mi, li, "v", v)} w={42} color={cl} /></div>)} <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    fontWeight: 600,
                    color: cl,
                    fontSize: 8.5
                  }}>{fm(tot)}</span></div>;
              })} <div style={{
                display: "grid",
                gridTemplateColumns: "1fr " + MO.map(() => ".55fr").join(" ") + " .6fr",
                gap: 1,
                fontSize: 8.5,
                padding: "3px 0",
                borderTop: "1px solid " + cl + "33",
                fontWeight: 700,
                minWidth: 800
              }}> <span style={{
                  color: cl
                }}>TOTAL</span>{MO.map((_, mi) => {
                  const moTot = (e[cat][mi] || []).reduce((a, l) => a + l.v, 0);
                  return <span key={mi} style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: cl
                  }}>{fm(moTot)}</span>;
                })} <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: cl
                }}>{fm(e[cat].reduce((a, mo) => a + mo.reduce((b, l) => b + l.v, 0), 0))}</span></div></div></div>;
        };
        return <div> <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            padding: "4px 0",
            borderBottom: "1px solid " + C.bd
          }}> <div style={{
              display: "flex",
              gap: 3
            }}>{entities.map((e, i) => <span key={i} onClick={() => {
                setCfoSel(i);
                setCfoView("entity");
              }} style={{
                padding: "4px 10px",
                borderRadius: 3,
                fontSize: 8,
                fontFamily: M,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 0.5,
                background: cfoView === "entity" && cfoSel === i ? C.g + "18" : "transparent",
                color: cfoView === "entity" && cfoSel === i ? C.g : C.dm,
                border: `1px solid ${cfoView === "entity" && cfoSel === i ? C.g + "44" : "transparent"}`
              }}>{e.n.length > 12 ? e.n.slice(0, 11) + "…" : e.n}</span>)} <span onClick={() => setCfoView("cons")} style={{
                padding: "4px 10px",
                borderRadius: 3,
                fontSize: 8,
                fontFamily: M,
                fontWeight: 700,
                cursor: "pointer",
                background: cfoView === "cons" ? C.bl + "18" : "transparent",
                color: cfoView === "cons" ? C.bl : C.dm,
                border: `1px solid ${cfoView === "cons" ? C.bl + "44" : "transparent"}`
              }}>CONSOLIDÉ</span></div> <button onClick={addEnt} style={{
              padding: "3px 10px",
              border: `1px solid ${C.g}44`,
              borderRadius: 3,
              background: C.g + "12",
              color: C.g,
              fontFamily: M,
              fontSize: 7,
              fontWeight: 600,
              cursor: "pointer"
            }}>+ SOCIÉTÉ</button></div>{cfoView === "entity" && <div> <div style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 6
            }}> <EC value={ent.n} type="text" onChange={v => updEntField(cfoSel, "n", v)} w={140} color={C.wh} /> <SC value={ent.type} options={["Holding", "OpCo", "PropCo", "Autre"]} onChange={v => updEntField(cfoSel, "type", v)} /> <span style={{
                fontSize: 7,
                color: C.ft
              }}>Détention:</span> <EC value={ent.pct} onChange={v => updEntField(cfoSel, "pct", v)} w={30} suffix="%" color={C.am} /> <span style={{
                fontSize: 7,
                color: C.ft
              }}>Cash initial:</span> <EC value={ent.cash0 || 0} onChange={v => updEntField(cfoSel, "cash0", v)} w={55} color={C.cy} /> <span onClick={() => setEntities(p => p.filter((_, idx) => idx !== cfoSel))} style={{
                cursor: "pointer",
                fontSize: 8,
                color: C.rd + "66",
                fontFamily: M,
                marginLeft: "auto"
              }}>✕ Supprimer</span></div> <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 5,
              marginBottom: 8
            }}>{kpi("REV ANNUEL", fm(ec.totRev), C.g)}{kpi("DÉP ANNUELLES", fm(ec.totExp), C.rd)}{kpi("CF NET ANNUEL", fm(ec.totNet), ec.totNet >= 0 ? C.g : C.rd)}{kpi("MARGE NETTE", ec.margin.toFixed(1) + "%", ec.margin > 15 ? C.g : ec.margin > 0 ? C.am : C.rd)}{kpi("MOY/MOIS", fm(Math.round(ec.avgNet)), ec.avgNet >= 0 ? C.g : C.rd)}{kpi("MOIS RENTABLES", ec.profitable + "/12", ec.profitable >= 10 ? C.g : ec.profitable >= 6 ? C.am : C.rd)}</div> <div style={bx}>{renderGrid(cfoSel, "rev", "REVENUS", C.g)}{renderGrid(cfoSel, "fixe", "DÉPENSES FIXES", C.rd)}{renderGrid(cfoSel, "variable", "DÉPENSES VARIABLES", C.am)} <div style={{
                marginTop: 6,
                overflowX: "auto"
              }}> <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr " + MO.map(() => ".55fr").join(" ") + " .6fr",
                  gap: 1,
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "4px 0",
                  borderTop: "2px solid " + C.g + "44",
                  minWidth: 800
                }}> <span style={{
                    color: C.g
                  }}>CF NET</span>{ec.monthly.map((m, mi) => <span key={mi} style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: m.net >= 0 ? C.g : C.rd
                  }}>{fm(m.net)}</span>)} <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: ec.totNet >= 0 ? C.g : C.rd
                  }}>{fm(ec.totNet)}</span></div> <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr " + MO.map(() => ".55fr").join(" ") + " .6fr",
                  gap: 1,
                  fontSize: 8,
                  padding: "3px 0",
                  borderTop: "1px solid " + C.bd,
                  minWidth: 800
                }}> <span style={{
                    color: C.cy
                  }}>CASH BANQUE</span>{ec.monthly.map((m, mi) => <span key={mi} style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: m.cash >= 0 ? C.cy : C.rd
                  }}>{fm(Math.round(m.cash))}</span>)} <span /></div></div></div> <div style={{
              ...bx,
              marginTop: 8
            }}> <Hd>Cash Flow mensuel — {ent.n}</Hd> <div style={{
                height: 180
              }}> <ResponsiveContainer> <BarChart data={ec.monthly.map(m => ({
                    m: m.m,
                    Revenus: m.rev,
                    "Dép. fixes": -m.fix,
                    "Dép. var.": -m.vr,
                    "CF Net": m.net
                  }))}> <XAxis dataKey="m" tick={{
                      fontSize: 7,
                      fill: C.dm
                    }} axisLine={{
                      stroke: C.bd
                    }} tickLine={false} /> <YAxis tick={{
                      fontSize: 7,
                      fill: C.ft
                    }} axisLine={false} tickLine={false} tickFormatter={v => fm(v)} /> <Tooltip content={Tp} /> <Bar dataKey="Revenus" fill={C.g} barSize={8} radius={[2, 2, 0, 0]} /> <Bar dataKey="D\xE9p. fixes" fill={C.rd} barSize={8} radius={[2, 2, 0, 0]} /> <Bar dataKey="D\xE9p. var." fill={C.am} barSize={8} radius={[2, 2, 0, 0]} /> <Legend wrapperStyle={{
                      fontSize: 7,
                      fontFamily: M
                    }} /></BarChart></ResponsiveContainer></div></div> <div style={{
              ...bx,
              marginTop: 8
            }}> <Hd>Tendance — Cash en banque cumulatif</Hd> <div style={{
                height: 140
              }}> <ResponsiveContainer> <AreaChart data={ec.monthly.map(m => ({
                    m: m.m,
                    Cash: Math.round(m.cash)
                  }))}> <XAxis dataKey="m" tick={{
                      fontSize: 7,
                      fill: C.dm
                    }} axisLine={{
                      stroke: C.bd
                    }} tickLine={false} /> <YAxis tick={{
                      fontSize: 7,
                      fill: C.ft
                    }} axisLine={false} tickLine={false} tickFormatter={v => fm(v)} /> <Tooltip content={Tp} /> <Area type="monotone" dataKey="Cash" stroke={C.cy} fill={C.cy + "15"} strokeWidth={2} /></AreaChart></ResponsiveContainer></div></div> <div style={{
              ...bx,
              marginTop: 8
            }}> <Hd>Prévision 12 mois — 3 scénarios</Hd>{(() => {
                const avgRev = ec.totRev / 12;
                const avgExp = ec.totExp / 12;
                const scenarios = [{
                  n: "Conservateur",
                  revGr: -0.02,
                  expGr: 0.03,
                  cl: C.rd
                }, {
                  n: "Base",
                  revGr: 0.03,
                  expGr: 0.02,
                  cl: C.bl
                }, {
                  n: "Agressif",
                  revGr: 0.08,
                  expGr: 0.01,
                  cl: C.g
                }];
                return <div> <div style={{
                    display: "grid",
                    gridTemplateColumns: ".8fr " + MO.map(() => ".55fr").join(" ") + " .7fr",
                    gap: 1,
                    fontSize: 6,
                    fontFamily: M,
                    color: C.dm,
                    padding: "2px 0",
                    borderBottom: "1px solid " + C.g + "33",
                    fontWeight: 700,
                    minWidth: 850,
                    overflowX: "auto"
                  }}> <span>SCÉNARIO</span>{MO.map(m => <span key={m} style={{
                      textAlign: "right"
                    }}>{m}</span>)} <span style={{
                      textAlign: "right"
                    }}>ANNUEL</span></div>{scenarios.map((s, si) => {
                    let csh = ec.monthly[11] ? ec.monthly[11].cash : 0;
                    const mths = MO.map((m, mi) => {
                      const r = avgRev * Math.pow(1 + s.revGr, (mi + 1) / 12);
                      const e2 = avgExp * Math.pow(1 + s.expGr, (mi + 1) / 12);
                      const n = r - e2;
                      csh += n;
                      return {
                        m,
                        rev: Math.round(r),
                        exp: Math.round(e2),
                        net: Math.round(n),
                        cash: Math.round(csh)
                      };
                    });
                    const totN = mths.reduce((a, m2) => a + m2.net, 0);
                    return <div key={si} style={{
                      display: "grid",
                      gridTemplateColumns: ".8fr " + MO.map(() => ".55fr").join(" ") + " .7fr",
                      gap: 1,
                      fontSize: 8,
                      padding: "3px 0",
                      borderBottom: "1px solid " + C.bd + "10",
                      minWidth: 850,
                      overflowX: "auto"
                    }}> <span style={{
                        fontWeight: 600,
                        color: s.cl
                      }}>{s.n}</span>{mths.map((m2, mi2) => <span key={mi2} style={{
                        textAlign: "right",
                        fontFamily: M,
                        color: m2.net >= 0 ? C.g : C.rd
                      }}>{fm(m2.net)}</span>)} <span style={{
                        textAlign: "right",
                        fontFamily: M,
                        fontWeight: 700,
                        color: totN >= 0 ? s.cl : C.rd
                      }}>{fm(Math.round(totN))}</span></div>;
                  })} <div style={{
                    height: 150,
                    marginTop: 8
                  }}> <ResponsiveContainer> <LineChart data={MO.map((m, mi) => {
                        const base = {};
                        base.m = m;
                        scenarios.forEach(s => {
                          const r = avgRev * Math.pow(1 + s.revGr, (mi + 1) / 12);
                          const e2 = avgExp * Math.pow(1 + s.expGr, (mi + 1) / 12);
                          base[s.n] = Math.round(r - e2);
                        });
                        return base;
                      })}> <XAxis dataKey="m" tick={{
                          fontSize: 7,
                          fill: C.dm
                        }} axisLine={{
                          stroke: C.bd
                        }} tickLine={false} /> <YAxis tick={{
                          fontSize: 7,
                          fill: C.ft
                        }} axisLine={false} tickLine={false} tickFormatter={v => fm(v)} /> <Tooltip content={Tp} />{scenarios.map(s => <Line key={s.n} type="monotone" dataKey={s.n} stroke={s.cl} strokeWidth={2} dot={false} />)} <Legend wrapperStyle={{
                          fontSize: 7,
                          fontFamily: M
                        }} /></LineChart></ResponsiveContainer></div></div>;
              })()}</div></div>}{cfoView === "cons" && <div> <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 5,
              marginBottom: 8
            }}>{kpi("REV CONSOLIDÉ", fm(consTotRev), C.g)}{kpi("CF NET CONSOLIDÉ", fm(consTotNet), consTotNet >= 0 ? C.g : C.rd)}{kpi("CASH INITIAL", fm(entities.reduce((a, e) => a + (e.cash0 || 0), 0)), C.cy)}{kpi("CASH FIN D'ANNÉE", fm(Math.round(consMo[11] ? consMo[11].cash : 0)), consMo[11] && consMo[11].cash >= 0 ? C.g : C.rd)}{kpi("NB ENTITÉS", String(entities.length), C.bl)}</div> <div style={{
              ...bx,
              marginBottom: 8
            }}> <Hd>Vue consolidée — Revenus vs Dépenses vs CF Net</Hd> <div style={{
                height: 200
              }}> <ResponsiveContainer> <BarChart data={consMo.map(m => ({
                    m: m.m,
                    Revenus: m.rev,
                    Dépenses: -m.exp,
                    "CF Net": m.net
                  }))}> <XAxis dataKey="m" tick={{
                      fontSize: 7,
                      fill: C.dm
                    }} axisLine={{
                      stroke: C.bd
                    }} tickLine={false} /> <YAxis tick={{
                      fontSize: 7,
                      fill: C.ft
                    }} axisLine={false} tickLine={false} tickFormatter={v => fm(v)} /> <Tooltip content={Tp} /> <Bar dataKey="Revenus" fill={C.g} barSize={12} radius={[2, 2, 0, 0]} /> <Bar dataKey="D\xE9penses" fill={C.rd} barSize={12} radius={[2, 2, 0, 0]} /> <Bar dataKey="CF Net" fill={C.bl} barSize={12} radius={[2, 2, 0, 0]} /> <Legend wrapperStyle={{
                      fontSize: 7,
                      fontFamily: M
                    }} /></BarChart></ResponsiveContainer></div></div> <div style={{
              ...bx,
              marginBottom: 8
            }}> <Hd>Cash en banque consolidé — Tendance</Hd> <div style={{
                height: 140
              }}> <ResponsiveContainer> <AreaChart data={consMo.map(m => ({
                    m: m.m,
                    Cash: Math.round(m.cash),
                    "CF Net": m.net
                  }))}> <XAxis dataKey="m" tick={{
                      fontSize: 7,
                      fill: C.dm
                    }} axisLine={{
                      stroke: C.bd
                    }} tickLine={false} /> <YAxis tick={{
                      fontSize: 7,
                      fill: C.ft
                    }} axisLine={false} tickLine={false} tickFormatter={v => fm(v)} /> <Tooltip content={Tp} /> <Area type="monotone" dataKey="Cash" stroke={C.cy} fill={C.cy + "12"} strokeWidth={2} /> <Area type="monotone" dataKey="CF Net" stroke={C.g} fill={C.g + "08"} strokeWidth={1.5} /> <Legend wrapperStyle={{
                      fontSize: 7,
                      fontFamily: M
                    }} /></AreaChart></ResponsiveContainer></div></div> <div style={bx}> <Hd>Cash Flow consolidé mensuel</Hd> <div style={{
                overflowX: "auto"
              }}> <div style={{
                  display: "grid",
                  gridTemplateColumns: ".5fr .7fr .7fr .7fr .7fr",
                  gap: 2,
                  fontSize: 6.5,
                  fontFamily: M,
                  color: C.dm,
                  padding: "2px 0",
                  borderBottom: "1px solid " + C.g + "33",
                  fontWeight: 700,
                  minWidth: 600
                }}> <span>MOIS</span> <span style={{
                    textAlign: "right"
                  }}>REVENUS</span> <span style={{
                    textAlign: "right"
                  }}>DÉPENSES</span> <span style={{
                    textAlign: "right"
                  }}>CF NET</span> <span style={{
                    textAlign: "right"
                  }}>CASH BANQUE</span></div>{consMo.map((m, i) => <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: ".5fr .7fr .7fr .7fr .7fr",
                  gap: 2,
                  fontSize: 9,
                  padding: "3px 0",
                  borderBottom: "1px solid " + C.bd + "10",
                  minWidth: 600
                }}> <span style={{
                    fontWeight: 600,
                    color: C.wh
                  }}>{m.m}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.g
                  }}>{fm(m.rev)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.rd
                  }}>{fm(m.exp)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    fontWeight: 700,
                    color: m.net >= 0 ? C.g : C.rd
                  }}>{fm(m.net)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: m.cash >= 0 ? C.cy : C.rd
                  }}>{fm(Math.round(m.cash))}</span></div>)} <div style={{
                  display: "grid",
                  gridTemplateColumns: ".5fr .7fr .7fr .7fr .7fr",
                  gap: 2,
                  fontSize: 9.5,
                  padding: "5px 0",
                  borderTop: "1px solid " + C.g + "33",
                  fontWeight: 700,
                  minWidth: 600
                }}> <span>ANNUEL</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.g
                  }}>{fm(consTotRev)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.rd
                  }}>{fm(consMo.reduce((a, m) => a + m.exp, 0))}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: consTotNet >= 0 ? C.g : C.rd
                  }}>{fm(consTotNet)}</span> <span /></div></div></div> <div style={{
              ...bx,
              marginTop: 8
            }}> <Hd>Sommaire par société</Hd> <div style={{
                display: "grid",
                gridTemplateColumns: "1.3fr .5fr .6fr .6fr .6fr .6fr .5fr",
                gap: 2,
                fontSize: 6.5,
                fontFamily: M,
                color: C.dm,
                padding: "2px 0",
                borderBottom: "1px solid " + C.g + "33",
                fontWeight: 700
              }}> <span>SOCIÉTÉ</span> <span style={{
                  textAlign: "center"
                }}>TYPE</span> <span style={{
                  textAlign: "right"
                }}>REV</span> <span style={{
                  textAlign: "right"
                }}>DÉPENSES</span> <span style={{
                  textAlign: "right"
                }}>CF NET</span> <span style={{
                  textAlign: "right"
                }}>MARGE</span> <span style={{
                  textAlign: "right"
                }}>MOIS +</span></div>{entities.map((e, i) => {
                const c = allCalcs[i];
                return <div key={i} onClick={() => {
                  setCfoSel(i);
                  setCfoView("entity");
                }} style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr .5fr .6fr .6fr .6fr .6fr .5fr",
                  gap: 2,
                  fontSize: 9,
                  padding: "4px 0",
                  borderBottom: "1px solid " + C.bd + "10",
                  cursor: "pointer",
                  alignItems: "center"
                }} onMouseEnter={ev => ev.currentTarget.style.background = C.g + "06"} onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}> <div> <div style={{
                      color: C.wh,
                      fontWeight: 600
                    }}>{e.n}</div> <div style={{
                      fontSize: 6,
                      color: C.ft
                    }}>{e.pct}% détention</div></div> <div style={{
                    textAlign: "center"
                  }}> <Tg c={e.type === "PropCo" ? C.bl : e.type === "Holding" ? C.pu : C.cy}>{e.type}</Tg></div> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.g
                  }}>{fm(c.totRev)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: C.rd
                  }}>{fm(c.totExp)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    fontWeight: 700,
                    color: c.totNet >= 0 ? C.g : C.rd
                  }}>{fm(c.totNet)}</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: c.margin > 15 ? C.g : c.margin > 0 ? C.am : C.rd
                  }}>{c.margin.toFixed(0)}%</span> <span style={{
                    textAlign: "right",
                    fontFamily: M,
                    color: c.profitable >= 10 ? C.g : C.am
                  }}>{c.profitable}/12</span></div>;
              })}</div></div>}</div>;
      })()}{tab === "perf" && (() => {
        const holdYrs = 5;
        const defAppr = projDefAppr / 100 || 0.03;
        const rentGr = 0.04;
        const vacRate = 0.03;
        const expGr = 0.02;

        // Per-asset full analysis
        const perfAssets = pr.filter(p => p.v > 0 && p.t !== "Liq").map(p => {
          const eq = p.v - p.d;
          const cashReq = p.pxAcq > 0 ? Math.max(1, p.pxAcq - p.d + p.capex) : Math.max(1, eq);
          const noi = p.noi > 0 ? p.noi : 0;
          const opex = Math.max(0, (p.rev || 0) - noi);
          const apprRate = p.appr > 0 ? p.appr / 100 : defAppr;
          const mRate = p.taux > 0 ? p.taux / 100 / 12 : 0;
          const terme = (p.termes || 25) * 12;
          const pmt = p.d > 0 && mRate > 0 ? p.d * mRate / (1 - Math.pow(1 + mRate, -terme)) * 12 : p.pmtHyp || 0;
          const dscr = pmt > 0 ? noi / pmt : noi > 0 ? 99 : 0;
          const cf = noi - pmt;
          const roi = cashReq > 0 ? cf / cashReq * 100 : 0;
          const coc = cashReq > 0 ? cf / cashReq * 100 : 0;
          const capRate = p.v > 0 && noi > 0 ? noi / p.v * 100 : 0;
          // IRR Newton
          const irrCFs = [-cashReq];
          let projNoi = noi,
            projDebt = p.d;
          for (let y = 1; y <= holdYrs; y++) {
            projNoi *= 1 + rentGr;
            const yrPmt = pmt;
            const yrInt = projDebt * (p.taux / 100);
            const yrPrinc = Math.min(yrPmt > 0 ? yrPmt - yrInt : 0, projDebt);
            projDebt = Math.max(0, projDebt - yrPrinc);
            const yrCF = projNoi * (1 - vacRate) - yrPmt;
            if (y < holdYrs) irrCFs.push(yrCF);else irrCFs.push(yrCF + p.v * Math.pow(1 + apprRate, holdYrs) - projDebt);
          }
          let irr = 0.1;
          for (let it = 0; it < 100; it++) {
            let npv = 0,
              dnpv = 0;
            for (let j = 0; j < irrCFs.length; j++) {
              npv += irrCFs[j] / Math.pow(1 + irr, j);
              dnpv -= j * irrCFs[j] / Math.pow(1 + irr, j + 1);
            }
            if (Math.abs(dnpv) < 0.001) break;
            const ni = irr - npv / dnpv;
            if (Math.abs(ni - irr) < 0.0001) {
              irr = ni;
              break;
            }
            irr = Math.max(-0.5, Math.min(2, ni));
          }
          const weight = p.v / TASSETS;
          const status = dscr < 1 ? "CRITIQUE" : dscr < 1.2 ? "SOUS-PERF" : roi < 3 ? "FAIBLE" : "OPTIMAL";
          const stCl = status === "OPTIMAL" ? C.g : status === "FAIBLE" ? C.am : status === "SOUS-PERF" ? C.or : C.rd;
          const reco = dscr < 1 ? "VENTE" : dscr < 1.2 ? "REFI" : roi < 4 ? "REPOSIT." : "CONSERVER";
          const recoCl = reco === "VENTE" ? C.rd : reco === "REFI" ? C.am : reco === "REPOSIT." ? C.cy : C.g;
          return {
            n: p.n,
            t: p.t,
            v: p.v,
            d: p.d,
            noi,
            rev: p.rev || 0,
            opex,
            cashReq,
            pmt,
            dscr,
            cf,
            roi,
            coc,
            capRate,
            irr: irr * 100,
            weight,
            status,
            stCl,
            reco,
            recoCl,
            appr: p.appr,
            mdf: p.pxAcq > 0 ? Math.max(0, p.pxAcq - p.d) : eq,
            capex: p.capex
          };
        });

        // Weighted KPIs
        const totV = perfAssets.reduce((a, x) => a + x.v, 0);
        const totD = perfAssets.reduce((a, x) => a + x.d, 0);
        const totNoi = perfAssets.reduce((a, x) => a + x.noi, 0);
        const totRev = perfAssets.reduce((a, x) => a + x.rev, 0);
        const totDS = perfAssets.reduce((a, x) => a + x.pmt, 0);
        const totCF = perfAssets.reduce((a, x) => a + x.cf, 0);
        const totCashReq = perfAssets.reduce((a, x) => a + x.cashReq, 0);
        const wIRR = totV > 0 ? perfAssets.reduce((a, x) => a + x.irr * x.weight, 0) : 0;
        const wROI = totV > 0 ? perfAssets.reduce((a, x) => a + x.roi * x.weight, 0) : 0;
        const wDSCR = totDS > 0 ? totNoi / totDS : 99;
        const wCoC = totV > 0 ? perfAssets.reduce((a, x) => a + x.coc * x.weight, 0) : 0;
        const wCapRate = totV > 0 ? perfAssets.reduce((a, x) => a + x.capRate * x.weight, 0) : 0;
        const gLTVPerf = totV > 0 ? totD / totV : 0;
        const sorted = [...perfAssets].sort((a, b) => b.irr - a.irr);
        return <div> <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 5,
            marginBottom: 8
          }}>{[["IRR PONDÉRÉ", wIRR.toFixed(1) + "%", wIRR > 12 ? C.g : C.am], ["ROI PONDÉRÉ", wROI.toFixed(1) + "%", wROI > 5 ? C.g : C.am], ["DSCR PONDÉRÉ", wDSCR < 50 ? wDSCR.toFixed(2) + "x" : "∞", wDSCR >= 1.25 ? C.g : C.am], ["CoC PONDÉRÉ", wCoC.toFixed(1) + "%", wCoC > 5 ? C.g : C.am]].map(([l, v, cl]) => <div key={l} style={{
              background: C.p2,
              border: `1px solid ${cl}33`,
              borderRadius: 4,
              padding: "10px",
              textAlign: "center"
            }}> <div style={{
                fontSize: 7,
                color: cl,
                fontFamily: M,
                letterSpacing: 1.5
              }}>{l}</div> <div style={{
                fontSize: 20,
                fontWeight: 700,
                fontFamily: M,
                color: cl
              }}>{v}</div></div>)}</div> <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 5,
            marginBottom: 8
          }}>{kpi("VALEUR TOTALE", fm(totV), C.bl)}{kpi("DETTE TOTALE", fm(totD), C.rd)}{kpi("NOI TOTAL", fm(totNoi), C.g)}{kpi("LTV GLOBAL", pc(gLTVPerf), gLTVPerf > 0.7 ? C.rd : C.am)}{kpi("CAP RATE POND.", wCapRate.toFixed(1) + "%", C.cy)}</div> <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: 8,
            marginBottom: 8
          }}> <div style={bx}> <Hd>Contribution au rendement du fonds</Hd> <div style={{
                height: 200
              }}> <ResponsiveContainer> <BarChart data={sorted.map(a => ({
                    n: a.n.length > 12 ? a.n.slice(0, 11) + "…" : a.n,
                    "IRR": parseFloat(a.irr.toFixed(1)),
                    "Poids %": parseFloat((a.weight * 100).toFixed(1)),
                    "Contrib.": parseFloat((a.irr * a.weight).toFixed(2))
                  }))}> <XAxis dataKey="n" tick={{
                      fontSize: 6.5,
                      fill: C.dm
                    }} axisLine={{
                      stroke: C.bd
                    }} tickLine={false} /> <YAxis tick={{
                      fontSize: 7,
                      fill: C.ft
                    }} axisLine={false} tickLine={false} /> <Tooltip content={Tp} /> <Bar dataKey="IRR" name="IRR %" fill={C.cy} barSize={12} radius={[2, 2, 0, 0]} /> <Bar dataKey="Contrib." name="Contribution" fill={C.g} barSize={12} radius={[2, 2, 0, 0]} /> <Legend wrapperStyle={{
                      fontSize: 7,
                      fontFamily: M
                    }} /></BarChart></ResponsiveContainer></div></div> <div style={bx}> <Hd>Répartition du portefeuille</Hd> <div style={{
                height: 180
              }}> <ResponsiveContainer> <PieChart> <Pie data={sorted.map(a => ({
                      name: a.n.length > 14 ? a.n.slice(0, 13) + "…" : a.n,
                      value: a.v
                    }))} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={75} paddingAngle={1}>{sorted.map((a, i) => <Cell key={i} fill={[C.bl, C.g, C.cy, C.am, C.pu, C.pk, C.or, "#8BC34A", "#26A69A", "#5C6BC0"][i % 10]} />)}</Pie> <Tooltip content={Tp} /></PieChart></ResponsiveContainer></div></div></div> <div style={bx}> <Hd>Performance détaillée — Classement IRR (pondéré par valeur)</Hd> <div style={{
              overflowX: "auto"
            }}> <div style={{
                display: "grid",
                gridTemplateColumns: ".2fr 1.3fr .5fr .5fr .8fr .5fr .5fr .5fr .5fr .4fr .5fr .35fr .35fr",
                gap: 2,
                fontSize: 6,
                fontFamily: M,
                color: C.dm,
                padding: "2px 0",
                borderBottom: "1px solid " + C.g + "33",
                fontWeight: 700,
                minWidth: 1000
              }}> <span>#</span> <span>ACTIF</span> <span style={{
                  textAlign: "right"
                }}>POIDS</span> <span style={{
                  textAlign: "right"
                }}>VALEUR</span> <span style={{
                  textAlign: "right"
                }}>CASH INV.</span> <span style={{
                  textAlign: "right"
                }}>NOI</span> <span style={{
                  textAlign: "right"
                }}>DSCR</span> <span style={{
                  textAlign: "right"
                }}>ROI</span> <span style={{
                  textAlign: "right"
                }}>CoC</span> <span style={{
                  textAlign: "right"
                }}>IRR</span> <span style={{
                  textAlign: "right"
                }}>CONTRIB.</span> <span style={{
                  textAlign: "center"
                }}>STATUT</span> <span style={{
                  textAlign: "center"
                }}>RECO</span></div>{sorted.map((a, i) => <div key={i} style={{
                display: "grid",
                gridTemplateColumns: ".2fr 1.3fr .5fr .5fr .8fr .5fr .5fr .5fr .5fr .4fr .5fr .35fr .35fr",
                gap: 2,
                fontSize: 8.5,
                padding: "4px 0",
                borderBottom: "1px solid " + C.bd + "10",
                minWidth: 1000,
                alignItems: "center"
              }}> <span style={{
                  fontWeight: 700,
                  color: i < 3 ? C.g : C.dm
                }}>{i + 1}</span> <div> <div style={{
                    fontSize: 8.5,
                    color: C.wh,
                    fontWeight: 600
                  }}>{a.n}</div> <div style={{
                    fontSize: 6,
                    color: C.ft
                  }}>{a.t}</div></div> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.pu,
                  fontWeight: 600
                }}>{(a.weight * 100).toFixed(1)}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.bl
                }}>{fm(a.v)}</span> <div style={{
                  textAlign: "right"
                }}> <div style={{
                    fontSize: 8.5,
                    fontFamily: M,
                    color: C.am
                  }}>{fm(a.cashReq)}</div> <div style={{
                    fontSize: 6,
                    color: C.ft,
                    fontFamily: M
                  }}>{fm(a.mdf)} + {fm(a.capex)}</div></div> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.g
                }}>{fm(a.noi)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: a.dscr >= 1.25 ? C.g : a.dscr >= 1 ? C.am : C.rd
                }}>{a.dscr < 50 ? a.dscr.toFixed(2) + "x" : "∞"}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: a.roi > 8 ? C.g : a.roi > 3 ? C.am : C.rd
                }}>{a.roi.toFixed(1)}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: a.coc > 8 ? C.g : a.coc > 3 ? C.am : C.rd
                }}>{a.coc.toFixed(1)}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  fontWeight: 700,
                  color: a.irr > 15 ? C.g : a.irr > 8 ? C.cy : a.irr > 0 ? C.am : C.rd
                }}>{a.irr.toFixed(1)}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.g
                }}>{(a.irr * a.weight).toFixed(1)}%</span> <div style={{
                  textAlign: "center"
                }}> <Tg c={a.stCl}>{a.status}</Tg></div> <div style={{
                  textAlign: "center"
                }}> <Tg c={a.recoCl}>{a.reco}</Tg></div></div>)} <div style={{
                display: "grid",
                gridTemplateColumns: ".2fr 1.3fr .5fr .5fr .8fr .5fr .5fr .5fr .5fr .4fr .5fr .35fr .35fr",
                gap: 2,
                fontSize: 9,
                padding: "5px 0",
                borderTop: "1px solid " + C.g + "33",
                marginTop: 2,
                fontWeight: 700,
                minWidth: 1000
              }}> <span /> <span>FONDS PONDÉRÉ</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.pu
                }}>100%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.bl
                }}>{fm(totV)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.am
                }}>{fm(totCashReq)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.g
                }}>{fm(totNoi)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: wDSCR >= 1.25 ? C.g : C.am
                }}>{wDSCR < 50 ? wDSCR.toFixed(2) + "x" : "∞"}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.am
                }}>{wROI.toFixed(1)}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.am
                }}>{wCoC.toFixed(1)}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.cy
                }}>{wIRR.toFixed(1)}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.g
                }}>{wIRR.toFixed(1)}%</span> <span /> <span /></div></div></div> <div style={{
            ...bx,
            marginTop: 8
          }}> <Hd>Recommandations stratégiques</Hd> <div style={{
              fontSize: 8.5,
              color: C.tx,
              lineHeight: 1.7
            }}>{sorted[0] && <React.Fragment> <span style={{
                  color: C.g
                }}>●</span>  <span style={{
                  fontWeight: 600,
                  color: C.wh
                }}>Top performer:</span> {sorted[0].n} (IRR {sorted[0].irr.toFixed(1)}%, poids {(sorted[0].weight * 100).toFixed(0)}%, contribution {(sorted[0].irr * sorted[0].weight).toFixed(1)}%). </React.Fragment>}{sorted.filter(a => a.status !== "OPTIMAL").length > 0 && <React.Fragment> <span style={{
                  color: C.am
                }}>●</span>  <span style={{
                  fontWeight: 600,
                  color: C.wh
                }}>Sous-performance ({sorted.filter(a => a.status !== "OPTIMAL").length}):</span> {sorted.filter(a => a.status !== "OPTIMAL").map(a => a.n).join(", ")}. </React.Fragment>}{sorted.filter(a => a.reco === "REFI").length > 0 && <React.Fragment> <span style={{
                  color: C.cy
                }}>●</span>  <span style={{
                  fontWeight: 600,
                  color: C.wh
                }}>Refinancement:</span> {sorted.filter(a => a.reco === "REFI").map(a => a.n + " (DSCR " + a.dscr.toFixed(2) + "x)").join(", ")}. </React.Fragment>}{sorted.filter(a => a.reco === "VENTE").length > 0 && <React.Fragment> <span style={{
                  color: C.rd
                }}>●</span>  <span style={{
                  fontWeight: 600,
                  color: C.wh
                }}>Candidat vente:</span> {sorted.filter(a => a.reco === "VENTE").map(a => a.n).join(", ")}. </React.Fragment>} <span style={{
                color: C.bl
              }}>●</span>  <span style={{
                fontWeight: 600,
                color: C.wh
              }}>Portfolio:</span> IRR pondéré {wIRR.toFixed(1)}% (vs moy. simple {(sorted.reduce((a, x) => a + x.irr, 0) / sorted.length).toFixed(1)}%).{wDSCR >= 1.5 && <React.Fragment> Capacité de levier additionnelle disponible. </React.Fragment>}</div> <div style={{
              marginTop: 6,
              padding: "4px 6px",
              background: C.p2,
              borderRadius: 2,
              fontSize: 7,
              color: C.ft,
              lineHeight: 1.4
            }}>Pondération: Poids = Valeur actif / Valeur totale · KPI pondéré = Σ(KPI × Poids) · Horizon IRR: 5a · Croissance loyers 4%/an · Vacance 3%</div></div></div>;
      })()}{tab === "ir" && <div> <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 5,
          marginBottom: 8
        }}>{kpi("CAPITAL TOTAL", fm(FUND_OVERVIEW.totalCapital), C.am)}{kpi("INT. ANNUELS", fm(totalIntAnnual), C.rd)}{kpi("INT. MENSUELS", fm(totalIntMonthly), C.rd)}{kpi("TAUX MOY", FUND_OVERVIEW.tauxMoyen.toFixed(1) + "%", C.cy)}{kpi("SPREAD NET", spreadNet + "%", parseFloat(spreadNet) > 0 ? C.g : C.rd)}</div> <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8
        }}> <div style={bx}> <Hd>LP Portal — Détail investisseurs</Hd> <div style={{
              maxHeight: 400,
              overflowY: "auto"
            }}> <div style={{
                display: "grid",
                gridTemplateColumns: "1.3fr .6fr .5fr .6fr .5fr .4fr",
                gap: 2,
                fontSize: 6.5,
                fontFamily: M,
                color: C.dm,
                padding: "2px 0",
                borderBottom: "1px solid " + C.g + "33",
                fontWeight: 700
              }}> <span>INVESTISSEUR</span> <span style={{
                  textAlign: "right"
                }}>CAPITAL</span> <span style={{
                  textAlign: "right"
                }}>TAUX</span> <span style={{
                  textAlign: "right"
                }}>INT./AN</span> <span style={{
                  textAlign: "right"
                }}>TYPE</span> <span style={{
                  textAlign: "center"
                }}>STATUT</span></div>{irData.map((inv, i) => <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "1.3fr .6fr .5fr .6fr .5fr .4fr",
                gap: 2,
                fontSize: 8.5,
                padding: "3px 0",
                borderBottom: "1px solid " + C.bd + "12",
                alignItems: "center"
              }}> <div> <div style={{
                    fontSize: 8,
                    color: C.wh
                  }}>{inv.n}</div> <div style={{
                    fontSize: 6,
                    color: C.ft,
                    fontFamily: M
                  }}>{inv.dep} → {inv.ech}</div></div> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.am
                }}>{fm(inv.cap)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.cy
                }}>{inv.taux}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.rd
                }}>{fm(inv.intAnnual)}</span> <span style={{
                  textAlign: "right",
                  fontSize: 7,
                  color: C.dm
                }}>{inv.type}</span> <div style={{
                  textAlign: "center"
                }}> <Tg c={inv.isOverdue ? C.rd : C.g}>{inv.isOverdue ? "OVERDUE" : "OK"}</Tg></div></div>)}</div></div> <div> <div style={bx}> <Hd>Coût du capital vs rendement</Hd> <div style={{
                height: 160
              }}> <ResponsiveContainer> <BarChart data={[{
                    n: "ROI Fond",
                    v: parseFloat(((NOI + OPNET) / TASSETS * 100).toFixed(1))
                  }, {
                    n: "Coût Capital",
                    v: FUND_OVERVIEW.tauxMoyen
                  }, {
                    n: "Spread",
                    v: parseFloat(spreadNet)
                  }]}> <XAxis dataKey="n" tick={{
                      fontSize: 8,
                      fill: C.dm
                    }} axisLine={{
                      stroke: C.bd
                    }} tickLine={false} /> <YAxis tick={{
                      fontSize: 7,
                      fill: C.ft
                    }} axisLine={false} tickLine={false} tickFormatter={v => v + "%"} /> <Tooltip content={Tp} /> <Bar dataKey="v" name="%" radius={[3, 3, 0, 0]} barSize={30}>{[C.g, C.rd, parseFloat(spreadNet) > 0 ? C.cy : C.rd].map((cl, i) => <Cell key={i} fill={cl} />)}</Bar></BarChart></ResponsiveContainer></div></div> <div style={{
              ...bx,
              marginTop: 7
            }}> <Hd>Alertes échéances</Hd>{irData.filter(inv => inv.isOverdue).map((inv, i) => <div key={i} style={{
                padding: "4px 6px",
                marginBottom: 3,
                background: C.rd + "08",
                border: `1px solid ${C.rd}18`,
                borderRadius: 3
              }}> <div style={{
                  display: "flex",
                  justifyContent: "space-between"
                }}> <span style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: C.rd
                  }}>{inv.n}</span> <span style={{
                    fontSize: 9,
                    fontFamily: M,
                    color: C.am
                  }}>{fm(inv.cap)}</span></div> <div style={{
                  fontSize: 7,
                  color: C.dm
                }}>Échéance: {inv.ech} · {inv.taux}% {inv.type}</div></div>)}{irData.filter(inv => inv.isOverdue).length === 0 && <div style={{
                fontSize: 8,
                color: C.g
              }}>Aucune échéance critique</div>}</div></div></div></div>}{tab === "fund" && (() => {
        const USAGE_OPTS = ["Acquisition", "Développement", "Refinance", "CapEx", "Liquidité", "Autre"];
        const assetList = [...pr.map(p => p.n), ...acqs.map(a => a.n), ...devs.map(d => d.n)];
        const totalFund = fundInv.reduce((a, inv) => a + inv.cap, 0);
        const totalFunding = fundingInv.reduce((a, inv) => a + inv.cap, 0);
        const totalPipe = pipeInv.reduce((a, inv) => a + inv.cap, 0);
        const updFund = (i, f, v) => setFundInv(p => {
          const n = [...p];
          n[i] = {
            ...n[i],
            [f]: v
          };
          return n;
        });
        const updFunding = (i, f, v) => setFundingInv(p => {
          const n = [...p];
          n[i] = {
            ...n[i],
            [f]: v
          };
          return n;
        });
        const updPipe = (i, f, v) => setPipeInv(p => {
          const n = [...p];
          n[i] = {
            ...n[i],
            [f]: v
          };
          return n;
        });

        // Allocation by usage
        const byUsage = {};
        fundInv.forEach(inv => {
          const u = inv.usage || "Non assigné";
          byUsage[u] = (byUsage[u] || 0) + inv.cap;
        });
        // Allocation by asset
        const byAsset = {};
        fundInv.forEach(inv => {
          if (inv.linked) {
            byAsset[inv.linked] = (byAsset[inv.linked] || 0) + inv.cap;
          }
        });
        return <div> <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 5,
            marginBottom: 8
          }}>{kpi("FOND ACTUEL", fm(totalFund), C.am)}{kpi("FUNDING ENTRANT", fm(totalFunding), C.g)}{kpi("PIPELINE", fm(totalPipe), C.cy)}{kpi("CAPACITÉ TOTALE", fm(totalFund + totalFunding + totalPipe), C.wh)}{kpi("TAUX MOY", (totalFund > 0 ? (fundInv.reduce((a, inv) => a + inv.cap * inv.taux, 0) / totalFund).toFixed(1) : "0") + "%", C.rd)}</div> <div style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr .8fr",
            gap: 8
          }}> <div style={bx}> <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6
              }}> <Hd>Fond d\'investissement actuel</Hd> <button onClick={() => setFundInv(p => [...p, {
                  n: "Nouvel investisseur",
                  cap: 0,
                  taux: 11,
                  type: "Simple",
                  dep: "2026-01",
                  ech: "2027-01",
                  usage: "Acquisition",
                  linked: ""
                }])} style={{
                  padding: "2px 8px",
                  border: `1px solid ${C.g}44`,
                  borderRadius: 2,
                  background: C.g + "12",
                  color: C.g,
                  fontFamily: M,
                  fontSize: 6.5,
                  fontWeight: 600,
                  cursor: "pointer"
                }}>+ AJOUTER</button></div> <div style={{
                overflowX: "auto"
              }}> <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr .5fr .3fr .5fr .6fr .5fr .15fr",
                  gap: 2,
                  fontSize: 6,
                  fontFamily: M,
                  color: C.dm,
                  padding: "2px 0",
                  borderBottom: "1px solid " + C.g + "33",
                  fontWeight: 700,
                  minWidth: 650
                }}> <span>NOM</span> <span style={{
                    textAlign: "right"
                  }}>MONTANT</span> <span style={{
                    textAlign: "right"
                  }}>TAUX</span> <span style={{
                    textAlign: "right"
                  }}>ÉCHÉANCE</span> <span style={{
                    textAlign: "center"
                  }}>UTILISATION</span> <span style={{
                    textAlign: "center"
                  }}>ACTIF LIÉ</span> <span /></div> <div style={{
                  maxHeight: 320,
                  overflowY: "auto"
                }}>{fundInv.map((inv, i) => <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "1fr .5fr .3fr .5fr .6fr .5fr .15fr",
                    gap: 2,
                    fontSize: 8.5,
                    padding: "3px 0",
                    borderBottom: "1px solid " + C.bd + "10",
                    alignItems: "center",
                    minWidth: 650
                  }}> <EC value={inv.n} type="text" onChange={v => updFund(i, "n", v)} w={90} color={C.wh} /> <div style={{
                      textAlign: "right"
                    }}> <EC value={inv.cap} onChange={v => updFund(i, "cap", v)} w={50} color={C.am} /></div> <div style={{
                      textAlign: "right"
                    }}> <EC value={inv.taux} onChange={v => updFund(i, "taux", v)} w={25} suffix="%" color={C.cy} /></div> <div style={{
                      textAlign: "right"
                    }}> <EC value={inv.ech || ""} type="text" onChange={v => updFund(i, "ech", v)} w={50} color={inv.ech === "Over" ? C.rd : C.tx} /></div> <div style={{
                      textAlign: "center"
                    }}> <SC value={inv.usage || "Non assigné"} options={USAGE_OPTS} onChange={v => updFund(i, "usage", v)} /></div> <div style={{
                      textAlign: "center"
                    }}> <SC value={inv.linked || "—"} options={["—", ...assetList]} onChange={v => updFund(i, "linked", v)} /></div> <span onClick={() => setFundInv(p => p.filter((_, idx) => idx !== i))} style={{
                      cursor: "pointer",
                      fontSize: 7,
                      color: C.rd + "66",
                      textAlign: "center"
                    }}>✕</span></div>)}</div></div></div> <div> <div style={{
                ...bx,
                marginBottom: 8
              }}> <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4
                }}> <Hd>Funding entrant</Hd> <button onClick={() => setFundingInv(p => [...p, {
                    n: "Nouveau",
                    cap: 0,
                    taux: 11,
                    type: "Simple",
                    datePrevue: "2026-06",
                    usage: "Acquisition",
                    linked: ""
                  }])} style={{
                    padding: "2px 6px",
                    border: `1px solid ${C.g}33`,
                    borderRadius: 2,
                    background: "transparent",
                    color: C.g,
                    fontFamily: M,
                    fontSize: 6,
                    cursor: "pointer"
                  }}>+</button></div>{fundingInv.map((inv, i) => <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid " + C.bd + "10",
                  alignItems: "center",
                  gap: 3
                }}> <EC value={inv.n} type="text" onChange={v => updFunding(i, "n", v)} w={80} color={C.wh} /> <EC value={inv.cap} onChange={v => updFunding(i, "cap", v)} w={50} color={C.g} /> <SC value={inv.usage || "—"} options={USAGE_OPTS} onChange={v => updFunding(i, "usage", v)} /> <span onClick={() => setFundingInv(p => p.filter((_, idx) => idx !== i))} style={{
                    cursor: "pointer",
                    fontSize: 7,
                    color: C.rd + "66"
                  }}>✕</span></div>)}</div> <div style={bx}> <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4
                }}> <Hd>Pipeline</Hd> <button onClick={() => setPipeInv(p => [...p, {
                    n: "Nouveau",
                    cap: 0
                  }])} style={{
                    padding: "2px 6px",
                    border: `1px solid ${C.g}33`,
                    borderRadius: 2,
                    background: "transparent",
                    color: C.g,
                    fontFamily: M,
                    fontSize: 6,
                    cursor: "pointer"
                  }}>+</button></div>{pipeInv.map((inv, i) => <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid " + C.bd + "10",
                  alignItems: "center",
                  gap: 3
                }}> <EC value={inv.n} type="text" onChange={v => updPipe(i, "n", v)} w={90} color={C.wh} /> <EC value={inv.cap} onChange={v => updPipe(i, "cap", v)} w={50} color={C.cy} /> <span onClick={() => setPipeInv(p => p.filter((_, idx) => idx !== i))} style={{
                    cursor: "pointer",
                    fontSize: 7,
                    color: C.rd + "66"
                  }}>✕</span></div>)}</div></div> <div> <div style={{
                ...bx,
                marginBottom: 8
              }}> <Hd>Allocation par utilisation</Hd>{Object.entries(byUsage).sort((a, b) => b[1] - a[1]).map(([u, amt]) => <div key={u} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid " + C.bd + "10"
                }}> <span style={{
                    fontSize: 8.5,
                    color: C.wh
                  }}>{u}</span> <div style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center"
                  }}> <span style={{
                      fontSize: 9,
                      fontFamily: M,
                      fontWeight: 600,
                      color: u === "Acquisition" ? C.am : u === "Développement" ? C.pu : u === "Refinance" ? C.cy : C.dm
                    }}>{fm(amt)}</span> <span style={{
                      fontSize: 7,
                      fontFamily: M,
                      color: C.ft
                    }}>{totalFund > 0 ? (amt / totalFund * 100).toFixed(0) : 0}%</span></div></div>)}{Object.keys(byUsage).length === 0 && <div style={{
                  fontSize: 8,
                  color: C.ft
                }}>Aucune allocation assignée</div>}</div> <div style={bx}> <Hd>Allocation par actif</Hd>{Object.entries(byAsset).filter(([k]) => k !== "—" && k).sort((a, b) => b[1] - a[1]).map(([asset, amt]) => {
                  const assetObj = pr.find(p => p.n === asset);
                  const ltv = assetObj && assetObj.v > 0 ? (assetObj.d + amt) / assetObj.v : 0;
                  return <div key={asset} style={{
                    padding: "3px 0",
                    borderBottom: "1px solid " + C.bd + "10"
                  }}> <div style={{
                      display: "flex",
                      justifyContent: "space-between"
                    }}> <span style={{
                        fontSize: 8.5,
                        color: C.wh
                      }}>{asset}</span> <span style={{
                        fontSize: 9,
                        fontFamily: M,
                        fontWeight: 600,
                        color: C.am
                      }}>{fm(amt)}</span></div>{assetObj && <div style={{
                      fontSize: 7,
                      color: C.ft,
                      fontFamily: M
                    }}>Val: {fm(assetObj.v)} · Hyp: {fm(assetObj.d)} · LTV incl.: {pc(ltv)}</div>}</div>;
                })}{Object.entries(byAsset).filter(([k]) => k !== "—" && k).length === 0 && <div style={{
                  fontSize: 8,
                  color: C.ft
                }}>Aucun lien actif-dette</div>}</div></div></div> <div style={{
            ...bx,
            marginTop: 8
          }}> <Hd>Analyse de couverture</Hd> <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: 8
            }}>{[["Besoins totaux", fm(totalCapReqAll), C.rd, "ACQ + DEV"], ["Capital confirmé", fm(totalFund + totalFunding), C.g, ((totalFund + totalFunding) / Math.max(1, totalCapReqAll) * 100).toFixed(0) + "% couverture"], ["Gap", acqGap > 0 ? fm(acqGap) : "Couvert ✓", acqGap > 0 ? C.am : C.g, acqGap > 0 ? "Via pipeline" : "Surplus"], ["Pipeline", fm(totalPipe), C.cy, (totalPipe / Math.max(1, totalCapReqAll) * 100).toFixed(0) + "% du besoin"]].map(([l, v, cl, sub]) => <div key={l} style={{
                padding: 10,
                background: C.bg,
                borderRadius: 4,
                border: `1px solid ${cl}22`,
                textAlign: "center"
              }}> <div style={{
                  fontSize: 7,
                  color: cl,
                  fontFamily: M,
                  letterSpacing: 1
                }}>{l}</div> <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: cl,
                  fontFamily: M,
                  marginTop: 2
                }}>{v}</div> <div style={{
                  fontSize: 7,
                  color: C.dm,
                  marginTop: 2
                }}>{sub}</div></div>)}</div></div></div>;
      })()}{tab === "org" && (() => {
        const totA = orgClA.reduce((a, s) => a + s.pct, 0);
        const totB = orgClB.reduce((a, s) => a + s.pct, 0);
        return <div> <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 0
          }}> <div onClick={() => setOrgSel(orgSel === "hold" ? null : "hold")} style={{
              background: C.bg,
              border: `1px solid ${C.g}44`,
              borderRadius: 4,
              padding: "8px 16px",
              cursor: "pointer",
              textAlign: "center"
            }}> <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.g,
                fontFamily: M
              }}>GROUPE 4XP</div> <div style={{
                fontSize: 7,
                color: C.dm,
                fontFamily: M
              }}>9315-6008 Québec Inc · Holding</div> <div style={{
                fontSize: 7,
                color: C.ft
              }}>Cl.A: {totA.toFixed(1)}% · Cl.B: {totB.toFixed(1)}%</div></div></div> <div style={{
            width: 1,
            height: 14,
            background: C.g,
            margin: "0 auto"
          }} />{orgSel === "hold" && <div style={{
            ...bx,
            marginBottom: 8
          }}> <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8
            }}> <div> <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4
                }}> <Hd>Classe A — Votants ({totA.toFixed(1)}%)</Hd> <button onClick={() => setOrgClA(p => [...p, {
                    n: "Nouveau",
                    role: "—",
                    hold: "TBD",
                    pct: 0
                  }])} style={{
                    padding: "2px 6px",
                    border: `1px solid ${C.g}33`,
                    borderRadius: 2,
                    background: "transparent",
                    color: C.g,
                    fontFamily: M,
                    fontSize: 6,
                    cursor: "pointer"
                  }}>+</button></div>{orgClA.map((s, i) => <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid " + C.bd + "12",
                  alignItems: "center",
                  gap: 4
                }}> <div style={{
                    flex: 1
                  }}> <EC value={s.n} type="text" onChange={v => updOrgA(i, "n", v)} w={100} color={C.wh} /> <div style={{
                      display: "flex",
                      gap: 4,
                      marginTop: 1
                    }}> <EC value={s.role} type="text" onChange={v => updOrgA(i, "role", v)} w={70} color={C.ft} /> <EC value={s.hold} type="text" onChange={v => updOrgA(i, "hold", v)} w={80} color={C.dm} /></div></div> <EC value={s.pct} onChange={v => updOrgA(i, "pct", v)} w={35} suffix="%" color={C.g} /></div>)}</div> <div> <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4
                }}> <Hd>Classe B — Financiers ({totB.toFixed(1)}%)</Hd> <button onClick={() => setOrgClB(p => [...p, {
                    n: "Nouveau",
                    role: "—",
                    pct: 0
                  }])} style={{
                    padding: "2px 6px",
                    border: `1px solid ${C.g}33`,
                    borderRadius: 2,
                    background: "transparent",
                    color: C.g,
                    fontFamily: M,
                    fontSize: 6,
                    cursor: "pointer"
                  }}>+</button></div>{orgClB.map((s, i) => <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid " + C.bd + "12",
                  alignItems: "center",
                  gap: 4
                }}> <div style={{
                    flex: 1
                  }}> <EC value={s.n} type="text" onChange={v => updOrgB(i, "n", v)} w={100} color={C.wh} /> <EC value={s.role} type="text" onChange={v => updOrgB(i, "role", v)} w={110} color={C.ft} /></div> <EC value={s.pct} onChange={v => updOrgB(i, "pct", v)} w={35} suffix="%" color={C.am} /></div>)}</div> <div> <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4
                }}> <Hd>Conseil d\'administration</Hd> <button onClick={() => setOrgCA(p => [...p, {
                    n: "Nouveau",
                    role: "Administrateur",
                    type: "Non-exécutif",
                    status: "À nommer"
                  }])} style={{
                    padding: "2px 6px",
                    border: `1px solid ${C.g}33`,
                    borderRadius: 2,
                    background: "transparent",
                    color: C.g,
                    fontFamily: M,
                    fontSize: 6,
                    cursor: "pointer"
                  }}>+</button></div>{orgCA.map((m, i) => <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid " + C.bd + "12",
                  alignItems: "center"
                }}> <div> <EC value={m.n} type="text" onChange={v => setOrgCA(p => {
                      const nn = [...p];
                      nn[i] = {
                        ...nn[i],
                        n: v
                      };
                      return nn;
                    })} w={110} color={C.wh} /> <EC value={m.role} type="text" onChange={v => setOrgCA(p => {
                      const nn = [...p];
                      nn[i] = {
                        ...nn[i],
                        role: v
                      };
                      return nn;
                    })} w={120} color={C.ft} /></div> <Tg c={m.status === "En fonction" ? C.g : C.am}>{m.status}</Tg></div>)}</div></div></div>} <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12
          }}> <div> <div style={{
                display: "flex",
                justifyContent: "center"
              }}> <div onClick={() => setOrgSel(orgSel === "re" ? null : "re")} style={{
                  background: C.bg,
                  border: `1px solid ${C.bl}44`,
                  borderRadius: 4,
                  padding: "6px 14px",
                  cursor: "pointer",
                  textAlign: "center"
                }}> <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.bl,
                    fontFamily: M
                  }}>4XP REAL ESTATE</div> <div style={{
                    fontSize: 7,
                    color: C.dm,
                    fontFamily: M
                  }}>9558-3928 QC Inc</div></div></div> <div style={{
                width: 1,
                height: 10,
                background: C.bl,
                margin: "0 auto"
              }} /> <div style={bx}> <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4
                }}> <Hd>Filiales immobilières</Hd> <button onClick={() => addOrgSub("re")} style={{
                    padding: "2px 6px",
                    border: `1px solid ${C.g}33`,
                    borderRadius: 2,
                    background: "transparent",
                    color: C.g,
                    fontFamily: M,
                    fontSize: 6,
                    cursor: "pointer"
                  }}>+ SOCIÉTÉ</button></div>{orgReSubs.map((s, i) => <div key={i} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "3px 0",
                  borderBottom: "1px solid " + C.bd + "12",
                  alignItems: "center",
                  gap: 4
                }}> <div style={{
                    flex: 1
                  }}> <EC value={s.n} type="text" onChange={v => updOrgRe(i, "n", v)} w={120} color={C.wh} /> <EC value={s.desc} type="text" onChange={v => updOrgRe(i, "desc", v)} w={130} color={C.ft} /></div> <div style={{
                    textAlign: "right",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                  }}> <EC value={s.code || s.n} type="text" onChange={v => updOrgRe(i, "code", v)} w={90} color={C.bl} /> <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      justifyContent: "flex-end"
                    }}> <span style={{
                        fontSize: 6,
                        color: C.ft,
                        fontFamily: M
                      }}>DÉT:</span> <EC value={s.own} type="text" onChange={v => updOrgRe(i, "own", v)} w={75} color={C.g} /></div></div></div>)} <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                  marginTop: 6
                }}>{ORG.re.props.map((p, i) => <Tg key={i} c={C.bl}>{p}</Tg>)}</div></div></div> <div> <div style={{
                display: "flex",
                justifyContent: "center"
              }}> <div onClick={() => setOrgSel(orgSel === "opco" ? null : "opco")} style={{
                  background: C.bg,
                  border: `1px solid ${C.cy}44`,
                  borderRadius: 4,
                  padding: "6px 14px",
                  cursor: "pointer",
                  textAlign: "center"
                }}> <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.cy,
                    fontFamily: M
                  }}>4XP OP-CO</div> <div style={{
                    fontSize: 7,
                    color: C.dm,
                    fontFamily: M
                  }}>Pôle Opérationnel</div></div></div> <div style={{
                width: 1,
                height: 10,
                background: C.cy,
                margin: "0 auto"
              }} /> <div style={bx}> <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4
                }}> <Hd>Entités opérationnelles</Hd> <button onClick={() => addOrgSub("opco")} style={{
                    padding: "2px 6px",
                    border: `1px solid ${C.g}33`,
                    borderRadius: 2,
                    background: "transparent",
                    color: C.g,
                    fontFamily: M,
                    fontSize: 6,
                    cursor: "pointer"
                  }}>+ ENTITÉ</button></div>{orgOpcos.map((e, i) => <div key={i} style={{
                  padding: "4px 0",
                  borderBottom: "1px solid " + C.bd + "12"
                }}> <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}> <div style={{
                      flex: 1
                    }}> <EC value={e.n} type="text" onChange={v => updOrgOp(i, "n", v)} w={120} color={C.wh} /> <EC value={e.desc} type="text" onChange={v => updOrgOp(i, "desc", v)} w={130} color={C.ft} /></div> <EC value={e.code || ""} type="text" onChange={v => updOrgOp(i, "code", v)} w={90} color={C.cy} /></div>{(e.sh || []).length > 0 && <div style={{
                    display: "flex",
                    gap: 3,
                    marginTop: 2,
                    flexWrap: "wrap",
                    alignItems: "center"
                  }}>{e.sh.map((s, j) => <div key={j} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      background: C.p3,
                      padding: "1px 4px",
                      borderRadius: 2,
                      fontSize: 7,
                      fontFamily: M
                    }}> <EC value={s.n} type="text" onChange={v => {
                        const nn = [...orgOpcos];
                        const sh = [...nn[i].sh];
                        sh[j] = {
                          ...sh[j],
                          n: v
                        };
                        nn[i] = {
                          ...nn[i],
                          sh
                        };
                        setOrgOpcos(nn);
                      }} w={55} color={s.p >= 40 ? C.g : C.dm} /> <EC value={s.p} onChange={v => {
                        const nn = [...orgOpcos];
                        const sh = [...nn[i].sh];
                        sh[j] = {
                          ...sh[j],
                          p: v
                        };
                        nn[i] = {
                          ...nn[i],
                          sh
                        };
                        setOrgOpcos(nn);
                      }} w={22} suffix="%" color={C.am} /></div>)} <span onClick={() => {
                      const nn = [...orgOpcos];
                      nn[i] = {
                        ...nn[i],
                        sh: [...(nn[i].sh || []), {
                          n: "Nouveau",
                          p: 0
                        }]
                      };
                      setOrgOpcos(nn);
                    }} style={{
                      fontSize: 7,
                      color: C.g,
                      cursor: "pointer",
                      fontFamily: M
                    }}>+</span></div>}{(!e.sh || e.sh.length === 0) && <span onClick={() => {
                    const nn = [...orgOpcos];
                    nn[i] = {
                      ...nn[i],
                      sh: [{
                        n: "4XP OpCo",
                        p: 100
                      }]
                    };
                    setOrgOpcos(nn);
                  }} style={{
                    fontSize: 7,
                    color: C.g,
                    cursor: "pointer",
                    fontFamily: M
                  }}>+ Ajouter actionnaire</span>}</div>)}</div></div></div> <div style={{
            ...bx,
            marginTop: 8
          }}> <Hd>Sociétés de gestion — Actionnaires</Hd> <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 5
            }}>{[["9459-8216 QC", "Giovanni Pulitano", C.g], ["9482-8175 QC", "Massimo Pelosi", C.bl], ["9425-4455 QC", "Jean-Félix Lemieux", C.cy], ["Gestion Jump", "Pasquale Pelosi", C.am], ["JES Future", "Enrico Evangelista", C.pu]].map(([num, name, cl], i) => <div key={i} style={{
                background: C.bg,
                border: `1px solid ${cl}33`,
                borderRadius: 3,
                padding: "5px 6px",
                textAlign: "center"
              }}> <div style={{
                  fontSize: 8.5,
                  fontWeight: 600,
                  color: C.wh
                }}>{name}</div> <div style={{
                  fontSize: 6.5,
                  color: cl,
                  fontFamily: M
                }}>{num}</div></div>)}</div></div> <div style={{
            fontSize: 7,
            color: C.ft,
            fontFamily: M,
            marginTop: 4,
            textAlign: "center"
          }}>Cliquer les boîtes pour éditer · Cl.A = Vote · Cl.B = Financier · Cl.C = Gel successoral (réservé)</div></div>;
      })()}{tab === "mkt" && <div> <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 7,
          marginBottom: 8
        }}> <div style={bx}> <Hd>National CREA Jan 2026</Hd>{[["HPI", "$658,300", C.rd], ["YoY", "-4.9%", C.rd], ["SNLR", "45%", C.am], ["Months Inv.", "4.9", C.am], ["2026 Fcst", "$699K +2.8%", C.g]].map(([l, v, cl]) => <div key={l} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "3px 0",
              borderBottom: "1px solid " + C.bd + "12"
            }}> <span style={{
                fontSize: 9
              }}>{l}</span> <span style={{
                fontSize: 9.5,
                fontWeight: 600,
                fontFamily: M,
                color: cl
              }}>{v}</span></div>)}</div> <div style={bx}> <Hd>Provincial Signals</Hd>{PROVS.map(p => <div key={p.n} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "2px 0",
              borderBottom: "1px solid " + C.bd + "10"
            }}> <span style={{
                fontSize: 9
              }}>{p.n}</span> <div style={{
                display: "flex",
                alignItems: "center",
                gap: 3
              }}> <span style={{
                  color: p.yoy > 0 ? C.g : C.rd,
                  fontFamily: M,
                  fontWeight: 600,
                  fontSize: 9
                }}>{p.yoy > 0 ? "+" : ""}{p.yoy}%</span> <Tg c={p.sc >= 75 ? C.g : p.sc >= 50 ? C.am : C.rd}>{p.sig}</Tg></div></div>)}</div> <div style={bx}> <Hd>City Ranking YoY</Hd>{CITIES.map((c, i) => <div key={c.n} style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "2px 0",
              borderBottom: "1px solid " + C.bd + "10"
            }}> <span style={{
                fontSize: 9
              }}>{i + 1}. {c.n}</span> <span style={{
                color: c.yoy > 0 ? C.g : C.rd,
                fontFamily: M,
                fontWeight: 600,
                fontSize: 10
              }}>{c.yoy > 0 ? "+" : ""}{c.yoy.toFixed(1)}%</span></div>)}</div></div> <div style={bx}> <Hd>Prévisions d'appréciation — Positions 4XP</Hd> <div style={{
            display: "grid",
            gridTemplateColumns: "1.8fr .7fr .6fr .7fr .7fr",
            gap: 2,
            fontSize: 6.5,
            fontFamily: M,
            color: C.dm,
            padding: "2px 0",
            borderBottom: "1px solid " + C.g + "33",
            fontWeight: 700
          }}> <span>ACTIF</span> <span style={{
              textAlign: "right"
            }}>VALEUR</span> <span style={{
              textAlign: "right"
            }}>APPR.</span> <span style={{
              textAlign: "right"
            }}>+1 AN</span> <span style={{
              textAlign: "right"
            }}>+3 ANS</span></div>{pr.map((p, i) => <div key={i} style={{
            display: "grid",
            gridTemplateColumns: "1.8fr .7fr .6fr .7fr .7fr",
            gap: 2,
            fontSize: 9,
            padding: "3px 0",
            borderBottom: "1px solid " + C.bd + "12",
            alignItems: "center"
          }}> <span style={{
              fontSize: 8.5,
              color: C.wh
            }}>{p.n}</span> <span style={{
              textAlign: "right",
              fontFamily: M,
              color: C.bl
            }}>{fm(p.v)}</span> <div style={{
              textAlign: "right"
            }}> <EC value={p.appr} onChange={v => updatePr(i, "appr", v)} w={35} suffix="%" color={p.appr > 5 ? C.g : p.appr > 0 ? C.am : C.rd} /></div> <span style={{
              textAlign: "right",
              fontFamily: M,
              color: C.g
            }}>{fm(Math.round(p.v * (1 + p.appr / 100)))}</span> <span style={{
              textAlign: "right",
              fontFamily: M,
              color: C.cy
            }}>{fm(Math.round(p.v * Math.pow(1 + p.appr / 100, 3)))}</span></div>)}</div></div>}{tab === "risk" && (() => {
        // ── RISK ENGINE ──
        const riskAssets = pr.filter(p => p.v > 0 && p.t !== "Liq" && p.t !== "Fin");
        const rTotV = riskAssets.reduce((a, p) => a + p.v, 0);
        const rTotD = riskAssets.reduce((a, p) => a + p.d, 0);
        const rTotNoi = riskAssets.reduce((a, p) => a + p.noi, 0);
        const rTotDS = riskAssets.reduce((a, p) => a + (p.pmtHyp || 0), 0);
        const rTotRev = riskAssets.reduce((a, p) => a + (p.rev || 0), 0);

        // LEVERAGE
        const wLTV = rTotV > 0 ? rTotD / rTotV : 0;
        const wDSCR = rTotDS > 0 ? rTotNoi / rTotDS : 99;
        const icr = rTotD > 0 ? rTotNoi / (rTotD * wRate / 100) : 99;
        const debtYield = rTotD > 0 ? rTotNoi / rTotD * 100 : 0;
        const leverageScore = Math.max(0, 100 - (wLTV > 0.7 ? 40 : wLTV > 0.6 ? 20 : 0) - (wDSCR < 1.25 ? 30 : wDSCR < 1.5 ? 10 : 0) - (debtYield < 8 ? 20 : 0));

        // CASHFLOW
        const noiVol = riskAssets.length > 1 ? Math.sqrt(riskAssets.reduce((a, p) => {
          const avg = rTotNoi / riskAssets.length;
          return a + Math.pow(p.noi - avg, 2);
        }, 0) / riskAssets.length) / (rTotNoi / riskAssets.length) * 100 : 0;
        const avgVacancy = riskAssets.length > 0 ? riskAssets.reduce((a, p) => a + (p.vacancy || 0), 0) / riskAssets.length : 0;
        const occRate = 100 - avgVacancy;
        const cfScore = Math.max(0, 100 - (noiVol > 50 ? 30 : noiVol > 25 ? 15 : 0) - (avgVacancy > 8 ? 30 : avgVacancy > 5 ? 15 : 0) - (wDSCR < 1.5 ? 20 : 0));

        // MARKET
        const avgAppr = riskAssets.length > 0 ? riskAssets.reduce((a, p) => a + p.appr, 0) / riskAssets.length : 0;
        const avgValPerUnit = riskAssets.filter(p => p.units > 0).length > 0 ? riskAssets.filter(p => p.units > 0).reduce((a, p) => a + p.v / p.units, 0) / riskAssets.filter(p => p.units > 0).length : 0;
        const mktScore = Math.max(0, 100 - (avgAppr < 3 ? 25 : 0) - (avgValPerUnit > 250000 ? 20 : 0));

        // LIQUIDITY
        const avgTimeToSell = riskAssets.filter(p => p.t === "Multi").length > 0 ? 4 : riskAssets.filter(p => p.t === "Terrain").length > 0 ? 12 : 6;
        const liqScore = Math.max(0, 100 - (avgTimeToSell > 8 ? 30 : avgTimeToSell > 5 ? 15 : 0) - (wLTV > 0.75 ? 25 : 0));

        // OPERATIONAL
        const totalCapex = riskAssets.reduce((a, p) => a + p.capex, 0);
        const nonStabCount = acqs.filter(a => a.status !== "Fermé").length + devs.filter(d => d.status !== "Complété").length;
        const opScore = Math.max(0, 100 - (nonStabCount > 3 ? 30 : nonStabCount > 1 ? 15 : 0) - (totalCapex > 200000 ? 20 : 0));

        // CONCENTRATION
        const byLoc = {};
        const byType = {};
        riskAssets.forEach(p => {
          byLoc[p.loc] = (byLoc[p.loc] || 0) + p.v;
          byType[p.t] = (byType[p.t] || 0) + p.v;
        });
        const maxLocPct = rTotV > 0 ? Math.max(...Object.values(byLoc)) / rTotV * 100 : 0;
        const maxAssetPct = rTotV > 0 ? Math.max(...riskAssets.map(p => p.v)) / rTotV * 100 : 0;
        const concScore = Math.max(0, 100 - (maxLocPct > 40 ? 25 : maxLocPct > 30 ? 10 : 0) - (maxAssetPct > 25 ? 25 : maxAssetPct > 20 ? 10 : 0));

        // GLOBAL SCORE
        const globalScore = Math.round(leverageScore * 0.25 + cfScore * 0.20 + mktScore * 0.15 + liqScore * 0.15 + opScore * 0.15 + concScore * 0.10);
        const gCl = globalScore >= 70 ? C.g : globalScore >= 50 ? C.am : C.rd;
        const gLabel = globalScore >= 70 ? "FAIBLE" : globalScore >= 50 ? "MODÉRÉ" : "ÉLEVÉ";

        // ALERTS
        const alerts = [];
        if (wLTV > 0.7) alerts.push({
          t: "Refinancing Risk élevé",
          d: "LTV " + pc(wLTV) + " > 70%",
          cl: C.rd
        });
        if (maxAssetPct > 25) alerts.push({
          t: "Concentration excessive",
          d: "Un actif > 25% du fonds",
          cl: C.am
        });
        if (wDSCR < 1.25) alerts.push({
          t: "Cashflow fragile",
          d: "DSCR " + wDSCR.toFixed(2) + "x < 1.25x",
          cl: C.rd
        });
        if (avgTimeToSell > 8) alerts.push({
          t: "Risque de sortie élevé",
          d: "Temps moyen > 8 mois",
          cl: C.am
        });
        if (nonStabCount > 2) alerts.push({
          t: "Projets non stabilisés",
          d: nonStabCount + " projets en cours",
          cl: C.am
        });

        // STRESS TESTS
        const stressTests = [{
          n: "Taux +200bps",
          revMult: 1,
          rateDelta: 0.02,
          vacDelta: 0,
          capDelta: 0
        }, {
          n: "Loyers -10%",
          revMult: 0.9,
          rateDelta: 0,
          vacDelta: 0,
          capDelta: 0
        }, {
          n: "Vacance +15%",
          revMult: 1,
          rateDelta: 0,
          vacDelta: 15,
          capDelta: 0
        }, {
          n: "Cap Rate +100bps",
          revMult: 1,
          rateDelta: 0,
          vacDelta: 0,
          capDelta: 0.01
        }].map(s => {
          let sNoi = rTotNoi * s.revMult * (1 - s.vacDelta / 100);
          let sDS = 0;
          riskAssets.forEach(p => {
            const newRate = p.taux / 100 + s.rateDelta;
            const mR = newRate / 12;
            const t = (p.termes || 25) * 12;
            sDS += p.d > 0 && mR > 0 ? p.d * mR / (1 - Math.pow(1 + mR, -t)) * 12 : p.pmtHyp || 0;
          });
          const sDSCR = sDS > 0 ? sNoi / sDS : 99;
          const sCr = cr / 100 + s.capDelta;
          const sVal = sNoi > 0 && sCr > 0 ? sNoi / sCr : rTotV;
          const sEq = sVal - rTotD;
          return {
            ...s,
            sNoi: Math.round(sNoi),
            sDS: Math.round(sDS),
            sDSCR,
            sVal: Math.round(sVal),
            sEq: Math.round(sEq)
          };
        });

        // CATEGORIES for heatmap
        const cats = [{
          n: "Leverage",
          score: leverageScore,
          w: "25%",
          cl: leverageScore >= 70 ? C.g : leverageScore >= 50 ? C.am : C.rd
        }, {
          n: "Cashflow",
          score: cfScore,
          w: "20%",
          cl: cfScore >= 70 ? C.g : cfScore >= 50 ? C.am : C.rd
        }, {
          n: "Marché",
          score: mktScore,
          w: "15%",
          cl: mktScore >= 70 ? C.g : mktScore >= 50 ? C.am : C.rd
        }, {
          n: "Liquidité",
          score: liqScore,
          w: "15%",
          cl: liqScore >= 70 ? C.g : liqScore >= 50 ? C.am : C.rd
        }, {
          n: "Opérationnel",
          score: opScore,
          w: "15%",
          cl: opScore >= 70 ? C.g : opScore >= 50 ? C.am : C.rd
        }, {
          n: "Concentration",
          score: concScore,
          w: "10%",
          cl: concScore >= 70 ? C.g : concScore >= 50 ? C.am : C.rd
        }];
        return <div> <div style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr 1fr",
            gap: 8,
            marginBottom: 8
          }}> <div style={{
              ...bx,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}> <div style={{
                fontSize: 7,
                color: gCl,
                fontFamily: M,
                letterSpacing: 2
              }}>RISQUE {gLabel}</div> <svg viewBox="0 0 120 80" style={{
                width: 140,
                marginTop: 4
              }}> <path d="M 15 65 A 50 50 0 0 1 105 65" fill="none" stroke={C.bd} strokeWidth="8" strokeLinecap="round" /> <path d="M 15 65 A 50 50 0 0 1 105 65" fill="none" stroke={gCl} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${globalScore * 1.42} 142`} /> <text x="60" y="55" textAnchor="middle" fill={gCl} fontSize="22" fontWeight="700" fontFamily="JetBrains Mono">{globalScore}</text> <text x="60" y="68" textAnchor="middle" fill={C.dm} fontSize="8" fontFamily="JetBrains Mono">/100</text></svg></div> <div style={bx}> <Hd>Heatmap des risques</Hd> <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 4
              }}>{cats.map((c, i) => <div key={i} style={{
                  padding: "8px 6px",
                  background: c.cl + "10",
                  border: `1px solid ${c.cl}25`,
                  borderRadius: 3,
                  textAlign: "center"
                }}> <div style={{
                    fontSize: 7,
                    color: C.dm,
                    fontFamily: M
                  }}>{c.n} ({c.w})</div> <div style={{
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: M,
                    color: c.cl
                  }}>{c.score}</div></div>)}</div></div> <div style={bx}> <Hd>Alertes ({alerts.length})</Hd>{alerts.length === 0 && <div style={{
                fontSize: 9,
                color: C.g
              }}>Aucune alerte critique</div>}{alerts.map((a, i) => <div key={i} style={{
                padding: "4px 6px",
                marginBottom: 3,
                background: a.cl + "08",
                border: `1px solid ${a.cl}18`,
                borderRadius: 3
              }}> <div style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: a.cl
                }}>{a.t}</div> <div style={{
                  fontSize: 7,
                  color: C.dm
                }}>{a.d}</div></div>)}</div></div> <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 8
          }}> <div style={bx}> <Hd>Leverage Risk</Hd>{[["LTV pondéré", pc(wLTV), wLTV > 0.7 ? C.rd : wLTV > 0.6 ? C.am : C.g], ["DSCR pondéré", wDSCR < 50 ? wDSCR.toFixed(2) + "x" : "∞", wDSCR >= 1.25 ? C.g : C.am], ["Interest Coverage", icr < 50 ? icr.toFixed(2) + "x" : "∞", icr >= 2 ? C.g : C.am], ["Debt Yield", debtYield.toFixed(1) + "%", debtYield >= 8 ? C.g : C.rd], ["Score", leverageScore + "/100", cats[0].cl]].map(([l, v, cl]) => <div key={l} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "3px 0",
                borderBottom: "1px solid " + C.bd + "10"
              }}> <span style={{
                  fontSize: 8.5,
                  color: C.dm
                }}>{l}</span> <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: M,
                  color: cl
                }}>{v}</span></div>)}</div> <div style={bx}> <Hd>Cashflow Risk</Hd>{[["Volatilité NOI", noiVol.toFixed(0) + "%", noiVol > 50 ? C.rd : noiVol > 25 ? C.am : C.g], ["Taux occupation", occRate.toFixed(0) + "%", occRate >= 95 ? C.g : C.am], ["Vacance moyenne", avgVacancy.toFixed(1) + "%", avgVacancy > 8 ? C.rd : C.g], ["NOI total", fm(rTotNoi), C.g], ["Score", cfScore + "/100", cats[1].cl]].map(([l, v, cl]) => <div key={l} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "3px 0",
                borderBottom: "1px solid " + C.bd + "10"
              }}> <span style={{
                  fontSize: 8.5,
                  color: C.dm
                }}>{l}</span> <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: M,
                  color: cl
                }}>{v}</span></div>)}</div> <div style={bx}> <Hd>Concentration Risk</Hd>{[["Max 1 actif", maxAssetPct.toFixed(0) + "%", maxAssetPct > 25 ? C.rd : C.g], ["Max 1 région", maxLocPct.toFixed(0) + "%", maxLocPct > 40 ? C.rd : C.am], ["Nb actifs", String(riskAssets.length), riskAssets.length >= 8 ? C.g : C.am], ["Score", concScore + "/100", cats[5].cl]].map(([l, v, cl]) => <div key={l} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "3px 0",
                borderBottom: "1px solid " + C.bd + "10"
              }}> <span style={{
                  fontSize: 8.5,
                  color: C.dm
                }}>{l}</span> <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: M,
                  color: cl
                }}>{v}</span></div>)} <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
                marginTop: 6
              }}> <div> <div style={{
                    fontSize: 6.5,
                    color: C.ft,
                    fontFamily: M
                  }}>PAR RÉGION</div>{Object.entries(byLoc).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([loc, val]) => <div key={loc} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 7.5
                  }}> <span style={{
                      color: C.dm
                    }}>{loc}</span> <span style={{
                      fontFamily: M,
                      color: C.bl
                    }}>{rTotV > 0 ? (val / rTotV * 100).toFixed(0) : 0}%</span></div>)}</div> <div> <div style={{
                    fontSize: 6.5,
                    color: C.ft,
                    fontFamily: M
                  }}>PAR TYPE</div>{Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([t, val]) => <div key={t} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 7.5
                  }}> <span style={{
                      color: C.dm
                    }}>{t}</span> <span style={{
                      fontFamily: M,
                      color: C.cy
                    }}>{rTotV > 0 ? (val / rTotV * 100).toFixed(0) : 0}%</span></div>)}</div></div></div></div> <div style={bx}> <Hd>Stress Tests</Hd> <div style={{
              display: "grid",
              gridTemplateColumns: "1fr .7fr .7fr .7fr .7fr .7fr",
              gap: 2,
              fontSize: 6.5,
              fontFamily: M,
              color: C.dm,
              padding: "2px 0",
              borderBottom: "1px solid " + C.g + "33",
              fontWeight: 700
            }}> <span>SCÉNARIO</span> <span style={{
                textAlign: "right"
              }}>NOI</span> <span style={{
                textAlign: "right"
              }}>SVC DETTE</span> <span style={{
                textAlign: "right"
              }}>DSCR</span> <span style={{
                textAlign: "right"
              }}>VALEUR FONDS</span> <span style={{
                textAlign: "right"
              }}>EQUITY</span></div> <div style={{
              display: "grid",
              gridTemplateColumns: "1fr .7fr .7fr .7fr .7fr .7fr",
              gap: 2,
              fontSize: 9,
              padding: "4px 0",
              borderBottom: "1px solid " + C.bd + "12",
              background: C.g + "06"
            }}> <span style={{
                fontWeight: 600,
                color: C.wh
              }}>Base Case</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: C.g
              }}>{fm(rTotNoi)}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: C.am
              }}>{fm(rTotDS)}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: wDSCR >= 1.25 ? C.g : C.am
              }}>{wDSCR < 50 ? wDSCR.toFixed(2) + "x" : "∞"}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: C.bl
              }}>{fm(rTotV)}</span> <span style={{
                textAlign: "right",
                fontFamily: M,
                color: C.g
              }}>{fm(rTotV - rTotD)}</span></div>{stressTests.map((s, i) => {
              const dCl = s.sDSCR < 1 ? C.rd : s.sDSCR < 1.25 ? C.am : C.g;
              return <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "1fr .7fr .7fr .7fr .7fr .7fr",
                gap: 2,
                fontSize: 9,
                padding: "4px 0",
                borderBottom: "1px solid " + C.bd + "12"
              }}> <span style={{
                  fontWeight: 600,
                  color: C.rd
                }}>{s.n}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: s.sNoi < rTotNoi ? C.rd : C.g
                }}>{fm(s.sNoi)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: s.sDS > rTotDS ? C.rd : C.am
                }}>{fm(s.sDS)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  fontWeight: 700,
                  color: dCl
                }}>{s.sDSCR < 50 ? s.sDSCR.toFixed(2) + "x" : "∞"}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: s.sVal < rTotV ? C.rd : C.bl
                }}>{fm(s.sVal)}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  fontWeight: 600,
                  color: s.sEq > 0 ? C.g : C.rd
                }}>{fm(s.sEq)}</span></div>;
            })}</div> <div style={{
            ...bx,
            marginTop: 8
          }}> <Hd>Risque par actif — Contribution au score global</Hd> <div style={{
              display: "grid",
              gridTemplateColumns: ".2fr 1.3fr .5fr .5fr .5fr .4fr .4fr .4fr .3fr",
              gap: 2,
              fontSize: 6.5,
              fontFamily: M,
              color: C.dm,
              padding: "2px 0",
              borderBottom: "1px solid " + C.g + "33",
              fontWeight: 700
            }}> <span>#</span> <span>ACTIF</span> <span style={{
                textAlign: "right"
              }}>POIDS</span> <span style={{
                textAlign: "right"
              }}>LTV</span> <span style={{
                textAlign: "right"
              }}>DSCR</span> <span style={{
                textAlign: "right"
              }}>VACANCE</span> <span style={{
                textAlign: "right"
              }}>APPR</span> <span style={{
                textAlign: "right"
              }}>RISQUE</span> <span style={{
                textAlign: "center"
              }}>FLAG</span></div>{riskAssets.sort((a, b) => a.d / Math.max(1, a.v) - b.d / Math.max(1, b.v)).reverse().map((p, i) => {
              const ltv = p.v > 0 ? p.d / p.v : 0;
              const dscr = (p.pmtHyp || 0) > 0 ? p.noi / p.pmtHyp : 99;
              const assetRisk = Math.round(100 - (ltv > 0.7 ? 30 : ltv > 0.6 ? 15 : 0) - (dscr < 1.25 ? 25 : dscr < 1.5 ? 10 : 0) - ((p.vacancy || 0) > 5 ? 15 : 0) - (p.appr < 3 ? 10 : 0));
              const rCl = assetRisk >= 70 ? C.g : assetRisk >= 50 ? C.am : C.rd;
              const flagged = ltv > 0.75 || dscr < 1.2;
              return <div key={i} style={{
                display: "grid",
                gridTemplateColumns: ".2fr 1.3fr .5fr .5fr .5fr .4fr .4fr .4fr .3fr",
                gap: 2,
                fontSize: 9,
                padding: "3px 0",
                borderBottom: "1px solid " + C.bd + "10",
                alignItems: "center"
              }}> <span style={{
                  color: C.dm
                }}>{i + 1}</span> <div> <div style={{
                    fontSize: 8.5,
                    color: C.wh
                  }}>{p.n}</div> <div style={{
                    fontSize: 6,
                    color: C.ft
                  }}>{p.t} · {p.loc}</div></div> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.pu
                }}>{rTotV > 0 ? (p.v / rTotV * 100).toFixed(0) : 0}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: ltv > 0.7 ? C.rd : ltv > 0.6 ? C.am : C.g
                }}>{ltv > 0 ? pc(ltv) : "—"}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: dscr >= 1.25 ? C.g : dscr >= 1 ? C.am : C.rd
                }}>{dscr < 50 ? dscr.toFixed(2) + "x" : "∞"}</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: (p.vacancy || 0) > 5 ? C.rd : C.g
                }}>{p.vacancy || 0}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  color: C.cy
                }}>{p.appr}%</span> <span style={{
                  textAlign: "right",
                  fontFamily: M,
                  fontWeight: 600,
                  color: rCl
                }}>{assetRisk}</span> <div style={{
                  textAlign: "center"
                }}>{flagged && <Tg c={C.rd}>⚠</Tg>}</div></div>;
            })}</div></div>;
      })()}</div> <div style={{
      borderTop: "1px solid " + C.bd,
      padding: "4px 14px",
      display: "flex",
      justifyContent: "space-between"
    }}> <span style={{
        fontSize: 6,
        color: C.ft,
        fontFamily: M
      }}>BLOOMBERG QUANTUM | 4XP REAL ESTATE CIO v6 | BoC 2.25% | W.AVG {wRate.toFixed(2)}%</span> <span style={{
        fontSize: 6,
        color: C.ft,
        fontFamily: M
      }}>{pr.length} PROPS | {totalUnits} UNITS | {op.length} OPCOS | LTV {pc(gLTV)} | {ck.toLocaleDateString()}</span></div></div>;
}