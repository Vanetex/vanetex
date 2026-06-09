"use client";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // Load the standalone HTML
    fetch("/index.html")
      .then(r => r.text())
      .then(html => {
        document.documentElement.innerHTML = html;
      });
  }, []);

  return null;
}
