import Link from "next/link";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center px-4 py-24">
      {/* Logo */}
      <Link href="/" className="absolute left-6 top-5 flex items-center gap-2.5 no-underline">
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: "linear-gradient(135deg,#3b82f6,#22d3ee)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 14px rgba(59,130,246,.45)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
            <path d="M 2 2 L 10 20 L 13 20 L 13 14 L 16 14 L 16 8 L 19 8 L 19 2" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontWeight: 200,
            fontSize: 13,
            letterSpacing: "0.38em",
            color: "#d0daf0",
            textTransform: "uppercase",
          }}
        >
          Vanetex
        </span>
      </Link>

      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
