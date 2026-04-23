import type { Scenario } from "@/lib/types";

/**
 * 8 hardcoded scenarios, deliberately varied across:
 *   - Growth (high revenue growth, high P/E) vs Value (slow growth, low P/E)
 *   - Good outcome vs Bad outcome
 *   - Clear-cut calls vs "trap" setups where surface metrics mislead
 *
 * The predefined outcome is what the user sees AFTER making their call.
 * `idealAction` is used for the "Compare vs Ideal" bonus screen.
 */
export const SCENARIOS: Scenario[] = [
  {
    id: "sc-001",
    ticker: "NVDA",
    company: "Nova Semiconductor",
    sector: "Semiconductors",
    description:
      "Designs GPUs used for AI training. Dominant market share with a deep software moat.",
    price: 118.5,
    revenueGrowthPct: 94,
    peRatio: 62,
    profitMarginPct: 49,
    headlines: [
      "Hyperscaler order book grows 40% q/q",
      "New competitor chip delayed 12 months",
    ],
    signal: "Operating leverage accelerating",
    outcome: {
      returnPct: 18,
      summary:
        "Next quarter's earnings beat on both revenue and margins; guide raised. Stock rallied 18% over the following 3 months.",
      idealAction: "BUY",
      idealRationale:
        "A high P/E is justified when growth is 90%+ and margins are EXPANDING — this is a classic 'expensive but earning it' setup. Competitor delay widens the moat.",
    },
  },
  {
    id: "sc-002",
    ticker: "RETL",
    company: "Harborline Retail Co.",
    sector: "Consumer Retail",
    description:
      "Mid-tier apparel retailer with ~900 physical stores. Limited e-commerce presence.",
    price: 14.2,
    revenueGrowthPct: 2,
    peRatio: 7,
    profitMarginPct: 3,
    headlines: [
      "Same-store sales down 4% vs last year",
      "CFO resigns, cites 'personal reasons'",
    ],
    signal: "Margins declining 3 quarters in a row",
    outcome: {
      returnPct: -22,
      summary:
        "Guidance cut twice. Inventory write-downs announced. Stock fell 22% over the following 3 months.",
      idealAction: "PASS",
      idealRationale:
        "A low P/E is NOT automatically cheap. When margins and comps are falling and the CFO exits, the low multiple is a warning, not a bargain. Classic value trap.",
    },
  },
  {
    id: "sc-003",
    ticker: "STRM",
    company: "Streamly Media",
    sector: "Streaming / Media",
    description:
      "Global subscription video streaming platform. Just raised prices in its largest market.",
    price: 92.0,
    revenueGrowthPct: 14,
    peRatio: 28,
    profitMarginPct: 11,
    headlines: [
      "Price hike drives short-term subscriber churn fears",
      "Ad-tier subscriptions up 60% y/y",
    ],
    signal: "Free cash flow positive for the first time",
    outcome: {
      returnPct: 9,
      summary:
        "Churn came in lower than feared; ad revenue surprise led to a modest beat. Stock up 9%.",
      idealAction: "BUY",
      idealRationale:
        "The ad-tier growth + first-time FCF positive is a structural story. Market was fixated on short-term churn — classic misread of a durable trend.",
    },
  },
  {
    id: "sc-004",
    ticker: "BIOX",
    company: "Biorex Therapeutics",
    sector: "Biotech (pre-revenue)",
    description:
      "Clinical-stage biotech with a single Phase 3 Alzheimer's drug candidate.",
    price: 22.5,
    revenueGrowthPct: 0,
    peRatio: 0, // unprofitable — P/E not meaningful
    profitMarginPct: -240,
    headlines: [
      "Phase 3 readout expected in 6 weeks",
      "Short interest climbs to 28% of float",
    ],
    signal: "Binary outcome event near",
    outcome: {
      returnPct: -58,
      summary:
        "Primary endpoint missed in Phase 3 readout. Stock gapped down 58% and stayed there.",
      idealAction: "PASS",
      idealRationale:
        "This is a coin flip, not an investment. For a trainee portfolio, binary events with no downside protection should be PASS regardless of upside excitement.",
    },
  },
  {
    id: "sc-005",
    ticker: "BANK",
    company: "Meridian Regional Bank",
    sector: "Regional Banking",
    description:
      "Mid-size US regional bank with ~70% of loan book in commercial real estate.",
    price: 41.0,
    revenueGrowthPct: 5,
    peRatio: 9,
    profitMarginPct: 22,
    headlines: [
      "Fed signals rates 'higher for longer'",
      "Office vacancy rates hit 25-year high in core markets",
    ],
    signal: "Heavy CRE concentration",
    outcome: {
      returnPct: -14,
      summary:
        "Loan-loss provisions raised; dividend cut by 30%. Stock down 14% before stabilizing.",
      idealAction: "HOLD", // For a holder; PASS is also defensible for a new buyer
      idealRationale:
        "Cheap on earnings, but the earnings themselves are at risk from CRE exposure. Low P/E without a margin of safety on the underlying earnings is not value.",
    },
  },
  {
    id: "sc-006",
    ticker: "CLDY",
    company: "Cloudex Systems",
    sector: "Enterprise SaaS",
    description:
      "Observability / monitoring SaaS for large enterprises. Net revenue retention above 120%.",
    price: 145.0,
    revenueGrowthPct: 32,
    peRatio: 55,
    profitMarginPct: 18,
    headlines: [
      "Lands 3 Fortune 100 accounts this quarter",
      "Analyst downgrade on valuation concerns",
    ],
    signal: "Net retention 124%",
    outcome: {
      returnPct: 4,
      summary:
        "In-line quarter, but the valuation downgrade weighed on sentiment. Up 4% over the window — mostly flat.",
      idealAction: "HOLD",
      idealRationale:
        "High-quality business, but at 55x earnings with growth 'only' 32%, upside is priced in. HOLD is appropriate — not a screaming buy, not a reason to sell a compounder.",
    },
  },
  {
    id: "sc-007",
    ticker: "OILX",
    company: "Rigfield Energy",
    sector: "Oil & Gas (Upstream)",
    description:
      "Independent US shale producer. Debt/EBITDA around 1.2x. Hedged ~60% of 2026 production.",
    price: 58.0,
    revenueGrowthPct: -6,
    peRatio: 6,
    profitMarginPct: 24,
    headlines: [
      "OPEC+ extends production cuts",
      "Company announces $500M buyback and 15% dividend hike",
    ],
    signal: "Free cash flow yield ~12%",
    outcome: {
      returnPct: 13,
      summary:
        "Oil strip held; buyback executed aggressively below book. Total return 13% incl. dividend.",
      idealAction: "BUY",
      idealRationale:
        "Classic out-of-favor value: strong balance sheet, huge FCF yield, and management returning capital. The 'declining revenue' headline is noise — commodity cycle, not business decay.",
    },
  },
  {
    id: "sc-008",
    ticker: "EVCO",
    company: "Voltaic Motors",
    sector: "Electric Vehicles",
    description:
      "Early-stage EV maker. Just started production at its first factory.",
    price: 9.4,
    revenueGrowthPct: 180,
    peRatio: 0, // unprofitable
    profitMarginPct: -42,
    headlines: [
      "Delivers first 2,000 vehicles, slightly below internal target",
      "Cash runway ~14 months at current burn",
    ],
    signal: "Capital raise likely within 12 months",
    outcome: {
      returnPct: -31,
      summary:
        "Dilutive equity raise priced 28% below market. Stock fell ~31% over the window.",
      idealAction: "PASS",
      idealRationale:
        "High revenue growth % looks exciting but comes off a tiny base. With <18 months of runway and no profitability path, dilution risk dominates the thesis.",
    },
  },
  // ── sc-009 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-009",
    ticker: "CYSH",
    company: "Cipherstone Security",
    sector: "Cybersecurity SaaS",
    description:
      "Cloud-native endpoint and identity security platform serving mid-market enterprises. Annual contracts, 90%+ gross margins.",
    price: 68.0,
    revenueGrowthPct: 38,
    peRatio: 0,
    profitMarginPct: -8,
    headlines: [
      "Major competitor breached — customers scrambling to switch vendors",
      "Company posts 4th consecutive quarter of net new ARR records",
    ],
    signal: "Net revenue retention: 118%",
    outcome: {
      returnPct: 24,
      summary:
        "Competitor breach drove an accelerated sales cycle; ARR guidance raised twice. Stock up 24% over the following quarter.",
      idealAction: "BUY",
      idealRationale:
        "Cybersecurity demand is non-discretionary and competitors' failures are direct sales opportunities. 118% NRR with accelerating ARR growth justifies the lack of near-term profitability.",
    },
  },
  // ── sc-010 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-010",
    ticker: "BRGR",
    company: "Stackhouse Burgers",
    sector: "Fast Casual Restaurants",
    description:
      "Fast-casual burger chain with 1,400 US locations. Known for premium ingredients. Aggressively expanding into new markets.",
    price: 31.5,
    revenueGrowthPct: 18,
    peRatio: 34,
    profitMarginPct: 4,
    headlines: [
      "Company announces 200 new store openings for next fiscal year",
      "Same-store sales down 3.2% — first decline in 6 years",
    ],
    signal: "New-store economics weakening in saturated markets",
    outcome: {
      returnPct: -19,
      summary:
        "Over-expansion into marginal markets dragged company-wide margins. Guidance cut; CEO acknowledged the pace was 'too aggressive.' Stock fell 19%.",
      idealAction: "PASS",
      idealRationale:
        "Revenue growth driven by new stores while SSS is negative means the core business is declining. Expansion is masking deterioration, not adding to it.",
    },
  },
  // ── sc-011 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-011",
    ticker: "HDRK",
    company: "Hardrock Industrial",
    sector: "Industrial Equipment",
    description:
      "Manufacturer of heavy construction and mining equipment. Cyclical revenues tied to infrastructure spending and commodity capex.",
    price: 44.0,
    revenueGrowthPct: -8,
    peRatio: 10,
    profitMarginPct: 9,
    headlines: [
      "Global infrastructure bill passage drives equipment order surge",
      "Current-quarter revenue down 8% on prior-year tough comp",
    ],
    signal: "Order backlog up 42% year-over-year",
    outcome: {
      returnPct: 21,
      summary:
        "Backlog converted to revenue ahead of schedule. Next-quarter guide was 14% ahead of consensus. Stock re-rated from 10x to 14x earnings as cycle turned.",
      idealAction: "BUY",
      idealRationale:
        "For cyclical companies, the rearview revenue number is the worst leading indicator. The order backlog is the right signal — it was telling a completely different story.",
    },
  },
  // ── sc-012 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-012",
    ticker: "OFFC",
    company: "Pinnacle Office REIT",
    sector: "Commercial Real Estate (Office)",
    description:
      "REIT owning 28M sq ft of Class A office space in major US cities. Yield appears attractive at 8.2%.",
    price: 19.5,
    revenueGrowthPct: -4,
    peRatio: 0,
    profitMarginPct: 12,
    headlines: [
      "Major tenant — 12% of lease revenue — announces remote-first policy, will not renew",
      "Dividend maintained despite rising vacancies",
    ],
    signal: "Occupancy falling 2 pts per quarter for 5 quarters",
    outcome: {
      returnPct: -28,
      summary:
        "Two more major tenants downsized. Dividend cut by 40%. Office valuations continue to compress as structural remote-work adoption proves permanent.",
      idealAction: "PASS",
      idealRationale:
        "A high yield is only valuable if it's sustainable. A dividend maintained during occupancy freefall is a warning sign, not a green light — it means management is in denial about the structural shift.",
    },
  },
  // ── sc-013 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-013",
    ticker: "CLNR",
    company: "Clearwater Consumer Brands",
    sector: "Consumer Staples",
    description:
      "Manufacturer of household cleaning, paper, and personal care products. Brands in 80% of US households.",
    price: 87.0,
    revenueGrowthPct: 5,
    peRatio: 22,
    profitMarginPct: 16,
    headlines: [
      "Raises full-year guidance after third consecutive pricing action holds",
      "Private-label competition intensifying at major retailers",
    ],
    signal: "Volume flat; all growth from price/mix",
    outcome: {
      returnPct: 11,
      summary:
        "Pricing held better than feared. Volume stabilized in Q3. Defensive positioning in volatile market drove multiple expansion. Stock up 11% including dividend.",
      idealAction: "BUY",
      idealRationale:
        "Stable consumer staples with genuine brand pricing power are worth owning at a slight premium. Private-label risk is real but overstated for category-leading brands with 80% household penetration.",
    },
  },
  // ── sc-014 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-014",
    ticker: "BNPL",
    company: "Flexipay Financial",
    sector: "Consumer Fintech (BNPL)",
    description:
      "Buy-now-pay-later lender embedded in retail checkout flows. 18M active users.",
    price: 17.5,
    revenueGrowthPct: 44,
    peRatio: 0,
    profitMarginPct: -31,
    headlines: [
      "GMV hits record $4.2B this quarter — 44% growth year-over-year",
      "30-day delinquency rate climbs to 6.8%, up from 4.1% last year",
    ],
    signal: "Loan loss provisions growing faster than revenue",
    outcome: {
      returnPct: -38,
      summary:
        "Charge-off rates accelerated. Company was forced to tighten credit standards, which slowed GMV growth and triggered a guide-down. Stock fell 38%.",
      idealAction: "PASS",
      idealRationale:
        "GMV growth is meaningless if the receivables behind it are deteriorating. Rising delinquency at the top of the credit cycle signals the business model doesn't work — not just a macro blip.",
    },
  },
  // ── sc-015 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-015",
    ticker: "GMST",
    company: "Gamestar Interactive",
    sector: "Video Games",
    description:
      "Major video game publisher with a flagship AAA franchise releasing its next installment in 8 weeks.",
    price: 54.0,
    revenueGrowthPct: 6,
    peRatio: 19,
    profitMarginPct: 14,
    headlines: [
      "Pre-order numbers tracking 35% above prior installment",
      "Review embargo lifted — critics give franchise-best 91 Metacritic score",
    ],
    signal: "Stock down 18% in past 3 months on release skepticism",
    outcome: {
      returnPct: 22,
      summary:
        "Launch weekend sales exceeded guidance by 22%. Live-service add-ons drove strong post-launch monetization. Stock recovered fully plus 22% over the window.",
      idealAction: "BUY",
      idealRationale:
        "Pre-orders +35% and a 91 Metacritic score with the stock down 18% from skepticism is a setup where the market is pricing in failure that data is contradicting. Asymmetric risk.",
    },
  },
  // ── sc-016 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-016",
    ticker: "MDVX",
    company: "Medvex Devices",
    sector: "Medical Devices",
    description:
      "Manufacturer of minimally invasive surgical robotics systems. Just received FDA clearance for its second-generation platform.",
    price: 78.0,
    revenueGrowthPct: 22,
    peRatio: 48,
    profitMarginPct: 10,
    headlines: [
      "FDA clears next-gen robotic surgical platform — faster and 30% cheaper to operate",
      "Three hospital systems commit to fleet upgrades pending reimbursement approval",
    ],
    signal: "Installed base conversion cycle: 18–24 months",
    outcome: {
      returnPct: 17,
      summary:
        "Reimbursement approval came faster than expected. Hospital upgrade orders began converting in Q2. Revenue guidance raised; stock up 17%.",
      idealAction: "BUY",
      idealRationale:
        "FDA clearance plus committed hospital systems is a de-risked setup. The 18-24 month conversion cycle is actually a feature — it provides multi-quarter revenue visibility once orders start.",
    },
  },
  // ── sc-017 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-017",
    ticker: "FRTX",
    company: "FreightAxis Logistics",
    sector: "Freight & Logistics",
    description:
      "US truckload and intermodal freight broker. Revenue tied to shipping volume and spot/contract rate spreads.",
    price: 38.0,
    revenueGrowthPct: -12,
    peRatio: 14,
    profitMarginPct: 5,
    headlines: [
      "Spot freight rates stabilize after 18-month decline — first positive week in 6 quarters",
      "Company wins multi-year contract with top-5 US retailer",
    ],
    signal: "Operating leverage: margins up 180bps despite revenue headwind",
    outcome: {
      returnPct: 26,
      summary:
        "Spot rates inflected positive, contract re-pricing began. Margin expansion thesis played out ahead of schedule. Stock re-rated as the cycle turned.",
      idealAction: "BUY",
      idealRationale:
        "Freight is deeply cyclical. Buying at trough rates — when revenue looks worst — has historically been the right entry. Rate stabilization plus margin improvement is the inflection signal.",
    },
  },
  // ── sc-018 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-018",
    ticker: "PETZ",
    company: "Pawsome Commerce",
    sector: "Specialty E-Commerce",
    description:
      "Online pet supply retailer. High GMV growth but relies heavily on paid acquisition to drive repeat purchase.",
    price: 12.4,
    revenueGrowthPct: 28,
    peRatio: 0,
    profitMarginPct: -19,
    headlines: [
      "Active customer count up 28% — fastest growth rate in company history",
      "Customer acquisition cost rises to $87, up from $52 two years ago",
    ],
    signal: "Lifetime value to CAC ratio now below 2.0x",
    outcome: {
      returnPct: -24,
      summary:
        "Unit economics broke down as CAC inflation outpaced LTV improvement. Company had to slow marketing spend, which stalled growth. Guidance cut badly.",
      idealAction: "PASS",
      idealRationale:
        "Customer count growth means nothing if each customer costs more to acquire than they're worth. LTV/CAC below 2.0x is a broken e-commerce model regardless of the top-line number.",
    },
  },
  // ── sc-019 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-019",
    ticker: "SOCL",
    company: "Nexus Social",
    sector: "Digital Media / Social",
    description:
      "Mature US social media platform. User growth effectively flat, but average revenue per user expanding steadily via video ads.",
    price: 195.0,
    revenueGrowthPct: 11,
    peRatio: 21,
    profitMarginPct: 29,
    headlines: [
      "Daily active users flat for second consecutive quarter",
      "Ad revenue per user up 17% as video format takes over feed",
    ],
    signal: "Buyback authorization = 6% of float",
    outcome: {
      returnPct: 7,
      summary:
        "Flat user growth masked strong monetization improvement. Ad revenue beat; margin expanded. Stock up 7% — steady compounding, not excitement.",
      idealAction: "HOLD",
      idealRationale:
        "A mature social platform with flat users and 17% ARPU growth is monetizing well. P/E of 21 is fair. This is a steady hold — no catalyst to add aggressively, no reason to exit.",
    },
  },
  // ── sc-020 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-020",
    ticker: "TELN",
    company: "Nextel Wireless Group",
    sector: "Telecom",
    description:
      "National wireless carrier. High dividend yield attracts income investors, but capital intensity is extreme.",
    price: 16.2,
    revenueGrowthPct: 2,
    peRatio: 11,
    profitMarginPct: 8,
    headlines: [
      "Upcoming spectrum auction expected to cost company $4–6B",
      "Subscriber net adds miss for the third straight quarter",
    ],
    signal: "Net debt / EBITDA at 4.2x — near covenant limit",
    outcome: {
      returnPct: -16,
      summary:
        "Spectrum auction came in at high end. Debt load prevented meaningful buyback or dividend raise. Subscriber losses accelerated. Stock fell 16%.",
      idealAction: "PASS",
      idealRationale:
        "A high dividend yield in telecom with 4x+ leverage and subscriber losses is a trap. The yield looks attractive only until the balance sheet forces a cut — which it eventually will.",
    },
  },
  // ── sc-021 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-021",
    ticker: "CPRX",
    company: "Copperfield Mining",
    sector: "Metals & Mining (Copper)",
    description:
      "One of the five largest copper producers globally. Operates mines in South America and Central Africa.",
    price: 29.0,
    revenueGrowthPct: -10,
    peRatio: 9,
    profitMarginPct: 18,
    headlines: [
      "Copper demand from EV and grid infrastructure projected to double by 2032",
      "Current copper price near 3-year low on China slowdown fears",
    ],
    signal: "Production cost $1.95/lb vs spot price $3.60/lb — wide margin",
    outcome: {
      returnPct: 31,
      summary:
        "Chinese stimulus surprised to the upside; copper prices recovered. New EV adoption data reinforced the structural demand thesis. Stock up 31% as price recovered.",
      idealAction: "BUY",
      idealRationale:
        "Structural demand (energy transition) paired with cyclical trough pricing is the ideal mining entry. Low P/E, wide margin of safety on production cost — the short-term bearishness was already priced in.",
    },
  },
  // ── sc-022 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-022",
    ticker: "RXLG",
    company: "Paragon Pharmaceuticals",
    sector: "Large-Cap Pharma",
    description:
      "Global pharmaceutical company. A blockbuster drug ($8B annual revenue) loses patent protection in 14 months.",
    price: 112.0,
    revenueGrowthPct: 3,
    peRatio: 13,
    profitMarginPct: 27,
    headlines: [
      "Flagship drug patent cliff incoming — generic entrants file ANDAs",
      "Phase 3 data for two pipeline drugs due in next 12 months",
    ],
    signal: "Pipeline covers ~60% of patent-cliff revenue if both drugs succeed",
    outcome: {
      returnPct: -5,
      summary:
        "One pipeline drug succeeded, one failed. Partial offset to the cliff. Stock fell 5% — not a disaster, not a recovery. Range-bound for the next year.",
      idealAction: "HOLD",
      idealRationale:
        "Half-covered patent cliffs with binary pipeline catalysts are classically HOLD territory. Not cheap enough to be a deep-value BUY; not broken enough to exit.",
    },
  },
  // ── sc-023 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-023",
    ticker: "AXDF",
    company: "Axiom Defense Systems",
    sector: "Aerospace & Defense",
    description:
      "Tier-1 defense contractor supplying missiles, radar systems, and command-and-control software to NATO governments.",
    price: 182.0,
    revenueGrowthPct: 12,
    peRatio: 18,
    profitMarginPct: 11,
    headlines: [
      "NATO members raise defense spending targets; order book expands 28%",
      "Production bottleneck in missile components may delay near-term deliveries",
    ],
    signal: "Funded backlog now covers 3.4 years of revenue",
    outcome: {
      returnPct: 14,
      summary:
        "Supply bottleneck resolved faster than feared. Delivery schedule caught up. 3+ year backlog converted to consistent beats. Stock up 14%.",
      idealAction: "BUY",
      idealRationale:
        "Government defense contracts with 3+ year funded backlogs are low-risk revenue. Supply bottlenecks in a defense cycle are temporary. The market was discounting too much delivery risk.",
    },
  },
  // ── sc-024 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-024",
    ticker: "CLFT",
    company: "Cloudlift Infrastructure",
    sector: "Cloud Infrastructure",
    description:
      "Developer platform for deploying and scaling microservices. Grew 90% last year; now growing 38%.",
    price: 48.0,
    revenueGrowthPct: 38,
    peRatio: 0,
    profitMarginPct: -44,
    headlines: [
      "Growth decelerates to 38% from 90% peak as easy COVID comps roll off",
      "Large cloud platforms (AWS, Azure) launch competing managed services",
    ],
    signal: "P/S ratio still 22x on decelerating, money-losing business",
    outcome: {
      returnPct: -41,
      summary:
        "Growth decelerated further to 24% as competitive overlap increased. Multiple compressed rapidly. Stock fell 41% as the growth premium evaporated.",
      idealAction: "PASS",
      idealRationale:
        "Paying 22x sales for a company decelerating from 90% to 38% growth while losing money — with the largest cloud providers entering the market — is a valuation with no margin of safety.",
    },
  },
  // ── sc-025 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-025",
    ticker: "PCAS",
    company: "Cascadia Property & Casualty",
    sector: "Insurance (P&C)",
    description:
      "Regional P&C insurer focused on home and auto. After two bad loss years, aggressively re-priced its book.",
    price: 62.0,
    revenueGrowthPct: 8,
    peRatio: 14,
    profitMarginPct: 6,
    headlines: [
      "Announces 15–22% premium rate increases across home and auto lines",
      "Prior two years included $400M in weather-related catastrophe losses",
    ],
    signal: "Combined ratio improving: 104 → 99 → 96 over 3 quarters",
    outcome: {
      returnPct: 19,
      summary:
        "Hard market conditions persisted. Loss ratio improved. Re-priced policies started earning through. Combined ratio hit 93. Stock up 19%.",
      idealAction: "BUY",
      idealRationale:
        "In insurance, a 'hard market' (rising rates after bad losses) is the ideal entry — premium increases are locked in before losses normalize. A combined ratio trending below 96 is a quality underwriter.",
    },
  },
  // ── sc-026 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-026",
    ticker: "LRNX",
    company: "EduPath Technologies",
    sector: "Education Technology",
    description:
      "Online K-12 tutoring platform that exploded during COVID. Now competing against schools reopening to full in-person.",
    price: 8.2,
    revenueGrowthPct: -24,
    peRatio: 0,
    profitMarginPct: -55,
    headlines: [
      "Monthly active users down 31% as students return to in-person learning",
      "Company announces pivot to 'AI tutoring' — specifics vague",
    ],
    signal: "Cash runway ~10 months at current burn rate",
    outcome: {
      returnPct: -44,
      summary:
        "AI pivot didn't generate meaningful new revenue. Cash burn continued. Needed to raise capital at a heavy discount. Stock fell 44%.",
      idealAction: "PASS",
      idealRationale:
        "COVID tailwinds aren't a business model. A company with 10 months of runway, -24% revenue, and a vague pivot is not an investment — it's a liquidity event waiting to happen.",
    },
  },
  // ── sc-027 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-027",
    ticker: "SNKX",
    company: "Crunchwell Brands",
    sector: "Packaged Food & Snacks",
    description:
      "Owner of four leading snack brands with strong loyalty in US and growing international distribution.",
    price: 74.0,
    revenueGrowthPct: 7,
    peRatio: 20,
    profitMarginPct: 15,
    headlines: [
      "International revenue up 22% — now 30% of total, up from 18% two years ago",
      "Private-label snacks gaining shelf space at major grocery chains",
    ],
    signal: "Gross margin up 180bps on improved ingredient costs",
    outcome: {
      returnPct: 12,
      summary:
        "International growth offset private-label pressure. Margin improvement continued. Dividend raised 8%. Stock up 12% including dividend.",
      idealAction: "BUY",
      idealRationale:
        "Category-leading snack brands with real international growth and margin improvement at 20x earnings is a quality compounder. Private-label risk is real but limited to weaker sub-brands.",
    },
  },
  // ── sc-028 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-028",
    ticker: "LODG",
    company: "Harborview Hotels",
    sector: "Hospitality / Hotels",
    description:
      "Mid-scale and upscale hotel chain. RevPAR fully recovered to pre-COVID levels 6 quarters ago.",
    price: 48.5,
    revenueGrowthPct: 5,
    peRatio: 17,
    profitMarginPct: 12,
    headlines: [
      "RevPAR grows 5% — in line with expectations, no acceleration",
      "Labor costs up 11% year-over-year as hospitality wages rise",
    ],
    signal: "Room pipeline expanding but returns on new builds declining",
    outcome: {
      returnPct: 2,
      summary:
        "Recovery fully priced in. Labor cost inflation weighed on margin. Stock barely moved — a low-single-digit return with no real catalyst either direction.",
      idealAction: "HOLD",
      idealRationale:
        "When a recovery is already fully priced in, you're left with a business growing at 5% with rising costs. HOLD if you own it; no reason to build a position here.",
    },
  },
  // ── sc-029 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-029",
    ticker: "MOTV",
    company: "Vanguard Motors Group",
    sector: "Traditional Auto (OEM)",
    description:
      "Legacy US automaker. Profitable ICE truck and SUV segment is funding a money-losing EV transition.",
    price: 22.0,
    revenueGrowthPct: 4,
    peRatio: 5,
    profitMarginPct: 7,
    headlines: [
      "EV division loses $32,000 per vehicle delivered — losses widening",
      "F-Series truck equivalent still dominant; record profit in ICE segment",
    ],
    signal: "EV targets scaled back for third time in 18 months",
    outcome: {
      returnPct: -17,
      summary:
        "EV losses widened further. ICE profits began slowing as gas prices fell. Multiple compression continued as investors struggled to value the hybrid model.",
      idealAction: "PASS",
      idealRationale:
        "P/E of 5 looks cheap until you realize the profitable division (ICE) is in secular decline and the growth division (EV) is burning cash with no clear path to profitability.",
    },
  },
  // ── sc-030 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-030",
    ticker: "FRTL",
    company: "Trident Fertilizers",
    sector: "Agricultural Chemicals",
    description:
      "Major North American producer of nitrogen and potash fertilizers. Prices spiked after supply shock two years ago.",
    price: 54.0,
    revenueGrowthPct: -9,
    peRatio: 8,
    profitMarginPct: 24,
    headlines: [
      "Global supply remains constrained — Eastern European production still offline",
      "Revenue down 9% on price normalization from 2-year-ago spike",
    ],
    signal: "Free cash flow yield: 14%. Buyback covers 8% of float this year.",
    outcome: {
      returnPct: 18,
      summary:
        "Prices stabilized above historical norms; volume grew. Buyback reduced share count meaningfully. Stock re-rated on FCF as investors recognized the structural shift in supply.",
      idealAction: "BUY",
      idealRationale:
        "Revenue decline from a spike is not the same as business deterioration. 14% FCF yield with aggressive buybacks in a structurally tighter market is genuine value.",
    },
  },
  // ── sc-031 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-031",
    ticker: "SMBS",
    company: "WorkStream Software",
    sector: "SMB SaaS (HR & Payroll)",
    description:
      "HR and payroll software for small businesses (1–50 employees). 85K customers, largely monthly contracts.",
    price: 28.0,
    revenueGrowthPct: 18,
    peRatio: 0,
    profitMarginPct: -15,
    headlines: [
      "Small business formation rate falls to 3-year low amid economic uncertainty",
      "Monthly churn rate rises to 2.8% — up from 1.6% a year ago",
    ],
    signal: "CAC increasing as paid channels become less efficient",
    outcome: {
      returnPct: -29,
      summary:
        "Churn continued rising as small businesses cut software spend. Net revenue retention fell below 90%. Growth decelerated to 6%. Stock fell 29%.",
      idealAction: "PASS",
      idealRationale:
        "SMB SaaS is the most vulnerable segment in a downturn. Monthly contracts with rising churn is a leaky bucket. Net retention below 100% means the existing base is shrinking before you add a single new customer.",
    },
  },
  // ── sc-032 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-032",
    ticker: "SMQP",
    company: "Semiquant Systems",
    sector: "Semiconductor Equipment",
    description:
      "Maker of advanced packaging and bonding equipment used in HBM memory for AI accelerators.",
    price: 96.0,
    revenueGrowthPct: 52,
    peRatio: 31,
    profitMarginPct: 22,
    headlines: [
      "HBM memory demand from AI chip builders up 3x year-over-year",
      "Lead times for bonding equipment extend to 18 months",
    ],
    signal: "Order book = 2.4x annual revenue — visibility unusual for this sector",
    outcome: {
      returnPct: 33,
      summary:
        "AI buildout continued to drive record HBM orders. Company raised guidance three times. 18-month lead times meant revenue was locked in far ahead of delivery.",
      idealAction: "BUY",
      idealRationale:
        "A 2.4x book-to-bill ratio in semiconductor equipment is extraordinary. This is a bottleneck supplier in the AI infrastructure stack — pricing power and visibility are unusually high.",
    },
  },
  // ── sc-033 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-033",
    ticker: "GNTX",
    company: "Genethix Therapeutics",
    sector: "Clinical-Stage Biotech",
    description:
      "Phase 2-stage biotech with a gene therapy for a rare metabolic disorder. ~5,000 diagnosed patients in the US.",
    price: 14.5,
    revenueGrowthPct: 0,
    peRatio: 0,
    profitMarginPct: -180,
    headlines: [
      "Phase 2 data shows 74% response rate — well above 50% threshold for approval path",
      "Three large-cap pharma companies reportedly in early acquisition discussions",
    ],
    signal: "Orphan drug designation secured — 7-year exclusivity post-approval",
    outcome: {
      returnPct: 68,
      summary:
        "Acquisition confirmed 90 days later at a 62% premium to the pre-announcement price. Orphan drug exclusivity made the asset highly valuable to the acquirer.",
      idealAction: "BUY",
      idealRationale:
        "Phase 2 data de-risked the binary event. Orphan drug designation + M&A rumors + a validated target is a favorable setup. This is different from a pre-data binary — the signal arrived.",
    },
  },
  // ── sc-034 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-034",
    ticker: "CONX",
    company: "Meridian Conglomerate",
    sector: "Diversified Industrials",
    description:
      "Multi-division industrial company spanning HVAC, aerospace components, and specialty chemicals. Trades at a persistent holding company discount.",
    price: 66.0,
    revenueGrowthPct: 5,
    peRatio: 13,
    profitMarginPct: 11,
    headlines: [
      "Activist investor discloses 9.4% stake; demands separation of HVAC division",
      "Sum-of-parts analysis by three banks shows intrinsic value $92–$105/share",
    ],
    signal: "HVAC division alone worth more than current market cap",
    outcome: {
      returnPct: 29,
      summary:
        "Company agreed to explore strategic alternatives for HVAC. Separation announced 4 months later. Sum-of-parts discount closed partially. Stock up 29%.",
      idealAction: "BUY",
      idealRationale:
        "A credible activist with a concrete separation thesis and three-bank sum-of-parts validation creates a floor. When a division is worth more than the whole, the catalyst is just a matter of timing.",
    },
  },
  // ── sc-035 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-035",
    ticker: "SPOF",
    company: "Clearlink Payments",
    sector: "Fintech (Spinoff)",
    description:
      "Payments processing division spun off from a large financial conglomerate 6 months ago. Institutional shareholders are still selling the position.",
    price: 22.0,
    revenueGrowthPct: 16,
    peRatio: 15,
    profitMarginPct: 19,
    headlines: [
      "Index fund rebalancing complete — forced sellers from parent index now out",
      "First standalone earnings beat both revenue and earnings estimates",
    ],
    signal: "Comparable pure-play peers trade at 24–28x earnings",
    outcome: {
      returnPct: 35,
      summary:
        "Once the overhang from spinoff sellers cleared, the stock re-rated toward peers. P/E expanded from 15x to 22x as standalone earnings track record established.",
      idealAction: "BUY",
      idealRationale:
        "Spinoffs are systematically undervalued because index sellers create artificial supply pressure. When the selling exhausts itself and the standalone business proves out, re-rating is the predictable outcome.",
    },
  },
  // ── sc-036 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-036",
    ticker: "LUXE",
    company: "Maison Elevé Group",
    sector: "Luxury Goods",
    description:
      "European luxury fashion and accessories house. China accounts for 42% of global revenue.",
    price: 88.0,
    revenueGrowthPct: -7,
    peRatio: 22,
    profitMarginPct: 21,
    headlines: [
      "China consumer spending on luxury down 18% year-over-year — slowest since 2009",
      "Inventory builds detected at key retail partners in Asia",
    ],
    signal: "Aspiring luxury (mid-tier) outperforming; ultra-high-end holding up",
    outcome: {
      returnPct: -20,
      summary:
        "China weakness proved structural, not cyclical. Channel inventory needed a full year to clear. Multiple compressed as growth trajectory reset lower.",
      idealAction: "PASS",
      idealRationale:
        "42% revenue from a single country in contraction, with inventory building in that market, is a multi-quarter problem. Luxury companies with this exposure rarely recover quickly when China softens.",
    },
  },
  // ── sc-037 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-037",
    ticker: "CXCH",
    company: "CryptoNex Exchange",
    sector: "Cryptocurrency Exchange",
    description:
      "US-based retail cryptocurrency trading platform. Revenue is almost entirely transaction fees — highly correlated to crypto prices and volume.",
    price: 19.5,
    revenueGrowthPct: 35,
    peRatio: 24,
    profitMarginPct: 14,
    headlines: [
      "Bitcoin rallies 40% — trading volume up 3x on platform",
      "SEC investigating classification of several listed tokens as unregistered securities",
    ],
    signal: "Revenue volatile: up 35% TTM but down 62% the year before",
    outcome: {
      returnPct: -33,
      summary:
        "SEC investigation expanded. Regulatory uncertainty caused institutional clients to pull volume. Bitcoin gave back gains; trading volume fell. Stock down 33%.",
      idealAction: "PASS",
      idealRationale:
        "A business whose revenue moves 3x when Bitcoin moves 40% has no real earnings power — it has crypto-correlated noise. Regulatory overhang on top of that makes it speculation, not investment.",
    },
  },
  // ── sc-038 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-038",
    ticker: "DIVT",
    company: "Pacifica Infrastructure Trust",
    sector: "Infrastructure / Yield",
    description:
      "Pipeline and storage infrastructure trust. 9.4% dividend yield attracts retail income investors. Payout has been maintained for 4 years.",
    price: 18.0,
    revenueGrowthPct: 1,
    peRatio: 16,
    profitMarginPct: 14,
    headlines: [
      "Management reaffirms dividend 'commitment' for fiscal year",
      "Free cash flow covers only 68% of current dividend payment",
    ],
    signal: "Debt/EBITDA at 5.8x; next debt maturity is 18 months away",
    outcome: {
      returnPct: -25,
      summary:
        "Refinancing at higher rates pressured free cash flow further. Dividend cut by 40% to preserve the balance sheet. Income investors exited en masse. Stock fell 25%.",
      idealAction: "PASS",
      idealRationale:
        "A dividend covered by only 68% of free cash flow is not a dividend — it's a debt-financed payout. With leverage near 6x, the only question is when the cut comes, not whether.",
    },
  },
  // ── sc-039 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-039",
    ticker: "LVRD",
    company: "Leveraged Direct Corp.",
    sector: "Consumer Services",
    description:
      "Subscription-based consumer service company. Rapid growth was funded with cheap debt; now $2.8B matures in 16 months.",
    price: 11.2,
    revenueGrowthPct: 9,
    peRatio: 0,
    profitMarginPct: -6,
    headlines: [
      "Refinancing discussions ongoing — current rate environment adds $180M in annual interest vs prior debt",
      "Subscribers flat; churn ticked up to 6.2%",
    ],
    signal: "EBITDA covers interest only 1.1x after refinancing at current rates",
    outcome: {
      returnPct: -47,
      summary:
        "Refinancing completed at punishing rates. Added leverage consumed all operating cash flow. Forced to cut growth investment, which accelerated churn. Stock fell 47%.",
      idealAction: "PASS",
      idealRationale:
        "A debt wall with no clear repayment source is an existential event. When refinancing is the only option and rates have tripled, the equity is essentially a call option — and not an attractive one.",
    },
  },
  // ── sc-040 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-040",
    ticker: "TRNX",
    company: "Thornfield Retail Group",
    sector: "Specialty Retail (Turnaround)",
    description:
      "Struggling specialty retailer that brought in a new CEO 20 months ago to fix the brand. Known for outdoor and camping gear.",
    price: 24.5,
    revenueGrowthPct: 3,
    peRatio: 14,
    profitMarginPct: 6,
    headlines: [
      "Gross margins recover to 38% — highest in 5 years — on inventory discipline",
      "E-commerce now 34% of sales, up from 12% at CEO arrival",
    ],
    signal: "Operating expense ratio falling 3 points over 6 quarters",
    outcome: {
      returnPct: 27,
      summary:
        "Turnaround continued to execute. Digital mix improved unit economics. Margin expansion drove EPS well ahead of prior guidance. Stock up 27%.",
      idealAction: "BUY",
      idealRationale:
        "Turnarounds are hard to time but Eeasy to recognize in execution. Gross margin recovery + opex discipline + digital mix shift is three independent signals pointing the same direction.",
    },
  },
  // ── sc-041 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-041",
    ticker: "HFIT",
    company: "HomeFit Connected",
    sector: "Connected Fitness",
    description:
      "At-home fitness equipment and subscription platform. Demand surged 400% during COVID lockdowns. Now competing with gyms fully reopened.",
    price: 7.8,
    revenueGrowthPct: -28,
    peRatio: 0,
    profitMarginPct: -62,
    headlines: [
      "Subscribers down 22% year-over-year as gym attendance fully recovers",
      "Cost-cutting plan announced — headcount reduced 35%",
    ],
    signal: "Hardware still selling below cost of production",
    outcome: {
      returnPct: -35,
      summary:
        "Even with cost cuts, the unit economics didn't improve fast enough. Subscriber base continued shrinking. The COVID demand was pulled forward, not structural.",
      idealAction: "PASS",
      idealRationale:
        "Companies that benefited purely from an exogenous event (lockdowns) need to prove they can hold users when the event ends. Every metric here says they can't.",
    },
  },
  // ── sc-042 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-042",
    ticker: "SLRX",
    company: "Solaris Energy Solutions",
    sector: "Solar Installation & Services",
    description:
      "Residential and commercial solar installer. Benefits from IRA tax credits but also sensitive to mortgage rates that affect homeowner decision-making.",
    price: 31.0,
    revenueGrowthPct: 21,
    peRatio: 26,
    profitMarginPct: 7,
    headlines: [
      "IRA incentive levels confirmed through 2032 — long-term demand visibility strong",
      "High mortgage rates slowing residential decisions; install backlog flat despite inquiry growth",
    ],
    signal: "Customer acquisition cost up 24% as financing options become more expensive",
    outcome: {
      returnPct: 3,
      summary:
        "Tailwinds and headwinds balanced out. Revenue met guidance but didn't exceed it. Margin improvement was offset by financing cost pressures. Flat-ish year.",
      idealAction: "HOLD",
      idealRationale:
        "Long-term thesis (IRA, energy transition) is intact but near-term execution depends on rate environment that's uncertain. This is a hold, not a thesis breaker and not a clear buy.",
    },
  },
  // ── sc-043 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-043",
    ticker: "MXSF",
    company: "Maxfield Software",
    sector: "Enterprise SaaS (Mature)",
    description:
      "ERP software for mid-market manufacturers. Rule of 40 company — growth slowing to 14%, but FCF margin now 28%.",
    price: 124.0,
    revenueGrowthPct: 14,
    peRatio: 29,
    profitMarginPct: 24,
    headlines: [
      "Growth decelerates to 14% as market penetration matures",
      "Announces $500M buyback (6% of float) funded entirely by free cash flow",
    ],
    signal: "Gross retention 96%; expansion revenue growing faster than gross ARR",
    outcome: {
      returnPct: 8,
      summary:
        "Growth deceleration was in line with expectations. FCF deployed into buyback compressed share count. Steady compounder returned 8% — not exciting, not disappointing.",
      idealAction: "HOLD",
      idealRationale:
        "A mature SaaS with 96% retention, 28% FCF margins, and disciplined buybacks is a compounder not a catalyst story. At 29x earnings, it's fairly priced — hold, don't add aggressively.",
    },
  },
  // ── sc-044 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-044",
    ticker: "CNCX",
    company: "Concentra Analytics",
    sector: "Data & Analytics SaaS",
    description:
      "Business intelligence software vendor. Strong growth, but 41% of revenue comes from one Fortune 100 customer.",
    price: 36.0,
    revenueGrowthPct: 29,
    peRatio: 0,
    profitMarginPct: -12,
    headlines: [
      "Largest customer (41% of revenue) announces internal data platform build — 18-month timeline",
      "Rest of business growing 31% with no single customer above 6%",
    ],
    signal: "Customer concentration risk not disclosed prominently in S-1",
    outcome: {
      returnPct: -42,
      summary:
        "Largest customer reduced contract by 60% as internal platform came online. Revenue outlook cut sharply. Market had not priced the concentration risk.",
      idealAction: "PASS",
      idealRationale:
        "A customer representing 41% of revenue that is actively building to replace you is a binary existential risk — not a headline to watch. PASS regardless of growth elsewhere.",
    },
  },
  // ── sc-045 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-045",
    ticker: "LNDR",
    company: "Apex Lending Group",
    sector: "Consumer Finance / Lending",
    description:
      "Online personal loan provider operating in 38 states. High-yield lending to near-prime borrowers.",
    price: 21.0,
    revenueGrowthPct: 14,
    peRatio: 8,
    profitMarginPct: 12,
    headlines: [
      "Proposed CFPB rule would cap origination fees at levels 40% below current average",
      "Delinquency rates stable — management calls regulatory risk 'overstated'",
    ],
    signal: "If rule passes, management estimates 30–35% revenue impact",
    outcome: {
      returnPct: -32,
      summary:
        "Rule finalized with modifications — still impacted core product. Regulatory compliance costs rose. Management guidance proved too optimistic. Stock fell 32%.",
      idealAction: "PASS",
      idealRationale:
        "When a regulatory change threatens 30%+ of revenue and management calls it 'overstated,' that's an opinion, not analysis. The asymmetry is bad: downside is large, upside requires regulatory inaction.",
    },
  },
  // ── sc-046 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-046",
    ticker: "HGXT",
    company: "Horizon Tech Global",
    sector: "Tech Hardware (China-Exposed)",
    description:
      "US semiconductor company selling advanced logic chips. China represents 58% of revenue. New export control rules under review.",
    price: 82.0,
    revenueGrowthPct: 22,
    peRatio: 19,
    profitMarginPct: 21,
    headlines: [
      "US Department of Commerce reviewing export controls for advanced chips to China",
      "China revenue grew 31% this quarter — company's single largest growth driver",
    ],
    signal: "No China-alternative revenue plan disclosed by management",
    outcome: {
      returnPct: -27,
      summary:
        "New export controls restricted sales to key Chinese customers. Revenue from the region fell 45% over the following two quarters. No replacement customers.",
      idealAction: "PASS",
      idealRationale:
        "Geopolitical risk to 58% of revenue with no disclosed mitigation plan is not a risk to monitor — it's a reason to avoid. The growth rate is built on an increasingly fragile foundation.",
    },
  },
  // ── sc-047 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-047",
    ticker: "MAGE",
    company: "MediAlign Group",
    sector: "Managed Care / Medicare Advantage",
    description:
      "Health insurance company heavily weighted toward Medicare Advantage. Medical cost ratio spiked last year on post-COVID utilization surge.",
    price: 88.0,
    revenueGrowthPct: 12,
    peRatio: 14,
    profitMarginPct: 4,
    headlines: [
      "Medical loss ratio improves 150bps quarter-over-quarter — trend reverting to norm",
      "Membership grew 9% — premium rates set 18 months ago locking in margin recovery",
    ],
    signal: "CMS rate increase for next year: +3.7% — above consensus expectation",
    outcome: {
      returnPct: 22,
      summary:
        "Medical cost normalization continued faster than feared. CMS rate increase locked in healthy margins for the following year. Stock re-rated on earnings recovery.",
      idealAction: "BUY",
      idealRationale:
        "Managed care companies cycle through utilization spikes. When the spike is visibly normalizing AND next year's premium rates are already locked in above the cost increase, the margin recovery is de-risked.",
    },
  },
  // ── sc-048 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-048",
    ticker: "TRKL",
    company: "TransCore Freight",
    sector: "Trucking",
    description:
      "Full truckload and less-than-truckload carrier. Contract rates were set during the freight boom and are now rolling off.",
    price: 52.0,
    revenueGrowthPct: -5,
    peRatio: 16,
    profitMarginPct: 9,
    headlines: [
      "Spot rates stabilize — up 4% in latest month, first positive reading in 7 quarters",
      "Contract rate roll-off continues — new contracts pricing 12% below expiring ones",
    ],
    signal: "Fleet utilization at 88% — improving from 82% trough",
    outcome: {
      returnPct: 4,
      summary:
        "Spot recovery was real but slow. Contract headwinds partially offset it. Margins held flat. A quiet quarter with modest upside as the cycle searched for its bottom.",
      idealAction: "HOLD",
      idealRationale:
        "Spot stabilization is encouraging but contracts take 12–18 months to fully reprice. This is not the all-clear — it's the early innings. HOLD to see if spot recovery persists.",
    },
  },
  // ── sc-049 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-049",
    ticker: "DCRT",
    company: "CoreVault Data Centers",
    sector: "Data Center REIT",
    description:
      "Operator of hyperscale and colocation data centers across North America. AI infrastructure buildout driving unprecedented leasing demand.",
    price: 68.0,
    revenueGrowthPct: 19,
    peRatio: 0,
    profitMarginPct: 8,
    headlines: [
      "Leasing demand up 3x year-over-year — hyperscaler AI cluster orders dominating",
      "Power availability becoming a constraint — new sites require 24-month permitting",
    ],
    signal: "Occupancy at 97%; pre-leasing backlog covers 2.8 years of new capacity",
    outcome: {
      returnPct: 28,
      summary:
        "AI infrastructure demand remained insatiable. Power constraints increased pricing power. Pre-leasing backlog converted. Stock up 28%.",
      idealAction: "BUY",
      idealRationale:
        "97% occupancy with a 2.8-year pre-lease backlog in a supply-constrained environment is a landlord's dream. Data center REITs are infrastructure for the AI era — not a fad.",
    },
  },
  // ── sc-050 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-050",
    ticker: "MTAV",
    company: "Horizon Immersive",
    sector: "Virtual Reality / Metaverse",
    description:
      "Consumer VR hardware and social platform company. Has invested $12B in metaverse development over 3 years with minimal revenue.",
    price: 11.0,
    revenueGrowthPct: 8,
    peRatio: 0,
    profitMarginPct: -78,
    headlines: [
      "Announces new VR headset — price reduced to $499 to stimulate adoption",
      "Monthly active users of social VR platform: 500K (target was 50M by this year)",
    ],
    signal: "Core business subsidizing $4B/year hardware and platform losses",
    outcome: {
      returnPct: -36,
      summary:
        "Headset sales disappointed even at lower price. User counts stagnated. Investors lost patience with the pace of cash burn for an unproven platform. Stock fell 36%.",
      idealAction: "PASS",
      idealRationale:
        "Burning $4B/year on a platform with 500K users against a 50M target is not a rounding error — it's a failed thesis. The hardware discount doesn't fix an adoption problem driven by a lack of compelling use cases.",
    },
  },
  // ── sc-051 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-051",
    ticker: "BLDN",
    company: "Baldwin Industrial Supply",
    sector: "Industrial Distribution",
    description:
      "Distributor of MRO (maintenance, repair, operations) supplies to manufacturers. Boring business, exceptional capital discipline.",
    price: 48.0,
    revenueGrowthPct: 6,
    peRatio: 13,
    profitMarginPct: 11,
    headlines: [
      "Special dividend of $4/share announced — equivalent to 8.3% of stock price",
      "Buyback has reduced share count 22% over 5 years",
    ],
    signal: "Trades at 8% free cash flow yield — below intrinsic value by most methods",
    outcome: {
      returnPct: 18,
      summary:
        "Capital return program drew value-oriented institutional interest. Special dividend attracted income buyers. Multiple expanded as capital discipline became recognized. Total return 18% including dividend.",
      idealAction: "BUY",
      idealRationale:
        "Boring compounders with disciplined capital allocation trading below intrinsic value are the bedrock of value investing. 8% FCF yield + special dividend + shrinking share count is the setup.",
    },
  },
  // ── sc-052 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-052",
    ticker: "MRGT",
    company: "Pinnacle Mortgage Trust",
    sector: "Mortgage REIT",
    description:
      "Agency mortgage REIT investing in government-backed MBS. Highly sensitive to interest rate spreads. Dividend yield at 11.4%.",
    price: 14.2,
    revenueGrowthPct: -11,
    peRatio: 0,
    profitMarginPct: 19,
    headlines: [
      "Fed signals rate cuts may begin within 12 months — positive for MBS spreads",
      "Book value per share has declined 28% over the past 2 years as rates rose",
    ],
    signal: "Spread compression risk if rates stay higher for longer",
    outcome: {
      returnPct: 6,
      summary:
        "Rate cut expectations drove MBS spread improvement. Book value partially recovered. Dividend maintained. Modest positive return as uncertainty persisted.",
      idealAction: "HOLD",
      idealRationale:
        "Mortgage REITs are interest rate bets, not equity investments. If you already own it and believe rates are peaking, HOLD for the spread improvement. Initiating a new position here is speculation on timing — not thesis-driven.",
    },
  },
  // ── sc-053 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-053",
    ticker: "IPOX",
    company: "Drylab Technologies",
    sector: "Enterprise Software (Recent IPO)",
    description:
      "Developer tools company IPO'd 8 months ago at $32/share. Institutional lockup expiry hits in 60 days.",
    price: 29.5,
    revenueGrowthPct: 41,
    peRatio: 0,
    profitMarginPct: -28,
    headlines: [
      "Lockup expiry in 60 days — insiders and VC backers hold 68% of shares",
      "ARR growth strong at 41%, but S&M spend is 90% of revenue",
    ],
    signal: "No insider purchases on the open market since IPO",
    outcome: {
      returnPct: -31,
      summary:
        "Insider selling began immediately at lockup expiry. 18M shares hit the market over 45 days. Stock fell 31% before finding a new equilibrium.",
      idealAction: "PASS",
      idealRationale:
        "Lockup expiries create mechanical supply. 68% insider ownership with no open-market buying means those holders are waiting to sell, not waiting to own more. This is a known, dated event — wait for the flush.",
    },
  },
  // ── sc-054 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-054",
    ticker: "SPRX",
    company: "Spectra Pharma Solutions",
    sector: "Specialty Pharmaceuticals",
    description:
      "Owner of a critical injectable antibiotic. Raised the drug's price 650% two years ago. Now the most-scrutinized drug in Congress.",
    price: 38.0,
    revenueGrowthPct: -14,
    peRatio: 11,
    profitMarginPct: 16,
    headlines: [
      "Congress subpoenas pricing records; CEO called to testify next month",
      "Generic manufacturer files Abbreviated New Drug Application for competing formulation",
    ],
    signal: "90% of revenue from the single drug at issue",
    outcome: {
      returnPct: -40,
      summary:
        "Generic ANDA approved faster than expected. Congressional pressure led to a negotiated price rollback. Drug revenue collapsed. Stock fell 40%.",
      idealAction: "PASS",
      idealRationale:
        "When 90% of revenue depends on a single drug facing both political pressure AND a generic competitor, the business model is the risk. Cheap P/E doesn't matter if the earnings are about to disappear.",
    },
  },
  // ── sc-055 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-055",
    ticker: "GCNS",
    company: "Gamecorp Systems",
    sector: "Gaming Hardware",
    description:
      "Consumer electronics company in a console transition year. Current-gen hardware in decline; next-gen launch 9 months away.",
    price: 42.0,
    revenueGrowthPct: -9,
    peRatio: 18,
    profitMarginPct: 8,
    headlines: [
      "Current-gen hardware sales down 31% — last cycle before next-gen replaces it",
      "Next-gen pre-order waitlist opens — 2.1M reservations in first 48 hours",
    ],
    signal: "Software attach rate highest in company history despite hardware decline",
    outcome: {
      returnPct: 5,
      summary:
        "Hardware revenue declined as expected. Software and services held up well. Pre-launch excitement built. Stock drifted slightly positive — transition year played out as projected.",
      idealAction: "HOLD",
      idealRationale:
        "Console transition years are textbook HOLD setups: the current cycle looks bad (hardware decline) and the next cycle looks exciting (pre-orders). The value is the installed base and software revenue bridge.",
    },
  },
  // ── sc-056 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-056",
    ticker: "PYMT",
    company: "Irongate Payments",
    sector: "Payment Processing",
    description:
      "Merchant acquiring and payment processing network. Handles $380B in annual payment volume. Low glamour, consistent execution.",
    price: 88.0,
    revenueGrowthPct: 9,
    peRatio: 18,
    profitMarginPct: 26,
    headlines: [
      "Payment volume grows 9% — in line with nominal GDP; margins expand 60bps",
      "No major product announcements — quiet quarter with no surprises",
    ],
    signal: "Has compounded at 14% annually for 10 years with no down year",
    outcome: {
      returnPct: 13,
      summary:
        "Continued compounding without fanfare. Volume growth, margin expansion, and steady buyback delivered 13% total return. No headline needed.",
      idealAction: "BUY",
      idealRationale:
        "A payment network is infrastructure — it earns a small toll on every transaction. 10 years of 14% compounding with no down year at 18x earnings is a quality business at a fair price.",
    },
  },
  // ── sc-057 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-057",
    ticker: "FLTX",
    company: "FleetCore Software",
    sector: "Niche B2B SaaS (Fleet)",
    description:
      "Fleet management and compliance software for commercial trucking companies. Switching costs are high — customers average 6.2 years.",
    price: 52.0,
    revenueGrowthPct: 17,
    peRatio: 27,
    profitMarginPct: 22,
    headlines: [
      "Wins largest contract in company history — 12,000 vehicles at a national logistics firm",
      "New DOT compliance mandate drives record inbound sales inquiries",
    ],
    signal: "Gross revenue retention: 97%; net retention: 111%",
    outcome: {
      returnPct: 24,
      summary:
        "DOT mandate drove a pull-forward in the sales cycle. Large contract began contributing to ARR. Net retention stayed above 110%. Stock up 24%.",
      idealAction: "BUY",
      idealRationale:
        "97% gross retention with 6-year average tenure means the moat is real. A regulatory mandate creating pull-forward demand on top of organic compounding is an unusual combination of quality and catalyst.",
    },
  },
  // ── sc-058 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-058",
    ticker: "VDCO",
    company: "Veedoo Commerce",
    sector: "Social Commerce",
    description:
      "Short-video platform adding in-app shopping. Strong user engagement; attempted to build a TikTok Shop equivalent in Western markets.",
    price: 9.8,
    revenueGrowthPct: 55,
    peRatio: 0,
    profitMarginPct: -88,
    headlines: [
      "Monthly active users hit 85M — up 55% year-over-year",
      "Commerce GMV: $190M last quarter — far below $2B target set 18 months ago",
    ],
    signal: "Average order value $14 — users browsing, not buying",
    outcome: {
      returnPct: -40,
      summary:
        "Commerce GMV stagnated. Advertising yield too low to sustain operating losses. Had to cut headcount 40% and slow expansion. Growth investors exited. Stock fell 40%.",
      idealAction: "PASS",
      idealRationale:
        "User growth and commerce GMV are completely different businesses. 85M users generating $190M GMV = $0.75 per user per quarter. That's not social commerce — that's a failed monetization experiment.",
    },
  },
  // ── sc-059 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-059",
    ticker: "CSHP",
    company: "Pacific Container Lines",
    sector: "Container Shipping",
    description:
      "Asia-Pacific container shipping operator. Spot freight rates collapsed 80% from 2022 peak; now showing signs of stabilization.",
    price: 18.5,
    revenueGrowthPct: -38,
    peRatio: 6,
    profitMarginPct: 14,
    headlines: [
      "Spot container rates up 12% month-over-month — 3rd consecutive increase",
      "New vessel order book 2022-vintage deliveries complete — no new supply entering for 24 months",
    ],
    signal: "Industry capacity utilization rising: 84% → 88% → 91% over 3 quarters",
    outcome: {
      returnPct: 29,
      summary:
        "Rate recovery proved durable. Tight supply and resilient volumes pushed rates up 35% over the following two quarters. Stock re-rated from 6x to 9x trough earnings.",
      idealAction: "BUY",
      idealRationale:
        "Shipping is a classic commodity cycle. When capacity is absorbed, supply is constrained for 2+ years, AND rates have already troughed — you're at the entry point. P/E of 6 on trough earnings becomes much lower on normalized earnings.",
    },
  },
  // ── sc-060 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-060",
    ticker: "MCRX",
    company: "CareFirst Managed Health",
    sector: "Managed Care",
    description:
      "National health insurance company. Medical cost ratio elevated last year due to deferred-care catch-up. Now trending toward historical norms.",
    price: 156.0,
    revenueGrowthPct: 8,
    peRatio: 16,
    profitMarginPct: 5,
    headlines: [
      "Medical loss ratio: 87.2% vs 89.1% last year — improvement on track",
      "Membership growth 8%; employer group segment winning market share",
    ],
    signal: "Next year's premium rates set 14% above medical cost trend",
    outcome: {
      returnPct: 9,
      summary:
        "MLR improvement continued. Premium pricing cushion held. Membership growth was better than expected in employer group. Steady, unexciting 9% return.",
      idealAction: "HOLD",
      idealRationale:
        "Managed care at a fair multiple with a recovering MLR is a boring hold. The normalization thesis is playing out but is already partially reflected in the price at 16x earnings.",
    },
  },
  // ── sc-061 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-061",
    ticker: "AXBD",
    company: "Axbridge Defense Systems",
    sector: "Defense & Aerospace",
    description:
      "Mid-size defense contractor specializing in electronic warfare systems and drone countermeasures. Just won a 5-year $2.1B Navy contract.",
    price: 74.0,
    revenueGrowthPct: 18,
    peRatio: 21,
    profitMarginPct: 14,
    headlines: [
      "$2.1B Navy contract win — largest in company history, 5-year duration",
      "Global defense budgets rising; NATO members accelerating drone-defense spending",
    ],
    signal: "Backlog-to-revenue ratio now 3.8x — revenue is locked in for years",
    outcome: {
      returnPct: 26,
      summary:
        "Contract began contributing to revenue ahead of schedule. Additional allied-nation orders followed the Navy win. Defense budget tailwinds held. Stock up 26%.",
      idealAction: "BUY",
      idealRationale:
        "A 3.8x backlog-to-revenue ratio means the next 3+ years of revenue are already contracted. Combined with secular defense budget growth and a just-won flagship contract, this is visible compounding with a catalyst.",
    },
  },
  // ── sc-062 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-062",
    ticker: "VOLT",
    company: "Voltara Motors",
    sector: "Electric Vehicles",
    description:
      "EV startup that began delivering its first consumer pickup truck 6 months ago. Has 180,000 reservations but production is running 40% below guidance.",
    price: 16.5,
    revenueGrowthPct: 0,
    peRatio: 0,
    profitMarginPct: -210,
    headlines: [
      "Production shortfall: 4,200 trucks delivered vs 7,000 guided — blames battery supplier",
      "Cash runway: 14 months at current burn rate without additional financing",
    ],
    signal: "CEO sold $8M of personal shares last month",
    outcome: {
      returnPct: -52,
      summary:
        "Production ramp failed to recover. Raised equity at a steep discount, diluting existing shareholders 35%. CEO departure announced. Stock fell 52%.",
      idealAction: "PASS",
      idealRationale:
        "14 months of cash runway with a missed production ramp and insider selling is a distress signal, not a dip. Execution risk at an EV startup is existential — the thesis depends on a ramp that isn't happening.",
    },
  },
  // ── sc-063 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-063",
    ticker: "CRBX",
    company: "Carbone Steakhouse Group",
    sector: "Casual Dining",
    description:
      "Upscale casual dining chain with 340 locations. Suffered through two years of negative same-store sales as consumers traded down. Now showing reversal.",
    price: 28.0,
    revenueGrowthPct: 7,
    peRatio: 16,
    profitMarginPct: 8,
    headlines: [
      "Same-store sales +4.2% — first positive quarter in 9 quarters",
      "Menu pricing +3.8% with no material traffic decline — elasticity better than feared",
    ],
    signal: "Labor cost as % of revenue down 180bps as efficiency program takes hold",
    outcome: {
      returnPct: 21,
      summary:
        "Same-store sales recovery continued. Margin expansion from labor efficiency proved durable. Multiple re-rated from trough on improving fundamentals. Stock up 21%.",
      idealAction: "BUY",
      idealRationale:
        "A restaurant stock at trough multiple with the first positive SSS in 9 quarters is a classic early-cycle recovery. When pricing holds AND efficiency is improving, operating leverage kicks in hard.",
    },
  },
  // ── sc-064 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-064",
    ticker: "HMBD",
    company: "Heartland Homebuilders",
    sector: "Homebuilding",
    description:
      "National homebuilder focused on entry-level and move-up homes in Sun Belt markets. Mortgage rates have fallen 90bps over the past 3 months.",
    price: 112.0,
    revenueGrowthPct: 14,
    peRatio: 10,
    profitMarginPct: 12,
    headlines: [
      "Mortgage rate decline drives traffic to model homes up 38% month-over-month",
      "Order backlog up 22% quarter-over-quarter — cancellation rate falls to 11%",
    ],
    signal: "Land bank covers 4.2 years of supply at current pace — locked in below-market",
    outcome: {
      returnPct: 33,
      summary:
        "Rate-sensitive demand proved highly elastic to the downside in mortgage rates. Backlog converted into closings. Land cost advantage drove margin expansion. Stock re-rated sharply.",
      idealAction: "BUY",
      idealRationale:
        "Homebuilders at trough P/E with falling rates, rising traffic, and a locked-in land bank are textbook cyclical recoveries. The 10x earnings multiple prices in the trough — not the recovery.",
    },
  },
  // ── sc-065 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-065",
    ticker: "SHLD",
    company: "Keystone Insurance Group",
    sector: "Property & Casualty Insurance",
    description:
      "Commercial P&C insurer. 2023 was a catastrophe-loss year — hurricane and wildfire claims hit hard. Rates have since been repriced materially higher.",
    price: 58.0,
    revenueGrowthPct: 11,
    peRatio: 13,
    profitMarginPct: 9,
    headlines: [
      "Combined ratio improves to 94.2 from 106.1 last year — underwriting profitable again",
      "Premium rate increases averaging 18% on renewals — clients accepting without major churn",
    ],
    signal: "Investment income up 31% as reinvestment yields benefit from higher rates",
    outcome: {
      returnPct: 24,
      summary:
        "Underwriting profitability held. Rate increases proved sticky. Investment income continued to benefit from high-rate environment. Reserve releases added to earnings. Stock up 24%.",
      idealAction: "BUY",
      idealRationale:
        "Post-catastrophe pricing cycles in insurance are powerful and sticky. When combined ratio recovers AND investment income is a tailwind AND rates are still rising on renewals, it's a compounding setup.",
    },
  },
  // ── sc-066 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-066",
    ticker: "BNPL",
    company: "Splitpay Financial",
    sector: "Buy-Now-Pay-Later / Fintech",
    description:
      "Consumer lending fintech offering zero-interest installment loans at point of sale. Funded merchant discount fees. Rapid growth but credit quality deteriorating.",
    price: 8.4,
    revenueGrowthPct: 34,
    peRatio: 0,
    profitMarginPct: -44,
    headlines: [
      "30-day delinquencies rise to 4.8% — up from 2.9% a year ago",
      "Merchant GMV up 34%, but funding costs rising as warehouse line rates reprice",
    ],
    signal: "Charge-off reserves below industry norm for the credit quality of borrowers served",
    outcome: {
      returnPct: -48,
      summary:
        "Delinquency worsened to 6.4%. Reserve build required a large capital raise. Merchant partnerships at risk as credit losses became visible. Stock fell 48%.",
      idealAction: "PASS",
      idealRationale:
        "BNPL is an interest-rate-sensitive consumer credit business in disguise. Rising funding costs + rising delinquencies + under-reserved = a bad risk/reward. GMV growth doesn't matter if the credit is impaired.",
    },
  },
  // ── sc-067 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-067",
    ticker: "NRGY",
    company: "Cascade Utilities",
    sector: "Electric Utility",
    description:
      "Regulated electric utility serving 1.4M customers in the Pacific Northwest. Rate case pending before state regulator. Dividend yield 4.1%.",
    price: 44.0,
    revenueGrowthPct: 4,
    peRatio: 17,
    profitMarginPct: 13,
    headlines: [
      "Rate case filing requests 9.2% increase — decision expected in 4 months",
      "Data center load growth in service territory up 3x — driving capex investment cycle",
    ],
    signal: "Regulatory track record: last 4 rate cases approved within 2% of request",
    outcome: {
      returnPct: 8,
      summary:
        "Rate case approved at 8.1% — near the requested amount. Data center load growth pulled forward capex, boosting the rate base. Stable compounder returned 8% including dividend.",
      idealAction: "HOLD",
      idealRationale:
        "A regulated utility with a strong regulatory track record is a low-volatility hold. The data center tailwind is real but already factored into analyst models. At 17x earnings, it's fairly valued — collect the dividend and hold.",
    },
  },
  // ── sc-068 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-068",
    ticker: "DREX",
    company: "Drillex Energy",
    sector: "Oil & Gas E&P",
    description:
      "Mid-size oil exploration and production company in the Permian Basin. Heavily leveraged after acquiring a competitor at peak oil prices in 2022.",
    price: 9.2,
    revenueGrowthPct: -18,
    peRatio: 6,
    profitMarginPct: 11,
    headlines: [
      "WTI crude price falls to $62/barrel — below the $71 breakeven on acquired assets",
      "Net debt/EBITDA ratio: 4.2x — covenant triggers if EBITDA falls another 15%",
    ],
    signal: "Hedges covering only 30% of production — majority exposed to spot prices",
    outcome: {
      returnPct: -38,
      summary:
        "Oil prices remained weak. EBITDA fell further, triggering covenant discussions. Asset sale announced at a distressed price. Dilutive equity raise followed. Stock fell 38%.",
      idealAction: "PASS",
      idealRationale:
        "4.2x leverage with inadequate hedging at below-breakeven commodity prices is a financial distress setup. A low P/E in a commodity business with covenant risk isn't cheap — it's pricing in potential dilution or restructuring.",
    },
  },
  // ── sc-069 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-069",
    ticker: "LVMG",
    company: "Maison Luxe Holdings",
    sector: "Luxury Goods",
    description:
      "European luxury conglomerate with brands across leather goods, watches, and spirits. China is 38% of revenue and recovering post-lockdowns.",
    price: 186.0,
    revenueGrowthPct: 16,
    peRatio: 24,
    profitMarginPct: 22,
    headlines: [
      "China organic revenue growth +28% — wealthiest consumers returning fastest",
      "Flagship leather goods brand raises average selling price 9% with no volume pushback",
    ],
    signal: "Pricing power intact: no promotional activity in 5 years across core brands",
    outcome: {
      returnPct: 19,
      summary:
        "China recovery continued to outpace expectations. Price increases held. Gross margin expanded 120bps. Luxury is a business where aspirational demand transcends economic cycles.",
      idealAction: "BUY",
      idealRationale:
        "True luxury brands have pricing power that most businesses can't replicate. China recovery + proven ASP increases + 5-year promotion-free history = a durable compounder with a near-term catalyst.",
    },
  },
  // ── sc-070 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-070",
    ticker: "HOSPX",
    company: "Meridian Health Systems",
    sector: "Hospital / Health System",
    description:
      "For-profit hospital chain operating 47 facilities. Medicare reimbursement rates updated annually by CMS — this year's update came in below medical cost inflation.",
    price: 66.0,
    revenueGrowthPct: 6,
    peRatio: 14,
    profitMarginPct: 5,
    headlines: [
      "CMS reimbursement update: +2.9% vs medical cost inflation running at 5.4%",
      "Labor costs rising faster than revenue — contract nursing staff still 18% of workforce",
    ],
    signal: "Uncompensated care (charity + bad debt) rising as a % of revenue",
    outcome: {
      returnPct: -16,
      summary:
        "Reimbursement-cost spread continued to compress. Labor costs didn't normalize as fast as management projected. Earnings estimate cut twice. Stock fell 16%.",
      idealAction: "PASS",
      idealRationale:
        "When your largest payer (government) is reimbursing below your cost inflation and you can't exit those contracts, the P&L math works against you. A 14x P/E on earnings that are structurally under pressure isn't cheap.",
    },
  },
  // ── sc-071 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-071",
    ticker: "CLWD",
    company: "Cumulus Cloud Platform",
    sector: "Cloud Infrastructure (IaaS)",
    description:
      "Enterprise cloud infrastructure provider competing with the hyperscalers in specific regulated-industry verticals. Grew fast, then over-hired. Now restructuring.",
    price: 38.0,
    revenueGrowthPct: 22,
    peRatio: 0,
    profitMarginPct: -8,
    headlines: [
      "Headcount reduced 19% — annualized savings of $340M against a $2.1B cost base",
      "Remaining customers churning at lower rates — net retention improves to 108% from 98%",
    ],
    signal: "Rule of 40 score: 14 pre-restructuring → projected 30+ post-restructuring",
    outcome: {
      returnPct: 38,
      summary:
        "Cost savings materialized faster than expected. Net retention improvement was real — customer quality improved as growth-at-any-cost era ended. Stock re-rated as profitability path became credible.",
      idealAction: "BUY",
      idealRationale:
        "A restructuring story with real revenue retention and a clear path to Rule of 40 compliance is a high-conviction setup if you believe the savings are structural. Net retention going from 98% to 108% is the key signal — the core business is healthy.",
    },
  },
  // ── sc-072 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-072",
    ticker: "AGRI",
    company: "Greenfield Crop Sciences",
    sector: "Agricultural Inputs",
    description:
      "Producer of crop protection chemicals and seeds. Corn and soy farmers are under margin pressure as commodity prices fall from multi-year highs.",
    price: 84.0,
    revenueGrowthPct: -9,
    peRatio: 12,
    profitMarginPct: 16,
    headlines: [
      "Channel destocking continues — distributors working through excess 2023 inventory",
      "New herbicide-resistant seed trait platform receives EPA approval — first new mode of action in 15 years",
    ],
    signal: "Destocking cycle typically lasts 3–4 quarters; now in quarter 3",
    outcome: {
      returnPct: 14,
      summary:
        "Destocking began to clear in Q4 as expected. New seed trait drove early adoption interest. Revenue decline moderated and investor focus shifted to 2025 recovery. Stock up 14%.",
      idealAction: "HOLD",
      idealRationale:
        "Agricultural input companies are deeply cyclical. Near trough earnings with a known destocking end-date and a new product catalyst is a HOLD with upside optionality — not a definitive BUY until the cycle turns confirmed.",
    },
  },
];

/** Deterministic daily scenario picker — same day = same scenario. */
export function getTodayScenario(): Scenario {
  const d = new Date();
  const dayKey = Number(`${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`);
  return SCENARIOS[dayKey % SCENARIOS.length];
}

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
