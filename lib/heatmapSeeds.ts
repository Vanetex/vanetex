// Curated companies per sector for the intelligence-module sector
// heatmap. Shared between /api/stock/heatmap (live quotes, every
// 5 min) and /api/cron/refresh-heatmap-mcap (market cap, once daily).
export type HeatmapSeed = { sym: string; name: string };

export const MCAP_CACHE_KEY = "heatmap:mcap:v2";

export const SECTOR_SEEDS: Record<string, HeatmapSeed[]> = {
  Technology: [
    { sym: "NVDA", name: "NVIDIA" }, { sym: "AAPL", name: "Apple" },
    { sym: "MSFT", name: "Microsoft" }, { sym: "AVGO", name: "Broadcom" },
    { sym: "ORCL", name: "Oracle" }, { sym: "CRM", name: "Salesforce" },
    { sym: "AMD", name: "AMD" }, { sym: "ADBE", name: "Adobe" },
    { sym: "CSCO", name: "Cisco" }, { sym: "ACN", name: "Accenture" },
    { sym: "IBM", name: "IBM" }, { sym: "TXN", name: "Texas Instruments" },
    { sym: "QCOM", name: "Qualcomm" }, { sym: "INTC", name: "Intel" },
  ],
  Communication: [
    { sym: "GOOGL", name: "Alphabet" }, { sym: "META", name: "Meta Platforms" },
    { sym: "NFLX", name: "Netflix" }, { sym: "DIS", name: "Disney" },
    { sym: "TMUS", name: "T-Mobile" }, { sym: "VZ", name: "Verizon" },
    { sym: "CMCSA", name: "Comcast" }, { sym: "T", name: "AT&T" },
    { sym: "CHTR", name: "Charter Comm" }, { sym: "WBD", name: "Warner Bros Discovery" },
  ],
  Consumer: [
    { sym: "AMZN", name: "Amazon" }, { sym: "TSLA", name: "Tesla" },
    { sym: "HD", name: "Home Depot" }, { sym: "MCD", name: "McDonald's" },
    { sym: "NKE", name: "Nike" }, { sym: "SBUX", name: "Starbucks" },
    { sym: "TGT", name: "Target" }, { sym: "LOW", name: "Lowe's" },
    { sym: "BKNG", name: "Booking Holdings" }, { sym: "CMG", name: "Chipotle" },
    { sym: "ABNB", name: "Airbnb" }, { sym: "YUM", name: "Yum! Brands" },
  ],
  Financials: [
    { sym: "BRK.B", name: "Berkshire Hathaway" }, { sym: "JPM", name: "JPMorgan Chase" },
    { sym: "V", name: "Visa" }, { sym: "MA", name: "Mastercard" },
    { sym: "BAC", name: "Bank of America" }, { sym: "WFC", name: "Wells Fargo" },
    { sym: "GS", name: "Goldman Sachs" }, { sym: "MS", name: "Morgan Stanley" },
    { sym: "AXP", name: "American Express" }, { sym: "SCHW", name: "Charles Schwab" },
    { sym: "BLK", name: "BlackRock" }, { sym: "C", name: "Citigroup" },
  ],
  Healthcare: [
    { sym: "LLY", name: "Eli Lilly" }, { sym: "UNH", name: "UnitedHealth" },
    { sym: "JNJ", name: "Johnson & Johnson" }, { sym: "ABBV", name: "AbbVie" },
    { sym: "MRK", name: "Merck" }, { sym: "PFE", name: "Pfizer" },
    { sym: "TMO", name: "Thermo Fisher" }, { sym: "ABT", name: "Abbott" },
    { sym: "DHR", name: "Danaher" }, { sym: "AMGN", name: "Amgen" },
    { sym: "ISRG", name: "Intuitive Surgical" }, { sym: "BMY", name: "Bristol Myers Squibb" },
  ],
  Energy: [
    { sym: "XOM", name: "ExxonMobil" }, { sym: "CVX", name: "Chevron" },
    { sym: "COP", name: "ConocoPhillips" }, { sym: "SLB", name: "Schlumberger" },
    { sym: "EOG", name: "EOG Resources" }, { sym: "MPC", name: "Marathon Petroleum" },
    { sym: "PSX", name: "Phillips 66" }, { sym: "OXY", name: "Occidental Petroleum" },
  ],
  Industrials: [
    { sym: "CAT", name: "Caterpillar" }, { sym: "HON", name: "Honeywell" },
    { sym: "BA", name: "Boeing" }, { sym: "UPS", name: "UPS" },
    { sym: "GE", name: "GE Aerospace" }, { sym: "LMT", name: "Lockheed Martin" },
    { sym: "RTX", name: "RTX Corp" }, { sym: "DE", name: "Deere & Co" },
    { sym: "UNP", name: "Union Pacific" }, { sym: "ETN", name: "Eaton Corp" },
    { sym: "ADP", name: "ADP" }, { sym: "MMM", name: "3M" },
  ],
};
