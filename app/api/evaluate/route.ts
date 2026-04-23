import { NextRequest, NextResponse } from "next/server";
import { SCENARIOS } from "@/data/scenarios";
import { SYSTEM_PROMPT, buildUserMessage } from "@/lib/evaluationPrompt";
import type { Action, Evaluation } from "@/lib/types";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 8 * 1024;
const MAX_REASONING_CHARS = 1_500;
const MAX_MODEL_RESPONSE_CHARS = 12_000;
const PROVIDER_TIMEOUT_MS = 15_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const ERROR_EVALUATION_FAILED = "Evaluation failed.";
const VALID_ACTIONS: Action[] = ["BUY", "HOLD", "PASS"];

type EvaluateRequestBody = {
  scenarioId: string;
  action: Action;
  confidence: number;
  reasoning: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __evaluateRouteRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

/**
 * POST /api/evaluate
 *
 * Body: { scenarioId, action, confidence, reasoning }
 * Returns: Evaluation (see lib/types.ts)
 *
 * Supports both Anthropic and OpenAI via env:
 *   AI_PROVIDER=anthropic|openai
 *   AI_MODEL=<model name>
 *   ANTHROPIC_API_KEY / OPENAI_API_KEY
 *
 * If no key is configured, we fall back to a deterministic local rubric so the
 * app stays usable for local dev. The quality will be worse — but the flow works.
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimit = consumeRateLimit(getClientId(req));
    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: "Too many evaluation requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonResponse(
        { error: "Content-Type must be application/json." },
        { status: 415 },
      );
    }

    const parsedBody = await readJsonBody(req, MAX_REQUEST_BYTES);
    const body = validateEvaluateRequest(parsedBody);
    if (!body.ok) {
      return jsonResponse({ error: body.error }, { status: body.status });
    }

    const { scenarioId, action, confidence, reasoning } = body.value;
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) {
      return jsonResponse({ error: "Unknown scenario." }, { status: 400 });
    }

    const userMessage = buildUserMessage(
      scenario,
      action,
      confidence,
      reasoning,
    );

    const provider = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase();

    let raw: string | null = null;
    if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
      raw = await callAnthropic(userMessage);
    } else if (provider === "openai" && process.env.OPENAI_API_KEY) {
      raw = await callOpenAI(userMessage);
    }

    const evaluation: Evaluation = raw
      ? safeParseEvaluation(raw) ??
        localFallback(scenario, action, confidence, reasoning)
      : localFallback(scenario, action, confidence, reasoning);

    return jsonResponse(evaluation);
  } catch (err: unknown) {
    if (err instanceof RequestTooLargeError) {
      return jsonResponse(
        { error: `Request body must be ${MAX_REQUEST_BYTES} bytes or less.` },
        { status: 413 },
      );
    }
    if (err instanceof BadRequestError) {
      return jsonResponse({ error: err.message }, { status: 400 });
    }

    console.error("[/api/evaluate] error:", err);
    return jsonResponse({ error: ERROR_EVALUATION_FAILED }, { status: 500 });
  }
}

// ---------- Providers ----------

async function callAnthropic(userMessage: string): Promise<string | null> {
  const model = process.env.AI_MODEL ?? "claude-sonnet-4-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  if (!res.ok) {
    console.error("Anthropic error:", res.status, limitLog(await res.text()));
    return null;
  }
  const data: unknown = await res.json();
  const text = anthropicTextFromResponse(data);
  return text;
}

async function callOpenAI(userMessage: string): Promise<string | null> {
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    }),
  });
  if (!res.ok) {
    console.error("OpenAI error:", res.status, limitLog(await res.text()));
    return null;
  }
  const data: unknown = await res.json();
  if (!data || typeof data !== "object") return null;
  const choices = (data as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || !choices[0]) return null;
  const msg = (choices[0] as { message?: { content?: unknown } }).message;
  const content = msg?.content;
  return typeof content === "string" ? content : null;
}

// ---------- Parsing + fallback ----------

function safeParseEvaluation(raw: string): Evaluation | null {
  if (raw.length > MAX_MODEL_RESPONSE_CHARS) return null;

  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  if (cleaned.length > MAX_MODEL_RESPONSE_CHARS) return null;

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const inner =
    start >= 0 && end > start ? cleaned.slice(start, end + 1) : null;
  const candidates =
    inner && inner !== cleaned ? [cleaned, inner] : [cleaned];

  for (const candidate of candidates) {
    try {
      const obj = JSON.parse(candidate);
      if (!obj || typeof obj !== "object") continue;
      const o = obj as Record<string, unknown>;
      return {
        reasoningScore: clampInt(o.reasoningScore),
        decisionScore: clampInt(o.decisionScore),
        didWell: asStringArray(o.didWell, 2, 220),
        missed: asStringArray(o.missed, 2, 220),
        improvement: asBoundedString(o.improvement, 220),
        tags: asStringArray(o.tags, 4, 80),
        idealAnswer: asOptionalBoundedString(o.idealAnswer, 700),
      };
    } catch {
      continue;
    }
  }

  return null;
}

function anthropicTextFromResponse(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const content = (data as { content?: unknown }).content;
  if (!Array.isArray(content)) return null;
  const text = content
    .map((block) => {
      if (block && typeof block === "object" && "text" in block) {
        const t = (block as { text?: unknown }).text;
        return typeof t === "string" ? t : "";
      }
      return "";
    })
    .join("");
  return text.length ? text : null;
}

function clampInt(n: unknown): number {
  const x = typeof n === "number" ? n : parseInt(String(n ?? 0), 10);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function asStringArray(v: unknown, cap: number, maxLength: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim().slice(0, maxLength))
    .slice(0, cap);
}

function asBoundedString(v: unknown, maxLength: number): string {
  return typeof v === "string" ? v.trim().slice(0, maxLength) : "";
}

function asOptionalBoundedString(
  v: unknown,
  maxLength: number,
): string | undefined {
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

/**
 * A crude deterministic grader used only when no API key is configured.
 * It keeps the app usable offline and produces "correct shape" evaluations.
 */
function localFallback(
  scenario: (typeof SCENARIOS)[number],
  action: Action,
  confidence: number,
  reasoning: string,
): Evaluation {
  const words = (reasoning ?? "").trim().split(/\s+/).filter(Boolean);
  const len = (reasoning ?? "").trim().length;
  const mentionsMetric =
    /(p\/e|pe ratio|margin|growth|revenue|debt|cash|valuation|risk)/i.test(
      reasoning ?? "",
    );
  let reasoningScore = 30;
  if (len > 40) reasoningScore += 15;
  if (len > 120) reasoningScore += 15;
  if (mentionsMetric) reasoningScore += 15;
  if (words.length > 30) reasoningScore += 10;
  reasoningScore = Math.min(reasoningScore, 85);

  const aligned = action === scenario.outcome.idealAction;
  let decisionScore = aligned ? 70 : 45;
  if (aligned && confidence >= 7) decisionScore += 10;
  if (!aligned && confidence >= 8) decisionScore -= 10;
  decisionScore = Math.max(10, Math.min(decisionScore, 90));

  return {
    reasoningScore,
    decisionScore,
    didWell: mentionsMetric
      ? ["Referenced at least one concrete metric (good)."]
      : ["You committed to a direction — but without anchoring to numbers."],
    missed: [
      aligned
        ? `You landed on the right action, but defend it using ${scenario.signal ?? "the signal"}.`
        : `You chose ${action}, but the data points toward ${scenario.outcome.idealAction}.`,
    ],
    improvement: mentionsMetric
      ? "Cite 2+ metrics and name the dominant risk explicitly."
      : "Always cite at least one valuation metric and one growth/margin metric.",
    tags: [
      mentionsMetric ? "Touched valuation" : "Ignored valuation",
      aligned ? "Correct direction" : "Wrong direction",
      confidence >= 8 ? "High confidence" : "Moderate confidence",
    ],
    idealAnswer: scenario.outcome.idealRationale,
  };
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");
  return NextResponse.json(body, { ...init, headers });
}

function validateEvaluateRequest(
  body: unknown,
):
  | { ok: true; value: EvaluateRequestBody }
  | { ok: false; status: number; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, status: 400, error: "Invalid JSON payload." };
  }

  const {
    scenarioId,
    action,
    confidence,
    reasoning,
  } = body as Record<string, unknown>;

  if (typeof scenarioId !== "string" || scenarioId.trim().length === 0) {
    return {
      ok: false,
      status: 400,
      error: "scenarioId must be a non-empty string.",
    };
  }

  if (typeof action !== "string" || !isAction(action)) {
    return {
      ok: false,
      status: 400,
      error: "action must be BUY, HOLD, or PASS.",
    };
  }

  if (
    typeof confidence !== "number" ||
    !Number.isFinite(confidence) ||
    !Number.isInteger(confidence) ||
    confidence < 1 ||
    confidence > 10
  ) {
    return {
      ok: false,
      status: 400,
      error: "confidence must be an integer from 1 to 10.",
    };
  }

  if (reasoning !== undefined && typeof reasoning !== "string") {
    return {
      ok: false,
      status: 400,
      error: "reasoning must be a string.",
    };
  }

  const normalizedReasoning = (reasoning ?? "").trim();
  if (normalizedReasoning.length > MAX_REASONING_CHARS) {
    return {
      ok: false,
      status: 400,
      error: `reasoning must be ${MAX_REASONING_CHARS} characters or less.`,
    };
  }

  return {
    ok: true,
    value: {
      scenarioId: scenarioId.trim(),
      action,
      confidence,
      reasoning: normalizedReasoning,
    },
  };
}

function isAction(v: string): v is Action {
  return VALID_ACTIONS.includes(v as Action);
}

function getClientId(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "local";
}

function consumeRateLimit(
  clientId: string,
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
  const now = Date.now();
  const store = getRateLimitStore();

  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }

  const current = store.get(clientId);
  if (!current) {
    store.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true };
}

function getRateLimitStore() {
  if (!globalThis.__evaluateRouteRateLimitStore) {
    globalThis.__evaluateRouteRateLimitStore = new Map<string, RateLimitEntry>();
  }
  return globalThis.__evaluateRouteRateLimitStore;
}

async function readJsonBody(req: NextRequest, maxBytes: number): Promise<unknown> {
  const contentLength = req.headers.get("content-length");
  if (contentLength) {
    const declaredLength = Number.parseInt(contentLength, 10);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      throw new RequestTooLargeError();
    }
  }

  if (!req.body) {
    throw new BadRequestError("Request body is required.");
  }

  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      throw new RequestTooLargeError();
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();

  if (!text.trim()) {
    throw new BadRequestError("Request body is required.");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new BadRequestError("Invalid JSON.");
  }
}

function limitLog(value: string, maxLength = 500): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}...`;
}

class BadRequestError extends Error {}

class RequestTooLargeError extends Error {
  constructor() {
    super("Request body is too large.");
  }
}
