export default function Loading() {
  return (
    <section className="animate-pulse">
      <div className="mb-1 h-7 w-32 rounded-lg bg-black/8" />
      <div className="mb-6 mt-2 h-4 w-64 rounded bg-black/5" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-black/5" />)}
      </div>
      <div className="mt-8 h-48 rounded-2xl bg-black/5" />
      <div className="mt-8 h-64 rounded-2xl bg-black/5" />
    </section>
  );
}
