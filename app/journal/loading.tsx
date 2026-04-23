export default function Loading() {
  return (
    <section className="animate-pulse">
      <div className="mb-1 h-7 w-24 rounded-lg bg-black/8" />
      <div className="mb-6 mt-2 h-4 w-72 rounded bg-black/5" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-36 rounded-2xl bg-black/5" />)}
      </div>
    </section>
  );
}
