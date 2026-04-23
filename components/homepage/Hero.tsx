"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";

function ScenarioPreviewCard() {
  return (
    <div
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(246,248,253,0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.6)",
        borderRadius: 28,
        padding: "22px 24px",
        boxShadow: "0 32px 80px rgba(3,7,16,0.55), 0 1px 1px rgba(11,12,15,0.06)",
        width: 320,
        backdropFilter: "blur(16px)",
        transform: "perspective(900px) rotateY(-8deg) rotateX(3deg)",
        transition: "transform 500ms ease",
        cursor: "default",
        flexShrink: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "perspective(900px) rotateY(-3deg) rotateX(1deg)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "perspective(900px) rotateY(-8deg) rotateX(3deg)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B7280", marginBottom: 3 }}>Cloud Software</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0B0C0F" }}>Acme Cloud Inc. · $142</p>
        </div>
        <span style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99 }}>Live</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
        {([["Rev growth", "+34%", "#16A34A"], ["P/E ratio", "28x", null], ["Net margin", "18%", null]] as [string, string, string | null][]).map(([label, val, col]) => (
          <div key={label} style={{ background: "rgba(11,12,15,0.03)", border: "1px solid rgba(11,12,15,0.08)", borderRadius: 10, padding: "7px 8px", textAlign: "center" }}>
            <p style={{ fontSize: 9, color: "#6B7280", marginBottom: 2 }}>{label}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: col ?? "#0B0C0F" }}>{val}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 10 }}>
        {["Q3 beats estimates — raises guidance +8%", "Enterprise customers up 40% YoY"].map(b => (
          <p key={b} style={{ fontSize: 10, color: "#6B7280", marginBottom: 4 }}>· {b}</p>
        ))}
      </div>

      <div style={{ background: "rgba(217,119,6,0.08)", borderRadius: 10, padding: "7px 10px", marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "#D97706" }}>Signal: CFO purchased $500K of shares</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
        {([["BUY", true], ["HOLD", false], ["PASS", false]] as [string, boolean][]).map(([label, active]) => (
          <div key={label} style={{
            border: `1px solid ${active ? "rgba(22,163,74,0.4)" : "rgba(11,12,15,0.1)"}`,
            background: active ? "rgba(22,163,74,0.08)" : "transparent",
            borderRadius: 10, padding: "8px 0", textAlign: "center",
            fontSize: 10, fontWeight: 700,
            color: active ? "#16A34A" : "#6B7280",
          }}>{label}</div>
        ))}
      </div>

      <div style={{ marginTop: 12, borderTop: "1px solid rgba(11,12,15,0.07)", paddingTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ background: "rgba(30,71,235,0.06)", border: "1px solid rgba(30,71,235,0.14)", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "baseline", gap: 3 }}>
          <span style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 800, color: "#1e47eb" }}>82</span>
          <span style={{ fontSize: 10, color: "#6B7280" }}>/100</span>
        </div>
        <p style={{ fontSize: 10, color: "#6B7280", lineHeight: 1.4 }}>AI reasoning score</p>
      </div>
    </div>
  );
}

export default function Hero({ user }: { user: User | null }) {
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "120px 24px 80px" }}>
      <div aria-hidden style={{ position: "absolute", top: "-10%", left: "8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,71,235,0.28), transparent 68%)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", top: "-8%", right: "5%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(86,140,239,0.13), transparent 68%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 80 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(30,71,235,0.1)", border: "1px solid rgba(30,71,235,0.22)", borderRadius: 99, padding: "5px 12px", marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1e47eb", boxShadow: "0 0 6px rgba(30,71,235,0.8)", flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1e47eb" }}>Vanetex</span>
          </div>

          <h1 style={{ fontSize: "clamp(36px, 5vw, 62px)", fontWeight: 700, color: "#FAFAF7", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 22, maxWidth: 580, textWrap: "balance" as never }}>
            Build real investing judgment —
            <span style={{ color: "#1e47eb" }}> one decision at a time.</span>
          </h1>

          <p style={{ fontSize: 18, color: "rgba(250,250,247,0.55)", lineHeight: 1.65, maxWidth: 460, marginBottom: 36 }}>
            A daily scenario. Write your thesis. An AI analyst grades your reasoning. See what actually happened.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40, flexWrap: "wrap" }}>
            {user ? (
              <Link href="/challenge" style={{
                background: "linear-gradient(135deg, #0B0C0F 0%, #1e47eb 160%)",
                color: "#FAFAF7", fontSize: 15, fontWeight: 700,
                textDecoration: "none", padding: "14px 28px", borderRadius: 99,
                boxShadow: "0 8px 28px rgba(30,71,235,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                Start Today&apos;s Challenge
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </Link>
            ) : (
              <>
                <Link href="/auth/sign-up" style={{
                  background: "linear-gradient(135deg, #0B0C0F 0%, #1e47eb 160%)",
                  color: "#FAFAF7", fontSize: 15, fontWeight: 700,
                  textDecoration: "none", padding: "14px 28px", borderRadius: 99,
                  boxShadow: "0 8px 28px rgba(30,71,235,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}>
                  Get Started — Free
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <a href="#demo" style={{ color: "rgba(250,250,247,0.55)", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "14px 4px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" /><path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor" /></svg>
                  Watch the demo
                </a>
              </>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {["60 real scenarios", "AI reasoning score", "Paper trading", "20 lessons", "17 achievements", "Leaderboard"].map(f => (
              <span key={f} style={{ background: "rgba(250,250,247,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 500, color: "rgba(250,250,247,0.4)" }}>{f}</span>
            ))}
          </div>
        </div>

        <div style={{ flexShrink: 0 }} className="hidden lg:block">
          <ScenarioPreviewCard />
        </div>
      </div>
    </section>
  );
}

export function StatsBar() {
  const stats = [
    { value: "60", label: "Real scenarios" },
    { value: "20", label: "Structured lessons" },
    { value: "17", label: "Achievements" },
    { value: "$10K", label: "Paper trading cash" },
  ];
  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }}>
        {stats.map(s => (
          <div key={s.label}>
            <p style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 800, color: "#FAFAF7", letterSpacing: "-0.02em", marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "rgba(250,250,247,0.4)", fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
