export type ThemeId =
  | "default"
  | "midnight"
  | "forest"
  | "slate"
  | "crimson"
  | "rose-gold";

export interface Theme {
  id: ThemeId;
  name: string;
  free: boolean;
  /** Space-separated RGB values — used for Tailwind opacity utilities */
  accentRgb: string;
  /** Hex accent for inline styles and swatches */
  accentHex: string;
  /** Base background color */
  bg: string;
  /** Mid-scroll background */
  bgMid: string;
  /** Deep background (bottom overscroll) */
  bgDeep: string;
}

export const THEMES: Theme[] = [
  {
    id: "default",
    name: "Default",
    free: true,
    accentRgb: "31 111 235",
    accentHex: "#1F6FEB",
    bg: "#090b11",
    bgMid: "#0a0d13",
    bgDeep: "#0b1119",
  },
  {
    id: "midnight",
    name: "Midnight",
    free: true,
    accentRgb: "217 119 6",
    accentHex: "#D97706",
    bg: "#000000",
    bgMid: "#040404",
    bgDeep: "#070707",
  },
  {
    id: "forest",
    name: "Forest",
    free: false,
    accentRgb: "16 185 129",
    accentHex: "#10B981",
    bg: "#071310",
    bgMid: "#091a14",
    bgDeep: "#0b2119",
  },
  {
    id: "slate",
    name: "Slate",
    free: false,
    accentRgb: "139 92 246",
    accentHex: "#8B5CF6",
    bg: "#0d0f17",
    bgMid: "#10121b",
    bgDeep: "#12141f",
  },
  {
    id: "crimson",
    name: "Crimson",
    free: false,
    accentRgb: "220 38 38",
    accentHex: "#DC2626",
    bg: "#110a0a",
    bgMid: "#150c0c",
    bgDeep: "#180d0d",
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    free: false,
    accentRgb: "236 72 153",
    accentHex: "#EC4899",
    bg: "#120d0f",
    bgMid: "#160f12",
    bgDeep: "#1a1114",
  },
];

export function applyTheme(id: ThemeId): void {
  const theme = THEMES.find((t) => t.id === id);
  if (!theme) return;
  const r = document.documentElement;
  r.style.setProperty("--color-accent-rgb", theme.accentRgb);
  r.style.setProperty("--color-bg", theme.bg);
  r.style.setProperty("--color-bg-mid", theme.bgMid);
  r.style.setProperty("--color-bg-deep", theme.bgDeep);
  try { localStorage.setItem("vanetex-theme", id); } catch { /* */ }
}

export const THEME_STORAGE_KEY = "vanetex-theme";
