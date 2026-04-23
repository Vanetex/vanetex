"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Decision = "BUY" | "HOLD" | "PASS";

const feedbacks: Record<Decision, { good: string[]; miss: string[]; tip: string; verdict: string }> = {
  BUY: {
    good: ["Correctly weighted revenue growth against valuation", "Identified insider buying as a corroborating signal"],
    miss: ["Didn't consider competitive moat or customer retention risk"],
    tip: "High growth + insider conviction is strong — but ask what keeps customers from switching.",
    verdict: "Strong call.",
  },
  HOLD: {
    good: ["Appropriately cautious given valuation premium"],
    miss: ["Missed the insider buying signal — a significant omission", "Underweighted the guidance raise and enterprise growth"],
    tip: "CFO conviction + guidance raise is a potent combination. Revisit your weighting.",
    verdict: "Too cautious.",
  },
  PASS: {
    good: ["Recognized valuation risk in a high-growth name"],
    miss: ["Ignored the insider purchase entirely", "Missed that growth rate acceleration offsets the premium", "Guidance raise signals management confidence"],
    tip: "Avoiding risk is not a strategy. You need a thesis, not an absence of one.",
    verdict: "Missed the setup.",
  },
};

export default function Demo() {
  const [choice, setChoice] = useState<Decision | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!choice) { setScore(0); setShowFeedback(false); return; }
    setShowFeedback(false);
    setScore(0);
    const target = choice === "BUY" ? 82 : choice === "HOLD" ? 51 : 34;
    let current = 0;
    const step = () => {
      current = Math.min(current + Math.ceil((target - current) * 0.12) + 1, target);
      setScore(current);
      if (current < target) setTimeout(step, 28);
      else setTimeout(() => setShowFeedback(true), 200);
    };
    setTimeout(step, 300);
  }, [choice]);

  const fb = choice ? feedbacks[choice] : null;
  const scoreColor = score >= 70 ? "#16A34A" : score >= 45 ? "#D97706" : "#DC2626";

  return (
    <section id="demo" style={{ padding: "100px 24px", position: "relative" }}>
      <div aria-hidden style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(30,71,235,0.07), transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#1e47eb", marginBottom: 12 }}>Try it now</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "#FAFAF7", letterSpacing: "-0.025em", marginBottom: 14 }}>
            One scenario. What&apos;s your call?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(250,250,247,0.5)", maxWidth: 420, margin: "0 auto" }}>
            Read the snapshot, make your decision, and see how the AI grades your thinking.
          </p>
        </div>

        {/* Scenario card */}
        <div style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(246,248,253,0.95) 100%)", border: "1px solid rgba(255,255,255,0.55)", borderRadius: 28, padding: "28px 30px", boxShadow: "0 22px 60px rgba(3,7,16,0.45)", backdropFilter: "blur(16px)", marginBottom: 12 }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B7280", marginBottom: 4 }}>Cloud Software · Today&apos;s Challenge</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#0B0C0F", letterSpacing: "-0.01em" }}>Acme Cloud Inc.</p>
              <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Current price: <strong style={{ color: "#0B0C0F" }}>$142.00</strong></p>
            </div>
            <span style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", color: "#16A34A", fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 99 }}>Live scenario</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 18 }}>
            {([["Revenue growth", "+34%", "#16A34A"], ["P/E ratio", "28x", null], ["Net margin", "18%", null], ["Gross margin", "71%", null], ["EPS beat", "+12%", "#16A34A"], ["Guidance raise", "+8%", "#16A34A"]] as [string, string, string | null][]).map(([label, val, col]) => (
              <div key={label} style={{ background: "rgba(11,12,15,0.03)", border: "1px solid rgba(11,12,15,0.07)", borderRadius: 12, padding: "10px 12px" }}>
                <p style={{ fontSize: 10, color: "#6B7280", marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: col ?? "#0B0C0F" }}>{val}</p>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14, borderLeft: "2px solid rgba(11,12,15,0.08)", paddingLeft: 12 }}>
            {["Q3 earnings beat estimates — raises full-year guidance by 8%", "Enterprise customer count up 40% YoY, net retention rate 118%", "Expanding into APAC; new $200M partnership announced"].map(h => (
              <p key={h} style={{ fontSize: 12, color: "#6B7280", marginBottom: 6, lineHeight: 1.5 }}>· {h}</p>
            ))}
          </div>

          <div style={{ background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.18)", borderRadius: 12, padding: "10px 14px", marginBottom: 22, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13 }}>⚡</span>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#D97706" }}>Insider signal: CFO purchased $500K of shares last month</p>
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7280", marginBottom: 12 }}>Your decision</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {([["BUY", "#16A34A", "rgba(22,163,74,0.08)", "rgba(22,163,74,0.35)"], ["HOLD", "#D97706", "rgba(217,119,6,0.08)", "rgba(217,119,6,0.35)"], ["PASS", "#DC2626", "rgba(220,38,38,0.08)", "rgba(220,38,38,0.3)"]] as [Decision, string, string, string][]).map(([label, col, bg, border]) => (
              <button key={label} onClick={() => setChoice(label)} style={{
                background: choice === label ? bg : "transparent",
                border: `1.5px solid ${choice === label ? border : "rgba(11,12,15,0.12)"}`,
                borderRadius: 14, padding: "14px 0", textAlign: "center",
                fontSize: 13, fontWeight: 800, letterSpacing: "0.06em",
                color: choice === label ? col : "#6B7280",
                cursor: "pointer", transition: "all 180ms ease",
                transform: choice === label ? "scale(1.02)" : "scale(1)",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Evaluation */}
        {choice && (
          <div style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(246,248,253,0.95) 100%)", border: "1px solid rgba(255,255,255,0.55)", borderRadius: 28, padding: "28px 30px", boxShadow: "0 22px 60px rgba(3,7,16,0.45)", backdropFilter: "blur(16px)", animation: "slideUp 350ms cubic-bezier(0.22,1,0.36,1) both" }}>
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(14px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B7280", marginBottom: 8 }}>AI Reasoning Score</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 52, fontWeight: 800, color: scoreColor, lineHeight: 1, letterSpacing: "-0.03em", transition: "color 400ms" }}>{score}</span>
                  <span style={{ fontSize: 16, color: "#6B7280" }}>/100</span>
                </div>
                {showFeedback && <p style={{ fontSize: 12, fontWeight: 700, color: scoreColor, marginTop: 4 }}>{fb?.verdict}</p>}
              </div>
              <div style={{ flex: 1, paddingTop: 28 }}>
                <div style={{ background: "rgba(11,12,15,0.06)", borderRadius: 99, height: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})`, width: `${score}%`, transition: "width 80ms linear" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  {["Weak", "Fair", "Strong", "Sharp"].map(l => (
                    <span key={l} style={{ fontSize: 9, color: "#6B7280" }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>

            {showFeedback && fb && (
              <div>
                <div style={{ marginBottom: 14 }}>
                  {fb.good.map(g => (
                    <div key={g} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <span style={{ color: "#16A34A", fontWeight: 800, fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                      <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{g}</p>
                    </div>
                  ))}
                  {fb.miss.map(m => (
                    <div key={m} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <span style={{ color: "#DC2626", fontWeight: 800, fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>✗</span>
                      <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{m}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(30,71,235,0.05)", border: "1px solid rgba(30,71,235,0.12)", borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1e47eb" }}>Analyst tip: </span>
                  <span style={{ fontSize: 12, color: "#4B5563" }}>{fb.tip}</span>
                </div>
                <Link href="/auth/sign-up" style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg, #0B0C0F 0%, #1e47eb 160%)", color: "#FAFAF7", fontSize: 14, fontWeight: 700, textDecoration: "none", padding: "14px 0", borderRadius: 14, boxShadow: "0 6px 20px rgba(30,71,235,0.3)" }}>
                  Try a real challenge — free →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
