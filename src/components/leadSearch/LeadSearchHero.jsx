function LeadSearchHero() {
  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Find Your Next Big Deal</h2>
        <p className="mt-1 max-w-3xl text-slate-500">
          Utilize our architectural intelligence to scan over 400M+ profiles across professional networks and social platforms.
        </p>
      </header>

      <div className="flex gap-3 rounded-xl border border-cyan-100 bg-slate-50 p-2">
        <div className="flex flex-1 items-center gap-3 rounded-lg bg-white px-4">
          <svg viewBox="0 0 24 24" className="size-5 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Enter keywords: 'SaaS Founder'"
            className="h-12 w-full border-none bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <button
          type="button"
          className="rounded-lg bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Initialize Search
        </button>
      </div>
    </section>
  )
}

export default LeadSearchHero
