"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium text-danger">Something went wrong</p>
      <p className="mt-1 text-xs text-muted">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition hover:border-black/20"
      >
        Try again
      </button>
    </div>
  );
}
