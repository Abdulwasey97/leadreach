const EMAIL_CATEGORY_OPTIONS = ['personal', 'business']

function TargetIcon({ icon }) {
  if (icon === 'search') {
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" strokeWidth="2">
        <path d="M20 12.2c0-.62-.06-1.07-.19-1.55H12v3h4.57c-.09.75-.57 1.88-1.64 2.64l-.01.1 2.39 1.82.16.02c1.45-1.3 2.53-3.24 2.53-6.03Z" fill="#4285F4" />
        <path d="M12 20c2.25 0 4.14-.73 5.52-1.98l-2.63-1.94c-.7.48-1.64.82-2.89.82-2.2 0-4.06-1.42-4.73-3.39l-.1.01-2.48 1.89-.03.09A8.31 8.31 0 0 0 12 20Z" fill="#34A853" />
        <path d="M7.27 13.51A4.98 4.98 0 0 1 7 12c0-.52.1-1.03.26-1.51l-.01-.1-2.52-1.92-.08.04A7.88 7.88 0 0 0 3.8 12c0 1.27.31 2.47.86 3.49l2.61-1.98Z" fill="#FBBC05" />
        <path d="M12 7.1c1.56 0 2.61.66 3.21 1.2l2.34-2.23C16.13 4.8 14.25 4 12 4a8.31 8.31 0 0 0-7.34 4.51l2.61 1.98C7.94 8.52 9.8 7.1 12 7.1Z" fill="#EA4335" />
      </svg>
    )
  }

  if (icon === 'globe') {
    return (
      <svg viewBox="0 0 24 24" className="size-4 text-[#1877F2]" fill="currentColor">
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H8v3h2.7v8h2.8Z" />
      </svg>
    )
  }

  if (icon === 'aperture') {
    return (
      <svg viewBox="0 0 24 24" className="size-4 text-[#E4405F]" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.2" />
        <circle cx="17.1" cy="6.9" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (icon === 'briefcase') {
    return (
      <svg viewBox="0 0 24 24" className="size-4 text-[#0A66C2]" fill="currentColor">
        <path d="M6.8 8.8H4V20h2.8V8.8Zm-1.4-4A1.6 1.6 0 1 0 5.4 8a1.6 1.6 0 0 0 0-3.2ZM20 13.6c0-3-1.6-4.4-3.7-4.4a3.2 3.2 0 0 0-2.9 1.6V8.8h-2.8V20h2.8v-6c0-1.6.3-3.2 2.3-3.2s2 1.9 2 3.3V20H20v-6.4Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function AdvancedFilteringCard({
  platforms,
  selectedSource,
  onSelectSource,
  blockedPlatformIds = [],
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
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 5h16" />
            <path d="M7 12h10" />
            <path d="M10 19h4" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-800">Advanced Filtering</h3>
          <p className="text-xs text-slate-500">Platform, email filters &amp; search</p>
        </div>
      </header>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {platforms.map((platform) => {
            const isSelected = selectedSource === platform.id
            const isBlocked = blockedPlatformIds.includes(platform.id)
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => onSelectSource(platform.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                  isSelected
                    ? 'border-sky-300 bg-sky-50'
                    : isBlocked
                      ? 'border-rose-200 bg-rose-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span
                  className={`inline-flex shrink-0 rounded-md p-1.5 ${
                    isSelected ? 'bg-slate-900 text-white' : isBlocked ? 'bg-rose-100' : 'bg-white'
                  }`}
                >
                  <TargetIcon icon={platform.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-800">{platform.name}</span>
                  {isBlocked ? (
                    <span className="text-[10px] font-semibold uppercase text-rose-600">Limit</span>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-end gap-3 gap-y-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5">
          <div className="shrink-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Category</p>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              {EMAIL_CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onEmailCategoryChange(option)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition ${
                    emailCategory === option ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Email type</p>
            <div className="flex flex-wrap gap-1.5">
              {emailTypeOptions.map((type) => {
                const selected = emailTypes.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onToggleEmailType(type)}
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold capitalize ${
                      selected ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-cyan-100 bg-cyan-50/40 p-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg bg-white px-3 py-1.5 ring-1 ring-slate-100">
              <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="e.g. software houses in rawalpindi"
                className="h-9 w-full min-w-0 border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-9 shrink-0 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="mt-1.5 px-0.5 text-[11px] text-slate-500">
            Source: <span className="font-semibold capitalize text-slate-700">{selectedSource}</span>
          </p>
        </form>
      </div>
    </section>
  )
}

export default AdvancedFilteringCard
