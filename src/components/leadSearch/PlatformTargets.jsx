import { platformTargets } from '../../data/leadSearchData'

function TargetIcon({ icon }) {
  if (icon === 'globe') {
    return (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a15 15 0 0 1 0 18" />
        <path d="M12 3a15 15 0 0 0 0 18" />
      </svg>
    )
  }

  if (icon === 'aperture') {
    return (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="m14.5 8.2-5 8.6" />
        <path d="M7.4 9.8h9.2" />
        <path d="m9.5 15.8 5-8.6" />
      </svg>
    )
  }

  if (icon === 'briefcase') {
    return (
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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

function PlatformTargets() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-3xl font-semibold text-slate-800">Target Platforms</h3>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Select one or more</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {platformTargets.map((platform) => (
          <article
            key={platform.id}
            className={`rounded-xl border p-5 transition ${
              platform.selected ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className={`mb-4 inline-flex rounded-xl p-3 ${platform.selected ? 'bg-slate-900 text-white' : 'bg-white text-sky-500'}`}>
              <TargetIcon icon={platform.icon} />
            </div>
            <h4 className="text-2xl font-semibold text-slate-800">{platform.name}</h4>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{platform.type}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default PlatformTargets
