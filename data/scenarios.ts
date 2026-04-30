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
  // ── sc-073 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-073",
    ticker: "PEAK",
    company: "Summit Outdoor Retail",
    sector: "Specialty Retail (Sporting Goods)",
    description:
      "National outdoor sporting goods chain. Pandemic demand pulled forward 3 years of sales; the industry spent 2023 digesting inventory bloat.",
    price: 31.0,
    revenueGrowthPct: 4,
    peRatio: 11,
    profitMarginPct: 7,
    headlines: [
      "Inventory days normalize to pre-COVID levels for first time in 3 years",
      "Comparable store sales +3.2% — first positive quarter after five negative ones",
    ],
    signal: "Promotional activity (discounting) ending; full-price selling rate returning",
    outcome: {
      returnPct: 17,
      summary:
        "Margin recovery kicked in faster than expected as discounting ended. Same-store sales sustained positive trend. Multiple expanded from 11x to 14x as the turnaround was confirmed.",
      idealAction: "BUY",
      idealRationale:
        "Inventory clearance complete + comp sales turning positive + promotional headwinds ending is the classic retail inflection setup. Buying at trough margins with evidence of recovery is the opportunity.",
    },
  },
  // ── sc-074 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-074",
    ticker: "LFIN",
    company: "Sentinel Life Holdings",
    sector: "Life Insurance",
    description:
      "Life insurance holding company with $48B in assets. Bond portfolio heavily weighted toward investment-grade corporate bonds.",
    price: 58.0,
    revenueGrowthPct: 6,
    peRatio: 8,
    profitMarginPct: 12,
    headlines: [
      "New money investment yield: 5.8% — highest in 15 years as bonds reprice higher",
      "Book value per share grew 9% year-over-year as bond portfolio recovers",
    ],
    signal: "Trading at 0.72x book value — historically cheap for the quality of this liability book",
    outcome: {
      returnPct: 21,
      summary:
        "Rising yields continued to improve investment income. Book value recovery was faster than modeled. Multiple re-rated as the rate tailwind became undeniable. Stock up 21%.",
      idealAction: "BUY",
      idealRationale:
        "Life insurers are bond businesses in disguise. When rates rise, their new money earns more — and if they're trading below book value, you're buying those bonds at a discount. Both conditions were met here.",
    },
  },
  // ── sc-075 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-075",
    ticker: "TELX",
    company: "Broadline Communications",
    sector: "Legacy Telecom",
    description:
      "National wireless and wireline carrier. An 8.4% dividend yield is drawing income-oriented investors despite persistent subscriber losses.",
    price: 16.8,
    revenueGrowthPct: -2,
    peRatio: 9,
    profitMarginPct: 14,
    headlines: [
      "Dividend maintained at $1.41/share — management 'committed to the return'",
      "Net wireless subscriber losses: -380,000 — fourth consecutive quarter of losses",
    ],
    signal: "Dividend payout ratio exceeds free cash flow; debt-to-EBITDA at 4.1x",
    outcome: {
      returnPct: -28,
      summary:
        "Dividend cut 40% as free cash flow couldn't sustain it at high debt levels. Subscriber losses accelerated. The high yield was a warning, not a reward. Stock fell 28%.",
      idealAction: "PASS",
      idealRationale:
        "When a dividend payout exceeds free cash flow and debt is 4x EBITDA, the yield is warning you that it's unsustainable — not paying you to hold. An 8% yield on a shrinking business is math, not income.",
    },
  },
  // ── sc-076 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-076",
    ticker: "RBOT",
    company: "Nexera Robotics",
    sector: "Industrial Automation",
    description:
      "Manufacturer of robotic assembly systems for automotive and electronics plants. Reshoring narrative has driven significant investor interest.",
    price: 94.0,
    revenueGrowthPct: 16,
    peRatio: 34,
    profitMarginPct: 14,
    headlines: [
      "Order backlog up 41% year-over-year — US manufacturing reshoring fueling demand",
      "Gross margins expanding: 14% → 17% as software licensing grows as a share of revenue",
    ],
    signal: "Forward P/E of 34x already prices in 3+ years of strong execution at current growth rates",
    outcome: {
      returnPct: 6,
      summary:
        "Revenue beat estimates but P/E compression offset the gain. Quality business, right thesis — but the valuation had fully priced the good news. Stock up a modest 6%.",
      idealAction: "HOLD",
      idealRationale:
        "The reshoring thesis is real and the business is executing well — but at 34x forward earnings, the market already knows. A great company at a full price returns roughly its earnings growth rate. HOLD, don't add aggressively.",
    },
  },
  // ── sc-077 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-077",
    ticker: "TRVL",
    company: "Horizons Travel Group",
    sector: "Online Travel Agency",
    description:
      "Global hotel and flight booking platform. Leisure travel has fully recovered; corporate travel is still catching up.",
    price: 112.0,
    revenueGrowthPct: 28,
    peRatio: 22,
    profitMarginPct: 18,
    headlines: [
      "International bookings at 114% of 2019 levels — leisure travel fully recovered",
      "Corporate travel at 74% of pre-COVID — 'significant runway remaining,' says CEO",
    ],
    signal: "Operating margins recovering toward pre-COVID peak of 23% — leverage kicking in",
    outcome: {
      returnPct: 26,
      summary:
        "Corporate travel recovery continued to 81% of pre-COVID. Margins beat on operating leverage. International sustained. Stock up 26% as multiple catalysts played out.",
      idealAction: "BUY",
      idealRationale:
        "Full leisure recovery plus corporate still 26% below peak plus operating leverage is multiple sources of upside in one stock. When the path to recovery is clear and the market hasn't fully priced it, act.",
    },
  },
  // ── sc-078 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-078",
    ticker: "SNKF",
    company: "Creston Brands",
    sector: "Branded Consumer Staples (Food)",
    description:
      "Snack food and condiments portfolio. Four consecutive years of 7–9% price increases have kept revenue growing — but volumes are now falling.",
    price: 44.0,
    revenueGrowthPct: 3,
    peRatio: 20,
    profitMarginPct: 13,
    headlines: [
      "Volume down 4.1% as consumers trade down to private label alternatives",
      "Management announces 'affordability initiative' — pricing paused for two quarters",
    ],
    signal: "Private label gained 2.8 share points in core snack categories last year",
    outcome: {
      returnPct: 4,
      summary:
        "Volume stabilized at a lower level as pricing paused. Margins held. Private label share gains plateaued but didn't reverse. Muddled through with a modest 4% return.",
      idealAction: "HOLD",
      idealRationale:
        "Pricing-power brands that over-raise prices face a volume-margin trade-off with no clear winner. The brand moat is real — but you need to see whether volumes recover before adding. Too safe to sell, too uncertain to buy.",
    },
  },
  // ── sc-079 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-079",
    ticker: "NBNK",
    company: "Flare Financial",
    sector: "Neobank / Fintech Lending",
    description:
      "Mobile-first digital bank expanding from checking accounts into personal loans. Loan book tripled in 18 months.",
    price: 18.5,
    revenueGrowthPct: 42,
    peRatio: 0,
    profitMarginPct: -18,
    headlines: [
      "Loan originations up 3x year-over-year — credit product gaining rapid adoption",
      "Net charge-off rate: 9.2% vs 6.5% model assumption disclosed at IPO",
    ],
    signal: "Loan loss reserves increased 80% quarter-over-quarter; management calls it 'temporary normalization'",
    outcome: {
      returnPct: -44,
      summary:
        "Charge-off rate climbed to 12.4% over the next two quarters. Credit product paused. Funding costs rose as institutional investors pulled back. Stock fell 44%.",
      idealAction: "PASS",
      idealRationale:
        "When a lender's actual loss rate is 40% above their disclosed model assumption after just 18 months, the model is wrong — not the losses. New lenders with no credit cycle experience underestimate default rates consistently.",
    },
  },
  // ── sc-080 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-080",
    ticker: "AMGR",
    company: "Vantage Asset Management",
    sector: "Active Equity Asset Manager",
    description:
      "Publicly traded traditional active stock-picking firm. Manages $180B in AUM across 40+ mutual funds.",
    price: 28.0,
    revenueGrowthPct: -8,
    peRatio: 10,
    profitMarginPct: 22,
    headlines: [
      "AUM net outflows: $12.4B this quarter — eleventh consecutive quarter of outflows",
      "Expense ratio 1.1% — three times the average comparable passive ETF",
    ],
    signal: "73% of funds underperform their benchmark over 10 years; no performance fee revenue",
    outcome: {
      returnPct: -18,
      summary:
        "Outflows accelerated as passive adoption continued structurally. Fee compression forced headcount cuts. Multiple contracted further as the earnings base eroded. Stock fell 18%.",
      idealAction: "PASS",
      idealRationale:
        "An active manager with 11 straight quarters of AUM outflows and persistent 10-year underperformance is in secular decline, not a cyclical trough. Low P/E reflects earnings that will keep shrinking — that's not value.",
    },
  },
  // ── sc-081 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-081",
    ticker: "OFRC",
    company: "Pinnacle Office Properties",
    sector: "Office REIT",
    description:
      "Owner of Class A office towers in major US cities. Pre-pandemic occupancy was 95%. Remote and hybrid work has permanently changed demand.",
    price: 9.4,
    revenueGrowthPct: -12,
    peRatio: 0,
    profitMarginPct: 8,
    headlines: [
      "Occupancy: 71% — new leases averaging 22% smaller footprint than expiring ones",
      "$1.6B of debt maturing in 18 months — refinancing at rates 280bps higher than current",
    ],
    signal: "Dividend suspended; three tenants representing 19% of leases renewing next year",
    outcome: {
      returnPct: -35,
      summary:
        "Refinancing completed at punitive terms, diluting equity. Occupancy slipped to 67%. Lease renewals came in smaller than expected. Stock fell another 35% from an already depressed level.",
      idealAction: "PASS",
      idealRationale:
        "Structural demand destruction (remote work), a near-term debt refinancing cliff, and concentrated lease roll risk is a three-way squeeze. The dividend is already gone — the equity is still absorbing the impact.",
    },
  },
  // ── sc-082 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-082",
    ticker: "BCST",
    company: "Meridian Media Group",
    sector: "Legacy Media (Cable to Streaming Transition)",
    description:
      "Major cable and broadcast company that launched a streaming platform two years ago. Burning cash on streaming while linear TV declines.",
    price: 22.0,
    revenueGrowthPct: 1,
    peRatio: 11,
    profitMarginPct: 11,
    headlines: [
      "Streaming subscribers +19% — losses narrowing from -$480M to -$290M this year",
      "Linear cable subscribers -9% year-over-year — rate of decline unchanged from prior year",
    ],
    signal: "Streaming breakeven projected in 2–3 years; linear cash flow is funding the transition",
    outcome: {
      returnPct: 7,
      summary:
        "Linear decline tracked expectations. Streaming losses narrowed faster than feared. Market gave partial credit. Modest 7% return with high uncertainty throughout.",
      idealAction: "HOLD",
      idealRationale:
        "The transition math is uncertain but improving. Linear cash flow buys time. At 11x earnings the downside is limited, but streaming economics need another year of data before this becomes a BUY. Too uncertain to add, too cheap to sell.",
    },
  },
  // ── sc-083 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-083",
    ticker: "DLVR",
    company: "Ridgeline Logistics",
    sector: "Last-Mile Delivery",
    description:
      "Parcel and e-commerce last-mile delivery network. Over-hired during the pandemic boom; spent 18 months restructuring the cost base.",
    price: 36.0,
    revenueGrowthPct: 7,
    peRatio: 16,
    profitMarginPct: 8,
    headlines: [
      "Cost per package falls 14% after restructuring — fleet right-sized to volume",
      "E-commerce volumes return to growth trend after two years of post-COVID normalization",
    ],
    signal: "Route density software reduced empty miles 11%; fuel hedges locked in through next year",
    outcome: {
      returnPct: 22,
      summary:
        "Margin expansion beat expectations as the restructuring savings hit simultaneously with volume recovery. Multiple expanded from 16x to 19x. Stock up 22%.",
      idealAction: "BUY",
      idealRationale:
        "A logistics company that just completed a painful cost restructuring at the start of a volume recovery gets a double tailwind: more revenue AND lower unit costs at the same time. That's how logistics companies earn their best returns.",
    },
  },
  // ── sc-084 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-084",
    ticker: "RXPT",
    company: "Crestview Pharma",
    sector: "Specialty Pharma (Patent Cliff)",
    description:
      "Specialty pharmaceutical company. One blockbuster drug generates 78% of revenue. That patent expires in 22 months.",
    price: 41.0,
    revenueGrowthPct: 6,
    peRatio: 7,
    profitMarginPct: 28,
    headlines: [
      "FDA grants 6-month pediatric exclusivity extension — patent cliff delayed to Q2 next year",
      "Pipeline: two Phase 2 candidates, no Phase 3 programs, no NDA filings expected for 3+ years",
    ],
    signal: "Three generic manufacturers have filed ANDAs; first-to-file generic gets 180-day exclusivity",
    outcome: {
      returnPct: -52,
      summary:
        "Generics entered as scheduled. Flagship drug revenue fell 70% in 12 months. Pipeline was too early-stage to offset. Stock fell 52%.",
      idealAction: "PASS",
      idealRationale:
        "A P/E of 7x that disappears when 78% of revenue exits is not a bargain — it's a scheduled event priced in. Patent expirations are calendared, not risks. The extension bought 6 months, not a solution.",
    },
  },
  // ── sc-085 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-085",
    ticker: "APRT",
    company: "Meridian Airport Partners",
    sector: "Infrastructure (Airport Concessions)",
    description:
      "Private operator of four regional airports under 30-year concession agreements. Aeronautical fees are contractually indexed to CPI.",
    price: 48.0,
    revenueGrowthPct: 11,
    peRatio: 24,
    profitMarginPct: 26,
    headlines: [
      "Passenger volumes +11% — summer travel demand exceeds pre-COVID capacity at two hubs",
      "Aeronautical fees auto-escalated 4.8% under CPI clause in concession agreements",
    ],
    signal: "Land bank adjacent to two airports approved for logistics and warehouse development",
    outcome: {
      returnPct: 16,
      summary:
        "Inflation pass-through protected margins automatically. Passenger growth sustained. Development land optionality began to be valued by investors. Stock up 16%.",
      idealAction: "BUY",
      idealRationale:
        "Inflation-indexed revenue, 30-year concessions you can't compete against, and growing passenger volumes is the infrastructure model working exactly as intended. 24x is fair for an asset with this kind of certainty.",
    },
  },
  // ── sc-086 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-086",
    ticker: "GMBL",
    company: "Ironforge Studios",
    sector: "Mobile Gaming",
    description:
      "Publisher of a top-grossing mobile RPG now four years into its lifecycle. The next title is still 12+ months from launch.",
    price: 19.0,
    revenueGrowthPct: -16,
    peRatio: 14,
    profitMarginPct: 19,
    headlines: [
      "Daily active users down 24% year-over-year — player retention declining 'naturally'",
      "New game in development — earliest launch window is Q4 next year",
    ],
    signal: "Average revenue per user still high, but top-spender churn accelerating; live events masking the trend",
    outcome: {
      returnPct: -30,
      summary:
        "DAU and ARPU declined together as the player base aged out. The new game was delayed by six months. Market re-rated on lifecycle decline rather than giving credit for an unreleased title.",
      idealAction: "PASS",
      idealRationale:
        "A live-service game with DAU down 24% is in terminal decline. Revenue is coming from a shrinking pool of high spenders, not from growth. The next game can only be valued when it ships — not 18 months before.",
    },
  },
  // ── sc-087 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-087",
    ticker: "CSEC",
    company: "Vaultron Security",
    sector: "Cybersecurity SaaS",
    description:
      "Provides endpoint detection and identity security. Actively displacing legacy antivirus vendors in mid-market and enterprise accounts.",
    price: 62.0,
    revenueGrowthPct: 34,
    peRatio: 0,
    profitMarginPct: -4,
    headlines: [
      "Net revenue retention: 124% — existing customers expanding to additional modules",
      "Wins largest contract in company history: 85,000 seats at a Fortune 50 manufacturer",
    ],
    signal: "Rule of 40 score: 30 and improving; FCF positive for the first time this quarter",
    outcome: {
      returnPct: 38,
      summary:
        "NRR held above 120% for four consecutive quarters. The Fortune 50 win triggered a competitive displacement cycle at peers. FCF crossed positive and stayed there. Stock up 38%.",
      idealAction: "BUY",
      idealRationale:
        "124% net retention in enterprise security means customers are solving a mission-critical problem and expanding — not just renewing. A -4% margin at 34% growth is controlled investment, not a problem. FCF turning positive removes the last bear argument.",
    },
  },
  // ── sc-088 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-088",
    ticker: "VLTR",
    company: "Voltara Motors",
    sector: "Electric Vehicles",
    description:
      "Designs and manufactures electric trucks targeting commercial fleets. Manufacturing ramp underway at its first gigafactory.",
    price: 18.40,
    revenueGrowthPct: 85,
    peRatio: 0,
    profitMarginPct: -22,
    headlines: [
      "Q3 deliveries miss guidance by 28% — supply chain bottlenecks cited",
      "Cash burn rate implies 9 months of runway at current pace",
    ],
    signal: "Order backlog still 3× current capacity but cancellation rate rising",
    outcome: {
      returnPct: -38,
      summary:
        "A secondary offering at a steep discount diluted shareholders. The gigafactory ramp stalled 18 months. Two quarters later, guidance was cut 40%. Stock fell 38%.",
      idealAction: "PASS",
      idealRationale:
        "85% revenue growth sounds impressive until you see -22% margins and 9 months of cash. A manufacturing ramp with rising cancellations and no profitability path is a cash incinerator. High growth with no execution is just an exciting story.",
    },
  },
  // ── sc-089 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-089",
    ticker: "SHLY",
    company: "Shieldly Security",
    sector: "Cybersecurity SaaS",
    description:
      "Cloud-native identity and access management platform. Protects employee logins and device access for mid-market and enterprise companies.",
    price: 84.0,
    revenueGrowthPct: 42,
    peRatio: 0,
    profitMarginPct: 8,
    headlines: [
      "Net revenue retention hits 127% — upsell attach rate improving every quarter",
      "Land-and-expand motion accelerating: average customer now on 2.4 modules vs 1.6 last year",
    ],
    signal: "FCF turned positive this quarter for the first time",
    outcome: {
      returnPct: 24,
      summary:
        "NRR stayed above 125% for three consecutive quarters. FCF remained positive and expanded. Two large enterprise wins broke into a new vertical. Stock up 24% over the following 3 months.",
      idealAction: "BUY",
      idealRationale:
        "127% NRR means the existing base alone grows revenue without a single new customer. 42% topline growth with FCF turning positive means the growth is beginning to pay for itself. Identity security has near-zero churn — once embedded, it's nearly impossible to remove.",
    },
  },
  // ── sc-090 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-090",
    ticker: "NXGN",
    company: "Nexagen Biotech",
    sector: "Biotechnology",
    description:
      "Clinical-stage biotech developing a gene therapy for a rare pediatric neurological disorder. Phase 3 trial results expected next quarter.",
    price: 22.10,
    revenueGrowthPct: 0,
    peRatio: 0,
    profitMarginPct: -210,
    headlines: [
      "Phase 3 primary endpoint results due in 6 weeks — trial fully enrolled",
      "Cash position covers approximately 14 months of operations",
    ],
    signal: "Lead investigator filed a secondary data patent — raises questions about primary endpoint confidence",
    outcome: {
      returnPct: -52,
      summary:
        "Phase 3 trial missed its primary endpoint. The FDA placed a clinical hold on the program. Stock fell 52% in a single session on the data release.",
      idealAction: "PASS",
      idealRationale:
        "Binary clinical-stage biotechs are not investing — they are gambling. No revenue, 14 months of cash, and a patent filing that suggests the lead investigator may be hedging on the primary endpoint. The risk/reward here is coin-flip, and coins don't belong in a disciplined portfolio.",
    },
  },
  // ── sc-091 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-091",
    ticker: "PNCP",
    company: "Pinnacle Properties REIT",
    sector: "Real Estate",
    description:
      "Office and mixed-use REIT with 42 properties across major US metro areas. Pays a 7.2% dividend yield.",
    price: 31.80,
    revenueGrowthPct: 4,
    peRatio: 18,
    profitMarginPct: 22,
    headlines: [
      "Occupancy rate: 81% — down from 88% two years ago as leases roll over",
      "Fed signals rates to stay higher for longer; refinancing $800M in debt in 18 months",
    ],
    signal: "Three anchor tenants representing 24% of rent have not renewed term sheets",
    outcome: {
      returnPct: -18,
      summary:
        "Two anchor tenants did not renew. Occupancy dropped to 76%. Refinancing costs spiked, compressing dividends. The dividend was cut 35%. Stock fell 18% over 3 months.",
      idealAction: "PASS",
      idealRationale:
        "A 7.2% yield looks attractive until you understand why it's that high. Rising rates hit office REITs from two directions: higher borrowing costs and tenants consolidating space post-pandemic. Anchor tenant uncertainty was the tell — they know before the market does.",
    },
  },
  // ── sc-092 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-092",
    ticker: "TAPF",
    company: "Tapflow Payments",
    sector: "Fintech / Payments",
    description:
      "Embedded payments infrastructure provider. APIs power checkout, invoicing, and payouts for 12,000 software platforms.",
    price: 57.20,
    revenueGrowthPct: 28,
    peRatio: 45,
    profitMarginPct: 18,
    headlines: [
      "Total payment volume up 34% YoY — platform count grew by 900 in the quarter",
      "International expansion launches in 14 new markets next quarter",
    ],
    signal: "Take rate stable at 2.1% despite volume growth — no pricing pressure from competition",
    outcome: {
      returnPct: 19,
      summary:
        "International volumes ramped ahead of schedule. TPV growth accelerated to 38%. The stable take rate confirmed pricing power. Stock up 19% over 3 months.",
      idealAction: "BUY",
      idealRationale:
        "Embedded payments is a winner-take-most market — the more platforms on the network, the stickier it becomes. 28% revenue growth at 18% margins with a stable take rate means they are not buying growth. The international launch is a free option on a larger TAM.",
    },
  },
  // ── sc-093 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-093",
    ticker: "GRMD",
    company: "Graymark Department Stores",
    sector: "Consumer Retail",
    description:
      "Mid-tier department store chain with 340 locations. Management is executing a 'digital-first transformation' strategy.",
    price: 8.90,
    revenueGrowthPct: 2,
    peRatio: 9,
    profitMarginPct: 3,
    headlines: [
      "Same-store sales down 6% — digital channel only 11% of total revenue",
      "'Digital transformation' initiative now in its fourth consecutive year with no material share gain",
    ],
    signal: "Inventory aged 180+ days represents 31% of total stock — markdowns accelerating",
    outcome: {
      returnPct: -25,
      summary:
        "Same-store sales fell a further 8% the following quarter. Markdowns destroyed margins. Two profitable store closures were offset by four unprofitable ones. Stock fell 25%.",
      idealAction: "PASS",
      idealRationale:
        "A 'digital transformation' that has been in year four with 11% digital penetration is not a strategy — it's a press release. Low P/E only matters if earnings are stable. When margins are 3% and aging inventory forces markdowns, that P/E compresses fast.",
    },
  },
  // ── sc-094 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-094",
    ticker: "NGDS",
    company: "Northgard Defense Systems",
    sector: "Aerospace & Defense",
    description:
      "Mid-size defense contractor specializing in unmanned aerial systems and electronic warfare platforms. 80% revenue from long-term government contracts.",
    price: 72.50,
    revenueGrowthPct: 11,
    peRatio: 17,
    profitMarginPct: 11,
    headlines: [
      "Congressional budget adds $2.1B in supplemental defense spending — UAS systems are a priority",
      "Backlog grows to $4.8B — 3.2× annual revenue, providing 3+ years of visibility",
    ],
    signal: "Awarded preferred vendor status for a classified DoD program",
    outcome: {
      returnPct: 21,
      summary:
        "Supplemental defense budget passed with $1.8B allocated to UAS programs. Two new contract awards expanded the backlog. The classified program announcement was confirmed as a $600M win. Stock up 21%.",
      idealAction: "BUY",
      idealRationale:
        "Long-term government contracts mean revenue is essentially guaranteed for years. A 3.2× backlog-to-revenue ratio at a 17× P/E is cheap for the earnings certainty it implies. Defense spending is geopolitically non-discretionary right now — this is a stable compounder with a tailwind.",
    },
  },
  // ── sc-095 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-095",
    ticker: "MRDC",
    company: "Meridian Energy Corp",
    sector: "Oil & Gas",
    description:
      "Independent E&P operator focused on low-cost Permian Basin assets. Generates strong free cash flow at $60+ oil.",
    price: 41.20,
    revenueGrowthPct: 18,
    peRatio: 8,
    profitMarginPct: 14,
    headlines: [
      "Breakeven cost per barrel: $38 — among the lowest in the Permian Basin",
      "Returns 60% of FCF to shareholders via buybacks and dividend",
    ],
    signal: "Hedge book covers only 20% of production — fully exposed to spot prices",
    outcome: {
      returnPct: 26,
      summary:
        "Oil prices held above $75 for the quarter. FCF exceeded estimates. The buyback program retired 4% of shares. Dividend increased 12%. Stock up 26%.",
      idealAction: "BUY",
      idealRationale:
        "A $38 breakeven with oil at $75 generates enormous FCF. At 8× P/E with 60% of FCF returned to shareholders, this is a capital-return story disguised as a value play. The low hedge ratio is a risk but also means full upside participation if oil holds.",
    },
  },
  // ── sc-096 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-096",
    ticker: "PHST",
    company: "Phantomstrike Entertainment",
    sector: "Video Games",
    description:
      "Independent game studio that released a blockbuster title 18 months ago. Now trading on anticipation of a sequel with no confirmed release date.",
    price: 34.60,
    revenueGrowthPct: 120,
    peRatio: 0,
    profitMarginPct: -15,
    headlines: [
      "Sequel announcement delayed — 'creative direction still being finalized'",
      "Monthly active users for the original game down 64% from launch peak",
    ],
    signal: "Lead creative director quietly left the company 6 weeks ago",
    outcome: {
      returnPct: -28,
      summary:
        "The sequel was delayed another 12 months. User decline on the original accelerated. Without a new release, revenue collapsed. Stock fell 28%.",
      idealAction: "PASS",
      idealRationale:
        "120% revenue growth was all from a single launch 18 months ago. DAUs down 64%, creative director gone, sequel delayed — this is a studio with one hit and no pipeline. Game studios without a release schedule are burning time and cash on hope.",
    },
  },
  // ── sc-097 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-097",
    ticker: "CRFH",
    company: "CareFirst Health Systems",
    sector: "Healthcare Services",
    description:
      "Regional hospital operator with 18 acute care facilities. Serves a mix of Medicare, Medicaid, and commercial patients.",
    price: 19.40,
    revenueGrowthPct: 3,
    peRatio: 9,
    profitMarginPct: 4,
    headlines: [
      "CMS proposes 2.8% cut to Medicare reimbursement rates for inpatient procedures",
      "Nursing shortage driving agency labor costs up 22% YoY — no relief in sight",
    ],
    signal: "Two largest facilities flagged for Joint Commission review after patient safety incidents",
    outcome: {
      returnPct: -29,
      summary:
        "The CMS rate cut passed. Agency labor costs accelerated. Two facilities failed their Joint Commission review and required capital investment. Margins contracted to below 1%. Stock fell 29%.",
      idealAction: "PASS",
      idealRationale:
        "Healthcare services companies with thin margins get crushed by any combination of reimbursement cuts and cost pressure. A 4% margin with rising labor costs and a 2.8% reimbursement cut means breakeven or losses. Low P/E on a deteriorating earnings base is a trap.",
    },
  },
  // ── sc-098 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-098",
    ticker: "LLCM",
    company: "Linkloom Commerce",
    sector: "E-commerce Infrastructure",
    description:
      "Commerce enablement platform powering storefronts, logistics, and payments for 80,000 independent merchants.",
    price: 48.80,
    revenueGrowthPct: 38,
    peRatio: 0,
    profitMarginPct: 6,
    headlines: [
      "GMV grew 44% YoY — merchants on platform now represent $12B in annualized sales",
      "New fulfillment partnership cuts average shipping costs 18% for platform merchants",
    ],
    signal: "Merchant churn rate: 3.2% annually — among the lowest in the sector",
    outcome: {
      returnPct: 29,
      summary:
        "GMV growth accelerated to 49% following the fulfillment launch. Merchant count crossed 100,000. The low churn rate compressed further to 2.8%. Operating leverage drove margins toward double digits. Stock up 29%.",
      idealAction: "BUY",
      idealRationale:
        "3.2% annual churn in commerce infrastructure is extraordinarily sticky — merchants build their entire business on this stack. 38% topline growth with improving margins means operating leverage is kicking in. The fulfillment partnership adds a moat, not just a feature.",
    },
  },
  // ── sc-099 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-099",
    ticker: "SKBD",
    company: "Skybound Airways",
    sector: "Airlines",
    description:
      "Low-cost domestic carrier operating 180 routes. Emerged from pandemic restructuring with a leaner cost structure.",
    price: 14.20,
    revenueGrowthPct: 22,
    peRatio: 14,
    profitMarginPct: 8,
    headlines: [
      "Load factor hits 88% for the quarter — highest in 5 years",
      "Jet fuel hedged at $2.18/gallon for next 6 months — spot at $2.65",
    ],
    signal: "Pilots contract renewal due in 3 months — union publicly rejecting management's offer",
    outcome: {
      returnPct: 15,
      summary:
        "Load factors held at 87% for the following quarter. Fuel hedges protected margins as spot prices rose to $2.90. The pilot contract was settled at a higher cost than modeled but still within guidance. Stock up 15%.",
      idealAction: "BUY",
      idealRationale:
        "88% load factor in a lean cost structure generates strong cash flow. Fuel hedges at $2.18 vs spot $2.65 are a tangible near-term tailwind. The pilot contract is a real risk but the market was pricing in a worst-case scenario that didn't materialise.",
    },
  },
  // ── sc-100 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-100",
    ticker: "CLRB",
    company: "Clearwater Beverages",
    sector: "Consumer Staples",
    description:
      "Premium water and functional beverage brand sold in 140,000 retail doors across North America. 82% household penetration in its core markets.",
    price: 44.10,
    revenueGrowthPct: 5,
    peRatio: 22,
    profitMarginPct: 14,
    headlines: [
      "Price increases of 6% held with no volume loss — elasticity lower than historical average",
      "Private-label beverage sales up industry-wide — but premium segment holding share",
    ],
    signal: "New electrolyte line launching in convenience channel next quarter",
    outcome: {
      returnPct: 8,
      summary:
        "The electrolyte line launched successfully, adding 3% to revenue. Price increases continued to hold. Market share remained stable. Steady as expected. Stock up 8%.",
      idealAction: "HOLD",
      idealRationale:
        "A premium beverage brand at 22× P/E with 5% growth and 14% margins is not cheap enough to pound the table on, but it is exactly what you hold. The pricing power is real — 6% increases with no volume loss is the definition of a brand moat.",
    },
  },
  // ── sc-101 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-101",
    ticker: "RDSI",
    company: "Radiant Solar Industries",
    sector: "Clean Energy",
    description:
      "Manufactures and installs utility-scale solar panels. Revenue growing rapidly as solar capacity globally expands.",
    price: 26.80,
    revenueGrowthPct: 45,
    peRatio: 0,
    profitMarginPct: -8,
    headlines: [
      "Panel prices fell 38% over the past 12 months — Chinese manufacturers flooding the market",
      "Gross margin contracted from 22% to 11% in two quarters as ASPs collapse",
    ],
    signal: "CEO sold $4.2M in shares last month citing 'portfolio diversification'",
    outcome: {
      returnPct: -24,
      summary:
        "Panel price erosion continued. Gross margin turned negative. The company announced a $200M equity raise at a 22% discount. CEO resignation followed. Stock fell 24%.",
      idealAction: "PASS",
      idealRationale:
        "A commoditising manufacturing market: when Chinese supply floods in and gross margins halve in two quarters, the trend doesn't reverse. Revenue growth in a market with collapsing ASPs is meaningless — you're growing yourself into losses. The CEO sale was the tell.",
    },
  },
  // ── sc-102 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-102",
    ticker: "PRXS",
    company: "Praxis Software",
    sector: "Enterprise Software",
    description:
      "ERP software vendor transitioning a 20-year-old perpetual license business to a cloud subscription model. Transition pain causing near-term revenue decline.",
    price: 38.40,
    revenueGrowthPct: -8,
    peRatio: 0,
    profitMarginPct: -5,
    headlines: [
      "ARR grew 34% YoY as legacy customers migrate — subscription now 58% of revenue",
      "Remaining performance obligations (RPO) up 41% — indicates strong future revenue",
    ],
    signal: "Customer migration rate accelerating: 22% of legacy base converted this year vs 14% last year",
    outcome: {
      returnPct: 22,
      summary:
        "ARR growth held at 32%. Subscription crossed 70% of revenue. The RPO build proved out — revenue returned to growth the following quarter. Margins inflected as the high-margin subscription base scaled. Stock up 22%.",
      idealAction: "BUY",
      idealRationale:
        "Revenue declining -8% sounds alarming until you understand the transition: subscription ARR growing 34% with 70% gross margins is replacing one-time perpetual revenue. The RPO build and accelerating migration rate are the real leading indicators. This is a deliberate and well-executed transition, not distress.",
    },
  },
  // ── sc-103 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-103",
    ticker: "AETM",
    company: "Aethon Medical Devices",
    sector: "Medical Devices",
    description:
      "Develops minimally invasive surgical tools and robotic assistance systems. Primary customers are orthopedic and spine surgery centers.",
    price: 91.30,
    revenueGrowthPct: 12,
    peRatio: 28,
    profitMarginPct: 22,
    headlines: [
      "Procedure volumes up 14% as surgical backlog from 2021–22 continues to clear",
      "FDA clears next-generation robotic spine assistant — commercial launch in Q1",
    ],
    signal: "International distribution partnership signed with largest European hospital group",
    outcome: {
      returnPct: 14,
      summary:
        "The robotic spine assistant launched on schedule. International revenues contributed meaningfully in the first full quarter. Procedure volumes held steady. Stock up 14%.",
      idealAction: "BUY",
      idealRationale:
        "22% margins at 12% growth with FDA clearance on a new product and an international distribution deal is a straightforward quality compounder. Medical devices have sticky hospital relationships and high switching costs. The new product is pure upside on an already profitable base.",
    },
  },
  // ── sc-104 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-104",
    ticker: "NXDX",
    company: "Nexus Digital Exchange",
    sector: "Crypto / Fintech",
    description:
      "Cryptocurrency spot and derivatives exchange. Generates revenue from trading fees across 80+ digital asset pairs.",
    price: 44.80,
    revenueGrowthPct: 180,
    peRatio: 12,
    profitMarginPct: 28,
    headlines: [
      "SEC subpoenas exchange for customer trading records — investigation scope undisclosed",
      "Trading volumes down 38% from peak as crypto market cools",
    ],
    signal: "CFO and General Counsel both resigned within 30 days of each other",
    outcome: {
      returnPct: -44,
      summary:
        "The SEC investigation expanded to include allegations of wash trading. The exchange froze withdrawals for 72 hours amid a liquidity crunch. CFO resignation was tied to internal compliance failures. Stock fell 44%.",
      idealAction: "PASS",
      idealRationale:
        "A 12× P/E looks cheap until the earnings it's priced on evaporate. SEC investigations, dual executive exits, and a platform whose volumes are crypto-cycle-dependent are three independent red flags. Each one alone is disqualifying. All three together is a pattern.",
    },
  },
  // ── sc-105 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-105",
    ticker: "QKDR",
    company: "QuickDrop Delivery",
    sector: "Food Delivery",
    description:
      "On-demand food delivery marketplace operating in 220 cities. Connects restaurants and consumers via a gig-worker courier network.",
    price: 11.60,
    revenueGrowthPct: 42,
    peRatio: 0,
    profitMarginPct: -38,
    headlines: [
      "Adjusted EBITDA: -$180M in the quarter — 'path to profitability' unchanged at '3–4 years'",
      "Average order value declining as customers trade down to lower-priced options",
    ],
    signal: "Three largest cities representing 40% of orders are now subject to minimum wage laws for delivery workers",
    outcome: {
      returnPct: -31,
      summary:
        "New minimum wage laws in major cities raised per-delivery costs 22%. The path to profitability extended from '3–4 years' to '5+ years.' A bridge financing round priced at a 35% discount. Stock fell 31%.",
      idealAction: "PASS",
      idealRationale:
        "42% growth sounds good until you see -38% margins and a profitability timeline measured in years. Food delivery economics depend on courier costs — and those are structurally increasing. When your 'path to profitability' keeps getting longer, it's not a path.",
    },
  },
  // ── sc-106 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-106",
    ticker: "CVDS",
    company: "CoreVault Data Systems",
    sector: "Data Infrastructure",
    description:
      "Operates hyperscale data centers and provides colocation and managed hosting services. AI workloads are driving unprecedented demand for GPU-dense capacity.",
    price: 118.0,
    revenueGrowthPct: 52,
    peRatio: 38,
    profitMarginPct: 18,
    headlines: [
      "Data center utilization: 97% — turning away new customers due to capacity constraints",
      "Pre-leased 2 new hyperscale campuses for 2025 delivery — fully contracted before breaking ground",
    ],
    signal: "Power purchase agreements locked in at sub-4 cents/kWh through 2030",
    outcome: {
      returnPct: 41,
      summary:
        "Demand continued to outstrip supply. Pricing power emerged as utilization stayed above 95%. The new campuses attracted two additional hyperscaler tenants. Power cost advantage over competitors widened. Stock up 41%.",
      idealAction: "BUY",
      idealRationale:
        "97% utilization means the constraint is supply, not demand — pricing power is absolute. Pre-leased facilities before construction means zero vacancy risk. Locked-in power costs below 4 cents are a structural cost advantage in a capital-intensive, energy-intensive business. AI infrastructure demand is a decade-long wave.",
    },
  },
  // ── sc-107 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-107",
    ticker: "VELG",
    company: "Velo Apparel Group",
    sector: "Consumer Apparel",
    description:
      "Fast-fashion retailer expanding aggressively into emerging markets. Known for rapid design-to-shelf cycles of 2–3 weeks.",
    price: 22.30,
    revenueGrowthPct: 28,
    peRatio: 14,
    profitMarginPct: 8,
    headlines: [
      "EU parliament opens probe into labor practices at supplier factories",
      "Cotton and freight costs up 18% YoY — price increases not yet passed to consumers",
    ],
    signal: "Inventory-to-sales ratio at highest level in 6 years",
    outcome: {
      returnPct: -18,
      summary:
        "The EU probe expanded to include product safety concerns. Markdowns to clear elevated inventory destroyed margins. Net margin fell from 8% to 2%. Stock fell 18%.",
      idealAction: "PASS",
      idealRationale:
        "Fast fashion carries compounding risks: ESG scrutiny, labor cost exposure, and the inventory management tightrope. When costs are rising and you can't pass them through, and inventory is bloated, the margin math doesn't work. The regulatory risk is not priced in at 14× P/E.",
    },
  },
  // ── sc-108 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-108",
    ticker: "STRP",
    company: "Sterling Property Insurance",
    sector: "Property & Casualty Insurance",
    description:
      "Regional P&C insurer with heavy concentration in Gulf Coast homeowners and commercial property coverage.",
    price: 28.60,
    revenueGrowthPct: 6,
    peRatio: 11,
    profitMarginPct: 8,
    headlines: [
      "NOAA raises hurricane season forecast to 'extremely active' — 19 named storms predicted",
      "Reinsurance costs up 34% at renewal — the most expensive reinsurance market in a decade",
    ],
    signal: "Combined ratio crept above 95 in the last two quarters — approaching breakeven on underwriting",
    outcome: {
      returnPct: -22,
      summary:
        "Two Category 3 hurricanes made landfall in the Gulf Coast. Catastrophic loss claims exceeded reserves. The company raised its combined ratio guidance to 112 — meaning it was paying out more than it took in. Stock fell 22%.",
      idealAction: "PASS",
      idealRationale:
        "A combined ratio creeping toward 100 with the most expensive reinsurance market in a decade means margin for error is near zero. Geographic concentration in hurricane-prone areas with an extremely active forecast season is uncompensated risk. The low P/E reflects the uncertainty, not a discount.",
    },
  },
  // ── sc-109 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-109",
    ticker: "ARCG",
    company: "Arcadia Game Streaming",
    sector: "Gaming / Entertainment",
    description:
      "Cloud gaming subscription service with access to 1,200 titles. 8.2M subscribers paying $14.99/month, targeting 20M by year-end.",
    price: 31.40,
    revenueGrowthPct: 38,
    peRatio: 0,
    profitMarginPct: -12,
    headlines: [
      "Monthly active users at 94% retention rate — churn at all-time low",
      "Exclusive publishing deal signed with top independent studio for 4 titles over 3 years",
    ],
    signal: "Hardware partnerships with 3 TV manufacturers to pre-install app — 40M potential new devices",
    outcome: {
      returnPct: 16,
      summary:
        "Subscriber count reached 11M as the TV manufacturer integration drove organic installs. Churn stayed at 6%. The exclusive game launches drew critical acclaim and drove conversion. Stock up 16%.",
      idealAction: "BUY",
      idealRationale:
        "94% monthly retention in subscription gaming is exceptional — it means subscribers are actively engaged, not passively churning. The hardware pre-install is a zero-cost distribution channel reaching 40M potential subscribers. Exclusive content is the Netflix playbook applied to gaming.",
    },
  },
  // ── sc-110 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-110",
    ticker: "PCSL",
    company: "Prism Chemical Solutions",
    sector: "Specialty Chemicals",
    description:
      "Manufactures specialty resins and adhesives for the construction and automotive industries. Revenue cyclical with downstream customer inventory cycles.",
    price: 34.20,
    revenueGrowthPct: -12,
    peRatio: 14,
    profitMarginPct: 12,
    headlines: [
      "Customers destocking — order volumes down 20% as supply chains normalise",
      "Order book for Q3 back to pre-destocking levels — bookings inflecting higher",
    ],
    signal: "CEO initiates a $50M buyback at current prices — third buyback in four years",
    outcome: {
      returnPct: 22,
      summary:
        "Destocking ended faster than the market expected. Volumes recovered to pre-cycle levels by Q3. Margins expanded as fixed cost leverage returned. The buyback was well-timed. Stock up 22%.",
      idealAction: "BUY",
      idealRationale:
        "Destocking cycles end — that's what makes them cycles. The order book inflecting and a buyback from a management team that has done this well twice before are the signals. A -12% revenue dip with 12% maintained margins means the business is intact; the volume decline is temporary and already reversing.",
    },
  },
  // ── sc-111 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-111",
    ticker: "BCWG",
    company: "Beacon Wireless Group",
    sector: "Telecommunications",
    description:
      "Regional wireless carrier serving 4.2M postpaid subscribers. Offers 5G in 60% of its footprint. Pays an 8.4% dividend yield.",
    price: 19.80,
    revenueGrowthPct: 3,
    peRatio: 11,
    profitMarginPct: 9,
    headlines: [
      "5G rollout requires $1.8B capex over next 24 months — FCF will be negative this year",
      "Subscriber growth: +0.3% — below population growth, indicating share loss to larger carriers",
    ],
    signal: "Dividend payout ratio at 110% of free cash flow — paid from debt",
    outcome: {
      returnPct: -17,
      summary:
        "FCF turned deeply negative during the 5G build. The dividend was cut 40% to preserve capital. Subscriber losses accelerated as the larger carriers undercut on price with superior network coverage. Stock fell 17%.",
      idealAction: "PASS",
      idealRationale:
        "An 8.4% dividend yield paid from debt is not income — it's a return of capital you'll lose in stock price. Regional carriers in a 5G arms race against T-Mobile and Verizon cannot win. The capex requirement will destroy FCF and force a dividend cut. A dividend cut in a yield-driven stock creates a cascading sell.",
    },
  },
  // ── sc-112 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-112",
    ticker: "AURG",
    company: "Aurelion Luxury Group",
    sector: "Luxury Goods",
    description:
      "European luxury conglomerate with brands spanning leather goods, watches, and fine fragrance. 44% of revenue from mainland China.",
    price: 148.0,
    revenueGrowthPct: 2,
    peRatio: 24,
    profitMarginPct: 22,
    headlines: [
      "China stores reopening after 18 months of COVID restrictions — foot traffic recovering rapidly",
      "Aspirational luxury segment under pressure from wealth effect reversal in Western markets",
    ],
    signal: "Chinese Lunar New Year sales exceeded 2019 levels for the first time",
    outcome: {
      returnPct: 29,
      summary:
        "China revenue surged 38% in the quarter as pent-up demand released. Western markets stabilised. The Lunar New Year signal proved prescient — Chinese consumers spent aggressively on delayed luxury purchases. Stock up 29%.",
      idealAction: "BUY",
      idealRationale:
        "China reopening is a binary event for luxury houses with heavy mainland exposure. Pent-up demand from 18 months of restrictions combined with the cultural significance of Lunar New Year gifting is a powerful catalyst. 24× P/E on 22% margins with a China recovery embedded is not expensive for a brand with genuine pricing power.",
    },
  },
  // ── sc-113 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-113",
    ticker: "TWFS",
    company: "Transway Freight Solutions",
    sector: "Logistics",
    description:
      "Third-party logistics provider specialising in LTL and full truckload freight brokerage. Revenue surged 280% during pandemic-era volume spike.",
    price: 48.30,
    revenueGrowthPct: -18,
    peRatio: 12,
    profitMarginPct: 8,
    headlines: [
      "Freight spot rates down 42% from peak — capacity returning faster than demand",
      "Volume declines moderating — Q4 comps will be much easier",
    ],
    signal: "Management holding 2025 guidance flat — implies stabilisation, not further decline",
    outcome: {
      returnPct: -8,
      summary:
        "Freight markets stabilised by Q4 as excess capacity was absorbed. The -18% revenue decline slowed to -5% by year-end. Margins contracted but held positive. Stock fell 8% — better than feared.",
      idealAction: "HOLD",
      idealRationale:
        "Freight cycles normalise — the question is whether it's a controlled descent or a collapse. Volume declines moderating and easier comps ahead mean the worst is largely visible. Management holding guidance is a confidence signal. This is not a buy, but not a sell either — it's a cycle bottom, not a structural decline.",
    },
  },
  // ── sc-114 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-114",
    ticker: "HLXT",
    company: "Helix Therapeutics",
    sector: "Biotechnology",
    description:
      "Commercial-stage biotech that received FDA approval for a first-in-class treatment for a chronic autoimmune condition. Early commercial launch underway.",
    price: 38.70,
    revenueGrowthPct: 280,
    peRatio: 0,
    profitMarginPct: -25,
    headlines: [
      "Script growth: 40% week-over-week in early launch — payer coverage at 78% of commercial lives",
      "Formulary access improving — two large PBMs added to preferred tier",
    ],
    signal: "KOL survey shows 72% of physicians familiar with the drug at 8 months post-launch — tracking ahead of expectations",
    outcome: {
      returnPct: 33,
      summary:
        "Script growth continued accelerating. Coverage hit 90% within 6 months. The peak sales estimate was revised up 40% by the Street. Profitability arrived 4 quarters ahead of consensus. Stock up 33%.",
      idealAction: "BUY",
      idealRationale:
        "Weekly script growth of 40% with 78% coverage at 8 months is a successful launch — the hardest part (formulary access and physician adoption) is proving out. A first-in-class approved drug with this trajectory has a wide range of outcomes, most of them good. The -25% margin is temporary; the revenue is real and growing.",
    },
  },
  // ── sc-115 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-115",
    ticker: "HPTH",
    company: "Homepath Technologies",
    sector: "PropTech",
    description:
      "Real estate marketplace facilitating home purchases and sales using an iBuying and direct-listing model. Revenue collapsed alongside transaction volumes.",
    price: 9.20,
    revenueGrowthPct: 28,
    peRatio: 0,
    profitMarginPct: -18,
    headlines: [
      "Existing home sales at lowest level in 28 years as 7% mortgage rates freeze the market",
      "iBuying inventory carrying $840M in homes that can't be offloaded without steep discounts",
    ],
    signal: "CEO exercising put options on personal shares — downside protection, not confidence",
    outcome: {
      returnPct: -46,
      summary:
        "Interest rates rose further. Transaction volumes fell another 24%. The iBuying inventory was sold at a loss, crystallising $180M in write-downs. A dilutive equity raise followed. Stock fell 46%.",
      idealAction: "PASS",
      idealRationale:
        "A real estate marketplace business at 7% mortgage rates has no volume — the market is structurally frozen. $840M in iBuying inventory is a liability, not an asset, when prices are falling and it can't be sold. CEO put options is a CEO telling you what he thinks of the stock.",
    },
  },
  // ── sc-116 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-116",
    ticker: "MESK",
    company: "Mesa Kitchen Group",
    sector: "Restaurants",
    description:
      "Fast-casual restaurant chain with 680 locations. Known for customizable grain bowls targeting the health-conscious consumer.",
    price: 24.80,
    revenueGrowthPct: 8,
    peRatio: 19,
    profitMarginPct: 7,
    headlines: [
      "Same-store sales: +6% — driven by check size increases, not traffic growth",
      "Restaurant-level margins contracted 180bps YoY as minimum wage laws take effect in 3 key states",
    ],
    signal: "Traffic counts flat despite 6% comp — price increases doing all the work",
    outcome: {
      returnPct: -9,
      summary:
        "Labor cost increases continued. New minimum wage laws in two additional states extended the margin pressure. Traffic counts turned negative in Q3, revealing that customers had absorbed all the price they would take. Stock fell 9%.",
      idealAction: "HOLD",
      idealRationale:
        "A restaurant business growing same-store sales entirely through price increases with flat traffic is in a fragile equilibrium. 7% margins with rising labor costs means there is no buffer. Hold if you own it, but the risk-reward for a new position at 19× with deteriorating real unit economics is not attractive.",
    },
  },
  // ── sc-117 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-117",
    ticker: "HVIQ",
    company: "HarvestIQ Technologies",
    sector: "Agricultural Technology",
    description:
      "Precision farming software and sensor platform. Optimises irrigation, fertiliser application, and crop yield for large commercial farms.",
    price: 41.60,
    revenueGrowthPct: 24,
    peRatio: 0,
    profitMarginPct: 4,
    headlines: [
      "Platform now covers 8.2M acres — up from 5.4M acres a year ago",
      "Multi-year SaaS contracts averaging 4.2 years signed with two of the top 10 US farming cooperatives",
    ],
    signal: "Net promoter score of 74 — among highest in agricultural software",
    outcome: {
      returnPct: 17,
      summary:
        "Acreage coverage grew to 11M. The cooperative partnerships expanded as other members of each co-op adopted the platform. NPS held above 70, supporting low churn. Stock up 17%.",
      idealAction: "BUY",
      idealRationale:
        "Network effects in agricultural software are subtle but real — when a cooperative adopts a platform, peer pressure propagates adoption. 4.2-year average contract terms mean revenue visibility is exceptional. An NPS of 74 means farmers are recommending this to other farmers, which is hard to manufacture and hard to replicate.",
    },
  },
  // ── sc-118 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-118",
    ticker: "THDW",
    company: "Threadwave Social",
    sector: "Social Media",
    description:
      "Short-form video and community platform targeting 18–34-year-olds. 94M monthly active users with declining DAU/MAU ratio.",
    price: 17.40,
    revenueGrowthPct: 6,
    peRatio: 14,
    profitMarginPct: 12,
    headlines: [
      "Average revenue per user up 22% — new ad format delivering 3× click-through vs display",
      "DAU/MAU ratio declined from 68% to 61% — users visiting less frequently",
    ],
    signal: "Time-in-app metric stable despite lower session frequency — users going deeper, not broader",
    outcome: {
      returnPct: 13,
      summary:
        "The new ad format scaled across all advertisers. ARPU grew a further 18%. DAU/MAU stabilised as a redesigned feed algorithm improved session frequency. Stock up 13%.",
      idealAction: "BUY",
      idealRationale:
        "ARPU growth of 22% with a 3× click-through improvement means the monetisation layer is genuinely working. A declining DAU/MAU is concerning but the time-in-app stability suggests engagement is deep when users do show up. At 14× P/E with 12% margins and an improving revenue engine, this is cheap for a platform with 94M users.",
    },
  },
  // ── sc-119 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-119",
    ticker: "BRMT",
    company: "Bridgeline Mortgage Trust",
    sector: "Mortgage REIT",
    description:
      "Externally managed mortgage REIT investing in agency and non-agency MBS. Pays a 10.8% dividend yield funded by leveraged interest income.",
    price: 11.20,
    revenueGrowthPct: 2,
    peRatio: 8,
    profitMarginPct: 16,
    headlines: [
      "Book value per share down 18% over 6 months as rising rates compress MBS values",
      "Dividend cut 25% last quarter — management flagged potential for further cuts",
    ],
    signal: "Leverage ratio at 8.2× equity — near the top of the covenant limit",
    outcome: {
      returnPct: -36,
      summary:
        "Rates rose another 75bps. Book value declined a further 22%. The leverage covenant was breached, triggering a forced asset sale at distressed prices. Dividend eliminated. Stock fell 36%.",
      idealAction: "PASS",
      idealRationale:
        "A 10.8% yield already cut 25% with more cuts signalled is a dividend trap, not income. mREITs use 8× leverage — when rates rise, book value collapses and leverage covenants bind. The 16% margin is illusory: it exists only when the yield curve cooperates. This is a rate bet, not an investment.",
    },
  },
  // ── sc-120 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-120",
    ticker: "VTEX",
    company: "Voltex Energy Storage",
    sector: "Clean Energy",
    description:
      "Manufactures grid-scale lithium iron phosphate battery storage systems. Beneficiary of IRA clean energy tax credits and utility procurement mandates.",
    price: 29.40,
    revenueGrowthPct: 68,
    peRatio: 0,
    profitMarginPct: 6,
    headlines: [
      "Backlog reaches $2.1B — 2.8× annual revenue; fully contracted into next year",
      "IRA domestic content credits improve project economics by 14% for US-manufactured systems",
    ],
    signal: "Signed 10-year supply agreement with three major US utilities",
    outcome: {
      returnPct: 26,
      summary:
        "The utility agreements triggered additional procurement decisions across the grid. Backlog expanded to $3.4B. IRA credits remained intact. Margins improved as the manufacturing line scaled toward nameplate capacity. Stock up 26%.",
      idealAction: "BUY",
      idealRationale:
        "A 2.8× backlog-to-revenue with fully contracted visibility and IRA subsidies improving unit economics is a rare combination. Grid-scale storage is a multi-decade buildout driven by policy mandates, not discretionary demand. At 6% margins early in the manufacturing scale, the leverage to profitability as volume grows is significant.",
    },
  },
  // ── sc-121 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-121",
    ticker: "MCRS",
    company: "Meridian Credit Solutions",
    sector: "Consumer Finance",
    description:
      "Speciality consumer lender focused on personal loans and buy-now-pay-later products for near-prime borrowers.",
    price: 32.80,
    revenueGrowthPct: 22,
    peRatio: 14,
    profitMarginPct: 16,
    headlines: [
      "30-day delinquency rates up 180bps YoY — now at highest level since 2019",
      "Provision for loan losses increased 34% — management still calling it 'normalisation'",
    ],
    signal: "Net charge-off rate on BNPL portfolio doubled in one quarter",
    outcome: {
      returnPct: -19,
      summary:
        "Delinquencies continued rising, reaching 2020 levels. Management increased the provision for credit losses 60% by year-end. BNPL charge-offs required a material reserve build. Net interest margin compressed. Stock fell 19%.",
      idealAction: "PASS",
      idealRationale:
        "Near-prime borrowers are the first to crack in a softening consumer environment. Delinquencies rising 180bps with charge-offs doubling in a single quarter is not normalisation — it is the beginning of a credit cycle turn. When lenders say 'normalisation,' check the data; the data here says deterioration.",
    },
  },
  // ── sc-122 ──────────────────────────────────────────────────────────────────
  {
    id: "sc-122",
    ticker: "DMND",
    company: "Diamond Ridge Spirits",
    sector: "Beverages / Spirits",
    description:
      "Premium whiskey and spirits producer with aged inventory representing 6+ years of future supply. Sells across 48 countries.",
    price: 88.40,
    revenueGrowthPct: 14,
    peRatio: 26,
    profitMarginPct: 24,
    headlines: [
      "US spirits volumes down 4% industry-wide — first decline in 12 years",
      "Premium+ category where Diamond Ridge plays still growing at 3% — trading down limited so far",
    ],
    signal: "Aged inventory as a percentage of assets increased — patient accumulation for future releases",
    outcome: {
      returnPct: 11,
      summary:
        "Volume declines in the broader spirits market did not reach the premium tier. Diamond Ridge's aged inventory release schedule supported a 14% revenue increase for the year. International markets partially offset US softness. Stock up 11%.",
      idealAction: "HOLD",
      idealRationale:
        "Premium spirits have genuine pricing power and their aged inventory is a real asset that competitors cannot replicate on a short timeline. The broader volume decline is a concern but premium has historically held in mild downturns. At 26× P/E with 24% margins this is a quality business priced fairly — hold, don't chase.",
    },
  },
];

/** Deterministic daily scenario picker — same day = same scenario, day boundary at midnight EST/EDT. */
export function getTodayScenario(): Scenario {
  // toLocaleDateString("en-CA") returns "YYYY-MM-DD"; split+map gives [year, month, day] in EST.
  // Avoids the UTC offset on Vercel servers where new Date() day changes at 5 AM EST.
  const [year, month, day] = new Date()
    .toLocaleDateString("en-CA", { timeZone: "America/New_York" })
    .split("-")
    .map(Number);
  const dayKey = Number(`${year}${month}${day}`);
  return SCENARIOS[dayKey % SCENARIOS.length];
}

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
