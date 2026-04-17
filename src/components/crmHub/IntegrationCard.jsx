function IntegrationIcon({ icon }) {
  if (icon === 'hub') {
    return (
      <svg viewBox="0 0 24 24" className="size-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 4v3" />
        <path d="M12 17v3" />
        <path d="M4 12h3" />
        <path d="M17 12h3" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 16a4 4 0 1 1 .5-7.98A5 5 0 0 1 19 10a3.5 3.5 0 0 1-1 6.86H6Z" />
    </svg>
  )
}

function IntegrationCard({ integration }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="mt-1 inline-flex size-8 items-center justify-center rounded-lg bg-slate-100">
            <IntegrationIcon icon={integration.icon} />
          </span>
          <div>
            <h4 className="text-lg font-semibold text-slate-800">{integration.name}</h4>
            <p className="text-xs text-slate-500">{integration.subtitle}</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
          {integration.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Last Sync</p>
          <p className="font-semibold text-slate-700">{integration.lastSync}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Sync Volume</p>
          <p className="font-semibold text-slate-700">{integration.volume}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          Manage
        </button>
        <button type="button" aria-label="Connection settings" className="rounded-lg bg-slate-100 px-3 py-2 text-slate-600 hover:bg-slate-200">
          o
        </button>
      </div>
    </article>
  )
}

export default IntegrationCard
