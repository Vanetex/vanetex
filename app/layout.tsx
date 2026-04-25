import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import ShellWrapper from "@/components/ShellWrapper";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vanetex.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Vanetex — Build Your Edge",
  description: "A daily investing scenario. Write your thesis. An AI analyst grades your reasoning. See what actually happened.",
  openGraph: {
    title: "Vanetex — Build Your Edge",
    description: "A daily investing scenario. Write your thesis. An AI analyst grades your reasoning. See what actually happened.",
    url: SITE_URL,
    siteName: "Vanetex",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vanetex — Build Your Edge",
    description: "A daily investing scenario. Write your thesis. An AI analyst grades your reasoning. See what actually happened.",
    site: "@vanetex",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ShellWrapper>{children}</ShellWrapper>
        <Analytics />
      </body>
    </html>
  );
}
