export default function Loading() {
  return (
    <section className="animate-pulse">
      <div className="mb-4">
        <div className="h-7 w-16 rounded-lg bg-black/8" />
        <div className="mt-2 h-4 w-80 rounded bg-black/5" />
      </div>
      <div className="mb-5 flex gap-2">
        {[...Array(6)].map((_, i) => <div key={i} className="h-7 w-16 rounded-full bg-black/5" />)}
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-black/5" />)}
      </div>
    </section>
  );
}
