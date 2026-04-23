export default function Loading() {
  return (
    <section className="animate-pulse">
      <div className="mb-1 h-7 w-36 rounded-lg bg-black/8" />
      <div className="mb-8 mt-2 h-4 w-80 rounded bg-black/5" />
      <div className="space-y-10">
        {[...Array(2)].map((_, s) => (
          <div key={s} className="overflow-hidden rounded-2xl border border-black/5 bg-white">
            <div className="border-b border-black/5 px-4 py-4">
              <div className="h-5 w-40 rounded bg-black/8" />
              <div className="mt-1 h-3 w-56 rounded bg-black/5" />
            </div>
            <ul>
              {[...Array(5)].map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-7 w-7 rounded-full bg-black/5" />
                  <div className="h-4 flex-1 rounded bg-black/5" />
                  <div className="flex gap-4">
                    <div className="hidden sm:block">
                      <div className="h-2.5 w-12 rounded bg-black/5" />
                      <div className="mt-1 h-4 w-10 rounded bg-black/8" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
