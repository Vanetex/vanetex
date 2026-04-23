import TracksClient from "./TracksClient";

export default function TracksPage() {
  return (
    <section>
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight">Learn</h1>
        <p className="mt-1 text-sm text-muted">
          Structured lessons that build real investing judgment — one concept at a time.
        </p>
      </div>
      <TracksClient />
    </section>
  );
}
