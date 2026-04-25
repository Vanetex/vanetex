"use client";

import Link from "next/link";

function TheLoop() {
  const steps = [
    { num: "01", title: "Decide", body: "Read a real stock snapshot. Metrics, headlines, an insider signal. Choose Buy, Hold, or Pass — and set your confidence.", color: "#1e47eb" },
    { num: "02", title: "Defend", body: "Write your thesis in 2–4 sentences. The AI grades your logic, not your feelings. Vague answers get called out.", color: "#D97706" },
    { num: "03", title: "Reflect", body: "The outcome is revealed. What actually happened. Journal what you missed. The loop resets tomorrow.", color: "#16A34A" },
  ];
  return (
    <section style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#1e47eb", marginBottom: 12 }}>The loop</p>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 700, color: "#FAFAF7", letterSpacing: "-0.025em" }}>Ten minutes a day. Real progress.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {steps.map(s => (
            <div key={s.num} style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 24, padding: "28px 26px" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}18`, border: `1px solid ${s.color}35`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: s.color }}>{s.num}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#FAFAF7", marginBottom: 10 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(250,250,247,0.5)", lineHeight: 1.65 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniChart() {
  const pts = [30, 38, 34, 42, 46, 41, 55, 52, 63, 58, 72, 68, 78];
  const max = Math.max(...pts), min = Math.min(...pts);
  const norm = pts.map(p => ((p - min) / (max - min)) * 48 + 6);
  const path = norm.map((y, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * 120} ${60 - y}`).join(" ");
  return (
    <div style={{ marginBottom: 20 }}>
      <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L 120 60 L 0 60 Z`} fill="url(#chartFill)" />
        <path d={path} stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#16A34A" }}>+24.3%</span>
        <span style={{ fontSize: 10, color: "rgba(250,250,247,0.4)" }}>vs S&P +11.2%</span>
      </div>
    </div>
  );
}

function ScoreGauge() {
  const radius = 28, circ = 2 * Math.PI * radius, pct = 0.76;
  return (
    <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(30,71,235,0.12)" strokeWidth="5" />
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#1e47eb" strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" transform="rotate(-90 36 36)" />
        <text x="36" y="40" textAnchor="middle" fill="#1e47eb" fontSize="14" fontWeight="800" fontFamily="monospace">76</text>
      </svg>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#FAFAF7", marginBottom: 2 }}>Reasoning score</p>
        <p style={{ fontSize: 10, color: "rgba(250,250,247,0.4)" }}>↑ 8pts this month</p>
      </div>
    </div>
  );
}

function AchievementBadges() {
  const badges = [
    { label: "🔥 7-day streak", locked: false },
    { label: "🎯 First sharp call", locked: false },
    { label: "📈 Beat the market", locked: true },
  ];
  return (
    <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 6 }}>
      {badges.map(b => (
        <div key={b.label} style={{
          background: b.locked ? "rgba(255,255,255,0.02)" : "rgba(30,71,235,0.08)",
          border: `1px solid ${b.locked ? "rgba(255,255,255,0.07)" : "rgba(30,71,235,0.22)"}`,
          borderRadius: 10, padding: "7px 12px", fontSize: 11, fontWeight: 600,
          color: b.locked ? "rgba(250,250,247,0.25)" : "rgba(250,250,247,0.8)",
          opacity: b.locked ? 0.5 : 1,
        }}>
          {b.locked && <span style={{ fontSize: 10, marginRight: 6 }}>🔒</span>}{b.label}
        </div>
      ))}
    </div>
  );
}

function LessonPreview() {
  const lessons = ["P/E Ratio", "Revenue Growth", "Profit Margins"];
  return (
    <div style={{ marginBottom: 20 }}>
      {lessons.map((l, i) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: i < 2 ? "rgba(22,163,74,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${i < 2 ? "rgba(22,163,74,0.3)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>
            {i < 2 ? "✓" : ""}
          </div>
          <span style={{ fontSize: 12, color: i < 2 ? "rgba(250,250,247,0.7)" : "rgba(250,250,247,0.35)" }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({ title, body, detail, accent, children }: { title: string; body: string; detail: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.025) 100%)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 24, padding: "30px 28px" }}>
      {children}
      <h3 style={{ fontSize: 17, fontWeight: 700, color: "#FAFAF7", marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13, color: "rgba(250,250,247,0.5)", lineHeight: 1.65, marginBottom: 14 }}>{body}</p>
      <p style={{ fontSize: 11, color: accent, fontWeight: 600 }}>{detail}</p>
    </div>
  );
}

function Features() {
  return (
    <section id="features" style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#1e47eb", marginBottom: 12 }}>Everything included</p>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 700, color: "#FAFAF7", letterSpacing: "-0.025em" }}>The full training system.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <FeatureCard title="Paper Trading Simulator" body="Trade with $10,000 of virtual cash across 30+ real sectors. Track your portfolio against the S&P 500. No real money, real lessons." detail="Real-time position tracking & P&L" accent="#16A34A"><MiniChart /></FeatureCard>
          <FeatureCard title="Progress & Skill Tracking" body="Your reasoning score, decision accuracy, and confidence calibration are tracked over time. See yourself getting sharper, rep by rep." detail="Rolling skill score · accuracy · calibration" accent="#1e47eb"><ScoreGauge /></FeatureCard>
          <FeatureCard title="Achievements & Streaks" body="17 achievements to unlock across consistency, accuracy, and boldness. Build streaks. Climb skill levels from Rookie to Analyst." detail="17 achievements · daily streak system" accent="#D97706"><AchievementBadges /></FeatureCard>
          <FeatureCard title="Structured Learning Tracks" body="20 lessons across Financial Metrics, Market Reading, and Volatility & Risk. Filter by career path — IB, VC, HF, Asset Management." detail="3 tracks · 20 lessons · career-filtered" accent="#8B5CF6"><LessonPreview /></FeatureCard>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{ padding: "0 24px 100px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg, rgba(30,71,235,0.18) 0%, rgba(11,12,15,0.9) 60%)", border: "1px solid rgba(30,71,235,0.25)", borderRadius: 32, padding: "72px 48px", textAlign: "center", boxShadow: "0 0 80px rgba(30,71,235,0.1)" }}>
          <div aria-hidden style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 300, background: "radial-gradient(ellipse, rgba(30,71,235,0.2), transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#1e47eb", marginBottom: 14, position: "relative" }}>Free. No credit card.</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, color: "#FAFAF7", letterSpacing: "-0.03em", marginBottom: 16, position: "relative" }}>Start training today.</h2>
          <p style={{ fontSize: 16, color: "rgba(250,250,247,0.5)", maxWidth: 400, margin: "0 auto 36px", position: "relative" }}>Join investors building judgment one scenario at a time.</p>
          <Link href="/auth/sign-up" style={{ position: "relative", background: "linear-gradient(135deg, #0B0C0F 0%, #1e47eb 160%)", color: "#FAFAF7", fontSize: 15, fontWeight: 700, textDecoration: "none", padding: "16px 36px", borderRadius: 99, boxShadow: "0 10px 32px rgba(30,71,235,0.4), inset 0 1px 0 rgba(255,255,255,0.18)", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Create your free account
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px", textAlign: "center" }}>
      <p style={{ fontSize: 12, color: "rgba(250,250,247,0.25)", marginBottom: 10 }}>Vanetex — Build Your Edge</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
        <Link href="/terms" style={{ fontSize: 11, color: "rgba(250,250,247,0.2)", textDecoration: "none" }}>Terms of Service</Link>
        <Link href="/privacy" style={{ fontSize: 11, color: "rgba(250,250,247,0.2)", textDecoration: "none" }}>Privacy Policy</Link>
        <a href="mailto:vanetexinvestingapp@gmail.com" style={{ fontSize: 11, color: "rgba(250,250,247,0.2)", textDecoration: "none" }}>vanetexinvestingapp@gmail.com</a>
      </div>
    </footer>
  );
}

export default function HomepageSections() {
  return (
    <>
      <TheLoop />
      <Features />
      <FinalCTA />
      <Footer />
    </>
  );
}
