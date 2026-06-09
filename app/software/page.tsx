"use client";

import { useEffect } from "react";

export default function SoftwarePage() {
  useEffect(() => {
    // Redirect to the external Vanetex Software app
    window.location.href = "https://vanetex-software.vercel.app";
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#07080b", color: "#FAFAF7" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>Loading Vanetex Software...</h1>
        <p style={{ fontSize: 14, color: "rgba(250,250,247,0.5)" }}>Redirecting to Backtesting & Intelligence Terminal</p>
      </div>
    </div>
  );
}
