"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

export default function HomeNav({ user }: { user: User | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "12px 24px",
      transition: "background 300ms ease, backdrop-filter 300ms ease",
      background: scrolled ? "rgba(9,11,17,0.88)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #1e47eb, #0B0C0F)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(30,71,235,0.35)",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="1,10 5,5 8,8 13,2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ color: "#FAFAF7", fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>Vanetex</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[["#demo", "Try demo"], ["#features", "Features"]].map(([href, label]) => (
            <a key={href} href={href} style={{
              color: "rgba(250,250,247,0.5)", fontSize: 13, fontWeight: 500,
              textDecoration: "none", padding: "7px 14px", borderRadius: 99, transition: "color 200ms",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(250,250,247,0.9)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(250,250,247,0.5)")}
            >{label}</a>
          ))}
          {user ? (
            <Link href="/challenge" style={{
              background: "linear-gradient(135deg, #0B0C0F 0%, #1e47eb 160%)",
              color: "#FAFAF7", fontSize: 13, fontWeight: 700,
              textDecoration: "none", padding: "8px 18px", borderRadius: 99,
              boxShadow: "0 4px 16px rgba(30,71,235,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}>Today&apos;s challenge →</Link>
          ) : (
            <>
              <Link href="/auth/sign-in" style={{
                color: "rgba(250,250,247,0.65)", fontSize: 13, fontWeight: 500,
                textDecoration: "none", padding: "7px 14px", borderRadius: 99,
                border: "1px solid rgba(255,255,255,0.12)", transition: "border-color 200ms, color 200ms",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(250,250,247,0.95)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(250,250,247,0.65)"; }}
              >Sign in</Link>
              <Link href="/auth/sign-up" style={{
                background: "linear-gradient(135deg, #0B0C0F 0%, #1e47eb 160%)",
                color: "#FAFAF7", fontSize: 13, fontWeight: 700,
                textDecoration: "none", padding: "8px 18px", borderRadius: 99,
                boxShadow: "0 4px 16px rgba(30,71,235,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}>Get started free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
