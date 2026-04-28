import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export function GET(req: NextRequest) {
  const size = parseInt(req.nextUrl.searchParams.get("size") ?? "192", 10);
  const iconSize = Math.round(size * 0.56);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: "linear-gradient(135deg, #1F6FEB, #0d3ba8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 22 22">
          <path
            d="M 2 2 L 10 20 L 13 20 L 13 14 L 16 14 L 16 8 L 19 8 L 19 2"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
