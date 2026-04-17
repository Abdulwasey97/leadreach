import { partnerLibrary } from '../../data/crmHubData'

function LibraryIcon({ icon }) {
  if (icon === 'sync') {
    return (
      <svg viewBox="0 0 24 24" className="size-4 text-sky-500" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4v6h6" />
        <path d="M20 20v-6h-6" />
        <path d="M20 10A8 8 0 0 0 6.8 5.2L4 8" />
        <path d="M4 14a8 8 0 0 0 13.2 4.8L20 16" />
      </svg>
    )
  }
  if (icon === 'bolt') {
    return (
      <svg viewBox="0 0 24 24" className="size-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="size-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.8">
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
      <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
    </svg>
  )
}

function PartnerLibrarySection() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Library</p>
          <p className="text-sm text-slate-500">Explore and connect additional ecosystem partners.</p>
        </div>
        <input
          type="search"
          placeholder="Search library..."
          className="w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {partnerLibrary.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white">
              <LibraryIcon icon={item.icon} />
            </span>
            <h4 className="mt-3 text-lg font-semibold text-slate-800">{item.name}</h4>
            <p className="text-sm text-slate-500">{item.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {item.type}
              </span>
              <button type="button" aria-label="View details" className="text-slate-500 hover:text-slate-700">
                o
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PartnerLibrarySection
