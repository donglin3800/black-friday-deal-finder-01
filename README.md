# black-friday-deal-finder-01

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/donglin3800/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/donglin3800/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Deal Scout — a Black Friday deal finder with 29 real deals, checked on Nov 27, 2026: headphones, TVs, Apple gear and laptops, smart home, kitchen and gaming, each with its store, store link, sale price, usual price, discount and check time, plus an honest verdict on whether it is really a deal. Search and filters by category, store, discount and verdict all work, and every deal can be compared across stores. Pure static files under `app/`, no network requests, works on desktop and on a phone. `main.ts` hands the site in: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Run it

```sh
python3 -m http.server 8080 --directory app
# open http://localhost:8080 — the site in app/

MAKEFUN_OUTPUT_DIR=out node main.ts
# builds the entry (app/, screenshots/, dossier.json) into out/
```

## The site

- **29 verified deals** — AirPods Pro 3 at $149, Bose QuietComfort at $169, the LG C6 OLED at $1,399.99, a $449.99 OLED laptop, a 60%-off Shark vacuum and more, across Amazon, Best Buy and Walmart.
- **Honest verdicts** — each deal is labelled New low, Strong deal, Good deal or Routine sale, with the evidence for the call. Routine sales are flagged, not hidden: a 6% bundle saving says so.
- **Search and filters that work** — text search, category chips, store picker, minimum discount (20/30/40/50%+) and verdict filter, plus sorting by discount, saving, verdict or price. The top-3 strip always follows the current filter.
- **Deal pages** — every deal opens its own page with the price breakdown, the verdict and its evidence, and a compare-across-stores table (AirPods Pro 3: $149 at Amazon vs $179 at Walmart).
- **Checked, not invented** — every deal names the source that supports its price (Mashable, Tom's Guide, TechRadar, USA Today) and the time it was checked. Discounts are computed from the two prices shown, so they always add up.

Every price was read at the store or in a deals roundup that names the store on Black Friday itself, Nov 27, 2026. Prices move during the sale — the site says so and tells shoppers to confirm the live price on the store page. The design, text and verdicts are original.

---

<sub>Entered on [make.fun](https://make.fun/?ref=frrbny3y&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
