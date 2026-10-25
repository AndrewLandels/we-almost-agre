# We Almost Agree

**Find where you already agree. Test what's left.**

Paste a gut statement from a real argument. See a **paper** way that view is often expressed in markets, marked to a public (usually delayed) price. Facts and mechanics only — never personal advice. Go deeper into an agreement map if you want.

- Product name: **We Almost Agree**
- Live: [wealmostagree.com](https://wealmostagree.com) · [we-almost-agre.vercel.app](https://we-almost-agre.vercel.app)
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
| `npm run dev` | Local development server (includes `/api/quote`) |
| `npm run build` | Production bundle |
| `npm run preview` | Serve the production bundle (also serves `/api/quote`) |
| `npm test` | Heuristic, ledger, language, and play-money unit tests |

No API key is required for the default delayed Yahoo Finance feed.

## Try the homepage

1. Open `/`. The first screen is one sentence, the statement box, three kitchen-table examples, and a short paper line.
2. Press Enter, or choose a chip such as **We're heading for a recession**.
3. You stay on `/` and see a few closest live markets. Paper long and paper short sit on the share or index cards. The fuller paper page is still at `/express/:id`.
4. Open `/book` to see the shared paper ledger across every symbol.

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Home — paste a gut statement |
| `/express/:id` | Thin read, suggested market expressions, paper ticket |
| `/book` | Shared multi-asset paper ledger |
| `/deeper` | Go-deeper hub — seed maps, blog, leaderboard, about |
| `/claim/:id` | Agreement map — shared premises, contested claims, Venn, play-point stakes |
| `/leaderboard` | Local play-point table (claim stakes, not the paper book) |
| `/blog` | Blog index |
| `/blog/:slug` | Full post |
| `/about` | Ethos and what this run leaves out |
| `/agree` | Agreement Gap — three taps, a share link, the overlap |
| `/agree/t/:topic` | Answer the three statements |
| `/agree/c/:code` | Friend link, then the result |
| `/api/quote?symbols=SPY,GLD` | Delayed public marks (dev plugin + Vercel function) |

Seed claim ids: `electric-cars`, `bitcoin`, `us-speech`.  
Flagship expression id: `us-economy-down`.

`vercel.json` still rewrites unknown paths to `index.html` so client routes work on Vercel. `/api/*` is excluded from that rewrite.

## Primary loop

1. Paste a gut statement (placeholder: “The US economy is going down the toilet.”).
2. Read one shared premise and the contested market expression, in plain English.
3. Suggested **market expressions** — common ways people express views like this. Never “you should buy/short X”.
4. Paper long/short on the chosen symbol. P&amp;L is marked to a delayed public price or a labelled fallback.
5. Factual panel of instrument *categories* (short ETF, inverse ETF, puts, CFDs, underweight). Educational only.
6. Disclaimer chrome stays on every page: not personal investment advice · capital at risk · paper trading only · not a broker.
7. Optional soft line that real trading happens with FCA-authorised firms. No live affiliate in this build.

Existing claim maps, blog, leaderboard, and about sit under **Go deeper**. If a statement matches a seed claim, the paper-expression path still comes first; the map is a link, not the front door.

## Multi-asset architecture

Four pluggable pieces, so the catalog can grow without rewriting the book:

1. **Universe catalog** — `src/data/universe.ts`  
   Searchable symbols with an asset class and a plain-English vehicle note (ETF proxy versus the thing it stands for).
2. **Expression mapping** — `src/lib/markets/mapExpression.ts`  
   Statement → one or more suggested symbols. v1 is a labelled heuristic. The return shape is the contract a later LLM mapper should fill.
3. **Price feed** — `src/lib/markets/quoteApi.ts` + `src/lib/markets/providers/yahoo.ts`  
   Server-side fetch so the browser does not need a key and does not hit Yahoo CORS.
4. **Shared paper ledger** — `src/lib/markets/ledger.ts` + `src/hooks/usePaperBook.tsx`  
   One fake-money long/short engine for every symbol. Persists in `localStorage`.

### Starter universe

- **Indices (ETF proxies):** SPY (S&P 500), QQQ (Nasdaq-100), IWM (Russell 2000), DIA (Dow), EWU (UK large caps / FTSE-style), EWG (Germany / DAX-style), EWJ (Japan / Nikkei-style).
- **Shares:** AAPL, MSFT, GOOGL, AMZN, META, NVDA, TSLA, JPM, XOM, JNJ, V, UNH.
- **Commodities (ETF proxies, not the future itself):** GLD (gold), SLV (silver), USO (WTI crude), CPER (copper).
- **Digital asset proxy:** IBIT (spot Bitcoin product).

The UI says which vehicle you are marking. Paper fills are never broker orders.

### How to expand the universe

1. Add a row to `UNIVERSE` in `src/data/universe.ts` (`id`, Yahoo ticker, name, `assetClass`, `vehicleNote`, keywords).
2. Add a delayed snapshot in `src/data/fallbackQuotes.ts` so the book still works if the live feed is down.
3. Optionally add a mapping rule in `src/lib/markets/mapExpression.ts` (same `ExpressionMapping` shape).
4. Run `npm test`.

Later asset classes (sector ETFs, FX, bonds) should follow the same four pieces — do not special-case a single index.

## Price feed

Default: **Yahoo Finance v8 chart API**, fetched on the server.

- Local: Vite plugin in `vite.quote-plugin.ts` serves `GET /api/quote?symbols=SPY,QQQ`.
- Production: Vercel function `api/quote.ts` does the same.
- If the public feed fails, the client uses cached marks, then the labelled snapshot in `src/data/fallbackQuotes.ts`.
- The UI says **Delayed public marks** or **Fallback marks**. It never claims a broker fill.

Yahoo’s chart endpoint is unofficial and can rate-limit or change. That is why fallback marks exist.

### Adding an API key later (optional)

You do not need this for the current build. When you want a contracted feed:

1. Keep the `/api/quote` shape (`{ quotes, missing, fallbackUsed, asOf }`).
2. Add a provider next to `src/lib/markets/providers/yahoo.ts` (for example Finnhub or Twelve Data).
3. Read the key only on the server:

```bash
# .env (never commit secrets)
FINNHUB_API_KEY=...
# or
TWELVEDATA_API_KEY=...
PRICE_FEED_PROVIDER=finnhub
```

4. Switch on `PRICE_FEED_PROVIDER` inside `buildQuotePayload()`. The React app should still call `/api/quote` — do not put vendor keys in `VITE_*` unless you accept that they ship to the browser.

## Language

British English. Warm, calm. Facts and mechanics.

| Avoid | Prefer |
| --- | --- |
| “You should short the S&P” | “One common way people express a bearish US-economy view is by positioning against broad US equities such as the S&P 500.” |
| “Buy this / sell that” | “Instrument types that exist for this kind of exposure include…” |
| “We recommend ticker X” | “A common expression of this view is…” |

Always on-page: **not personal investment advice · capital at risk · paper trading only · not a broker**.

## Paper book

- Starting cash: **10,000** play units
- Shared across every symbol
- Long and short; no leverage; no cash-out; no prizes
- P&amp;L = notional × percent move (sign flipped for shorts)
- Persists in `localStorage` as `waa.paperBook.v1`

This is a calibration toy, not gambling and not a prize draw.

## Go deeper (still here)

The older claim-map loop is intact:

- Seed maps and `analyzeClaim()` first-pass heuristic
- Play-money **points** on contested claims only (starting **1,000**, separate from the paper book)
- Blog posts in `src/content/posts/`, registered in `src/data/posts.ts`

## Agreement Gap

Mobile-first page at `/agree`. Pick one of six starter topics, answer three statements (Agree / Unsure / Disagree), send the link. When a friend answers the same three, both see **You agree X%**.

Scoring: Agree = +1, Unsure = 0, Disagree = −1. Agreement is `100 × (1 − mean(|A − B| / 2))`. Common ground (the same answer) is shown first. The page ends on that overlap. Crowd totals appear only once a topic has 30 or more answers, and only as percentages.

No login. Answers are anonymous. A link is the only way to see a pair, and it expires after 30 days. Comparisons are `noindex`.

The page can be installed: manifest, icons, and **Get the app** (on iPhone that is Safari → Share → Add to Home Screen).

### Database

Hosted on the Supabase project **we-almost-agree** (`eu-west-2`, ref `xcedcymypsrafknfzxxz`). Tables `agree_topics`, `agree_statements`, `agree_comparisons`, and `agree_events` have row level security on and no client access. The API uses the service role, either from Vercel env or from the edge function `agree`.

Local `npm run dev` stores comparisons in `.data/agree.json` (gitignored) so you can try the flow without keys. Topics in that mode come from `src/lib/agree/topics.ts`.

On Vercel, if `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) and `SUPABASE_URL` are set, the serverless function talks to Postgres itself. Otherwise it proxies to:

`https://xcedcymypsrafknfzxxz.supabase.co/functions/v1/agree`

That function is already deployed for this project (`verify_jwt` off, because the link code is the secret). Rebuild it with `node scripts/bundle-edge.mjs` and redeploy only when the API changes and Vercel does not have the database keys. Optional `AGREE_EDGE_SECRET` must match the same secret on the edge function. See `.env.example`. None of these belong in `VITE_*`.

### Add a topic without a code change

Insert it unapproved, then flip the flag when the wording is ready:

```sql
insert into public.agree_topics (id, title, blurb, approved, sort_order)
values ('dogs-or-cats', 'Dogs or cats', 'A calmer argument.', false, 7);

insert into public.agree_statements (id, topic_id, position, body) values
  ('dogs-or-cats-1', 'dogs-or-cats', 1, 'First statement.'),
  ('dogs-or-cats-2', 'dogs-or-cats', 2, 'Second statement.'),
  ('dogs-or-cats-3', 'dogs-or-cats', 3, 'Third statement.');

update public.agree_topics set approved = true where id = 'dogs-or-cats';
```

Counts for the loop:

```sql
select name, count(*) from public.agree_events group by name;
```

The schema is in `supabase/agree_gap.sql`. It is already applied on the hosted project.

Shared links get an Open Graph card from `/api/agree-preview` (crawlers only, so a friend opening the link in WhatsApp still gets the page).

## What this run excludes

- Real money, payments, gambling, Stripe
- Live affiliate links
- Required authentication
- Claiming FCA approval of the product
- A live language-model backend
- Full CMS

Nothing here is financial, legal, or medical advice.
