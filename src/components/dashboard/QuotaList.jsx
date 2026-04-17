import { quotas } from '../../data/dashboardData'

function QuotaList() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-slate-800">Platform Quotas</h3>
        <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.12em] text-white">Live</span>
      </div>

      <ul className="space-y-4">
        {quotas.map((quota) => {
          const percentage = Math.min(100, Math.round((quota.value / quota.max) * 100))

          return (
            <li key={quota.id}>
              <div className="mb-1 flex justify-between gap-2 text-sm text-slate-700">
                <span className="font-medium">{quota.platform}</span>
                <span className="text-slate-500">
                  {quota.value.toLocaleString()} / {quota.max.toLocaleString()}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <span className={`block h-full rounded-full ${quota.color}`} style={{ width: `${percentage}%` }} />
              </div>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        className="mt-6 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Manage All Limits
      </button>
    </section>
  )
}

export default QuotaList
