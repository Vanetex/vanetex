"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// ─── Nav links ────────────────────────────────────────────────────────────────

const links = [
  { href: "/challenge",   label: "Today",       accent: "#1F6FEB", Icon: IconToday       },
  { href: "/tracks",      label: "Learn",       accent: "#8B5CF6", Icon: IconLearn       },
  { href: "/trade",       label: "Trade",       accent: "#16A34A", Icon: IconTrade       },
  { href: "/journal",     label: "Journal",     accent: "#D97706", Icon: IconJournal     },
  { href: "/progress",    label: "Progress",    accent: "#0EA5E9", Icon: IconProgress    },
  { href: "/leaderboard", label: "Leaderboard", accent: "#EC4899", Icon: IconLeaderboard },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconToday({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="3.5" width="15" height="14" rx="3.5" stroke={color} strokeWidth="1.5" />
      <path d="M2.5 8h15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 1.5v3M13 1.5v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="13" r="1.5" fill={color} />
    </svg>
  );
}
function IconLearn({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 3L2 7l8 4 8-4-8-4z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2 7v5M18 7v5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.5 9.5v4a4.5 4.5 0 009 0v-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconTrade({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <polyline points="2,15 7,9 11,12 18,4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 4h-5M18 4v5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 18h16" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconJournal({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="4" y="2" width="12" height="16" rx="2.5" stroke={color} strokeWidth="1.5" />
      <path d="M7 7h6M7 10.5h6M7 14h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="2" y="5" width="2.5" height="10" rx="1.25" fill={color} opacity=".5" />
    </svg>
  );
}
function IconProgress({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.5" />
      <path d="M10 6.5v3.5l2.5 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 2v1M10 17v1M2 10H1M19 10h-1" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IconLeaderboard({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="1.5" y="11" width="4" height="7" rx="1.5" stroke={color} strokeWidth="1.5" />
      <rect x="8"   y="7"  width="4" height="11" rx="1.5" stroke={color} strokeWidth="1.5" />
      <rect x="14.5" y="3" width="4" height="15" rx="1.5" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
function IconSettings({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke={color} strokeWidth="1.5" />
      <path
        d="M10 2v2M10 16v2M2 10H0.5M19.5 10H18M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"
        stroke={color} strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Logo mark ────────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <div
      style={{
        width: 30, height: 30, borderRadius: 9, flexShrink: 0,
        background: "linear-gradient(135deg, #1F6FEB, #0d3ba8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 14px rgba(31,111,235,0.45)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <polyline points="1,10 5,5 8,8 13,2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

function DesktopSidebar({
  pathname,
  user,
  onSignOut,
}: {
  pathname: string;
  user: User | null;
  onSignOut: () => void;
}) {
  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-72 md:flex-col md:p-4">
      {/* Outer glass shell */}
      <div
        style={{
          flex: 1,
          borderRadius: 28,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)",
          padding: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Scan line */}
        <div
          aria-hidden
          style={{
            position: "absolute", left: 0, right: 0, height: 120,
            background: "linear-gradient(180deg, transparent, rgba(31,111,235,0.04), transparent)",
            animation: "nav-scan 6s linear infinite",
            pointerEvents: "none", zIndex: 0,
          }}
        />

        {/* Inner panel */}
        <div
          style={{
            height: "100%",
            borderRadius: 24,
            background: "rgba(8,11,20,0.82)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            padding: "20px 12px",
            position: "relative",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          {/* Corner glow */}
          <div
            aria-hidden
            style={{
              position: "absolute", top: -60, left: -60,
              width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(31,111,235,0.14), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Logo */}
          <div
            style={{
              padding: "4px 8px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 16,
            }}
          >
            <Link href="/" className="flex items-center gap-2.5 mb-0.5">
              <LogoMark />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#FAFAF7", letterSpacing: "-0.02em" }}>
                Vanetex
              </span>
            </Link>
            <p style={{ fontSize: 10, color: "rgba(250,250,247,0.3)", paddingLeft: 39 }}>
              Build Your Edge
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex-1">
            <p
              style={{
                fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "rgba(250,250,247,0.25)",
                marginBottom: 8, paddingLeft: 8,
              }}
            >
              Navigation
            </p>
            <ul className="flex flex-col gap-0.5">
              {links.map(({ href, label, accent, Icon }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className="nav-sidebar-item"
                      data-active={isActive}
                      style={{
                        display: "flex", alignItems: "center", gap: 11,
                        padding: "9px 12px", borderRadius: 14,
                        position: "relative", transition: "background 180ms ease",
                        background: isActive
                          ? `linear-gradient(90deg, ${accent}1a, ${accent}0d)`
                          : "transparent",
                        textDecoration: "none",
                      }}
                    >
                      {/* Active bar */}
                      {isActive && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute", left: 0, top: "50%",
                            transform: "translateY(-50%)",
                            width: 3, height: 22, borderRadius: 99,
                            background: accent,
                            boxShadow: `0 0 10px ${accent}, 0 0 20px ${accent}66`,
                          }}
                        />
                      )}

                      {/* Icon box */}
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: isActive ? `${accent}20` : "rgba(255,255,255,0.05)",
                          border: `1px solid ${isActive ? `${accent}35` : "rgba(255,255,255,0.07)"}`,
                          transition: "all 180ms",
                          boxShadow: isActive ? `0 0 14px ${accent}40` : "none",
                        }}
                      >
                        <Icon color={isActive ? accent : "rgba(250,250,247,0.4)"} size={16} />
                      </div>

                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "#FAFAF7" : "rgba(250,250,247,0.45)",
                          letterSpacing: "-0.01em",
                          transition: "color 180ms",
                        }}
                      >
                        {label}
                      </span>

                      {/* Active pulse dot */}
                      {isActive && (
                        <span
                          aria-hidden
                          style={{
                            marginLeft: "auto",
                            width: 5, height: 5, borderRadius: "50%",
                            background: accent,
                            boxShadow: `0 0 8px ${accent}`,
                            animation: "nav-pulse 2s ease infinite",
                          }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Live mode badge */}
          <div
            style={{
              margin: "12px 0",
              background: "linear-gradient(135deg, rgba(31,111,235,0.12), rgba(139,92,246,0.07))",
              border: "1px solid rgba(31,111,235,0.2)",
              borderRadius: 14, padding: "10px 14px",
              boxShadow: "0 0 24px rgba(31,111,235,0.08)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                aria-hidden
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#1F6FEB", boxShadow: "0 0 8px #1F6FEB",
                  animation: "nav-pulse 1.8s ease infinite",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#1F6FEB",
                }}
              >
                Live Mode
              </span>
            </div>
            <p style={{ fontSize: 10, color: "rgba(250,250,247,0.35)", lineHeight: 1.5 }}>
              Daily challenge + paper trading
            </p>
          </div>

          {/* Footer: settings + user */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
            <Link
              href="/settings"
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "9px 12px", borderRadius: 14,
                position: "relative", transition: "background 180ms",
                background: pathname === "/settings" ? "rgba(100,116,139,0.15)" : "transparent",
                textDecoration: "none", marginBottom: 8,
              }}
            >
              {pathname === "/settings" && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute", left: 0, top: "50%",
                    transform: "translateY(-50%)",
                    width: 3, height: 22, borderRadius: 99,
                    background: "#64748B", boxShadow: "0 0 10px #64748B",
                  }}
                />
              )}
              <div
                style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: pathname === "/settings" ? "rgba(100,116,139,0.2)" : "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <IconSettings
                  color={pathname === "/settings" ? "#94A3B8" : "rgba(250,250,247,0.35)"}
                  size={16}
                />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: pathname === "/settings" ? 700 : 500,
                  color: pathname === "/settings" ? "#FAFAF7" : "rgba(250,250,247,0.4)",
                }}
              >
                Settings
              </span>
            </Link>

            {/* User row */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  background: "linear-gradient(135deg, #1F6FEB, #8B5CF6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: "#fff",
                }}
              >
                {user?.email?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontSize: 12, fontWeight: 600, color: "#FAFAF7",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  {user?.email ?? "Not signed in"}
                </p>
                {user ? (
                  <button
                    onClick={onSignOut}
                    style={{
                      fontSize: 9, color: "rgba(250,250,247,0.35)",
                      background: "none", border: "none", padding: 0,
                      cursor: "pointer", transition: "color 150ms",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#DC2626")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(250,250,247,0.35)")}
                  >
                    Sign out
                  </button>
                ) : (
                  <Link href="/auth/sign-in" style={{ fontSize: 9, color: "#1F6FEB", textDecoration: "none" }}>
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Mobile bottom bar ────────────────────────────────────────────────────────

const mobileLinks = [...links.slice(0, 5), { href: "/settings", label: "Settings", accent: "#64748B", Icon: IconSettings }];

function MobileBottomBar({ pathname }: { pathname: string }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pt-2"
      style={{ pointerEvents: "none", paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div
        style={{
          display: "flex", gap: 2, pointerEvents: "all",
          background: "rgba(8,11,20,0.88)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 30, padding: 5,
          boxShadow: "0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {mobileLinks.map(({ href, label, accent, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: isActive ? "7px 16px" : "7px 11px",
                borderRadius: 25,
                background: isActive ? `linear-gradient(135deg, ${accent}22, ${accent}10)` : "transparent",
                border: `1px solid ${isActive ? `${accent}38` : "transparent"}`,
                transition: "all 220ms cubic-bezier(0.22,1,0.36,1)",
                textDecoration: "none",
                boxShadow: isActive ? `inset 0 0 20px ${accent}10, 0 0 16px ${accent}28` : "none",
              }}
            >
              <Icon color={isActive ? accent : "rgba(250,250,247,0.32)"} size={20} />
              {isActive && (
                <span
                  style={{
                    fontSize: 9, fontWeight: 700, color: accent,
                    letterSpacing: "0.03em", whiteSpace: "nowrap",
                    animation: "nav-fade-up 200ms ease both",
                  }}
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <DesktopSidebar pathname={pathname} user={user} onSignOut={handleSignOut} />
      <MobileBottomBar pathname={pathname} />
    </>
  );
}
