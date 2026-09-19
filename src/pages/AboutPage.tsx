export function AboutPage() {
  return (
    <div className="wrap about-prose">
      <p className="eyebrow">The idea</p>
      <h1>We Almost Agree</h1>
      <p className="lede">
        A platform for testing public claims: see the overlap first, then put play-money curiosity
        only on what is actually in dispute.
      </p>
      <p>
        Online disagreement mixes shared premises with contested claims. People end up fighting
        identity battles. This first run is here to shrink the perceived gap — not to manufacture a
        bigger one.
      </p>
      <h2>What v1 does</h2>
      <ul>
        <li>Seed maps for three spicy sentences, with curated splits and evidence notes.</li>
        <li>
          Free-text claims through <code>analyzeClaim()</code> — a labelled heuristic with the same
          shape a later LLM can fill.
        </li>
        <li>A simple Venn-style agreement map.</li>
        <li>1,000 play points. Stakes on contested claims only. A local leaderboard.</li>
        <li>A short in-repo blog of the product pitch and worked examples.</li>
      </ul>
      <h2>What v1 deliberately leaves out</h2>
      <ul>
        <li>Real money, payments, gambling, or Stripe.</li>
        <li>Live affiliate links — including investment-platform offers.</li>
        <li>Required accounts. A nickname is enough.</li>
        <li>Scraping Reddit or X.</li>
        <li>DNS for wealmostagree.com (the domain is purchased; pointing it comes later).</li>
      </ul>
      <h2>Tone</h2>
      <p>
        A counter is another claim in the same map, not a personal attack. Most people want to do a
        good job and are closer than they think. Monetise clarity later — not humiliation.
      </p>
      <p className="muted">
        Seed maps include money and speech topics. Nothing here is financial, legal, or medical
        advice.
      </p>
    </div>
  )
}
