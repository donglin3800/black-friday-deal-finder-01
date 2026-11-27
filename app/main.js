// Deal Scout — the wiring: search, filters, sorting and hash routes.
//
// Routes:
//   #/                       the deal list, filters read from the hash query
//   #/?cat=tvs&min=40       the list with filters already applied
//   #/deal/<id>             one deal, with its verdict and store comparison
//
// The list reads its filters from the hash so a filtered view can be
// linked to — and so a screenshot can show a filter visibly working.

import { CATEGORIES, DEALS, SALE_WINDOW, STORES, VERDICTS } from "./data.js";
import { applyFilters, blankState, stats } from "./filters.js";
import { dealCard, dealDetail, emptyState, statsBar } from "./render.js";

const state = blankState();
let grid, countLine, heroStrip;

function readHash() {
  const raw = location.hash.slice(1);
  const [path, query] = raw.split("?");
  const params = new URLSearchParams(query || "");
  return { path: path || "/", params };
}

function writeHash() {
  const p = new URLSearchParams();
  if (state.category !== "all") p.set("cat", state.category);
  if (state.store !== "all") p.set("store", state.store);
  if (state.minDiscount) p.set("min", String(state.minDiscount));
  if (state.sort !== "discount") p.set("sort", state.sort);
  if (state.verdict !== "all") p.set("verdict", state.verdict);
  if (state.q) p.set("q", state.q);
  const q = p.toString();
  history.replaceState(null, "", "#/" + (q ? "?" + q : ""));
}

function stateFromHash(params) {
  state.q = params.get("q") || "";
  state.category = params.get("cat") || "all";
  state.store = params.get("store") || "all";
  state.minDiscount = Number(params.get("min") || 0);
  state.sort = params.get("sort") || "discount";
  state.verdict = params.get("verdict") || "all";
}

function renderList() {
  const list = applyFilters(DEALS, state);
  renderHero(list);
  grid.replaceChildren();
  list.forEach((d) => grid.append(dealCard(d)));
  if (!list.length) grid.append(emptyState());
  countLine.textContent =
    list.length + " of " + DEALS.length + " deals" +
    (state.category !== "all" ? " · " + (CATEGORIES.find((c) => c.id === state.category) || {}).label : "") +
    (state.minDiscount ? " · " + state.minDiscount + "% off or more" : "");
  syncControls();
}

// The hero strip always shows the top 3 of the deals currently listed, so
// it never disagrees with the filters: filter to TVs and the hero is TVs.
function renderHero(list) {
  heroStrip.replaceChildren();
  list.slice(0, 3).forEach((d) => {
    const card = dealCard(d);
    card.classList.add("hero-card");
    heroStrip.append(card);
  });
}

function syncControls() {
  const q = document.getElementById("search");
  if (q && q.value !== state.q) q.value = state.q;
  document.querySelectorAll("[data-cat]").forEach((b) =>
    b.classList.toggle("active", b.dataset.cat === state.category));
  document.querySelectorAll("[data-min]").forEach((b) =>
    b.classList.toggle("active", Number(b.dataset.min) === state.minDiscount));
  document.querySelectorAll("[data-verdict]").forEach((b) =>
    b.classList.toggle("active", b.dataset.verdict === state.verdict));
  const storeSel = document.getElementById("store");
  if (storeSel) storeSel.value = state.store;
  const sortSel = document.getElementById("sort");
  if (sortSel) sortSel.value = state.sort;
}

function buildControls() {
  const catRow = document.getElementById("cats");
  const mkChip = (label, attrs, active) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (active ? " active" : "");
    b.textContent = label;
    Object.entries(attrs).forEach(([k, v]) => { if (k !== "mapped") b.dataset[k] = v; });
    b.addEventListener("click", () => {
      Object.assign(state, attrs.mapped);
      writeHash();
      renderList();
    });
    return b;
  };
  catRow.append(
    mkChip("All categories", { cat: "all", mapped: { category: "all" } }, true),
  );
  CATEGORIES.forEach((c) =>
    catRow.append(mkChip(c.label, { cat: c.id, mapped: { category: c.id } }, false)),
  );

  const minRow = document.getElementById("mins");
  [0, 20, 30, 40, 50].forEach((m) =>
    minRow.append(
      mkChip(m === 0 ? "Any discount" : m + "% off +", { min: String(m), mapped: { minDiscount: m } }, m === 0),
    ),
  );

  const vRow = document.getElementById("verdicts");
  vRow.append(
    mkChip("Any verdict", { verdict: "all", mapped: { verdict: "all" } }, true),
  );
  Object.entries(VERDICTS).forEach(([id, v]) =>
    vRow.append(mkChip(v.label, { verdict: id, mapped: { verdict: id } }, false)),
  );

  const storeSel = document.getElementById("store");
  STORES.forEach((s) => {
    const o = document.createElement("option");
    o.value = s;
    o.textContent = s;
    storeSel.append(o);
  });
  storeSel.addEventListener("change", () => {
    state.store = storeSel.value;
    writeHash();
    renderList();
  });

  document.getElementById("sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    writeHash();
    renderList();
  });

  const q = document.getElementById("search");
  q.addEventListener("input", () => {
    state.q = q.value;
    writeHash();
    renderList();
  });
}

function route() {
  const { path, params } = readHash();
  const main = document.getElementById("view");
  const listView = document.getElementById("list-view");
  if (path.startsWith("/deal/")) {
    listView.hidden = true;
    main.replaceChildren(dealDetail(path.slice(6)));
    main.hidden = false;
    window.scrollTo(0, 0);
    return;
  }
  main.hidden = true;
  listView.hidden = false;
  stateFromHash(params);
  renderList();
}

window.__dealScoutClear = () => {
  Object.assign(state, blankState());
  history.replaceState(null, "", "#/");
  renderList();
};

document.addEventListener("DOMContentLoaded", () => {
  grid = document.getElementById("grid");
  countLine = document.getElementById("count");
  heroStrip = document.getElementById("hero-deals");
  document.getElementById("sale-window").textContent = SALE_WINDOW;
  document.getElementById("stats-slot").replaceWith(statsBar(stats()));
  buildControls();
  route();
  window.addEventListener("hashchange", route);
});
