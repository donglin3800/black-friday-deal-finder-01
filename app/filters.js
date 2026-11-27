// Deal Scout — filtering, sorting and the maths behind each deal.
//
// Every percentage and saving shown on the site is computed here from the
// deal's two prices, so a discount can never disagree with its prices.

import { DEALS } from "./data.js";

export const VERDICT_RANK = { "new-low": 0, strong: 1, good: 2, routine: 3 };

export function discountPct(deal) {
  if (!deal.usual || deal.usual <= deal.sale) return 0;
  return Math.round((1 - deal.sale / deal.usual) * 100);
}

export function saving(deal) {
  return Math.max(0, deal.usual - deal.sale);
}

export function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function moneyShort(n) {
  const s = n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "$" + s;
}

// The shopper's current view: what they searched for and which filters
// are on. `minDiscount` is 0, 20, 30, 40 or 50.
export function blankState() {
  return { q: "", category: "all", store: "all", minDiscount: 0, sort: "discount", verdict: "all" };
}

export function applyFilters(deals, state) {
  const q = state.q.trim().toLowerCase();
  let out = deals.filter((d) => {
    if (state.category !== "all" && d.category !== state.category) return false;
    if (state.store !== "all" && d.store !== state.store) return false;
    if (state.verdict !== "all" && d.verdict !== state.verdict) return false;
    if (discountPct(d) < state.minDiscount) return false;
    if (q) {
      const hay = (d.name + " " + d.store + " " + d.tag).toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  return sortDeals(out, state.sort);
}

export function sortDeals(deals, sort) {
  const list = deals.slice();
  switch (sort) {
    case "discount":
      list.sort((a, b) => discountPct(b) - discountPct(a) || saving(b) - saving(a));
      break;
    case "saving":
      list.sort((a, b) => saving(b) - saving(a));
      break;
    case "price-low":
      list.sort((a, b) => a.sale - b.sale);
      break;
    case "price-high":
      list.sort((a, b) => b.sale - a.sale);
      break;
    case "verdict":
      list.sort((a, b) => VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || discountPct(b) - discountPct(a));
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      list.sort((a, b) => discountPct(b) - discountPct(a));
  }
  return list;
}

export function topDeals(n) {
  return sortDeals(DEALS, "discount").slice(0, n);
}

export function stats() {
  const totalSaving = DEALS.reduce((s, d) => s + saving(d), 0);
  const maxPct = Math.max(...DEALS.map(discountPct));
  const newLows = DEALS.filter((d) => d.verdict === "new-low").length;
  const stores = [...new Set(DEALS.map((d) => d.store))];
  return { count: DEALS.length, totalSaving, maxPct, newLows, stores: stores.length };
}
