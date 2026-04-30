/**
 * Simple profanity filter for display names.
 * Normalises the input (lowercase, leet-speak substitutions, strip spaces)
 * then checks against a blocklist of common profane words and slurs.
 */

const BLOCKED: string[] = [
  // Common profanity
  "fuck", "fucker", "fucking", "fck", "f uck",
  "shit", "shitt", "sh1t",
  "ass", "asses", "asshole", "arsehole",
  "bitch", "b1tch",
  "cunt", "c unt",
  "dick", "d1ck", "cock", "c0ck",
  "pussy", "puss",
  "bastard",
  "piss", "pissed",
  "whore", "wh0re",
  "slut", "sl ut",
  "damn", "dammit",
  "crap",
  "twat",
  "wanker", "wank",
  "bollocks",
  "jerk",
  "penis", "vagina", "anus",
  "porn", "p0rn",
  "sex", "sexy",
  "nude", "naked",
  "rape", "rapist",
  "molest",
  // Slurs — racial, homophobic, etc.
  "nigger", "nigga", "n1gger",
  "faggot", "fag", "f4g",
  "dyke",
  "tranny",
  "spic", "sp1c",
  "kike", "k1ke",
  "chink", "ch1nk",
  "wetback",
  "retard", "ret4rd",
  "nazi", "n4zi",
  "hitler", "h1tler",
  // Violence / threats
  "kill", "murder", "suicide",
  "bomb", "terrorist",
  // Admin impersonation
  "admin", "administrator", "moderator", "mod",
  "vanetex", "official", "support",
  "staff", "owner",
];

function normalise(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/6/g, "g")
    .replace(/7/g, "t")
    .replace(/8/g, "b")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/!/g, "i")
    .replace(/\+/g, "t");
}

export function containsProfanity(name: string): boolean {
  const norm = normalise(name);
  return BLOCKED.some((word) => norm.includes(word));
}

export function validateDisplayName(name: string): { ok: boolean; error?: string } {
  const trimmed = name.trim();

  if (!trimmed) return { ok: false, error: "Display name cannot be empty." };
  if (trimmed.length < 2) return { ok: false, error: "Display name must be at least 2 characters." };
  if (trimmed.length > 30) return { ok: false, error: "Display name must be 30 characters or fewer." };
  if (!/^[a-zA-Z0-9 _.\-]+$/.test(trimmed)) {
    return { ok: false, error: "Only letters, numbers, spaces, and _ . - are allowed." };
  }
  if (containsProfanity(trimmed)) {
    return { ok: false, error: "That display name isn't allowed. Please choose another." };
  }

  return { ok: true };
}
