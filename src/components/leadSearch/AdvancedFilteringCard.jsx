const EMAIL_CATEGORY_OPTIONS = ['personal', 'business']

function TargetIcon({ icon }) {
  if (icon === 'search') {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" strokeWidth="2">
        <path d="M20 12.2c0-.62-.06-1.07-.19-1.55H12v3h4.57c-.09.75-.57 1.88-1.64 2.64l-.01.1 2.39 1.82.16.02c1.45-1.3 2.53-3.24 2.53-6.03Z" fill="#4285F4" />
        <path d="M12 20c2.25 0 4.14-.73 5.52-1.98l-2.63-1.94c-.7.48-1.64.82-2.89.82-2.2 0-4.06-1.42-4.73-3.39l-.1.01-2.48 1.89-.03.09A8.31 8.31 0 0 0 12 20Z" fill="#34A853" />
        <path d="M7.27 13.51A4.98 4.98 0 0 1 7 12c0-.52.1-1.03.26-1.51l-.01-.1-2.52-1.92-.08.04A7.88 7.88 0 0 0 3.8 12c0 1.27.31 2.47.86 3.49l2.61-1.98Z" fill="#FBBC05" />
        <path d="M12 7.1c1.56 0 2.61.66 3.21 1.2l2.34-2.23C16.13 4.8 14.25 4 12 4a8.31 8.31 0 0 0-7.34 4.51l2.61 1.98C7.94 8.52 9.8 7.1 12 7.1Z" fill="#EA4335" />
      </svg>
    )
  }

  if (icon === 'globe') {
    return (
      <svg viewBox="0 0 24 24" className="size-5 text-[#1877F2]" fill="currentColor">
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.7v8h2.8Z" />
      </svg>
    )
  }

  if (icon === 'aperture') {
    return (
      <svg viewBox="0 0 24 24" className="size-5 text-[#E4405F]" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.2" />
        <circle cx="17.1" cy="6.9" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (icon === 'briefcase') {
    return (
      <svg viewBox="0 0 24 24" className="size-5 text-[#0A66C2]" fill="currentColor">
        <path d="M6.8 8.8H4V20h2.8V8.8Zm-1.4-4A1.6 1.6 0 1 0 5.4 8a1.6 1.6 0 0 0 0-3.2ZM20 13.6c0-3-1.6-4.4-3.7-4.4a3.2 3.2 0 0 0-2.9 1.6V8.8h-2.8V20h2.8v-6c0-1.6.3-3.2 2.3-3.2s2 1.9 2 3.3V20H20v-6.4Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function AdvancedFilteringCard({
  platforms,
  selectedSource,
  onSelectSource,
  query,
  onQueryChange,
  onSearch,
  loading,
  emailCategory,
  onEmailCategoryChange,
  emailTypes,
  emailTypeOptions,
  onToggleEmailType,
}) {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch()
  }

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
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Target Platform</p>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Select one</p>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {platforms.map((platform) => {
              const isSelected = selectedSource === platform.id
              return (
                <article
                  key={platform.id}
                  onClick={() => onSelectSource(platform.id)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition ${
                    isSelected ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`mb-2.5 inline-flex rounded-lg p-2.5 ${isSelected ? 'bg-slate-900 text-white' : 'bg-white text-sky-500'}`}
                  >
                    <TargetIcon icon={platform.icon} />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800">{platform.name}</h4>
                </article>
              )
            })}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-slate-200 via-slate-300/70 to-transparent" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Email Category</p>
            <div className="inline-flex w-full max-w-[280px] rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-1 shadow-inner">
              {EMAIL_CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onEmailCategoryChange(option)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${
                    emailCategory === option
                      ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      emailCategory === option ? 'bg-cyan-500' : 'bg-slate-300'
                    }`}
                  />
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Email Type</p>
            <div className="flex flex-wrap gap-2">
              {emailTypeOptions.map((type) => {
                const selected = emailTypes.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onToggleEmailType(type)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${
                      selected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/60 via-slate-50 to-white p-3 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[260px] flex-1 items-center gap-3 rounded-xl bg-white px-4 shadow-sm ring-1 ring-slate-100">
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
              className="h-12 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Searching...' : 'Search Leads'}
            </button>
          </div>
          <p className="mt-2 px-1 text-xs text-slate-500">
            Lookup source: <span className="capitalize font-semibold text-slate-700">{selectedSource}</span>
          </p>
        </form>
      </div>
    </section>
  )
}

export default AdvancedFilteringCard
