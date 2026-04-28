import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0C0F",
        paper: "#FAFAF7",
        accent: "rgb(var(--color-accent-rgb) / <alpha-value>)",
        success: "#16A34A",
        warn: "#D97706",
        danger: "#DC2626",
        muted: "#6B7280",
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
