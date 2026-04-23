import "./globals.css";
import type { Metadata } from "next";
import ShellWrapper from "@/components/ShellWrapper";

export const metadata: Metadata = {
  title: "Vanetex — Build Real Investing Judgment",
  description: "A daily scenario. Write your thesis. An AI analyst grades your reasoning. See what actually happened.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ShellWrapper>{children}</ShellWrapper>
      </body>
    </html>
  );
}
