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

// Runs synchronously before first paint — reads localStorage and applies
// theme CSS variables to prevent flash of the default theme.
const THEME_INIT_SCRIPT = `(function(){var t={default:{rgb:'31 111 235',bg:'#090b11',mid:'#0a0d13',deep:'#0b1119'},midnight:{rgb:'217 119 6',bg:'#000000',mid:'#040404',deep:'#070707'},forest:{rgb:'16 185 129',bg:'#071310',mid:'#091a14',deep:'#0b2119'},slate:{rgb:'139 92 246',bg:'#0d0f17',mid:'#10121b',deep:'#12141f'},crimson:{rgb:'220 38 38',bg:'#110a0a',mid:'#150c0c',deep:'#180d0d'},'rose-gold':{rgb:'236 72 153',bg:'#120d0f',mid:'#160f12',deep:'#1a1114'}};try{var id=localStorage.getItem('vanetex-theme')||'default';var v=t[id]||t.default;var r=document.documentElement;r.style.setProperty('--color-accent-rgb',v.rgb);r.style.setProperty('--color-bg',v.bg);r.style.setProperty('--color-bg-mid',v.mid);r.style.setProperty('--color-bg-deep',v.deep);}catch(e){}})();`;

// Registers the service worker after page load — non-blocking
const SW_REGISTER_SCRIPT = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`;


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SW_REGISTER_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        <ShellWrapper>{children}</ShellWrapper>
        <Analytics />
      </body>
    </html>
  );
}
