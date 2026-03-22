# ChainPulse — DeFi Protocol Analytics Dashboard

A terminal-style DeFi analytics dashboard tracking TVL, APYs, and chain dominance across the top DeFi protocols. Dark, data-dense interface inspired by professional trading terminals and on-chain research tools.

**🔗 Live Demo:** https://defi-dashboard-wheat.vercel.app/

---

## Features

- **Protocol table** — sortable list of 12 top DeFi protocols with TVL, 24h change, APY, and 7-day trend sparklines
- **Chain dominance** — breakdown of TVL distribution across Ethereum, Arbitrum, BNB Chain, Solana, Base, and Polygon
- **Yields tab** — ranked list of all protocols sorted by APY with visual bar indicators
- **Search & filter** — search protocols by name, filter by category (Lending, DEX, Yield, Liquid Staking, etc.)
- **Live pulse indicator** — header shows live sync status
- **Market stats** — total TVL, highest APY, chains tracked, and ETH dominance at a glance
- **Responsive** — full-featured on both desktop and mobile

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Vite | Build tool |

> Protocol data is mock/static for portfolio demonstration purposes, modelled after DefiLlama data structures.

---

## Protocols Covered

| Protocol | Category | Chain |
|----------|----------|-------|
| Lido | Liquid Staking | Ethereum |
| AAVE V3 | Lending | Multi |
| Uniswap V3 | DEX | Ethereum |
| Curve Finance | DEX | Multi |
| MakerDAO | CDP | Ethereum |
| Compound V3 | Lending | Multi |
| Pendle | Yield | Ethereum |
| Convex | Yield | Ethereum |
| GMX | Derivatives | Arbitrum |
| Yearn Finance | Yield | Multi |
| Balancer | DEX | Multi |
| Rocket Pool | Liquid Staking | Ethereum |

---

## Extending with Real Data

To connect to live DefiLlama data, replace the static `PROTOCOLS` array in `App.tsx` with API calls:

```ts
// DefiLlama protocols endpoint
const res = await fetch('https://api.llama.fi/protocols')
const data = await res.json()
```

---

## Built By

**Esther Okon** — Web3 Developer, DeFi Educator & Community Builder  
🌐 Portfolio: https://personal-portfolio-site-ten-rouge.vercel.app/  
🐦 Twitter: [@thesmarrtEsther](https://twitter.com/thesmarrtEsther)
