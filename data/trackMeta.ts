// Lean track + lesson metadata — no teaching content, practice questions, or apply scenarios.
// Import this in listing pages (TracksClient, [trackId]/page).
// Import data/tracks.ts only in the lesson player.

import type { CareerField } from "@/lib/types";

export interface LessonMeta {
  id: string;
  trackId: string;
  order: number;
  title: string;
  concept: string;
  difficulty: "Easy" | "Medium" | "Hard";
  fields: CareerField[];
}

export interface TrackMeta {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  lessons: LessonMeta[];
}

export const ALL_TRACK_META: TrackMeta[] = [
  {
    id: "financial-metrics-101",
    title: "Financial Metrics 101",
    description:
      "Learn to read the numbers every investor looks at first — from P/E ratios and revenue growth all the way to EV/EBITDA — and know what they actually mean.",
    difficulty: "Beginner",
    lessons: [
      { id: "pe-ratio", trackId: "financial-metrics-101", order: 1, title: "The P/E Ratio", concept: "Price-to-Earnings Ratio", difficulty: "Easy", fields: ["IB", "PE", "HF", "VC", "AM"] },
      { id: "revenue-growth", trackId: "financial-metrics-101", order: 2, title: "Revenue Growth", concept: "Revenue Growth Rate", difficulty: "Easy", fields: ["IB", "PE", "HF", "VC", "AM"] },
      { id: "profit-margins", trackId: "financial-metrics-101", order: 3, title: "Profit Margins", concept: "Gross & Net Profit Margin", difficulty: "Easy", fields: ["IB", "PE", "HF", "AM"] },
      { id: "earnings-per-share", trackId: "financial-metrics-101", order: 4, title: "Earnings Per Share (EPS)", concept: "Earnings Per Share", difficulty: "Easy", fields: ["IB", "HF", "AM"] },
      { id: "market-cap", trackId: "financial-metrics-101", order: 5, title: "Market Capitalization", concept: "Market Cap & Company Size", difficulty: "Easy", fields: ["IB", "PE", "HF", "VC", "AM"] },
      { id: "debt-to-equity", trackId: "financial-metrics-101", order: 6, title: "Debt-to-Equity Ratio", concept: "Leverage & Capital Structure", difficulty: "Medium", fields: ["IB", "PE", "HF"] },
      { id: "price-to-book", trackId: "financial-metrics-101", order: 7, title: "Price-to-Book Ratio", concept: "Price-to-Book (P/B) Ratio", difficulty: "Medium", fields: ["HF", "AM"] },
      { id: "free-cash-flow", trackId: "financial-metrics-101", order: 8, title: "Free Cash Flow", concept: "Free Cash Flow (FCF)", difficulty: "Medium", fields: ["IB", "PE", "HF", "AM"] },
      { id: "return-on-equity", trackId: "financial-metrics-101", order: 9, title: "Return on Equity", concept: "Return on Equity (ROE)", difficulty: "Medium", fields: ["IB", "PE", "HF", "AM"] },
      { id: "peg-ratio", trackId: "financial-metrics-101", order: 10, title: "The PEG Ratio", concept: "Price/Earnings-to-Growth Ratio", difficulty: "Medium", fields: ["HF", "VC", "AM"] },
      { id: "ev-ebitda", trackId: "financial-metrics-101", order: 11, title: "EV/EBITDA", concept: "Enterprise Value & EBITDA", difficulty: "Hard", fields: ["IB", "PE"] },
    ],
  },
  {
    id: "reading-the-market",
    title: "Reading the Market",
    description:
      "Learn to separate signal from noise in headlines, spot stocks that are cheap for bad reasons, and understand what makes a business defensible over time.",
    difficulty: "Beginner",
    lessons: [
      { id: "headlines-vs-fundamentals", trackId: "reading-the-market", order: 1, title: "Headlines vs Fundamentals", concept: "Signal vs Noise", difficulty: "Easy", fields: ["HF", "AM"] },
      { id: "value-trap", trackId: "reading-the-market", order: 2, title: "The Value Trap", concept: "Value Traps & Deteriorating Businesses", difficulty: "Medium", fields: ["HF", "AM", "PE"] },
      { id: "competitive-moats", trackId: "reading-the-market", order: 3, title: "Competitive Moats", concept: "Durable Competitive Advantage", difficulty: "Medium", fields: ["HF", "VC", "AM", "PE"] },
      { id: "sector-rotation", trackId: "reading-the-market", order: 4, title: "Sector Rotation", concept: "Economic Cycles & Capital Flows", difficulty: "Medium", fields: ["AM", "HF"] },
      { id: "macro-signals", trackId: "reading-the-market", order: 5, title: "Macro Signals", concept: "Interest Rates, Inflation & the Yield Curve", difficulty: "Medium", fields: ["HF", "AM", "IB"] },
      { id: "bull-bear-markets", trackId: "reading-the-market", order: 6, title: "Bull & Bear Markets", concept: "Market Cycles & Investor Behavior", difficulty: "Easy", fields: ["IB", "PE", "HF", "VC", "AM"] },
    ],
  },
  {
    id: "volatility-risk",
    title: "Volatility & Risk",
    description:
      "Understand the difference between price swings and real capital loss, recognize binary events before they blow up a position, and learn to calibrate your confidence honestly.",
    difficulty: "Intermediate",
    lessons: [
      { id: "types-of-risk", trackId: "volatility-risk", order: 1, title: "Types of Risk", concept: "Market, Company & Liquidity Risk", difficulty: "Easy", fields: ["IB", "PE", "HF", "VC", "AM"] },
      { id: "binary-events", trackId: "volatility-risk", order: 2, title: "Binary Events", concept: "Binary Risk & Discrete Outcomes", difficulty: "Medium", fields: ["HF", "VC"] },
      { id: "confidence-calibration", trackId: "volatility-risk", order: 3, title: "Confidence Calibration", concept: "Calibration & Overconfidence Bias", difficulty: "Hard", fields: ["IB", "PE", "HF", "VC", "AM"] },
      { id: "position-sizing", trackId: "volatility-risk", order: 4, title: "Position Sizing", concept: "Conviction-Based Allocation & Concentration Risk", difficulty: "Medium", fields: ["HF", "AM", "PE"] },
      { id: "diversification", trackId: "volatility-risk", order: 5, title: "Diversification", concept: "True Diversification vs Correlation Risk", difficulty: "Medium", fields: ["IB", "PE", "HF", "VC", "AM"] },
      { id: "market-cycles", trackId: "volatility-risk", order: 6, title: "Market Cycles", concept: "Economic Cycles, Leading Indicators & Recession Signals", difficulty: "Hard", fields: ["HF", "AM", "IB"] },
    ],
  },
  {
    id: "market-indicators",
    title: "Market Indicators",
    description:
      "Learn to read insider activity, short interest, and analyst ratings the way professionals do — extracting signal without being manipulated by noise or conflicts of interest.",
    difficulty: "Intermediate",
    lessons: [
      { id: "insider-activity", trackId: "market-indicators", order: 1, title: "Insider Activity", concept: "Insider Buying & Selling Signals", difficulty: "Medium", fields: ["HF"] },
      { id: "short-interest", trackId: "market-indicators", order: 2, title: "Short Interest", concept: "Short Selling & Market Sentiment", difficulty: "Medium", fields: ["HF"] },
      { id: "analyst-ratings", trackId: "market-indicators", order: 3, title: "Reading Analyst Ratings", concept: "Wall Street Research & Conflicts of Interest", difficulty: "Hard", fields: ["HF", "AM"] },
      { id: "volume-analysis", trackId: "market-indicators", order: 4, title: "Volume Analysis", concept: "Trading Volume as a Confirmation Signal", difficulty: "Medium", fields: ["HF", "AM"] },
      { id: "moving-averages", trackId: "market-indicators", order: 5, title: "Moving Averages", concept: "Trend Identification & Support/Resistance", difficulty: "Easy", fields: ["HF", "AM"] },
      { id: "earnings-surprises", trackId: "market-indicators", order: 6, title: "Earnings Surprises", concept: "Earnings Season Dynamics & Market Expectations", difficulty: "Medium", fields: ["HF", "AM", "IB"] },
    ],
  },
  {
    id: "advanced-concepts",
    title: "Advanced Concepts",
    description:
      "Master the frameworks professionals use to value companies, evaluate capital allocation, understand derivatives, read macro conditions, and analyze complex corporate events like M&A.",
    difficulty: "Advanced",
    lessons: [
      { id: "discounted-cash-flow", trackId: "advanced-concepts", order: 1, title: "Discounted Cash Flow", concept: "DCF Valuation & Intrinsic Value", difficulty: "Hard", fields: ["IB", "PE", "HF", "AM"] },
      { id: "capital-allocation-roic", trackId: "advanced-concepts", order: 2, title: "Capital Allocation & ROIC", concept: "Return on Invested Capital & Value Creation", difficulty: "Hard", fields: ["PE", "HF", "IB", "AM"] },
      { id: "options-derivatives", trackId: "advanced-concepts", order: 3, title: "Options & Derivatives", concept: "Calls, Puts, Implied Volatility & Risk", difficulty: "Hard", fields: ["HF", "AM"] },
      { id: "macro-interest-rates", trackId: "advanced-concepts", order: 4, title: "Macro & Interest Rates", concept: "Fed Policy, Rate Cycles & Asset Pricing", difficulty: "Hard", fields: ["HF", "AM", "IB"] },
      { id: "ma-mechanics", trackId: "advanced-concepts", order: 5, title: "M&A Mechanics", concept: "Mergers, Acquisitions & Deal Analysis", difficulty: "Hard", fields: ["IB", "PE", "HF"] },
      { id: "short-selling-strategy", trackId: "advanced-concepts", order: 6, title: "Short Selling Strategy", concept: "Professional Short Selling & Risk Management", difficulty: "Hard", fields: ["HF"] },
    ],
  },
];

export function getTrackMeta(id: string): TrackMeta | undefined {
  return ALL_TRACK_META.find((t) => t.id === id);
}

export function getLessonMeta(trackId: string, lessonId: string): LessonMeta | undefined {
  return getTrackMeta(trackId)?.lessons.find((l) => l.id === lessonId);
}
