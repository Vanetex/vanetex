import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Vanetex",
  description: "Privacy Policy for the Vanetex investing training platform.",
};

export default function PrivacyPage() {
  return (
    <div style={{ background: "#07080b", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontSize: 15, fontWeight: 700, color: "#FAFAF7", textDecoration: "none", letterSpacing: "-0.01em" }}>
            Vanetex
          </Link>
          <Link href="/" style={{ fontSize: 13, color: "rgba(250,250,247,0.45)", textDecoration: "none" }}>
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 96px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#1e47eb", marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: "#FAFAF7", letterSpacing: "-0.025em", marginBottom: 8 }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: "rgba(250,250,247,0.4)", marginBottom: 48 }}>
          Last updated: April 2026
        </p>

        <div style={{ color: "rgba(250,250,247,0.75)", lineHeight: 1.75, fontSize: 15 }}>
          <p style={{ marginBottom: 40 }}>
            This Privacy Policy explains what information Vanetex collects, how we use it, and the choices you have. We built Vanetex for learners and take your privacy seriously. We collect only what we need to run the service.
          </p>

          <Section title="1. Information We Collect">
            <Subsection title="Account Information">
              When you create an account, we collect your email address, a display name, and optionally your date of birth. If you sign in with Google, we receive your name and email from Google.
            </Subsection>
            <Subsection title="Activity Data">
              We store the decisions you make on daily challenges (your chosen action, confidence level, and written reasoning), the AI evaluation of each decision, outcome results, and any journal reflections you write. This is the core data that powers your progress tracking and leaderboard ranking.
            </Subsection>
            <Subsection title="Learning Progress">
              We record which lessons and tracks you have completed, your practice quiz scores, and your application problem results.
            </Subsection>
            <Subsection title="Paper Trading Activity">
              We store your virtual portfolio holdings, trade history, and cash balance. All paper trading uses fictional money — no real financial transactions occur.
            </Subsection>
            <Subsection title="Usage Information">
              We may collect basic usage data such as pages visited and features used to understand how the product is being used and where to improve it. We do not sell this data.
            </Subsection>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Operate and provide the Service, including storing your decisions, progress, and portfolio</li>
              <li style={{ marginBottom: 6 }}>Calculate and display your skill score, accuracy, leaderboard ranking, and achievements</li>
              <li style={{ marginBottom: 6 }}>Send streak reminder emails if you have an active streak and haven&apos;t completed today&apos;s challenge</li>
              <li style={{ marginBottom: 6 }}>Respond to support requests</li>
              <li style={{ marginBottom: 6 }}>Improve and develop the Service</li>
            </ul>
            <p>We do not use your data for advertising. We do not sell your personal information to third parties.</p>
          </Section>

          <Section title="3. Information Shared with Third Parties">
            <p>We share limited data with the following services to operate Vanetex:</p>

            <Subsection title="Supabase">
              Our database and authentication provider. Your account information, decisions, progress, and paper trading data are stored in Supabase&apos;s infrastructure. Supabase is SOC 2 compliant.{" "}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#1e47eb" }}>Supabase Privacy Policy</a>
            </Subsection>

            <Subsection title="Anthropic / OpenAI">
              When you submit a decision, your written reasoning text is sent to Anthropic (and OpenAI as a fallback) to generate an AI evaluation. We do not send your name, email, or account details to these providers — only the anonymized reasoning text and scenario context.{" "}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#1e47eb" }}>Anthropic Privacy Policy</a>
            </Subsection>

            <Subsection title="Finnhub">
              We use Finnhub to fetch real-time stock price data for the paper trading simulator. Finnhub receives search queries and ticker symbols only — no personal information is shared.{" "}
              <a href="https://finnhub.io/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#1e47eb" }}>Finnhub Privacy Policy</a>
            </Subsection>

            <Subsection title="Resend">
              We use Resend to send transactional emails, including streak reminders. Resend receives your email address and the content of emails we send to you.{" "}
              <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#1e47eb" }}>Resend Privacy Policy</a>
            </Subsection>

            <Subsection title="Google">
              If you choose to sign in with Google, Google shares your name and email address with us. Your use of Google Sign-In is subject to Google&apos;s privacy policy.{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#1e47eb" }}>Google Privacy Policy</a>
            </Subsection>

            <p>We may also disclose information if required by law, court order, or to protect the rights and safety of our users or the public.</p>
          </Section>

          <Section title="4. Children's Privacy">
            <Callout>
              Vanetex is intended for users 13 and older. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, please contact us at <a href="mailto:vanetexinvestingapp@gmail.com" style={{ color: "#1e47eb" }}>vanetexinvestingapp@gmail.com</a> and we will delete the account and all associated data promptly.
            </Callout>
            <p>If you are between 13 and 18, please review this policy with a parent or guardian before using the Service.</p>
          </Section>

          <Section title="5. Data Retention">
            <p>We retain your account information and activity data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain it longer.</p>
            <p>Anonymized, aggregated data (such as overall platform statistics) may be retained indefinitely.</p>
          </Section>

          <Section title="6. Your Rights and Choices">
            <Subsection title="Access and Correction">
              You can view and update your display name and email address in the Settings page.
            </Subsection>
            <Subsection title="Account Deletion">
              You can delete your account from the Settings page. This will permanently delete your profile, decisions, journal entries, lesson progress, and paper trading history.
            </Subsection>
            <Subsection title="Email Preferences">
              Streak reminder emails include an unsubscribe option. You can also contact us at <a href="mailto:vanetexinvestingapp@gmail.com" style={{ color: "#1e47eb" }}>vanetexinvestingapp@gmail.com</a> to opt out of any email communications.
            </Subsection>
            <Subsection title="Data Export">
              To request a copy of your data, email <a href="mailto:vanetexinvestingapp@gmail.com" style={{ color: "#1e47eb" }}>vanetexinvestingapp@gmail.com</a>. We will respond within 30 days.
            </Subsection>
          </Section>

          <Section title="7. Security">
            <p>We use industry-standard measures to protect your information, including encrypted connections (HTTPS), row-level security on our database so users can only access their own data, and secure authentication provided by Supabase.</p>
            <p>No method of transmission over the internet is 100% secure. While we work hard to protect your data, we cannot guarantee absolute security.</p>
          </Section>

          <Section title="8. Cookies and Local Storage">
            <p>Vanetex uses browser session storage to cache your data locally so pages load faster between navigation. This data mirrors what is stored in our database and is cleared when your browser session ends. We do not use third-party advertising cookies.</p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. If we make material changes, we will update the &ldquo;Last updated&rdquo; date at the top of this page and notify you by email where appropriate. Your continued use of the Service after changes are posted constitutes acceptance of the revised policy.</p>
          </Section>

          <Section title="10. Contact">
            <p>If you have questions, concerns, or requests related to your privacy, please contact us at <a href="mailto:vanetexinvestingapp@gmail.com" style={{ color: "#1e47eb" }}>vanetexinvestingapp@gmail.com</a>.</p>
          </Section>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ fontSize: 12, color: "rgba(250,250,247,0.35)", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms" style={{ fontSize: 12, color: "rgba(250,250,247,0.35)", textDecoration: "none" }}>Terms of Service</Link>
          <a href="mailto:vanetexinvestingapp@gmail.com" style={{ fontSize: 12, color: "rgba(250,250,247,0.35)", textDecoration: "none" }}>vanetexinvestingapp@gmail.com</a>
        </div>
        <p style={{ fontSize: 12, color: "rgba(250,250,247,0.2)", marginTop: 12 }}>© {new Date().getFullYear()} Vanetex. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#FAFAF7", marginBottom: 12, letterSpacing: "-0.01em" }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontWeight: 600, color: "rgba(250,250,247,0.9)", marginBottom: 4 }}>{title}</p>
      <p>{children}</p>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(30,71,235,0.08)", border: "1px solid rgba(30,71,235,0.22)", borderRadius: 12, padding: "14px 16px", color: "rgba(250,250,247,0.85)" }}>
      {children}
    </div>
  );
}
