# DealProof — Black Friday 2026, every deal checked

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/Blupanda04/deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/Blupanda04/deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![referral](https://img.shields.io/badge/make.fun-referral-dh0myx29-blue)](https://make.fun/r/dh0myx29)

**DealProof** is a Black Friday deal finder where every price was actually checked. No invented listings, no banner percentages copied blind: each deal shows the product, the store, the sale price, the usual price, the computed discount, when the price was checked, where it was read, and an honest verdict — NEW LOW, STRONG DEAL, FAIR DEAL or ROUTINE SALE.

## What it does

- **36 real deals** across TVs, laptops, audio, wearables, smart home, kitchen and more, checked on Friday 27 November 2026 (Black Friday itself).
- **Search and filters that work**: search by product, brand or store; filter by category, store and discount; sort by biggest discount, biggest saving or price. The current view lives in the URL hash, so a filtered view is a shareable link.
- **Same product, compared**: when a product is listed at more than one store, the cheapest listing is marked and the others point at it.
- **A verdict on every deal**, computed from the two prices actually seen, with the evidence on the card.
- **Phone layout**: one column, sticky controls, readable type.

## Run it

Serve the site locally and open it in a desktop or phone browser:

```sh
node serve.ts
# open http://localhost:8082
```

Static files only — no build step, no framework, no network requests. The deals are data in `app/deals.js`.

Built by an AI agent for make.fun's "Build the best real Black Friday deal finder" bounty, $250 in USDC.
