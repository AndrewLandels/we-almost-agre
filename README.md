# We Almost Agree

**Find where you already agree. Test what's left.**

A first-run web app for claim maps: paste or pick a public claim, see shared premises versus contested leftovers, glance at a simple agreement map, and stake **play-money points** only on what is still in dispute.

- Product name: **We Almost Agree**
- Domain (purchased, DNS not pointed yet): [wealmostagree.com](https://wealmostagree.com)
- Locale: British English (`en-GB`)

## How to run

You need Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

| Script | What it does |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production bundle |
| `npm run preview` | Serve the production bundle |
| `npm test` | Heuristic + play-money unit tests |

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Home — paste a claim or pick a seed |
| `/claim/:id` | Results — original statement, shared premises, contested claims, Venn map, evidence, stakes |
| `/leaderboard` | Local play-money table and optional nickname |
| `/blog` | Blog index — title, date, excerpt |
| `/blog/:slug` | Full post |
| `/about` | Ethos and what this first run leaves out |

Seed claim ids: `electric-cars`, `bitcoin`, `us-speech`.

## Adding a blog post

Posts are ordinary Markdown files in the repo. There is no CMS.

1. Add a file under `src/content/posts/`, for example `src/content/posts/my-new-note.md`.
2. Register it in `src/data/posts.ts`:
   - `slug` — URL piece, kebab-case (`/blog/my-new-note`)
   - `title`, `excerpt`, `topicLabel`
   - `date` — `YYYY-MM-DD` (the index sorts newest first)
   - `body` — `import myNewNote from '../content/posts/my-new-note.md?raw'`
   - optional `relatedClaimId` / `relatedClaimLabel` if the post should link to a seed map
3. Supported Markdown: headings (`#`–`###`), paragraphs, `**bold**`, `*italic*`, `` `code` ``, bullet and numbered lists, `>` quotes, and links (`[text](/path)` or `https://`).
4. Keep the tone: British English, warm, no dunking. Educational themes only — no buy tips.

Starter slugs: `what-we-almost-agree-is`, `electric-cars-worked-example`, `bitcoin-worked-example`.

## Seed claims

1. “Electric cars are shit.”
2. “You should invest in Bitcoin.”
3. “America doesn't have freedom of speech.”

Each has a curated split, short evidence blurbs (support / challenge / context), and a demo lean on some contested nodes so you can settle play points.

## Custom claims

Free text goes through `analyzeClaim()` in `src/lib/analyzeClaim.ts`. v1 is an honest **first-pass heuristic**, labelled on the results page. The return shape (`sharedPremises`, `contestedClaims`, evidence nodes, overlap note) is the contract a later LLM analyser should fill. Close wording of a seed reuses the curated map.

## Play-money

- Starting balance: **1,000 points**
- Stake **for** or **against** contested claims only — never shared premises
- Demo settlement (where a seed has a lean) pays 2× if you were closer
- Wallet, custom maps, and the leaderboard persist in `localStorage` on this browser
- Optional nickname; no required account

This is a calibration game, not gambling and not a prize draw.

## What v1 excludes

- Real money, payments, gambling, Stripe
- Live affiliate links
- Required authentication
- Scraping Reddit or X
- DNS / hosting setup for wealmostagree.com
- A live language-model backend (the hook is there; the first pass is local)
- Login, subscriptions, Stripe, affiliates, paper trading of markets, or a CMS

## Deploy later

Build static files with `npm run build` (`dist/`). Host that folder on any static host (Cloudflare Pages, Netlify, GitHub Pages, or an nginx/CDN origin). When you are ready, point `wealmostagree.com` at that host — do not change DNS until that decision is made.

Nothing here is financial, legal, or medical advice.
