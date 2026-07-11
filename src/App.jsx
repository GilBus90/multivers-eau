import React, { useState, useEffect, useMemo, useCallback, useRef, Fragment } from "react";
import {
  Droplet, ShoppingCart, Users, Wallet, Package, PiggyBank, Settings,
  LayoutDashboard, Plus, X, Check, AlertCircle, TrendingUp, TrendingDown,
  Boxes, HandCoins, Scissors, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight,
  Calendar, Trash2
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ComposedChart, Line, Legend
} from "recharts";
import { loadData, saveData } from "./dataStore";

/* ---------------------------------------------------------------------- */
/* Données produits (catalogue figé : marque, format, unités par colis,   */
/* prix d'achat fournisseur). Prix de vente & prix détail = paramétrables */
/* ---------------------------------------------------------------------- */
const CATALOG = [
  { brand: "VOLTIC", format: "Bouteille 5L", units: 1, purchase: 800, sell: 1200 },
  { brand: "VOLTIC", format: "Carton 12x1,5L", units: 12, purchase: 3400, sell: 3800 },
  { brand: "VOLTIC", format: "Carton 20x0,75L", units: 20, purchase: 3300, sell: 3800 },
  { brand: "VOLTIC", format: "Carton 24x0,5L", units: 24, purchase: 3400, sell: 3800 },
  { brand: "VOLTIC", format: "Pack 6x1,5L", units: 6, purchase: 1750, sell: 2150 },
  { brand: "VOLTIC", format: "Pack 6x0,75L", units: 6, purchase: 950, sell: 1250 },
  { brand: "VOLTIC", format: "Pack 6x0,5L", units: 6, purchase: 850, sell: 1250 },
  { brand: "VOLTIC", format: "Pack 12x0,33L", units: 12, purchase: 1200, sell: 1600 },
  { brand: "VOLTIC", format: "Pack 40x0,25L", units: 40, purchase: 1300, sell: 1700 },
  { brand: "CRISTAL", format: "Carton 12x1,5L", units: 12, purchase: 3300, sell: 3700 },
  { brand: "CRISTAL", format: "Carton 24x0,5L", units: 24, purchase: 3300, sell: 3700 },
  { brand: "CRISTAL", format: "Pack 6x1,5L", units: 6, purchase: 1650, sell: 2000 },
  { brand: "CRISTAL", format: "Pack 6x1L", units: 6, purchase: 1600, sell: 2000 },
  { brand: "CRISTAL", format: "Pack 12x0,5L", units: 12, purchase: 1650, sell: 2000 },
  { brand: "CRISTAL", format: "Pack 15x0,33L", units: 15, purchase: 1600, sell: 2000 },
  { brand: "EAU VITALE", format: "Carton 12x1,5L", units: 12, purchase: 3300, sell: 3700 },
  { brand: "EAU VITALE", format: "Carton 24x0,5L", units: 24, purchase: 3300, sell: 3700 },
  { brand: "EAU VITALE", format: "Carton 24x0,35L", units: 24, purchase: 3000, sell: 3500 },
];

const INITIAL_STOCK = {
  VOLTIC: [4, 1, 2, 9, 0, 0, 0, 3, 2],
  CRISTAL: [10, 54, 10, 10, 10, 10],
  "EAU VITALE": [6, 7, 6],
};

const BRAND_COLOR = {
  VOLTIC: { dot: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200" },
  CRISTAL: { dot: "bg-cyan-500", text: "text-cyan-700", bg: "bg-cyan-50", ring: "ring-cyan-200" },
  "EAU VITALE": { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
};

const round50 = (n) => Math.round(n / 25) * 25;

// Date réelle de démarrage du suivi (stock de départ donné par l'utilisateur).
const START_DATE = "2026-06-10";

function buildDefaultProducts() {
  const counters = {};
  return CATALOG.map((p) => {
    counters[p.brand] = (counters[p.brand] || 0) + 1;
    const idx = counters[p.brand] - 1;
    const id = `${p.brand}-${idx}`;
    return {
      id,
      brand: p.brand,
      format: p.format,
      units: p.units,
      purchase: p.purchase,
      sellPrice: p.sell,
      retailPrice: round50((p.purchase / p.units) * 1.4),
    };
  });
}

const todayISO = () => new Date().toISOString().slice(0, 10);

/* Stock est géré en LOTS (FIFO) : chaque entrée de stock (stock initial,   */
/* réappro, ouverture de colis) crée un lot daté, numéroté séquentiellement */
/* (lotNo, persisté dans meta.lotSeq) et avec son propre coût.              */
/* Les ventes consomment d'abord les lots les plus anciens.                 */
function sortLots(lots) {
  return [...lots].sort((a, b) => (a.date === b.date ? a.lotNo - b.lotNo : a.date.localeCompare(b.date)));
}

function lotsQty(lots) {
  return (lots || []).reduce((s, l) => s + l.qty, 0);
}

// Coût moyen pondéré actuellement en stock pour un article (aperçu avant vente).
function weightedCost(lots) {
  const arr = lots || [];
  const qty = lotsQty(arr);
  if (qty === 0) return 0;
  return arr.reduce((s, l) => s + l.qty * l.unitCost, 0) / qty;
}

// Total remboursé sur un prêt = somme des remboursements individuels
// enregistrés (chacun peut être supprimé séparément en cas d'erreur).
function repaidAmount(loan) {
  return (loan.repayments || []).reduce((s, r) => s + r.amount, 0);
}

// Consomme `qty` unités en FIFO (plus vieux lots d'abord). Renvoie les lots
// restants + le coût moyen pondéré réellement consommé.
function consumeFifo(lots, qty) {
  const sorted = sortLots(lots || []);
  let remaining = qty;
  let totalCost = 0;
  const updated = [];
  for (const lot of sorted) {
    if (remaining <= 0) {
      updated.push(lot);
      continue;
    }
    const take = Math.min(lot.qty, remaining);
    totalCost += take * lot.unitCost;
    remaining -= take;
    const rest = lot.qty - take;
    if (rest > 0) updated.push({ ...lot, qty: rest });
  }
  if (remaining > 0) return { ok: false };
  return { ok: true, lots: updated, totalCost, avgCost: qty > 0 ? totalCost / qty : 0 };
}

function defaultData() {
  const startDate = START_DATE;
  const lots = {};
  let lotSeq = 0;
  Object.entries(INITIAL_STOCK).forEach(([brand, qtys]) => {
    qtys.forEach((q, idx) => {
      const id = `${brand}-${idx}`;
      const product = CATALOG.filter((c) => c.brand === brand)[idx];
      if (q > 0) lotSeq += 1;
      lots[id] = {
        gros: q > 0 ? [{ id: uid(), date: startDate, qty: q, originalQty: q, unitCost: product.purchase, lotNo: lotSeq }] : [],
        detail: [],
      };
    });
  });
  return {
    meta: { initialCash: 0, startingCapital: 1000000, startDate, createdAt: new Date().toISOString(), lotSeq },
    products: buildDefaultProducts(),
    lots,
    sales: [],
    detailSales: [],
    restocks: [],
    openings: [],
    loans: [
      {
        id: uid(),
        date: startDate,
        beneficiary: "Partenaire (investisseur)",
        amount: 175000,
        repayments: [],
        isOpening: true,
        note: "Prêt déjà en cours au 10/06/2026, intégré par défaut",
      },
    ],
    liabilities: [],
    withdrawals: [],
    personalNotes: [],
  };
}

// Migration : les anciennes sauvegardes utilisaient un compteur simple
// (data.stock = {gros, detail}) au lieu de lots FIFO datés et numérotés.
function migrate(d) {
  if (!d.withdrawals) d = { ...d, withdrawals: [] };
  if (!d.personalNotes) d = { ...d, personalNotes: [] };
  if (d.loans && d.loans.some((l) => !l.repayments)) {
    d = {
      ...d,
      loans: d.loans.map((l) =>
        l.repayments
          ? l
          : {
              ...l,
              repayments: l.repaid > 0 ? [{ id: uid(), date: l.date, amount: l.repaid }] : [],
            }
      ),
    };
  }
  if (d.lots) {
    let maxNo = 0;
    let touched = false;
    Object.values(d.lots).forEach((row) => {
      [...(row.gros || []), ...(row.detail || [])].forEach((l) => {
        if (typeof l.lotNo !== "number") {
          l.lotNo = ++maxNo;
          touched = true;
        } else maxNo = Math.max(maxNo, l.lotNo);
        if (typeof l.originalQty !== "number") {
          l.originalQty = l.qty; // meilleure estimation possible pour un lot déjà existant
          touched = true;
        }
      });
    });
    if (touched || d.meta.lotSeq == null) {
      d = { ...d, meta: { ...d.meta, lotSeq: Math.max(maxNo, d.meta.lotSeq || 0) } };
    }
    return fixStartDate(d);
  }
  const lots = {};
  let lotSeq = 0;
  d.products.forEach((p) => {
    const row = (d.stock && d.stock[p.id]) || { gros: 0, detail: 0 };
    const grosLotNo = row.gros > 0 ? ++lotSeq : null;
    const detailLotNo = row.detail > 0 ? ++lotSeq : null;
    lots[p.id] = {
      gros: row.gros > 0 ? [{ id: uid(), date: d.meta.startDate, qty: row.gros, originalQty: row.gros, unitCost: p.purchase, lotNo: grosLotNo }] : [],
      detail: row.detail > 0 ? [{ id: uid(), date: d.meta.startDate, qty: row.detail, originalQty: row.detail, unitCost: p.purchase / p.units, lotNo: detailLotNo }] : [],
    };
  });
  const { stock, ...rest } = d;
  return fixStartDate({ ...rest, lots, meta: { ...rest.meta, lotSeq } });
}

// Si le suivi n'a pas encore commencé (aucune vente/réappro/ouverture), on
// peut sans risque aligner la date de départ sur START_DATE si elle diverge
// (ex. ancienne sauvegarde créée avant que cette date soit figée).
function fixStartDate(d) {
  const untouched = d.sales.length === 0 && d.detailSales.length === 0 && d.restocks.length === 0 && d.openings.length === 0;
  if (!untouched || d.meta.startDate === START_DATE) return d;
  const lots = {};
  Object.entries(d.lots).forEach(([id, row]) => {
    lots[id] = {
      gros: (row.gros || []).map((l) => ({ ...l, date: START_DATE })),
      detail: (row.detail || []).map((l) => ({ ...l, date: START_DATE })),
    };
  });
  return { ...d, meta: { ...d.meta, startDate: START_DATE }, lots };
}

const fcfa = (n) =>
  Math.round(n || 0).toLocaleString("fr-FR").replace(/\u202f/g, " ") + " F";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------------------------------------------------------------------- */

export default function App({ uid, onSignOut }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [toast, setToast] = useState(null);
  const pendingRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const remote = await loadData(uid);
        if (remote) {
          setData(migrate(remote));
        } else {
          const d = defaultData();
          setData(d);
          await saveData(uid, d);
        }
      } catch (e) {
        const d = defaultData();
        setData(d);
        try {
          await saveData(uid, d);
        } catch (_) {}
      }
    })();
  }, [uid]);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Tente d'enregistrer, avec plusieurs essais automatiques (délais
  // croissants) avant d'abandonner. Ceci absorbe les échecs transitoires du
  // stockage (réseau, limite de fréquence) sans jamais perdre les données :
  // tant que l'enregistrement n'a pas réussi, elles restent en mémoire et un
  // bandeau invite à réessayer manuellement.
  const saveWithRetry = useCallback(async (payload, attempts = 3) => {
    for (let i = 0; i < attempts; i++) {
      try {
        await saveData(uid, payload);
        return true;
      } catch (e) {
        if (i < attempts - 1) await sleep(500 * (i + 1) * (i + 1));
      }
    }
    return false;
  }, [uid]);

  const persist = useCallback(
    async (next) => {
      setData(next);
      pendingRef.current = next;
      setSaving(true);
      const ok = await saveWithRetry(next);
      setSaving(false);
      if (ok) {
        pendingRef.current = null;
        setSaveError(false);
      } else {
        setSaveError(true);
      }
    },
    [saveWithRetry]
  );

  const retrySave = useCallback(async () => {
    const payload = pendingRef.current || data;
    if (!payload) return;
    setSaving(true);
    const ok = await saveWithRetry(payload);
    setSaving(false);
    if (ok) {
      pendingRef.current = null;
      setSaveError(false);
      showToast("Enregistré avec succès");
    } else {
      setSaveError(true);
    }
  }, [data, saveWithRetry]);

  const showToast = (msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2600);
  };

  // Tant qu'un enregistrement est en échec, on retente automatiquement en
  // arrière-plan (pas besoin de rester appuyer sur "Réessayer") jusqu'à ce
  // que ça passe.
  useEffect(() => {
    if (!saveError) return;
    const id = setInterval(() => {
      retrySave();
    }, 8000);
    return () => clearInterval(id);
  }, [saveError, retrySave]);

  const productsById = useMemo(
    () => (data ? Object.fromEntries(data.products.map((p) => [p.id, p])) : {}),
    [data]
  );
  const totals = useMemo(() => (data ? computeTotals(data) : null), [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <Droplet className="animate-pulse text-teal-600" size={32} />
          <span className="text-sm">Chargement…</span>
        </div>
      </div>
    );
  }

  /* ------------------------------ Actions ------------------------------ */

  const addSale = (sale) => {
    const grosLots = data.lots[sale.productId]?.gros || [];
    if (sale.qty > lotsQty(grosLots)) {
      showToast(`Stock gros insuffisant (${lotsQty(grosLots)} dispo)`, "error");
      return false;
    }
    const res = consumeFifo(grosLots, sale.qty);
    const total = sale.qty * sale.unitPrice;
    const record = {
      id: uid(),
      date: sale.date,
      client: sale.client || "Client comptoir",
      productId: sale.productId,
      qty: sale.qty,
      unitPrice: sale.unitPrice,
      unitCost: res.avgCost,
      mode: sale.mode,
      paidAmount: sale.mode === "cash" ? total : 0,
    };
    const next = {
      ...data,
      sales: [record, ...data.sales],
      lots: { ...data.lots, [sale.productId]: { ...data.lots[sale.productId], gros: res.lots } },
    };
    persist(next);
    showToast("Vente enregistrée");
    return true;
  };

  // Rattrapage : traite plusieurs ventes historiques d'un coup, dans l'ordre
  // chronologique, sur une seule copie de travail (évite que des appels
  // successifs à addSale s'écrasent les uns les autres avant le re-rendu).
  const addBatchSales = (rows) => {
    let working = data;
    const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    const failed = [];
    sorted.forEach((sale) => {
      const grosLots = working.lots[sale.productId]?.gros || [];
      if (sale.qty > lotsQty(grosLots)) {
        failed.push(sale);
        return;
      }
      const res = consumeFifo(grosLots, sale.qty);
      const total = sale.qty * sale.unitPrice;
      const record = {
        id: uid(),
        date: sale.date,
        client: sale.client || "Client comptoir",
        productId: sale.productId,
        qty: sale.qty,
        unitPrice: sale.unitPrice,
        unitCost: res.avgCost,
        mode: sale.mode,
        paidAmount: sale.mode === "cash" ? total : 0,
      };
      working = {
        ...working,
        sales: [record, ...working.sales],
        lots: { ...working.lots, [sale.productId]: { ...working.lots[sale.productId], gros: res.lots } },
      };
    });
    persist(working);
    const okCount = sorted.length - failed.length;
    if (failed.length > 0) {
      showToast(`${okCount} vente(s) importée(s), ${failed.length} refusée(s) (stock insuffisant)`, "error");
    } else {
      showToast(`${okCount} vente(s) importée(s)`);
    }
    return failed;
  };

  const openPack = (productId, date) => {
    const p = productsById[productId];
    const grosLots = data.lots[productId]?.gros || [];
    if (lotsQty(grosLots) < 1) {
      showToast("Aucun colis disponible à ouvrir", "error");
      return;
    }
    const sourceLotId = sortLots(grosLots)[0].id;
    const res = consumeFifo(grosLots, 1);
    const detailLots = data.lots[productId]?.detail || [];
    const lotNo = (data.meta.lotSeq || 0) + 1;
    const newDetailLot = {
      id: uid(),
      date: date || todayISO(),
      qty: p.units,
      originalQty: p.units,
      unitCost: res.avgCost / p.units,
      lotNo,
    };
    const openingDate = date || todayISO();
    const next = {
      ...data,
      meta: { ...data.meta, lotSeq: lotNo },
      lots: {
        ...data.lots,
        [productId]: { gros: res.lots, detail: [...detailLots, newDetailLot] },
      },
      openings: [
        { id: uid(), date: openingDate, productId, qty: 1, lotId: newDetailLot.id, sourceLotId },
        ...data.openings,
      ],
    };
    persist(next);
    showToast(`Colis ouvert : +${p.units} unités en détail`);
  };

  const addDetailSale = (sale) => {
    const detailLots = data.lots[sale.productId]?.detail || [];
    if (sale.qty > lotsQty(detailLots)) {
      showToast(`Stock détail insuffisant (${lotsQty(detailLots)} dispo)`, "error");
      return false;
    }
    const res = consumeFifo(detailLots, sale.qty);
    const total = sale.qty * sale.unitPrice;
    const record = {
      id: uid(),
      date: sale.date,
      client: sale.client || "Client comptoir",
      productId: sale.productId,
      qty: sale.qty,
      unitPrice: sale.unitPrice,
      unitCost: res.avgCost,
      mode: sale.mode,
      paidAmount: sale.mode === "cash" ? total : 0,
    };
    const next = {
      ...data,
      detailSales: [record, ...data.detailSales],
      lots: { ...data.lots, [sale.productId]: { ...data.lots[sale.productId], detail: res.lots } },
    };
    persist(next);
    showToast("Vente au détail enregistrée");
    return true;
  };

  const addRestock = (r) => {
    const grosLots = data.lots[r.productId]?.gros || [];
    const lotNo = (data.meta.lotSeq || 0) + 1;
    const newLot = { id: uid(), date: r.date, qty: r.qty, originalQty: r.qty, unitCost: r.unitCost, lotNo };
    const record = { id: uid(), date: r.date, productId: r.productId, qty: r.qty, unitCost: r.unitCost, lotId: newLot.id };
    let products = data.products;
    if (r.updateReference) {
      products = products.map((p) => (p.id === r.productId ? { ...p, purchase: r.unitCost } : p));
    }
    const next = {
      ...data,
      meta: { ...data.meta, lotSeq: lotNo },
      products,
      restocks: [record, ...data.restocks],
      lots: { ...data.lots, [r.productId]: { ...data.lots[r.productId], gros: [...grosLots, newLot] } },
    };
    persist(next);
    showToast("Réapprovisionnement enregistré");
  };

  // --- Suppressions (corrections d'erreurs de saisie) ---

  // Une vente supprimée restitue la quantité au stock gros, sous forme d'un
  // nouveau lot daté au jour de la vente d'origine, au coût qui avait été
  // consommé (annule proprement l'effet sur trésorerie/stock/statistiques).
  const deleteSale = (id) => {
    const sale = data.sales.find((s) => s.id === id);
    if (!sale) return;
    const lotNo = (data.meta.lotSeq || 0) + 1;
    const restoredLot = { id: uid(), date: sale.date, qty: sale.qty, originalQty: sale.qty, unitCost: sale.unitCost, lotNo };
    const grosLots = data.lots[sale.productId]?.gros || [];
    persist({
      ...data,
      meta: { ...data.meta, lotSeq: lotNo },
      sales: data.sales.filter((s) => s.id !== id),
      lots: { ...data.lots, [sale.productId]: { ...data.lots[sale.productId], gros: [...grosLots, restoredLot] } },
    });
    showToast("Vente supprimée, stock restitué");
  };

  const deleteDetailSale = (id) => {
    const sale = data.detailSales.find((s) => s.id === id);
    if (!sale) return;
    const lotNo = (data.meta.lotSeq || 0) + 1;
    const restoredLot = { id: uid(), date: sale.date, qty: sale.qty, originalQty: sale.qty, unitCost: sale.unitCost, lotNo };
    const detailLots = data.lots[sale.productId]?.detail || [];
    persist({
      ...data,
      meta: { ...data.meta, lotSeq: lotNo },
      detailSales: data.detailSales.filter((s) => s.id !== id),
      lots: { ...data.lots, [sale.productId]: { ...data.lots[sale.productId], detail: [...detailLots, restoredLot] } },
    });
    showToast("Vente au détail supprimée, stock restitué");
  };

  // Un réappro n'est supprimable que si le lot qu'il a créé est encore
  // intact (rien vendu dessus) — sinon ça corromprait le coût déjà
  // appliqué à des ventes passées.
  const deleteRestock = (id) => {
    const r = data.restocks.find((x) => x.id === id);
    if (!r) return;
    const grosLots = data.lots[r.productId]?.gros || [];
    const lot = grosLots.find((l) => l.id === r.lotId);
    if (!lot || lot.qty !== lot.originalQty) {
      showToast("Impossible : ce lot a déjà été partiellement vendu", "error");
      return;
    }
    persist({
      ...data,
      restocks: data.restocks.filter((x) => x.id !== id),
      lots: { ...data.lots, [r.productId]: { ...data.lots[r.productId], gros: grosLots.filter((l) => l.id !== r.lotId) } },
    });
    showToast("Réapprovisionnement supprimé");
  };

  // Une ouverture de colis n'est annulable que si aucune des bouteilles
  // qu'elle a créées n'a encore été vendue au détail.
  const deleteOpening = (id) => {
    const o = data.openings.find((x) => x.id === id);
    if (!o) return;
    const detailLots = data.lots[o.productId]?.detail || [];
    const lot = detailLots.find((l) => l.id === o.lotId);
    if (!lot || lot.qty !== lot.originalQty) {
      showToast("Impossible : des unités de ce colis ont déjà été vendues", "error");
      return;
    }
    const p = productsById[o.productId];
    const lotNo = (data.meta.lotSeq || 0) + 1;
    const restoredGrosLot = {
      id: uid(),
      date: o.date,
      qty: 1,
      originalQty: 1,
      unitCost: lot.unitCost * p.units,
      lotNo,
    };
    const grosLots = data.lots[o.productId]?.gros || [];
    persist({
      ...data,
      meta: { ...data.meta, lotSeq: lotNo },
      openings: data.openings.filter((x) => x.id !== id),
      lots: {
        ...data.lots,
        [o.productId]: {
          gros: [...grosLots, restoredGrosLot],
          detail: detailLots.filter((l) => l.id !== o.lotId),
        },
      },
    });
    showToast("Ouverture annulée, colis restitué en gros");
  };

  const deleteLoan = (id) => {
    persist({ ...data, loans: data.loans.filter((l) => l.id !== id) });
    showToast("Prêt supprimé");
  };

  const recordPayment = (kind, id, amount) => {
    const list = kind === "sales" ? data.sales : data.detailSales;
    const next = {
      ...data,
      [kind]: list.map((s) =>
        s.id === id ? { ...s, paidAmount: Math.min(s.qty * s.unitPrice, s.paidAmount + amount) } : s
      ),
    };
    persist(next);
    showToast("Paiement enregistré");
  };

  const addLoan = (loan) => {
    const next = { ...data, loans: [{ id: uid(), repayments: [], ...loan }, ...data.loans] };
    persist(next);
    showToast("Prêt enregistré");
  };

  const repayLoan = (id, amount, date) => {
    const loan = data.loans.find((l) => l.id === id);
    if (!loan) return;
    const remaining = loan.amount - repaidAmount(loan);
    const capped = Math.max(0, Math.min(amount, remaining));
    if (capped <= 0) return;
    const record = { id: uid(), date: date || todayISO(), amount: capped };
    const next = {
      ...data,
      loans: data.loans.map((l) => (l.id === id ? { ...l, repayments: [record, ...(l.repayments || [])] } : l)),
    };
    persist(next);
    showToast("Remboursement enregistré");
  };

  const deleteRepayment = (loanId, repaymentId) => {
    const next = {
      ...data,
      loans: data.loans.map((l) =>
        l.id === loanId ? { ...l, repayments: (l.repayments || []).filter((r) => r.id !== repaymentId) } : l
      ),
    };
    persist(next);
    showToast("Remboursement supprimé");
  };

  const addLiability = (l) => {
    const next = { ...data, liabilities: [{ id: uid(), ...l }, ...data.liabilities] };
    persist(next);
    showToast("Passif ajouté");
  };

  const removeLiability = (id) => {
    persist({ ...data, liabilities: data.liabilities.filter((l) => l.id !== id) });
  };

  // Rémunération du gérant : un retrait de trésorerie distinct du capital
  // de l'actionnaire, pour que le "Résultat net" affiché reste bien celui
  // qui revient à l'actionnaire, une fois la gestion payée.
  const addWithdrawal = (w) => {
    const next = { ...data, withdrawals: [{ id: uid(), ...w }, ...data.withdrawals] };
    persist(next);
    showToast("Rémunération enregistrée");
  };

  const deleteWithdrawal = (id) => {
    persist({ ...data, withdrawals: data.withdrawals.filter((w) => w.id !== id) });
    showToast("Rémunération supprimée");
  };

  // Notes personnelles hors bilan : purement informatif, n'affecte jamais
  // les totaux du business (ex : montant dû personnellement à un tiers,
  // sans lien avec l'activité de l'eau).
  const addPersonalNote = (n) => {
    const next = { ...data, personalNotes: [{ id: uid(), ...n }, ...data.personalNotes] };
    persist(next);
    showToast("Note ajoutée");
  };

  const deletePersonalNote = (id) => {
    persist({ ...data, personalNotes: data.personalNotes.filter((n) => n.id !== id) });
  };

  const updateProduct = (id, patch) => {
    persist({ ...data, products: data.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  };

  const setInitialCash = (v) => persist({ ...data, meta: { ...data.meta, initialCash: v } });
  const setStartingCapital = (v) => persist({ ...data, meta: { ...data.meta, startingCapital: v } });

  const markExported = () => persist({ ...data, meta: { ...data.meta, lastExportAt: new Date().toISOString() } });

  // Restauration d'une sauvegarde JSON exportée précédemment — filet de
  // sécurité si le stockage venait à ne pas persister entre deux versions.
  const restoreData = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.products || !parsed.lots) {
        showToast("Fichier invalide — ce n'est pas une sauvegarde reconnue", "error");
        return false;
      }
      persist(migrate(parsed));
      showToast("Sauvegarde restaurée avec succès");
      return true;
    } catch (e) {
      showToast("Fichier illisible", "error");
      return false;
    }
  };

  /* --------------------------- Calculs dérivés --------------------------- */

  const NAV = [
    { key: "dashboard", label: "Accueil", icon: LayoutDashboard },
    { key: "sales", label: "Ventes", icon: ShoppingCart },
    { key: "detail", label: "Détail", icon: Scissors },
    { key: "clients", label: "Clients", icon: Users },
    { key: "loans", label: "Prêts", icon: HandCoins },
    { key: "stock", label: "Stock", icon: Boxes },
    { key: "balance", label: "Bilan", icon: PiggyBank },
    { key: "settings", label: "Produits", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-teal-50 text-slate-800 pb-28 font-sans">
      <header className="sticky top-0 z-20 bg-teal-800 text-white px-4 py-3 flex items-center gap-2 shadow-sm">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shrink-0">
          <Droplet size={18} className="text-blue-700" fill="currentColor" fillOpacity={0.15} />
        </span>
        <div className="leading-tight">
          <div className="font-bold tracking-tight text-sm">Multivers'Eau — Suivi</div>
          <div className="text-xs text-cyan-100">
            Depuis le {new Date(data.meta.startDate).toLocaleDateString("fr-FR")}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-cyan-100 uppercase tracking-wide">Trésorerie</div>
          <div className="font-mono font-bold text-sm tabular-nums">{fcfa(totals.treasury)}</div>
        </div>
        {onSignOut && (
          <button onClick={onSignOut} className="ml-2 text-cyan-100 text-xs underline shrink-0">
            Déconnexion
          </button>
        )}
      </header>

      {saveError && (
        <div className="bg-rose-600 text-white px-4 py-2 flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            Dernières modifications pas encore enregistrées.
          </span>
          <button onClick={retrySave} disabled={saving} className="bg-white text-rose-600 font-semibold px-2.5 py-1 rounded-md shrink-0">
            {saving ? "…" : "Réessayer"}
          </button>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-3 pt-3">
        {tab === "dashboard" && <Dashboard data={data} totals={totals} productsById={productsById} />}
        {tab === "sales" && (
          <SalesTab data={data} productsById={productsById} onAdd={addSale} onBatchAdd={addBatchSales} onPay={(id, a) => recordPayment("sales", id, a)} onDelete={deleteSale} />
        )}
        {tab === "detail" && (
          <DetailTab data={data} totals={totals} productsById={productsById} onOpen={openPack} onSell={addDetailSale} onPay={(id, a) => recordPayment("detailSales", id, a)} onDeleteSale={deleteDetailSale} onDeleteOpening={deleteOpening} />
        )}
        {tab === "clients" && <ClientsTab data={data} totals={totals} onPaySale={(id, a) => recordPayment("sales", id, a)} onPayDetail={(id, a) => recordPayment("detailSales", id, a)} />}
        {tab === "loans" && <LoansTab data={data} onAdd={addLoan} onRepay={repayLoan} onDelete={deleteLoan} onDeleteRepayment={deleteRepayment} />}
        {tab === "stock" && <StockTab data={data} productsById={productsById} totals={totals} onRestock={addRestock} onDeleteRestock={deleteRestock} />}
        {tab === "balance" && (
          <BalanceTab
            data={data}
            totals={totals}
            onSetCash={setInitialCash}
            onSetStartingCapital={setStartingCapital}
            onAddLiability={addLiability}
            onRemoveLiability={removeLiability}
            onAddWithdrawal={addWithdrawal}
            onDeleteWithdrawal={deleteWithdrawal}
            onAddPersonalNote={addPersonalNote}
            onDeletePersonalNote={deletePersonalNote}
          />
        )}
        {tab === "settings" && <SettingsTab data={data} onUpdate={updateProduct} onRestore={restoreData} onExported={markExported} />}
      </main>

      <nav
        className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-20"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="max-w-2xl mx-auto flex flex-nowrap text-xs leading-tight">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1.5 px-0.5 ${tab === key ? "text-teal-700" : "text-slate-400"}`}
            >
              <Icon size={15} strokeWidth={tab === key ? 2.4 : 2} />
              <span className="truncate w-full text-center">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {toast && (
        <div
          className={`fixed bottom-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full text-sm shadow-lg text-white ${
            toast.kind === "error" ? "bg-rose-600" : "bg-teal-700"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Calculs -------------------------------- */

function computeTotals(data) {
  const paidSales = data.sales.reduce((s, x) => s + x.paidAmount, 0);
  const paidDetail = data.detailSales.reduce((s, x) => s + x.paidAmount, 0);
  const restockCost = data.restocks.reduce((s, x) => s + x.qty * x.unitCost, 0);
  // Un prêt "de départ" (déjà existant avant le début du suivi) ne sort pas
  // de trésorerie ici — l'argent était déjà sorti avant qu'on commence à
  // suivre. Seuls les nouveaux prêts accordés pendant le suivi réduisent la
  // trésorerie disponible. Les remboursements, eux, rentrent toujours en
  // trésorerie, qu'il s'agisse d'un prêt de départ ou d'un prêt nouveau.
  const loanedOut = data.loans.filter((x) => !x.isOpening).reduce((s, x) => s + x.amount, 0);
  const loanRepaid = data.loans.reduce((s, x) => s + repaidAmount(x), 0);
  const withdrawalsTotal = (data.withdrawals || []).reduce((s, x) => s + x.amount, 0);

  const treasury = data.meta.initialCash + paidSales + paidDetail - restockCost - loanedOut + loanRepaid - withdrawalsTotal;

  const receivables =
    data.sales.reduce((s, x) => s + Math.max(0, x.qty * x.unitPrice - x.paidAmount), 0) +
    data.detailSales.reduce((s, x) => s + Math.max(0, x.qty * x.unitPrice - x.paidAmount), 0);

  const loansOutstanding = data.loans.reduce((s, x) => s + Math.max(0, x.amount - repaidAmount(x)), 0);

  let stockValueGros = 0;
  let stockValueDetail = 0;
  Object.values(data.lots).forEach((row) => {
    stockValueGros += (row.gros || []).reduce((a, l) => a + l.qty * l.unitCost, 0);
    stockValueDetail += (row.detail || []).reduce((a, l) => a + l.qty * l.unitCost, 0);
  });
  const stockValue = stockValueGros + stockValueDetail;

  const liabilitiesTotal = data.liabilities.reduce((s, x) => s + x.amount, 0);

  const assets = treasury + stockValue + receivables + loansOutstanding;
  const netWorth = assets - liabilitiesTotal;
  const startingCapital = data.meta.startingCapital || 0;
  const netResult = netWorth - startingCapital;

  const allOps = [
    ...data.sales.map((s) => ({ ...s, kind: "gros" })),
    ...data.detailSales.map((s) => ({ ...s, kind: "detail" })),
  ];
  const profitOf = (o) => o.qty * (o.unitPrice - o.unitCost);
  const revenueOf = (o) => o.qty * o.unitPrice;

  const byDay = (iso) => allOps.filter((o) => o.date === iso);
  const inMonth = (iso, ym) => iso.slice(0, 7) === ym;
  const inYear = (iso, y) => iso.slice(0, 4) === y;

  const today = todayISO();
  const ym = today.slice(0, 7);
  const y = today.slice(0, 4);

  const sumProfit = (ops) => ops.reduce((s, o) => s + profitOf(o), 0);
  const sumRevenue = (ops) => ops.reduce((s, o) => s + revenueOf(o), 0);

  const todayOps = byDay(today);
  const monthOps = allOps.filter((o) => inMonth(o.date, ym));
  const yearOps = allOps.filter((o) => inYear(o.date, y));

  // 14 derniers jours pour le graphique
  const days = [...Array(14)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
  const chartData = days.map((d) => ({
    day: d.slice(5),
    benefice: sumProfit(byDay(d)),
  }));

  // Synthèse des 12 derniers mois : coût d'achat des articles VENDUS (pas
  // les réappros du mois, qui n'ont pas de lien direct avec les ventes du
  // mois) vs ventes (CA) vs bénéfice. Ainsi : ventes - coût d'achat = bénéfice.
  const months = [...Array(12)].map((_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (11 - i));
    return d.toISOString().slice(0, 7);
  });
  const costOf = (o) => o.qty * o.unitCost;
  const monthlyData = months.map((m) => {
    const opsInMonth = allOps.filter((o) => inMonth(o.date, m));
    const coutAchat = opsInMonth.reduce((s, o) => s + costOf(o), 0);
    return {
      month: m,
      label: new Date(m + "-01T00:00:00").toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      achats: coutAchat,
      ventes: sumRevenue(opsInMonth),
      benefice: sumProfit(opsInMonth),
    };
  });

  return {
    treasury,
    receivables,
    loansOutstanding,
    stockValue,
    stockValueGros,
    stockValueDetail,
    liabilitiesTotal,
    assets,
    netWorth,
    startingCapital,
    netResult,
    withdrawalsTotal,
    profitOf,
    revenueOf,
    today: { profit: sumProfit(todayOps), revenue: sumRevenue(todayOps), count: todayOps.length },
    month: { profit: sumProfit(monthOps), revenue: sumRevenue(monthOps), count: monthOps.length },
    year: { profit: sumProfit(yearOps), revenue: sumRevenue(yearOps), count: yearOps.length },
    chartData,
    monthlyData,
    allOps,
  };
}

/* ------------------------------ UI pièces ------------------------------- */

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 ${className}`}>{children}</div>;
}

function SectionTitle({ children, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-2 text-slate-700">
      {Icon && <Icon size={16} className="text-teal-700" />}
      <h2 className="font-bold text-sm tracking-tight">{children}</h2>
    </div>
  );
}

function StatCard({ label, value, sub, tone = "teal" }) {
  const tones = {
    teal: "text-teal-700",
    rose: "text-rose-600",
    amber: "text-amber-600",
    slate: "text-slate-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
      <div className={`font-mono font-bold text-lg tabular-nums ${tones[tone]}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 ${props.className || ""}`}
    />
  );
}

function Btn({ children, onClick, kind = "primary", className = "", type = "button", disabled }) {
  const kinds = {
    primary: "bg-teal-700 text-white active:bg-teal-800",
    ghost: "bg-slate-100 text-slate-700 active:bg-slate-200",
    danger: "bg-rose-50 text-rose-600 active:bg-rose-100",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 ${kinds[kind]} ${className}`}
    >
      {children}
    </button>
  );
}

function productOptions(products, brand, filterFn) {
  return products
    .filter((p) => (!brand || p.brand === brand) && (!filterFn || filterFn(p)))
    .map((p) => ({ value: p.id, label: `${p.format}` }));
}

/* ------------------------------- Dashboard ------------------------------ */

/* Navigateur de date : recule/avance jour par jour ou de 7 jours, ou saute  */
/* directement à une date via le calendrier natif.                          */
function DateNav({ value, onChange }) {
  const shift = (days) => {
    const d = new Date(value + "T00:00:00");
    d.setDate(d.getDate() + days);
    onChange(d.toISOString().slice(0, 10));
  };
  const isToday = value === todayISO();
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => shift(-7)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500" title="-7 jours">
        <ChevronsLeft size={15} />
      </button>
      <button onClick={() => shift(-1)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500" title="Jour précédent">
        <ChevronLeft size={15} />
      </button>
      <div className="relative flex-1">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono text-center focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
      </div>
      <button onClick={() => shift(1)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500" title="Jour suivant">
        <ChevronRight size={15} />
      </button>
      <button onClick={() => shift(7)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500" title="+7 jours">
        <ChevronsRight size={15} />
      </button>
      {!isToday && (
        <button onClick={() => onChange(todayISO())} className="px-2 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold whitespace-nowrap">
          Aujourd'hui
        </button>
      )}
    </div>
  );
}

function Dashboard({ data, totals, productsById }) {
  const brands = ["VOLTIC", "CRISTAL", "EAU VITALE"];
  const [journalDate, setJournalDate] = useState(todayISO());
  const journalOps = useMemo(
    () => totals.allOps.filter((o) => o.date === journalDate).sort((a, b) => (a.id < b.id ? 1 : -1)),
    [totals.allOps, journalDate]
  );
  const journalProfit = journalOps.reduce((s, o) => s + totals.profitOf(o), 0);
  const journalRevenue = journalOps.reduce((s, o) => s + totals.revenueOf(o), 0);
  const bestSellers = useMemo(() => {
    const map = {};
    totals.allOps.forEach((o) => {
      if (!map[o.productId]) map[o.productId] = { gros: 0, detail: 0 };
      if (o.kind === "detail") map[o.productId].detail += o.qty;
      else map[o.productId].gros += o.qty;
    });
    return Object.entries(map)
      .map(([id, q]) => ({ id, gros: q.gros, detail: q.detail, p: productsById[id] }))
      .filter((x) => x.p)
      .sort((a, b) => b.gros + b.detail - (a.gros + a.detail))
      .slice(0, 5);
  }, [totals.allOps, productsById]);

  const lastExport = data.meta.lastExportAt ? new Date(data.meta.lastExportAt) : null;
  const daysSinceExport = lastExport ? Math.round((Date.now() - lastExport.getTime()) / 86400000) : null;
  const exportOverdue = daysSinceExport === null || daysSinceExport > 3;

  return (
    <div className="space-y-3">
      {exportOverdue && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          {lastExport
            ? `Dernière sauvegarde il y a ${daysSinceExport} j — pense à en exporter une nouvelle (onglet Produits).`
            : "Aucune sauvegarde exportée pour l'instant — fais-en une dans l'onglet Produits."}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Bénéfice jour" value={fcfa(totals.today.profit)} sub={`${totals.today.count} vente(s)`} />
        <StatCard label="Bénéfice mois" value={fcfa(totals.month.profit)} tone="slate" />
        <StatCard label="Bénéfice année" value={fcfa(totals.year.profit)} tone="slate" />
      </div>

      <Card>
        <SectionTitle icon={Calendar}>Journal du jour</SectionTitle>
        <DateNav value={journalDate} onChange={setJournalDate} />
        <div className="flex justify-between mt-3 mb-1 text-xs">
          <span className="text-slate-500">
            {new Date(journalDate + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="font-mono">
            CA {fcfa(journalRevenue)} • Bénéfice <b className="text-teal-700">{fcfa(journalProfit)}</b>
          </span>
        </div>
        {journalOps.length === 0 && <p className="text-sm text-slate-400 py-2">Aucune vente ce jour-là.</p>}
        <ul className="divide-y divide-slate-100">
          {journalOps.map((o) => {
            const p = productsById[o.productId];
            return (
              <li key={o.id} className="py-1.5 text-xs flex justify-between">
                <span>
                  {o.kind === "detail" ? <Scissors size={10} className="inline mr-1 text-slate-400" /> : null}
                  {o.client} — {p?.brand} {p?.format}
                  {o.kind === "detail" ? " (u.)" : ""} × {o.qty}
                </span>
                <span className="font-mono">
                  {fcfa(o.qty * o.unitPrice)} <span className="text-teal-700">(+{fcfa(totals.profitOf(o))})</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <SectionTitle icon={TrendingUp}>Bénéfice — 14 derniers jours</SectionTitle>
        <div style={{ width: "100%", height: 160 }}>
          <ResponsiveContainer>
            <BarChart data={totals.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f2" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} width={36} />
              <RTooltip formatter={(v) => fcfa(v)} labelFormatter={(l) => `Jour ${l}`} />
              <Bar dataKey="benefice" fill="#0E5C63" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={TrendingUp}>Synthèse mensuelle — coût d'achat vs ventes</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          "Coût d'achat" = ce qu'ont coûté les articles réellement vendus ce mois-ci (pas les réappros du mois). Ventes − Coût d'achat
          = Bénéfice.
        </p>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <ComposedChart data={totals.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f2" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <RTooltip formatter={(v) => fcfa(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="achats" name="Coût d'achat (ventes)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="ventes" name="Ventes (CA)" fill="#0E5C63" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="benefice" name="Bénéfice" stroke="#e11d48" strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Trésorerie" value={fcfa(totals.treasury)} />
        <StatCard label="Valeur stock total" value={fcfa(totals.stockValue)} />
        <StatCard label="— dont gros" value={fcfa(totals.stockValueGros)} tone="slate" />
        <StatCard label="— dont détail (capital immobilisé)" value={fcfa(totals.stockValueDetail)} tone="slate" />
        <StatCard label="Créances clients" value={fcfa(totals.receivables)} tone="amber" />
        <StatCard label="Prêts en cours" value={fcfa(totals.loansOutstanding)} tone="amber" />
      </div>

      <Card>
        <SectionTitle icon={PiggyBank}>Objectif — dette investisseur</SectionTitle>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Valeur nette : {fcfa(totals.netWorth)}</span>
          <span>Objectif : {fcfa(totals.startingCapital)}</span>
        </div>
        <ProgressBar value={totals.netWorth} target={totals.startingCapital} />
        <div className={`text-xs font-semibold mt-1 ${totals.netResult >= 0 ? "text-teal-700" : "text-amber-600"}`}>
          {totals.netResult >= 0
            ? `Excédent réel : ${fcfa(totals.netResult)}`
            : `Reste à générer avant excédent : ${fcfa(-totals.netResult)}`}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Package}>Top articles vendus (cumul)</SectionTitle>
        {bestSellers.length === 0 && <p className="text-sm text-slate-400">Aucune vente enregistrée pour le moment.</p>}
        <ul className="divide-y divide-slate-100">
          {bestSellers.map(({ id, gros, detail, p }) => (
            <li key={id} className="py-1.5 text-sm">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`w-2 h-2 rounded-full ${BRAND_COLOR[p.brand].dot}`} />
                {p.brand} — {p.format}
              </div>
              <div className="flex justify-end gap-4 text-xs">
                <span className={gros === 0 ? "text-slate-300" : "text-slate-500"}>
                  Gros : <b className="font-mono">{gros}</b>
                </span>
                <span className={detail === 0 ? "text-slate-300" : "text-slate-500"}>
                  Détail (u.) : <b className="font-mono">{detail}</b>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {brands.map((b) => {
          const c = BRAND_COLOR[b];
          const stockQty = Object.entries(data.lots)
            .filter(([id]) => id.startsWith(b))
            .reduce((s, [, row]) => s + lotsQty(row.gros), 0);
          return (
            <div key={b} className={`rounded-2xl p-3 ${c.bg} ring-1 ${c.ring}`}>
              <div className={`text-xs font-bold ${c.text}`}>{b}</div>
              <div className="text-lg font-mono font-bold tabular-nums">{stockQty}</div>
              <div className="text-xs text-slate-500">colis en stock</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------- Ventes --------------------------------- */

function emptyCatchUpRow() {
  return { rid: uid(), date: todayISO(), brand: "VOLTIC", productId: "", client: "", qty: 1, unitPrice: "", mode: "cash" };
}

function CatchUpBatch({ data, productsById, onBatchAdd, onClose }) {
  const [rows, setRows] = useState([emptyCatchUpRow()]);

  const updateRow = (rid, patch) => setRows((rs) => rs.map((r) => (r.rid === rid ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, emptyCatchUpRow()]);
  const removeRow = (rid) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.rid !== rid) : rs));

  const onBrandChange = (rid, brand) => updateRow(rid, { brand, productId: "", unitPrice: "" });
  const onProductChange = (rid, productId) => {
    const p = productsById[productId];
    updateRow(rid, { productId, unitPrice: p ? p.sellPrice : "" });
  };

  const validRows = rows.filter((r) => r.productId && r.qty && r.unitPrice);
  const totalAmount = validRows.reduce((s, r) => s + Number(r.qty) * Number(r.unitPrice), 0);

  const submitAll = () => {
    if (validRows.length === 0) return;
    const failed = onBatchAdd(
      validRows.map((r) => ({
        date: r.date,
        client: r.client,
        productId: r.productId,
        qty: Number(r.qty),
        unitPrice: Number(r.unitPrice),
        mode: r.mode,
      }))
    );
    if (!failed || failed.length === 0) {
      setRows([emptyCatchUpRow()]);
      onClose();
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs text-slate-500">
        Astuce : l'ordre de saisie des lignes n'a pas besoin d'être parfait — l'appli trie automatiquement par date avant d'appliquer
        le FIFO. Utilise juste la vraie date de chaque vente.
      </p>
      {rows.map((r, idx) => {
        const opts = productOptions(data.products, r.brand);
        return (
          <div key={r.rid} className="border border-slate-100 rounded-lg p-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Ligne {idx + 1}</span>
              <button onClick={() => removeRow(r.rid)}>
                <Trash2 size={13} className="text-rose-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Input type="date" value={r.date} onChange={(e) => updateRow(r.rid, { date: e.target.value })} />
              <Input placeholder="Client" value={r.client} onChange={(e) => updateRow(r.rid, { client: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Select value={r.brand} onChange={(v) => onBrandChange(r.rid, v)} options={["VOLTIC", "CRISTAL", "EAU VITALE"].map((b) => ({ value: b, label: b }))} />
              <div className="col-span-2">
                <Select value={r.productId} onChange={(v) => onProductChange(r.rid, v)} options={opts} placeholder="Format" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Input type="number" min="1" placeholder="Qté" value={r.qty} onChange={(e) => updateRow(r.rid, { qty: e.target.value })} />
              <Input type="number" placeholder="Prix vente" value={r.unitPrice} onChange={(e) => updateRow(r.rid, { unitPrice: e.target.value })} />
              <Select value={r.mode} onChange={(v) => updateRow(r.rid, { mode: v })} options={[{ value: "cash", label: "Cash" }, { value: "credit", label: "Crédit" }]} />
            </div>
          </div>
        );
      })}
      <Btn onClick={addRow} kind="ghost" className="w-full">
        <Plus size={14} /> Ajouter une ligne
      </Btn>
      {validRows.length > 0 && (
        <div className="text-xs text-slate-500">
          {validRows.length} vente(s) prête(s) — total <b>{fcfa(totalAmount)}</b>
        </div>
      )}
      <Btn onClick={submitAll} className="w-full" disabled={validRows.length === 0}>
        <Check size={16} /> Importer {validRows.length > 0 ? `(${validRows.length})` : ""}
      </Btn>
    </div>
  );
}

function SalesTab({ data, productsById, onAdd, onBatchAdd, onDelete }) {
  const [brand, setBrand] = useState("VOLTIC");
  const [form, setForm] = useState({ date: todayISO(), client: "", productId: "", qty: 1, unitPrice: "", mode: "cash" });
  const [showCatchUp, setShowCatchUp] = useState(false);

  const options = productOptions(data.products, brand);

  const onProductChange = (id) => {
    const p = productsById[id];
    setForm((f) => ({ ...f, productId: id, unitPrice: p ? p.sellPrice : "" }));
  };

  const submit = () => {
    if (!form.productId || !form.qty || !form.unitPrice) return;
    const ok = onAdd({ ...form, qty: Number(form.qty), unitPrice: Number(form.unitPrice) });
    if (ok) setForm({ date: todayISO(), client: "", productId: "", qty: 1, unitPrice: "", mode: "cash" });
  };

  const list = data.sales.slice(0, 40);

  return (
    <div className="space-y-3">
      <Card>
        <SectionTitle icon={ShoppingCart}>Nouvelle vente en gros</SectionTitle>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input placeholder="Nom du client" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Select
            value={brand}
            onChange={(v) => {
              setBrand(v);
              setForm((f) => ({ ...f, productId: "", unitPrice: "" }));
            }}
            options={["VOLTIC", "CRISTAL", "EAU VITALE"].map((b) => ({ value: b, label: b }))}
          />
          <div className="col-span-2">
            <Select value={form.productId} onChange={onProductChange} options={options} placeholder="Choisir le format" />
          </div>
        </div>
        {form.productId && (
          <div className="text-xs text-slate-500 mb-2">
            Stock gros disponible : <b>{lotsQty(data.lots[form.productId]?.gros)}</b> • Dernier prix d'achat : {fcfa(productsById[form.productId].purchase)}
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Input type="number" min="1" placeholder="Qté" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          <Input type="number" placeholder="Prix unit. vente" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
          <Select
            value={form.mode}
            onChange={(v) => setForm({ ...form, mode: v })}
            options={[{ value: "cash", label: "Payé cash" }, { value: "credit", label: "À crédit" }]}
          />
        </div>
        {form.productId && form.qty && form.unitPrice && (
          <div className="text-xs text-slate-500 mb-2">
            Total : <b>{fcfa(form.qty * form.unitPrice)}</b> — Bénéfice estimé :{" "}
            <b className="text-teal-700">{fcfa(form.qty * (form.unitPrice - weightedCost(data.lots[form.productId]?.gros)))}</b>
          </div>
        )}
        <Btn onClick={submit} className="w-full">
          <Plus size={16} /> Enregistrer la vente
        </Btn>
      </Card>

      <Card>
        <button className="w-full flex items-center justify-between" onClick={() => setShowCatchUp((v) => !v)}>
          <SectionTitle icon={Calendar}>Rattrapage — saisir plusieurs ventes passées</SectionTitle>
          <span className="text-slate-400 text-lg">{showCatchUp ? "▲" : "▼"}</span>
        </button>
        {!showCatchUp && (
          <p className="text-xs text-slate-500">
            Pour intégrer tes ventes depuis le 11 juin, ouvre ce panneau : ajoute une ligne par vente réelle (avec sa vraie date), puis
            importe tout d'un coup.
          </p>
        )}
        {showCatchUp && <CatchUpBatch data={data} productsById={productsById} onBatchAdd={onBatchAdd} onClose={() => setShowCatchUp(false)} />}
      </Card>

      <Card>
        <SectionTitle icon={ShoppingCart}>Historique (40 dernières)</SectionTitle>
        {list.length === 0 && <p className="text-sm text-slate-400">Aucune vente enregistrée.</p>}
        <ul className="divide-y divide-slate-100">
          {list.map((s) => {
            const p = productsById[s.productId];
            const due = s.qty * s.unitPrice - s.paidAmount;
            return (
              <li key={s.id} className="py-2 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium">{s.client}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 text-xs">{new Date(s.date).toLocaleDateString("fr-FR")}</span>
                    <ConfirmDeleteButton
                      onConfirm={() => onDelete(s.id)}
                      label={`Supprimer cette vente (${p?.brand} ${p?.format} × ${s.qty}) ? Le stock sera restitué.`}
                    />
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>
                    {p?.brand} {p?.format} × {s.qty}
                  </span>
                  <span className="font-mono">{fcfa(s.qty * s.unitPrice)}</span>
                </div>
                <div className="text-xs flex justify-between mt-0.5">
                  <span className={due > 0 ? "text-amber-600 font-semibold" : "text-teal-700"}>
                    {due > 0 ? `Solde dû : ${fcfa(due)}` : "Payé intégralement"}
                  </span>
                  <span className="text-slate-400">Bénéfice {fcfa(s.qty * (s.unitPrice - s.unitCost))}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

/* ------------------------------- Vente détail ----------------------------- */

function DetailTab({ data, totals, productsById, onOpen, onSell, onDeleteSale, onDeleteOpening }) {
  const [brand, setBrand] = useState("VOLTIC");
  const [openId, setOpenId] = useState("");
  const [openDate, setOpenDate] = useState(todayISO());
  const [form, setForm] = useState({ date: todayISO(), client: "", productId: "", qty: 1, unitPrice: "", mode: "cash" });

  const openableOptions = productOptions(data.products, brand, (p) => lotsQty(data.lots[p.id]?.gros) > 0);
  const sellableOptions = productOptions(data.products, brand, (p) => lotsQty(data.lots[p.id]?.detail) > 0);

  const onProductChange = (id) => {
    const p = productsById[id];
    setForm((f) => ({ ...f, productId: id, unitPrice: p ? p.retailPrice : "" }));
  };

  const submit = () => {
    if (!form.productId || !form.qty || !form.unitPrice) return;
    const ok = onSell({ ...form, qty: Number(form.qty), unitPrice: Number(form.unitPrice) });
    if (ok) setForm({ date: todayISO(), client: "", productId: "", qty: 1, unitPrice: "", mode: "cash" });
  };

  const list = data.detailSales.slice(0, 40);

  // Suivi par colis ouvert : combien d'unités ont déjà été vendues sur
  // chaque lot détail encore actif (le reste du lot correspond au capital
  // immobilisé — rien n'est compté comme vendu tant qu'il n'est pas sorti).
  const openPacksInProgress = [];
  data.products.forEach((p) => {
    const detailLots = data.lots[p.id]?.detail || [];
    sortLots(detailLots).forEach((l) => {
      if (l.qty > 0) {
        openPacksInProgress.push({
          key: l.id,
          product: p,
          lotNo: l.lotNo,
          date: l.date,
          sold: l.originalQty - l.qty,
          total: l.originalQty,
          remaining: l.qty,
        });
      }
    });
  });

  const openingsList = data.openings.slice(0, 30);

  return (
    <div className="space-y-3">
      <StatCard
        label="Capital immobilisé en détail"
        value={fcfa(totals.stockValueDetail)}
        sub="Coût des bouteilles déjà ouvertes mais pas encore vendues"
        tone="amber"
      />

      <Card>
        <SectionTitle icon={Package}>Suivi des colis ouverts</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Pour chaque colis ouvert : combien d'unités ont réellement été vendues jusqu'ici, et combien restent à vendre.
        </p>
        {openPacksInProgress.length === 0 && <p className="text-sm text-slate-400">Aucun colis ouvert en cours.</p>}
        <ul className="divide-y divide-slate-100">
          {openPacksInProgress.map((o) => (
            <li key={o.key} className="py-2 text-xs">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">
                  {o.product.brand} {o.product.format} — Lot #{o.lotNo}
                </span>
                <span className="text-slate-400">{new Date(o.date).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600" style={{ width: `${(o.sold / o.total) * 100}%` }} />
                </div>
                <span className="text-slate-500 shrink-0">
                  {o.sold}/{o.total} vendues ({o.remaining} restantes)
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle icon={Scissors}>1. Ouvrir un colis pour le détail</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Décompose un carton/pack acheté au prix fournisseur en bouteilles unitaires, revendues plus cher à l'unité (double bénéfice).
        </p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Input type="date" value={openDate} onChange={(e) => setOpenDate(e.target.value)} />
          <Select value={brand} onChange={(v) => { setBrand(v); setOpenId(""); }} options={["VOLTIC", "CRISTAL", "EAU VITALE"].map((b) => ({ value: b, label: b }))} />
          <Select value={openId} onChange={setOpenId} options={openableOptions} placeholder="Colis" />
        </div>
        {openId && (
          <div className="text-xs text-slate-500 mb-2">
            {productsById[openId].units} unités seront ajoutées au stock détail (coût hérité du plus ancien lot). Stock gros restant après ouverture :{" "}
            {lotsQty(data.lots[openId]?.gros) - 1}
          </div>
        )}
        <Btn onClick={() => { if (openId) { onOpen(openId, openDate); setOpenId(""); } }} className="w-full" disabled={!openId}>
          <Scissors size={16} /> Ouvrir ce colis
        </Btn>
      </Card>

      <Card>
        <SectionTitle icon={ShoppingCart}>2. Vendre à l'unité</SectionTitle>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input placeholder="Nom du client" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Select value={brand} onChange={(v) => { setBrand(v); setForm((f) => ({ ...f, productId: "", unitPrice: "" })); }} options={["VOLTIC", "CRISTAL", "EAU VITALE"].map((b) => ({ value: b, label: b }))} />
          <div className="col-span-2">
            <Select value={form.productId} onChange={onProductChange} options={sellableOptions} placeholder="Article (stock détail)" />
          </div>
        </div>
        {form.productId && (
          <div className="text-xs text-slate-500 mb-2">
            Unités disponibles : <b>{lotsQty(data.lots[form.productId]?.detail)}</b> • Coût unitaire (FIFO) :{" "}
            {fcfa(weightedCost(data.lots[form.productId]?.detail))}
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Input type="number" min="1" placeholder="Qté" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          <Input type="number" placeholder="Prix unit. détail" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
          <Select value={form.mode} onChange={(v) => setForm({ ...form, mode: v })} options={[{ value: "cash", label: "Payé cash" }, { value: "credit", label: "À crédit" }]} />
        </div>
        {form.productId && form.qty && form.unitPrice && (
          <div className="text-xs text-slate-500 mb-2">
            Total : <b>{fcfa(form.qty * form.unitPrice)}</b> — Bénéfice estimé :{" "}
            <b className="text-teal-700">
              {fcfa(form.qty * (form.unitPrice - weightedCost(data.lots[form.productId]?.detail)))}
            </b>
          </div>
        )}
        <Btn onClick={submit} className="w-full">
          <Plus size={16} /> Enregistrer la vente au détail
        </Btn>
      </Card>

      <Card>
        <SectionTitle icon={Scissors}>Historique détail (40 dernières)</SectionTitle>
        {list.length === 0 && <p className="text-sm text-slate-400">Aucune vente au détail.</p>}
        <ul className="divide-y divide-slate-100">
          {list.map((s) => {
            const p = productsById[s.productId];
            const due = s.qty * s.unitPrice - s.paidAmount;
            return (
              <li key={s.id} className="py-2 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium">{s.client}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 text-xs">{new Date(s.date).toLocaleDateString("fr-FR")}</span>
                    <ConfirmDeleteButton
                      onConfirm={() => onDeleteSale(s.id)}
                      label={`Supprimer cette vente détail (${p?.brand} ${p?.format} × ${s.qty}) ? Le stock détail sera restitué.`}
                    />
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>{p?.brand} {p?.format} (unité) × {s.qty}</span>
                  <span className="font-mono">{fcfa(s.qty * s.unitPrice)}</span>
                </div>
                <div className="text-xs flex justify-between mt-0.5">
                  <span className={due > 0 ? "text-amber-600 font-semibold" : "text-teal-700"}>
                    {due > 0 ? `Solde dû : ${fcfa(due)}` : "Payé intégralement"}
                  </span>
                  <span className="text-slate-400">Bénéfice {fcfa(s.qty * (s.unitPrice - s.unitCost))}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <SectionTitle icon={Scissors}>Historique des ouvertures de colis</SectionTitle>
        {openingsList.length === 0 && <p className="text-sm text-slate-400">Aucune ouverture enregistrée.</p>}
        <ul className="divide-y divide-slate-100">
          {openingsList.map((o) => {
            const p = productsById[o.productId];
            return (
              <li key={o.id} className="py-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {new Date(o.date).toLocaleDateString("fr-FR")} — {p?.brand} {p?.format} ouvert (+{p?.units} u.)
                </span>
                <ConfirmDeleteButton
                  onConfirm={() => onDeleteOpening(o.id)}
                  label="Annuler cette ouverture ? Impossible si des unités ont déjà été vendues dessus."
                />
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

/* -------------------------------- Clients --------------------------------- */

function ClientsTab({ data, totals, onPaySale, onPayDetail }) {
  const [payFor, setPayFor] = useState(null); // {kind, id, max}
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");

  const debts = useMemo(() => {
    const map = {};
    const push = (o, kind) => {
      const due = o.qty * o.unitPrice - o.paidAmount;
      if (due <= 0) return;
      if (!map[o.client]) map[o.client] = { client: o.client, total: 0, items: [] };
      map[o.client].total += due;
      map[o.client].items.push({ ...o, kind, due });
    };
    data.sales.forEach((s) => push(s, "sales"));
    data.detailSales.forEach((s) => push(s, "detailSales"));
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [data]);

  const totalDebt = debts.reduce((s, d) => s + d.total, 0);

  // Base clients : tous les clients ayant déjà acheté, avec leur date de
  // dernier achat — pour relancer ceux qu'on n'a pas revus depuis longtemps.
  const today = todayISO();
  const daysBetween = (d1, d2) => Math.round((new Date(d2) - new Date(d1)) / 86400000);
  const clientBase = useMemo(() => {
    const map = {};
    totals.allOps.forEach((o) => {
      if (!map[o.client]) map[o.client] = { client: o.client, lastDate: o.date, count: 0, totalSpent: 0 };
      const c = map[o.client];
      c.count += 1;
      c.totalSpent += o.qty * o.unitPrice;
      if (o.date > c.lastDate) c.lastDate = o.date;
    });
    return Object.values(map)
      .filter((c) => c.client.toLowerCase().includes(search.toLowerCase()))
      .map((c) => ({ ...c, daysSince: daysBetween(c.lastDate, today) }))
      .sort((a, b) => b.daysSince - a.daysSince);
  }, [totals.allOps, search, today]);

  const confirmPay = () => {
    if (!payFor || !amount) return;
    const amt = Math.min(Number(amount), payFor.max);
    if (payFor.kind === "sales") onPaySale(payFor.id, amt);
    else onPayDetail(payFor.id, amt);
    setPayFor(null);
    setAmount("");
  };

  return (
    <div className="space-y-3">
      <StatCard label="Total des créances clients" value={fcfa(totalDebt)} tone="amber" />
      {debts.length === 0 && (
        <Card>
          <p className="text-sm text-slate-400">Aucune créance en cours — tous les clients sont à jour.</p>
        </Card>
      )}
      {debts.map((d) => (
        <Card key={d.client}>
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-sm flex items-center gap-1.5">
              <Users size={14} className="text-amber-600" /> {d.client}
            </div>
            <div className="font-mono font-bold text-amber-600">{fcfa(d.total)}</div>
          </div>
          <ul className="divide-y divide-slate-100">
            {d.items.map((it) => (
              <li key={it.id} className="py-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {new Date(it.date).toLocaleDateString("fr-FR")} — {it.kind === "sales" ? "Gros" : "Détail"} — dû {fcfa(it.due)}
                </span>
                <button
                  className="text-teal-700 font-semibold flex items-center gap-0.5"
                  onClick={() => setPayFor({ kind: it.kind, id: it.id, max: it.due })}
                >
                  Encaisser <ChevronRight size={12} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Card>
        <SectionTitle icon={Users}>Base clients (relance)</SectionTitle>
        <Input placeholder="Rechercher un client…" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-2" />
        {clientBase.length === 0 && <p className="text-sm text-slate-400">Aucun client enregistré.</p>}
        <ul className="divide-y divide-slate-100">
          {clientBase.map((c) => (
            <li key={c.client} className="py-2 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{c.client}</div>
                <div className="text-xs text-slate-400">
                  {c.count} achat(s) • {fcfa(c.totalSpent)} au total
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">{new Date(c.lastDate).toLocaleDateString("fr-FR")}</div>
                <div
                  className={`text-xs font-semibold ${
                    c.daysSince > 60 ? "text-rose-600" : c.daysSince > 30 ? "text-amber-600" : "text-teal-700"
                  }`}
                >
                  {c.daysSince === 0 ? "Aujourd'hui" : `il y a ${c.daysSince} j`}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {payFor && (
        <Modal onClose={() => setPayFor(null)} title="Encaisser un paiement">
          <p className="text-xs text-slate-500 mb-2">Montant dû : {fcfa(payFor.max)}</p>
          <Input type="number" placeholder="Montant reçu" value={amount} onChange={(e) => setAmount(e.target.value)} className="mb-2" />
          <Btn onClick={confirmPay} className="w-full">
            <Check size={16} /> Valider l'encaissement
          </Btn>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm">{title}</h3>
          <button onClick={onClose}>
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Petit bouton "corbeille" avec confirmation obligatoire avant suppression,
// réutilisé partout dans l'app (ventes, réappros, ouvertures, prêts...).
function ConfirmDeleteButton({ onConfirm, label = "Supprimer cette ligne ?", size = 14 }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <button onClick={() => setConfirming(true)} className="text-rose-400 shrink-0" title="Supprimer">
        <Trash2 size={size} />
      </button>
      {confirming && (
        <Modal onClose={() => setConfirming(false)} title="Confirmer la suppression">
          <p className="text-sm text-slate-600 mb-3">{label}</p>
          <div className="grid grid-cols-2 gap-2">
            <Btn kind="ghost" onClick={() => setConfirming(false)}>
              Annuler
            </Btn>
            <Btn
              kind="danger"
              onClick={() => {
                onConfirm();
                setConfirming(false);
              }}
            >
              <Trash2 size={14} /> Supprimer
            </Btn>
          </div>
        </Modal>
      )}
    </>
  );
}

/* --------------------------------- Prêts ---------------------------------- */

function LoansTab({ data, onAdd, onRepay, onDelete, onDeleteRepayment }) {
  const [form, setForm] = useState({ date: todayISO(), beneficiary: "", amount: "", note: "", isOpening: false });
  const [repayId, setRepayId] = useState(null);
  const [amt, setAmt] = useState("");
  const [expanded, setExpanded] = useState(null);

  const submit = () => {
    if (!form.beneficiary || !form.amount) return;
    onAdd({ ...form, amount: Number(form.amount) });
    setForm({ date: todayISO(), beneficiary: "", amount: "", note: "", isOpening: false });
  };

  const outstanding = data.loans.reduce((s, l) => s + Math.max(0, l.amount - repaidAmount(l)), 0);

  return (
    <div className="space-y-3">
      <StatCard label="Prêts en cours (à recevoir)" value={fcfa(outstanding)} tone="amber" />
      <Card>
        <SectionTitle icon={HandCoins}>Nouveau prêt effectué</SectionTitle>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input placeholder="Bénéficiaire" value={form.beneficiary} onChange={(e) => setForm({ ...form, beneficiary: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="number" placeholder="Montant prêté" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input placeholder="Note (optionnel)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </div>
        <label className="flex items-start gap-2 text-xs text-slate-600 mb-2">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.isOpening}
            onChange={(e) => setForm({ ...form, isOpening: e.target.checked })}
          />
          <span>
            Ce prêt existait déjà <b>avant le début du suivi</b> (ne déduit pas la trésorerie actuelle, mais compte quand même comme
            actif à recevoir)
          </span>
        </label>
        <Btn onClick={submit} className="w-full">
          <Plus size={16} /> Enregistrer le prêt
        </Btn>
      </Card>

      <Card>
        <SectionTitle icon={HandCoins}>Prêts en cours</SectionTitle>
        {data.loans.length === 0 && <p className="text-sm text-slate-400">Aucun prêt enregistré.</p>}
        <ul className="divide-y divide-slate-100">
          {data.loans.map((l) => {
            const repaid = repaidAmount(l);
            const due = l.amount - repaid;
            const isOpen = expanded === l.id;
            const repayments = l.repayments || [];
            return (
              <li key={l.id} className="py-2 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium">
                    {l.beneficiary}
                    {l.isOpening && (
                      <span className="ml-1.5 text-xs font-normal text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        prêt de départ
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">{new Date(l.date).toLocaleDateString("fr-FR")}</span>
                    <ConfirmDeleteButton onConfirm={() => onDelete(l.id)} label={`Supprimer ce prêt à ${l.beneficiary} (${fcfa(l.amount)}) ?`} />
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex justify-between mt-0.5 items-center">
                  <button
                    className="underline decoration-dotted"
                    onClick={() => setExpanded(isOpen ? null : l.id)}
                    disabled={repayments.length === 0}
                  >
                    Prêté {fcfa(l.amount)} • Remboursé {fcfa(repaid)}
                    {repayments.length > 0 ? (isOpen ? " ▲" : " ▼") : ""}
                  </button>
                  {due > 0 ? (
                    <button className="text-teal-700 font-semibold" onClick={() => setRepayId(l.id)}>
                      Solde {fcfa(due)} — encaisser
                    </button>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="text-teal-700 font-semibold">Soldé</span>
                      <ConfirmDeleteButton
                        onConfirm={() => onDelete(l.id)}
                        label={`Supprimer ce prêt soldé (${l.beneficiary}, ${fcfa(l.amount)}) ?`}
                      />
                    </span>
                  )}
                </div>
                {isOpen && repayments.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-2 mt-2 space-y-1">
                    <div className="text-xs text-slate-400 uppercase mb-1">Remboursements enregistrés</div>
                    {repayments.map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs py-0.5">
                        <span>{new Date(r.date).toLocaleDateString("fr-FR")} — {fcfa(r.amount)}</span>
                        <ConfirmDeleteButton
                          onConfirm={() => onDeleteRepayment(l.id, r.id)}
                          label={`Supprimer ce remboursement partiel de ${fcfa(r.amount)} ?`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      {repayId && (
        <Modal onClose={() => setRepayId(null)} title="Enregistrer un remboursement">
          <Input type="number" placeholder="Montant remboursé" value={amt} onChange={(e) => setAmt(e.target.value)} className="mb-2" />
          <Btn
            className="w-full"
            onClick={() => {
              if (amt) onRepay(repayId, Number(amt));
              setRepayId(null);
              setAmt("");
            }}
          >
            <Check size={16} /> Valider
          </Btn>
        </Modal>
      )}
    </div>
  );
}

/* --------------------------------- Stock ----------------------------------- */

function StockTab({ data, productsById, totals, onRestock, onDeleteRestock }) {
  const [brand, setBrand] = useState("VOLTIC");
  const [form, setForm] = useState({ date: todayISO(), productId: "", qty: 1, unitCost: "", updateReference: true });
  const [expanded, setExpanded] = useState(null);

  const options = productOptions(data.products, brand);
  const onProductChange = (id) => {
    const p = productsById[id];
    setForm((f) => ({ ...f, productId: id, unitCost: p ? p.purchase : "" }));
  };

  const submit = () => {
    if (!form.productId || !form.qty || !form.unitCost) return;
    onRestock({ ...form, qty: Number(form.qty), unitCost: Number(form.unitCost) });
    setForm({ date: todayISO(), productId: "", qty: 1, unitCost: "", updateReference: true });
  };

  const brands = ["VOLTIC", "CRISTAL", "EAU VITALE"];
  const priceChanged = form.productId && Number(form.unitCost) !== productsById[form.productId]?.purchase;

  // Totaux généraux, toutes marques et tous formats confondus — ce qu'il
  // reste réellement après toutes les ventes déjà enregistrées.
  let grandGros = 0;
  let grandDetail = 0;
  data.products.forEach((p) => {
    grandGros += lotsQty(data.lots[p.id]?.gros);
    grandDetail += lotsQty(data.lots[p.id]?.detail);
  });

  return (
    <div className="space-y-3">
      <Card>
        <SectionTitle icon={Boxes}>Total général — toutes marques</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-xl p-2 text-center">
            <div className="text-xs text-slate-400 uppercase">Colis (gros)</div>
            <div className="font-mono font-bold text-lg">{grandGros}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 text-center">
            <div className="text-xs text-slate-400 uppercase">Unités (détail)</div>
            <div className="font-mono font-bold text-lg">{grandDetail}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 text-center">
            <div className="text-xs text-slate-400 uppercase">Valeur totale</div>
            <div className="font-mono font-bold text-lg">{fcfa(totals.stockValue)}</div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Quantités restantes après toutes les ventes déjà enregistrées (coût au prix réel des lots FIFO).
        </p>
      </Card>

      <Card>
        <SectionTitle icon={Boxes}>Réapprovisionnement (achat fournisseur)</SectionTitle>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Select value={brand} onChange={(v) => { setBrand(v); setForm((f) => ({ ...f, productId: "", unitCost: "" })); }} options={brands.map((b) => ({ value: b, label: b }))} />
          <Select value={form.productId} onChange={onProductChange} options={options} placeholder="Format" />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="number" min="1" placeholder="Qté achetée" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          <Input type="number" placeholder="Coût unitaire payé" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
        </div>
        {form.qty && form.unitCost && (
          <div className="text-xs text-slate-500 mb-2">Coût total : <b>{fcfa(form.qty * form.unitCost)}</b> (sortie de trésorerie)</div>
        )}
        {form.productId && (
          <label className="flex items-center gap-2 text-xs text-slate-600 mb-2">
            <input
              type="checkbox"
              checked={form.updateReference}
              onChange={(e) => setForm({ ...form, updateReference: e.target.checked })}
            />
            {priceChanged
              ? `Ce lot devient le nouveau prix d'achat de référence (${fcfa(productsById[form.productId].purchase)} → ${fcfa(form.unitCost)})`
              : "Utiliser ce prix comme référence pour les prochains achats"}
          </label>
        )}
        <Btn onClick={submit} className="w-full">
          <Plus size={16} /> Ajouter ce lot au stock
        </Btn>
      </Card>

      <Card>
        <SectionTitle icon={Boxes}>Historique des réappros (30 derniers)</SectionTitle>
        {data.restocks.length === 0 && <p className="text-sm text-slate-400">Aucun réappro enregistré.</p>}
        <ul className="divide-y divide-slate-100">
          {data.restocks.slice(0, 30).map((r) => {
            const p = productsById[r.productId];
            return (
              <li key={r.id} className="py-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {new Date(r.date).toLocaleDateString("fr-FR")} — {p?.brand} {p?.format} × {r.qty} à {fcfa(r.unitCost)}
                </span>
                <ConfirmDeleteButton
                  onConfirm={() => onDeleteRestock(r.id)}
                  label="Supprimer ce réappro ? Impossible si ce lot a déjà été partiellement vendu."
                />
              </li>
            );
          })}
        </ul>
      </Card>

      {brands.map((b) => {
        const c = BRAND_COLOR[b];
        const rows = data.products.filter((p) => p.brand === b);
        const brandGros = rows.reduce((s, p) => s + lotsQty(data.lots[p.id]?.gros), 0);
        const brandDetail = rows.reduce((s, p) => s + lotsQty(data.lots[p.id]?.detail), 0);
        const brandVal = rows.reduce((s, p) => {
          const g = data.lots[p.id]?.gros || [];
          const de = data.lots[p.id]?.detail || [];
          return s + g.reduce((a, l) => a + l.qty * l.unitCost, 0) + de.reduce((a, l) => a + l.qty * l.unitCost, 0);
        }, 0);
        return (
          <Card key={b}>
            <div className={`flex items-center gap-2 mb-2`}>
              <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
              <h3 className="font-bold text-sm">{b}</h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 text-left">
                  <th className="font-medium pb-1">Format</th>
                  <th className="font-medium pb-1 text-right">Gros</th>
                  <th className="font-medium pb-1 text-right">Détail</th>
                  <th className="font-medium pb-1 text-right">Valeur</th>
                  <th className="font-medium pb-1 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const grosLots = data.lots[p.id]?.gros || [];
                  const detailLots = data.lots[p.id]?.detail || [];
                  const grosQty = lotsQty(grosLots);
                  const detailQty = lotsQty(detailLots);
                  const val = grosLots.reduce((s, l) => s + l.qty * l.unitCost, 0) + detailLots.reduce((s, l) => s + l.qty * l.unitCost, 0);
                  const isOpen = expanded === p.id;
                  return (
                    <Fragment key={p.id}>
                      <tr className="border-t border-slate-100 cursor-pointer" onClick={() => setExpanded(isOpen ? null : p.id)}>
                        <td className="py-1.5">{p.format}</td>
                        <td className="py-1.5 text-right font-mono">{grosQty}</td>
                        <td className="py-1.5 text-right font-mono">{detailQty}</td>
                        <td className="py-1.5 text-right font-mono">{fcfa(val)}</td>
                        <td className="py-1.5 text-right text-slate-300">{isOpen ? "▲" : "▼"}</td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={5} className="pb-2">
                            <div className="bg-slate-50 rounded-lg p-2 space-y-2">
                              <div>
                                <div className="text-xs uppercase text-slate-400 mb-1">Lots gros (le plus ancien vendu en premier)</div>
                                {grosLots.length === 0 && <div className="text-slate-400 text-xs">Aucun lot.</div>}
                                {sortLots(grosLots).map((l) => (
                                  <div key={l.id} className="flex justify-between text-xs py-0.5">
                                    <span>Lot #{l.lotNo} — {new Date(l.date).toLocaleDateString("fr-FR")} — {l.qty} u.</span>
                                    <span className="font-mono">{fcfa(l.unitCost)}/u</span>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <div className="text-xs uppercase text-slate-400 mb-1">Lots détail (bouteilles ouvertes)</div>
                                {detailLots.length === 0 && <div className="text-slate-400 text-xs">Aucun lot.</div>}
                                {sortLots(detailLots).map((l) => (
                                  <div key={l.id} className="flex justify-between text-xs py-0.5">
                                    <span>Lot #{l.lotNo} — {new Date(l.date).toLocaleDateString("fr-FR")} — {l.qty} u.</span>
                                    <span className="font-mono">{fcfa(l.unitCost)}/u</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 font-bold">
                  <td className="py-1.5">Total {b}</td>
                  <td className="py-1.5 text-right font-mono">{brandGros}</td>
                  <td className="py-1.5 text-right font-mono">{brandDetail}</td>
                  <td className="py-1.5 text-right font-mono">{fcfa(brandVal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </Card>
        );
      })}
    </div>
  );
}

/* --------------------------------- Bilan ------------------------------------ */

function BalanceTab({
  data,
  totals,
  onSetCash,
  onSetStartingCapital,
  onAddLiability,
  onRemoveLiability,
  onAddWithdrawal,
  onDeleteWithdrawal,
  onAddPersonalNote,
  onDeletePersonalNote,
}) {
  const [cash, setCash] = useState(data.meta.initialCash);
  const [capital, setCapital] = useState(data.meta.startingCapital || 0);
  const [liab, setLiab] = useState({ date: todayISO(), label: "", amount: "" });
  const [withdrawal, setWithdrawal] = useState({ date: todayISO(), amount: "", note: "" });
  const [note, setNote] = useState({ date: todayISO(), label: "", amount: "" });

  const submitLiab = () => {
    if (!liab.label || !liab.amount) return;
    onAddLiability({ ...liab, amount: Number(liab.amount) });
    setLiab({ date: todayISO(), label: "", amount: "" });
  };

  const submitWithdrawal = () => {
    if (!withdrawal.amount) return;
    onAddWithdrawal({ ...withdrawal, amount: Number(withdrawal.amount) });
    setWithdrawal({ date: todayISO(), amount: "", note: "" });
  };

  const submitNote = () => {
    if (!note.label || !note.amount) return;
    onAddPersonalNote({ ...note, amount: Number(note.amount) });
    setNote({ date: todayISO(), label: "", amount: "" });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total actifs" value={fcfa(totals.assets)} />
        <StatCard
          label="Valeur nette (capital)"
          value={fcfa(totals.netWorth)}
          tone={totals.netWorth >= 0 ? "teal" : "rose"}
        />
      </div>

      <Card>
        <SectionTitle icon={PiggyBank}>Objectif — dette envers l'investisseur</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Tant que la valeur nette du business n'a pas atteint ce montant, tu n'es pas encore en excédent réel — tout va d'abord au
          remboursement de la dette (et aux besoins de la famille, pas de salaire de gérant pour l'instant).
        </p>
        <Row label="Montant à atteindre (prêt investisseur)" value={fcfa(totals.startingCapital)} />
        <Row label="Valeur nette actuelle" value={fcfa(totals.netWorth)} />
        <ProgressBar value={totals.netWorth} target={totals.startingCapital} />
        <Row
          label={totals.netResult >= 0 ? "Excédent réel (au-delà de la dette)" : "Reste à générer avant excédent"}
          value={fcfa(Math.abs(totals.netResult))}
          bold
          tone={totals.netResult >= 0 ? "teal" : "rose"}
        />
        <div className="flex gap-2 mt-2">
          <Input type="number" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="Montant du prêt (ex: 1000000)" />
          <Btn onClick={() => onSetStartingCapital(Number(capital) || 0)}>
            <Check size={16} /> Mettre à jour
          </Btn>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={HandCoins}>Rémunération du gérant</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Ce que tu prélèves pour ta gestion, distinct du capital de l'actionnaire. Chaque retrait sort de la trésorerie et vient en
          déduction du résultat qui revient à l'actionnaire.
        </p>
        <StatCard label="Total versé à ce jour" value={fcfa(totals.withdrawalsTotal)} tone="amber" />
        {data.withdrawals.length > 0 && (
          <ul className="divide-y divide-slate-100 my-2">
            {data.withdrawals.map((w) => (
              <li key={w.id} className="py-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {new Date(w.date).toLocaleDateString("fr-FR")} — {fcfa(w.amount)}
                  {w.note ? ` (${w.note})` : ""}
                </span>
                <ConfirmDeleteButton onConfirm={() => onDeleteWithdrawal(w.id)} label={`Supprimer ce retrait de ${fcfa(w.amount)} ?`} />
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-2 gap-2 mb-2 mt-2">
          <Input type="date" value={withdrawal.date} onChange={(e) => setWithdrawal({ ...withdrawal, date: e.target.value })} />
          <Input type="number" placeholder="Montant" value={withdrawal.amount} onChange={(e) => setWithdrawal({ ...withdrawal, amount: e.target.value })} />
        </div>
        <Input placeholder="Note (optionnel)" value={withdrawal.note} onChange={(e) => setWithdrawal({ ...withdrawal, note: e.target.value })} className="mb-2" />
        <Btn onClick={submitWithdrawal} className="w-full" kind="ghost">
          <Plus size={16} /> Enregistrer un retrait
        </Btn>
      </Card>

      <Card>
        <SectionTitle icon={Wallet}>Trésorerie de départ</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Montant en caisse au {new Date(data.meta.startDate).toLocaleDateString("fr-FR")} (avant toute vente enregistrée ici).
        </p>
        <div className="flex gap-2">
          <Input type="number" value={cash} onChange={(e) => setCash(e.target.value)} />
          <Btn onClick={() => onSetCash(Number(cash) || 0)}>
            <Check size={16} /> Mettre à jour
          </Btn>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={PiggyBank}>Actifs</SectionTitle>
        <Row label="Trésorerie disponible" value={fcfa(totals.treasury)} />
        <Row label="Valeur du stock (gros + détail)" value={fcfa(totals.stockValue)} />
        <Row label="Créances clients" value={fcfa(totals.receivables)} />
        <Row label="Prêts en cours (à recevoir)" value={fcfa(totals.loansOutstanding)} />
        <Row label="Total actifs" value={fcfa(totals.assets)} bold />
      </Card>

      <Card>
        <SectionTitle icon={AlertCircle}>Passifs (dettes de l'entreprise)</SectionTitle>
        {data.liabilities.length === 0 && <p className="text-sm text-slate-400 mb-2">Aucun passif déclaré.</p>}
        <ul className="divide-y divide-slate-100 mb-2">
          {data.liabilities.map((l) => (
            <li key={l.id} className="py-1.5 flex items-center justify-between text-sm">
              <span>{l.label}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono">{fcfa(l.amount)}</span>
                <ConfirmDeleteButton onConfirm={() => onRemoveLiability(l.id)} label={`Supprimer ce passif "${l.label}" (${fcfa(l.amount)}) ?`} />
              </span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input placeholder="Intitulé (ex: dette fournisseur)" value={liab.label} onChange={(e) => setLiab({ ...liab, label: e.target.value })} />
          <Input type="number" placeholder="Montant" value={liab.amount} onChange={(e) => setLiab({ ...liab, amount: e.target.value })} />
        </div>
        <Btn onClick={submitLiab} className="w-full" kind="ghost">
          <Plus size={16} /> Ajouter un passif
        </Btn>
      </Card>

      <Card>
        <Row label="Total actifs" value={fcfa(totals.assets)} />
        <Row label="Total passifs" value={fcfa(totals.liabilitiesTotal)} />
        <Row label="Valeur nette (capital)" value={fcfa(totals.netWorth)} bold tone={totals.netWorth >= 0 ? "teal" : "rose"} />
      </Card>

      <Card>
        <SectionTitle icon={AlertCircle}>Hors bilan — informations personnelles</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Purement informatif : ces montants n'affectent jamais les totaux du business ci-dessus (ex : ce que tu dois
          personnellement à un tiers, sans lien avec l'activité de l'eau).
        </p>
        {data.personalNotes.length === 0 && <p className="text-sm text-slate-400 mb-2">Aucune note.</p>}
        <ul className="divide-y divide-slate-100 mb-2">
          {data.personalNotes.map((n) => (
            <li key={n.id} className="py-1.5 flex items-center justify-between text-sm">
              <span>
                {n.label}
                <span className="text-slate-400 text-xs ml-1">({new Date(n.date).toLocaleDateString("fr-FR")})</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-slate-600">{fcfa(n.amount)}</span>
                <ConfirmDeleteButton onConfirm={() => onDeletePersonalNote(n.id)} label={`Supprimer cette note "${n.label}" ?`} />
              </span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input placeholder="Intitulé (ex: dû à [nom])" value={note.label} onChange={(e) => setNote({ ...note, label: e.target.value })} />
          <Input type="number" placeholder="Montant" value={note.amount} onChange={(e) => setNote({ ...note, amount: e.target.value })} />
        </div>
        <Btn onClick={submitNote} className="w-full" kind="ghost">
          <Plus size={16} /> Ajouter une note
        </Btn>
      </Card>
    </div>
  );
}

function Row({ label, value, bold, tone }) {
  const toneClass = tone === "rose" ? "text-rose-600" : tone === "teal" ? "text-teal-700" : "text-slate-800";
  return (
    <div className={`flex justify-between py-1.5 text-sm ${bold ? "border-t border-slate-200 mt-1 pt-2" : ""}`}>
      <span className={bold ? "font-bold" : "text-slate-500"}>{label}</span>
      <span className={`font-mono ${bold ? `font-bold ${toneClass}` : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

// Barre de progression vers un objectif (ex : dette à couvrir). Se remplit
// en teal jusqu'à 100%, puis passe en excédent (affiché au-delà de la barre
// via le Row associé).
function ProgressBar({ value, target }) {
  const pct = target > 0 ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;
  const reached = value >= target && target > 0;
  return (
    <div className="my-2">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{pct.toFixed(0)}% atteint</span>
        {reached && <span className="text-teal-700 font-semibold">Objectif atteint 🎉</span>}
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${reached ? "bg-teal-600" : "bg-amber-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------- Paramètres --------------------------------- */

function SettingsTab({ data, onUpdate, onRestore, onExported }) {
  const brands = ["VOLTIC", "CRISTAL", "EAU VITALE"];
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pastedJson, setPastedJson] = useState("");

  const backupJson = () => JSON.stringify(data, null, 2);
  const backupFilename = () => `multivers-eau-sauvegarde-${todayISO()}.json`;

  const exportBackup = async () => {
    const filename = backupFilename();
    const json = backupJson();
    const blob = new Blob([json], { type: "application/json" });

    // 1) Partage natif Android/iOS — le plus fiable depuis une vue intégrée
    // comme celle de Claude, qui bloque parfois les téléchargements directs.
    try {
      const file = new File([blob], filename, { type: "application/json" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        onExported();
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return; // l'utilisateur a annulé le partage, rien de cassé
    }

    // 2) Téléchargement classique (fonctionne dans un vrai navigateur)
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onExported();
      return;
    } catch (e) {
      // on continue vers le dernier recours
    }

    // 3) Dernier recours : afficher le texte pour copier/coller manuellement
    setShowRaw(true);
  };

  const copyRaw = async () => {
    try {
      await navigator.clipboard.writeText(backupJson());
      setCopied(true);
      onExported();
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(false);
    }
  };

  const onFileChosen = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onRestore(reader.result);
      setImporting(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const lastExport = data.meta.lastExportAt ? new Date(data.meta.lastExportAt) : null;
  const daysSinceExport = lastExport ? Math.round((Date.now() - lastExport.getTime()) / 86400000) : null;

  return (
    <div className="space-y-3">
      <Card>
        <SectionTitle icon={Wallet}>Sauvegarde de tes données</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Tes données sont enregistrées automatiquement à chaque action. Par précaution, tu peux aussi exporter un fichier de
          sauvegarde à tout moment, et le réimporter plus tard si besoin (par ex. en cas de problème technique).
        </p>
        <p className={`text-xs mb-2 font-medium ${daysSinceExport === null || daysSinceExport > 3 ? "text-amber-600" : "text-teal-700"}`}>
          {lastExport
            ? `Dernière sauvegarde exportée : ${lastExport.toLocaleDateString("fr-FR")} (il y a ${daysSinceExport} j)`
            : "Aucune sauvegarde exportée pour l'instant — pense à en faire une !"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={exportBackup} kind="ghost">
            Exporter une sauvegarde
          </Btn>
          <Btn onClick={() => setImporting(true)} kind="ghost">
            Importer une sauvegarde
          </Btn>
        </div>
        <button onClick={() => setShowRaw(true)} className="w-full text-xs text-slate-400 underline mt-2">
          Le téléchargement ne marche pas ? Copier le texte manuellement
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={onFileChosen} />
      </Card>

      {showRaw && (
        <Modal onClose={() => setShowRaw(false)} title="Copier ta sauvegarde">
          <p className="text-xs text-slate-500 mb-2">
            Si le téléchargement ne fonctionne pas sur ton téléphone (fréquent dans les apps comme Claude), copie ce texte et
            colle-le dans tes Notes, ou envoie-le toi-même par message — tu pourras le réimporter plus tard en le collant dans un
            fichier <code>.json</code>.
          </p>
          <textarea
            readOnly
            value={backupJson()}
            onFocus={(e) => e.target.select()}
            className="w-full h-40 text-xs font-mono border border-slate-200 rounded-lg p-2 mb-2"
          />
          <Btn onClick={copyRaw} className="w-full">
            <Check size={16} /> {copied ? "Copié !" : "Copier le texte"}
          </Btn>
        </Modal>
      )}

      {importing && (
        <Modal onClose={() => setImporting(false)} title="Importer une sauvegarde">
          <p className="text-sm text-slate-600 mb-3">
            Attention : ceci va <b>remplacer entièrement</b> les données actuelles de l'application par celles du fichier importé.
            Cette action ne peut pas être annulée.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Btn kind="ghost" onClick={() => setImporting(false)}>
              Annuler
            </Btn>
            <Btn kind="danger" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
              Choisir le fichier
            </Btn>
          </div>
          <p className="text-xs text-slate-400 mb-1">Ou colle directement le texte de ta sauvegarde ici :</p>
          <textarea
            placeholder="Colle ici le contenu JSON copié précédemment…"
            value={pastedJson}
            onChange={(e) => setPastedJson(e.target.value)}
            className="w-full h-24 text-xs font-mono border border-slate-200 rounded-lg p-2 mb-2"
          />
          {pastedJson.trim() && (
            <Btn
              kind="danger"
              className="w-full"
              onClick={() => {
                onRestore(pastedJson);
                setPastedJson("");
                setImporting(false);
              }}
            >
              Restaurer ce texte
            </Btn>
          )}
        </Modal>
      )}

      <Card>
        <SectionTitle icon={Settings}>Prix par article</SectionTitle>
        <p className="text-xs text-slate-500">
          Ces prix ne sont que des <b>valeurs par défaut</b> — modifiables librement au moment de chaque vente. Le "prix d'achat de
          référence" ne change pas le coût des lots déjà en stock (géré en FIFO) ; il sert seulement de valeur pré-remplie pour vos
          prochains réapprovisionnements.
        </p>
      </Card>
      {brands.map((b) => {
        const c = BRAND_COLOR[b];
        const rows = data.products.filter((p) => p.brand === b);
        return (
          <Card key={b}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
              <h3 className="font-bold text-sm">{b}</h3>
            </div>
            <div className="space-y-2">
              {rows.map((p) => (
                <div key={p.id} className="border border-slate-100 rounded-lg p-2">
                  <div className="text-xs font-medium mb-1">{p.format}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs items-center">
                    <div>
                      <label className="text-xs text-slate-400">Achat (référence)</label>
                      <Input type="number" value={p.purchase} onChange={(e) => onUpdate(p.id, { purchase: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Vente gros</label>
                      <Input type="number" value={p.sellPrice} onChange={(e) => onUpdate(p.id, { sellPrice: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Vente détail (/u)</label>
                      <Input type="number" value={p.retailPrice} onChange={(e) => onUpdate(p.id, { retailPrice: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
