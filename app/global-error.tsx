"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#07080b", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#ef4444", margin: 0 }}>Something went wrong</p>
          <p style={{ fontSize: 12, color: "rgba(250,250,247,0.4)", marginTop: 4 }}>{error.message || "An unexpected error occurred."}</p>
          <button
            onClick={reset}
            style={{ marginTop: 16, padding: "8px 20px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(250,250,247,0.7)", fontSize: 13, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
