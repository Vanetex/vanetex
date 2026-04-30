"use client";

import { useEffect, useState } from "react";

type TickerItem = { symbol: string; price: number; changePct: number };

function isMarketOpen(): boolean {
  const now = new Date();
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return false;
  // ET = UTC-4 (DST) or UTC-5 — approximate with UTC-4 (covers most of the year)
  const etHour = now.getUTCHours() - 4;
  const etMinute = now.getUTCMinutes();
  const etMins = etHour * 60 + etMinute;
  return etMins >= 9 * 60 + 30 && etMins < 16 * 60;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Ticker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    setMarketOpen(isMarketOpen());
    fetch("/api/ticker").then((r) => r.json()).then(setItems).catch(() => {});
    const interval = setInterval(() => {
      setMarketOpen(isMarketOpen());
      fetch("/api/ticker").then((r) => r.json()).then(setItems).catch(() => {});
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!items.length) return null;

  const track = [...items, ...items]; // duplicate for seamless loop

  return (
    <div
      style={{
        background: "rgba(8,11,20,0.88)",
        border: "1px solid rgba(255,255,255,0.08)",
        height: 36,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Market status */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "0 14px",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          height: "100%",
          background: "rgba(8,11,20,0.95)",
          zIndex: 2,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: marketOpen ? "#16A34A" : "#6B7280",
            boxShadow: marketOpen ? "0 0 6px #16A34A" : "none",
          }}
        />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: marketOpen ? "#16A34A" : "rgba(250,250,247,0.3)", whiteSpace: "nowrap" }}>
          {marketOpen ? "OPEN" : "CLOSED"}
        </span>
      </div>

      {/* Scrolling track */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div className="ticker-track" style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {track.map((item, i) => {
            const up = item.changePct >= 0;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "0 20px",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: "#FAFAF7", letterSpacing: "0.05em" }}>
                  {item.symbol}
                </span>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(250,250,247,0.45)", letterSpacing: "0.02em" }}>
                  ${fmt(item.price)}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: up ? "#4ade80" : "#f87171", letterSpacing: "0.03em" }}>
                  {up ? "+" : ""}{item.changePct.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fade edges */}
      <div aria-hidden style={{ position: "absolute", left: 95, top: 0, bottom: 0, width: 48, background: "linear-gradient(to right, rgba(8,11,20,1), transparent)", pointerEvents: "none", zIndex: 1 }} />
      <div aria-hidden style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(to left, rgba(8,11,20,1), transparent)", pointerEvents: "none", zIndex: 1 }} />
    </div>
  );
}
