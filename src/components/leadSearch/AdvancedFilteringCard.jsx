const EMAIL_CATEGORY_OPTIONS = ['personal', 'business']
const EMAIL_TYPE_OPTIONS = ['info', 'contact']

function AdvancedFilteringCard({ emailCategory, onEmailCategoryChange, emailTypes, onToggleEmailType }) {
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Email Category</p>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {EMAIL_CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onEmailCategoryChange(option)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize ${
                    emailCategory === option ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Email Type</p>
            <div className="flex flex-wrap gap-2">
              {EMAIL_TYPE_OPTIONS.map((type) => {
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
      </div>
    </section>
  )
}

export default AdvancedFilteringCard
