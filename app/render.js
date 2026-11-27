// Deal Scout — turning deals into pages.
//
// Cards and detail pages are built with the DOM API, never by pasting deal
// text into HTML, so a product name can never break the page.

import { CHECKED_DAY, CHECKED_TIME, VERDICTS, dealById } from "./data.js";
import { discountPct, money, moneyShort, saving } from "./filters.js";

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function verdictPill(deal) {
  const v = VERDICTS[deal.verdict];
  const pill = el("span", "verdict verdict-" + deal.verdict, v.label);
  pill.title = v.hint;
  return pill;
}

function priceBlock(deal, big) {
  const wrap = el("div", big ? "price price-big" : "price");
  const sale = el("span", "sale", money(deal.sale));
  const usual = el("span", "usual", money(deal.usual));
  const pct = el("span", "pct", "-" + discountPct(deal) + "%");
  const save = el("span", "save", "Save " + money(saving(deal)));
  wrap.append(sale, usual, pct, save);
  return wrap;
}

function checkedLine(deal) {
  const line = el("p", "checked");
  line.append(
    el("span", null, "Checked " + CHECKED_DAY + " " + CHECKED_TIME + " · "),
    el("span", "source", "Source: " + deal.source),
  );
  return line;
}

function storeButton(deal) {
  const a = document.createElement("a");
  a.className = "store-btn";
  a.href = deal.url;
  a.target = "_blank";
  a.rel = "noopener sponsored";
  a.textContent = "View at " + deal.store + " ↗";
  return a;
}

export function dealCard(deal) {
  const card = el("article", "card cat-" + deal.category);
  const head = el("div", "card-head");
  head.append(el("span", "store-badge", deal.store), el("span", "tag", deal.tag));
  const name = el("h3", "card-name", deal.name);
  name.addEventListener("click", () => location.hash = "#/deal/" + deal.id);
  const body = el("div", "card-body");
  body.append(priceBlock(deal, false), verdictPill(deal));
  body.append(el("p", "evidence", deal.evidence));
  const foot = el("div", "card-foot");
  foot.append(checkedLine(deal), storeButton(deal));
  if (deal.alsoAt.length) {
    const also = el("p", "also-at");
    also.append(el("span", null, "Also: "));
    deal.alsoAt.forEach((alt, i) => {
      if (i) also.append(el("span", null, " · "));
      const b = el("strong", null, alt.store + " " + money(alt.price));
      also.append(b);
    });
    foot.append(also);
  }
  card.append(head, name, body, foot);
  return card;
}

export function dealDetail(id) {
  const deal = dealById(id);
  const wrap = el("div", "detail");
  if (!deal) {
    wrap.append(el("h2", null, "Deal not found"));
    const back = document.createElement("a");
    back.href = "#/";
    back.className = "back-link";
    back.textContent = "← Back to all deals";
    wrap.append(back);
    return wrap;
  }
  const back = document.createElement("a");
  back.href = "#/";
  back.className = "back-link";
  back.textContent = "← Back to all deals";
  wrap.append(back);

  const hero = el("div", "detail-hero");
  hero.append(el("span", "store-badge", deal.store), el("span", "tag", deal.tag));
  hero.append(el("h2", "detail-name", deal.name));
  hero.append(priceBlock(deal, true));
  hero.append(verdictPill(deal));
  wrap.append(hero);

  const verdictBox = el("div", "verdict-box");
  verdictBox.append(el("h3", null, "Is it really a deal? " + VERDICTS[deal.verdict].label));
  verdictBox.append(el("p", null, deal.evidence));
  verdictBox.append(
    el("p", "verdict-hint", VERDICTS[deal.verdict].hint + " — the discount is computed from the two prices above, so it always adds up."),
  );
  wrap.append(verdictBox);

  const compare = el("div", "compare");
  compare.append(el("h3", null, "Compare across stores"));
  const table = document.createElement("table");
  const headRow = document.createElement("tr");
  ["Store", "Price", "Saving"].forEach((h) => headRow.append(el("th", null, h)));
  table.append(headRow);
  const rows = [{ store: deal.store, price: deal.sale }, ...deal.alsoAt];
  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    if (i === 0) tr.className = "best-row";
    tr.append(el("td", null, r.store + (i === 0 ? " — this deal" : "")));
    tr.append(el("td", "num", money(r.price)));
    tr.append(el("td", "num", money(deal.usual - r.price)));
    table.append(tr);
  });
  compare.append(table);
  compare.append(el("p", "compare-note", "Usual price " + money(deal.usual) + " — the same reference price at every store."));
  wrap.append(compare);

  const meta = el("div", "detail-meta");
  meta.append(checkedLine(deal));
  meta.append(el("p", "sale-window", "Sale runs Black Friday Nov 27 – Cyber Monday Nov 30, 2026. Prices move fast — confirm the live price on the store page before you buy."));
  meta.append(storeButton(deal));
  wrap.append(meta);
  return wrap;
}

export function statsBar(s) {
  const bar = el("div", "stats");
  const items = [
    [String(s.count), "verified deals"],
    [s.maxPct + "%", "biggest cut"],
    [String(s.newLows), "new lows"],
    [moneyShort(s.totalSaving), "total savings"],
    [String(s.stores), "stores"],
  ];
  items.forEach(([num, label]) => {
    const cell = el("div", "stat");
    cell.append(el("span", "stat-num", num), el("span", "stat-label", label));
    bar.append(cell);
  });
  return bar;
}

export function emptyState() {
  const box = el("div", "empty");
  box.append(el("h3", null, "No deals match those filters"));
  box.append(el("p", null, "Loosen the discount filter or clear the search to see all 29 deals."));
  const btn = el("button", "clear-btn", "Clear all filters");
  btn.addEventListener("click", () => window.__dealScoutClear());
  box.append(btn);
  return box;
}
