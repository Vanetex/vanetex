import type { Track, Lesson } from "@/lib/types";

// ---------------------------------------------------------------------------
// Track 1 — Financial Metrics 101
// Teaches the core numerical signals every investor reads first.
// Lessons ordered easy → hard; each builds on the ones before it.
// ---------------------------------------------------------------------------

const financialMetrics101: Track = {
  id: "financial-metrics-101",
  title: "Financial Metrics 101",
  description:
    "Learn to read the numbers every investor looks at first — from P/E ratios and revenue growth all the way to EV/EBITDA — and know what they actually mean.",
  difficulty: "Beginner",
  lessons: [
    // -----------------------------------------------------------------------
    // Lesson 1 — P/E Ratio (Easy)
    // -----------------------------------------------------------------------
    {
      id: "pe-ratio",
      trackId: "financial-metrics-101",
      order: 1,
      title: "The P/E Ratio",
      concept: "Price-to-Earnings Ratio",
      difficulty: "Easy",
      fields: ["IB", "PE", "HF", "VC", "AM"],
      teaching: {
        intro:
          "The P/E ratio is the single most quoted number in stock analysis. Once you understand it, you'll see it everywhere — and know exactly what question it's answering.",
        sections: [
          {
            heading: "What it is",
            body: "P/E stands for Price-to-Earnings. It tells you how much investors are paying for every $1 of a company's profit.\n\nFormula: P/E = Stock Price ÷ Earnings Per Share (EPS)\n\nIf a stock trades at $100 and the company earns $5 per share, the P/E is 20. That means investors are paying $20 for every $1 of current earnings.",
            example:
              "Apple trades at $180. Its EPS is $6. P/E = 180 ÷ 6 = 30. Investors are paying $30 per $1 of Apple's profit.",
          },
          {
            heading: "What it tells you",
            body: "A high P/E means the market expects strong future growth — investors are paying a premium today for profits they believe are coming tomorrow.\n\nA low P/E can mean one of two things: the stock is undervalued (a potential bargain) or the business is struggling and the market knows it.\n\nContext matters: A P/E of 30 is expensive for a slow-growing bank but cheap for a fast-growing software company.",
            example:
              "A bank with P/E 10 isn't necessarily cheap — banks typically trade at low P/Es because their growth is slow and predictable. A tech startup with P/E 80 isn't necessarily expensive — investors are pricing in years of future growth.",
          },
          {
            heading: "How to use it as an investor",
            body: "Compare within the same sector. A retail company with P/E 25 looks expensive next to its competitors at P/E 14. That same P/E 25 would look cheap in the biotech sector.\n\nAlso compare to the company's own history. If a stock normally trades at P/E 20 and it's now at P/E 35, something has changed — either the growth story got better, or the stock got ahead of itself.\n\nWatch out for the 'P/E trap': a very low P/E on a declining business can look like value but is actually a warning sign. These are called value traps.",
          },
          {
            heading: "Key ranges to know",
            body: "Under 10 — Very cheap, often signals problems or a deeply cyclical industry.\n10–20 — Typical range for stable, mature companies.\n20–40 — Growth premium. The market expects above-average expansion.\nOver 40 — High-growth territory. Any slowdown punishes the stock hard.\n\nNote: Loss-making companies have no P/E (you can't divide by a negative number). This is common in early-stage tech.",
          },
        ],
        keyTakeaway:
          "P/E measures what investors pay per dollar of profit today — high means high expectations, low means low expectations or problems.",
      },
      practice: [
        {
          question:
            "A company's stock trades at $60. It earns $4 per share. What is its P/E ratio?",
          options: ["10", "15", "20", "24"],
          correctIndex: 1,
          explanation:
            "P/E = Price ÷ EPS = $60 ÷ $4 = 15. The stock trades at 15 times its annual earnings.",
        },
        {
          question:
            "Company A (a utility) has a P/E of 13. Company B (a cloud software firm) has a P/E of 55. Which statement is most accurate?",
          options: [
            "Company A is cheap; Company B is extremely overvalued",
            "Both P/Es are reasonable given their industries",
            "Company B is cheap because it's growing fast",
            "You can't tell anything without knowing the stock price",
          ],
          correctIndex: 1,
          explanation:
            "Utilities are slow, stable businesses — a P/E of 13 is normal. Cloud software firms grow fast, so investors pay a premium; P/E 55 is high but not unusual for the sector. Always compare within the same industry.",
        },
        {
          question:
            "A retailer's P/E has jumped from 18 (its 5-year average) to 34 in the past six months with no major announcements. What's the most likely explanation?",
          options: [
            "The company cut costs significantly",
            "Investors are now pricing in much higher future growth than before",
            "The earnings per share doubled",
            "The stock price fell in half",
          ],
          correctIndex: 1,
          explanation:
            "If EPS stayed roughly flat but the P/E doubled, it means the stock price roughly doubled — investors are willing to pay more per dollar of earnings, usually because expectations for future growth have risen sharply.",
        },
        {
          question:
            "Which company is most likely a 'value trap'?",
          options: [
            "A profitable bank trading at P/E 11 in a rising rate environment",
            "A fast-growing SaaS company with P/E 70 but 40% revenue growth",
            "A brick-and-mortar retailer with P/E 6 as foot traffic declines every quarter",
            "A consumer staples company at P/E 22 with steady dividend growth",
          ],
          correctIndex: 2,
          explanation:
            "The retailer looks 'cheap' at P/E 6, but declining foot traffic means the earnings supporting that P/E are shrinking. As earnings fall, the P/E will rise — or the business may become unprofitable. This is the value trap.",
        },
      ],
      apply: {
        setup:
          "You're looking at two competing software companies in the same market. Both are profitable. You need to decide which looks more attractively valued based on their P/E ratios and growth context.",
        data: [
          { label: "Company A — Stock Price", value: "$120" },
          { label: "Company A — EPS", value: "$8.00" },
          { label: "Company A — Revenue Growth (YoY)", value: "+6%" },
          { label: "Company B — Stock Price", value: "$95" },
          { label: "Company B — EPS", value: "$3.80" },
          { label: "Company B — Revenue Growth (YoY)", value: "+31%" },
        ],
        question:
          "Based on P/E ratio and growth rate, which company appears more attractively valued?",
        options: [
          "Company A — lower P/E means it's the better value",
          "Company B — its higher growth justifies the premium P/E",
          "They are equally valued given their different profiles",
          "Neither — both are overpriced for software companies",
        ],
        correctIndex: 1,
        explanation:
          "Company A's P/E = $120 ÷ $8 = 15. Company B's P/E = $95 ÷ $3.80 = 25. Company A looks 'cheaper' numerically, but it's growing at only 6% vs. Company B's 31%. Investors paying P/E 25 for 31% growth may actually be getting a better deal than paying P/E 15 for 6% growth. This ratio — growth rate vs. P/E — is known as the PEG ratio, which you'll learn in a later lesson.",
      },
    },

    // -----------------------------------------------------------------------
    // Lesson 2 — Revenue Growth (Easy)
    // -----------------------------------------------------------------------
    {
      id: "revenue-growth",
      trackId: "financial-metrics-101",
      order: 2,
      title: "Revenue Growth",
      concept: "Revenue Growth Rate",
      difficulty: "Easy",
      fields: ["IB", "PE", "HF", "VC", "AM"],
      teaching: {
        intro:
          "Revenue is the foundation everything else is built on. Without growing revenue, a company can only cut costs so far — understanding what 'good' growth looks like is one of the most important skills in investing.",
        sections: [
          {
            heading: "What revenue growth tells you",
            body: "Revenue growth measures how fast a company's sales are increasing year-over-year. It answers the most basic question: is this business getting bigger or smaller?\n\nFormula: Revenue Growth = (This Year's Revenue − Last Year's Revenue) ÷ Last Year's Revenue × 100\n\nA company that grew revenue from $100M to $120M has 20% revenue growth.",
            example:
              "Shopify grew revenue 57% in 2021 — the pandemic accelerated e-commerce. The next year growth slowed to 21% as the boom normalized. Neither number is inherently good or bad without context.",
          },
          {
            heading: "What counts as 'good' growth",
            body: "It depends entirely on the company's size and sector.\n\nSmall-cap tech startup: 50–100%+ growth is expected. Anything under 30% may concern investors.\nMid-cap SaaS: 20–40% is healthy. Under 15% raises questions.\nLarge-cap mature company (think Walmart): 3–8% is excellent. These businesses are enormous — even growing 5% adds billions in revenue.\n\nThe rule: compare growth to the company's peers in the same sector, not to an absolute number.",
          },
          {
            heading: "Organic vs. acquired growth",
            body: "Not all revenue growth is equal. There are two kinds:\n\nOrganic growth comes from selling more to more customers — this is the healthy kind. It means the product is working.\n\nInorganic growth comes from acquisitions. If a company bought a $500M competitor, its revenue goes up — but that doesn't mean its core business is growing.\n\nAlways check: did growth come from the existing business, or from writing a check?",
            example:
              "A healthcare company reports 25% revenue growth. But in the footnotes: they acquired a smaller competitor for $800M during the year. Strip that out and organic growth was only 4%. Very different story.",
          },
          {
            heading: "Deceleration is a red flag",
            body: "Even if a company is growing, a slowing growth rate can tank a stock.\n\nIf a company grew 60% → 45% → 28% → 14% over four years, the absolute growth is still positive — but the trajectory tells a story of a business losing momentum. Markets price in expectations, so decelerating growth often leads to multiple compression (the P/E shrinks).\n\nThe best scenario: accelerating growth — revenue growing 15% → 22% → 31% signals that something is working better and better.",
          },
        ],
        keyTakeaway:
          "Revenue growth shows whether a business is expanding — but always ask: how fast relative to peers, is it organic, and is the rate accelerating or slowing?",
      },
      practice: [
        {
          question:
            "A company had $80M in revenue last year and $100M this year. What is its revenue growth rate?",
          options: ["20%", "25%", "80%", "125%"],
          correctIndex: 1,
          explanation:
            "Revenue growth = ($100M − $80M) ÷ $80M × 100 = $20M ÷ $80M × 100 = 25%.",
        },
        {
          question:
            "A large-cap consumer goods company reports 5% revenue growth. An analyst calls this 'solid.' Is that reasonable?",
          options: [
            "No — 5% is weak and should concern investors",
            "Yes — for a massive, mature company, 5% organic growth is healthy",
            "Only if the company has high margins",
            "Only if competitors grew faster",
          ],
          correctIndex: 1,
          explanation:
            "Large, mature consumer companies face the law of large numbers — growing a $70B revenue base by even 5% means adding $3.5B in new sales. For this type of business, 5% consistent organic growth is genuinely healthy.",
        },
        {
          question:
            "A tech company's revenue growth: 48% → 39% → 26% → 14% over four years. What concern does this raise?",
          options: [
            "None — it's still positive growth each year",
            "The company is likely going bankrupt soon",
            "Growth is decelerating rapidly, suggesting the business may be maturing or losing competitive edge",
            "The company needs to reduce its P/E ratio",
          ],
          correctIndex: 2,
          explanation:
            "Consistent deceleration from 48% to 14% over four years is a major concern. Markets price in future expectations — if this trend continues, the company may soon struggle to grow at all, leading investors to reprice the stock lower.",
        },
        {
          question:
            "Company X reports 35% revenue growth, but organic growth was only 9% after stripping out an acquisition. What's your updated read?",
          options: [
            "Still impressive — 9% organic growth is fine for any company",
            "The headline number is misleading; 9% organic growth is modest and the acquisition flatters the results",
            "The acquisition makes the company stronger, so 35% is the right number to use",
            "You need the P/E ratio before forming a view",
          ],
          correctIndex: 1,
          explanation:
            "Acquisitions buy revenue but don't prove the core business is working. 9% organic growth vs. a 35% headline is a significant gap — the underlying business grew far more slowly than the headline suggests.",
        },
      ],
      apply: {
        setup:
          "You're evaluating two e-commerce platforms competing in the same market. Both are growing, but their growth profiles look very different.",
        data: [
          { label: "Company A — Revenue Growth (YoY)", value: "+38%" },
          { label: "Company A — Growth (ex-acquisition)", value: "+11% organic" },
          { label: "Company A — Prior Year Growth", value: "+40%" },
          { label: "Company B — Revenue Growth (YoY)", value: "+22%" },
          { label: "Company B — Growth (ex-acquisition)", value: "+22% organic" },
          { label: "Company B — Prior Year Growth", value: "+17%" },
        ],
        question: "Which company has the stronger revenue growth story?",
        options: [
          "Company A — 38% growth is higher than Company B's 22%",
          "Company B — its growth is fully organic and accelerating",
          "They are equivalent — both are growing double digits",
          "Company A — acquisitions are a sign of strength",
        ],
        correctIndex: 1,
        explanation:
          "Company A's headline 38% masks 11% organic growth — and organic growth actually decelerated from 40%. Company B's 22% is entirely organic and accelerated from 17% the prior year. Organic, accelerating growth is the gold standard.",
      },
    },

    // -----------------------------------------------------------------------
    // Lesson 3 — Profit Margins (Easy)
    // -----------------------------------------------------------------------
    {
      id: "profit-margins",
      trackId: "financial-metrics-101",
      order: 3,
      title: "Profit Margins",
      concept: "Gross & Net Profit Margin",
      difficulty: "Easy",
      fields: ["IB", "PE", "HF", "AM"],
      teaching: {
        intro:
          "Revenue tells you how big a business is. Margins tell you how well it's run. Two companies with identical revenue can have wildly different futures based on their margins alone.",
        sections: [
          {
            heading: "Gross margin — the first cut",
            body: "Gross margin is revenue minus the direct cost of making or delivering the product (called Cost of Goods Sold, or COGS).\n\nFormula: Gross Margin % = (Revenue − COGS) ÷ Revenue × 100\n\nThis tells you how much the company makes on each sale before paying for salaries, marketing, offices, and everything else.",
            example:
              "A software company sells $1M in subscriptions. The servers and engineers maintaining it cost $150K. Gross margin = ($1M − $150K) ÷ $1M = 85%. Software is nearly pure margin once built.",
          },
          {
            heading: "Net margin — what actually survives",
            body: "Net margin takes the full journey — after COGS, salaries, rent, marketing, taxes, and interest on debt.\n\nFormula: Net Margin % = Net Income ÷ Revenue × 100\n\nThis is the 'real' profitability number. It tells you how many cents the company keeps for every $1 of revenue.",
            example:
              "Amazon reports $500B in revenue but a 3–5% net margin. Most of that revenue is AWS and retail combined — the retail side has thin margins, which drags the net number down even though AWS is extremely profitable.",
          },
          {
            heading: "What healthy margins look like by sector",
            body: "Margins vary enormously by industry:\n\nSoftware / SaaS: Gross 65–85%, Net 10–30%\nRetail (physical): Gross 25–45%, Net 2–5%\nRestaurants: Gross 60–70% (food cost), Net 3–9%\nPharmaceuticals: Gross 60–80%, Net 15–25%\nAirlines: Gross 20–30%, Net 1–5% (in good years)\n\nThe key is to compare a company's margins to its direct competitors and to its own history.",
          },
          {
            heading: "Margin expansion vs. compression",
            body: "Expanding margins (12% net → 18% net) mean the business is becoming more efficient — it's scaling. This is a powerful positive signal.\n\nCompressing margins (18% → 12%) mean costs are rising faster than revenue, or competition is forcing price cuts.\n\nThe best scenario: revenue growing AND margins expanding. This is called 'operating leverage' — the business earns disproportionately more as it gets bigger.",
          },
        ],
        keyTakeaway:
          "Gross margin shows the value of the product; net margin shows the efficiency of the business — always compare both to industry peers and to the company's own trend.",
      },
      practice: [
        {
          question:
            "A company earns $200M in revenue. Its cost of goods sold is $80M. What is its gross margin?",
          options: ["40%", "60%", "80%", "120%"],
          correctIndex: 1,
          explanation:
            "Gross margin = ($200M − $80M) ÷ $200M = $120M ÷ $200M = 60%.",
        },
        {
          question:
            "A grocery store has a 24% gross margin. A cloud software company has a 78% gross margin. Which is more likely struggling?",
          options: [
            "The grocery store — 24% is dangerously low",
            "The cloud software company — 78% is unsustainably high",
            "Neither — both are normal for their industries",
            "You can't compare without knowing net income",
          ],
          correctIndex: 2,
          explanation:
            "Groceries are a high-volume, low-margin business by nature — 24% is typical. Cloud software has near-zero variable costs once built — 78% is expected. Margin comparison only makes sense within the same industry.",
        },
        {
          question:
            "A retail company's net margin has gone from 8% to 5% to 3% over three years while revenue grew 15% per year. What does this signal?",
          options: [
            "The company is becoming more profitable as it scales",
            "Costs are rising faster than revenue — a warning sign",
            "Revenue growth always comes at the cost of margins",
            "The company should stop growing to protect margins",
          ],
          correctIndex: 1,
          explanation:
            "Growing revenue while margins compress means every extra dollar of revenue is costing more to produce. Sustained compression without a clear explanation is a red flag.",
        },
        {
          question:
            "Company A has 20% gross margin and 8% net margin. Company B has 75% gross margin and 6% net margin. What can you infer?",
          options: [
            "Company A is more efficient overall",
            "Company B likely has high operating expenses eating into its gross profit",
            "Company B is a manufacturing business",
            "Company A has a better product",
          ],
          correctIndex: 1,
          explanation:
            "Company B starts with 75 cents on every dollar but only keeps 6 cents. That gap goes to operating expenses — common in high-growth SaaS companies spending heavily on sales and R&D.",
        },
      ],
      apply: {
        setup:
          "You're comparing two restaurant chains with similar revenue growth. Their margin profiles tell very different stories about which business is better run.",
        data: [
          { label: "Chain A — Revenue Growth", value: "+12%" },
          { label: "Chain A — Gross Margin", value: "64%" },
          { label: "Chain A — Net Margin (this year)", value: "11%" },
          { label: "Chain A — Net Margin (prior year)", value: "8%" },
          { label: "Chain B — Revenue Growth", value: "+14%" },
          { label: "Chain B — Gross Margin", value: "61%" },
          { label: "Chain B — Net Margin (this year)", value: "4%" },
          { label: "Chain B — Net Margin (prior year)", value: "7%" },
        ],
        question:
          "Based on margin analysis, which restaurant chain has the stronger business trajectory?",
        options: [
          "Chain B — it's growing revenue slightly faster",
          "Chain A — its net margin is expanding while Chain B's is compressing",
          "They are equal — the gross margins are similar",
          "Chain B — lower margins mean it's investing more in growth",
        ],
        correctIndex: 1,
        explanation:
          "Chain A improved net margin from 8% to 11% — the business is becoming more efficient as it scales. Chain B went from 7% to 4% — costs are rising faster than revenue. Expanding margins alongside revenue growth is the ideal combination.",
      },
    },

    // -----------------------------------------------------------------------
    // Lesson 4 — Earnings Per Share (Easy)
    // -----------------------------------------------------------------------
    {
      id: "earnings-per-share",
      trackId: "financial-metrics-101",
      order: 4,
      title: "Earnings Per Share (EPS)",
      concept: "Earnings Per Share",
      difficulty: "Easy",
      fields: ["IB", "HF", "AM"],
      teaching: {
        intro:
          "EPS is the foundation of stock valuation. Nearly every ratio you'll ever use — P/E, PEG, price-to-earnings growth — starts here. Mastering it unlocks everything that follows.",
        sections: [
          {
            heading: "What EPS is",
            body: "Earnings Per Share tells you how much profit a company generated for each share of stock outstanding.\n\nFormula: EPS = Net Income ÷ Shares Outstanding\n\nIf a company earns $10M in net income and has 5M shares outstanding, EPS = $2.00. Every share 'earned' $2 for its owner.",
            example:
              "Microsoft earns $72B in net income in a year. With ~7.4B diluted shares outstanding, EPS = $72B ÷ 7.4B ≈ $9.73. That's the profit earned per share, and it's what analysts use to build their valuation models.",
          },
          {
            heading: "Basic vs. diluted EPS",
            body: "You'll see two versions of EPS reported:\n\nBasic EPS uses only the shares currently outstanding.\n\nDiluted EPS includes shares that could be created if all stock options, warrants, and convertible securities were exercised. This is always a larger share count, making diluted EPS lower.\n\nAlways use diluted EPS. It's the more conservative and realistic figure — it accounts for the full dilution shareholders could face.",
            example:
              "A startup has $20M net income, 10M basic shares, but 12M diluted shares (because employees hold 2M unvested options). Basic EPS = $2.00. Diluted EPS = $1.67. The diluted figure is what matters.",
          },
          {
            heading: "EPS growth is what drives stock prices",
            body: "A company's stock price over time tracks its EPS growth closely. Investors pay a multiple (the P/E) for current earnings — but if earnings keep growing, the stock should follow.\n\nThis is why earnings surprises move stocks so dramatically. If the market expected EPS of $1.20 and the company reports $1.45, that 'beat' signals the business is doing better than expected, and the stock often jumps immediately.",
          },
          {
            heading: "Beware EPS manipulation",
            body: "EPS can be flattered by share buybacks. If a company buys back its own shares, the share count shrinks — and EPS goes up, even if net income didn't change.\n\nExample: A company earns $100M with 100M shares → EPS = $1.00. It buys back 20M shares. Now $100M ÷ 80M shares = EPS of $1.25. Earnings didn't grow — the denominator just got smaller.\n\nThis isn't always bad (buybacks can be a smart use of cash), but it means EPS growth alone doesn't tell you if the underlying business improved.",
          },
        ],
        keyTakeaway:
          "EPS is the per-share profit figure that drives valuations — always use diluted EPS, watch for growth trends, and check whether growth came from better earnings or just fewer shares.",
      },
      practice: [
        {
          question:
            "A company earns $50M in net income with 25M diluted shares outstanding. What is its diluted EPS?",
          options: ["$0.50", "$1.25", "$2.00", "$5.00"],
          correctIndex: 2,
          explanation:
            "Diluted EPS = $50M ÷ 25M shares = $2.00 per share.",
        },
        {
          question:
            "A company reports basic EPS of $3.50 and diluted EPS of $2.80. Which should you use for valuation?",
          options: [
            "Basic EPS — it reflects current shares",
            "Diluted EPS — it's more conservative and accounts for potential dilution",
            "The average of both",
            "Whichever is higher for a more optimistic view",
          ],
          correctIndex: 1,
          explanation:
            "Diluted EPS accounts for all shares that could exist if options and convertibles were exercised. It's the standard for valuation because it reflects the full picture of what shareholders would own.",
        },
        {
          question:
            "A company's net income stayed flat at $200M year-over-year, but EPS grew from $2.00 to $2.50. What most likely happened?",
          options: [
            "Revenue must have grown significantly",
            "The company reduced its share count through buybacks",
            "Margins improved significantly",
            "The company raised its stock price",
          ],
          correctIndex: 1,
          explanation:
            "If net income was flat but EPS grew 25%, the share count must have fallen. $200M ÷ new share count = $2.50, so new share count = 80M (down from 100M). The company bought back 20M shares.",
        },
        {
          question:
            "Analysts expected EPS of $1.10 for a company. It reports $0.88. What typically happens to the stock?",
          options: [
            "Nothing — EPS misses are priced in",
            "The stock usually rises because any positive EPS is good",
            "The stock typically falls as the market revises expectations downward",
            "The stock rises if revenue beat expectations",
          ],
          correctIndex: 2,
          explanation:
            "Earnings misses are punished quickly. A miss of ~20% signals the business underperformed expectations — analysts will revise their models down, and the stock typically sells off, sometimes significantly.",
        },
      ],
      apply: {
        setup:
          "Two consumer tech companies both reported strong net income this quarter. Before you build a valuation, you need to assess the quality of each company's EPS.",
        data: [
          { label: "Company A — Net Income", value: "$180M" },
          { label: "Company A — Basic Shares", value: "90M" },
          { label: "Company A — Diluted Shares", value: "91M" },
          { label: "Company A — Net Income Growth (YoY)", value: "+22%" },
          { label: "Company B — Net Income", value: "$180M" },
          { label: "Company B — Basic Shares", value: "120M → 90M (buybacks)" },
          { label: "Company B — Diluted Shares", value: "92M" },
          { label: "Company B — Net Income Growth (YoY)", value: "+2%" },
        ],
        question:
          "Both companies have similar diluted EPS. Which has higher quality earnings growth?",
        options: [
          "Company B — buybacks are a sign of financial strength",
          "Company A — its EPS growth is driven by actual net income improvement",
          "They are equal — diluted EPS is the same",
          "Company B — reducing share count is a smarter strategy",
        ],
        correctIndex: 1,
        explanation:
          "Company A grew net income 22% organically — the underlying business got meaningfully more profitable. Company B's net income barely moved (+2%), but EPS looks similar because they aggressively bought back shares. Higher quality earnings come from growing the numerator (net income), not shrinking the denominator (share count).",
      },
    },

    // -----------------------------------------------------------------------
    // Lesson 5 — Market Capitalization (Easy)
    // -----------------------------------------------------------------------
    {
      id: "market-cap",
      trackId: "financial-metrics-101",
      order: 5,
      title: "Market Capitalization",
      concept: "Market Cap & Company Size",
      difficulty: "Easy",
      fields: ["IB", "PE", "HF", "VC", "AM"],
      teaching: {
        intro:
          "Market cap is the simplest answer to 'how big is this company?' — and knowing a company's size tier immediately tells you what kind of risk and return profile to expect.",
        sections: [
          {
            heading: "What market cap is",
            body: "Market capitalization is the total market value of all a company's outstanding shares.\n\nFormula: Market Cap = Stock Price × Shares Outstanding\n\nIf a company has 100M shares trading at $50 each, its market cap is $5 billion. That's what it would theoretically cost to buy every share at today's price.",
            example:
              "Apple's stock price is $180, with roughly 15.5 billion shares outstanding. Market cap = $180 × 15.5B ≈ $2.79 trillion — making it one of the largest companies ever by market value.",
          },
          {
            heading: "Size tiers and what they mean",
            body: "Companies are grouped by market cap size, and each tier has a different risk/return profile:\n\nMicro-cap (under $300M): Very small companies. High risk, illiquid, minimal analyst coverage. Can be explosive or catastrophic.\n\nSmall-cap ($300M–$2B): Emerging companies with growth potential but more volatility than larger peers.\n\nMid-cap ($2B–$10B): Sweet spot for many investors — meaningful scale but still room to grow.\n\nLarge-cap ($10B–$200B): Established, stable businesses. Slower growth, but more predictable.\n\nMega-cap (over $200B): The giants — Apple, Microsoft, Amazon, Google. Move markets themselves.",
          },
          {
            heading: "Why size matters to your strategy",
            body: "Smaller companies have more room to grow — a $500M company can realistically 10x. A $2 trillion company almost certainly cannot.\n\nBut smaller companies also carry more risk: less diversified revenue, less access to capital, and often less experienced management.\n\nInstitutional investors (pension funds, mutual funds) often can't buy micro or small-cap stocks because the positions would be too large relative to trading volume — meaning these stocks get less analytical attention, creating potential opportunities for informed individual investors.",
          },
          {
            heading: "Market cap vs. enterprise value",
            body: "Market cap measures only equity — the shares. It ignores debt and cash on the balance sheet.\n\nEnterprise Value (EV) adds debt and subtracts cash to get the true 'cost' to acquire the whole business. You'll learn EV in detail in a later lesson — but remember: market cap is just the equity layer, not the full picture.",
            example:
              "Company A: market cap $1B, $500M in cash, no debt. True acquisition cost ≈ $500M (you'd get the cash back). Company B: market cap $1B, $800M in debt, no cash. True acquisition cost ≈ $1.8B. Same market cap, very different reality.",
          },
        ],
        keyTakeaway:
          "Market cap = price × shares — it measures a company's equity value and determines its size tier, which shapes its risk/return profile and who invests in it.",
      },
      practice: [
        {
          question:
            "A company has 200M shares outstanding and a stock price of $45. What is its market cap?",
          options: ["$4.5B", "$9B", "$45B", "$200B"],
          correctIndex: 1,
          explanation:
            "Market cap = $45 × 200M = $9 billion. This would be a mid-cap company.",
        },
        {
          question:
            "Which investment carries the most risk and potential reward?",
          options: [
            "A large-cap consumer staples company",
            "A mega-cap technology company",
            "A micro-cap biotech startup",
            "A mid-cap industrial firm",
          ],
          correctIndex: 2,
          explanation:
            "Micro-cap companies are the smallest and least established. They have the highest potential upside (can grow many multiples) but also the highest risk of failure, illiquidity, and limited analyst coverage.",
        },
        {
          question:
            "A company's stock price doubles but it also issues 50% more shares. What happens to market cap?",
          options: [
            "It doubles",
            "It triples",
            "It stays the same",
            "It falls",
          ],
          correctIndex: 1,
          explanation:
            "If price doubles (×2) and shares increase 50% (×1.5), market cap = 2 × 1.5 = 3 times the original. Market cap captures both price and share count changes.",
        },
        {
          question:
            "Two companies both have a $5B market cap. Company A has $2B in cash and no debt. Company B has $2B in debt and no cash. Which is cheaper to actually acquire?",
          options: [
            "Company B — its debt means sellers accept less",
            "Company A — you'd get $2B in cash back, making the true cost $3B",
            "They are equally priced since market cap is the same",
            "You need the P/E ratio to compare them",
          ],
          correctIndex: 1,
          explanation:
            "Company A's true acquisition cost ≈ $5B − $2B cash = $3B (you'd inherit the cash). Company B's true cost ≈ $5B + $2B debt = $7B (you'd inherit the debt). This is why Enterprise Value matters more than market cap when evaluating an acquisition.",
        },
      ],
      apply: {
        setup:
          "You're comparing two investments in the payments technology sector. You want to understand the size and scale of each before forming a view.",
        data: [
          { label: "Company A — Stock Price", value: "$22" },
          { label: "Company A — Shares Outstanding", value: "180M" },
          { label: "Company A — Revenue Growth", value: "+54%" },
          { label: "Company B — Stock Price", value: "$310" },
          { label: "Company B — Shares Outstanding", value: "620M" },
          { label: "Company B — Revenue Growth", value: "+12%" },
        ],
        question:
          "Which company is larger by market cap, and what does that imply about growth potential?",
        options: [
          "Company A is larger; Company B has more growth runway",
          "Company B is larger; Company A is the smaller, faster-growing company with more upside potential",
          "They are roughly the same size",
          "Company B is larger; its slower growth is a warning sign",
        ],
        correctIndex: 1,
        explanation:
          "Company A market cap = $22 × 180M = $3.96B (mid-cap). Company B market cap = $310 × 620M = $192B (mega-cap). Company B is ~48× larger. Company A, at a fraction of the size and growing 54%, has much more room to expand — it can realistically grow many multiples from here in a way Company B mathematically cannot.",
      },
    },

    // -----------------------------------------------------------------------
    // Lesson 6 — Debt-to-Equity Ratio (Medium)
    // -----------------------------------------------------------------------
    {
      id: "debt-to-equity",
      trackId: "financial-metrics-101",
      order: 6,
      title: "Debt-to-Equity Ratio",
      concept: "Leverage & Capital Structure",
      difficulty: "Medium",
      fields: ["IB", "PE", "HF"],
      teaching: {
        intro:
          "Debt can turbocharge a business's returns — or destroy it. The Debt-to-Equity ratio tells you how much a company has borrowed relative to what shareholders own, and whether that leverage is a feature or a warning sign.",
        sections: [
          {
            heading: "What D/E measures",
            body: "The Debt-to-Equity ratio compares total liabilities (or long-term debt) to shareholders' equity — the portion of the business financed by owners vs. creditors.\n\nFormula: D/E = Total Debt ÷ Shareholders' Equity\n\nA D/E of 1.0 means equal parts debt and equity. A D/E of 3.0 means $3 of debt for every $1 of equity — a heavily leveraged capital structure.",
            example:
              "A real estate company has $800M in debt and $400M in equity. D/E = 800 ÷ 400 = 2.0. For real estate, this is completely normal — assets are large and predictable. For a startup, it would be alarming.",
          },
          {
            heading: "When debt is good",
            body: "Debt is a tool. Used well, it amplifies returns on equity.\n\nIf a company borrows at 5% interest and deploys that capital at 15% returns, the spread (10%) flows directly to shareholders. This is positive leverage.\n\nStable, predictable businesses — utilities, real estate, consumer staples — can safely carry more debt because their cash flows are reliable enough to service it.",
          },
          {
            heading: "When debt becomes dangerous",
            body: "Debt becomes dangerous when:\n\n1. Interest payments consume too much operating income (watch the Interest Coverage Ratio — EBIT ÷ Interest Expense; below 3× is a warning)\n2. The business is cyclical — in downturns, revenues fall but debt payments don't\n3. The debt matures soon and must be refinanced at higher rates\n\nHigh-growth tech companies often avoid significant debt — their cash flows are unpredictable and they can't risk being forced into bankruptcy during a rough quarter.",
            example:
              "During the 2008–2009 financial crisis, many companies with high D/E ratios went bankrupt — not because their business models failed, but because falling revenues made it impossible to service fixed debt payments.",
          },
          {
            heading: "Industry context is essential",
            body: "D/E norms vary dramatically by sector:\n\nFinancials (banks): D/E of 10–20+ is normal (they borrow deposits and lend them out)\nUtilities: D/E of 1–3 is typical\nTechnology: D/E under 1.0 is common; many carry no debt at all\nRetail: Varies widely; high D/E can signal lease obligations or inventory financing\n\nNever judge D/E in isolation — always compare to sector peers.",
          },
        ],
        keyTakeaway:
          "D/E measures financial leverage — moderate debt in stable businesses amplifies returns, but high debt in volatile businesses amplifies risk of failure.",
      },
      practice: [
        {
          question:
            "A company has $600M in total debt and $400M in shareholders' equity. What is its D/E ratio?",
          options: ["0.67", "1.0", "1.5", "2.4"],
          correctIndex: 2,
          explanation:
            "D/E = $600M ÷ $400M = 1.5. For every $1 of equity, the company has $1.50 of debt.",
        },
        {
          question:
            "A bank reports a D/E ratio of 12. Should you be alarmed?",
          options: [
            "Yes — D/E over 2 is always dangerous",
            "No — banks routinely operate with very high leverage; it's built into their model",
            "Only if interest rates are rising",
            "Yes — it means the bank is about to go bankrupt",
          ],
          correctIndex: 1,
          explanation:
            "Banks take deposits (debt) and lend them out at higher rates — this is their entire business model. D/E of 10–20 is completely normal for financial institutions. Applying a tech company's D/E standard to a bank is a category error.",
        },
        {
          question:
            "A cyclical manufacturing company has a D/E of 4.5. Why is this particularly risky?",
          options: [
            "Manufacturing companies can never handle debt",
            "In a cyclical downturn, revenues can fall sharply while debt payments remain fixed — a dangerous combination",
            "D/E of 4.5 means the company will definitely default",
            "High D/E always means the company is overpaying executives",
          ],
          correctIndex: 1,
          explanation:
            "Cyclical businesses see revenues swing dramatically with economic conditions. High fixed debt payments during a revenue slump can create a cash crunch — companies can go bankrupt not because their business model fails but because they can't service debt in a bad year.",
        },
        {
          question:
            "Company A (SaaS, D/E 0.2) and Company B (utility, D/E 2.1) are both investment candidates. Which is carrying more appropriate leverage for its business?",
          options: [
            "Company A — lower debt is always better",
            "Both are appropriate given their respective industries",
            "Company B — utilities should have zero debt",
            "Company A — tech companies should carry more debt",
          ],
          correctIndex: 1,
          explanation:
            "SaaS companies have unpredictable growth-stage cash flows — low leverage is prudent. Utilities have extremely stable, regulated cash flows — they can safely carry significant debt. Both D/E ratios are appropriate for their contexts.",
        },
      ],
      apply: {
        setup:
          "You're evaluating two industrial companies in the same sector — both make heavy equipment. A recession is being widely forecast for the next 12–18 months. You want to assess which is better positioned to weather it.",
        data: [
          { label: "Company A — D/E Ratio", value: "0.8" },
          { label: "Company A — Interest Coverage (EBIT ÷ Interest)", value: "8.2×" },
          { label: "Company A — Revenue Growth (last 3 yrs avg)", value: "+9%" },
          { label: "Company B — D/E Ratio", value: "3.6" },
          { label: "Company B — Interest Coverage", value: "2.1×" },
          { label: "Company B — Revenue Growth (last 3 yrs avg)", value: "+14%" },
        ],
        question:
          "Given the recession forecast, which company is in a stronger position?",
        options: [
          "Company B — higher growth means it can grow through the recession",
          "Company A — lower leverage and strong interest coverage means it can survive a revenue decline",
          "They are equally positioned — both are industrial companies",
          "Company B — its higher D/E means lenders believe in it",
        ],
        correctIndex: 1,
        explanation:
          "In a recession, industrial revenues typically fall sharply. Company B's interest coverage of 2.1× means it barely covers interest payments at current revenue — a 20–30% revenue decline could push it into distress. Company A's coverage of 8.2× gives it massive room to absorb a downturn. Company B's higher growth is irrelevant if it can't survive the recession to capitalize on the recovery.",
      },
    },

    // -----------------------------------------------------------------------
    // Lesson 7 — Price-to-Book Ratio (Medium)
    // -----------------------------------------------------------------------
    {
      id: "price-to-book",
      trackId: "financial-metrics-101",
      order: 7,
      title: "Price-to-Book Ratio",
      concept: "Price-to-Book (P/B) Ratio",
      difficulty: "Medium",
      fields: ["HF", "AM"],
      teaching: {
        intro:
          "While P/E measures what you pay for earnings, P/B measures what you pay for the company's underlying assets. It's the value investor's lens — and knowing when to use it (and when not to) separates informed investors from the rest.",
        sections: [
          {
            heading: "What book value is",
            body: "Book value is the accounting value of a company's assets minus its liabilities — what shareholders would theoretically receive if the company liquidated everything at balance sheet values.\n\nBook Value = Total Assets − Total Liabilities\n\nBook value per share = Book Value ÷ Shares Outstanding\n\nThink of it as the 'floor' value of the business — what it's worth on paper if everything stopped tomorrow.",
            example:
              "A bank has $500B in assets and $450B in liabilities. Book value = $50B. With 1B shares outstanding, book value per share = $50. If the stock trades at $60, P/B = 60 ÷ 50 = 1.2×.",
          },
          {
            heading: "How to calculate and read P/B",
            body: "Formula: P/B = Stock Price ÷ Book Value Per Share\n\nP/B below 1.0 means you're buying assets for less than their accounting value — potentially a deep value opportunity, or a sign the assets are impaired.\n\nP/B of 1–3 is typical for asset-heavy industries.\n\nP/B of 10–30+ is common in asset-light tech companies where brand, software, and talent (intangible assets) dwarf physical assets.",
          },
          {
            heading: "When P/B is most useful",
            body: "P/B shines in asset-heavy industries where the balance sheet is the business:\n\nBanks and financial institutions — assets (loans, securities) are the core of what they do\nInsurance companies — their investment portfolios are the product\nManufacturing and real estate — physical assets drive value\n\nFor these companies, a P/B near or below 1.0 can signal undervaluation. Legendary investors like Benjamin Graham and Warren Buffett used P/B extensively in their early careers.",
          },
          {
            heading: "When P/B misleads you",
            body: "P/B is nearly useless for asset-light businesses:\n\nSoftware, consulting, and consumer brand companies have most of their value in intangibles — customer relationships, intellectual property, brand loyalty — none of which are fully captured on the balance sheet.\n\nGoogle's 'book value' wildly understates what Alphabet is actually worth because its most valuable assets (search algorithm, advertiser relationships, YouTube) aren't on the balance sheet at fair market value.\n\nAlways ask: is this a business where the balance sheet reflects real value?",
          },
        ],
        keyTakeaway:
          "P/B compares market price to accounting asset value — highly useful for banks and asset-heavy industries, but largely meaningless for software or brand-driven businesses.",
      },
      practice: [
        {
          question:
            "A company has total assets of $800M, total liabilities of $500M, and 150M shares outstanding. What is the book value per share?",
          options: ["$2.00", "$3.33", "$5.33", "$2.00"],
          correctIndex: 0,
          explanation:
            "Book value = $800M − $500M = $300M. Book value per share = $300M ÷ 150M = $2.00.",
        },
        {
          question:
            "A regional bank trades at a P/B of 0.7. What does this most likely signal?",
          options: [
            "The bank is wildly overvalued",
            "Investors believe the bank's assets are worth less than stated — possible loan losses or write-downs ahead — or it's a deep value opportunity",
            "The bank has too much cash",
            "P/B below 1 is always a buy signal",
          ],
          correctIndex: 1,
          explanation:
            "P/B below 1 for a bank means the market values it at less than its accounting net assets. This could mean investors fear loan losses will erode asset values — or it could mean the stock is genuinely undervalued. Further analysis required.",
        },
        {
          question:
            "A cloud software company trades at P/B of 28. Is this a red flag?",
          options: [
            "Yes — P/B above 5 is always overvalued",
            "Not necessarily — software companies' most valuable assets are intangible and not fully on the balance sheet",
            "Yes — it means investors are irrationally exuberant",
            "Only if the company has negative net income",
          ],
          correctIndex: 1,
          explanation:
            "Software companies' value comes from code, customer relationships, and brand — none fully captured in book value. P/B of 28 for a high-margin SaaS business with strong growth can be completely rational. P/B is the wrong metric here.",
        },
        {
          question:
            "Benjamin Graham's 'net-net' strategy involved buying stocks trading below their net current asset value (a strict version of P/B < 1). What was the core insight?",
          options: [
            "Low P/B companies always have the best management",
            "You were buying the liquidation value of assets at a discount — even if the business failed, you'd likely get your money back",
            "P/B below 1 predicts revenue growth",
            "Net current assets are a proxy for future earnings",
          ],
          correctIndex: 1,
          explanation:
            "Graham's insight was pure asset-based: if you can buy $1 of liquid assets for $0.70, you have a margin of safety even in a worst-case scenario. This 'margin of safety' concept is foundational to value investing.",
        },
      ],
      apply: {
        setup:
          "You're comparing two financial sector companies — both commercial banks of similar size. You want to use P/B to assess relative valuation.",
        data: [
          { label: "Bank A — Stock Price", value: "$42" },
          { label: "Bank A — Book Value Per Share", value: "$38" },
          { label: "Bank A — Return on Equity (ROE)", value: "14%" },
          { label: "Bank A — Non-Performing Loan Ratio", value: "0.8%" },
          { label: "Bank B — Stock Price", value: "$31" },
          { label: "Bank B — Book Value Per Share", value: "$40" },
          { label: "Bank B — Return on Equity (ROE)", value: "6%" },
          { label: "Bank B — Non-Performing Loan Ratio", value: "4.2%" },
        ],
        question:
          "Bank B trades below book value while Bank A trades above. Which is the better investment?",
        options: [
          "Bank B — it trades at a discount to book value, making it cheaper",
          "Bank A — its premium P/B is justified by higher ROE and much cleaner loan quality",
          "They are equivalent since they have similar book values",
          "Bank B — a lower stock price means more upside",
        ],
        correctIndex: 1,
        explanation:
          "Bank A P/B = $42 ÷ $38 = 1.1×. Bank B P/B = $31 ÷ $40 = 0.78×. Bank B looks 'cheaper' by P/B, but its 4.2% non-performing loan ratio signals significant credit quality problems that may require write-downs — reducing actual book value. Bank A's superior ROE (14% vs 6%) justifies a premium. P/B discounts often exist for a reason.",
      },
    },

    // -----------------------------------------------------------------------
    // Lesson 8 — Free Cash Flow (Medium)
    // -----------------------------------------------------------------------
    {
      id: "free-cash-flow",
      trackId: "financial-metrics-101",
      order: 8,
      title: "Free Cash Flow",
      concept: "Free Cash Flow (FCF)",
      difficulty: "Medium",
      fields: ["IB", "PE", "HF", "AM"],
      teaching: {
        intro:
          "Warren Buffett calls free cash flow 'owner earnings' — the actual cash a business generates for its owners after keeping the lights on and investing in its future. It's often more revealing than net income, and learning to read it separates serious investors from casual ones.",
        sections: [
          {
            heading: "Why FCF differs from net income",
            body: "Net income is an accounting number — it includes non-cash items like depreciation, amortization, and stock-based compensation. A company can report positive net income while actually burning cash.\n\nFree Cash Flow measures real money: what came in the door minus what was spent to maintain and grow the business.\n\nFormula: FCF = Operating Cash Flow − Capital Expenditures (CapEx)\n\nOperating cash flow is cash generated from the core business. CapEx is cash spent on physical assets (equipment, buildings, infrastructure).",
            example:
              "A telecom company reports $500M net income but spent $900M on network infrastructure (CapEx). Operating cash flow was $1.1B. FCF = $1.1B − $900M = $200M. The business generated far less free cash than net income suggested.",
          },
          {
            heading: "What FCF tells you",
            body: "FCF is cash that can be returned to shareholders (dividends, buybacks), used to pay down debt, or reinvested in growth. It answers: after everything this business needs to function and grow, what's left?\n\nPositive and growing FCF is one of the most reliable indicators of a healthy, sustainable business.\n\nNegative FCF isn't always bad — young, high-growth companies often invest heavily in expansion (negative FCF by design). But negative FCF in a mature company is a serious warning.",
          },
          {
            heading: "FCF yield — comparing to the stock price",
            body: "FCF Yield = FCF ÷ Market Cap\n\nThis is the cash return you're getting per dollar invested. A FCF yield of 6% means the business generates $6 of free cash per $100 of market value — comparable to a bond yield.\n\nGeneral benchmarks:\nUnder 2% — expensive or high-growth reinvestment phase\n3–5% — fair value for a good business\nOver 6% — potentially cheap or the market sees risk ahead",
            example:
              "A company with $2B FCF and a $25B market cap has an FCF yield of 8%. If that FCF grows steadily, an 8% yield on a growing income stream is very attractive compared to bonds or other investments.",
          },
          {
            heading: "CapEx intensity matters",
            body: "Businesses differ dramatically in how much CapEx they need to maintain operations (maintenance CapEx) vs. grow (growth CapEx).\n\nAsset-light businesses (software, asset management) have tiny CapEx — most of operating cash flow becomes FCF. This is why these companies command premium valuations.\n\nCapEx-heavy businesses (airlines, telecom, oil & gas) convert a much smaller fraction of earnings to FCF — their assets constantly depreciate and need replacement.\n\nWhen comparing companies, always check how CapEx-intensive the business model is.",
          },
        ],
        keyTakeaway:
          "FCF = Operating Cash Flow − CapEx — it's the real cash a business generates for owners, and is often more reliable than net income for assessing business quality.",
      },
      practice: [
        {
          question:
            "A company has $400M in operating cash flow and spent $120M on capital expenditures. What is its free cash flow?",
          options: ["$120M", "$280M", "$400M", "$520M"],
          correctIndex: 1,
          explanation:
            "FCF = Operating Cash Flow − CapEx = $400M − $120M = $280M.",
        },
        {
          question:
            "A profitable company (positive net income) is consistently FCF negative. What might explain this?",
          options: [
            "This is impossible — net income always leads to positive FCF",
            "The company may have high non-cash income or is investing heavily in CapEx — net income doesn't equal cash",
            "The company's accountants made an error",
            "FCF negative means the company is going bankrupt",
          ],
          correctIndex: 1,
          explanation:
            "Net income includes non-cash items (depreciation, stock compensation) and ignores CapEx. A company can be net-income positive but FCF negative if it's spending heavily on infrastructure or if working capital is consuming cash.",
        },
        {
          question:
            "A software company has $3B in FCF on a $40B market cap. An airline has $3B in FCF on a $10B market cap. Which has a more attractive FCF yield?",
          options: [
            "The software company — FCF yield of 7.5%",
            "The airline — FCF yield of 30%",
            "They are equal since FCF is the same",
            "The software company — tech commands a premium always",
          ],
          correctIndex: 1,
          explanation:
            "Software FCF yield = $3B ÷ $40B = 7.5%. Airline FCF yield = $3B ÷ $10B = 30%. The airline's yield is much higher — but FCF yields are high for a reason. Airlines are capital-intensive (planes need replacing), cyclical (revenue collapses in recessions), and have thin margins. The premium yield reflects the risk.",
        },
        {
          question:
            "Which business model would you expect to have the highest FCF conversion rate (FCF as % of net income)?",
          options: [
            "An airline with massive fleet maintenance requirements",
            "An oil & gas company requiring constant drilling",
            "A software company selling digital products with minimal CapEx",
            "A utility company with aging infrastructure to replace",
          ],
          correctIndex: 2,
          explanation:
            "Software companies have extremely low CapEx — once code is written, it costs almost nothing to deliver to more customers. This means nearly all of their operating cash flow becomes FCF. Airlines, oil companies, and utilities all have large, unavoidable CapEx that consumes cash flow.",
        },
      ],
      apply: {
        setup:
          "Two consumer goods companies have similar reported net income. You want to understand which is generating higher quality cash earnings.",
        data: [
          { label: "Company A — Net Income", value: "$320M" },
          { label: "Company A — Operating Cash Flow", value: "$410M" },
          { label: "Company A — Capital Expenditures", value: "$55M" },
          { label: "Company A — Market Cap", value: "$6.2B" },
          { label: "Company B — Net Income", value: "$310M" },
          { label: "Company B — Operating Cash Flow", value: "$290M" },
          { label: "Company B — Capital Expenditures", value: "$195M" },
          { label: "Company B — Market Cap", value: "$5.8B" },
        ],
        question:
          "Which company has higher quality earnings, and why?",
        options: [
          "Company B — lower CapEx as a % of operating cash flow",
          "Company A — higher FCF and better FCF yield despite a larger market cap",
          "They are equal — net income is nearly identical",
          "Company B — lower market cap means better value",
        ],
        correctIndex: 1,
        explanation:
          "Company A FCF = $410M − $55M = $355M. FCF yield = $355M ÷ $6.2B = 5.7%. Company B FCF = $290M − $195M = $95M. FCF yield = $95M ÷ $5.8B = 1.6%. Despite similar net income, Company A converts far more to real cash — and Company B is spending nearly as much on CapEx as it generates from operations. Company A is the significantly higher quality business.",
      },
    },

    // -----------------------------------------------------------------------
    // Lesson 9 — Return on Equity (Medium)
    // -----------------------------------------------------------------------
    {
      id: "return-on-equity",
      trackId: "financial-metrics-101",
      order: 9,
      title: "Return on Equity",
      concept: "Return on Equity (ROE)",
      difficulty: "Medium",
      fields: ["IB", "PE", "HF", "AM"],
      teaching: {
        intro:
          "ROE answers the most important question a shareholder can ask: how efficiently is management using my money? It's one of Warren Buffett's favorite metrics — and understanding its nuances will tell you a lot about business quality.",
        sections: [
          {
            heading: "What ROE measures",
            body: "Return on Equity measures how much profit a company generates for each dollar of shareholder equity.\n\nFormula: ROE = Net Income ÷ Shareholders' Equity\n\nIf a company earns $20M on $100M of equity, ROE = 20%. Management turned every $1 shareholders invested into $1.20 of value in one year.\n\nConsistently high ROE (15%+) over many years is one of the strongest signals of a durable competitive advantage — a moat.",
            example:
              "Visa has consistently generated ROE above 30% for over a decade. This extraordinary efficiency reflects their near-monopoly on payment rails — they earn massively on a relatively small equity base because they don't need much capital to operate.",
          },
          {
            heading: "What's a good ROE?",
            body: "As always, it depends on the industry:\n\nUnder 10% — Weak. Management isn't putting capital to work effectively.\n10–15% — Average. Acceptable but not exceptional.\n15–20% — Good. Suggests a competitive advantage.\nOver 20% — Excellent. Consistently high ROE often signals a moat.\n\nCompare ROE to the cost of equity capital (roughly 8–12% for most companies). ROE must exceed the cost of capital to create value — otherwise the business destroys shareholder value even while reporting profits.",
          },
          {
            heading: "The danger: debt-inflated ROE",
            body: "Here's the catch: you can boost ROE by taking on more debt. Leverage reduces the equity denominator, which mechanically increases ROE — even if the business isn't actually more profitable.\n\nThis is why ROE alone can mislead. A company with ROE 35% and D/E 8.0 may be less impressive than a company with ROE 22% and D/E 0.3.\n\nAlways check D/E alongside ROE. High ROE with low leverage is the gold standard.",
            example:
              "Two companies both earn $100M. Company A has $500M equity (ROE 20%) and no debt. Company B has $200M equity (ROE 50%) but $800M debt. Company B's ROE looks better — but it's entirely a function of leverage, not superior business performance.",
          },
          {
            heading: "The DuPont framework — where ROE comes from",
            body: "ROE can be broken into three drivers (DuPont analysis):\n\nROE = Net Margin × Asset Turnover × Financial Leverage\n\nNet Margin: How much profit per dollar of revenue (profitability)\nAsset Turnover: Revenue generated per dollar of assets (efficiency)\nFinancial Leverage: Assets per dollar of equity (use of debt)\n\nThis decomposition tells you where ROE is coming from — a company can have high ROE through great margins, high asset efficiency, or aggressive leverage. Only the first two reflect genuine business quality.",
          },
        ],
        keyTakeaway:
          "ROE measures how efficiently a company uses shareholder capital — consistently high ROE (15%+) with low leverage is one of the strongest signals of business quality.",
      },
      practice: [
        {
          question:
            "A company earns $45M in net income with $300M in shareholders' equity. What is its ROE?",
          options: ["6.7%", "15%", "22%", "45%"],
          correctIndex: 1,
          explanation:
            "ROE = $45M ÷ $300M = 15%. Solid — at the lower boundary of 'good' depending on the industry.",
        },
        {
          question:
            "Company A has ROE 28% and D/E 0.4. Company B has ROE 35% and D/E 5.2. Which likely has higher quality returns?",
          options: [
            "Company B — 35% ROE is higher",
            "Company A — its ROE is generated with minimal leverage, suggesting genuine business quality",
            "They are equal — ROE is all that matters",
            "Company B — high leverage shows lenders trust them",
          ],
          correctIndex: 1,
          explanation:
            "Company B's higher ROE is largely a function of its 5.2× leverage amplifying returns on equity. Company A achieves 28% ROE with very little debt — this reflects a genuinely high-quality, capital-efficient business. Always decompose ROE alongside D/E.",
        },
        {
          question:
            "A company's ROE has been 22%, 24%, 25%, 27% over four consecutive years. What does this trend suggest?",
          options: [
            "The company is taking on more and more debt",
            "The business is compounding its competitive advantage — consistently and increasingly efficient use of capital",
            "Net income must have declined",
            "Shares outstanding are falling",
          ],
          correctIndex: 1,
          explanation:
            "Steadily rising ROE with no increase in leverage signals genuine operational improvement — management is deploying capital more efficiently each year, which is a powerful indicator of a widening moat.",
        },
        {
          question:
            "A company's cost of equity capital is estimated at 10%. It reports ROE of 8%. What does this mean for shareholders?",
          options: [
            "The company is profitable so shareholders are fine",
            "The company is destroying shareholder value — it's earning less than shareholders require",
            "The company should pay a dividend to compensate",
            "ROE of 8% is acceptable in any industry",
          ],
          correctIndex: 1,
          explanation:
            "If the company earns 8% on equity but shareholders require 10% (cost of equity), the company is destroying value — it would be better for shareholders to have their capital returned and deployed elsewhere. Profitable doesn't mean value-creating.",
        },
      ],
      apply: {
        setup:
          "You're analyzing two specialty retail companies for a long-term investment. You want to assess which management team is creating more value per dollar of shareholder capital.",
        data: [
          { label: "Retailer A — Net Income", value: "$85M" },
          { label: "Retailer A — Shareholders' Equity", value: "$420M" },
          { label: "Retailer A — Total Debt", value: "$95M" },
          { label: "Retailer A — ROE (3-yr average)", value: "19.8%" },
          { label: "Retailer B — Net Income", value: "$110M" },
          { label: "Retailer B — Shareholders' Equity", value: "$280M" },
          { label: "Retailer B — Total Debt", value: "$680M" },
          { label: "Retailer B — ROE (3-yr average)", value: "38.4%" },
        ],
        question:
          "Which retailer is creating higher quality shareholder value?",
        options: [
          "Retailer B — 38% ROE is nearly double Retailer A's",
          "Retailer A — its ROE is generated with minimal leverage, representing genuine operational excellence",
          "They are equal — both have strong ROE",
          "Retailer B — higher net income proves better management",
        ],
        correctIndex: 1,
        explanation:
          "Retailer A: D/E = $95M ÷ $420M = 0.23 — barely any leverage. ROE of ~20% driven by genuine business quality. Retailer B: D/E = $680M ÷ $280M = 2.43 — significant leverage. Much of the 38% ROE comes from a shrunken equity base due to debt, not superior operations. In a retail sector downturn, Retailer B's debt load becomes a major liability. Retailer A's ROE is more sustainable and less fragile.",
      },
    },

    // -----------------------------------------------------------------------
    // Lesson 10 — PEG Ratio (Medium)
    // -----------------------------------------------------------------------
    {
      id: "peg-ratio",
      trackId: "financial-metrics-101",
      order: 10,
      title: "The PEG Ratio",
      concept: "Price/Earnings-to-Growth Ratio",
      difficulty: "Medium",
      fields: ["HF", "VC", "AM"],
      teaching: {
        intro:
          "The P/E ratio has a blind spot: it ignores growth. A P/E of 30 is cheap for a company growing 40% but expensive for one growing 5%. The PEG ratio fixes this — and it was alluded to back in Lesson 1 for a reason.",
        sections: [
          {
            heading: "What PEG is and how to calculate it",
            body: "PEG = P/E Ratio ÷ Earnings Growth Rate (%)\n\nThe earnings growth rate is typically the expected EPS growth over the next 1–3 years (forward-looking), though some analysts use the trailing growth rate.\n\nA company with P/E 30 growing earnings at 30% per year has a PEG of 1.0. A company with P/E 30 growing at 10% has a PEG of 3.0 — far more expensive on a growth-adjusted basis.",
            example:
              "Peter Lynch, the legendary Fidelity fund manager who averaged 29% annual returns, popularized PEG. He called a PEG of 1.0 'fairly valued' and looked for stocks with PEG below 0.5 as potential bargains.",
          },
          {
            heading: "How to interpret PEG",
            body: "The classic rule of thumb:\n\nPEG under 1.0 — Potentially undervalued: you're paying less than 1× for each unit of growth\nPEG around 1.0 — Fairly valued: price roughly matches growth expectations\nPEG above 2.0 — Potentially expensive: you're paying a high premium for growth\n\nLike all ratios, context matters — a PEG of 1.5 for a high-quality business with consistent 25% growth may be better than a PEG of 0.8 for a volatile, low-quality business.",
          },
          {
            heading: "Why PEG improves on P/E alone",
            body: "P/E answers 'what am I paying for today's earnings?'\nPEG answers 'what am I paying for future earnings growth?'\n\nThe difference is significant. Consider:\n- Stock A: P/E 12, growth 4% → PEG 3.0 — expensive despite low P/E\n- Stock B: P/E 45, growth 50% → PEG 0.9 — potentially cheap despite high P/E\n\nP/E alone would call Stock A the bargain. PEG reveals the opposite may be true.",
            example:
              "In Lesson 1 you saw Company A (P/E 15, growth 6%) vs. Company B (P/E 25, growth 31%). PEG: Company A = 15 ÷ 6 = 2.5. Company B = 25 ÷ 31 = 0.81. Company B was significantly better value — PEG quantifies exactly why.",
          },
          {
            heading: "Limitations of PEG",
            body: "PEG is only as good as the growth estimate. If analysts are too optimistic (common in bull markets), PEG will make stocks look cheaper than they are.\n\nPEG doesn't work for:\n- Loss-making companies (no P/E to use)\n- Very low-growth companies where tiny changes in estimate create wild PEG swings\n- Cyclical companies where earnings are distorted by the economic cycle\n\nUse PEG alongside FCF analysis, balance sheet quality, and competitive position — never in isolation.",
          },
        ],
        keyTakeaway:
          "PEG = P/E ÷ Growth Rate — it adjusts valuation for growth expectations; below 1.0 may be undervalued, above 2.0 may be expensive, but always verify the growth estimate.",
      },
      practice: [
        {
          question:
            "A company has a P/E of 40 and expected EPS growth of 25%. What is its PEG ratio?",
          options: ["0.6", "1.0", "1.6", "2.5"],
          correctIndex: 2,
          explanation:
            "PEG = P/E ÷ Growth = 40 ÷ 25 = 1.6. Moderately above 1.0 — not cheap, but not extreme for a 25% growth company.",
        },
        {
          question:
            "Company A has P/E 10 and 3% growth. Company B has P/E 35 and 40% growth. Which is cheaper on a PEG basis?",
          options: [
            "Company A — lower P/E always wins",
            "Company B — PEG of 0.875 vs Company A's PEG of 3.33",
            "They are equal",
            "You can't tell without more information",
          ],
          correctIndex: 1,
          explanation:
            "Company A PEG = 10 ÷ 3 = 3.33. Company B PEG = 35 ÷ 40 = 0.875. Despite P/E of only 10, Company A is far more expensive on a growth-adjusted basis — it's paying P/E 10 for almost no growth. Company B pays more but gets 40% growth in return.",
        },
        {
          question:
            "An analyst uses a very optimistic 60% growth estimate for a company. A more conservative estimate is 25%. How does this affect the PEG?",
          options: [
            "PEG is unaffected by the growth estimate",
            "The optimistic estimate produces a lower PEG, making the stock look cheaper than it may be",
            "The conservative estimate is always correct",
            "Higher growth estimates always improve valuation",
          ],
          correctIndex: 1,
          explanation:
            "PEG = P/E ÷ Growth Rate. If P/E is 50, using 60% growth gives PEG 0.83 (looks cheap). Using 25% growth gives PEG 2.0 (looks expensive). PEG is only as reliable as the growth assumption — garbage in, garbage out.",
        },
        {
          question:
            "For which type of company is PEG least useful?",
          options: [
            "A fast-growing SaaS company with 35% annual EPS growth",
            "A steady consumer brand with 12% annual EPS growth",
            "A cyclical energy company whose EPS swings wildly with oil prices",
            "A midsize retail chain with 18% EPS growth",
          ],
          correctIndex: 2,
          explanation:
            "PEG requires a reliable growth estimate. Cyclical companies' earnings are dominated by commodity prices, economic cycles, or one-time events — any growth estimate is highly uncertain. Applying a 'normal' growth rate to an abnormally high or low EPS produces a misleading PEG.",
        },
      ],
      apply: {
        setup:
          "You're building a watchlist of growth technology companies. Three candidates all have elevated P/E ratios. You want to use PEG to rank them by relative value.",
        data: [
          { label: "Company A — P/E Ratio", value: "55" },
          { label: "Company A — Expected EPS Growth (3yr)", value: "18%" },
          { label: "Company B — P/E Ratio", value: "72" },
          { label: "Company B — Expected EPS Growth (3yr)", value: "65%" },
          { label: "Company C — P/E Ratio", value: "38" },
          { label: "Company C — Expected EPS Growth (3yr)", value: "14%" },
        ],
        question:
          "Rank these companies from most to least attractively valued using PEG.",
        options: [
          "C, A, B — lowest P/E first",
          "B, A, C — Company B has the best PEG despite the highest P/E",
          "A, B, C — mid-range P/E is always best",
          "C, B, A — conservative growth estimates are most reliable",
        ],
        correctIndex: 1,
        explanation:
          "Company A PEG = 55 ÷ 18 = 3.06. Company B PEG = 72 ÷ 65 = 1.11. Company C PEG = 38 ÷ 14 = 2.71. Despite having the highest P/E, Company B is by far the most attractively valued on a growth-adjusted basis (PEG 1.11). Company C's low P/E is deceptive — its modest growth makes it the most expensive by PEG. This is exactly the insight PEG provides that raw P/E cannot.",
      },
    },

    // -----------------------------------------------------------------------
    // Lesson 11 — EV/EBITDA (Hard)
    // -----------------------------------------------------------------------
    {
      id: "ev-ebitda",
      trackId: "financial-metrics-101",
      order: 11,
      title: "EV/EBITDA",
      concept: "Enterprise Value & EBITDA",
      difficulty: "Hard",
      fields: ["IB", "PE"],
      teaching: {
        intro:
          "When investment bankers and private equity firms value a company for acquisition, they almost never use P/E. They use EV/EBITDA. Understanding why — and how to calculate it — puts you in the room with professional-grade analysis.",
        sections: [
          {
            heading: "Enterprise Value — the real acquisition price",
            body: "Market cap tells you the price of the equity. Enterprise Value (EV) tells you the total price to buy the entire business, including its debt and excluding its cash.\n\nFormula: EV = Market Cap + Total Debt − Cash & Cash Equivalents\n\nWhy add debt? If you buy a company, you inherit its debt — that's a real cost. Why subtract cash? You'd get that cash back immediately — so it reduces the net price you're paying.",
            example:
              "Company X: market cap $2B, debt $800M, cash $300M. EV = $2B + $800M − $300M = $2.5B. If you bought every share, you'd also pay $800M in debt but receive $300M in cash. The true cost is $2.5B.",
          },
          {
            heading: "EBITDA — earnings before the accountants get involved",
            body: "EBITDA = Earnings Before Interest, Taxes, Depreciation, and Amortization\n\nFormula: EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization\n\nWhy strip these out?\n\nInterest — depends on capital structure (how much debt), not business operations\nTaxes — vary by jurisdiction, not operational performance\nDepreciation & Amortization — non-cash accounting charges, not real cash spending\n\nThe result is a rough proxy for operating cash generation that can be compared across companies regardless of their debt levels, tax situations, or accounting policies.",
            example:
              "Two identical businesses: one financed with debt (higher interest), one with equity (lower interest). They'd have very different net incomes — but nearly identical EBITDA. This lets you compare the underlying business quality without the noise.",
          },
          {
            heading: "How to use EV/EBITDA",
            body: "EV/EBITDA = Enterprise Value ÷ EBITDA\n\nTypical ranges by sector:\n\nTechnology / SaaS: 15–40×\nHealthcare: 12–20×\nConsumer goods: 10–16×\nIndustrials: 8–12×\nRetail: 6–10×\nTelecom / Media: 7–12×\n\nA lower EV/EBITDA suggests cheaper valuation relative to operating earnings. But like all ratios, compare within the same sector and against the company's history.",
          },
          {
            heading: "Why professionals prefer it over P/E",
            body: "For M&A and private equity:\n\n1. Capital structure neutral: A company financed with debt vs. equity looks the same in EV/EBITDA (EV accounts for debt; EBITDA strips out interest)\n\n2. Useful for unprofitable companies: Some businesses have negative net income but positive EBITDA — P/E is meaningless, EV/EBITDA still works\n\n3. Cross-border comparison: Tax rates vary by country — EBITDA strips taxes out, enabling cleaner comparison across geographies\n\n4. Closer to cash flow: EBITDA, while imperfect, is a rough approximation of operating cash generation before reinvestment",
          },
        ],
        keyTakeaway:
          "EV/EBITDA = (Market Cap + Debt − Cash) ÷ EBITDA — it's the professional standard for comparing business valuations across capital structures and is the primary metric in M&A transactions.",
      },
      practice: [
        {
          question:
            "A company has a market cap of $5B, $1.5B in debt, and $500M in cash. What is its enterprise value?",
          options: ["$4B", "$5B", "$6B", "$7B"],
          correctIndex: 2,
          explanation:
            "EV = Market Cap + Debt − Cash = $5B + $1.5B − $500M = $6B.",
        },
        {
          question:
            "A company has net income of $80M, interest expense $20M, taxes $30M, and D&A of $40M. What is its EBITDA?",
          options: ["$80M", "$130M", "$170M", "$120M"],
          correctIndex: 2,
          explanation:
            "EBITDA = Net Income + Interest + Taxes + D&A = $80M + $20M + $30M + $40M = $170M.",
        },
        {
          question:
            "Two identical businesses operate in the same sector. Company A is financed entirely with equity. Company B has significant debt. Their P/E ratios look very different. What would EV/EBITDA show?",
          options: [
            "EV/EBITDA would also show very different valuations",
            "EV/EBITDA would show similar valuations, since it removes the effect of capital structure",
            "EV/EBITDA is only useful for the debt-heavy company",
            "You can't compare them at all",
          ],
          correctIndex: 1,
          explanation:
            "P/E is affected by interest expense (which lowers net income for the leveraged company). EV accounts for debt in the numerator, and EBITDA strips out interest in the denominator — the result is a capital-structure neutral comparison. Both companies would show similar EV/EBITDA since their underlying operations are identical.",
        },
        {
          question:
            "A SaaS company trades at EV/EBITDA of 8×. A competitor trades at 32×. What's the most likely explanation?",
          options: [
            "The competitor has more debt",
            "The low-multiple company likely has slower growth, lower margins, or greater business risk",
            "The low-multiple company is always the better investment",
            "EV/EBITDA of 8× is impossible for a SaaS company",
          ],
          correctIndex: 1,
          explanation:
            "SaaS companies typically trade at 15–40× EV/EBITDA. A company at 8× in this sector likely has significantly slower growth, deteriorating metrics, or a risk investors are pricing in. Low multiples aren't automatically cheap — the market may know something you don't.",
        },
      ],
      apply: {
        setup:
          "You're a junior analyst at an investment bank. Two industrial companies are potential acquisition targets. You need to present a comparative valuation using EV/EBITDA to your deal team.",
        data: [
          { label: "Target A — Market Cap", value: "$3.2B" },
          { label: "Target A — Total Debt", value: "$1.8B" },
          { label: "Target A — Cash", value: "$400M" },
          { label: "Target A — EBITDA", value: "$520M" },
          { label: "Target B — Market Cap", value: "$4.1B" },
          { label: "Target B — Total Debt", value: "$200M" },
          { label: "Target B — Cash", value: "$1.1B" },
          { label: "Target B — EBITDA", value: "$580M" },
          { label: "Sector Average EV/EBITDA", value: "9.5×" },
        ],
        question:
          "Which acquisition target is cheaper on an EV/EBITDA basis, and how do both compare to the sector average?",
        options: [
          "Target A at ~8.9× — below sector average; Target B at ~5.5× — significantly below sector average; Target B is cheaper",
          "Target A at ~9.6× — in line with sector; Target B at ~5.5× — significantly below sector average; Target B is cheaper",
          "Target A at ~8.9× — below sector average; Target B at ~9.7× — above sector average; Target A is cheaper",
          "They are the same — EBITDA is similar",
        ],
        correctIndex: 1,
        explanation:
          "Target A: EV = $3.2B + $1.8B − $0.4B = $4.6B. EV/EBITDA = $4.6B ÷ $520M = 8.85× — slightly below the 9.5× sector average. Target B: EV = $4.1B + $0.2B − $1.1B = $3.2B. EV/EBITDA = $3.2B ÷ $580M = 5.52× — significantly below sector average. Target B appears substantially cheaper on an EV/EBITDA basis despite its higher market cap, because it has much less debt and more cash — reducing its true enterprise value considerably.",
      },
    },
  ],
};

const dividendYield: Lesson = {
  id: "dividend-yield",
  trackId: "financial-metrics-101",
  order: 12,
  title: "Dividend Yield & Payout Ratio",
  concept: "Dividend Income & Sustainability",
  difficulty: "Easy",
  fields: ["AM", "HF", "IB"],
  teaching: {
    intro: "Not all investment returns come from price appreciation. Dividends — cash payments companies make to shareholders — are a critical part of total return. Knowing how to evaluate them separates income investors from traders.",
    sections: [
      {
        heading: "What Is Dividend Yield?",
        body: "Dividend yield measures how much a company pays in dividends each year relative to its stock price. It tells you the income return you earn just from holding the stock, independent of any price change.",
        example: "A stock priced at $50 that pays $2 per year in dividends has a yield of 4% ($2 ÷ $50). If the price falls to $40 with no dividend change, the yield rises to 5% — which is why a rising yield can be a warning sign rather than a reward.",
      },
      {
        heading: "What Is the Payout Ratio?",
        body: "The payout ratio shows what percentage of earnings a company pays out as dividends. It tells you whether the dividend is sustainable. A ratio below 50% is generally conservative. Above 80% is high-risk. Above 100% means the company is paying out more than it earns — a dividend cut is likely.",
        example: "Company A earns $4/share and pays $1.60 in dividends: payout ratio = 40% — very sustainable. Company B earns $3/share and pays $2.90: payout ratio = 97% — one bad quarter and the dividend is at risk.",
      },
      {
        heading: "What Makes a Good Dividend?",
        body: "The best dividends have three qualities: consistency (paid reliably for 10+ years), growth (increased over time), and sustainability (payout ratio in the 30–60% range with strong free cash flow coverage). A high yield with a stretched payout ratio is a yield trap — the income looks attractive until it's cut.",
      },
    ],
    keyTakeaway: "Dividend yield tells you what you earn today; payout ratio tells you if it will still be there tomorrow.",
  },
  practice: [
    {
      question: "A stock is priced at $40 and pays an annual dividend of $1.60 per share. What is the dividend yield?",
      options: ["2%", "4%", "6%", "8%"],
      correctIndex: 1,
      explanation: "$1.60 ÷ $40 = 0.04 = 4%. Dividend yield = Annual dividend per share ÷ Stock price.",
    },
    {
      question: "A company earns $5.00 per share and pays $4.50 per share in dividends. What is the payout ratio?",
      options: ["45%", "90%", "110%", "50%"],
      correctIndex: 1,
      explanation: "$4.50 ÷ $5.00 = 90%. A 90% payout ratio leaves very little cushion if earnings decline even modestly.",
    },
    {
      question: "A stock's dividend yield jumped from 3% to 6% over six months without any dividend increase. What most likely happened?",
      options: ["Earnings doubled", "The stock price fell roughly 50%", "The dividend was doubled", "Interest rates rose"],
      correctIndex: 1,
      explanation: "Yield = dividend ÷ price. If the dividend is unchanged and yield doubled, the price must have halved. A rising yield caused by a falling stock price is a warning, not an opportunity — investigate why the stock is falling.",
    },
    {
      question: "Which payout ratio is generally the most sustainable for a mature consumer staples company?",
      options: ["15%", "45%", "85%", "105%"],
      correctIndex: 1,
      explanation: "45% leaves room for earnings volatility while still returning meaningful capital to shareholders. 85% leaves little buffer. 105% means the company is paying out more than it earns — unsustainable. 15% is conservative but fine.",
    },
  ],
  apply: {
    setup: "You are comparing two mature consumer staples companies that both pay dividends. Company A: stock at $60, annual dividend $2.40/share, net income $4.00/share. Company B: stock at $45, annual dividend $2.70/share, net income $2.80/share.",
    data: [
      { label: "Company A — Stock price", value: "$60" },
      { label: "Company A — Annual dividend", value: "$2.40/share" },
      { label: "Company A — Net income/share", value: "$4.00" },
      { label: "Company B — Stock price", value: "$45" },
      { label: "Company B — Annual dividend", value: "$2.70/share" },
      { label: "Company B — Net income/share", value: "$2.80" },
    ],
    question: "Which company's dividend appears more sustainable, and why?",
    options: [
      "Company A — its lower payout ratio leaves room to absorb earnings volatility",
      "Company B — its higher yield means better income for investors",
      "Both are equally sustainable",
      "Company A — its higher stock price signals financial strength",
    ],
    correctIndex: 0,
    explanation: "Company A: yield = 4%, payout ratio = 60%. Company B: yield = 6%, payout ratio = 96.4%. Company B is paying out nearly all of its earnings. One bad quarter could force a dividend cut — which would likely send the stock price lower as well. Company A's yield is lower but its dividend is well-covered. The higher yield of Company B is a warning, not a reward.",
  },
};

// ---------------------------------------------------------------------------
// Track 2 — Reading the Market
// ---------------------------------------------------------------------------

const readingTheMarket: Track = {
  id: "reading-the-market",
  title: "Reading the Market",
  description:
    "Learn to separate signal from noise in headlines, spot stocks that are cheap for bad reasons, and understand what makes a business defensible over time.",
  difficulty: "Beginner",
  lessons: [
    {
      id: "headlines-vs-fundamentals",
      trackId: "reading-the-market",
      order: 1,
      title: "Headlines vs Fundamentals",
      concept: "Signal vs Noise",
      difficulty: "Easy",
      fields: ["HF", "AM"],
      teaching: {
        intro:
          "Markets react to emotion in the short term. A scary headline can send a great stock down 10%. Your job is to know whether the business actually changed — or just the mood.",
        sections: [
          {
            heading: "Why headlines mislead",
            body: "Stock prices react instantly to news — but the underlying business changes slowly. A single bad headline can erase months of gains even when the company's fundamentals are unchanged. The investor who can separate temporary sentiment from real business deterioration has a significant edge.",
            example:
              "In 2022, many quality tech companies fell 50–70% as interest rates rose. Their business models didn't change — but investor sentiment did. The companies that recovered fastest were the ones whose fundamentals had stayed intact.",
          },
          {
            heading: "Signal vs noise",
            body: "A signal is news that genuinely changes the business outlook: a major customer win, confirmed margin improvement, a regulatory setback, or a management departure tied to a pattern of problems. Noise creates price movement without altering long-term earning power: a missed quarter by 2%, a competitor announcement that doesn't apply, or a general market selloff.\n\nThe key question: does this news change what this business will earn 2–3 years from now?",
          },
          {
            heading: "One framework that works",
            body: "Before reacting to any headline, ask three questions:\n\n1. Does this change the revenue trajectory?\n2. Does this change the margin structure?\n3. Does this change the competitive position?\n\nIf the answer to all three is no, the price movement is almost certainly noise — and may be an opportunity.",
          },
        ],
        keyTakeaway:
          "Signal changes a company's business trajectory; noise changes its stock price temporarily — learning to tell them apart is the foundation of disciplined investing.",
      },
      practice: [
        {
          question:
            "'CFO resigns, cites personal reasons.' How should you treat this headline?",
          options: [
            "Ignore it — executives resign for personal reasons all the time",
            "Flag it as a potential red flag and check whether it fits a pattern of other problems",
            "Immediately sell — CFO departures always precede bad news",
            "Buy the dip — the market always overreacts to executive changes",
          ],
          correctIndex: 1,
          explanation:
            "A CFO resignation alone isn't a verdict. But combined with other weak signals — declining margins, falling revenue, rising short interest — it becomes meaningful. Investigate the pattern before deciding.",
        },
        {
          question:
            "A quality SaaS company with 32% revenue growth and 124% net revenue retention drops 8% after an analyst downgrades it on 'valuation concerns.' Fundamentals are unchanged. What's the right response?",
          options: [
            "Sell — analysts have proprietary models and are usually right",
            "Review the fundamentals; if unchanged, the drop is a sentiment move not a business one",
            "Buy immediately — any analyst downgrade is a contrarian buy signal",
            "Wait for a second analyst opinion before deciding",
          ],
          correctIndex: 1,
          explanation:
            "A valuation downgrade doesn't change business quality. 32% growth and 124% NRR don't disappear because an analyst updated a spreadsheet. If the fundamentals are unchanged, the 8% drop is noise. Review your own thesis and decide based on it.",
        },
        {
          question:
            "'Hyperscaler order book grows 40% quarter-over-quarter.' For a GPU semiconductor company, this is:",
          options: [
            "Noise — order books fluctuate every quarter",
            "A strong signal — hyperscaler orders are large, sticky, and represent durable demand",
            "A red flag — heavy dependence on a few large customers is always risky",
            "Unrelated to stock price — orders don't equal revenue",
          ],
          correctIndex: 1,
          explanation:
            "Orders from hyperscalers (Amazon, Microsoft, Google) are large-scale commitments that take months to fulfill. A 40% quarter-over-quarter increase signals accelerating structural demand — this changes the earnings trajectory, not just sentiment.",
        },
        {
          question:
            "A streaming company raises prices 15%. Headlines read: 'Price hike drives subscriber churn fears.' But ad-tier subscriptions are up 60% year-over-year and free cash flow just turned positive for the first time. What's your read?",
          options: [
            "The headline is right — churn will hurt long-term",
            "The fundamentals (FCF turning positive, ad-tier growth) outweigh the short-term sentiment",
            "You need the actual churn data before forming any view",
            "Price hikes always damage streaming businesses long-term",
          ],
          correctIndex: 1,
          explanation:
            "The headline captures short-term fear. FCF turning positive for the first time is a structural milestone — the business model is now self-sustaining. Ad-tier growth of 60% is a new durable revenue stream. The market is pricing in the fear; the smart read is the numbers.",
        },
      ],
      apply: {
        setup:
          "You own shares in a streaming media company. This week two headlines hit: 'Price increase triggers short-term churn concerns' and 'Ad-tier subscriptions surge 60% year-over-year.' You want to decide whether to hold or sell.",
        data: [
          { label: "Revenue growth (YoY)", value: "+14%" },
          { label: "Ad-tier subscription growth", value: "+60% YoY" },
          { label: "Free cash flow", value: "Positive for first time" },
          { label: "Subscriber churn (estimated)", value: "2.1% (in-line)" },
          { label: "P/E ratio", value: "28×" },
        ],
        question:
          "Based on the data, how do you classify the churn headline?",
        options: [
          "Signal — churn directly threatens the revenue trajectory",
          "Noise — churn came in in-line while FCF and ad-tier are structurally improving",
          "Unclear — need another quarter of data to decide",
          "Signal — any subscriber loss is a fundamental problem for a streaming business",
        ],
        correctIndex: 1,
        explanation:
          "Churn of 2.1% is in-line with expectations — it's not a surprise. Meanwhile, FCF turning positive and ad-tier growing 60% are genuine structural improvements. The headline created fear; the data says the business got stronger. This is noise — and holding is the right call.",
      },
    },
    {
      id: "value-trap",
      trackId: "reading-the-market",
      order: 2,
      title: "The Value Trap",
      concept: "Value Traps & Deteriorating Businesses",
      difficulty: "Medium",
      fields: ["HF", "AM", "PE"],
      teaching: {
        intro:
          "The most dangerous stocks aren't the ones that look expensive — they're the ones that look cheap. A low P/E on a deteriorating business can destroy capital just as fast as a speculative bet.",
        sections: [
          {
            heading: "What is a value trap?",
            body: "A value trap is a stock that looks cheap by traditional metrics — low P/E, low price-to-book — but keeps getting cheaper because the underlying business is deteriorating. The 'cheap' multiple reflects rational pessimism, not an overlooked bargain. The most dangerous phrase in investing: 'but the P/E is only 6.'",
          },
          {
            heading: "The classic warning signs",
            body: "Value traps share a pattern: revenue declining in a growing industry (losing market share), margin compression over multiple consecutive quarters, key management departures without clear successors, and structural headwinds — technology disruption, regulatory pressure, changing consumer behavior — with no credible response from management.\n\nOne signal alone might be explainable. A cluster of them is the warning.",
            example:
              "A mall-based retailer in 2018: P/E of 7, declining same-store sales, falling margins, CFO departure, no e-commerce strategy. Investors kept buying 'the cheap P/E.' Two years later, bankruptcy.",
          },
          {
            heading: "Cheap vs cheap for a reason",
            body: "The key question isn't 'is this cheap?' — it's 'why is this cheap, and will that reason get better or worse?' If the business is losing ground structurally, the low P/E won't protect you. As earnings fall, even a 5× P/E on shrinking earnings is expensive. The multiple looks lower and lower right up until earnings disappear entirely.",
          },
        ],
        keyTakeaway:
          "A low P/E is only attractive if the earnings are sustainable — always ask why the stock is cheap before concluding it's a bargain.",
      },
      practice: [
        {
          question:
            "A mid-tier retailer has a P/E of 5, but same-store sales have fallen 4% for three consecutive years. This is most likely:",
          options: [
            "A great value — the low P/E provides a margin of safety",
            "A value trap — the earnings base is deteriorating alongside the multiple",
            "A cyclical buy — retail always recovers",
            "A strong buy — the market is overreacting to temporary weakness",
          ],
          correctIndex: 1,
          explanation:
            "A P/E of 5 looks cheap, but the 'E' is shrinking every year. As same-store sales decline, earnings follow — and a falling denominator makes the multiple look lower right up until earnings collapse. This is the mechanical definition of a value trap.",
        },
        {
          question: "Which of these is NOT a value trap warning sign?",
          options: [
            "Three consecutive quarters of declining profit margins",
            "A CFO departure with no named successor announced",
            "Multiple company insiders purchasing stock in the open market",
            "Revenue declining faster than the broader industry",
          ],
          correctIndex: 2,
          explanation:
            "Insider open-market purchases are a positive signal — management is putting personal money in at today's price. The other three (margin compression, unexplained executive exits, underperforming peers) are classic value trap indicators.",
        },
        {
          question:
            "A company has a P/E of 8 and profit margin of 20%. But its sector is contracting and it has no credible strategy to adapt. What's the call?",
          options: [
            "Buy — great margins and a low valuation together are rare",
            "Hold — current margins are healthy so there's no immediate problem",
            "Pass — structural decline makes today's good margins tomorrow's problem",
            "Short — it will fail within a year",
          ],
          correctIndex: 2,
          explanation:
            "Current margins can't save a business with no path forward. If the entire addressable market is shrinking and management has no plan, today's 20% margin is a lagging indicator. Pass protects your capital.",
        },
        {
          question:
            "A regional bank trades at P/E 9 with 22% profit margins. But 70% of its loan book is in commercial real estate, and office vacancy rates just hit a 25-year high. What risk is the cheap valuation masking?",
          options: [
            "The P/E of 9 is still too high for a regional bank",
            "The 22% profit margin is unsustainably high",
            "Heavy CRE exposure means loan losses could impair the earnings that make this multiple look cheap",
            "High interest rates are universally good for banks so the risk is overstated",
          ],
          correctIndex: 2,
          explanation:
            "The 9× P/E looks cheap — until you realize the earnings it's calculated on are at risk. With 70% of loans in commercial real estate during a structural shift in office demand, a wave of defaults could spike loss provisions and erase those margins. The market may already be pricing this in with the low multiple.",
        },
      ],
      apply: {
        setup:
          "You're evaluating a mid-tier apparel retailer. The stock has fallen 40% in 18 months and now trades at a P/E of 6 — cheap by any historical standard. You need to decide if it's a bargain or a trap.",
        data: [
          { label: "P/E ratio", value: "6×" },
          { label: "Revenue growth (YoY)", value: "-4%" },
          { label: "Same-store sales (3yr trend)", value: "-3%, -4%, -4%" },
          { label: "Net profit margin", value: "3% (down from 11%)" },
          { label: "E-commerce revenue share", value: "4% of total" },
          { label: "CFO status", value: "Resigned 6 weeks ago" },
        ],
        question:
          "Is this stock a value opportunity or a value trap?",
        options: [
          "Value opportunity — P/E of 6 provides a large margin of safety",
          "Value trap — declining revenue, margin compression, leadership exit, and no digital strategy are clustered warning signs",
          "Unclear — need one more quarter of data to decide",
          "Value opportunity — the stock has already fallen 40%, limiting further downside",
        ],
        correctIndex: 1,
        explanation:
          "Every value trap indicator is present: three consecutive years of same-store sales decline, margin compression from 11% to 3%, a CFO departure, and almost no e-commerce presence. A P/E of 6 on eroding earnings isn't cheap — it's expensive on the earnings that will exist in two years. The 40% decline is not a floor; it's a starting point for further deterioration.",
      },
    },
    {
      id: "competitive-moats",
      trackId: "reading-the-market",
      order: 3,
      title: "Competitive Moats",
      concept: "Durable Competitive Advantage",
      difficulty: "Medium",
      fields: ["HF", "VC", "AM", "PE"],
      teaching: {
        intro:
          "A great business at a fair price beats a fair business at a great price — almost every time. The difference is the moat: what protects the business from competition eating its margins.",
        sections: [
          {
            heading: "What is a moat?",
            body: "A moat is a durable competitive advantage that protects a business from competition. Companies with strong moats can sustain high profit margins for years because competitors cannot easily replicate what makes the business special. Without a moat, profits attract competition, margins compress, and returns erode.",
          },
          {
            heading: "The five types of moats",
            body: "Switching costs: customers are locked in because leaving is expensive or painful (enterprise software, banking relationships).\n\nNetwork effects: the product gets more valuable as more people use it (social platforms, payment networks, marketplaces).\n\nBrand: customers pay a premium for the name or trust it above alternatives (luxury goods, consumer staples).\n\nCost advantage: structural ability to produce cheaper than any rival (scale economics, proprietary sourcing, distribution).\n\nIntangibles: patents, licenses, regulatory approvals that take years or billions to replicate (pharmaceuticals, semiconductors).",
            example:
              "Visa's moat is a network effect: the more merchants accept Visa, the more consumers want it; the more consumers carry it, the more merchants must accept it. This flywheel took decades to build and is nearly impossible to replicate from scratch.",
          },
          {
            heading: "Why moats matter to investors",
            body: "A business without a moat can have great earnings today — but one well-funded competitor could erode those earnings within years. A moated business can raise prices, stumble for a quarter, and still recover because the structural advantages protect it.\n\nThe practical test: why can't a competitor with $1 billion and five years take meaningful share from this business? If you can't answer clearly, the moat may not be as strong as it looks.",
          },
        ],
        keyTakeaway:
          "Moats determine whether today's high margins survive tomorrow's competition — identify the specific structural advantage before assuming it will persist.",
      },
      practice: [
        {
          question:
            "A cloud software company reports 124% net revenue retention — existing customers expand their spend by 24% per year without being actively upsold. What moat does this most clearly signal?",
          options: [
            "Switching cost moat — customers are deeply embedded and expansion is the path of least resistance",
            "No moat — retention could fall if a better product emerges",
            "Cost advantage — the company offers the lowest-priced option",
            "Brand moat — customers trust the name and won't leave",
          ],
          correctIndex: 0,
          explanation:
            "120%+ net revenue retention is the clearest indicator of high switching costs. Customers are expanding usage because the product is embedded in their workflows — switching would require ripping out infrastructure and retraining teams. This is the operational definition of a switching cost moat.",
        },
        {
          question:
            "A retailer has 900 physical stores and strong brand recognition. But online competitors are taking market share and margins have fallen each year for four years. Does this company have a durable moat?",
          options: [
            "Yes — brand recognition is always a powerful moat",
            "No — a brand that can't defend margins against online competition is leaking",
            "Yes — 900 physical stores are hard to replicate",
            "Unclear — need to see one more year of data",
          ],
          correctIndex: 1,
          explanation:
            "Brand is only a moat if it generates pricing power or loyalty that competitors cannot overcome. A brand that loses margin every year to online rivals isn't protecting the business. The stores are a cost — not an advantage — when consumers shop online.",
        },
        {
          question:
            "A GPU maker's software tools are embedded in AI research at every major lab and hyperscaler. The software is free, but switching hardware would require rewriting years of custom code. What type of moat is this?",
          options: [
            "Cost advantage — giving away software lowers the effective price to customers",
            "Switching cost moat — the ecosystem creates hardware lock-in without any explicit lock-in contract",
            "Network effect moat — more users make the tools better for everyone",
            "No moat — free software is easily replicated by well-funded competitors",
          ],
          correctIndex: 1,
          explanation:
            "The free software creates an enormous switching cost. Even though it costs nothing, the ecosystem it creates means customers would need to rewrite years of workflows to use a competitor's hardware. The moat isn't the software price — it's the dependency the software creates.",
        },
        {
          question:
            "Two pharmaceutical companies: Company A holds 14 patents on a drug that treats a rare disease with no current alternative. Company B makes a generic aspirin with no patents. Which has the stronger moat?",
          options: [
            "Company B — aspirin has global scale and universal brand recognition",
            "Company A — patent-protected exclusivity on an irreplaceable treatment is a powerful intangible moat",
            "They are equivalent — both sell pharmaceutical products",
            "Company B — generics have lower regulatory risk",
          ],
          correctIndex: 1,
          explanation:
            "Patents are a classic intangible moat — they create legal exclusivity that competitors literally cannot cross until the patent expires. A drug with no alternative for a rare disease compounds this further: demand is inelastic. Company B's unpatented generic faces constant price competition from any manufacturer.",
        },
      ],
      apply: {
        setup:
          "You're comparing two payment technology companies. Both are profitable and growing. You want to assess which has the more durable competitive position before deciding where to invest.",
        data: [
          { label: "Company A — Business model", value: "Two-sided payment network (issuers + merchants)" },
          { label: "Company A — Active merchants", value: "80M globally" },
          { label: "Company A — Revenue growth", value: "+11% YoY" },
          { label: "Company A — Net margin", value: "51%" },
          { label: "Company B — Business model", value: "Payment processing software for small businesses" },
          { label: "Company B — Revenue growth", value: "+28% YoY" },
          { label: "Company B — Net margin", value: "9%" },
          { label: "Company B — Customer churn rate", value: "18% annually" },
        ],
        question:
          "Which company has the more durable competitive moat?",
        options: [
          "Company B — faster revenue growth indicates a stronger competitive position",
          "Company A — a two-sided network with 80M merchants is self-reinforcing and extremely hard to displace",
          "Company B — software businesses always have stronger moats than payment networks",
          "They are equal — both are growing profitably",
        ],
        correctIndex: 1,
        explanation:
          "Company A's two-sided network is a classic network effect moat: merchants join because consumers use it; consumers use it because merchants accept it. 80M merchants took decades to build and creates enormous switching costs for both sides. Company B's 18% annual churn reveals weak switching costs — nearly 1 in 5 customers leaves every year. High growth with high churn is a leaky bucket, not a moat.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 4 — Sector Rotation (Medium)
    // -----------------------------------------------------------------------
    {
      id: "sector-rotation",
      trackId: "reading-the-market",
      order: 4,
      title: "Sector Rotation",
      concept: "Economic Cycles & Capital Flows",
      difficulty: "Medium",
      fields: ["AM", "HF"],
      teaching: {
        intro:
          "Markets don't move in one direction forever — and neither does every sector. Professional investors rotate capital between sectors as the economic cycle evolves. Understanding where we are in the cycle tells you where the smart money is moving next.",
        sections: [
          {
            heading: "What sector rotation is",
            body: "Sector rotation is the movement of investment capital from one industry group to another as economic conditions change. Different sectors of the economy outperform at different stages of the business cycle — and institutional investors reposition portfolios ahead of those transitions, not after them.\n\nThe S&P 500 has 11 sectors: Technology, Financials, Healthcare, Consumer Discretionary, Consumer Staples, Industrials, Energy, Materials, Real Estate, Utilities, and Communication Services.",
          },
          {
            heading: "Which sectors lead at each cycle stage",
            body: "Early cycle (recovery): Financials, Consumer Discretionary, Industrials. Credit loosens, consumers spend, businesses invest.\n\nMid cycle (expansion): Technology, Communication Services. Growth accelerates, corporate earnings expand.\n\nLate cycle (peak): Energy, Materials. Inflation rises, commodities benefit, credit tightens.\n\nRecession (contraction): Consumer Staples, Healthcare, Utilities. Defensive sectors with inelastic demand hold up as others fall.",
            example:
              "In 2022, as the Fed began aggressively raising rates, technology stocks (mid-cycle darlings) collapsed while energy stocks surged — a textbook late-cycle rotation driven by inflation and commodity demand.",
          },
          {
            heading: "How to use rotation as a signal",
            body: "Watch relative strength between sectors: which groups are outperforming the S&P 500 and which are lagging? A sustained rotation into defensive sectors (Staples, Utilities, Healthcare) — combined with weakening Discretionary and Tech — is a leading signal that professional money is pricing in an economic slowdown.\n\nRotation is not a trading system. It's a contextual lens: it tells you whether the macro backdrop is becoming a headwind or tailwind for individual positions.",
          },
        ],
        keyTakeaway:
          "Different sectors lead at different economic cycle stages — tracking where capital is rotating tells you what the market is pricing in about the economic outlook.",
      },
      practice: [
        {
          question:
            "The Fed just began cutting interest rates and credit conditions are loosening after a recession. Which sectors typically outperform at this stage?",
          options: [
            "Energy and Materials — commodity demand drives early recovery",
            "Consumer Staples and Utilities — defensive sectors benefit from uncertainty",
            "Financials and Consumer Discretionary — credit expansion and spending recovery begin",
            "Healthcare and Real Estate — inflation protection becomes priority",
          ],
          correctIndex: 2,
          explanation:
            "The early cycle (recovery from recession) typically favors Financials and Consumer Discretionary. Loosening credit conditions lift bank margins and loan growth; recovering consumer confidence drives spending on non-essential goods. These sectors tend to move before the broader economy visibly turns.",
        },
        {
          question:
            "Technology and Communication Services have significantly underperformed the S&P 500 for six months while Utilities and Consumer Staples have outperformed. What does this most likely signal?",
          options: [
            "Technology is overvalued and should be shorted",
            "Institutional investors are rotating defensively — pricing in an economic slowdown",
            "Utility and Staples stocks have become growth investments",
            "Nothing meaningful — sector performance always fluctuates randomly",
          ],
          correctIndex: 1,
          explanation:
            "Sustained rotation from high-growth sectors (Tech, Communication) into defensive sectors (Utilities, Staples) is a classic institutional repositioning signal. These allocators are reducing economic sensitivity before a slowdown materializes — they're pricing in deceleration ahead of the data.",
        },
        {
          question:
            "Inflation is running at 6%, commodity prices are surging, and the central bank is hiking rates aggressively. Which sector is most likely to outperform?",
          options: [
            "Technology — rising rates slow competitors but not market leaders",
            "Consumer Discretionary — inflation forces spending on essentials over luxuries",
            "Energy — late-cycle commodity demand and inflation benefit oil and gas producers",
            "Real Estate — rising rates always help property values",
          ],
          correctIndex: 2,
          explanation:
            "Energy is the quintessential late-cycle sector. High inflation boosts commodity prices, energy producers generate higher revenues per barrel, and their cost bases don't rise as fast. Real Estate is actually hurt by rising rates (mortgage costs, cap rate expansion). Tech multiples compress as the discount rate rises.",
        },
        {
          question:
            "An investor sees defensive sectors (Staples, Healthcare, Utilities) beginning to meaningfully outperform. They hold a portfolio heavily weighted toward cyclical growth stocks. What is the most rational response?",
          options: [
            "Do nothing — sector rotation is a lagging indicator and it's too late to act",
            "Immediately exit all cyclical positions — a recession is guaranteed",
            "Review cyclical positions for recession resilience and consider trimming the most economically sensitive",
            "Double down on cyclicals — defensive outperformance is always a contrarian buy signal",
          ],
          correctIndex: 2,
          explanation:
            "Defensive sector outperformance is a signal worth acting on — but not a guaranteed recession call. The disciplined response is to review existing cyclical positions: do they have the earnings durability and balance sheet strength to weather a slowdown? Trim the most vulnerable, not all of them. Markets can price in fears that don't materialize.",
        },
      ],
      apply: {
        setup:
          "You are reviewing your portfolio. Over the past four months, Consumer Staples and Healthcare have outperformed the S&P 500 by 12%, while Technology and Consumer Discretionary have underperformed by 9%. The yield curve is inverted. You hold a 70% weighting in growth-oriented Technology stocks.",
        data: [
          { label: "Staples vs S&P (4 months)", value: "+12% relative" },
          { label: "Healthcare vs S&P (4 months)", value: "+11% relative" },
          { label: "Technology vs S&P (4 months)", value: "-9% relative" },
          { label: "Consumer Discretionary vs S&P", value: "-8% relative" },
          { label: "Yield curve (2yr vs 10yr)", value: "Inverted (-0.4%)" },
          { label: "Your Tech weighting", value: "70% of portfolio" },
        ],
        question:
          "What does the combination of defensive sector outperformance and yield curve inversion tell you about your portfolio positioning?",
        options: [
          "Portfolio is well-positioned — Technology outperforms after yield curve inversions",
          "The signals suggest institutional money is pricing in a slowdown; 70% Tech concentration carries elevated cycle risk worth reducing",
          "Rotate entirely into Staples and Healthcare immediately — recession is certain",
          "Do nothing — four months of data is too short to draw conclusions",
        ],
        correctIndex: 1,
        explanation:
          "Defensive outperformance plus an inverted yield curve are two historically reliable signals that the market is pricing in an economic slowdown. A 70% Technology weighting in this environment carries concentration risk — Tech tends to see multiple compression and earnings pressure in downturns. The right response isn't panic selling but thoughtful reduction of the most economically sensitive positions in favor of greater resilience.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 5 — Macro Signals (Medium)
    // -----------------------------------------------------------------------
    {
      id: "macro-signals",
      trackId: "reading-the-market",
      order: 5,
      title: "Macro Signals",
      concept: "Interest Rates, Inflation & the Yield Curve",
      difficulty: "Medium",
      fields: ["HF", "AM", "IB"],
      teaching: {
        intro:
          "Individual stock analysis is only half the picture. The macro backdrop — interest rates, inflation, and the yield curve — determines the water temperature every stock swims in. A great business in a rising-rate environment can still underperform for years. Macro context is the frame around every fundamental thesis.",
        sections: [
          {
            heading: "How interest rates affect stock valuations",
            body: "Stock prices are the present value of future cash flows. The rate used to discount those future earnings is tied to prevailing interest rates. When rates rise, the discount rate increases, which mathematically reduces the present value of distant future cash flows.\n\nGrowth stocks (whose earnings are weighted far in the future) are most affected. Value stocks (with earnings heavily in the near term) are less sensitive. This is why rising rates tend to crush high-multiple growth stocks even when their fundamentals are unchanged.",
            example:
              "In 2022, the Fed raised rates from 0.25% to 4.5%. Many high-quality SaaS companies with P/E ratios of 80–100× fell 60–80% — not because the business deteriorated, but because the discount rate roughly doubled, compressing the present value of long-dated earnings dramatically.",
          },
          {
            heading: "Inflation's effect on margins and multiples",
            body: "Inflation affects companies in two ways: cost push (input costs rise, compressing margins for companies that can't pass them on) and multiple compression (the Fed raises rates to fight inflation, which raises the discount rate).\n\nCompanies with pricing power — brands, monopolies, switching cost moats — can pass inflation through to customers. Companies without it see margins crushed. This is why inflation environments sort businesses by the strength of their competitive positions.",
          },
          {
            heading: "Reading the yield curve",
            body: "The yield curve plots interest rates on government bonds across different maturities (2-year, 10-year, 30-year). Normally it slopes upward: long-term rates are higher than short-term rates because lenders demand more for tying up money longer.\n\nAn inverted yield curve (short-term rates higher than long-term rates) has preceded every US recession in the past 50 years. It signals that the market expects rates to fall in the future — which only happens if the economy slows significantly. It's not a timing tool, but it's a reliable direction signal.",
          },
        ],
        keyTakeaway:
          "Rising rates hurt long-duration growth stocks most; an inverted yield curve signals the market is pricing in future rate cuts (and economic weakness); inflation rewards pricing power.",
      },
      practice: [
        {
          question:
            "The Fed raises rates from 2% to 5% over 18 months. Which type of stock is most negatively affected, assuming no change in business fundamentals?",
          options: [
            "A bank with a P/E of 10 and earnings concentrated in the current year",
            "A utility with stable dividends and no growth",
            "A high-growth software company with P/E of 90 and most earnings projected 5+ years out",
            "A consumer staples company with consistent 5% annual earnings growth",
          ],
          correctIndex: 2,
          explanation:
            "Duration risk in equities mirrors duration in bonds: stocks with most of their value tied to distant future earnings are most hurt by rising discount rates. A P/E 90 growth company's valuation is almost entirely dependent on earnings 5–10 years out — when you raise the discount rate, that present value collapses. The bank (near-term earnings) and staples company are far less affected.",
        },
        {
          question:
            "Inflation runs at 7% for three quarters. Company A has strong brand pricing power and raises prices 8% without losing customers. Company B is a price-competitive manufacturer with thin margins. What happens to their relative performance?",
          options: [
            "Both benefit — inflation raises the nominal value of all inventories",
            "Company A's margins are protected; Company B's margins are compressed as costs rise without equivalent pricing power",
            "Company B benefits from higher inventory values; Company A loses pricing advantage",
            "Both are equally protected — inflation affects all companies equally",
          ],
          correctIndex: 1,
          explanation:
            "Pricing power is the key differentiator in inflationary environments. Company A can pass cost increases to customers without volume loss — margins hold. Company B faces rising input costs without the ability to fully recover them through higher prices — margins compress. Inflation is a stress test for competitive position.",
        },
        {
          question:
            "The 2-year Treasury yield is 5.2% and the 10-year Treasury yield is 4.4%. What does this yield curve shape historically signal?",
          options: [
            "Normal conditions — short-term rates always exceed long-term rates",
            "Inflationary acceleration — markets expect rates to keep rising long-term",
            "An inverted yield curve, historically associated with increased recession probability",
            "A bond market bubble — yields are too compressed to be meaningful",
          ],
          correctIndex: 2,
          explanation:
            "When short-term rates exceed long-term rates (2yr > 10yr), the yield curve is inverted. This inversion has preceded every US recession in modern history. It reflects the market's expectation that the central bank will eventually cut rates — which typically only happens in response to economic weakness.",
        },
        {
          question:
            "An investor holds a technology-heavy portfolio with an average P/E of 65. The Fed signals it will begin a rate-cutting cycle. What is the most likely near-term impact on the portfolio?",
          options: [
            "Negative — falling rates signal economic weakness that will hurt tech earnings",
            "Neutral — P/E ratios are not affected by interest rate changes",
            "Positive — lower discount rates mechanically increase the present value of long-duration earnings",
            "Negative — the Fed only cuts when companies are struggling, so earnings will fall",
          ],
          correctIndex: 2,
          explanation:
            "Falling discount rates increase the present value of future cash flows — the mathematical opposite of rising rates. High-multiple growth stocks are the most rate-sensitive equities, so rate cuts benefit them disproportionately. The portfolio would likely re-rate upward as investors apply lower discount rates to those future earnings.",
        },
      ],
      apply: {
        setup:
          "You are evaluating a high-growth cloud software company with P/E of 75. It has excellent fundamentals — 35% revenue growth, 130% net revenue retention, expanding margins. But the Fed has just signaled two more rate hikes and the yield curve has inverted for the second consecutive month.",
        data: [
          { label: "Revenue growth", value: "+35% YoY" },
          { label: "Net revenue retention", value: "130%" },
          { label: "P/E ratio", value: "75×" },
          { label: "Fed guidance", value: "+2 more hikes expected" },
          { label: "Yield curve", value: "Inverted for 2 months" },
          { label: "Gross margin", value: "74%" },
        ],
        question:
          "How should the macro environment factor into your position sizing decision?",
        options: [
          "Ignore macro — the fundamentals are excellent and macro timing is impossible",
          "The macro environment creates a valuation headwind for a high-multiple stock; strong fundamentals don't eliminate multiple compression risk from rising rates",
          "Sell immediately — inverted yield curves always predict tech selloffs",
          "Buy aggressively — strong fundamentals always override macro headwinds",
        ],
        correctIndex: 1,
        explanation:
          "Strong fundamentals and a challenging macro environment can both be true simultaneously. At 75× earnings, this stock's valuation is extremely rate-sensitive — every point of discount rate increase meaningfully reduces its theoretical present value, regardless of underlying business quality. The disciplined response is to hold a smaller position than the fundamental quality alone would justify, and to size it relative to the macro-created multiple compression risk.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 6 — Bull & Bear Markets (Easy)
    // -----------------------------------------------------------------------
    {
      id: "bull-bear-markets",
      trackId: "reading-the-market",
      order: 6,
      title: "Bull & Bear Markets",
      concept: "Market Cycles & Investor Behavior",
      difficulty: "Easy",
      fields: ["IB", "PE", "HF", "VC", "AM"],
      teaching: {
        intro:
          "Bull and bear markets are the seasons of investing. Knowing which one you're in changes how you think about risk, opportunity, and your own psychological biases. The investors who perform best long-term learn to behave rationally in both.",
        sections: [
          {
            heading: "Definitions and what drives them",
            body: "A bull market is a sustained rise of 20% or more from a recent low, typically accompanied by economic expansion, rising corporate earnings, and investor optimism. A bear market is a decline of 20% or more from a recent high — driven by some combination of economic contraction, earnings deterioration, rising rates, or collapsing investor confidence.\n\nBull markets last longer than bear markets on average — but bear markets feel longer because losses are psychologically more painful than equivalent gains are pleasant.",
            example:
              "The bull market from March 2009 to February 2020 — the longest in US history — ran 11 years and produced roughly 400% returns on the S&P 500. The bear market that followed (COVID crash) erased 34% in five weeks, one of the fastest in history, before recovery.",
          },
          {
            heading: "How investor behavior changes in each",
            body: "In bull markets: investors extrapolate recent gains, underestimate risk, concentrate in winners, and dismiss warnings. FOMO drives capital into increasingly speculative assets. Valuations stretch well beyond historical averages because optimism overwhelms discipline.\n\nIn bear markets: investors extrapolate recent losses, overestimate risk, panic-sell at lows, and abandon long-term plans. This is when good businesses trade at generational discounts — but fear makes them feel dangerous rather than attractive.",
          },
          {
            heading: "The biggest mistake investors make in each",
            body: "In a bull market: confusing rising prices with investment skill. Anyone who owned equities in 2009–2021 made money. That doesn't mean they were making good decisions — the tide lifted all boats. The danger is taking on excessive risk that's invisible until the bull ends.\n\nIn a bear market: panic selling at the worst possible time. The average investor significantly underperforms indexes because they sell after declines (locking in losses) and buy after recoveries (chasing). Staying invested in quality businesses through a bear market is almost always the superior strategy.",
          },
        ],
        keyTakeaway:
          "Bull markets reward risk-taking and punish caution; bear markets reward patience and punish panic — the rational response to each is the opposite of what emotions suggest.",
      },
      practice: [
        {
          question:
            "The S&P 500 falls 28% from its peak over six months. Which investor response has historically produced the best long-term outcomes?",
          options: [
            "Sell everything and wait for the market to bottom before re-entering",
            "Stay invested in quality businesses and add selectively at lower prices",
            "Move entirely to cash until the yield curve un-inverts",
            "Short the market — bear markets average 18 months, providing a long opportunity",
          ],
          correctIndex: 1,
          explanation:
            "Staying invested in quality businesses through bear markets — and adding at lower prices if possible — has historically outperformed market timing. The problem with waiting for 'the bottom' is that you need to be right twice (when to exit and when to re-enter), and the sharpest recoveries often happen before the economic data confirms a turn.",
        },
        {
          question:
            "During a bull market, a stock you own has risen 80% in 12 months on the same fundamental thesis you had at purchase. The valuation has now expanded to levels well above the company's historical average. What is the most disciplined response?",
          options: [
            "Hold the full position — a rising stock is confirmation the thesis is correct",
            "Review the original thesis: if the business hasn't changed proportionally, the valuation expansion is a risk, not a reason to add",
            "Add to the position — momentum in bull markets tends to continue",
            "Sell immediately — 80% is a good return and bull markets always end",
          ],
          correctIndex: 1,
          explanation:
            "Bull markets tempt investors to confuse a rising price with a strengthening thesis. A stock that's risen 80% while fundamentals improved 20% is now priced for more optimism than when you bought it — not less. Reviewing the original thesis and trimming at stretched valuations is disciplined portfolio management, not market timing.",
        },
        {
          question:
            "An investor's portfolio is down 35% in a bear market. All holdings are in high-quality businesses with strong balance sheets and no credit risk. The rational response is:",
          options: [
            "Sell to prevent further losses — 35% down can always go further",
            "Stay the course — unrealized losses on quality businesses are temporary volatility, not permanent impairment",
            "Hedge with put options to protect remaining capital",
            "Rotate into cash-equivalent assets until the market stabilizes",
          ],
          correctIndex: 1,
          explanation:
            "A 35% decline in quality businesses with strong balance sheets is almost certainly volatility, not permanent impairment. These companies will survive the bear market and recover when sentiment does. Selling locks in the loss and requires a second correct decision (when to re-enter) to recover. Quality businesses held through bear markets have historically recovered and gone on to new highs.",
        },
        {
          question:
            "It's late in a bull market. Retail investors are pouring money into speculative assets, IPOs are trading 100%+ above issue price on the first day, and almost every pundit is calling for further gains. What does this sentiment data suggest?",
          options: [
            "The bull market has room to run — widespread participation confirms broad market health",
            "Euphoric sentiment and speculative excess are historically late-cycle warning signals",
            "IPO performance is uncorrelated with market cycle — it reflects unique company quality",
            "Retail participation improves liquidity and is structurally bullish",
          ],
          correctIndex: 1,
          explanation:
            "Euphoric retail participation, extreme IPO enthusiasm, and universal bullish consensus are classic late-cycle signals. This doesn't mean a crash is imminent — markets can stay irrational longer than logic suggests. But it does mean risk has increased: when everyone is already invested, there are fewer buyers left to drive prices higher, and any negative surprise can trigger large moves.",
        },
      ],
      apply: {
        setup:
          "The market has declined 22% from its peak over four months. You hold five positions, all in profitable companies with strong balance sheets and no near-term debt maturities. Headlines are overwhelmingly negative. Your unrealized loss is $2,400 on a $10,000 portfolio. A friend recommends moving to cash 'until things stabilize.'",
        data: [
          { label: "Portfolio decline", value: "-24%" },
          { label: "Holdings quality", value: "All profitable, strong balance sheets" },
          { label: "Debt risk", value: "No near-term maturities" },
          { label: "Bear market definition", value: "-20% threshold crossed" },
          { label: "Historical average bear market duration", value: "~10 months" },
          { label: "Historical average recovery time", value: "~2 years to new highs" },
        ],
        question:
          "What is the most rational course of action?",
        options: [
          "Move to cash — the market could fall another 20–30% and you can re-enter lower",
          "Maintain positions in quality businesses; consider adding if conviction is high and time horizon is long",
          "Sell the weakest two positions and hold cash in case conditions worsen",
          "Buy put options on the S&P 500 as a hedge against further downside",
        ],
        correctIndex: 1,
        explanation:
          "Quality businesses with no credit risk held in bear markets recover. The historical data is clear: investors who stayed invested outperformed those who moved to cash, because re-entry timing is almost always suboptimal. Your friend's advice ('wait until things stabilize') means buying at higher prices after the fear is gone — which is the opposite of good investing. If anything, this is a moment to evaluate whether any positions deserve more capital, not less.",
      },
    },
  ],
};

const ipoMechanics: Lesson = {
  id: "ipo-mechanics",
  trackId: "reading-the-market",
  order: 7,
  title: "IPO Mechanics",
  concept: "How New Stocks Come to Market",
  difficulty: "Medium",
  fields: ["IB", "PE", "VC", "HF"],
  teaching: {
    intro: "Every public company was once private. Understanding how IPOs work helps you avoid the most common mistakes retail investors make when a hot new stock debuts — and recognize when the excitement is engineered.",
    sections: [
      {
        heading: "What Happens in an IPO?",
        body: "An Initial Public Offering is the first time a company sells shares to the public. The company raises cash by issuing new shares (primary offering), and existing insiders may also sell their shares (secondary offering). Investment banks underwrite the deal — they set the initial price and sell shares to institutional investors before the stock ever trades publicly.",
        example: "If a company sells 10M new shares at $20 each, it raises $200M in fresh capital. If insiders simultaneously sell 5M existing shares, the company gets nothing from those — only the insiders do.",
      },
      {
        heading: "The Lock-Up Period",
        body: "After an IPO, insiders — founders, employees, and early investors — are typically locked up for 90 to 180 days and cannot sell their shares. When the lock-up expires, a large supply of shares hits the market. Stock prices often fall around lock-up expiry because insiders who couldn't sell before frequently do so immediately after. Watching the lock-up date is a key timing signal.",
      },
      {
        heading: "First-Day Pops and the Real Price",
        body: "Underwriters typically set the IPO price below what they believe fair value is to generate excitement and demand. First-day price jumps of 20–50% are common. But retail investors cannot buy at the IPO price — only institutions can. By the time you can buy on the open market on day one, you are paying the 'popped' price. The real test of an IPO's quality is where it trades 6–12 months later, after the excitement fades.",
      },
    ],
    keyTakeaway: "IPOs are priced to benefit insiders and institutions first. Retail investors who buy on day one often pay a full or premium price — and face a lock-up expiry headwind within months.",
  },
  practice: [
    {
      question: "What is the primary purpose of an IPO for the company itself?",
      options: [
        "Allow founders to sell all their shares immediately",
        "Raise capital by selling new shares to the public",
        "Avoid paying taxes on previous profits",
        "List on an exchange without raising money",
      ],
      correctIndex: 1,
      explanation: "The primary purpose is to raise capital for the company by selling new shares. Founders may sell existing shares at the same time (secondary offering), but that money goes to them — not the company.",
    },
    {
      question: "What typically happens to an IPO stock's price around the lock-up expiration?",
      options: [
        "Price rises on renewed investor excitement",
        "Price often falls as a large supply of insider shares hits the market",
        "Price is temporarily frozen by the exchange",
        "Nothing — lock-ups only apply to C-suite executives",
      ],
      correctIndex: 1,
      explanation: "Lock-up expiry creates a supply shock. Insiders who were forced to hold their shares for 90–180 days can now sell, and many do. This increased supply often pushes prices lower. Watching the lock-up date before buying an IPO is essential.",
    },
    {
      question: "A company IPOs at $20/share. On the first trading day it closes at $34. A retail investor buys at $34. Relative to the IPO price, they paid:",
      options: [
        "The same as institutional investors",
        "70% above the IPO price",
        "70% below institutional cost",
        "The optimal entry point — after price discovery",
      ],
      correctIndex: 1,
      explanation: "($34 − $20) ÷ $20 = 70% above the IPO price. Institutions bought at $20. The retail investor is buying at the post-pop price, capturing none of the first-day gain while taking on all of the downside if it reverts.",
    },
    {
      question: "Which signal most strongly suggests an IPO might be overpriced at its opening trade?",
      options: [
        "Heavy institutional demand before the offering",
        "No insiders selling shares in the offering",
        "A 90-day lock-up period",
        "A large first-day pop immediately followed by heavy selling",
      ],
      correctIndex: 3,
      explanation: "A large first-day pop followed by immediate selling (especially if volume is high) suggests that early buyers are flipping shares — taking profits quickly rather than holding. This 'hot money' behavior often precedes a multi-month decline as speculative demand exhausts itself.",
    },
  ],
  apply: {
    setup: "A consumer fintech company IPOs at $28/share. On day 1, it closes at $44 — a 57% pop. The business looks compelling: 65% revenue growth, 118% net revenue retention, path to profitability in 18 months. Insiders hold 71% of shares post-IPO. Lock-up expires in 90 days.",
    data: [
      { label: "IPO price", value: "$28" },
      { label: "Day 1 close", value: "$44 (+57%)" },
      { label: "Revenue growth", value: "65% YoY" },
      { label: "Net revenue retention", value: "118%" },
      { label: "Insider ownership post-IPO", value: "71%" },
      { label: "Lock-up expiry", value: "90 days" },
    ],
    question: "What is the most disciplined approach for a retail investor who finds this business compelling?",
    options: [
      "Buy now — the fundamentals clearly justify paying above IPO price",
      "Wait until after lock-up expiry to assess price with real supply dynamics",
      "Short the stock ahead of lock-up expiry to profit from the sell-off",
      "Set a limit order at the $28 IPO price and wait",
    ],
    correctIndex: 1,
    explanation: "71% insider ownership with a 90-day lock-up means a massive supply shock is coming. Even with strong fundamentals, there is no real price discovery yet — you only know what institutions paid before the business had to prove itself publicly. Waiting for lock-up expiry lets you see how insiders actually behave when they can sell, gives you 90 days of public financial disclosures to analyze, and often provides a better entry price. The fundamentals being compelling doesn't change the mechanics — it just means the business may be worth buying at the right price after the lock-up.",
  },
};

// ---------------------------------------------------------------------------
// Track 3 — Volatility & Risk
// ---------------------------------------------------------------------------

const volatilityAndRisk: Track = {
  id: "volatility-risk",
  title: "Volatility & Risk",
  description:
    "Understand the difference between price swings and real capital loss, recognize binary events before they blow up a position, and learn to calibrate your confidence honestly.",
  difficulty: "Intermediate",
  lessons: [
    {
      id: "types-of-risk",
      trackId: "volatility-risk",
      order: 1,
      title: "Types of Risk",
      concept: "Market, Company & Liquidity Risk",
      difficulty: "Easy",
      fields: ["IB", "PE", "HF", "VC", "AM"],
      teaching: {
        intro:
          "Volatility and risk are not the same thing. A great business that drops 25% in a market selloff is volatile — not necessarily risky. A penny stock that barely moves could destroy your capital. Knowing the difference changes how you act.",
        sections: [
          {
            heading: "Volatility vs permanent loss",
            body: "Volatility is how much a price moves. Risk is the probability of permanent capital loss — money you don't get back. A high-quality business can be extremely volatile without being permanently risky. A speculative position can be low-volatility for months and then go to zero.\n\nThe investor's job is to distinguish temporary price swings from genuine impairment of value.",
            example:
              "During the 2020 COVID crash, Visa fell 40% in six weeks. The underlying business — a payment network used by billions — didn't change. Within a year the stock had fully recovered. That was volatility, not risk. A travel company with unsustainable debt that went bankrupt in the same period — that was risk.",
          },
          {
            heading: "Four types of risk every investor faces",
            body: "Market risk (systematic): the whole market falls — every stock drops regardless of quality. You can't avoid this with stock selection.\n\nCompany risk (idiosyncratic): something specific to one business — bad earnings, CEO departure, product failure. Managed through research and position sizing.\n\nSector risk: a macro or regulatory force hits an entire industry — rising rates hit banks, oil price collapses hit energy, regulatory change hits pharma.\n\nLiquidity risk: you can't sell when you need to at a fair price. Most common in small-cap or illiquid stocks.",
          },
          {
            heading: "Mapping risk before you enter",
            body: "Before any position, explicitly ask: what could go wrong, how bad would it be, and can I recover? A stock that can fall 60% and never recover requires a very different position size than one that might dip 20% and bounce back in six months.\n\nKnowing the shape of your downside is as important as knowing your upside thesis.",
          },
        ],
        keyTakeaway:
          "Volatility is temporary price movement; risk is permanent capital loss — focus on the second, not the first, when making investment decisions.",
      },
      practice: [
        {
          question:
            "A stock drops 28% because the entire market sells off on a Fed announcement. No company-specific news. This is an example of:",
          options: [
            "Company-specific risk — something must be wrong with the business",
            "Market risk — a systematic move affecting all stocks regardless of quality",
            "Liquidity risk — sellers couldn't find buyers at fair prices",
            "Regulatory risk — Fed policy directly affects this company",
          ],
          correctIndex: 1,
          explanation:
            "When a stock falls because the whole market falls — with no company-specific trigger — that's market risk. It affects every stock regardless of fundamental quality. This kind of drop is often an opportunity if the business is sound.",
        },
        {
          question:
            "A company announces a product recall. The stock falls 22% but fully recovers over the next five months as the issue is resolved. The real risk here was:",
          options: [
            "Market risk — the selloff infected the whole sector",
            "Permanent capital loss risk",
            "Temporary company-specific volatility — the business recovered, so no permanent loss occurred",
            "Liquidity risk — small investors couldn't exit at fair prices",
          ],
          correctIndex: 2,
          explanation:
            "A temporary drop followed by full recovery is volatility, not risk. Real risk is the loss you don't recover from. Price movement is not the same as permanent impairment.",
        },
        {
          question:
            "You're evaluating a position where the best case is +50% and the worst case is bankruptcy. How should you size it?",
          options: [
            "Full position — the upside justifies the risk",
            "Medium position — +50% upside warrants meaningful allocation",
            "Small position — when the downside is total loss, position size is the only risk control available",
            "No position — total loss risk disqualifies any investment",
          ],
          correctIndex: 2,
          explanation:
            "When the worst case is complete loss, position sizing becomes critical. Even with high conviction, a full position in a potential-zero is poor risk management. Small size lets you participate in the upside while limiting the portfolio impact of the downside.",
        },
        {
          question:
            "Which best describes liquidity risk?",
          options: [
            "The risk that a company's earnings fall short of expectations",
            "The risk that you cannot sell a position at a fair price when you need to exit",
            "The risk that interest rates rise and reduce bond values",
            "The risk that a competitor launches a superior product",
          ],
          correctIndex: 1,
          explanation:
            "Liquidity risk is the inability to exit a position at a reasonable price. It's most common in micro-cap and small-cap stocks where trading volume is thin — a large sell order can move the price significantly against you.",
        },
      ],
      apply: {
        setup:
          "A biotech company has a Phase 3 clinical trial readout in six weeks. You're evaluating whether to take a position before the announcement.",
        data: [
          { label: "Upside if trial succeeds", value: "+90%" },
          { label: "Downside if trial fails", value: "-70%" },
          { label: "Short interest", value: "28% of float" },
          { label: "Your analytical background", value: "No clinical trial expertise" },
          { label: "Phase 2 success rate (this drug class)", value: "~40%" },
          { label: "Current portfolio size", value: "$10,000" },
        ],
        question:
          "What is the most disciplined approach to this position?",
        options: [
          "Invest $3,000 — the +90% upside justifies meaningful exposure",
          "Pass — without the ability to evaluate the trial probability, you have no analytical edge",
          "Invest $500 — small size manages the downside",
          "Short the stock given 28% short interest from sophisticated investors",
        ],
        correctIndex: 1,
        explanation:
          "Position sizing can't fix a missing edge. Without clinical expertise to evaluate trial probability, you're assigning an arbitrary number to a binary outcome — that's speculation, not investing. The 28% short interest means informed investors are on the other side. Pass is the disciplined answer when your risk is unmeasurable.",
      },
    },
    {
      id: "binary-events",
      trackId: "volatility-risk",
      order: 2,
      title: "Binary Events",
      concept: "Binary Risk & Discrete Outcomes",
      difficulty: "Medium",
      fields: ["HF", "VC"],
      teaching: {
        intro:
          "Most investment risks are continuous — earnings can come in a little high or a little low. Binary events are different: two discrete outcomes, nothing in between. Understanding them protects you from one of the most common mistakes beginners make.",
        sections: [
          {
            heading: "What makes an event binary",
            body: "A binary event has two discrete outcomes with no middle ground. FDA approval or rejection. A merger closes or falls apart. A court rules for or against. Unlike earnings — which can beat by 2% or miss by 5% — binary outcomes are all-or-nothing.\n\nThe implication: you can't manage binary risk by 'being mostly right.' You're either right or very wrong.",
            example:
              "A biotech drug trial readout: if approved, stock might gain 80%. If rejected, stock might fall 65%. There is no partial approval. The binary nature is what makes these events so dangerous without specific analytical edge.",
          },
          {
            heading: "Where binary events show up",
            body: "Drug and device trial readouts — the most common binary in public markets.\n\nMerger arbitrage — will the deal close at the announced price, or will it break?\n\nMajor legal rulings — patent disputes, antitrust cases, regulatory approvals.\n\nCash runway cliffs — a company that must raise capital within 12–18 months faces a near-binary: raise on acceptable terms or face distress. The terms of any raise are unknowable in advance.",
          },
          {
            heading: "The 'small position' trap",
            body: "A common mistake: 'I'll just take a small position in this binary event.' The position size doesn't fix the underlying problem. If you have no analytical edge on the outcome, you're guessing — whether you invest $100 or $10,000. The discipline is to pass when you can't evaluate the probability. Reserve capital for situations where your analysis genuinely adds signal.",
          },
        ],
        keyTakeaway:
          "Binary events have two discrete outcomes — without the ability to evaluate the probability, no position size makes the bet a good one.",
      },
      practice: [
        {
          question: "Which of these is a true binary event?",
          options: [
            "A retailer reports same-store sales down 3% versus analyst estimates",
            "An FDA advisory committee votes on whether to approve a new drug",
            "An energy company reports earnings 8% below consensus",
            "Oil prices fall 12% after OPEC announces a supply increase",
          ],
          correctIndex: 1,
          explanation:
            "FDA approval or rejection is the classic binary event — two discrete outcomes, nothing in between. The other examples involve continuous information where outcomes exist on a spectrum (how bad the miss was, how much prices fell).",
        },
        {
          question:
            "An EV startup announces it has 14 months of cash runway at current burn and expects to need additional funding before becoming profitable. This creates:",
          options: [
            "No meaningful risk — all startups raise capital eventually",
            "A near-binary risk — either they raise capital on acceptable terms or existing shareholders face severe dilution or failure",
            "Risk only if interest rates are high, which raises borrowing costs",
            "An opportunity to buy before the raise announcement drives the stock higher",
          ],
          correctIndex: 1,
          explanation:
            "A 14-month runway cliff creates a near-binary: raise or fail. The terms of any raise — price, dilution, structure — are unknowable. If the market is weak or investors are skeptical, a raise priced 25–30% below market is common, and devastating for existing shareholders.",
        },
        {
          question:
            "What's the fundamental problem with taking a 'small position' in a binary event you can't analytically evaluate?",
          options: [
            "Small positions generate returns too small to be meaningful",
            "You're still speculating without edge — just with less money at risk",
            "Small positions signal low conviction and undermine the thesis",
            "Small positions can't be effectively hedged against binary outcomes",
          ],
          correctIndex: 1,
          explanation:
            "Position size doesn't fix the absence of analytical edge. If you can't evaluate the probability of the outcome, you're guessing — whether you put in $100 or $10,000. The discipline is to pass, not to guess in smaller amounts.",
        },
        {
          question:
            "A merger is announced: Company A will acquire Company B at $42 per share. Company B currently trades at $39.50 (a 6.3% discount to deal price). This spread exists because:",
          options: [
            "The market hasn't yet processed the news — it will close immediately",
            "There is a binary risk the deal falls apart, in which case Company B's stock could fall significantly",
            "Merger arbitrage is risk-free so the spread represents pure profit",
            "Company A is overpaying and the market is correcting for that",
          ],
          correctIndex: 1,
          explanation:
            "Merger arbitrage spreads reflect the binary risk of deal failure. If the deal closes, you earn the 6.3%. If it breaks — due to regulatory rejection, financing issues, or either party walking away — Company B's stock could fall 20–40% back to pre-announcement levels. The spread is compensation for that binary risk.",
        },
      ],
      apply: {
        setup:
          "You're evaluating an early-stage EV manufacturer. The company is growing fast but burning cash and will need to raise capital within the next year. You need to assess whether this is an investment or a speculation.",
        data: [
          { label: "Revenue growth (YoY)", value: "+180% (from small base)" },
          { label: "Net profit margin", value: "-42%" },
          { label: "Cash runway", value: "~14 months at current burn" },
          { label: "Expected capital raise timing", value: "Within 12 months" },
          { label: "Delivery target (last quarter)", value: "Missed by 8%" },
          { label: "Stock price", value: "$9.40" },
        ],
        question:
          "The upcoming capital raise is best described as:",
        options: [
          "A catalyst — raises give companies resources to accelerate growth",
          "A near-binary risk — dilutive terms could significantly impair existing shareholders",
          "A non-event — the market has already priced in an expected raise",
          "An opportunity to buy more before the announcement drives the price up",
        ],
        correctIndex: 1,
        explanation:
          "A raise under pressure (14-month runway, missed targets, no path to profit) is a near-binary risk. Distressed raises are frequently priced 20–35% below market — existing shareholders face immediate dilution. The 180% revenue growth is from a tiny base and doesn't change the cash reality. This is a binary risk situation, not an investment opportunity.",
      },
    },
    {
      id: "confidence-calibration",
      trackId: "volatility-risk",
      order: 3,
      title: "Confidence Calibration",
      concept: "Calibration & Overconfidence Bias",
      difficulty: "Hard",
      fields: ["IB", "PE", "HF", "VC", "AM"],
      teaching: {
        intro:
          "The most documented bias in investing psychology isn't fear or greed — it's overconfidence. Learning to rate your conviction honestly, and track whether those ratings predict your outcomes, is one of the highest-leverage skills you can build.",
        sections: [
          {
            heading: "What calibration means",
            body: "Calibration is how accurately your confidence predicts real-world outcomes. A well-calibrated investor who rates 10 positions at 8/10 confidence wins roughly 8 of them. A poorly calibrated one rates everything 9/10 and wins 4.\n\nMost people are badly miscalibrated — almost always toward overconfidence. The research is unambiguous: people think they know more than they do, especially in domains they find interesting.",
          },
          {
            heading: "How overconfidence shows up",
            body: "You underweight information that contradicts your thesis. You remember your winning calls more vividly than your losses (hindsight bias). You anchor to your first impression of a company and resist updating when new information arrives. You confuse 'liking a company' with 'having high conviction in the stock at this price.'\n\nThese aren't personality flaws — they're cognitive defaults that affect everyone. The antidote is process, not willpower.",
            example:
              "Studies of professional analysts show they consistently overestimate their earnings forecast accuracy. They're right less often than their stated confidence implies — and the overconfidence is worse in analysts who cover fewer companies (more familiarity = more overconfidence, not more accuracy).",
          },
          {
            heading: "Three tools that actually improve calibration",
            body: "Pre-mortem: before entering a position, imagine it has already failed and explain why. This forces you to surface risks your overconfidence was suppressing.\n\nRange thinking: instead of 'I think this goes up,' articulate a bull case, bear case, and base case with explicit probability estimates. If your bull case has 80% probability, your calibration is probably off.\n\nTrack your record: review your stated confidence versus actual outcomes every 20–30 decisions. The data will humble you — and that humility compounds into better decisions.",
          },
        ],
        keyTakeaway:
          "Good calibration means your confidence scores predict your win rate — track your accuracy over many decisions and let the data correct your instincts.",
      },
      practice: [
        {
          question:
            "You've rated your last 8 investment ideas at 9/10 confidence. Three made money. What does this reveal?",
          options: [
            "Your confidence is appropriate — market conditions were unfavorable",
            "Your confidence is poorly calibrated — 9/10 should imply roughly 90% accuracy, not 37%",
            "3 out of 8 is reasonable for any investor — markets are inherently unpredictable",
            "You need more observations — 8 is too small a sample to conclude anything",
          ],
          correctIndex: 1,
          explanation:
            "Well-calibrated 9/10 confidence should correspond to roughly 90% accuracy over many decisions. Winning 37% of the time on 9/10 confidence calls is a significant calibration failure — your confidence is not predicting your outcomes.",
        },
        {
          question: "What is a pre-mortem, and why is it useful before entering a position?",
          options: [
            "A review of your worst historical trades before making a new decision",
            "Imagining the investment has already failed and working backwards to identify why",
            "A risk management framework used only by institutional investors",
            "The same as a post-mortem analysis — just done earlier",
          ],
          correctIndex: 1,
          explanation:
            "A pre-mortem forces you to take the adversarial view before you're committed. 'It's 12 months from now and this position lost 40%. What went wrong?' This surfaces risks your optimism was suppressing. It doesn't mean you don't take the position — it means you enter with open eyes.",
        },
        {
          question: "Which scenario best describes well-calibrated confidence?",
          options: [
            "Your 8/10 confidence calls win approximately 80% of the time across many decisions",
            "You always rate yourself 5/10 to guard against overconfidence",
            "You adjust confidence based on how much you like the company's products or mission",
            "Your 10/10 confidence calls always result in gains",
          ],
          correctIndex: 0,
          explanation:
            "Calibration means confidence scores are accurate probability estimates. 8/10 calls winning ~80% of the time over 20+ decisions is well-calibrated. Always picking 5/10 is avoidance. Letting product affinity drive confidence is a bias. And 10/10 certainty doesn't exist in markets.",
        },
        {
          question:
            "You read a strong earnings report for a company you've followed for three years and genuinely admire. You assign 9/10 confidence to a Buy call. But the stock trades at 3× its 5-year average P/E, and the CEO warned on the call that growth will 'moderate meaningfully' next quarter. What's most likely driving the 9/10 rating?",
          options: [
            "The strong earnings report — good results justify high conviction",
            "Admiration bias — your confidence is anchored to how much you like the company, not the full evidence set",
            "Valuation expansion — higher multiples confirm the market shares your conviction",
            "Long-term familiarity gives you an analytical edge over less experienced investors",
          ],
          correctIndex: 1,
          explanation:
            "Admiration bias is real and dangerous. When you like a company, you instinctively weight positive information more heavily and explain away negatives. The CEO's own warning and a stretched valuation are material risks. A calibrated assessment might be 5–6/10. The gap between that and 9/10 is admiration, not analysis.",
        },
      ],
      apply: {
        setup:
          "Over the past six months, you made 12 investment decisions. You've been tracking your stated confidence and the actual outcomes. You're now reviewing the record to assess your calibration.",
        data: [
          { label: "Decisions rated 9–10/10 confidence", value: "5 decisions, 2 profitable" },
          { label: "Decisions rated 7–8/10 confidence", value: "4 decisions, 3 profitable" },
          { label: "Decisions rated 5–6/10 confidence", value: "3 decisions, 2 profitable" },
          { label: "Overall win rate", value: "58%" },
          { label: "Win rate on highest-confidence calls", value: "40%" },
          { label: "Win rate on medium-confidence calls", value: "75%" },
        ],
        question:
          "What does this record reveal about your calibration?",
        options: [
          "Well-calibrated — your overall 58% win rate is solid for any investor",
          "Poorly calibrated — your highest-confidence calls perform worst, indicating overconfidence when you feel most certain",
          "Poorly calibrated — you should have more 9–10/10 confidence decisions",
          "Well-calibrated — medium confidence calls winning 75% shows strong analytical ability",
        ],
        correctIndex: 1,
        explanation:
          "The pattern is diagnostic: your highest-confidence calls (9–10/10) win only 40% of the time, while your medium-confidence calls (7–8/10) win 75%. This is a textbook overconfidence pattern — you're most wrong when you feel most certain. The fix is a pre-mortem practice specifically triggered when you rate anything above 8/10.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 4 — Position Sizing (Medium)
    // -----------------------------------------------------------------------
    {
      id: "position-sizing",
      trackId: "volatility-risk",
      order: 4,
      title: "Position Sizing",
      concept: "Conviction-Based Allocation & Concentration Risk",
      difficulty: "Medium",
      fields: ["HF", "AM", "PE"],
      teaching: {
        intro:
          "The single most underrated skill in investing isn't stock selection — it's position sizing. Two investors can have the same correct idea and wildly different outcomes based purely on how much of their portfolio they allocate to it. Size too small and great ideas don't move the needle. Size too large and one bad outcome is catastrophic.",
        sections: [
          {
            heading: "Why position sizing matters as much as stock selection",
            body: "A portfolio is not just a list of stocks — it's a set of bets with sizes. If you put 2% of your portfolio in a stock that doubles, you made 2%. If you put 15% in a stock that falls 60%, you lost 9% of your entire portfolio. The sizing decision is often more impactful than whether you were right about the direction.\n\nMost amateur investors either over-concentrate (too few positions, each too large) or under-concentrate (so many positions that no single idea can matter). Both are mistakes.",
          },
          {
            heading: "Sizing relative to conviction and downside",
            body: "A disciplined framework sizes positions based on two inputs: conviction (how confident are you, and why?) and downside risk (how bad is the worst plausible case?).\n\nHigh conviction + limited downside → larger position (8–15% of portfolio)\nHigh conviction + large downside → moderate position (4–8%)\nLower conviction + limited downside → small position (2–4%)\nAny position where downside is total loss → very small regardless of upside (1–2%)\n\nThe asymmetry is intentional: you can add to a position as conviction increases, but you can't get back capital lost on an oversized mistake.",
            example:
              "A hedge fund manager with 40 positions averaging 2.5% each has a portfolio where no single idea can drive meaningful alpha. A manager with 15 positions averaging 6–7% — with their top 5 ideas at 10–12% each — can outperform significantly when right and survive being wrong on several.",
          },
          {
            heading: "Concentration risk: when a large position becomes dangerous",
            body: "Concentration risk emerges when a single position, sector, or thesis represents so much of a portfolio that a single bad outcome causes catastrophic loss. A 40% position in a single stock is not investing — it's a binary event on one company's future.\n\nThe practical rule: ask yourself 'if this position went to zero tomorrow, would I be able to recover?' If the answer is no, you're over-concentrated. The goal is to own enough of your best ideas to matter while staying diversified enough to survive being wrong.",
          },
        ],
        keyTakeaway:
          "Position size should reflect both conviction and the shape of the downside — the goal is to make winning ideas matter while ensuring no single loss is unrecoverable.",
      },
      practice: [
        {
          question:
            "You have high conviction in a stock with a 40% upside and a maximum realistic downside of 20%. Your portfolio is $10,000. What sizing approach is most appropriate?",
          options: [
            "1–2% ($100–200) — always start small regardless of conviction",
            "8–12% ($800–1,200) — high conviction and limited downside justify meaningful allocation",
            "50% ($5,000) — maximum conviction deserves maximum allocation",
            "25% ($2,500) — split the difference between large and small",
          ],
          correctIndex: 1,
          explanation:
            "High conviction combined with a well-defined and limited downside (20%) justifies a meaningful position. 8–12% ensures the idea contributes to portfolio performance if correct, while the bounded downside means a maximum loss of roughly 1–2% of total portfolio value. A 50% concentration would be reckless regardless of conviction.",
        },
        {
          question:
            "An investor owns 60 stocks, each at approximately 1.7% of their portfolio. What is the primary problem with this approach?",
          options: [
            "They are taking on too much risk — 60 stocks amplify volatility",
            "No single correct call can meaningfully improve performance — the portfolio is too diluted for conviction to matter",
            "This level of diversification eliminates all market risk",
            "They are over-concentrated — 60 positions in one portfolio is too few",
          ],
          correctIndex: 1,
          explanation:
            "With 60 positions at 1.7% each, even a stock that doubles only improves total portfolio performance by 1.7%. This level of dilution means stock-picking skill becomes almost irrelevant — the portfolio will closely track the index. True conviction requires enough concentration to let correct calls drive results.",
        },
        {
          question:
            "A biotech with a binary trial readout offers +100% upside if successful and -80% if it fails. You cannot evaluate the clinical data. What is the maximum appropriate position size?",
          options: [
            "10% — the 100% upside justifies meaningful allocation",
            "25% — asymmetric upside deserves proportional sizing",
            "1–2% — without analytical edge on the binary outcome, any position is a guess, and size can't fix that",
            "0% — binary events with no edge should always be avoided completely",
          ],
          correctIndex: 2,
          explanation:
            "Position size cannot substitute for analytical edge. Without the ability to evaluate the trial probability, you're guessing — and the maximum downside is 80% of whatever you invest. A 1–2% position limits maximum portfolio damage to 0.8–1.6% while allowing participation if the outcome is positive. Sizing up on a coin flip you can't evaluate is poor risk management, not conviction.",
        },
        {
          question:
            "An investor has 80% of their portfolio in a single stock that has tripled over two years. The position now represents $80,000 of a $100,000 portfolio. The business is excellent. What risk is most important to address?",
          options: [
            "No risk — the stock's quality justifies the concentration",
            "Concentration risk — a single company-specific event could devastate the portfolio permanently",
            "Opportunity risk — being too concentrated means missing other good ideas",
            "Tax risk — the unrealized gain will eventually be taxed",
          ],
          correctIndex: 1,
          explanation:
            "Even excellent businesses carry idiosyncratic risk: a surprise regulatory action, a fraud allegation, a key executive departure, or an unexpected competitive threat can cut the stock 40–60% regardless of underlying quality. At 80% concentration, a 50% stock decline wipes 40% of total portfolio value. The business quality doesn't eliminate company-specific risk.",
        },
      ],
      apply: {
        setup:
          "You have $10,000 to invest and three ideas you've researched. You need to allocate across them based on conviction and risk profile.",
        data: [
          { label: "Idea A", value: "High conviction, max downside 15%, upside 40% — enterprise SaaS with 120% NRR" },
          { label: "Idea B", value: "Medium conviction, max downside 35%, upside 60% — turnaround retailer, early-stage" },
          { label: "Idea C", value: "High conviction but binary FDA trial in 8 weeks, downside 75%", },
          { label: "Remaining cash", value: "Held for future opportunities" },
        ],
        question:
          "Which allocation is most disciplined?",
        options: [
          "A: 40%, B: 40%, C: 20% — high conviction ideas deserve large allocations",
          "A: 30%, B: 15%, C: 3%, remaining cash: 52% — size to conviction and downside; protect against the binary",
          "A: 33%, B: 33%, C: 33% — equal weight to keep it simple",
          "A: 10%, B: 10%, C: 10%, remaining cash: 70% — stay mostly in cash until certainty improves",
        ],
        correctIndex: 1,
        explanation:
          "Idea A deserves the largest position — high conviction, limited downside. Idea B merits a meaningful but smaller allocation — the turnaround thesis has higher uncertainty and larger downside. Idea C is a binary event: high conviction doesn't matter when you can't evaluate the clinical probability. 3% ensures participation without making a 75% loss catastrophic. Keeping remaining capital in cash preserves optionality for future ideas. This allocation weights conviction and downside simultaneously.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 5 — Diversification (Medium)
    // -----------------------------------------------------------------------
    {
      id: "diversification",
      trackId: "volatility-risk",
      order: 5,
      title: "Diversification",
      concept: "True Diversification vs Correlation Risk",
      difficulty: "Medium",
      fields: ["IB", "PE", "HF", "VC", "AM"],
      teaching: {
        intro:
          "Diversification is the only free lunch in finance — it reduces risk without necessarily reducing expected return. But most investors confuse owning many things with being truly diversified. 30 stocks in the same sector is not diversification. It's concentration with a spreadsheet.",
        sections: [
          {
            heading: "What diversification actually reduces",
            body: "Diversification reduces idiosyncratic (company-specific) risk. If you own 20 stocks across 10 sectors, a single company's fraud or product recall affects 5% of your portfolio instead of 100%. But diversification cannot eliminate market risk — in a severe broad selloff, correlations between assets rise dramatically and most things fall together.\n\nThe goal is to build a portfolio where no single outcome can be catastrophic. That requires both position sizing and genuine diversification across non-correlated risks.",
          },
          {
            heading: "The correlation trap",
            body: "Two assets that look different can behave identically in a crisis. 10 technology stocks from different sub-sectors (cloud, semiconductors, consumer tech) might all fall together in a rate hike cycle — they share macro sensitivity even if the businesses are unrelated. This is correlation: when two things move together, owning both provides less risk reduction than you think.\n\nTrue diversification requires assets whose performance drivers are genuinely different: different sectors, different geographies, different sensitivity to economic factors.",
            example:
              "An investor who owned 30 stocks in 2022 — but 22 of them were high-multiple technology companies — experienced correlated drawdowns far larger than a '30-stock portfolio' implies. When the rate hike cycle hit, virtually all of them fell together. Geographic or sector diversification would have helped; owning more names in the same factor exposure did not.",
          },
          {
            heading: "How many positions and why",
            body: "Research shows that most of the idiosyncratic risk reduction from diversification is achieved by 15–20 stocks. Going from 5 to 15 stocks dramatically reduces company-specific risk. Going from 15 to 30 adds marginal benefit. Going from 30 to 100 adds almost none — while making it virtually impossible to track every position with real diligence.\n\nThe practical sweet spot for most investors is 15–25 positions across genuine sectors with enough capital in each position that being right actually matters.",
          },
        ],
        keyTakeaway:
          "True diversification requires low correlation between holdings, not just many holdings — 30 stocks in the same sector is concentration, not diversification.",
      },
      practice: [
        {
          question:
            "An investor owns 25 stocks, all US technology companies across cloud, hardware, and consumer tech. How diversified are they?",
          options: [
            "Well-diversified — 25 positions across three technology sub-sectors provides strong risk reduction",
            "Poorly diversified — the holdings share macro sensitivity (rates, growth expectations) and will likely move together in a rate shock",
            "Overdiversified — 25 positions is too many for any individual investor to track",
            "Neutral — diversification only matters across asset classes, not within equities",
          ],
          correctIndex: 1,
          explanation:
            "25 technology stocks share a common factor exposure: they're all sensitive to interest rates, growth expectations, and technology sector sentiment. In a rate hike cycle or tech selloff, correlations will be high and all 25 will likely fall together. This is concentration in a factor, not diversification.",
        },
        {
          question:
            "Research shows that most idiosyncratic risk is eliminated by holding approximately how many stocks?",
          options: [
            "5–7 stocks",
            "15–20 stocks",
            "50–60 stocks",
            "100+ stocks",
          ],
          correctIndex: 1,
          explanation:
            "Academic research consistently shows that 15–20 well-diversified holdings capture the vast majority of the risk-reduction benefit from diversification. Beyond 20–25 stocks, each additional holding adds minimal idiosyncratic risk reduction while making it harder to track positions with sufficient rigor.",
        },
        {
          question:
            "Which portfolio is most genuinely diversified?",
          options: [
            "50 US large-cap stocks across all sectors",
            "15 stocks across US Technology, European Financials, Asian Industrials, Energy, and Healthcare",
            "30 US stocks across Technology and Consumer Discretionary",
            "10 S&P 500 index funds from different providers",
          ],
          correctIndex: 1,
          explanation:
            "True diversification requires different economic drivers, not just different names. 15 stocks across geographically and sectorally distinct areas have genuinely uncorrelated risks: European Financials respond differently to macro forces than US Technology. 50 US large-caps, while diversified by name, share US market and dollar sensitivity. 10 S&P 500 funds are nearly identical.",
        },
        {
          question:
            "During a severe market crisis, asset correlations tend to:",
          options: [
            "Fall — investors become more selective, separating quality from speculation",
            "Stay stable — correlation is a fixed property of each asset",
            "Rise — most assets fall together as investors liquidate to raise cash",
            "Become uncorrelated randomly — crises produce unpredictable outcomes",
          ],
          correctIndex: 2,
          explanation:
            "One of the most important and dangerous properties of market crises: correlations rise sharply when investors need to raise cash quickly. Assets that normally move independently start falling together because the selling is indiscriminate. This is called 'correlation breakdown' and is why diversification provides less protection in the worst moments than historical data suggests.",
        },
      ],
      apply: {
        setup:
          "Your $10,000 portfolio consists of 8 positions. Five are US technology companies, two are US consumer discretionary stocks, and one is an S&P 500 index ETF. The Fed announces an unexpected 0.75% rate hike.",
        data: [
          { label: "Portfolio positions", value: "8 total" },
          { label: "Sector breakdown", value: "5 US Tech, 2 US Consumer Discretionary, 1 S&P 500 ETF" },
          { label: "Average P/E of portfolio", value: "62×" },
          { label: "Geographic exposure", value: "100% US equities" },
          { label: "Fed action", value: "Surprise +0.75% rate hike" },
        ],
        question:
          "What is the primary risk this portfolio faces from the rate hike?",
        options: [
          "Minimal risk — 8 positions provides sufficient diversification against rate moves",
          "High correlated drawdown risk — all holdings share rate sensitivity through high multiples and US growth exposure",
          "Sector concentration risk only — the ETF position provides macro protection",
          "No risk — individual stock diversification offsets macro factors",
        ],
        correctIndex: 1,
        explanation:
          "This portfolio has false diversification. Seven of eight positions are US growth equities with elevated multiples — all of which are highly rate-sensitive. The S&P 500 ETF includes a large tech weighting and provides no genuine diversification. A surprise rate hike will compress multiples across the board. True diversification here would require different geographic exposure, lower-multiple value stocks, or assets with different rate sensitivity (energy, financials, international).",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 6 — Market Cycles (Hard)
    // -----------------------------------------------------------------------
    {
      id: "market-cycles",
      trackId: "volatility-risk",
      order: 6,
      title: "Market Cycles",
      concept: "Economic Cycles, Leading Indicators & Recession Signals",
      difficulty: "Hard",
      fields: ["HF", "AM", "IB"],
      teaching: {
        intro:
          "Markets don't move in straight lines — they cycle. Understanding where you are in the economic cycle is one of the most valuable contextual tools an investor can develop. It doesn't tell you what individual stocks will do, but it tells you what water you're swimming in.",
        sections: [
          {
            heading: "The four phases of the economic cycle",
            body: "Expansion: GDP grows, unemployment falls, consumer spending rises, corporate earnings accelerate. Credit is available and cheap. Sentiment is optimistic. This is when cyclical stocks, financials, and discretionary spending companies thrive.\n\nPeak: Growth is at its highest rate but begins to slow. Inflation typically rises. The central bank often raises rates to cool the economy. Late-cycle dynamics favor commodities and energy.\n\nContraction/Recession: GDP declines for two or more consecutive quarters. Unemployment rises. Consumer and corporate spending falls. Defensive sectors (Staples, Healthcare, Utilities) hold up; cyclicals suffer.\n\nTrough/Recovery: The recession ends. Growth resumes, often slowly. Credit begins loosening. Early-cycle sectors (Financials, Consumer Discretionary, Industrials) lead the recovery.",
          },
          {
            heading: "Leading indicators that signal cycle turns",
            body: "Leading indicators change before the economy does — they're the market's early warning system:\n\nYield curve: An inverted yield curve (2-year rate > 10-year rate) has preceded every US recession in modern history, typically with an 6–18 month lead.\n\nUnemployment claims: Rising initial jobless claims signal deteriorating labor market conditions before official unemployment data catches up.\n\nISM Manufacturing PMI: A reading below 50 indicates manufacturing contraction; sustained readings below 50 often precede broader recessions.\n\nCredit spreads: When corporate bonds require much higher yields than Treasuries (widening spreads), credit markets are pricing in elevated default risk — a risk-off signal.",
            example:
              "In 2006–2007, the yield curve inverted, credit spreads widened significantly, and housing starts collapsed. These leading indicators were flashing warning signs 12–18 months before the 2008 financial crisis was recognized as a recession.",
          },
          {
            heading: "Why market prices lead the economy",
            body: "Stock markets typically bottom 3–6 months before the economy does and peak 6–9 months before recessions are officially declared. This is because markets are forward-looking — they price in expectations of future earnings and conditions, not current ones.\n\nThis creates a counterintuitive reality: the worst economic headlines (rising unemployment, falling GDP) often arrive just as markets are beginning to recover. Investors who wait for good news to start buying miss the early stage of the recovery — historically where the sharpest gains occur.",
          },
        ],
        keyTakeaway:
          "Economic cycles have four phases with distinct sector winners — leading indicators (yield curve, credit spreads, PMI) signal cycle turns 6–18 months in advance; markets price in the cycle before the economy shows it.",
      },
      practice: [
        {
          question:
            "GDP growth has been slowing for three quarters, the yield curve inverted six months ago, and ISM Manufacturing PMI has been below 50 for two consecutive months. Where are you most likely in the cycle?",
          options: [
            "Early recovery — leading indicators are rebounding",
            "Late expansion or early contraction — multiple leading indicators pointing toward slowdown",
            "Mid-cycle expansion — PMI readings are always volatile",
            "At the trough — the worst of the slowdown has passed",
          ],
          correctIndex: 1,
          explanation:
            "An inverted yield curve, slowing GDP growth, and contractionary PMI readings are converging leading indicators of late-cycle or early-recession conditions. No single indicator is definitive, but the cluster of signals is significant. Late expansion or early contraction is the most accurate characterization based on this combination.",
        },
        {
          question:
            "Corporate credit spreads have widened significantly — high-yield bonds now require 650 basis points more than Treasuries, up from 320 a year ago. What does this signal?",
          options: [
            "Credit markets are pricing in significantly elevated corporate default risk — a risk-off signal",
            "Interest rates are falling — bond investors are reaching for yield",
            "The economy is expanding — strong corporate borrowing is driving spreads wider",
            "Inflation is declining — credit conditions are normalizing",
          ],
          correctIndex: 0,
          explanation:
            "Credit spreads widen when bond investors require more compensation to hold corporate debt versus risk-free Treasuries. A doubling of high-yield spreads from 320 to 650 basis points signals that credit markets are pricing in meaningfully higher default probability — a leading indicator of economic stress and a classic risk-off signal.",
        },
        {
          question:
            "The economy is in a confirmed recession. Unemployment is rising. GDP has declined for two quarters. Stock markets have fallen 35% from their peak. What should a long-term investor consider?",
          options: [
            "Exit equity positions entirely — GDP will decline further before recovering",
            "Remain patient or add selectively — markets historically bottom months before the economy and recover before good news arrives",
            "Move to 100% cash — recessions average 18 months and further declines are certain",
            "Short the market — recessions are predictably long and painful",
          ],
          correctIndex: 1,
          explanation:
            "Markets are forward-looking and typically bottom 3–6 months before economies do. By the time unemployment is rising and GDP is confirmed negative, much of the market decline has often already occurred. The sharpest recovery gains frequently happen before the economic data turns positive. Long-term investors who exit at confirmed recession lows often miss the early recovery entirely.",
        },
        {
          question:
            "The ISM Manufacturing PMI just crossed back above 50 after six months below. Credit spreads are tightening. The Fed has paused rate hikes. What phase is the cycle likely entering?",
          options: [
            "Late expansion — growth is about to peak and reverse",
            "Early recovery — leading indicators are inflecting positively",
            "Contraction — ISM crossing 50 is a lagging signal",
            "Peak — inflation is likely to surge as PMI rises",
          ],
          correctIndex: 1,
          explanation:
            "PMI crossing back above 50 (from contraction back to expansion), combined with tightening credit spreads and a pause in rate hikes, is a cluster of early recovery signals. Manufacturing activity is expanding, credit conditions are improving, and monetary policy is no longer tightening. These are classic early-cycle characteristics.",
        },
      ],
      apply: {
        setup:
          "You are reviewing your investment strategy. The yield curve inverted 9 months ago. The Fed has raised rates 5 times. ISM Manufacturing PMI has been below 50 for three consecutive months. Credit spreads have widened from 280 to 520 basis points. Your portfolio is 85% in cyclical growth stocks.",
        data: [
          { label: "Yield curve inversion", value: "9 months duration" },
          { label: "Fed rate hikes", value: "5 consecutive hikes" },
          { label: "ISM Manufacturing PMI", value: "Below 50 for 3 months" },
          { label: "High-yield credit spreads", value: "Widened from 280 to 520 bps" },
          { label: "Portfolio composition", value: "85% cyclical growth stocks" },
          { label: "Portfolio P/E", value: "Average 58×" },
        ],
        question:
          "How should you interpret these leading indicators and what action do they suggest?",
        options: [
          "Leading indicators are mixed — no action is required until the economy officially enters recession",
          "Multiple reliable leading indicators are converging on late-cycle / early-recession risk; 85% cyclical concentration with high multiples carries elevated risk worth reducing",
          "The indicators confirm a buying opportunity — yield curve inversions are contrarian bullish signals",
          "Only credit spreads matter for equity investors; the other signals can be ignored",
        ],
        correctIndex: 1,
        explanation:
          "Four reliable leading indicators — inverted yield curve (9 months), consecutive PMI contraction, sharply widening credit spreads, and aggressive rate hikes — are converging on a late-cycle to early-recession signal. An 85% cyclical growth portfolio at average 58× earnings is highly vulnerable to an economic slowdown: both multiple compression and earnings deterioration can compound. The disciplined response is to reduce cyclical exposure, particularly in the highest-multiple positions most sensitive to both growth slowdowns and rate effects.",
      },
    },
  ],
};

const maxDrawdown: Lesson = {
  id: "max-drawdown",
  trackId: "volatility-risk",
  order: 7,
  title: "Max Drawdown & Recovery",
  concept: "The Asymmetry of Losses",
  difficulty: "Medium",
  fields: ["HF", "AM", "PE", "IB", "VC"],
  teaching: {
    intro: "A portfolio that falls 50% requires a 100% gain just to break even. Understanding drawdown is what separates strategies that survive bad markets from those that force you to sell at exactly the wrong moment.",
    sections: [
      {
        heading: "What Is Max Drawdown?",
        body: "Maximum drawdown measures the largest peak-to-trough decline in a portfolio or stock over a given period. It captures the worst-case loss an investor would have experienced if they bought at the peak and held through the bottom.",
        example: "A portfolio peaks at $100,000, falls to $60,000, then recovers. Max drawdown = ($100K − $60K) ÷ $100K = 40%. To recover from that 40% loss, the portfolio needs to gain 67% — not 40% — because the base is now smaller.",
      },
      {
        heading: "The Asymmetry of Losses",
        body: "Losses and the gains needed to recover from them are not symmetric. A 10% loss requires an 11% gain to recover. A 25% loss needs 33%. A 50% loss needs 100%. A 75% loss needs 300%. This asymmetry is why avoiding large losses is mathematically more important than maximizing gains. A strategy that gains 20% then loses 20% is not flat — it is down 4%.",
      },
      {
        heading: "Why Drawdown Matters Beyond the Math",
        body: "Large drawdowns cause panic selling at the worst possible time — near the bottom. They consume time: a 50% drawdown that takes 3 years to recover means 3 years of zero progress toward your goals. For leveraged strategies, drawdowns trigger margin calls. For investors near retirement, a large drawdown at the wrong time can be unrecoverable. A 15% annual return with a 55% max drawdown is not the same as 12% with a 15% drawdown.",
      },
    ],
    keyTakeaway: "Never evaluate a strategy only by its returns — a high return with a massive drawdown will break most investors psychologically before they can benefit from the recovery.",
  },
  practice: [
    {
      question: "A portfolio peaks at $80,000 then falls to $52,000. What is the max drawdown?",
      options: ["28%", "35%", "32.5%", "53.8%"],
      correctIndex: 1,
      explanation: "($80,000 − $52,000) ÷ $80,000 = $28,000 ÷ $80,000 = 35%. Max drawdown is always calculated from peak to trough as a percentage of the peak.",
    },
    {
      question: "A stock falls 60% from its peak. What return is required to recover to the original peak?",
      options: ["60%", "90%", "150%", "100%"],
      correctIndex: 2,
      explanation: "If the stock was $100 and falls 60% to $40, it must rise from $40 to $100 — a gain of $60 on a base of $40 = 150%. Loss and recovery percentages are not equal because they have different starting points.",
    },
    {
      question: "Why does a 20% gain followed by a 20% loss result in a net loss, not a break-even?",
      options: [
        "Because taxes apply to the gain first",
        "Because gains and losses are calculated on different base amounts",
        "It doesn't — you break exactly even",
        "Because trading commissions compound negatively",
      ],
      correctIndex: 1,
      explanation: "Start with $100. Gain 20% → $120. Lose 20% of $120 → $96. The 20% loss applies to a larger base ($120) than the 20% gain did ($100). This is the mathematical foundation of why avoiding losses matters more than maximizing gains.",
    },
    {
      question: "A fund has returned +25% per year on average but had a 65% max drawdown in one year. Why is this concerning for most investors?",
      options: [
        "It isn't — 25% annual returns are exceptional by any standard",
        "Most investors would panic-sell near the bottom, realizing the loss rather than the recovery",
        "A 65% drawdown always indicates excessive leverage",
        "Both the panic-sell risk and likely leverage use are concerning",
      ],
      correctIndex: 3,
      explanation: "A 65% drawdown is nearly impossible to achieve without significant leverage in a diversified portfolio. Beyond that, behavioral research consistently shows that most investors exit strategies during large drawdowns — meaning they capture the loss but miss the recovery, turning a paper loss into a permanent one.",
    },
  ],
  apply: {
    setup: "You are choosing between two portfolio strategies for a $200,000 retirement account. You plan to retire in 6 years. Strategy A has returned 18% per year on average with a max drawdown of 55%. Strategy B has returned 13% per year with a max drawdown of 18%.",
    data: [
      { label: "Strategy A — avg annual return", value: "18%" },
      { label: "Strategy A — max drawdown", value: "55%" },
      { label: "Strategy B — avg annual return", value: "13%" },
      { label: "Strategy B — max drawdown", value: "18%" },
      { label: "Investment amount", value: "$200,000" },
      { label: "Time horizon", value: "6 years to retirement" },
    ],
    question: "Which strategy is more appropriate for this investor, and why?",
    options: [
      "Strategy A — higher returns compound dramatically over 6 years",
      "Strategy B — a 55% drawdown near retirement could be unrecoverable in 6 years",
      "Strategy A — a 55% drawdown is temporary and will always recover",
      "Strategy B — but only if you believe markets will be volatile",
    ],
    correctIndex: 1,
    explanation: "A 55% drawdown 2 years before retirement turns $200,000 into $90,000. Even if Strategy A recovers, it takes time you do not have. Strategy B at 13% annually grows $200K to roughly $414K over 6 years with a manageable 18% worst-case drawdown. Strategy A might grow more in a perfect scenario — but the risk of a catastrophic drawdown near the finish line is unacceptable. Proximity to your financial goal fundamentally changes which risk you can afford to take.",
  },
};

// ---------------------------------------------------------------------------
// Track 4 — Market Indicators
// ---------------------------------------------------------------------------

const marketIndicators: Track = {
  id: "market-indicators",
  title: "Market Indicators",
  description:
    "Learn to read insider activity, short interest, and analyst ratings the way professionals do — extracting signal without being manipulated by noise or conflicts of interest.",
  difficulty: "Intermediate",
  lessons: [
    {
      id: "insider-activity",
      trackId: "market-indicators",
      order: 1,
      title: "Insider Activity",
      concept: "Insider Buying & Selling Signals",
      difficulty: "Medium",
      fields: ["HF"],
      teaching: {
        intro:
          "Corporate insiders — CEOs, CFOs, board members — must publicly disclose when they buy or sell their company's stock. These filings are one of the few data sources where you're watching what people with deep company knowledge do with their own money.",
        sections: [
          {
            heading: "What insider activity is",
            body: "Insiders must file Form 4 disclosures within two business days of any transaction. These are public records anyone can access. They reveal: who bought or sold, how many shares, at what price, and what type of transaction it was (open market purchase, option exercise, gift, etc.).\n\nOpen market purchases — where an insider buys shares at the current market price with their own money — are the most meaningful signal.",
          },
          {
            heading: "Why buying matters more than selling",
            body: "Insider selling is ambiguous. Executives sell for dozens of reasons unrelated to their view of the company: taxes, diversification, a home purchase, estate planning, or simply following a pre-arranged 10b5-1 trading plan.\n\nInsider buying has one interpretation: the insider believes the current market price undervalues the company relative to what they know. They're putting personal, after-tax money in at today's price — the same price available to anyone.",
            example:
              "In late 2022, multiple insiders at a beaten-down consumer brand bought millions in shares at prices the market had abandoned. Over the next 18 months, the stock tripled. The insiders weren't lucky — they were seeing something the market was missing.",
          },
          {
            heading: "Cluster buying is the strongest signal",
            body: "When multiple insiders independently buy stock in a short window — all at similar prices — that's unusual. They don't coordinate (that would be illegal insider trading). They're each individually reacting to the same internal picture of value that the market is missing.\n\nCluster buying from three or more insiders in a 30-day window is one of the most reliable indicators an individual investor can access without proprietary information.",
          },
        ],
        keyTakeaway:
          "Open-market insider buying — especially when multiple insiders buy in a short window — is a meaningful signal that informed stakeholders see value the market is missing.",
      },
      practice: [
        {
          question:
            "A CEO purchases $1.8M of stock in the open market at the current price. What does this signal?",
          options: [
            "Nothing specific — executives buy stock regularly as part of compensation packages",
            "The CEO believes the current market price undervalues the company relative to their internal knowledge",
            "The company's stock price will definitely increase in the near term",
            "The CEO is trying to boost investor confidence through visible commitment",
          ],
          correctIndex: 1,
          explanation:
            "Open-market purchases at current market prices are the clearest form of insider buying. The CEO is using personal, after-tax dollars to buy at today's price — the same price available to anyone. This signals genuine belief that the market is undervaluing what they know.",
        },
        {
          question:
            "The CFO sells $4M of stock. How should you interpret this?",
          options: [
            "The company must have undisclosed problems — insiders always sell before bad news",
            "Possibly nothing — insiders sell for many personal reasons unrelated to their company view",
            "Always bearish — a CFO selling is a reliable negative signal",
            "Bullish — the CFO is giving other investors a chance to buy at better prices",
          ],
          correctIndex: 1,
          explanation:
            "Insider selling is ambiguous without additional context. Executives sell for taxes, personal diversification, estate planning, home purchases, and pre-arranged 10b5-1 plans — most unrelated to their view of the company. Selling only becomes suspicious in clusters, immediately before bad news, or when paired with other warning signals.",
        },
        {
          question:
            "Three different board members independently buy stock across three consecutive trading days at nearly identical prices. This is:",
          options: [
            "Routine — board members receive stock grants and trade shares regularly",
            "A cluster buying signal — independent simultaneous purchases from multiple insiders is uncommon and meaningful",
            "Potentially illegal — board members shouldn't trade in close proximity to each other",
            "Neutral — board members have less operational insight than executive officers",
          ],
          correctIndex: 1,
          explanation:
            "Cluster buying — multiple insiders buying independently in a short window — is one of the strongest signals available. They're not coordinating (that would be illegal). They're each individually seeing the same gap between market price and internal value. This convergence of informed, independent opinions is rare.",
        },
        {
          question:
            "An insider exercises stock options and immediately sells all shares received. This is:",
          options: [
            "A strong buying signal — the insider chose to exercise their options",
            "A weak or neutral signal — immediate sale after exercise is typically just monetizing compensation, not a directional bet",
            "A strong selling signal — they didn't keep any shares",
            "Illegal — insiders cannot sell shares received from option exercises",
          ],
          correctIndex: 1,
          explanation:
            "Option exercise plus immediate sale is the weakest form of insider transaction — it's simply converting compensation from one form (options) to cash. The insider isn't putting any of their own money at risk. This is distinct from an open-market purchase where they choose to buy at current prices.",
        },
      ],
      apply: {
        setup:
          "An energy company just announced a $500M buyback and 15% dividend hike. In the same week, three board members made open-market stock purchases totaling $1.1M. Revenue is down 6% due to oil price weakness, but free cash flow yield is 12%.",
        data: [
          { label: "Buyback announced", value: "$500M" },
          { label: "Dividend hike", value: "+15%" },
          { label: "Insider cluster buying", value: "3 board members, $1.1M total" },
          { label: "Revenue growth (YoY)", value: "-6% (commodity cycle)" },
          { label: "Free cash flow yield", value: "12%" },
          { label: "Net profit margin", value: "24%" },
        ],
        question:
          "How does the insider cluster buying change your read on this stock?",
        options: [
          "It doesn't — revenue is declining and that's the signal that matters most",
          "It strengthens the bull case — insiders are putting personal money behind the same FCF thesis the buyback signals",
          "It's suspicious — insiders shouldn't be buying when revenue is declining",
          "It's redundant — the buyback already signals the same confidence as the insider purchases",
        ],
        correctIndex: 1,
        explanation:
          "The buyback shows corporate confidence; the insider cluster buying shows personal confidence — these are different. Board members are using their own after-tax money at current prices, not the company's balance sheet. The convergence of a buyback, dividend hike, and cluster insider buying around a 12% FCF yield is a powerful reinforcement of the bull case.",
      },
    },
    {
      id: "short-interest",
      trackId: "market-indicators",
      order: 2,
      title: "Short Interest",
      concept: "Short Selling & Market Sentiment",
      difficulty: "Medium",
      fields: ["HF"],
      teaching: {
        intro:
          "Short sellers have a reputation as villains — but they're often the most rigorous analysts in the market. Understanding what high short interest tells you (and doesn't tell you) is essential for reading market sentiment correctly.",
        sections: [
          {
            heading: "How short selling works",
            body: "A short seller borrows shares from a broker, sells them at the current price, and hopes the price falls. If it does, they buy the shares back cheaper, return them to the lender, and keep the difference. If the price rises, they lose — and the potential loss is theoretically unlimited since prices can rise without a ceiling.\n\nShort interest is the percentage of a stock's tradeable shares (float) that are currently sold short. It's reported twice monthly and publicly available.",
          },
          {
            heading: "What high short interest tells you",
            body: "High short interest (above 15–20% of float) tells you that meaningful capital has been deployed against the stock by investors who pay a cost to borrow shares and face unlimited downside if they're wrong. This isn't noise — this is deliberate, costly positioning.\n\nHigh short interest means: the bearish case is well-funded and well-populated. It doesn't mean the bears are right. But it does mean that going long against heavy short interest requires clear articulation of why the bears are wrong.",
            example:
              "GameStop in early 2021 had short interest above 100% of float — more shares were shorted than existed (via rehypothecation). When retail buyers coordinated purchases, shorts were forced to cover simultaneously, creating one of history's most extreme short squeezes. Short interest was the setup, not the cause.",
          },
          {
            heading: "The short squeeze dynamic",
            body: "When shorts are wrong, they must buy shares to close positions (covering). If many shorts cover simultaneously — triggered by positive news or a forced margin call — the resulting buying pressure can send the stock sharply higher. This is a short squeeze.\n\nHigh short interest creates an asymmetric upside in positive scenarios: if the thesis is wrong and good news arrives, the forced buying from covering shorts amplifies the move significantly beyond what normal buying would create.",
          },
        ],
        keyTakeaway:
          "High short interest means informed investors are betting against the stock at real cost — take the bearish case seriously, but also recognize that being wrong creates explosive upside through short squeezes.",
      },
      practice: [
        {
          question:
            "A biotech stock has short interest of 26% of its float. What does this most accurately tell you?",
          options: [
            "26% of investors are wrong about the stock's direction",
            "Informed investors have positioned for the stock to fall, at real cost to themselves",
            "The stock will almost certainly decline in the near term",
            "The company has undisclosed financial problems that short sellers have discovered",
          ],
          correctIndex: 1,
          explanation:
            "High short interest is a data point, not a verdict. It tells you that sophisticated investors have taken a deliberate, costly position against the stock. They might be right or wrong — but they've done the work and are paying the borrow rate to hold this view.",
        },
        {
          question:
            "A stock with 28% short interest announces unexpectedly strong earnings. What is likely to happen?",
          options: [
            "The stock falls further — underlying business issues remain despite the beat",
            "A short squeeze — shorts forced to cover simultaneously create self-reinforcing buying pressure",
            "Short interest gradually decreases as bears exit over the following months",
            "Nothing unusual — earnings beats don't affect open short positions",
          ],
          correctIndex: 1,
          explanation:
            "When shorts are wrong, they must buy shares to cover before losses grow. If many shorts do this simultaneously — triggered by a positive earnings surprise — the resulting buying pressure creates a feedback loop. Rising prices force more shorts to cover, which pushes prices higher. This is the short squeeze mechanism.",
        },
        {
          question:
            "A company reports an earnings miss. The following week, short interest rises from 14% to 21%. What does this signal?",
          options: [
            "Shorts are covering — they think the worst is now priced in",
            "More investors are now positioned for further decline after the miss",
            "The stock is setting up for a short squeeze — high short interest is a contrarian buy signal",
            "Nothing — short interest fluctuates randomly week to week",
          ],
          correctIndex: 1,
          explanation:
            "Rising short interest after an earnings miss means the negative thesis is attracting new capital. Participants are opening or adding to short positions — signaling growing bearish conviction. The combination of a miss plus rising shorts is a bearish setup, not a squeeze setup.",
        },
        {
          question:
            "An activist short seller publishes a detailed report alleging accounting fraud at a company. Short interest jumps to 35%. The stock falls 25% in a day. How should you evaluate the report?",
          options: [
            "Trust it — short sellers with published reports are almost always right",
            "Dismiss it — short sellers have a financial incentive to drive prices down",
            "Read the specific evidence and accounting claims; verify independently before forming a view",
            "Buy the dip — stocks almost always recover after short-seller attacks",
          ],
          correctIndex: 2,
          explanation:
            "Short sellers who publish reports have both an incentive to be right (they're short) and an incentive to be persuasive (they need the stock to fall). Read the specific claims — are they verifiable? Has management responded? Have auditors weighed in? The truth is often somewhere between 'total fraud' and 'completely clean.'",
        },
      ],
      apply: {
        setup:
          "A biotech company has a Phase 3 drug readout in six weeks. Short interest has climbed to 28% of float following positive Phase 2 data that you believe supports the drug's prospects. You're evaluating whether to buy before the readout.",
        data: [
          { label: "Phase 3 readout timeline", value: "6 weeks" },
          { label: "Short interest", value: "28% of float" },
          { label: "Upside if approved", value: "+90%" },
          { label: "Downside if rejected", value: "-70%" },
          { label: "Your clinical background", value: "None" },
          { label: "Phase 2 outcome", value: "Positive (limited data)" },
        ],
        question:
          "What does the 28% short interest mean for your risk analysis?",
        options: [
          "It confirms the drug will fail — sophisticated short sellers are almost always right in biotech",
          "It tells you informed investors strongly disagree with the bull thesis — you need to articulate specifically why they're wrong",
          "It creates a squeeze opportunity — buy ahead of the readout and profit from forced covering",
          "It's irrelevant for biotech — Phase 3 outcomes are determined by science, not market positioning",
        ],
        correctIndex: 1,
        explanation:
          "28% short interest means well-resourced investors have made a costly bet against this stock. Without clinical expertise to evaluate the trial design and patient population, you can't articulate why they're wrong. The potential squeeze is real — but so is the -70% downside. Without edge on the binary outcome, pass is the disciplined answer regardless of short interest dynamics.",
      },
    },
    {
      id: "analyst-ratings",
      trackId: "market-indicators",
      order: 3,
      title: "Reading Analyst Ratings",
      concept: "Wall Street Research & Conflicts of Interest",
      difficulty: "Hard",
      fields: ["HF", "AM"],
      teaching: {
        intro:
          "Analyst upgrades move stock prices. But analyst ratings are not investment truth — they're one model, one set of assumptions, and sometimes one set of incentives that aren't aligned with yours. Knowing how to use research without being used by it is a critical skill.",
        sections: [
          {
            heading: "What analyst ratings are",
            body: "Wall Street analysts publish ratings — Buy, Hold, Sell (or firm-specific equivalents like Outperform, Neutral, Underperform) — alongside price targets derived from their valuation models. These reports move stock prices: an upgrade from a major bank can push a stock 3–8% in a single day.\n\nBut a rating is one person's model, with their assumptions about growth, margins, and discount rate. Change those assumptions and you get a different rating.",
          },
          {
            heading: "The conflict of interest problem",
            body: "Investment banks earn fees from the same companies they cover: underwriting stock offerings, advising on mergers, managing debt issuances. An analyst who issues a 'Sell' on a company the bank is advising on a deal risks that banking relationship.\n\nThis creates a structural conflict: analyst research serves two masters — investors who rely on it and corporate clients who pay the bank. The result: 'Sell' ratings are rare. Most research has more 'Buy' ratings than the market's actual performance justifies.",
            example:
              "Before the 2000 dot-com crash, several major Wall Street analysts publicly recommended stocks that their private emails revealed they personally considered 'junk' or 'a dog.' The conflict between banking fees and honest research was so stark it led to the Global Analyst Research Settlement of 2003.",
          },
          {
            heading: "How to use research without being manipulated",
            body: "Ignore the rating. Read the model.\n\nThe useful parts of a research note are the specific assumptions: what revenue growth rate are they using, where do they see margins going, what are the key risks they identify? These are the inputs you can verify and disagree with.\n\nA note that changes its rating without changing its fundamental view is almost entirely noise. A note that identifies a specific risk or opportunity you hadn't modeled — backed by concrete evidence — is worth taking seriously.",
          },
        ],
        keyTakeaway:
          "Analyst ratings move prices but reflect one model and possible conflicts — read the underlying assumptions and evidence, not just the Buy/Hold/Sell label.",
      },
      practice: [
        {
          question:
            "An analyst upgrades a stock from Hold to Buy with a price target 35% above current price. This should make you:",
          options: [
            "Buy immediately — upgrades from major banks reliably predict near-term outperformance",
            "Evaluate the underlying reasoning independently before making any decision",
            "Sell — upgrades are often timed to benefit the bank's inventory positions",
            "Wait for a second upgrade from a different bank to confirm",
          ],
          correctIndex: 1,
          explanation:
            "Analyst upgrades move prices and are worth reading — as one input, not a buy signal. Read the specific model assumptions. If the growth rate and margin assumptions strengthen your own thesis, weight it accordingly. If it's a valuation call from a bank with a banking relationship, be more skeptical.",
        },
        {
          question:
            "A quality SaaS company with 32% growth and 124% net revenue retention gets downgraded on 'valuation concerns.' The stock drops 8%. What's the right response?",
          options: [
            "Sell — analysts have proprietary models and data that individual investors lack",
            "Buy the dip aggressively — analyst valuation calls are always wrong",
            "Review the fundamentals independently; if unchanged, the drop is sentiment, not a business signal",
            "Wait for management to respond before deciding",
          ],
          correctIndex: 2,
          explanation:
            "A valuation downgrade doesn't change business quality. 32% growth and 124% NRR don't disappear because an analyst updated their discount rate assumption. If you've done your own fundamental analysis and it's unchanged, the 8% sentiment-driven drop is a data point — not a verdict. Act on your thesis, not on the rating.",
        },
        {
          question:
            "Why might an investment bank maintain a 'Buy' rating on a company it's simultaneously advising on a large merger?",
          options: [
            "Banks are legally required to maintain coverage ratings during active M&A processes",
            "The banking fee relationship creates a structural incentive to avoid downgrades that could jeopardize the deal",
            "Analysts at M&A advisory banks have better information and more confidence in positive outcomes",
            "Buy ratings are held longer as standard protocol to give management time to execute strategy",
          ],
          correctIndex: 1,
          explanation:
            "Investment banking fees from M&A transactions can be enormous — and a 'Sell' on a company you're advising would damage that relationship. This structural conflict is why you should always check whether the rating bank has an active advisory relationship with the company before heavily weighting their rating.",
        },
        {
          question:
            "An analyst changes a company's price target from $45 to $52 but keeps the rating at 'Hold.' The stock trades at $41. What should you infer?",
          options: [
            "The analyst believes the stock is worth significantly more — treat it as a Buy signal",
            "The analyst sees more upside but has constraints (perhaps a banking relationship) that prevent upgrading",
            "Price target changes without rating changes are always meaningless",
            "The analyst made a model error that they haven't yet corrected",
          ],
          correctIndex: 1,
          explanation:
            "A price target of $52 on a $41 stock implies ~27% upside — typically enough to warrant a Buy rating by most banks' internal standards. Keeping it at 'Hold' despite this suggests external constraints: a banking relationship, a firm-wide trading restriction, or simply conservative policy. Read the note for the reasoning and judge the underlying analysis on its merits.",
        },
      ],
      apply: {
        setup:
          "A SaaS company (Cloudex) gets downgraded from Buy to Hold by an investment bank that managed Cloudex's secondary offering eight months ago. The downgrade cites 'valuation concerns' at 55× earnings. The stock drops 8%. You own shares.",
        data: [
          { label: "Net revenue retention", value: "124%" },
          { label: "Revenue growth", value: "+32% YoY" },
          { label: "Last quarter vs estimates", value: "Beat on all metrics" },
          { label: "Downgrade rationale", value: "Valuation concerns (P/E 55×)" },
          { label: "Downgrading bank relationship", value: "Managed secondary offering 8 months ago" },
          { label: "Stock reaction", value: "-8% on downgrade day" },
        ],
        question:
          "How should you read this downgrade?",
        options: [
          "Credible — the bank knows Cloudex's business better than anyone from the secondary offering work",
          "Treat with skepticism — the banking relationship is a conflict, and the fundamentals don't support a quality concern",
          "Irrelevant — analyst ratings never cause meaningful or lasting price moves",
          "Contrarian buy signal — every downgrade creates a short-term overreaction worth fading",
        ],
        correctIndex: 1,
        explanation:
          "The bank that managed the secondary offering has a financial relationship that creates a potential conflict — they're also incentivized to maintain access to future deals. The downgrade is purely a valuation call (P/E 55×), not a business quality concern. 124% NRR and a beat quarter don't deteriorate overnight. Read the note's specific model assumptions. If the only change is 'the multiple expanded,' that's a price opinion from a potentially conflicted source — not a reason to sell a fundamentally strong business.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 4 — Volume Analysis (Medium)
    // -----------------------------------------------------------------------
    {
      id: "volume-analysis",
      trackId: "market-indicators",
      order: 4,
      title: "Volume Analysis",
      concept: "Trading Volume as a Confirmation Signal",
      difficulty: "Medium",
      fields: ["HF", "AM"],
      teaching: {
        intro:
          "Price tells you what happened. Volume tells you how much conviction was behind it. A stock that breaks to a new high on three times its average daily volume is saying something fundamentally different from one that drifts to a new high on barely any trading. Learning to read volume turns price moves from raw data into informed signals.",
        sections: [
          {
            heading: "Why volume matters",
            body: "Volume is the number of shares traded in a given period. It represents the aggregate conviction behind a price move — how many investors, and with how much capital, believed that price was fair.\n\nA price increase on high volume means many participants were willing to pay the higher price. A price increase on low volume might be a thin-market artifact — a few large orders moved the price without representing broad market conviction. Volume confirms or questions the reliability of a price signal.",
          },
          {
            heading: "High volume breakouts vs low volume fakeouts",
            body: "When a stock breaks above a significant resistance level on volume 2–3× above its average, that's a confirmed breakout. Institutional buyers are participating — the move reflects real demand, not a thin-market anomaly.\n\nWhen a stock breaks above resistance on volume below its average, treat it skeptically. Low volume breakouts frequently reverse — they're called 'fakeouts' because the price moved without genuine buying conviction. The move is fragile and easily reversed by any selling pressure.",
            example:
              "A stock that has been trading between $40 and $48 for six months suddenly breaks above $48 on 4× average volume. This high-volume breakout signals institutional participation and confirms the move. The same breakout on 0.5× average volume would be far less meaningful.",
          },
          {
            heading: "Climax volume and capitulation",
            body: "Climax volume — an extreme spike in volume during a sharp decline — sometimes signals capitulation: the final rush of panic sellers exhausting themselves. After a prolonged downtrend, a single day of 5–10× average volume with a large intraday reversal (stock sells off hard, then closes near the high) can signal that the most motivated sellers have exited.\n\nThis is not a reliable buy signal on its own — it requires context (how long the downtrend has been, what caused it, what the fundamentals look like). But combined with stabilizing fundamentals, climax volume can mark the end of a selling panic.",
          },
        ],
        keyTakeaway:
          "Volume confirms the conviction behind price moves — high-volume breakouts are stronger signals than low-volume ones; climax volume spikes sometimes mark exhaustion of a selling trend.",
      },
      practice: [
        {
          question:
            "A stock breaks to a 52-week high on volume 3× its 30-day average. What does this signal?",
          options: [
            "The stock is being manipulated — abnormal volume is a red flag",
            "A confirmed breakout — broad institutional participation validates the price move",
            "A fakeout — high volume at new highs means sellers are also active",
            "The stock is overbought — high volume signals near-term reversal",
          ],
          correctIndex: 1,
          explanation:
            "High volume (3× average) at a new 52-week high signals that broad participation — including institutional buyers — drove the move. This is a confirmation signal: the breakout reflects genuine demand, not a thin-market artifact. While no signal is perfect, high-volume breakouts are significantly more reliable than low-volume ones.",
        },
        {
          question:
            "A stock has been trending sideways for months. It breaks above resistance on volume 40% below its average. What should you conclude?",
          options: [
            "Strong buy — any breakout above resistance is a positive signal",
            "Skeptical — a low-volume breakout lacks institutional conviction and is prone to reversal",
            "Sell — low volume confirms the stock cannot attract buyers",
            "No conclusion possible — volume is irrelevant to breakout analysis",
          ],
          correctIndex: 1,
          explanation:
            "A below-average-volume breakout is a fakeout candidate. Without institutional participation, the move lacks conviction — a moderate amount of selling pressure can easily push the price back below resistance. Wait for confirmation: either a high-volume follow-through day or sustained price action above the breakout level.",
        },
        {
          question:
            "After a six-month decline, a stock experiences its highest single-day volume in two years with a large intraday reversal (opened down 8%, closed up 4%). What might this indicate?",
          options: [
            "Institutional selling — extreme volume always means large sellers exiting",
            "A potential capitulation day — extreme volume with reversal can signal exhaustion of panic sellers",
            "Manipulation — intraday reversals on high volume are always suspicious",
            "Nothing meaningful — one-day volume spikes are random",
          ],
          correctIndex: 1,
          explanation:
            "Climax volume with a significant intraday reversal — where the stock opens sharply lower but recovers to close positively — can signal capitulation: the most motivated sellers have exhausted themselves, and buyers stepped in at lower prices. This is a preliminary signal requiring confirmation, not a guaranteed buy signal.",
        },
        {
          question:
            "A stock rises 12% over three days on declining volume each day. On day one, volume is 150% of average; on day two, 90%; on day three, 60%. What is the most accurate interpretation?",
          options: [
            "Strong bullish signal — three consecutive up days confirms upward trend",
            "Concerning — diminishing volume on rising price suggests weakening buying conviction",
            "Bearish — declining volume always precedes a reversal",
            "Neutral — three-day volume trends are too short to be meaningful",
          ],
          correctIndex: 1,
          explanation:
            "Rising price on declining volume is a divergence signal. The first day had strong conviction (150% volume); by day three, the price is still rising but barely anyone is participating (60% volume). This suggests the initial buying impulse is fading. The move may continue briefly on momentum, but the declining participation is a caution signal — the rally lacks broad conviction.",
        },
      ],
      apply: {
        setup:
          "You are tracking a semiconductor company that has been in a downtrend for four months, falling from $120 to $72. Today, the stock dropped to $68 at the open (down 5.5%) but reversed sharply and closed at $78 (up 8.3% from the low). Volume was 6.2× its 30-day average — the highest single day since the company went public.",
        data: [
          { label: "Prior downtrend duration", value: "4 months" },
          { label: "Price range", value: "$120 → $72 (pre-event)" },
          { label: "Today: opening price", value: "$68 (down 5.5%)" },
          { label: "Today: closing price", value: "$78 (up 8.3% from low)" },
          { label: "Today's volume", value: "6.2× 30-day average" },
          { label: "Fundamentals", value: "Revenue still growing 18%, no debt" },
        ],
        question:
          "How do you interpret today's price and volume action?",
        options: [
          "A sell signal — extreme volume confirms a distribution day where institutions are exiting",
          "Potential capitulation — extreme volume with strong intraday reversal during a prolonged downtrend may signal exhaustion of sellers",
          "Inconclusive — single-day volume events are never meaningful for longer-term analysis",
          "A confirmed buy — climax volume reversals always mark the exact bottom",
        ],
        correctIndex: 1,
        explanation:
          "The combination of conditions here matches a capitulation profile: prolonged downtrend (4 months), extreme volume (6.2× average, highest ever), and a sharp intraday reversal from -5.5% to +8.3%. This suggests motivated sellers exhausted themselves in the early selling and buyers stepped in aggressively. Combined with intact fundamentals (revenue growth, no debt), this is worth investigating as a potential entry point — while recognizing that confirmation over the following days is essential before committing capital.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 5 — Moving Averages (Easy)
    // -----------------------------------------------------------------------
    {
      id: "moving-averages",
      trackId: "market-indicators",
      order: 5,
      title: "Moving Averages",
      concept: "Trend Identification & Support/Resistance",
      difficulty: "Easy",
      fields: ["HF", "AM"],
      teaching: {
        intro:
          "Moving averages are one of the most widely used tools in market analysis — not because they predict the future, but because they distill weeks or months of price data into a single trend line. Used correctly, they tell you whether a stock is in a healthy uptrend, a damaged downtrend, or at a critical inflection point.",
        sections: [
          {
            heading: "What a moving average is",
            body: "A moving average calculates the average price of a stock over a specified number of days, updated each day as new prices arrive. The 50-day moving average (50-MA) averages the last 50 daily closing prices. The 200-day moving average (200-MA) averages the last 200.\n\nBecause they smooth out short-term volatility, moving averages reveal the underlying trend — making it easier to see whether a stock is genuinely trending up, down, or sideways.",
          },
          {
            heading: "The 50-day and 200-day MAs",
            body: "The 50-day MA represents medium-term trend — roughly 10 weeks of trading. A stock consistently above its 50-MA is in a medium-term uptrend; below it is in a downtrend.\n\nThe 200-day MA represents the long-term trend — roughly 40 weeks of trading. This is the most widely watched moving average by institutional investors. A stock above its 200-MA is in a long-term uptrend. A stock below it is in a long-term downtrend.\n\nThese levels often act as support (the price bounces off them during pullbacks) or resistance (the price struggles to break above them after a decline).",
            example:
              "After the 2022 bear market selloff, many quality technology stocks fell below their 200-day moving averages for the first time in years. Professional investors used this level as a reference for when sustained recovery had begun — stocks that reclaimed their 200-MA with strong volume were viewed as returning to their long-term uptrends.",
          },
          {
            heading: "Golden cross and death cross",
            body: "A golden cross occurs when the 50-MA crosses above the 200-MA. This signals that medium-term momentum has turned positive relative to the long-term trend — historically a bullish signal followed by above-average returns.\n\nA death cross occurs when the 50-MA crosses below the 200-MA. This signals medium-term deterioration relative to the long-term trend — a bearish signal that often precedes continued weakness.\n\nImportant caveat: these are lagging indicators. They confirm a trend change after it has begun, not before. By the time a golden cross occurs, much of the recovery may have already happened.",
          },
        ],
        keyTakeaway:
          "The 50-day MA shows medium-term trend; the 200-day MA shows long-term trend — stocks above both are in healthy uptrends; a golden cross (50-MA above 200-MA) is a bullish trend confirmation signal.",
      },
      practice: [
        {
          question:
            "A stock is trading at $85, above its 200-day moving average of $78 and its 50-day moving average of $82. What does this configuration suggest?",
          options: [
            "The stock is overbought and likely to reverse toward its moving averages",
            "The stock is in a healthy uptrend — both medium-term and long-term trend indicators are positive",
            "The stock is about to experience a death cross",
            "Moving averages are irrelevant when a stock is above $80",
          ],
          correctIndex: 1,
          explanation:
            "A stock trading above both its 50-day and 200-day moving averages is in a confirmed uptrend on both timeframes. This is the configuration most professional investors look for as confirmation of a healthy trend — medium-term momentum is positive (above 50-MA) and the long-term trajectory is intact (above 200-MA).",
        },
        {
          question:
            "A stock's 50-day moving average crosses below its 200-day moving average for the first time in two years. This is called:",
          options: [
            "A golden cross — bullish indicator of renewed medium-term strength",
            "A death cross — bearish signal indicating medium-term momentum has deteriorated below the long-term trend",
            "A support breach — the stock has fallen through a key technical level",
            "A reversion to mean — a normal pattern that occurs in every uptrend",
          ],
          correctIndex: 1,
          explanation:
            "When the 50-day MA crosses below the 200-day MA, it's called a death cross — a bearish signal indicating that medium-term momentum has turned negative relative to the long-term trend. It's a lagging indicator (the trend change already happened), but it often precedes continued weakness as institutional investors use it as a risk-off trigger.",
        },
        {
          question:
            "A stock has been below its 200-day moving average for six months. It rallies sharply and closes above the 200-MA for the first time, on double average volume. What is the most accurate interpretation?",
          options: [
            "Meaningless — stocks cross their 200-MA randomly",
            "A potential trend change signal — reclaiming the 200-MA on high volume is a more reliable indication than on low volume",
            "An automatic buy signal — the 200-MA is the single most reliable indicator in markets",
            "A sell signal — stocks always reverse at the 200-MA after a prolonged downtrend",
          ],
          correctIndex: 1,
          explanation:
            "Reclaiming the 200-day moving average on high volume is a more significant signal than on low volume. It suggests institutional participation in the recovery — not just a thin-market bounce. This is a setup worth monitoring for follow-through, though it requires confirmation over subsequent days before treating it as a confirmed trend change.",
        },
        {
          question:
            "The 50-day MA of a quality stock has just crossed above its 200-day MA (a golden cross) after a prolonged downtrend. The stock has already rallied 28% from its low. What's the key limitation of acting on this signal?",
          options: [
            "Golden crosses are only valid on large-cap stocks",
            "Moving averages are lagging indicators — much of the recovery has likely already occurred by the time the cross happens",
            "The signal is only valid if confirmed by a second golden cross",
            "Golden crosses have never been statistically validated as predictive",
          ],
          correctIndex: 1,
          explanation:
            "The core limitation of moving average signals is that they're lagging — they confirm trend changes after they've begun. A golden cross occurs only after the 50-MA has risen above the 200-MA, which requires sustained price appreciation. By the time the cross happens, 20–30% of the move may have already occurred. This doesn't make the signal useless, but it means you're buying confirmation rather than getting ahead of the trend.",
        },
      ],
      apply: {
        setup:
          "You are evaluating a consumer staples company. The stock fell from $95 to $62 over eight months (a 35% decline). It has now rallied to $74 over the past three weeks. The 50-day MA is at $68 and the 200-day MA is at $79. Volume on the recent rally has been 1.8× the 30-day average.",
        data: [
          { label: "Prior peak", value: "$95" },
          { label: "Trough", value: "$62" },
          { label: "Current price", value: "$74" },
          { label: "50-day MA", value: "$68 (stock is above)" },
          { label: "200-day MA", value: "$79 (stock is below)" },
          { label: "Rally volume", value: "1.8× average" },
        ],
        question:
          "What do the moving averages tell you about the current state of this stock's trend?",
        options: [
          "In a confirmed uptrend — reclaiming the 50-MA is sufficient for trend confirmation",
          "In a mixed state — medium-term trend has improved (above 50-MA) but the long-term trend is still negative (below 200-MA); the 200-MA at $79 is now overhead resistance",
          "In a confirmed downtrend — a stock below its 200-MA is always a sell",
          "In a confirmed recovery — the high volume on the rally confirms the 200-MA will be taken out",
        ],
        correctIndex: 1,
        explanation:
          "The stock is in a transitional state. Reclaiming the 50-day MA ($68) is a medium-term positive — the most recent trend has turned up. But the 200-day MA at $79 (above the current $74 price) represents overhead resistance where sellers from the prior decline may be waiting to exit. The stock needs to convincingly breach $79 with strong volume to confirm a return to a long-term uptrend. Until then, the stock is between two key levels with the longer-term verdict still negative.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 6 — Earnings Surprises (Medium)
    // -----------------------------------------------------------------------
    {
      id: "earnings-surprises",
      trackId: "market-indicators",
      order: 6,
      title: "Earnings Surprises",
      concept: "Earnings Season Dynamics & Market Expectations",
      difficulty: "Medium",
      fields: ["HF", "AM", "IB"],
      teaching: {
        intro:
          "A company's earnings don't move its stock — its earnings relative to what the market already expected do. Understanding how expectations work is more important than understanding accounting. A great quarter can send a stock down; a bad one can send it up.",
        sections: [
          {
            heading: "What earnings consensus means",
            body: "Before a company reports each quarter, Wall Street analysts submit their earnings per share (EPS) and revenue estimates. These are aggregated into a consensus forecast — the market's embedded expectation.\n\nThe stock price already reflects this consensus. If a company earns exactly what was expected, the stock often does nothing. If it beats consensus significantly, the stock typically rises. If it misses, it typically falls. But the real driver is not the absolute number — it's the size and nature of the surprise relative to expectations.",
          },
          {
            heading: "Why stocks can fall on good news",
            body: "The most confusing earnings dynamic for new investors: a company reports excellent results — revenue up 40%, EPS beats by 10% — and the stock falls 8%. How?\n\nBecause the stock was already priced for those results (or better). The 40% revenue growth was 'in the price' — investors had already bought anticipating that outcome. When results come in at exactly expectations (or slightly below the whisper number that informed investors were circling), the 'buy the rumor, sell the news' dynamic kicks in.\n\nThe most important question during earnings season: not 'were the results good?' but 'were they good enough relative to the bar the market had set?'",
            example:
              "In Q2 2024, a major semiconductor company reported revenue up 122% year-over-year — the fastest growth in years. The stock fell 6% because investors had been pricing in 130%+ growth based on previous guidance raises. The results were exceptional in absolute terms but a 'miss' in relative terms.",
          },
          {
            heading: "Guidance is more important than results",
            body: "Stocks are priced on future earnings, not past ones. This means the forward guidance a company provides — revenue and EPS outlook for the next quarter or year — often moves the stock more than the just-reported results.\n\nA company that beats the current quarter but cuts guidance is delivering bad news wrapped in good-looking results. The stock will typically fall, sometimes sharply, because investors reprice future earnings lower.\n\nConversely, a company that misses the current quarter but raises full-year guidance is delivering good news with a messy current quarter — often a buying opportunity.",
          },
        ],
        keyTakeaway:
          "Stocks move on the surprise vs consensus expectations — results already 'in the price' don't move stocks; guidance for future earnings often matters more than current quarter results.",
      },
      practice: [
        {
          question:
            "A company reports EPS of $1.42 versus analyst consensus of $1.28 (an 11% beat). But the stock falls 5% after the report. What is the most likely explanation?",
          options: [
            "The market made an error — a beat always means the stock should rise",
            "The forward guidance disappointed — investors reprice future earnings more heavily than current results",
            "The EPS beat was too large — big beats cause investor skepticism",
            "The stock was being manipulated downward by short sellers after the report",
          ],
          correctIndex: 1,
          explanation:
            "Stocks are priced on future earnings expectations. An 11% EPS beat in the current quarter is good — but if management guided next quarter's EPS 8% below consensus, investors have just learned that future earnings will be lower than they thought. The price will fall to reflect the revised outlook, even though the just-reported results were strong.",
        },
        {
          question:
            "A cloud software company misses Q3 revenue estimates by 3% but raises full-year revenue guidance by 6%. How should the stock react?",
          options: [
            "Fall — a revenue miss is always a negative signal regardless of guidance",
            "Likely rise — the raised full-year guidance tells investors the business is on a stronger trajectory than the quarter implied",
            "Stay flat — quarterly miss and annual raise cancel each other out",
            "Fall — guidance raises are usually unachievable and the miss is the real signal",
          ],
          correctIndex: 1,
          explanation:
            "A quarterly miss with a full-year raise is a classic case where guidance matters more than results. Management is signaling that despite a rough quarter (perhaps timing or one-time factors), the full-year trajectory is stronger than investors thought. Stocks typically rise in this scenario because investors reprice higher future earnings.",
        },
        {
          question:
            "The phrase 'buy the rumor, sell the news' describes what dynamic?",
          options: [
            "Insider trading — rumors are traded on before official announcements",
            "Stocks often rise in anticipation of good news and then fall when the news is confirmed, as buyers who 'bought the rumor' sell on confirmation",
            "Market makers spread rumors to generate trading volume",
            "Analysts downgrade stocks after positive news to create buying opportunities",
          ],
          correctIndex: 1,
          explanation:
            "'Buy the rumor, sell the news' describes the pattern where a stock rises as investors anticipate a positive event (earnings beat, product launch, FDA approval) and then declines when the event is confirmed — because the buyers who drove the price up now sell to realize gains. The good news was already priced in through the anticipatory buying.",
        },
        {
          question:
            "An industrial company reports results that beat EPS estimates by 15% and raises full-year guidance by 10%. The stock rises 12% on the day. Is this a signal to buy more?",
          options: [
            "Yes — a strong beat plus raised guidance is the best possible outcome; add immediately",
            "Evaluate carefully — after a 12% move the good news may now be fully reflected in the new price; assess whether the updated guidance justifies the new valuation",
            "No — stocks that gap up sharply on earnings always reverse within a week",
            "Yes — guidance raises compound over multiple quarters, guaranteeing further gains",
          ],
          correctIndex: 1,
          explanation:
            "A 12% gap up on strong results and raised guidance means the stock quickly repriced to reflect the new earnings outlook. After the gap, you need to reassess: does the new valuation still represent a good entry point relative to the updated earnings trajectory? The good news is now 'in the price.' Whether it's a buy at the new level depends on whether the raised guidance represents a new floor or already reflects the bull case.",
        },
      ],
      apply: {
        setup:
          "You are analyzing a retail company's earnings report. The market expected EPS of $0.88 and revenue of $4.2B. The company reported EPS of $0.91 (beat) and revenue of $4.05B (miss). Management guided next quarter's revenue to $3.9B versus consensus of $4.3B — a 9% guidance cut. The stock is down 14% after hours.",
        data: [
          { label: "EPS: expected vs actual", value: "$0.88 expected → $0.91 actual (+3% beat)" },
          { label: "Revenue: expected vs actual", value: "$4.2B expected → $4.05B actual (-3.6% miss)" },
          { label: "Next quarter revenue guidance", value: "$3.9B vs $4.3B consensus (-9%)" },
          { label: "After-hours reaction", value: "-14%" },
          { label: "Company explanation", value: "Consumer softness in discretionary categories" },
        ],
        question:
          "What is primarily driving the -14% after-hours move despite the EPS beat?",
        options: [
          "The revenue miss — a 3.6% shortfall is always punished heavily by the market",
          "The guidance cut — management's 9% reduction to next quarter's revenue outlook tells investors forward earnings will be materially lower than expected",
          "Market overreaction — a 3% EPS beat should more than offset the revenue miss",
          "Short sellers taking advantage of the after-hours illiquidity to drive the price lower",
        ],
        correctIndex: 1,
        explanation:
          "The guidance cut is the driver. The EPS beat (a 3% outperformance on past results) is irrelevant when management has just told the market that next quarter's revenue will be 9% below consensus. Investors reprice forward earnings lower immediately. A 9% revenue guidance cut with a 'consumer softness' explanation also raises questions about how long the trend will persist — which amplifies the sell reaction beyond what the single-quarter math justifies.",
      },
    },
  ],
};

const fedAndRates: Lesson = {
  id: "fed-and-rates",
  trackId: "market-indicators",
  order: 7,
  title: "The Fed & Interest Rates",
  concept: "How Monetary Policy Moves Markets",
  difficulty: "Medium",
  fields: ["HF", "AM", "IB", "PE"],
  teaching: {
    intro: "The Federal Reserve sets the most important price in the economy — the short-term interest rate. Every investor needs to understand what the Fed does, how to read its signals, and why rate changes hit different stocks in completely different ways.",
    sections: [
      {
        heading: "What Does the Fed Do?",
        body: "The Federal Reserve is the US central bank. It controls the federal funds rate — the overnight lending rate between banks, which influences every other interest rate in the economy from mortgages to corporate bonds. The Fed has a dual mandate: maximum employment and price stability (low inflation). It raises rates to slow inflation; it cuts rates to stimulate growth.",
        example: "When inflation hit 9% in 2022, the Fed raised rates from near zero to 5.25% over 18 months — the fastest hiking cycle in 40 years. Growth stocks that traded at 50–80× earnings were repriced dramatically lower as future cash flows became worth less in a high-rate world.",
      },
      {
        heading: "How Rates Affect Different Stocks",
        body: "Higher rates raise the discount rate used to value future cash flows — making all future earnings worth less today. Growth stocks (whose earnings are far in the future) are hit hardest. Value stocks (with earnings today) are less sensitive. Banks and financials actually benefit from higher rates because they earn more on loans than they pay on deposits. Real estate and utilities are hurt because they compete with bonds for income-seeking investors.",
      },
      {
        heading: "Reading the Fed",
        body: "The Fed meets 8 times per year (FOMC meetings) to set rates. Its communication matters as much as its decisions. Key signals: the dot plot shows each Fed member's projected rate path. Jackson Hole speeches set expectations months in advance. 'Higher for longer' language crushes growth multiples. 'Pivot' signals — any hint of cuts — can trigger sharp growth stock rallies. Learning to read Fed language is a core market skill.",
      },
    ],
    keyTakeaway: "You don't need to predict the Fed — you need to understand how rate changes hit different types of stocks differently, and position your portfolio to reflect the current rate environment.",
  },
  practice: [
    {
      question: "The Fed raises rates from 4.5% to 5.25%. Which sector is most likely to benefit?",
      options: [
        "High-growth software companies",
        "Consumer discretionary retailers",
        "Regional banks",
        "Real estate investment trusts (REITs)",
      ],
      correctIndex: 2,
      explanation: "Regional banks earn more on loans (rates rise) while their deposit costs lag. This widens their net interest margin — direct earnings benefit. High-growth software is hurt (future earnings discounted more heavily). REITs compete with bonds and are also pressured. Consumer discretionary suffers as borrowing costs rise for consumers.",
    },
    {
      question: "Why do high-growth technology stocks fall more than value stocks during rate hike cycles?",
      options: [
        "They carry more total debt on their balance sheets",
        "Their earnings are concentrated far in the future and worth less when discounted at higher rates",
        "They are inherently more volatile by definition",
        "They are more exposed to changes in consumer spending",
      ],
      correctIndex: 1,
      explanation: "Valuation is the present value of all future cash flows. When the discount rate rises, cash flows far in the future lose value more than near-term cash flows. A growth company earning $1 in year 10 loses more value from a rate hike than a value company earning $1 next year. This is pure math — not about debt or volatility.",
    },
    {
      question: "What is the Federal Reserve's dual mandate?",
      options: [
        "Control inflation and set bank reserve requirements",
        "Maximize employment and maintain price stability",
        "Regulate bank lending practices and set mortgage rates",
        "Manage the national debt and money supply",
      ],
      correctIndex: 1,
      explanation: "The Fed's dual mandate is maximum employment and stable prices. These two goals sometimes conflict — cutting rates helps employment but risks inflation; raising rates fights inflation but slows hiring. Managing this tension is the core challenge of monetary policy.",
    },
    {
      question: "The Fed signals it expects to cut rates three times over the next 12 months. Which asset class is most likely to rally the most?",
      options: [
        "Short-term Treasury bonds",
        "High-growth technology stocks with high P/E ratios",
        "Regional bank stocks",
        "Commodity-linked funds",
      ],
      correctIndex: 1,
      explanation: "Rate cuts directly increase the present value of future earnings — which disproportionately benefits high-P/E growth stocks whose value is weighted toward far-future cash flows. Short-term treasuries see modest price gains. Banks actually suffer as their net interest margin compresses. Commodities respond more to economic growth than rate levels directly.",
    },
  ],
  apply: {
    setup: "Inflation has fallen from 9% to 3.1%. The Fed has held rates at 5.25–5.5% for 11 months. The latest dot plot projects 2 rate cuts over the next 12 months. Your portfolio is 70% high-growth technology stocks (average P/E of 45×) and 30% regional bank stocks.",
    data: [
      { label: "Current Fed funds rate", value: "5.25–5.5%" },
      { label: "Current inflation (CPI)", value: "3.1%" },
      { label: "Projected rate cuts (dot plot)", value: "2 over 12 months" },
      { label: "Portfolio: growth tech", value: "70% — avg P/E 45×" },
      { label: "Portfolio: regional banks", value: "30%" },
    ],
    question: "How should you think about adjusting this portfolio given the rate outlook?",
    options: [
      "Hold as-is — the rate pivot will benefit both positions equally",
      "Gradually trim regional bank exposure as rate cuts will compress their net interest margin",
      "Reduce growth tech significantly — high rates still make 45× P/E dangerous",
      "Aggressively increase growth tech now — rate cuts are bullish for the whole market",
    ],
    correctIndex: 1,
    explanation: "Rate cuts are positive for your 70% growth tech allocation — lower discount rates increase the present value of future earnings, supporting high-multiple stocks. However, 2 rate cuts will compress net interest margins for regional banks, which have benefited from the high-rate environment. The appropriate response is to gradually reduce bank exposure as the rate environment shifts, while allowing the growth tech to benefit from the rate tailwind. This is textbook sector rotation in response to monetary policy — one of the most reliable macro-driven investment frameworks.",
  },
};

// ---------------------------------------------------------------------------
// Track 5 — Advanced Concepts
// Complex frameworks used by professional investors across all fields.
// ---------------------------------------------------------------------------

const advancedConcepts: Track = {
  id: "advanced-concepts",
  title: "Advanced Concepts",
  description:
    "Master the frameworks professionals use to value companies, evaluate capital allocation, understand derivatives, read macro conditions, and analyze complex corporate events like M&A.",
  difficulty: "Advanced",
  lessons: [
    // -----------------------------------------------------------------------
    // Lesson 1 — Discounted Cash Flow (Hard)
    // -----------------------------------------------------------------------
    {
      id: "discounted-cash-flow",
      trackId: "advanced-concepts",
      order: 1,
      title: "Discounted Cash Flow",
      concept: "DCF Valuation & Intrinsic Value",
      difficulty: "Hard",
      fields: ["IB", "PE", "HF", "AM"],
      teaching: {
        intro:
          "A DCF model is the most rigorous valuation tool in finance — and the most dangerous. It prices a business by calculating the present value of all future cash flows. Get the inputs right and it reveals intrinsic value. Get them wrong and it's a precision machine that confidently produces garbage.",
        sections: [
          {
            heading: "The core DCF framework",
            body: "The DCF formula answers one question: what is the sum of all future cash flows this business will generate, discounted back to today's value?\n\nStep 1 — Project free cash flow (FCF): estimate revenue growth, operating margins, and capital expenditure requirements for 5–10 years forward.\n\nStep 2 — Calculate terminal value: the business doesn't stop at year 10. Terminal value estimates all cash flows beyond the projection period, typically using either a perpetuity growth model (FCF × (1+g) / (WACC - g)) or an exit multiple (projected EBITDA × sector average multiple).\n\nStep 3 — Discount to present value: apply the weighted average cost of capital (WACC) as the discount rate. A dollar received in 10 years is worth less than a dollar today — the discount rate reflects how much less.",
            example:
              "A software company generates $100M FCF today, growing at 20% annually for 5 years, then 8% in perpetuity. With a 10% WACC, the 5-year projected FCFs total roughly $748M in present value terms, and the terminal value adds several billion more. The sum gives an intrinsic value to compare against the current market cap.",
          },
          {
            heading: "WACC — the discount rate",
            body: "WACC (Weighted Average Cost of Capital) blends the cost of equity and the cost of debt weighted by their share of the capital structure.\n\nCost of equity is estimated using the Capital Asset Pricing Model: Risk-Free Rate + Beta × Equity Risk Premium. A company with beta of 1.2, a 4.5% risk-free rate, and a 5% equity risk premium has a cost of equity of ~10.5%.\n\nCost of debt is simpler: the interest rate on the company's debt, adjusted for the tax shield (since interest is tax-deductible).\n\nThe WACC is the minimum return investors require. Every percentage point higher in WACC significantly reduces the present value of distant future cash flows — making WACC selection one of the most impactful (and contested) parts of any DCF.",
          },
          {
            heading: "Why DCF sensitivity matters",
            body: "Small changes in inputs produce enormous changes in output. Changing the terminal growth rate from 3% to 4% on a company with a 10% WACC can increase intrinsic value by 20–40%. Changing WACC from 9% to 11% can reduce intrinsic value by 25–35%.\n\nThis sensitivity is the DCF's greatest weakness: it produces a precise number from imprecise assumptions. Professional analysts always present a sensitivity table showing how intrinsic value changes across a range of growth rates and WACCs — never a single point estimate. A DCF presented as a single number is not a rigorous analysis.",
          },
        ],
        keyTakeaway:
          "A DCF values a business as the present value of all future free cash flows — but it's only as good as its assumptions; always test sensitivity to growth rate and WACC before trusting any intrinsic value estimate.",
      },
      practice: [
        {
          question:
            "A DCF projects FCF of $50M in year one growing at 25% annually for 5 years, then 5% in perpetuity, with a 10% WACC. The terminal value will be:",
          options: [
            "A small portion of total value — near-term cash flows dominate",
            "The dominant portion of total value — most of a growing company's value is in the terminal period",
            "Exactly equal to the sum of projected FCFs",
            "Irrelevant — terminal value assumptions are always arbitrary",
          ],
          correctIndex: 1,
          explanation:
            "For growing companies, the terminal value typically represents 60–80% or more of total DCF value. This is because a perpetually growing business generates enormous cash flows after the explicit projection period. This concentration of value in the terminal period is why small changes in the terminal growth rate assumption have such a dramatic impact on the final valuation.",
        },
        {
          question:
            "You increase the WACC used in a DCF from 9% to 12%. What happens to the estimated intrinsic value?",
          options: [
            "It increases — a higher discount rate reflects higher expected returns",
            "It decreases — a higher discount rate reduces the present value of all future cash flows",
            "It stays the same — WACC only affects the cost of debt portion",
            "It increases for near-term cash flows but decreases for terminal value",
          ],
          correctIndex: 1,
          explanation:
            "WACC is the denominator in the discounting process. A higher WACC means future cash flows are worth less today — the present value of every dollar shrinks. Going from 9% to 12% WACC on a high-growth company can reduce intrinsic value by 25–40% because both the projected FCFs and the terminal value are discounted more aggressively.",
        },
        {
          question:
            "An analyst presents a DCF model showing intrinsic value of exactly $142.60 per share. What should you immediately ask?",
          options: [
            "How they calculated the beta for the WACC",
            "What the sensitivity table looks like — how does intrinsic value change across reasonable ranges of growth rate and WACC?",
            "Whether the revenue projections are GAAP or non-GAAP",
            "Nothing — a precise intrinsic value estimate confirms rigorous modeling",
          ],
          correctIndex: 1,
          explanation:
            "A single precise intrinsic value from a DCF is a red flag, not a sign of rigor. DCF inputs are uncertain — terminal growth rate, WACC, and margin projections all have ranges of reasonable outcomes. A rigorous DCF presents a sensitivity table showing how value changes across those ranges. Without it, the precision of $142.60 is false confidence built on point estimates of inherently uncertain variables.",
        },
        {
          question:
            "A DCF on a biotech startup projects $0 FCF for years 1–4 (clinical trials), then $500M FCF in year 5 growing at 15% thereafter, with a 14% WACC. What is the key risk in this model?",
          options: [
            "The WACC is too low for a biotech startup",
            "All value depends on distant, uncertain cash flows — small changes to growth or probability assumptions create enormous valuation swings",
            "A 15% terminal growth rate is too conservative for biotech",
            "FCF projections cannot be made beyond 3 years for any company",
          ],
          correctIndex: 1,
          explanation:
            "When all cash flows are in the distant future, the DCF is highly sensitive to assumptions — and those assumptions rest on events (trial success, drug approval, commercial launch) that are genuinely binary and uncertain. The model's precision is illusory: the enormous terminal value discounted back 5–10 years at 14% compounds uncertainty at every step. A scenario-weighted DCF (probability × value across success and failure cases) is far more honest for binary-event businesses.",
        },
      ],
      apply: {
        setup:
          "You are valuing a SaaS company using a DCF. The company currently generates $80M in free cash flow. You project 30% annual FCF growth for 5 years, then 5% terminal growth. You are deciding between a 9% WACC (low-risk scenario) and an 11% WACC (higher-risk scenario). The company's current market cap is $2.4B.",
        data: [
          { label: "Current FCF", value: "$80M" },
          { label: "Projected FCF growth (5 years)", value: "30% annually" },
          { label: "Terminal growth rate", value: "5%" },
          { label: "WACC scenario A", value: "9%" },
          { label: "WACC scenario B", value: "11%" },
          { label: "Current market cap", value: "$2.4B" },
        ],
        question:
          "How should the 2% WACC difference between scenarios affect your confidence in the intrinsic value estimate?",
        options: [
          "Minimally — 2% WACC difference has a small effect on high-growth companies",
          "Significantly — a 2% WACC change on a high-growth company could shift intrinsic value by 25–40%, potentially moving the conclusion from 'undervalued' to 'fairly valued' or vice versa",
          "Exactly 2% — WACC changes produce proportional changes in intrinsic value",
          "Not at all — at 30% growth, near-term cash flows dominate and WACC matters little",
        ],
        correctIndex: 1,
        explanation:
          "A 2% WACC difference on a high-growth SaaS company — where most value is in the terminal period — can shift intrinsic value by 25–40% or more. At 9% WACC the intrinsic value might be $3.0B (24% upside to market). At 11% WACC it might be $2.0B (17% downside). The same model, the same fundamentals, and two reasonable WACC assumptions produce entirely opposite investment conclusions. This is why DCF sensitivity analysis is not optional — it is the analysis.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 2 — Capital Allocation & ROIC (Hard)
    // -----------------------------------------------------------------------
    {
      id: "capital-allocation-roic",
      trackId: "advanced-concepts",
      order: 2,
      title: "Capital Allocation & ROIC",
      concept: "Return on Invested Capital & Value Creation",
      difficulty: "Hard",
      fields: ["PE", "HF", "IB", "AM"],
      teaching: {
        intro:
          "The single best predictor of long-term equity returns is not revenue growth or profit margins — it's return on invested capital (ROIC). A business that earns 25% on every dollar it reinvests compounds value relentlessly. One that earns 6% destroys value even while growing.",
        sections: [
          {
            heading: "What ROIC measures",
            body: "ROIC = Net Operating Profit After Tax (NOPAT) ÷ Invested Capital\n\nInvested Capital = Equity + Interest-bearing Debt - Excess Cash\n\nROIC answers: for every dollar shareholders and debt holders have put into this business, how much after-tax operating profit does it generate annually?\n\nA business with ROIC above its cost of capital (WACC) is creating value. Every dollar reinvested earns more than investors require. A business with ROIC below its WACC destroys value — it would be better off returning capital than reinvesting it.",
            example:
              "Company A has $1B of invested capital and generates $250M of NOPAT — a 25% ROIC. Its WACC is 10%. Every dollar reinvested creates $0.15 of economic value above the hurdle rate. Company B has $1B invested capital and generates $80M NOPAT — 8% ROIC against 10% WACC. It's earning less than investors require. Reinvesting destroys value.",
          },
          {
            heading: "The reinvestment rate and growth quality",
            body: "High growth with low ROIC is worse than slow growth with high ROIC. The reinvestment rate — what percentage of operating profit the company puts back into the business — determines how much capital is needed to fuel each point of growth.\n\nValue creation = (ROIC - WACC) × Invested Capital Growth\n\nA company growing 30% by reinvesting aggressively with 8% ROIC is grinding through capital to produce subeconomic returns. A company growing 10% with 35% ROIC is creating enormous value at each step. Warren Buffett's enduring obsession with high-ROIC businesses stems directly from this math.",
          },
          {
            heading: "Capital allocation decisions",
            body: "When a business generates cash, management has four choices: reinvest in organic growth (new products, capacity, markets), acquire other businesses (M&A), return capital to shareholders (dividends or buybacks), or hold cash.\n\nThe discipline lies in choosing based on expected return vs cost of capital. Reinvesting at 30% ROIC is excellent if the opportunity is real. Paying 15× EV/EBITDA for an acquisition that earns 7% ROIC destroys value even if earnings per share 'accrete'.\n\nThe best capital allocators consistently earn returns well above their cost of capital over decades — companies like Constellation Software, Danaher, and Berkshire Hathaway.",
          },
        ],
        keyTakeaway:
          "ROIC above WACC creates value; below WACC destroys it — growth only creates value when the incremental return on capital exceeds the cost of that capital.",
      },
      practice: [
        {
          question:
            "A company has a 22% ROIC and a 10% WACC. It plans to reinvest aggressively to grow revenue 25% annually. Is this value-creating?",
          options: [
            "No — high growth always destroys value by diluting existing shareholders",
            "Yes — ROIC (22%) exceeds WACC (10%), so every dollar reinvested creates $0.12 of economic value above the hurdle",
            "Neutral — revenue growth and capital returns are unrelated",
            "Only if the growth is organic — M&A growth at 22% ROIC is always value-destructive",
          ],
          correctIndex: 1,
          explanation:
            "When ROIC exceeds WACC, reinvestment creates value. At 22% ROIC and 10% WACC, every dollar of reinvested capital generates $0.12 of economic profit above what investors require. A company that can deploy large amounts of capital at 22% ROIC is compounding value at an exceptional rate — this is the engine behind the best long-term compounders.",
        },
        {
          question:
            "Company X grows revenue 35% annually but earns only 7% ROIC on a 10% WACC. What is happening to shareholder value?",
          options: [
            "Being created rapidly — 35% growth justifies subeconomic returns temporarily",
            "Being destroyed — each new dollar invested earns less than shareholders require, regardless of how fast the top line grows",
            "Being preserved — the growth will eventually compress invested capital",
            "Uncertain — ROIC below WACC is only problematic if margins are also negative",
          ],
          correctIndex: 1,
          explanation:
            "ROIC below WACC means value destruction, period. The company needs to invest large amounts of capital to sustain 35% growth — and each dollar it invests earns 7% against a 10% hurdle. Rapid growth funded by value-destructive reinvestment makes the problem larger, not smaller. The market often rewards revenue growth and punishes capital destruction — which is why investors sometimes overpay for fast-growing low-ROIC businesses.",
        },
        {
          question:
            "A company has $500M in cash and no high-ROIC reinvestment opportunities above its cost of capital. Management proposes a $2B acquisition of a competitor at 14× EV/EBITDA, projecting 6% ROIC from the deal against their 10% WACC. What should shareholders prefer?",
          options: [
            "The acquisition — M&A always generates synergies that improve the ROIC post-close",
            "A dividend or buyback — returning capital beats investing it at 6% ROIC when WACC is 10%",
            "Hold cash — maintaining optionality is always better than making capital allocation decisions",
            "The acquisition — revenue diversification reduces WACC and the math will improve",
          ],
          correctIndex: 1,
          explanation:
            "Investing at 6% ROIC against a 10% WACC destroys $0.04 per dollar deployed. Returning $500M to shareholders through buybacks or dividends at least allows investors to redeploy the capital at their own expected returns. Management's job is to invest above the cost of capital — not to deploy cash at any price for the sake of growth.",
        },
        {
          question:
            "A company reports EPS growth of 15% year over year. But invested capital grew 22% and ROIC fell from 18% to 14%. What does this tell you?",
          options: [
            "The company is in great shape — 15% EPS growth is strong",
            "EPS growth is masking capital consumption — the business is reinvesting heavily but at declining returns, potentially diluting long-term value",
            "A temporary dip in ROIC is normal during expansion phases",
            "ROIC only matters for companies that pay dividends",
          ],
          correctIndex: 1,
          explanation:
            "EPS growth funded by rapid invested capital growth can mask deteriorating capital efficiency. If ROIC falls from 18% to 14% while invested capital rises 22%, the company is deploying more and more capital at lower returns. This pattern — growing faster than the quality of reinvestment justifies — is a warning sign that often precedes earnings disappointments when the capital can no longer sustain growth.",
        },
      ],
      apply: {
        setup:
          "You are comparing two industrial companies. Both have $2B market caps, similar revenue, and 12% revenue growth. Company A earns 28% ROIC and reinvests 40% of operating profit. Company B earns 9% ROIC and reinvests 80% of operating profit. Both have a 10% WACC.",
        data: [
          { label: "Company A — ROIC", value: "28%" },
          { label: "Company A — Reinvestment rate", value: "40% of operating profit" },
          { label: "Company B — ROIC", value: "9%" },
          { label: "Company B — Reinvestment rate", value: "80% of operating profit" },
          { label: "WACC (both)", value: "10%" },
          { label: "Revenue growth (both)", value: "12%" },
        ],
        question:
          "Which company is creating more value for shareholders at the same revenue growth rate?",
        options: [
          "Company B — the higher reinvestment rate shows more aggressive growth ambition",
          "Company A — 28% ROIC far exceeds WACC (10%), so each reinvested dollar creates large economic value; Company B's 9% ROIC destroys value on every dollar reinvested",
          "They are equal — both grow at 12% revenue with similar market caps",
          "Company B — a lower reinvestment rate in Company A means it's returning too much capital and missing growth",
        ],
        correctIndex: 1,
        explanation:
          "Company A reinvests at 28% ROIC against a 10% WACC — creating $0.18 of economic value per dollar invested. Company B reinvests at 9% ROIC against 10% WACC — destroying $0.01 per dollar invested. And Company B is investing twice as much of its operating profit (80% vs 40%). Same revenue growth, but one is compounding value and one is consuming capital to sustain growth that doesn't earn its cost. Over a decade, this difference in capital efficiency compounds into dramatically different outcomes for shareholders.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 3 — Options & Derivatives (Hard)
    // -----------------------------------------------------------------------
    {
      id: "options-derivatives",
      trackId: "advanced-concepts",
      order: 3,
      title: "Options & Derivatives",
      concept: "Calls, Puts, Implied Volatility & Risk",
      difficulty: "Hard",
      fields: ["HF", "AM"],
      teaching: {
        intro:
          "Options are the most misunderstood instruments in markets. Used correctly, they let sophisticated investors express precise risk/reward positions or protect portfolios. Used carelessly, they can lose 100% of capital on a trade where the stock barely moved. Understanding the mechanics is non-negotiable before touching them.",
        sections: [
          {
            heading: "Calls and puts — the basic instruments",
            body: "A call option gives the buyer the right (not obligation) to buy 100 shares of a stock at a specific price (the strike price) by a specific date (expiry). You buy a call when you believe the stock will rise significantly above the strike before expiry. If the stock doesn't reach the strike, the option expires worthless and you lose the entire premium paid.\n\nA put option gives the buyer the right to sell 100 shares at the strike price by expiry. You buy a put when you expect the stock to fall significantly below the strike. Puts are also used as portfolio insurance — buying puts on positions you own hedges against a large decline.",
            example:
              "You buy a call option on a $100 stock with a $110 strike and 60-day expiry for $3 per share ($300 total). If the stock rises to $120, the option is worth $10 per share ($1,000) — a 233% return on the premium. If the stock stays at $100 (doesn't reach the strike), the option expires worthless and you lose $300.",
          },
          {
            heading: "Implied volatility and its effects",
            body: "Option prices are driven primarily by implied volatility (IV) — the market's expectation of how much the stock will move. High IV means expensive options; low IV means cheap options.\n\nIV crush is one of the most common traps for options beginners. Before an earnings report, IV rises dramatically as uncertainty peaks. After the report — even if it's a blowout beat — IV collapses because the uncertainty is resolved. This IV crush can cause an option to lose 40–60% of its value immediately after earnings, even when the stock moves in the expected direction.\n\nExample: you buy calls on a stock before earnings expecting a 10% move. Earnings comes in at +8% — close to your target. But because IV collapses from 80% to 30% after the announcement, your option may still lose value.",
          },
          {
            heading: "Risk defined vs risk undefined",
            body: "Buying options has defined risk: you can never lose more than the premium paid. Selling options creates undefined risk.\n\nSelling a covered call (selling a call against stock you own) is conservative — you receive premium and give up upside above the strike.\n\nSelling a naked call (selling a call without owning the underlying stock) has theoretically unlimited risk: the stock can rise indefinitely, forcing you to buy shares at any price to fulfill the contract. This is not a strategy for anyone without deep capital and specific expertise.\n\nFor most investors, buying options (defined risk) is the appropriate framework. Selling naked options is speculation with potentially catastrophic downside.",
          },
        ],
        keyTakeaway:
          "Calls and puts let you express leveraged directional bets with defined risk — but implied volatility crush around events like earnings can destroy option value even when the price moves your way.",
      },
      practice: [
        {
          question:
            "You buy a call option on a $50 stock with a $55 strike and 30-day expiry, paying $1.50 per share ($150 total). At expiry, the stock trades at $54. What happens to your option?",
          options: [
            "It pays out $4 per share — the stock moved $4 from your purchase price",
            "It expires worthless — the stock is below the $55 strike at expiry",
            "It pays $1 per share — the option expires at $1 of intrinsic value",
            "It automatically rolls to the next expiry at no additional cost",
          ],
          correctIndex: 1,
          explanation:
            "A call option only has value at expiry if the stock is above the strike price. Your call has a $55 strike; the stock closed at $54. Since $54 < $55, the option is out of the money and expires worthless. You lose the entire $150 premium. The stock moved in the right direction — but not far enough.",
        },
        {
          question:
            "A stock's implied volatility (IV) is 75% heading into earnings. After reporting a 12% revenue beat and raising guidance, IV drops to 30%. A trader who bought calls before earnings might experience:",
          options: [
            "Large gains — a 12% revenue beat and guidance raise guarantees option profitability",
            "Losses despite the positive move — IV crush collapses option value even as the stock rises",
            "Breakeven — IV crush and stock gains offset each other precisely",
            "No impact — IV only affects the price of newly written options, not existing ones",
          ],
          correctIndex: 1,
          explanation:
            "IV crush is a real and dangerous dynamic. IV dropping from 75% to 30% removes enormous extrinsic value from options — and extrinsic value is often the bulk of an option's price before earnings. If the stock rises 6% but IV collapses 45 percentage points, the option can still lose value because the reduction in extrinsic value exceeds the gain in intrinsic value. This is why buying options before earnings is harder than it looks.",
        },
        {
          question:
            "What is the maximum loss possible when buying a put option?",
          options: [
            "Unlimited — put options create undefined downside risk",
            "The entire premium paid — if the stock never falls below the strike, the put expires worthless",
            "The strike price minus the premium",
            "100% of the underlying stock value",
          ],
          correctIndex: 1,
          explanation:
            "Buying options (calls or puts) creates defined risk: the maximum loss is always limited to the premium paid. If you pay $200 for a put option and the stock never falls below the strike price by expiry, the option expires worthless and you lose exactly $200 — nothing more. This defined risk is what distinguishes buying options from selling naked options.",
        },
        {
          question:
            "An investor sells a naked call option on a stock trading at $80, with a $90 strike, receiving $200 in premium. The stock unexpectedly surges to $160 before expiry. What is the investor's loss?",
          options: [
            "$200 — the premium received limits the loss",
            "$6,800 — they must buy 100 shares at $160 and sell at $90, minus the $200 premium received",
            "$7,000 — the full cost of 100 shares at the market price",
            "No loss — naked call sellers are protected by the exchange",
          ],
          correctIndex: 1,
          explanation:
            "Selling a naked call creates theoretically unlimited risk. The investor must sell 100 shares to the option buyer at $90 — so they must buy them at the $160 market price. Loss = ($160 - $90) × 100 - $200 premium received = $7,000 - $200 = $6,800. They collected $200 and lost $6,800. This is the catastrophic risk of naked short option positions.",
        },
      ],
      apply: {
        setup:
          "A biotech company reports Phase 3 trial results in 3 days. Implied volatility is at 110%. The stock trades at $42. You believe the drug will succeed and buy call options with a $50 strike expiring in 2 weeks, paying $3.20 per share ($320 for one contract).\n\nThe trial succeeds. The stock jumps to $55 (+31%). IV collapses from 110% to 28% after the announcement.",
        data: [
          { label: "Stock price before", value: "$42" },
          { label: "Stock price after (trial success)", value: "$55 (+31%)" },
          { label: "Call strike price", value: "$50" },
          { label: "Premium paid", value: "$3.20/share ($320 total)" },
          { label: "IV before announcement", value: "110%" },
          { label: "IV after announcement", value: "28%" },
          { label: "Days to expiry remaining", value: "11 days" },
        ],
        question:
          "Despite the stock rising 31%, why might your call options be worth less than expected — or even show a loss?",
        options: [
          "The stock didn't reach the strike price so the option has no value",
          "IV crush: the collapse from 110% to 28% destroys the extrinsic value that made up most of the option's pre-announcement price",
          "Options never gain value during biotech binary events",
          "The 11 days of remaining time value more than offsets the stock move",
        ],
        correctIndex: 1,
        explanation:
          "The stock is now at $55, above the $50 strike — so the option has $5 of intrinsic value. But you paid $3.20, which means you'd only be profitable if the option is worth more than $3.20. The $5 intrinsic value seems to imply a gain. However, before the announcement the option was priced at $3.20 with the stock at $42 and 8 points below the strike — that premium was almost entirely extrinsic value driven by the extreme IV of 110%. With IV collapsing to 28%, that extrinsic value evaporates. The option might be worth $5.10–$5.50 (intrinsic plus small remaining time value), delivering a modest gain — but far less than the 31% stock move suggests. In scenarios where the stock only rises to $51–$52, IV crush can make you a loser despite being directionally correct.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 4 — Macro & Interest Rates (Hard)
    // -----------------------------------------------------------------------
    {
      id: "macro-interest-rates",
      trackId: "advanced-concepts",
      order: 4,
      title: "Macro & Interest Rates",
      concept: "Fed Policy, Rate Cycles & Asset Pricing",
      difficulty: "Hard",
      fields: ["HF", "AM", "IB"],
      teaching: {
        intro:
          "No individual stock analysis exists in isolation. Central bank policy determines the cost of money that flows through every corner of the market — from growth stock valuations to credit availability to currency strength. Understanding rate cycles is what separates investors who see the water from those swimming in it.",
        sections: [
          {
            heading: "How the Fed controls rates and why it matters",
            body: "The Federal Reserve sets the federal funds rate — the overnight lending rate between banks. This is the foundation rate from which all other borrowing costs are derived: mortgages, corporate bonds, consumer loans, and the Treasury yield curve.\n\nWhen the Fed raises rates: borrowing becomes more expensive. Consumers spend less on credit. Companies face higher debt service costs. Investors require higher returns from equities (because risk-free assets now offer more). This mathematically compresses equity valuations, especially for high-multiple growth stocks.\n\nWhen the Fed cuts rates: the opposite occurs. Capital becomes cheap. Risk assets become relatively more attractive. Growth stock multiples expand as the discount rate falls.",
          },
          {
            heading: "Real rates vs nominal rates",
            body: "The nominal rate is the stated interest rate. The real rate is the nominal rate minus inflation.\n\nReal rate = Nominal rate - Inflation\n\nReal rates are what actually matter for investment decisions. A 5% nominal rate with 4% inflation is a 1% real rate — money barely costs anything after adjusting for purchasing power loss. A 5% nominal rate with 1% inflation is a 4% real rate — extremely restrictive.\n\nHigh real rates are particularly damaging to gold, growth equities, and speculative assets — whose appeal depends on the 'low opportunity cost' of holding them when safe assets yield little in real terms.",
            example:
              "In 2021, 10-year Treasury yields were 1.5% while inflation ran at 7%. Real yields were deeply negative (-5.5%). In this environment, almost any asset that could preserve purchasing power outperformed cash. In 2022–2023, as rates rose to 5.5% with inflation falling to 3%, real yields turned sharply positive (+2.5%) — triggering one of the worst year for high-multiple equities in decades.",
          },
          {
            heading: "The transmission mechanism to equities",
            body: "Rate changes affect equities through three channels:\n\n1. Discount rate: higher rates mean future cash flows are worth less today. Growth stocks (whose earnings are heavily weighted in the future) are most affected — their theoretical present value falls mechanically.\n\n2. Earnings impact: higher rates increase debt service costs for leveraged companies, compressing margins. Consumer spending declines as mortgage and credit costs rise.\n\n3. Relative attractiveness: when 10-year Treasuries yield 5%, the equity risk premium (extra return over risk-free rate required to hold equities) gets scrutinized. A stock with an earnings yield of 3.5% (P/E of 29) looks less attractive against a risk-free 5% yield.",
          },
        ],
        keyTakeaway:
          "Rising rates compress equity multiples (especially growth stocks) through three channels: higher discount rates, earnings pressure, and reduced relative attractiveness vs risk-free assets; real rates matter more than nominal.",
      },
      practice: [
        {
          question:
            "The Fed raises rates from 0.5% to 5.5% over 18 months while inflation falls from 8% to 3.5%. What happens to real rates?",
          options: [
            "They become more negative — higher nominal rates push real rates down",
            "They rise sharply from deeply negative to meaningfully positive",
            "They stay flat — real rates are determined by inflation, not the Fed",
            "They become irrelevant — the inflation decline offsets the rate increase",
          ],
          correctIndex: 1,
          explanation:
            "Real rate = Nominal rate - Inflation. At the start: 0.5% - 8% = -7.5% real. At the end: 5.5% - 3.5% = +2% real. Real rates have shifted nearly 10 percentage points from deeply negative to positive. This is one of the most dramatic real rate moves in modern history — and it explains much of the severe multiple compression in growth equities during 2022–2023.",
        },
        {
          question:
            "A growth stock with P/E of 80 and most earnings projected 7–10 years out will be most affected by:",
          options: [
            "A change in corporate tax rates — which directly reduces near-term earnings",
            "A rise in the risk-free rate — which increases the discount rate applied to distant future earnings",
            "A decline in quarterly revenue — which reduces the current period's contribution",
            "Changes in analyst consensus — which sets near-term price targets",
          ],
          correctIndex: 1,
          explanation:
            "High-multiple growth stocks are 'long duration' equity — their value is concentrated in earnings 5–10+ years from now. Rising risk-free rates increase the discount rate, and the present value of $1 received in year 10 falls far more dramatically than $1 received in year 2. A P/E 80 stock is almost entirely dependent on future earning power — it's the equity equivalent of a 30-year bond, and it reprices just as violently when rates move.",
        },
        {
          question:
            "The 10-year Treasury yield rises from 3% to 5%. A stock had an earnings yield of 4% (P/E of 25) when rates were 3%. What is likely to happen to the stock?",
          options: [
            "Nothing — equity valuations are determined by earnings growth, not interest rates",
            "Multiple compression — at 5% risk-free yield, a 4% earnings yield on equities is insufficient compensation for equity risk",
            "Multiple expansion — rising rates signal economic strength, boosting earnings growth expectations",
            "The stock rises — higher rates increase financial sector earnings, benefiting the broader market",
          ],
          correctIndex: 1,
          explanation:
            "An earnings yield of 4% (P/E 25) means the stock earns 4 cents per dollar of price. When the risk-free 10-year Treasury yields 5%, investors can earn 5% with zero risk. Equities must offer a premium (the equity risk premium) above the risk-free rate to justify holding them. At 4% earnings yield vs 5% risk-free, the equity appears fairly to overvalued — expect multiple compression to bring the earnings yield up (P/E down) until it reflects an adequate premium over Treasuries.",
        },
        {
          question:
            "A company has $5B in floating-rate debt (interest cost tied to prevailing rates). The Fed raises rates 2.5 percentage points. Approximately how much does this increase annual interest expense?",
          options: [
            "$50M — a 2.5% rate increase has minimal absolute impact",
            "$125M — rate × principal = 2.5% × $5B",
            "$250M — floating rates double the effective impact",
            "Nothing — floating-rate debt costs are locked at origination",
          ],
          correctIndex: 1,
          explanation:
            "Floating-rate debt adjusts interest payments to current rates. A 2.5% increase on $5B of floating-rate debt increases annual interest expense by $5B × 2.5% = $125M. This directly reduces pre-tax earnings. For a company with $400M in annual operating income, a $125M interest expense increase is a 31% earnings headwind from the rate move alone — with no change in business operations.",
        },
      ],
      apply: {
        setup:
          "You hold two positions. Position A: a high-growth SaaS company with P/E of 85, minimal near-term earnings, and most value in 5–8 year projected cash flows. Position B: a regional bank with P/E of 10, most earnings in the current year, and $2B in floating-rate loans on the asset side of its balance sheet. The Fed announces it will raise rates 2% over the next 12 months.",
        data: [
          { label: "Position A: SaaS company", value: "P/E 85, most value in years 5–8 FCF" },
          { label: "Position B: Regional bank", value: "P/E 10, $2B floating-rate loan assets" },
          { label: "Fed rate hike plan", value: "+2% over 12 months" },
          { label: "Current 10yr Treasury yield", value: "3.5%" },
          { label: "Current inflation", value: "2.8%" },
        ],
        question:
          "How does the 2% rate hike affect each position differently?",
        options: [
          "Harms both equally — higher rates always reduce equity valuations across the board",
          "Harms Position A significantly (multiple compression on long-duration earnings) while potentially helping Position B (rising rates increase net interest margin on floating-rate loans)",
          "Helps Position A — SaaS companies have no debt so rates don't matter",
          "Harms Position B more — banks bear the full cost of deposit rate increases",
        ],
        correctIndex: 1,
        explanation:
          "Rate hikes affect long-duration and short-duration equities in opposite directions. Position A (P/E 85, earnings 5–8 years out) is highly sensitive to discount rate changes — a 2% rate rise compresses the present value of those distant cash flows severely. Position B benefits from rising rates: banks earn the spread between what they charge on floating-rate loans and what they pay depositors. As loan rates reprice higher while deposit costs lag, net interest margin expands — directly boosting earnings. The same macro event is a headwind for one position and a tailwind for the other.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 5 — M&A Mechanics (Hard)
    // -----------------------------------------------------------------------
    {
      id: "ma-mechanics",
      trackId: "advanced-concepts",
      order: 5,
      title: "M&A Mechanics",
      concept: "Mergers, Acquisitions & Deal Analysis",
      difficulty: "Hard",
      fields: ["IB", "PE", "HF"],
      teaching: {
        intro:
          "Mergers and acquisitions move stocks immediately and materially — the target often surges 20–40%, the acquirer frequently falls. Understanding why requires grasping the financial mechanics of deals: how they're financed, what drives the premium, whether they create or destroy value, and how to profit from the uncertainty around whether a deal closes.",
        sections: [
          {
            heading: "Deal structure and consideration",
            body: "Acquisitions are paid in cash, stock, or some combination. The choice matters.\n\nCash deals: shareholders receive a fixed dollar amount. The acquirer takes all risk if the deal is priced too high.\n\nStock deals: target shareholders receive shares in the acquirer. Their ultimate value depends on the acquirer's stock performance. If the acquirer's stock falls after announcement, the effective deal value falls too.\n\nThe structure signals confidence: companies that pay cash believe their stock is undervalued (why dilute at low prices?). Companies that pay stock often believe their stock is fairly or richly valued.",
          },
          {
            heading: "Accretion/dilution analysis",
            body: "The central question investment banks ask when evaluating a deal is whether it's accretive or dilutive to the acquirer's earnings per share (EPS) in the first full year.\n\nAccretive deal: the acquired company's earnings contribution (after financing costs) increases the acquirer's EPS compared to standalone.\n\nDilutive deal: the earnings contribution is insufficient to offset dilution from shares issued or interest cost on acquisition debt — EPS falls.\n\nCritical caveat: accretion/dilution analysis is often misleading. A deal can be EPS accretive while destroying ROIC-based value if the price paid is too high. 'Accretive' does not mean 'good deal.'",
            example:
              "Company A acquires Company B for $1B using debt at 6% interest. Company B earns $80M annually. Annual interest cost: $60M. Net earnings contribution: $20M. If Company A has 100M shares outstanding, EPS increases by $0.20. The deal is accretive — but Company A paid 12.5× earnings, and if B's growth was the reason for the price, the deal must deliver on that growth or it becomes value-destructive.",
          },
          {
            heading: "Synergies and why acquirers overpay",
            body: "Acquirers almost always pay a premium to the target's current share price — the acquisition premium, typically 20–40%. This premium must be justified by synergies: cost savings or revenue enhancements that wouldn't occur without the combination.\n\nCost synergies are more reliable (eliminating redundant headcount, consolidating facilities). Revenue synergies are almost always optimistic — they depend on cross-selling that rarely materializes as projected.\n\nResearch consistently shows acquirers overestimate synergies by 15–40%. The market knows this: acquirer stocks typically fall 1–3% on deal announcement as investors price in overpayment risk.",
          },
        ],
        keyTakeaway:
          "M&A value creation depends on paying less than synergy value — acquirers typically overpay, which is why acquirer stocks fall on announcement; accretion/dilution analysis can mask value destruction.",
      },
      practice: [
        {
          question:
            "Company A (acquirer) announces it will buy Company B (target) at a 35% premium using all-stock consideration. Company A's stock falls 4% on announcement. What does the stock market reaction typically reflect?",
          options: [
            "Panic selling by irrational retail investors",
            "The market pricing in deal risk (the possibility it doesn't close) and overpayment risk (the premium may exceed synergy value)",
            "A positive signal — falling acquirer stocks confirm the deal is strategically sound",
            "Short sellers manipulating the acquirer's stock lower",
          ],
          correctIndex: 1,
          explanation:
            "Acquirer stocks almost always fall on deal announcement for two reasons: overpayment risk (the premium may exceed achievable synergies, destroying value) and dilution risk in stock deals (new shares are issued to target shareholders, potentially diluting existing holders). The market is efficiently pricing its assessment of whether the deal creates or destroys value.",
        },
        {
          question:
            "An investment banker describes a deal as 'accretive to EPS in year one.' This means:",
          options: [
            "The deal creates value for the acquirer's shareholders",
            "The acquired company's earnings contribution exceeds financing costs, increasing acquirer EPS — but says nothing about whether the price paid was justified",
            "The acquirer's ROIC will exceed WACC post-close",
            "Synergies will be realized within the first year",
          ],
          correctIndex: 1,
          explanation:
            "EPS accretion is a narrow accounting metric that says the deal adds to earnings per share — it does not say the deal creates economic value. A company can overpay dramatically, destroying ROIC while being EPS accretive (if financed with cheap debt). Investment bankers use accretion/dilution analysis because it's easy to model — but it shouldn't be confused with a value-creation assessment.",
        },
        {
          question:
            "Which type of synergy is generally more reliable in M&A?",
          options: [
            "Revenue synergies — cross-selling is the primary driver of deal value",
            "Cost synergies — eliminating overlapping headcount, facilities, and vendors is more predictable than revenue generation",
            "Both are equally reliable — acquirers have equal track records on both types",
            "Revenue synergies in tech deals; cost synergies in industrial deals",
          ],
          correctIndex: 1,
          explanation:
            "Cost synergies are consistently more reliable because they involve eliminating known expenses — identifiable headcount, duplicate systems, redundant facilities. Revenue synergies depend on cross-selling customers who may not want the combined product, changing sales processes, and integrating teams from different cultures. Academic research consistently shows revenue synergies are achieved at 50–60% of projected rates on average, while cost synergies achieve 80–90%.",
        },
        {
          question:
            "Company A (stock: $50) announces it will acquire Company B (stock: $38) at $48 per share in cash. Company B's stock jumps to $46. The $2 gap between $46 and the $48 deal price represents:",
          options: [
            "The market's belief that Company B is still undervalued",
            "The merger arbitrage spread — compensation for the binary risk that the deal fails to close",
            "Transaction costs that will be deducted from the final payment",
            "A mistake — Company B's stock should trade exactly at $48 once a deal is announced",
          ],
          correctIndex: 1,
          explanation:
            "The spread between the current price ($46) and deal price ($48) in a merger arb situation represents compensation for deal failure risk. If the deal closes, you earn the $2 spread (~4.3% return). If it breaks (regulatory rejection, financing failure, either party walking away), Company B could fall 20–30% back toward pre-deal prices. The spread is not free money — it's risk-adjusted compensation for holding a binary position.",
        },
      ],
      apply: {
        setup:
          "A large pharmaceutical company (AcquireCo) announces it will acquire a biotech (TargetCo) for $8B in cash. TargetCo's stock was trading at $62 before the announcement; the offer is $82 per share (a 32% premium). AcquireCo will finance the deal entirely with debt at 7% interest. TargetCo generates $200M of annual EBITDA. AcquireCo projects $400M in synergies over three years, of which 60% are cost synergies.",
        data: [
          { label: "Deal value", value: "$8B (all cash)" },
          { label: "Acquisition premium", value: "32% above pre-announcement price" },
          { label: "TargetCo annual EBITDA", value: "$200M" },
          { label: "Implied EV/EBITDA multiple paid", value: "40×" },
          { label: "Financing cost", value: "7% on $8B = $560M annual interest" },
          { label: "Projected synergies", value: "$400M over 3 years (60% cost, 40% revenue)" },
        ],
        question:
          "What is the primary red flag in this deal's economics?",
        options: [
          "The 32% premium — all acquisition premiums destroy value for acquirers",
          "AcquireCo is paying $560M annually in interest to finance $200M of EBITDA — the financing cost exceeds current earnings by $360M, and relies heavily on uncertain revenue synergies to justify the price",
          "The cash financing — stock deals always create more value than cash deals",
          "The 3-year synergy timeline — synergies should be achieved in year one or the deal isn't worth pursuing",
        ],
        correctIndex: 1,
        explanation:
          "At 40× EV/EBITDA, AcquireCo is paying $8B for $200M of annual earnings — and financing that $8B at 7% costs $560M per year in interest. The deal generates $200M in EBITDA but costs $560M to finance — a $360M annual earnings hole before synergies. To break even on the financing, AcquireCo needs $360M of incremental synergies just to cover interest, let alone create value. The 40% revenue synergy component ($160M) is the most at-risk portion, and its non-realization means the deal could remain deeply dilutive for years. This is a textbook case of overpaying using optimistic synergy projections.",
      },
    },
    // -----------------------------------------------------------------------
    // Lesson 6 — Short Selling Strategy (Hard)
    // -----------------------------------------------------------------------
    {
      id: "short-selling-strategy",
      trackId: "advanced-concepts",
      order: 6,
      title: "Short Selling Strategy",
      concept: "Professional Short Selling & Risk Management",
      difficulty: "Hard",
      fields: ["HF"],
      teaching: {
        intro:
          "Short selling is the most intellectually demanding discipline in public markets. You are betting that a company will underperform — and unlike owning a stock, where the worst case is losing your investment, shorting has theoretically unlimited downside. Done with edge and discipline, it's a powerful tool. Done carelessly, it's a way to lose multiples of your investment while being right about the fundamentals.",
        sections: [
          {
            heading: "Mechanics of a short sale",
            body: "To short a stock, you borrow shares from a broker (who locates them from other accounts), sell them at the current market price, and later buy them back to return to the lender. If the price falls, you profit from the difference. If it rises, you lose.\n\nThe cost to borrow is paid as a daily fee (annualized as a 'borrow rate'). Easy-to-borrow stocks cost 0.5–2% annually. Hard-to-borrow stocks (with heavy short interest) can cost 20–100%+ annually — this erodes your P&L even if you're right about the direction.\n\nUnlike a long position where you're paid to wait (stock rises over time), short positions pay a cost to wait — which means your timing must be more precise.",
          },
          {
            heading: "Structural vs tactical shorts",
            body: "Structural shorts target businesses with deteriorating fundamentals — a secular decline in the industry (e.g., physical retail, print media), unsustainable competitive dynamics, or accounting irregularities. These play out over years and can absorb timing risk if sized correctly.\n\nTactical shorts target businesses ahead of a specific near-term catalyst: an earnings miss, a patent expiry, a competitor launch that addresses the same market. These are time-bounded and require precise timing.\n\nThe best short positions combine both: a structural thesis (the business is deteriorating) plus a near-term catalyst that forces the market to confront what's already happening. Structural shorts without a catalyst can stay wrong for years while paying borrow costs.",
            example:
              "A hedge fund identified a commercial real estate lender with 80% loan concentration in office buildings in 2022–2023. The structural thesis was clear (remote work permanently reducing office demand). The catalyst was clear (loan maturities coming due in 18 months). The combination made the timing precise and the thesis defensible.",
          },
          {
            heading: "Squeeze risk and position management",
            body: "The most dangerous feature of short selling is the short squeeze. When a heavily shorted stock receives positive news — or when retail traders coordinate buying — shorts are forced to cover simultaneously, creating explosive upside that amplifies losses.\n\nManaging squeeze risk requires: knowing the float (what percentage of shares are already short?), monitoring borrow cost (rising cost signals increasing short interest), and sizing positions to survive a 30–50% squeeze before fundamentals reassert.\n\nThe fundamental rule: short selling is a tool for generating alpha, not a replacement for long positions. Most professional short sellers keep short positions 2–4% of portfolio maximum to limit squeeze exposure.",
          },
        ],
        keyTakeaway:
          "Short selling has theoretically unlimited loss potential — effective short sellers combine a structural deterioration thesis with a near-term catalyst, size conservatively, and manage squeeze risk actively.",
      },
      practice: [
        {
          question:
            "A short seller borrows 1,000 shares at $50 and sells them. The stock rises to $90 before they cover (buy back). What is the loss?",
          options: [
            "$50,000 — limited to the initial sale proceeds",
            "$40,000 — the difference between sell price ($50) and cover price ($90) × 1,000 shares",
            "$90,000 — the full cost of repurchasing the shares",
            "$0 — the stock must fall for a short seller to incur a loss",
          ],
          correctIndex: 1,
          explanation:
            "Short loss = (cover price - borrow/sell price) × shares. ($90 - $50) × 1,000 = $40,000. The seller received $50,000 from the initial sale but must pay $90,000 to buy the shares back. Net loss: $40,000. If the stock continued rising to $150, the loss would be $100,000. The loss scales with price increases, with no ceiling — which is why position sizing and squeeze risk management are critical.",
        },
        {
          question:
            "A short position costs 45% annually to borrow. You are short a stock and it has fallen 18% over 12 months. What is your actual return?",
          options: [
            "+18% — price decline is the only factor in short returns",
            "-27% — you earned 18% from price decline but paid 45% borrow cost, a net loss of 27%",
            "+63% — price decline of 18% is amplified by leverage in short positions",
            "0% — borrow costs and price gains cancel each other",
          ],
          correctIndex: 1,
          explanation:
            "Short return = price decline - borrow cost. 18% price decline - 45% borrow cost = -27%. You were right about the direction but lost money because the cost of borrowing exceeded your gain. Hard-to-borrow situations (high short interest, speculative names) can have annual borrow costs of 20–100%+ — you can be directionally correct and still lose significantly due to carry costs.",
        },
        {
          question:
            "Which combination makes the strongest short thesis?",
          options: [
            "A company in a declining industry with no near-term catalyst",
            "A company with a specific accounting issue (overstated revenue) and an audit completion date in 60 days",
            "A company with a high P/E ratio in a rising market",
            "A company with a new CEO who replaced a well-regarded predecessor",
          ],
          correctIndex: 1,
          explanation:
            "The best short theses combine a structural problem (fundamental deterioration) with a near-term catalyst (a specific event that forces the market to confront the issue). Accounting irregularities that an upcoming audit will expose is a classic setup: the thesis is specific, the catalyst has a defined timeline, and when the market confronts the issue, the reaction is typically swift. A high P/E alone in a rising market can stay high for years — no catalyst to force a re-rating.",
        },
        {
          question:
            "A stock you are short has 40% of its float sold short. Retail traders begin aggressively buying. What risk are you facing?",
          options: [
            "Fundamental risk — retail buyers may have information you don't",
            "Short squeeze risk — heavy short interest plus coordinated buying can force shorts to cover simultaneously, driving explosive price increases",
            "Liquidity risk — heavy retail buying removes shares from the float you can borrow",
            "Regulatory risk — coordinated retail buying attracts SEC investigation",
          ],
          correctIndex: 1,
          explanation:
            "40% short interest is very high — meaning 40% of tradeable shares are borrowed and sold. When retail buyers drive the price up, shorts face mounting losses and must decide when to cover. If enough shorts try to cover simultaneously, their buying compounds the retail buying, creating a feedback loop of rising prices. This is the short squeeze mechanism — and at 40% short interest, the fuel for a squeeze is significant.",
        },
      ],
      apply: {
        setup:
          "You are considering a short position in a consumer discretionary retailer. The thesis: the company faces structural headwinds from e-commerce, has been losing market share for three consecutive years, and management recently guided for flat same-store sales despite industry-wide 5% growth. The stock has a P/E of 22 and a 12% borrow rate. Short interest is already 24% of float. Your portfolio is $50,000.",
        data: [
          { label: "Structural thesis", value: "E-commerce share loss, 3 years of declining SSS" },
          { label: "Near-term catalyst", value: "Q4 earnings in 6 weeks; management guided flat vs industry +5%" },
          { label: "Stock P/E", value: "22× (not extreme)" },
          { label: "Borrow cost", value: "12% annually" },
          { label: "Current short interest", value: "24% of float" },
          { label: "Portfolio size", value: "$50,000" },
        ],
        question:
          "What are the two most important risk management decisions before entering this short?",
        options: [
          "Setting a precise price target and selecting the exact timing of the earnings report",
          "Position sizing (keeping exposure 2–4% of portfolio given 24% short interest squeeze risk) and evaluating whether the 12% borrow cost is sustainable relative to the expected earnings decline timeline",
          "Buying put options instead of borrowing shares to eliminate borrow cost",
          "Waiting for the stock to rally before shorting to improve the entry price",
        ],
        correctIndex: 1,
        explanation:
          "Two risks dominate this setup. First: squeeze risk. 24% short interest is elevated — a positive earnings surprise or retail buying could create a painful squeeze. Conservative position sizing (2–4% of $50,000 = $1,000–2,000) limits squeeze exposure to a manageable loss. Second: carry cost. At 12% annual borrow, a 6-week position costs ~1.4% before the catalyst. If the thesis takes longer to play out than expected, borrow costs erode returns even if you're fundamentally right. These two factors — squeeze magnitude and borrow cost relative to expected timeline — must be quantified before entering.",
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// All tracks — add new tracks here as they're built
// ---------------------------------------------------------------------------

export const ALL_TRACKS: Track[] = [
  { ...financialMetrics101, lessons: [...financialMetrics101.lessons, dividendYield] },
  { ...readingTheMarket, lessons: [...readingTheMarket.lessons, ipoMechanics] },
  { ...volatilityAndRisk, lessons: [...volatilityAndRisk.lessons, maxDrawdown] },
  { ...marketIndicators, lessons: [...marketIndicators.lessons, fedAndRates] },
  advancedConcepts,
];

export function getTrackById(id: string): Track | undefined {
  return ALL_TRACKS.find((t) => t.id === id);
}

export function getLessonById(
  trackId: string,
  lessonId: string,
): { track: Track; lesson: Track["lessons"][number] } | undefined {
  const track = getTrackById(trackId);
  if (!track) return undefined;
  const lesson = track.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;
  return { track, lesson };
}
