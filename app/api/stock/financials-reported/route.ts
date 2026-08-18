import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIdFromRequest } from "@/lib/rateLimit";
import { kvGet, kvSet } from "@/lib/kvCache";

export const runtime = "nodejs";

const FINNHUB_BASE = "https://finnhub.io/api/v1";
// Annual filings change a handful of times a year at most (a new 10-K, or a
// restatement) — much slower-moving than the point-in-time ratio endpoint,
// so this can sit in cache far longer.
const CACHE_TTL_S = 6 * 60 * 60;

type LineItem = { concept?: string; label?: string; value?: number; unit?: string };
type Report = { bs?: LineItem[]; ic?: LineItem[]; cf?: LineItem[] };
type Period = {
  year: number;
  quarter: number;
  form: string;
  startDate?: string;
  endDate?: string;
  filedDate?: string;
  report: Report;
};

// SEC XBRL tagging is company-selected, not fully standardized — a bank and
// a manufacturer tag "revenue" or "current assets" under different us-gaap
// concepts, and some line items (a classified current/non-current balance
// sheet, gross profit) don't exist at all for banks/insurers. Every field
// below is tried against a real, verified concept list (confirmed against
// live AAPL and JPM filings) and left null — never guessed — if nothing
// matches.
const CONCEPTS: Record<string, string[]> = {
  revenue: [
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "Revenues",
    "RevenueFromContractWithCustomerIncludingAssessedTax",
    "RevenuesNetOfInterestExpense", // banks (e.g. JPM "Total net revenue")
    "SalesRevenueNet",
  ],
  netIncome: ["NetIncomeLoss", "ProfitLoss"],
  grossProfit: ["GrossProfit"], // not tagged by banks/insurers — stays null there, by design
  operatingIncome: ["OperatingIncomeLoss"],
  totalAssets: ["Assets"],
  totalLiabilities: ["Liabilities"],
  // Some regulated utilities (Duke Energy among them) present a balance
  // sheet with Assets and per-category liability lines but no single
  // tagged "Liabilities" total — falls back to Assets minus equity below
  // when this concept isn't found directly.
  stockholdersEquity: ["StockholdersEquity", "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"],
  currentAssets: ["AssetsCurrent"], // banks have no classified balance sheet — stays null
  currentLiabilities: ["LiabilitiesCurrent"],
  retainedEarnings: ["RetainedEarningsAccumulatedDeficit"],
  longTermDebt: [
    "LongTermDebtNoncurrent",
    "LongTermDebtAndCapitalLeaseObligationsIncludingCurrentMaturities",
    "LongTermDebt",
  ],
  operatingCashFlow: [
    "NetCashProvidedByUsedInOperatingActivities",
    "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
  ],
  capex: [
    "PaymentsToAcquirePropertyPlantAndEquipment",
    "PaymentsForCapitalImprovements",
    "PaymentsToAcquireProductiveAssets",
  ],
  // Not tagged at all by filers with no real R&D line (banks, REITs,
  // most retailers) — stays null there, by design, same as grossProfit.
  researchAndDevelopment: [
    "ResearchAndDevelopmentExpense",
    "ResearchAndDevelopmentExpenseExcludingAcquiredInProcessCost",
  ],
  // Weighted-average diluted share count is required for EPS reporting
  // across virtually every industry, making it a far more reliable
  // cross-company series than balance-sheet "shares outstanding" (which
  // some filers, JPM included, don't tag as a distinct XBRL fact at all).
  dilutedShares: [
    "WeightedAverageNumberOfDilutedSharesOutstanding",
    "WeightedAverageNumberOfShareOutstandingBasicAndDiluted",
    "WeightedAverageNumberOfSharesOutstandingBasic",
    "CommonStockSharesOutstanding",
  ],
};

function pick(items: LineItem[], concepts: string[]): number | null {
  for (const c of concepts) {
    // Finnhub doesn't consistently namespace concepts — most filers carry
    // "us-gaap_NetIncomeLoss", but some (Duke Energy's combined multi-
    // registrant 10-K among them) return the bare "ProfitLoss" for the
    // exact same real figure. Matching only the prefixed form silently
    // dropped over a decade of real, present data for those filers.
    const item = items.find((i) => i.concept === `us-gaap_${c}` || i.concept === c);
    if (item && typeof item.value === "number") return item.value;
  }
  return null;
}

type ExtractedPeriod = {
  year: number;
  endDate: string | null;
  filedDate: string | null;
  revenue: number | null;
  netIncome: number | null;
  grossProfit: number | null;
  operatingIncome: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  currentAssets: number | null;
  currentLiabilities: number | null;
  retainedEarnings: number | null;
  longTermDebt: number | null;
  operatingCashFlow: number | null;
  capex: number | null;
  fcf: number | null;
  researchAndDevelopment: number | null;
  rdToRevenue: number | null;
  capexToRevenue: number | null;
  dilutedShares: number | null;
};

function extractPeriod(p: Period): ExtractedPeriod {
  const all = [...(p.report.bs ?? []), ...(p.report.ic ?? []), ...(p.report.cf ?? [])];
  const get = (key: string) => pick(all, CONCEPTS[key]);
  const operatingCashFlow = get("operatingCashFlow");
  const capex = get("capex");
  const revenue = get("revenue");
  const researchAndDevelopment = get("researchAndDevelopment");
  const totalAssets = get("totalAssets");
  const stockholdersEquity = get("stockholdersEquity");
  const totalLiabilitiesDirect = get("totalLiabilities");
  const totalLiabilities =
    totalLiabilitiesDirect ?? (totalAssets != null && stockholdersEquity != null ? totalAssets - stockholdersEquity : null);
  return {
    year: p.year,
    endDate: p.endDate ? p.endDate.slice(0, 10) : null,
    filedDate: p.filedDate ? p.filedDate.slice(0, 10) : null,
    revenue,
    netIncome: get("netIncome"),
    grossProfit: get("grossProfit"),
    operatingIncome: get("operatingIncome"),
    totalAssets,
    totalLiabilities,
    currentAssets: get("currentAssets"),
    currentLiabilities: get("currentLiabilities"),
    retainedEarnings: get("retainedEarnings"),
    longTermDebt: get("longTermDebt"),
    operatingCashFlow,
    capex,
    fcf: operatingCashFlow != null && capex != null ? operatingCashFlow - capex : null,
    researchAndDevelopment,
    rdToRevenue: researchAndDevelopment != null && revenue ? (researchAndDevelopment / revenue) * 100 : null,
    // capex is reported as a cash outflow (positive "payments" figure), so
    // no sign-flip is needed here the way it is for fcf above.
    capexToRevenue: capex != null && revenue ? (capex / revenue) * 100 : null,
    dilutedShares: get("dilutedShares"),
  };
}

type Criterion = { key: string; label: string; pass: boolean | null };

// Piotroski F-Score: 9 binary tests of profitability, leverage/liquidity,
// and operating efficiency, each worth one point. A criterion that needs a
// field this filer doesn't report (current ratio and gross margin, for a
// bank) is marked not-applicable and excluded from both the score and the
// denominator, rather than counted as a fail.
function piotroski(cur: ExtractedPeriod | null, prev: ExtractedPeriod | null) {
  if (!cur || !prev) return null;
  const roaCur = cur.netIncome != null && cur.totalAssets ? cur.netIncome / cur.totalAssets : null;
  const roaPrev = prev.netIncome != null && prev.totalAssets ? prev.netIncome / prev.totalAssets : null;
  const levCur = cur.longTermDebt != null && cur.totalAssets ? cur.longTermDebt / cur.totalAssets : null;
  const levPrev = prev.longTermDebt != null && prev.totalAssets ? prev.longTermDebt / prev.totalAssets : null;
  const crCur = cur.currentAssets != null && cur.currentLiabilities ? cur.currentAssets / cur.currentLiabilities : null;
  const crPrev = prev.currentAssets != null && prev.currentLiabilities ? prev.currentAssets / prev.currentLiabilities : null;
  const gmCur = cur.grossProfit != null && cur.revenue ? cur.grossProfit / cur.revenue : null;
  const gmPrev = prev.grossProfit != null && prev.revenue ? prev.grossProfit / prev.revenue : null;
  const atCur = cur.revenue != null && cur.totalAssets ? cur.revenue / cur.totalAssets : null;
  const atPrev = prev.revenue != null && prev.totalAssets ? prev.revenue / prev.totalAssets : null;

  const criteria: Criterion[] = [
    { key: "roa_positive", label: "Positive return on assets", pass: roaCur != null ? roaCur > 0 : null },
    { key: "cfo_positive", label: "Positive operating cash flow", pass: cur.operatingCashFlow != null ? cur.operatingCashFlow > 0 : null },
    { key: "roa_improving", label: "ROA improved vs. prior year", pass: roaCur != null && roaPrev != null ? roaCur > roaPrev : null },
    { key: "accruals", label: "Operating cash flow exceeds net income", pass: cur.operatingCashFlow != null && cur.netIncome != null ? cur.operatingCashFlow > cur.netIncome : null },
    { key: "leverage_decreasing", label: "Long-term debt ratio decreased", pass: levCur != null && levPrev != null ? levCur < levPrev : null },
    { key: "current_ratio_improving", label: "Current ratio improved", pass: crCur != null && crPrev != null ? crCur > crPrev : null },
    { key: "no_dilution", label: "No new shares issued", pass: cur.dilutedShares != null && prev.dilutedShares != null ? cur.dilutedShares <= prev.dilutedShares : null },
    { key: "gross_margin_improving", label: "Gross margin improved", pass: gmCur != null && gmPrev != null ? gmCur > gmPrev : null },
    { key: "asset_turnover_improving", label: "Asset turnover improved", pass: atCur != null && atPrev != null ? atCur > atPrev : null },
  ];
  const applicable = criteria.filter((c) => c.pass !== null);
  return {
    asOfYear: cur.year,
    score: applicable.filter((c) => c.pass).length,
    maxScore: applicable.length,
    criteria,
  };
}

// Altman Z-Score: bankruptcy/distress risk from five weighted balance-sheet
// and income-statement ratios. Explicitly not meaningful for banks/insurers
// (Altman's own research excludes them) — detected here by the absence of
// a classified current/non-current balance sheet, the same signal already
// used to flag banks throughout this app's ratio scoring.
function altmanZ(cur: ExtractedPeriod | null, marketCapMillions: number | null) {
  if (!cur || cur.totalAssets == null) {
    return { applicable: false, reason: "Insufficient balance sheet data for this filer." };
  }
  if (cur.currentAssets == null || cur.currentLiabilities == null) {
    return {
      applicable: false,
      reason: "No classified current/non-current balance sheet — not meaningful for banks, insurers, and similar financial-sector filers.",
    };
  }
  if (cur.retainedEarnings == null || cur.operatingIncome == null || cur.totalLiabilities == null || cur.revenue == null || marketCapMillions == null) {
    return { applicable: false, reason: "Missing one or more required inputs for this filer." };
  }
  const ta = cur.totalAssets;
  const wc = cur.currentAssets - cur.currentLiabilities;
  const marketCapUsd = marketCapMillions * 1e6;
  const A = wc / ta;
  const B = cur.retainedEarnings / ta;
  const C = cur.operatingIncome / ta; // EBIT proxy
  const D = marketCapUsd / cur.totalLiabilities;
  const E = cur.revenue / ta;
  const z = 1.2 * A + 1.4 * B + 3.3 * C + 0.6 * D + 1.0 * E;
  const zone = z > 2.99 ? "safe" : z >= 1.81 ? "grey" : "distress";
  return { applicable: true, asOfYear: cur.year, score: z, zone, components: { A, B, C, D, E } };
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit("stock:financials-reported", clientIdFromRequest(request), 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is not configured" }, { status: 500 });
  }

  const sym = symbol.toUpperCase();
  const cacheKey = `financials-reported:${sym}`;
  // ?refresh=1 skips the cache read (still writes a fresh entry below) —
  // an escape hatch for when the extraction logic changes and an entry
  // fetched under the old logic would otherwise sit stale for the full
  // 6h TTL.
  const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";
  const cached = forceRefresh ? null : await kvGet<Record<string, unknown>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "private, max-age=21600, stale-while-revalidate=1800" },
    });
  }

  try {
    const [reportedRes, metricRes] = await Promise.all([
      fetch(`${FINNHUB_BASE}/stock/financials-reported?symbol=${encodeURIComponent(sym)}&token=${apiKey}`),
      fetch(`${FINNHUB_BASE}/stock/metric?symbol=${encodeURIComponent(sym)}&metric=all&token=${apiKey}`),
    ]);
    if (!reportedRes.ok) throw new Error("Finnhub financials-reported request failed");

    const reportedData = (await reportedRes.json()) as { data?: Period[] };
    const periods = (reportedData.data ?? [])
      .filter((p) => p.form === "10-K" || p.form === "20-F")
      .sort((a, b) => a.year - b.year);
    const extracted = periods.map(extractPeriod);

    let marketCap: number | null = null;
    if (metricRes.ok) {
      const m = (await metricRes.json()) as { metric?: Record<string, number> };
      marketCap = m.metric?.marketCapitalization ?? null;
    }

    const cur = extracted.length ? extracted[extracted.length - 1] : null;
    const prev = extracted.length > 1 ? extracted[extracted.length - 2] : null;

    const body = {
      symbol: sym,
      periods: extracted,
      piotroski: piotroski(cur, prev),
      altmanZ: altmanZ(cur, marketCap),
    };

    await kvSet(cacheKey, body, CACHE_TTL_S);

    return NextResponse.json(body, {
      headers: { "Cache-Control": "private, max-age=21600, stale-while-revalidate=1800" },
    });
  } catch (err) {
    console.error("[stock/financials-reported] error:", err);
    return NextResponse.json({ error: "Failed to fetch financials-reported" }, { status: 500 });
  }
}
