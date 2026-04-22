function LeadSearchHero({
  query,
  onQueryChange,
  selectedSource,
  onSearch,
  loading,
}) {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Search Leads In Zoho CRM</h2>
        <p className="mt-1 max-w-3xl text-slate-500">
          Enter your search query and run lookup using the selected source platform.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-cyan-100 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[260px] flex-1 items-center gap-3 rounded-lg bg-white px-4">
            <svg viewBox="0 0 24 24" className="size-5 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Enter query e.g. software houses in rawalpindi"
              className="h-12 w-full border-none bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-lg bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Searching...' : 'Search Leads'}
          </button>
        </div>

        <p className="px-1 text-xs text-slate-500">
          Lookup source: <span className="capitalize">{selectedSource}</span>
        </p>
      </form>
    </section>
  )
}

export default LeadSearchHero
