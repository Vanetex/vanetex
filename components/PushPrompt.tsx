"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "vanetex-push-dismissed";
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "denied">("idle");

  useEffect(() => {
    // Only show if: push is supported, permission not yet granted/denied, not dismissed
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      Notification.permission !== "default" ||
      localStorage.getItem(DISMISSED_KEY)
    ) return;
    // Slight delay so it doesn't compete with the XP toast
    const t = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(t);
  }, []);

  async function handleEnable() {
    setState("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setState("denied"); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(json),
      });

      setState("success");
      localStorage.setItem(DISMISSED_KEY, "1");
      setTimeout(() => setVisible(false), 2000);
    } catch {
      setState("idle");
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fade-in fixed bottom-24 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0d1117] p-4 shadow-2xl">
      {state === "success" ? (
        <div className="flex items-center gap-3">
          <span className="text-xl">🔔</span>
          <div>
            <p className="text-sm font-semibold text-white">You&apos;re all set</p>
            <p className="text-xs text-white/50">We&apos;ll remind you before your streak breaks.</p>
          </div>
        </div>
      ) : state === "denied" ? (
        <div className="flex items-center gap-3">
          <span className="text-xl">🔕</span>
          <p className="text-sm text-white/70">You can enable notifications in your browser settings any time.</p>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-xl">🔔</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Never miss a day</p>
              <p className="mt-0.5 text-xs text-white/50">
                Get a reminder before your streak breaks. No spam — one notification per day, only when you haven&apos;t played yet.
              </p>
            </div>
            <button onClick={handleDismiss} className="text-xs text-white/30 hover:text-white/60">✕</button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleEnable}
              disabled={state === "loading"}
              className="flex-1 rounded-full bg-accent py-2 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {state === "loading" ? "Enabling…" : "Enable reminders"}
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/60 transition hover:border-white/30"
            >
              Not now
            </button>
          </div>
        </>
      )}
    </div>
  );
}
