import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Vanetex",
  description: "Terms of Service for the Vanetex investing training platform.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ fontSize: 13, color: "rgba(250,250,247,0.4)", marginBottom: 48 }}>
          Last updated: April 2026
        </p>

        <div style={{ color: "rgba(250,250,247,0.75)", lineHeight: 1.75, fontSize: 15 }}>
          <Section title="1. Agreement to Terms">
            <p>By accessing or using Vanetex (&ldquo;the Service,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
            <p>These terms apply to all visitors, users, and anyone who accesses the Service.</p>
          </Section>

          <Section title="2. Eligibility">
            <p>You must be at least 13 years old to use Vanetex. By using the Service, you represent and warrant that you meet this age requirement.</p>
            <p>If you are between 13 and 18 years old, you represent that your parent or legal guardian has reviewed and agreed to these terms on your behalf.</p>
            <p>Users under 13 are not permitted to create accounts or use the Service. If we become aware that a user is under 13, we will promptly delete their account and any associated data.</p>
          </Section>

          <Section title="3. Not Financial Advice">
            <Callout>
              Vanetex is an educational training tool only. Nothing on this platform constitutes financial advice, investment advice, trading advice, or any other kind of advice. We are not a registered investment adviser, broker-dealer, or financial planner.
            </Callout>
            <p>All scenarios, metrics, company names, tickers, and outcomes presented on Vanetex are fictional and created solely for educational purposes. They do not represent real companies, real securities, or real market events.</p>
            <p>Paper trading on Vanetex uses virtual money only. No real money is involved. Past performance within the simulator has no bearing on real-world investment results.</p>
            <p>You should not make real investment decisions based on anything you read, learn, or experience on Vanetex. Always consult a qualified financial professional before making real investment decisions.</p>
          </Section>

          <Section title="4. User Accounts">
            <p>To access most features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
            <p>You agree to provide accurate and complete information when creating your account. You may not impersonate any person or entity or use a name you are not authorized to use.</p>
            <p>You must notify us immediately at <a href="mailto:vanetexinvestingapp@gmail.com" style={{ color: "#1e47eb" }}>vanetexinvestingapp@gmail.com</a> if you suspect unauthorized use of your account.</p>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Attempt to reverse-engineer, scrape, or automate interactions with the Service</li>
              <li style={{ marginBottom: 6 }}>Use the Service to harass, abuse, or harm others</li>
              <li style={{ marginBottom: 6 }}>Submit false, misleading, or harmful content</li>
              <li style={{ marginBottom: 6 }}>Attempt to gain unauthorized access to any part of the Service or its infrastructure</li>
              <li style={{ marginBottom: 6 }}>Use the Service for any unlawful purpose or in violation of any applicable laws or regulations</li>
              <li style={{ marginBottom: 6 }}>Share your account with others or create multiple accounts to gain unfair advantages on the leaderboard</li>
            </ul>
          </Section>

          <Section title="6. Content You Submit">
            <p>The Service allows you to submit written reasoning, journal entries, and reflections (&ldquo;User Content&rdquo;). You retain ownership of your User Content.</p>
            <p>By submitting User Content, you grant Vanetex a limited, non-exclusive license to store and process that content solely for the purpose of providing and improving the Service. We do not sell your User Content.</p>
            <p>You are responsible for ensuring your User Content does not violate any third-party rights or applicable laws.</p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>The Service and its original content, features, and functionality — including but not limited to the scenario library, lesson content, AI evaluation system, and interface design — are owned by Vanetex and protected by applicable intellectual property laws.</p>
            <p>You may not copy, reproduce, distribute, or create derivative works from any part of the Service without our prior written permission.</p>
          </Section>

          <Section title="8. Third-Party Services">
            <p>Vanetex uses third-party services to operate, including but not limited to:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li style={{ marginBottom: 6 }}>Supabase for authentication and data storage</li>
              <li style={{ marginBottom: 6 }}>Anthropic and OpenAI for AI-powered evaluation of your reasoning</li>
              <li style={{ marginBottom: 6 }}>Finnhub for financial market data used in paper trading</li>
              <li style={{ marginBottom: 6 }}>Google for OAuth sign-in</li>
              <li style={{ marginBottom: 6 }}>Resend for transactional email</li>
            </ul>
            <p>Your use of the Service is also subject to the terms of these third-party providers. We are not responsible for the practices or content of third-party services.</p>
          </Section>

          <Section title="9. Disclaimers">
            <p>The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
            <p>We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. We do not warrant the accuracy, completeness, or usefulness of any information provided through the Service.</p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>To the fullest extent permitted by law, Vanetex and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including but not limited to loss of profits, data, or goodwill — arising from your use of or inability to use the Service.</p>
            <p>Our total liability to you for any claims arising from the Service shall not exceed the greater of $100 or the amount you paid us in the 12 months preceding the claim.</p>
          </Section>

          <Section title="11. Termination">
            <p>We may suspend or terminate your account at any time, with or without notice, for conduct that we determine violates these Terms or is harmful to other users, the Service, or third parties.</p>
            <p>You may delete your account at any time through the Settings page. Upon deletion, your personal data will be removed in accordance with our Privacy Policy.</p>
          </Section>

          <Section title="12. Changes to These Terms">
            <p>We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by updating the &ldquo;Last updated&rdquo; date at the top of this page and, where appropriate, by sending an email to the address associated with your account.</p>
            <p>Your continued use of the Service after changes are posted constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section title="13. Governing Law">
            <p>These Terms are governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.</p>
          </Section>

          <Section title="14. Contact">
            <p>If you have questions about these Terms, please contact us at <a href="mailto:vanetexinvestingapp@gmail.com" style={{ color: "#1e47eb" }}>vanetexinvestingapp@gmail.com</a>.</p>
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

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(30,71,235,0.08)", border: "1px solid rgba(30,71,235,0.22)", borderRadius: 12, padding: "14px 16px", color: "rgba(250,250,247,0.85)", marginBottom: 12 }}>
      {children}
    </div>
  );
}
