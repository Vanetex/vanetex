export default function Loading() {
  return (
    <section className="animate-pulse">
      <div className="mb-1 h-7 w-20 rounded-lg bg-black/8" />
      <div className="mb-6 mt-2 h-4 w-72 rounded bg-black/5" />
      <div className="mb-4 flex gap-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-black/5" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-28 rounded-2xl bg-black/5" />
        <div className="h-64 rounded-2xl bg-black/5" />
        <div className="h-24 rounded-2xl bg-black/5" />
      </div>
    </section>
  );
}
