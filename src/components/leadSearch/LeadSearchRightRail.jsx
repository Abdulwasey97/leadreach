import { historicalPulseItems } from '../../data/leadSearchData'

function LeadSearchRightRail() {
  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Daily Search Limit</p>
        <p className="mt-1 text-4xl font-extrabold text-slate-800">1,420 / 2,500</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <span className="block h-full w-[56%] rounded-full bg-emerald-500" />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Limit resets in 14 hours. Upgrade to <span className="font-semibold text-cyan-600">Pro Ledger</span> for unlimited scraping capacity.
        </p>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950 p-5 text-white shadow-sm">
        <h3 className="text-3xl font-semibold">Search Intelligence</h3>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-cyan-200">Facebook Success Rate</p>
          <p className="text-xs text-slate-300">Highly effective for local services in Austin.</p>
          <p className="mt-3 text-4xl font-bold text-emerald-400">94.2%</p>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-sm font-semibold text-cyan-200">Pro Tip</p>
          <p className="text-sm text-slate-300">Adding "@gmail.com" to your keywords often reveals direct personal contact points on LinkedIn profiles.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Historical Pulse</h3>
        <ul className="mt-3 space-y-3">
          {historicalPulseItems.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex size-5 items-center justify-center rounded bg-slate-200 text-xs text-slate-500">o</span>
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
              </div>
              <span className="text-xs text-slate-400">{item.when}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-900 p-5 text-white shadow-sm">
        <p className="text-sm font-semibold text-cyan-300">Global Lead Map</p>
        <p className="text-xs text-slate-300">Visualizing 400M+ data points across 180 countries.</p>
      </section>
    </aside>
  )
}

export default LeadSearchRightRail
