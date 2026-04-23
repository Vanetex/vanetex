"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const links = [
  { href: "/", label: "Home" },
  { href: "/tracks", label: "Learn" },
  { href: "/challenge", label: "Today" },
  { href: "/trade", label: "Trade" },
  { href: "/journal", label: "Journal" },
  { href: "/progress", label: "Progress" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const primaryLinks = links.slice(1);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
      <nav className="surface-card m-4 mb-0 rounded-2xl p-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-semibold tracking-tight text-ink">
            AI Investing Trainer
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="rounded-full border border-black/10 bg-white p-1.5 text-muted transition hover:border-black/20 hover:text-ink"
              aria-label="Settings"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            {user ? (
              <button
                onClick={handleSignOut}
                className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-muted transition hover:border-black/20 hover:text-ink"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/sign-in"
                className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white shadow-md shadow-accent/30 transition hover:bg-accent/90"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
        <ul className="mt-3 flex gap-1 overflow-x-auto pb-1 text-sm">
          {primaryLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={
                    "whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition " +
                    (active
                      ? "bg-ink text-paper shadow-md shadow-ink/15"
                      : "bg-white text-muted hover:text-ink")
                  }
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:block md:w-72 md:p-4">
        <div className="h-full rounded-[28px] border border-white/15 bg-white/[0.08] p-3 shadow-2xl shadow-black/35">
          <div className="surface-card flex h-full flex-col rounded-3xl p-4">
          <Link href="/" className="block text-base font-semibold tracking-tight text-ink">
            AI Investing Trainer
          </Link>
          <p className="mt-1 text-xs text-muted">Build judgment with daily reps.</p>

          <ul className="mt-5 space-y-1.5">
            {primaryLinks.map((l) => {
              const active = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={
                      "group relative block rounded-xl px-3 py-2 text-sm font-medium transition " +
                      (active
                        ? "bg-ink text-paper shadow-md shadow-ink/20"
                        : "text-muted hover:bg-black/[0.04] hover:text-ink")
                    }
                  >
                    {active && (
                      <span className="absolute left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent" />
                    )}
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/5 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">Live Mode</div>
            <p className="mt-1 text-xs text-muted">Daily challenge and paper trading updates in one workspace.</p>
          </div>

          <div className="mt-auto border-t border-black/10 pt-4 space-y-2">
            <Link
              href="/settings"
              className={
                "group relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition " +
                (pathname === "/settings"
                  ? "bg-ink text-paper shadow-md shadow-ink/20"
                  : "text-muted hover:bg-black/[0.04] hover:text-ink")
              }
            >
              {pathname === "/settings" && (
                <span className="absolute left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-accent" />
              )}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-muted transition hover:border-black/20 hover:text-ink"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/auth/sign-in"
                className="block w-full rounded-xl bg-accent px-3 py-2 text-center text-sm font-medium text-white shadow-md shadow-accent/30 transition hover:bg-accent/90"
              >
                Sign in
              </Link>
            )}
          </div>
          </div>
        </div>
      </aside>
    </>
  );
}
