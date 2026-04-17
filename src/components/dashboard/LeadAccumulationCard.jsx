import { leadSummaryStats } from '../../data/dashboardData'
import LeadChart from './LeadChart'

const RANGE_OPTIONS = ['30 Days', '90 Days', '1 Year']

function LeadAccumulationCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-800">Lead Accumulation</h2>
          <p className="text-sm text-slate-500">Aggregate lead volume across 30-day rolling window</p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                option === '30 Days' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <LeadChart />
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {leadSummaryStats.map((item) => (
          <div key={item.id}>
            <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">{item.label}</dt>
            <dd className="mt-1 text-3xl font-semibold text-slate-800">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default LeadAccumulationCard
