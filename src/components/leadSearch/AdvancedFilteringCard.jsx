import { emailDomainFilters, freshnessOptions } from '../../data/leadSearchData'

function AdvancedFilteringCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-5 flex items-start gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-lg bg-emerald-500 text-white">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 5h16" />
            <path d="M7 12h10" />
            <path d="M10 19h4" />
          </svg>
        </span>
        <div>
          <h3 className="text-2xl font-semibold text-slate-800">Advanced Filtering Engine</h3>
          <p className="text-slate-500">Narrow your results with precision logic</p>
        </div>
      </header>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Email Domain Filter</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {emailDomainFilters.map((domain) => (
              <button
                key={domain}
                type="button"
                className={`rounded-lg px-4 py-2 text-left text-sm font-medium ${
                  domain === '@outlook.com' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {domain}
              </button>
            ))}
            <button type="button" className="col-span-full rounded-lg bg-slate-100 px-4 py-2 text-left text-sm text-slate-400 hover:bg-slate-200">
              Custom domain (e.g. apple.com)
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Location Focus</p>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Global Coverage
              <span>v</span>
            </button>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Data Freshness</p>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {freshnessOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                    option === 'Real-time' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdvancedFilteringCard
