import type { ClaimAnalysis } from '../types'

export const STARTING_BALANCE = 1000

export const SEED_CLAIMS: ClaimAnalysis[] = [
  {
    id: 'electric-cars',
    original: 'Electric cars are shit.',
    source: 'seed',
    topicLabel: 'Transport',
    overlapScore: 64,
    overlapNote:
      'Most of the heat is insult and identity. The shared bit is practical: a car has to work, and every drivetrain has a footprint. What is still live is cost, charging access, and how clean “clean” really is.',
    sharedPremises: [
      {
        id: 'ev-share-life',
        text: 'A car has to work in ordinary life — journeys, weather, budget, and the time people actually have.',
      },
      {
        id: 'ev-share-impact',
        text: 'Transport has environmental costs, whether the fuel is petrol, diesel, or electricity.',
      },
      {
        id: 'ev-share-context',
        text: 'Whether an EV is “good enough” depends on where you live, what you drive for, and whether you can charge near home.',
      },
    ],
    contestedClaims: [
      {
        id: 'ev-tco',
        text: 'For most drivers, an EV is worse than a petrol or diesel car on total cost over the years you own it.',
        demoResolution: 'against',
        demoResolutionNote:
          'Demo lean: for people who can charge at home, lifetime running costs often catch up or beat petrol — but the blanket “most drivers” claim still fails in flats, rural miles, and some used markets.',
        evidence: [
          {
            stance: 'supports',
            blurb:
              'List prices and home-charger fitting still push the first cheque up. Insurance, tyres, and a weak used market can keep the maths ugly.',
            sourceLabel: 'Common buyer complaint',
          },
          {
            stance: 'challenges',
            blurb:
              'Fuel and servicing are often cheaper. UK company-car tax and falling battery prices can flip total cost for home-chargers over a typical hold.',
            sourceLabel: 'Typical TCO reviews',
          },
          {
            stance: 'context',
            blurb:
              '“Cheaper for you” is not the same as “cleaner”. A motorway taxi and a second car on a driveway are different spreadsheets.',
          },
        ],
      },
      {
        id: 'ev-charging',
        text: 'Public charging is too thin and unreliable for EVs to replace petrol for people without a driveway.',
        demoResolution: 'open',
        demoResolutionNote:
          'Left open on purpose. Corridor rapid charging has grown; on-street and rural reliability is still a fair fight.',
        evidence: [
          {
            stance: 'supports',
            blurb:
              'Broken bays, queueing, and patchy rural or on-street provision are real. If you cannot charge overnight, every journey needs a plan.',
            sourceLabel: 'Driver reports',
          },
          {
            stance: 'challenges',
            blurb:
              'Rapid networks on main routes have expanded quickly. Workplace charging and mixed households mean not every petrol car needs a one-for-one swap this year.',
          },
          {
            stance: 'context',
            blurb:
              'A London flat and a Highland cottage are different maps. The claim is local, not universal — which is why it stays contested.',
          },
        ],
      },
      {
        id: 'ev-lifecycle',
        text: 'Once you count batteries, mining, and the electricity mix, EVs are not meaningfully cleaner.',
        demoResolution: 'against',
        demoResolutionNote:
          'Demo lean: manufacture is heavy, but most lifecycle reviews still find a use-phase payback on typical European grids, then a net gain as the grid cleans up.',
        evidence: [
          {
            stance: 'supports',
            blurb:
              'Battery production is energy- and mineral-intensive. On a dirty grid the carbon payback takes longer, and mining has real local harms.',
          },
          {
            stance: 'challenges',
            blurb:
              'Independent lifecycle reviews commonly find EVs pull ahead in use, especially as grids decarbonise. “Not meaningfully cleaner” overstates the case for typical UK/EU miles.',
            sourceLabel: 'Lifecycle reviews',
          },
          {
            stance: 'context',
            blurb:
              'Cleaner is not clean. The honest shared ground is “a smaller tail, paid for up front” — not a halo.',
          },
        ],
      },
    ],
  },
  {
    id: 'bitcoin',
    original: 'You should invest in Bitcoin.',
    source: 'seed',
    topicLabel: 'Money',
    overlapScore: 58,
    overlapNote:
      'Almost everyone can share that money is personal and that a scarce digital bearer asset is a real invention. The fight is whether that means you should buy it, and what job it actually does.',
    sharedPremises: [
      {
        id: 'btc-share-motive',
        text: 'People look for ways to save, speculate, or hedge when cash and familiar assets feel uncertain.',
      },
      {
        id: 'btc-share-asset',
        text: 'A scarce, transferable digital asset can be interesting even if you never want to “be a Bitcoin person”.',
      },
      {
        id: 'btc-share-advice',
        text: 'What you should hold depends on your horizon, your sleep-at-night test, and whether you can afford a total loss. This is not financial advice.',
      },
    ],
    contestedClaims: [
      {
        id: 'btc-core',
        text: 'Bitcoin is a sound core holding for a typical retail investor today.',
        demoResolution: 'against',
        demoResolutionNote:
          'Demo lean: a tiny satellite slice is a different claim. As a blanket “you should” for a typical core portfolio, the drawdowns and lack of cashflow make the advice too strong.',
        evidence: [
          {
            stance: 'supports',
            blurb:
              'The capped-supply story, growing institutional products, and the “digital gold” framing attract people who want an asset outside ordinary banking.',
          },
          {
            stance: 'challenges',
            blurb:
              'It has no cashflow and has seen brutal drawdowns. Plenty of calendar years made “you should invest” ruinous if the timing or the size was wrong.',
          },
          {
            stance: 'context',
            blurb:
              'A 1–2% satellite is not the same sentence as “you should invest in Bitcoin.” Collapse those and you manufacture a fight.',
          },
        ],
      },
      {
        id: 'btc-money',
        text: 'Bitcoin will become everyday money for ordinary payments.',
        demoResolution: 'against',
        demoResolutionNote:
          'Demo lean: it can move value, but volatility still fights the unit-of-account job. Most use remains speculative rather than buying the weekly shop.',
        evidence: [
          {
            stance: 'supports',
            blurb:
              'Faster rails (such as Lightning) and a few national or merchant experiments show payments are possible, not only paper trading.',
          },
          {
            stance: 'challenges',
            blurb:
              'A money that swings double digits in a month is a poor everyday yardstick. On-chain fees and habit still keep most activity in the speculative loop.',
          },
          {
            stance: 'context',
            blurb:
              '“Can it transfer value?” and “will it price bread?” are different claims. The first is easier than the second.',
          },
        ],
      },
      {
        id: 'btc-risks',
        text: 'The usual objections — energy use, regulation, lost keys, crime — are overstated relative to the upside.',
        demoResolution: 'open',
        demoResolutionNote:
          'Left open. Some objections are overplayed; others (custody, sudden rule changes) can still reprice the whole story overnight.',
        evidence: [
          {
            stance: 'supports',
            blurb:
              'Some mining has shifted toward stranded or renewable power, and listed products reduce the need for everyone to self-custody.',
          },
          {
            stance: 'challenges',
            blurb:
              'Energy and e-waste critiques have not vanished. Regulation can reprice the asset quickly, and a lost key is an unforgiving kind of bank error.',
          },
          {
            stance: 'context',
            blurb:
              'Treat each objection on its own. Bundling them into “the usual FUD” is how a useful risk list becomes a loyalty test.',
          },
        ],
      },
    ],
  },
  {
    id: 'us-speech',
    original: "America doesn't have freedom of speech.",
    source: 'seed',
    topicLabel: 'Speech',
    overlapScore: 61,
    overlapNote:
      'People often already agree that law is not culture, and that power can chill speech without a statute. The remaining fight is how much the legal guarantee still does, and whether platforms count as the state.',
    sharedPremises: [
      {
        id: 'speech-share-1a',
        text: 'The US First Amendment stops the government — and those acting as the state — from most viewpoint-based speech bans. It does not write the rules for your dinner table or a private website.',
      },
      {
        id: 'speech-share-cost',
        text: 'You can have a constitutional right and still lose a job, a platform, or a friendship for what you say.',
      },
      {
        id: 'speech-share-two',
        text: '“Is this legal?” and “is this socially allowed?” are different questions. Mixing them is how everyone ends up shouting past each other.',
      },
    ],
    contestedClaims: [
      {
        id: 'speech-gutted',
        text: 'US law has quietly gutted constitutional free-speech protection in practice.',
        demoResolution: 'against',
        demoResolutionNote:
          'Demo lean: edges and chilling effects are real, but US courts still strike down a great deal of government speech control. “Doesn’t have freedom of speech” overshoots the legal floor.',
        evidence: [
          {
            stance: 'supports',
            blurb:
              'Critics point to campus codes, protest policing, and vivid prosecutions at the edges — threats, leaks, and politically charged cases that feel like a narrower street.',
          },
          {
            stance: 'challenges',
            blurb:
              'Compared with many democracies, the US legal floor is still unusually high. Hate-speech statutes and lese-majesty-style rules are thinner; courts still void a lot of official speech control.',
          },
          {
            stance: 'context',
            blurb:
              'A right can be both unusually strong on paper and uneven in the lives of particular speakers. Both can be true without “no freedom of speech”.',
          },
        ],
      },
      {
        id: 'speech-platforms',
        text: 'When a large platform removes a post, that is effectively the same as state censorship.',
        demoResolution: 'open',
        demoResolutionNote:
          'Left open. Private editorial choice is not, on the standard reading, a First Amendment breach — but government jawboning of platforms is a live legal and civic fight.',
        evidence: [
          {
            stance: 'supports',
            blurb:
              'A handful of firms now gate most square-like spaces. When officials lean on them, the practical effect can look a lot like a ban with extra steps.',
          },
          {
            stance: 'challenges',
            blurb:
              'A private editor is not the state on the usual reading of the First Amendment. Users can leave, and collapsing every takedown into “censorship” empties the word.',
          },
          {
            stance: 'context',
            blurb:
              'Keep “firm said no” and “the state made the firm say no” on separate lines. That is where the interesting case actually lives.',
          },
        ],
      },
      {
        id: 'speech-unique',
        text: 'Relative to other open societies, the US no longer uniquely protects dissent.',
        demoResolution: 'against',
        demoResolutionNote:
          'Demo lean: other countries have brave press cultures, but comparative legal work still usually ranks US government speech restrictions among the loosest.',
        evidence: [
          {
            stance: 'supports',
            blurb:
              'The US has its own chilled topics, polarised institutions, and professional punishments. Other open societies protect journalists and protesters in ways Americans sometimes miss.',
          },
          {
            stance: 'challenges',
            blurb:
              'On the narrow question of what the government may ban, comparative scholars still tend to put the US near the permissive end — especially on hate speech and prior restraint.',
          },
          {
            stance: 'context',
            blurb:
              '“Unique” can mean the statute book or the feeling in the room. Say which one you mean and the temperature drops.',
          },
        ],
      },
    ],
  },
]

export const SEED_BY_ID = Object.fromEntries(
  SEED_CLAIMS.map((claim) => [claim.id, claim]),
) as Record<string, ClaimAnalysis>
