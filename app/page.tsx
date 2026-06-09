"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [rotY, setRotY] = useState(0);

  // Globe animation
  useEffect(() => {
    let animId: NodeJS.Timeout;
    const animate = () => {
      setRotY(prev => (prev + 0.002) % (Math.PI * 2));
      animId = setTimeout(animate, 16);
    };
    animId = setTimeout(animate, 16);
    return () => clearTimeout(animId);
  }, []);

  return (
    <div style={{ background: "#07080b", color: "#e8edf8", minHeight: "100vh", overflow: "hidden" }}>
      {/* Background Canvas */}
      <canvas id="bg-canvas" style={{ position: "fixed", inset: 0, zIndex: 1 }} />
      
      {/* Orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        {[
          { top: "-300px", left: "-200px", size: "900px", color: "#0f2d6b", delay: "0s", duration: "25s" },
          { top: "30%", right: "-150px", size: "600px", color: "#064e6e", delay: "0.4s", duration: "30s" },
          { bottom: "-150px", left: "30%", size: "500px", color: "#1a3a9b", delay: "0.8s", duration: "20s" },
          { top: "5%", left: "55%", size: "400px", color: "#0d4f4f", delay: "0.2s", duration: "35s" },
        ].map((orb, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color}, transparent)`,
              filter: "blur(110px)",
              opacity: 0.45,
              top: orb.top,
              right: orb.right,
              bottom: orb.bottom,
              left: orb.left,
            }}
          />
        ))}
      </div>

      {/* Scan lines */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.025) 2px, rgba(0,0,0,.025) 4px)",
        zIndex: 3,
        pointerEvents: "none"
      }} />

      {/* Vignette */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,.7) 100%)",
        zIndex: 4,
        pointerEvents: "none"
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 5, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "60px 40px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 60, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#3b82f6", marginBottom: 20 }}>Professional Financial Platform</p>
          <h1 style={{ fontSize: "clamp(58px, 8vw, 100px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 0.92, marginBottom: 16, background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 45%, #22d3ee 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VANETEX</h1>
          <p style={{ fontSize: 15, color: "#4e6080", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 40px" }}>Institutional-grade tools for portfolio analysis, market intelligence, and data-driven investment research.</p>
        </div>

        {/* Products Section */}
        <div style={{ maxWidth: 1200, margin: "0 auto 80px", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#3b82f6", marginBottom: 12 }}>The Vanetex Suite</p>
            <h2 style={{ fontSize: 40, fontWeight: 700, color: "#fafaf7", letterSpacing: "-0.025em" }}>Three tools. One platform.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { num: "01", title: "Training Platform", body: "Build investment judgment with AI-graded decisions, real-time feedback, and tracked skill progression. Paper trade across 30+ sectors.", cta: "Launch Training", href: "/auth/sign-up", color: "#1e47eb" },
              { num: "02", title: "Backtesting Engine", body: "Backtest multi-asset portfolios against real historical data. Risk metrics (Sharpe, Sortino, Calmar), SPY benchmarking, and rebalancing simulation.", cta: "Launch Backtesting", href: "/software", color: "#16A34A" },
              { num: "03", title: "Intelligence Terminal", body: "Professional market terminal with live data streams, dark pool monitoring, interactive charts, AI research, and geopolitical risk analysis.", cta: "Launch Intelligence", href: "/software", color: "#D97706" },
            ].map((product) => (
              <Link key={product.num} href={product.href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "linear-gradient(160deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.025) 100%)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 24,
                  padding: "30px 28px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${product.color}18`, border: `1px solid ${product.color}35`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: product.color }}>{product.num}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fafaf7", marginBottom: 10 }}>{product.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(250,250,247,0.5)", lineHeight: 1.65, marginBottom: 16, flex: 1 }}>{product.body}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: product.color }}>
                    {product.cta}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Background animation script */}
      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          const cvs = document.getElementById('bg-canvas');
          if (!cvs) return;
          const ctx = cvs.getContext('2d');
          let W = window.innerWidth, H = window.innerHeight;
          cvs.width = W;
          cvs.height = H;
          
          const lines = Array.from({length: 14}, (_,i) => ({
            y: H * (i+1) / 15,
            speed: 0.25 + Math.random() * 0.7,
            amp: 5 + Math.random() * 22,
            freq: 0.006 + Math.random() * 0.01,
            phase: Math.random() * Math.PI * 2,
            alpha: 0.03 + Math.random() * 0.07,
            color: Math.random() > 0.55 ? '59,130,246' : '34,211,238'
          }));
          
          let t = 0;
          function frame() {
            ctx.clearRect(0, 0, W, H);
            t += 0.007;
            lines.forEach(l => {
              ctx.beginPath();
              for (let x = 0; x <= W; x += 4) {
                const y = l.y + Math.sin(x * l.freq + t * l.speed + l.phase) * l.amp + Math.sin(x * l.freq * 0.4 + t * l.speed * 0.6) * l.amp * 0.3;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
              }
              ctx.strokeStyle = \`rgba(\${l.color},\${l.alpha})\`;
              ctx.lineWidth = 0.9;
              ctx.stroke();
            });
            requestAnimationFrame(frame);
          }
          frame();
          
          window.addEventListener('resize', () => {
            W = window.innerWidth;
            H = window.innerHeight;
            cvs.width = W;
            cvs.height = H;
            lines.forEach((l, i) => l.y = H * (i + 1) / 15);
          });
        })();
      `}} />
    </div>
  );
}
