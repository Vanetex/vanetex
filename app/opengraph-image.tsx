import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Vanetex — Build Your Edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#07080b",
          position: "relative",
        }}
      >
        {/* Blue glow */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(30,71,235,0.35), transparent 65%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "linear-gradient(135deg, #1F6FEB, #0d3ba8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(30,71,235,0.5)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <polyline
              points="3,26 12,14 20,20 33,6"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#FAFAF7",
            letterSpacing: "-0.03em",
            marginBottom: 16,
          }}
        >
          Vanetex
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: "rgba(250,250,247,0.5)",
            letterSpacing: "-0.01em",
            marginBottom: 48,
          }}
        >
          Build Your Edge
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(250,250,247,0.35)",
            maxWidth: 640,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Daily investing scenarios · AI-graded reasoning · Real judgment
        </div>
      </div>
    ),
    { ...size },
  );
}
