"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CAREER_FIELDS, type CareerField } from "@/lib/types";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");

  const [profileSaving, setProfileSaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [resettingPaper, setResettingPaper] = useState(false);

  const [careerField, setCareerField] = useState<CareerField | null>(null);
  const [careerSaving, setCareerSaving] = useState(false);

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [paperMessage, setPaperMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated.");
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");
      setNewEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, career_field")
        .eq("id", user.id)
        .maybeSingle();

      const name = profile?.display_name ?? "";
      const cf = (profile as { career_field?: string | null } | null)?.career_field;
      if (cf) setCareerField(cf as CareerField);
      setDisplayName(name);
      setNewDisplayName(name);
      setLoading(false);
    }

    load();
  }, [supabase]);

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    setError(null);

    const trimmed = newDisplayName.trim();
    if (!trimmed) {
      setError("Username cannot be empty.");
      return;
    }

    setProfileSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfileSaving(false);
      setError("Not authenticated.");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", user.id);

    if (profileError) {
      setProfileSaving(false);
      setError(profileError.message);
      return;
    }

    await supabase.auth.updateUser({
      data: { display_name: trimmed },
    });

    setDisplayName(trimmed);
    setProfileMessage("Username updated.");
    setProfileSaving(false);
  }

  async function handleEmailSave(e: FormEvent) {
    e.preventDefault();
    setEmailMessage(null);
    setError(null);

    const trimmed = newEmail.trim();
    if (!trimmed) {
      setError("Email cannot be empty.");
      return;
    }

    if (trimmed.toLowerCase() === email.toLowerCase()) {
      setEmailMessage("Email is unchanged.");
      return;
    }

    setEmailSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({
      email: trimmed,
    });

    if (updateError) {
      setEmailSaving(false);
      setError(updateError.message);
      return;
    }

    setEmailMessage(
      "Email change requested. Check your inbox to confirm the new address.",
    );
    setEmailSaving(false);
  }

  async function handleCareerField(field: CareerField) {
    setCareerSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCareerSaving(false); return; }
    await supabase.from("profiles").update({ career_field: field }).eq("id", user.id);
    setCareerField(field);
    setCareerSaving(false);
  }

  async function handleDeleteAccount() {
    const input = window.prompt(
      'Type DELETE to permanently remove your account, all decisions, progress, and paper trading history. This cannot be undone.',
    );
    if (input !== "DELETE") return;

    setDeletingAccount(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = (await res.json()) as { error?: string; success?: boolean };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not delete account.");
        setDeletingAccount(false);
        return;
      }
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      setError("Network error while deleting account.");
      setDeletingAccount(false);
    }
  }

  async function handlePaperReset() {
    setPaperMessage(null);
    setError(null);

    const confirmed = window.confirm(
      "Reset your paper account to $10,000 and clear all paper trades/positions?",
    );
    if (!confirmed) return;

    setResettingPaper(true);
    try {
      const res = await fetch("/api/trade/reset", { method: "POST" });
      const data = (await res.json()) as { error?: string; success?: boolean };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Could not reset paper account.");
      } else {
        setPaperMessage("Paper account reset to $10,000.");
      }
    } catch {
      setError("Network error while resetting paper account.");
    } finally {
      setResettingPaper(false);
    }
  }

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Profile & Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your account identity and paper trading environment.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-28 rounded-2xl bg-black/5" />
          <div className="h-28 rounded-2xl bg-black/5" />
          <div className="h-24 rounded-2xl bg-black/5" />
        </div>
      ) : (
        <>
          <div className="surface-card rounded-3xl p-5">
            <h2 className="text-base font-semibold">Account details</h2>
            <p className="mt-1 text-xs text-muted">Current email and username.</p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <InfoCell label="Email" value={email || "Not set"} />
              <InfoCell label="Username" value={displayName || "Not set"} />
            </div>
          </div>

          <form
            onSubmit={handleProfileSave}
            className="surface-card rounded-3xl p-5"
          >
            <h2 className="text-base font-semibold">Change username</h2>
            <p className="mt-1 text-xs text-muted">
              Updates your public display name in your profile.
            </p>

            <label htmlFor="username" className="mt-4 block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              maxLength={60}
              className="field-focus mt-1 w-full rounded-xl border border-black/10 bg-white/95 px-3 py-2 text-sm outline-none"
            />

            {profileMessage && (
              <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                {profileMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="cta-primary mt-4 rounded-full px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-45"
            >
              {profileSaving ? "Saving..." : "Save username"}
            </button>
          </form>

          <form onSubmit={handleEmailSave} className="surface-card rounded-3xl p-5">
            <h2 className="text-base font-semibold">Change account email</h2>
            <p className="mt-1 text-xs text-muted">
              Supabase will send a confirmation email to the new address.
            </p>

            <label htmlFor="email" className="mt-4 block text-sm font-medium">
              New email
            </label>
            <input
              id="email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="field-focus mt-1 w-full rounded-xl border border-black/10 bg-white/95 px-3 py-2 text-sm outline-none"
            />

            {emailMessage && (
              <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                {emailMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={emailSaving}
              className="cta-primary mt-4 rounded-full px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-45"
            >
              {emailSaving ? "Requesting..." : "Request email change"}
            </button>
          </form>

          <div className="surface-card rounded-3xl p-5">
            <h2 className="text-base font-semibold">Career focus</h2>
            <p className="mt-1 text-xs text-muted">
              Select your target career path. Lessons relevant to your field will be highlighted in the Learn section.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CAREER_FIELDS.map((f) => {
                const active = careerField === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    disabled={careerSaving}
                    onClick={() => handleCareerField(f.id)}
                    title={f.description}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
                      active
                        ? "bg-accent text-paper"
                        : "border border-black/10 bg-white text-ink hover:border-accent/40 hover:text-accent"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            {careerField && (
              <p className="mt-3 text-xs text-muted">
                Saved: <span className="font-medium text-ink">{CAREER_FIELDS.find((f) => f.id === careerField)?.label}</span>
              </p>
            )}
          </div>

          <div className="surface-card rounded-3xl p-5">
            <h2 className="text-base font-semibold">Legal</h2>
            <p className="mt-1 text-xs text-muted">
              Terms, privacy, and contact information.
            </p>
            <div className="mt-4 space-y-2">
              <Link
                href="/terms"
                className="flex items-center justify-between rounded-xl border border-black/8 bg-white px-4 py-3 text-sm font-medium transition hover:border-black/15"
              >
                Terms of Service
                <span className="text-muted">→</span>
              </Link>
              <Link
                href="/privacy"
                className="flex items-center justify-between rounded-xl border border-black/8 bg-white px-4 py-3 text-sm font-medium transition hover:border-black/15"
              >
                Privacy Policy
                <span className="text-muted">→</span>
              </Link>
              <a
                href="mailto:vanetexinvestingapp@gmail.com"
                className="flex items-center justify-between rounded-xl border border-black/8 bg-white px-4 py-3 text-sm font-medium transition hover:border-black/15"
              >
                vanetexinvestingapp@gmail.com
                <span className="text-muted">→</span>
              </a>
            </div>
          </div>

          <div className="surface-card rounded-3xl p-5">
            <h2 className="text-base font-semibold">Paper trading controls</h2>
            <p className="mt-1 text-xs text-muted">
              Reset paper portfolio cash to $10,000 and clear all paper trades.
            </p>

            {paperMessage && (
              <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                {paperMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handlePaperReset}
              disabled={resettingPaper}
              className="mt-4 rounded-full border border-danger/40 bg-danger/10 px-5 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/15 disabled:opacity-45"
            >
              {resettingPaper ? "Resetting..." : "Reset paper account"}
            </button>
          </div>

          <div className="surface-card rounded-3xl p-5">
            <h2 className="text-base font-semibold">Delete account</h2>
            <p className="mt-1 text-xs text-muted">
              Permanently removes your account, all decisions, journal entries, progress, and paper trading history. This cannot be undone.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="mt-4 rounded-full border border-danger/40 bg-danger/10 px-5 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/15 disabled:opacity-45"
            >
              {deletingAccount ? "Deleting account..." : "Delete my account"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-soft rounded-xl px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
