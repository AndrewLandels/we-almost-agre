export function AboutPage() {
  return (
    <div className="wrap about-prose">
      <p className="eyebrow">The idea</p>
      <h1>We Almost Agree</h1>
      <p className="lede">
        Paste a gut statement from a real argument. See a paper way that view is often expressed in
        markets, tracked against a public price. Facts and mechanics only. Go deeper into an
        agreement map if you want.
      </p>
      <p>
        People leave a row holding a blunt view and nowhere useful to put it. Tip sites push trades.
        Argument sites dunk. This is a calmer third place: express the view with fake money against
        a real (or delayed) benchmark, plus plain facts on how that kind of position works — without
        being told what to do.
      </p>
      <h2>What this run does</h2>
      <ul>
        <li>
          Homepage loop: statement → thin read → common market expressions → paper long/short on a
          shared multi-asset book.
        </li>
        <li>
          Starter universe of major-index ETF proxies, liquid shares, and commodity / Bitcoin
          proxies. Search the catalog; the architecture is built to grow.
        </li>
        <li>
          Delayed public marks via Yahoo Finance’s chart data, proxied so you do not need an API
          key. Fallback snapshot marks if the feed is down — clearly labelled.
        </li>
        <li>
          A first-pass heuristic mapper, labelled on the page, with the same shape a later model
          can fill.
        </li>
        <li>
          Under <strong>Go deeper</strong>: seed agreement maps, the in-repo blog, and play-point
          stakes on contested claims.
        </li>
      </ul>
      <h2>What this run deliberately leaves out</h2>
      <ul>
        <li>Real money, payments, gambling, or Stripe.</li>
        <li>Live affiliate links — including investment-platform offers.</li>
        <li>Required accounts. A nickname is enough for the old play-point table.</li>
        <li>Any claim that the product is FCA-approved. It is not a broker.</li>
        <li>A live language-model backend (the hook is there; the first pass is local).</li>
      </ul>
      <h2>Tone</h2>
      <p>
        British English. Warm, calm. Facts and mechanics. We do not say “you should”, “buy this”,
        or “we recommend ticker X”. Prefer: “One common way people express this view is…” and
        “Instrument types that exist include…”.
      </p>
      <p className="muted">
        Nothing here is personal investment advice. Capital would be at risk in real markets. Paper
        fills are not broker orders.
      </p>
    </div>
  )
}