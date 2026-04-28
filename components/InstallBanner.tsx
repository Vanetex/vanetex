"use client";

import { useEffect, useRef, useState } from "react";

const DISMISSED_KEY = "vanetex-install-dismissed";

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);
  const promptRef = useRef<Event & { prompt: () => Promise<void> } | null>(null);

  useEffect(() => {
    // Already installed as standalone — don't show
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as { standalone?: boolean }).standalone;

    if (ios) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    // Android/Chrome — wait for the browser's install prompt
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      promptRef.current = e as Event & { prompt: () => Promise<void> };
      setShow(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  }

  async function handleInstall() {
    if (isIOS) {
      setShowIOSTip((v) => !v);
      return;
    }
    if (!promptRef.current) return;
    await promptRef.current.prompt();
    dismiss();
  }

  if (!show) return null;

  return (
    <div className="mt-4 rounded-2xl border border-black/8 bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base">📱</span>
          <p className="text-sm font-medium">Add Vanetex to your home screen</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper"
          >
            {isIOS ? "How?" : "Add"}
          </button>
          <button onClick={dismiss} className="text-muted hover:text-ink text-xs">✕</button>
        </div>
      </div>

      {/* iOS instruction tip */}
      {isIOS && showIOSTip && (
        <p className="mt-2 text-xs text-muted leading-relaxed">
          Tap the <span className="font-semibold text-ink">Share</span> button (□↑) in Safari, then tap <span className="font-semibold text-ink">Add to Home Screen</span>.
        </p>
      )}
    </div>
  );
}
