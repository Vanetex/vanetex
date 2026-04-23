import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="flex flex-col items-center pt-16 text-center">
      <div className="rounded-full bg-accent/10 p-4">
        <svg
          className="h-8 w-8 text-accent"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Check your email</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        We sent you a verification link. Click the link in your email to activate
        your account and start training.
      </p>
      <Link
        href="/auth/sign-in"
        className="mt-8 text-sm font-medium text-accent hover:underline"
      >
        Back to sign in
      </Link>
    </div>
  );
}
