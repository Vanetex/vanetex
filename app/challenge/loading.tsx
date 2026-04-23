export default function Loading() {
  return (
    <section className="animate-pulse">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-7 w-40 rounded-lg bg-black/8" />
        <div className="h-4 w-16 rounded bg-black/5" />
      </div>
      <div className="space-y-3">
        <div className="h-44 rounded-3xl bg-black/5" />
        <div className="h-28 rounded-3xl bg-black/5" />
      </div>
    </section>
  );
}
