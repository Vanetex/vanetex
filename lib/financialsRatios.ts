import { kvGet, kvSet } from "@/lib/kvCache";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
// 1 hour — financials change infrequently. Shared by every caller so a
// symbol fetched once (e.g. for the Financials panel) is warm for anyone
// else who needs it (e.g. the peer-percentile screen) within the hour.
const CACHE_TTL_S = 60 * 60;

export type FinancialsRatios = {
  symbol: string;
  peTTM: number | null;
  epsTTM: number | null;
  beta: number | null;
  week52High: number | null;
  week52Low: number | null;
  dividendYield: number | null;
  marketCapitalization: number | null;
  avgVolume10D: number | null;
  avgVolume3M: number | null;
  forwardPE: number | null;
  pegRatio: number | null;
  priceToBook: number | null;
  priceToSales: number | null;
  evToEbitda: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
  roe: number | null;
  roa: number | null;
  revenueGrowthYoy: number | null;
  epsGrowthYoy: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  priceReturn52W: number | null;
  priceReturnYtd: number | null;
  forwardPEG: number | null;
  evRevenue: number | null;
  evFcf: number | null;
  priceToTangibleBook: number | null;
  priceToCashFlow: number | null;
  priceToFcf: number | null;
  enterpriseValue: number | null;
  grossMargin5Y: number | null;
  operatingMargin5Y: number | null;
  pretaxMargin: number | null;
  pretaxMargin5Y: number | null;
  netMargin5Y: number | null;
  roe5Y: number | null;
  roa5Y: number | null;
  roi: number | null;
  roi5Y: number | null;
  assetTurnover: number | null;
  inventoryTurnover: number | null;
  receivablesTurnover: number | null;
  revenuePerEmployee: number | null;
  netIncomePerEmployee: number | null;
  revenueGrowthQuarterlyYoy: number | null;
  revenueGrowth3Y: number | null;
  revenueGrowth5Y: number | null;
  epsGrowthQuarterlyYoy: number | null;
  epsGrowth3Y: number | null;
  epsGrowth5Y: number | null;
  fcfGrowth5Y: number | null;
  ebitdaGrowth5Y: number | null;
  tangibleBookGrowth5Y: number | null;
  priceReturn5D: number | null;
  priceReturnMtd: number | null;
  priceReturn13W: number | null;
  priceReturn26W: number | null;
  relReturn4W: number | null;
  relReturn13W: number | null;
  relReturn26W: number | null;
  relReturn52W: number | null;
  relReturnYtd: number | null;
  quickRatio: number | null;
  longTermDebtToEquity: number | null;
  netInterestCoverage: number | null;
  cashPerShare: number | null;
  dividendIndicatedAnnual: number | null;
  dividendPerShareTTM: number | null;
  dividendPerShareAnnual: number | null;
  payoutRatioTTM: number | null;
  payoutRatioAnnual: number | null;
  dividendGrowth5Y: number | null;
};

function cacheKeyFor(sym: string) {
  return `financials:${sym}`;
}

function extract(sym: string, m: Record<string, number>): FinancialsRatios {
  return {
    symbol: sym,
    peTTM: m.peTTM ?? null,
    epsTTM: m.epsInclExtraItemsTTM ?? m.epsTTM ?? null,
    beta: m.beta ?? null,
    week52High: m["52WeekHigh"] ?? null,
    week52Low: m["52WeekLow"] ?? null,
    dividendYield: m.dividendYieldIndicatedAnnual ?? null,
    marketCapitalization: m.marketCapitalization ?? null,
    avgVolume10D: m["10DayAverageTradingVolume"] ?? null,
    avgVolume3M: m["3MonthAverageTradingVolume"] ?? null,
    forwardPE: m.forwardPE ?? null,
    pegRatio: m.pegTTM ?? null,
    priceToBook: m.pbQuarterly ?? m.pbAnnual ?? m.pb ?? null,
    priceToSales: m.psTTM ?? null,
    evToEbitda: m.evEbitdaTTM ?? null,
    grossMargin: m.grossMarginTTM ?? null,
    operatingMargin: m.operatingMarginTTM ?? null,
    netMargin: m.netProfitMarginTTM ?? null,
    roe: m.roeTTM ?? null,
    roa: m.roaTTM ?? null,
    revenueGrowthYoy: m.revenueGrowthTTMYoy ?? null,
    epsGrowthYoy: m.epsGrowthTTMYoy ?? null,
    currentRatio: m.currentRatioQuarterly ?? m.currentRatioAnnual ?? null,
    debtToEquity: m["totalDebt/totalEquityQuarterly"] ?? m["totalDebt/totalEquityAnnual"] ?? null,
    priceReturn52W: m["52WeekPriceReturnDaily"] ?? null,
    priceReturnYtd: m.yearToDatePriceReturnDaily ?? null,
    forwardPEG: m.forwardPEG ?? null,
    evRevenue: m.evRevenueTTM ?? null,
    evFcf: m["currentEv/freeCashFlowTTM"] ?? m["currentEv/freeCashFlowAnnual"] ?? null,
    priceToTangibleBook: m.ptbvQuarterly ?? m.ptbvAnnual ?? null,
    priceToCashFlow: m.pcfShareTTM ?? m.pcfShareAnnual ?? null,
    priceToFcf: m.pfcfShareTTM ?? m.pfcfShareAnnual ?? null,
    enterpriseValue: m.enterpriseValue ?? null,
    grossMargin5Y: m.grossMargin5Y ?? null,
    operatingMargin5Y: m.operatingMargin5Y ?? null,
    pretaxMargin: m.pretaxMarginTTM ?? null,
    pretaxMargin5Y: m.pretaxMargin5Y ?? null,
    netMargin5Y: m.netProfitMargin5Y ?? null,
    roe5Y: m.roe5Y ?? null,
    roa5Y: m.roa5Y ?? null,
    roi: m.roiTTM ?? m.roiAnnual ?? null,
    roi5Y: m.roi5Y ?? null,
    assetTurnover: m.assetTurnoverTTM ?? m.assetTurnoverAnnual ?? null,
    inventoryTurnover: m.inventoryTurnoverTTM ?? m.inventoryTurnoverAnnual ?? null,
    receivablesTurnover: m.receivablesTurnoverTTM ?? m.receivablesTurnoverAnnual ?? null,
    revenuePerEmployee: m.revenueEmployeeTTM ?? m.revenueEmployeeAnnual ?? null,
    netIncomePerEmployee: m.netIncomeEmployeeTTM ?? m.netIncomeEmployeeAnnual ?? null,
    revenueGrowthQuarterlyYoy: m.revenueGrowthQuarterlyYoy ?? null,
    revenueGrowth3Y: m.revenueGrowth3Y ?? null,
    revenueGrowth5Y: m.revenueGrowth5Y ?? null,
    epsGrowthQuarterlyYoy: m.epsGrowthQuarterlyYoy ?? null,
    epsGrowth3Y: m.epsGrowth3Y ?? null,
    epsGrowth5Y: m.epsGrowth5Y ?? null,
    fcfGrowth5Y: m.focfCagr5Y ?? null,
    ebitdaGrowth5Y: m.ebitdaCagr5Y ?? null,
    tangibleBookGrowth5Y: m.tbvCagr5Y ?? null,
    priceReturn5D: m["5DayPriceReturnDaily"] ?? null,
    priceReturnMtd: m.monthToDatePriceReturnDaily ?? null,
    priceReturn13W: m["13WeekPriceReturnDaily"] ?? null,
    priceReturn26W: m["26WeekPriceReturnDaily"] ?? null,
    relReturn4W: m["priceRelativeToS&P5004Week"] ?? null,
    relReturn13W: m["priceRelativeToS&P50013Week"] ?? null,
    relReturn26W: m["priceRelativeToS&P50026Week"] ?? null,
    relReturn52W: m["priceRelativeToS&P50052Week"] ?? null,
    relReturnYtd: m["priceRelativeToS&P500Ytd"] ?? null,
    quickRatio: m.quickRatioQuarterly ?? m.quickRatioAnnual ?? null,
    longTermDebtToEquity: m["longTermDebt/equityQuarterly"] ?? m["longTermDebt/equityAnnual"] ?? null,
    netInterestCoverage: m.netInterestCoverageTTM ?? m.netInterestCoverageAnnual ?? null,
    cashPerShare: m.cashPerSharePerShareQuarterly ?? m.cashPerSharePerShareAnnual ?? null,
    dividendIndicatedAnnual: m.dividendIndicatedAnnual ?? null,
    dividendPerShareTTM: m.dividendPerShareTTM ?? null,
    dividendPerShareAnnual: m.dividendPerShareAnnual ?? null,
    payoutRatioTTM: m.payoutRatioTTM ?? null,
    payoutRatioAnnual: m.payoutRatioAnnual ?? null,
    dividendGrowth5Y: m.dividendGrowthRate5Y ?? null,
  };
}

// Cache-first fetch of a symbol's real point-in-time ratios from Finnhub.
// Shared by /api/stock/financials and /api/stock/peer-percentile so both
// read and write the exact same KV shape under the exact same key —
// writing a partial/different shape here would silently corrupt the other
// route's cache for a full hour.
export async function getFinancialsRatios(sym: string, apiKey: string): Promise<FinancialsRatios | null> {
  const cacheKey = cacheKeyFor(sym);
  const cached = await kvGet<FinancialsRatios>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${FINNHUB_BASE}/stock/metric?symbol=${encodeURIComponent(sym)}&metric=all&token=${apiKey}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { metric?: Record<string, number> };
    const body = extract(sym, data.metric ?? {});
    await kvSet(cacheKey, body, CACHE_TTL_S);
    return body;
  } catch {
    return null;
  }
}
