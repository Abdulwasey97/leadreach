import ActivityList from '../dashboard/ActivityList'
import QuotaList from '../dashboard/QuotaList'

function RightRail() {
  return (
    <aside className="space-y-4">
      <QuotaList />
      <ActivityList />
      <section className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">LeadReach Intelligence</p>
        <p className="mt-2 text-xl font-semibold leading-snug">Your conversion rate is 12% higher than similar accounts in your tier.</p>
        <button type="button" className="mt-3 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
          Learn How →
        </button>
      </section>
    </aside>
  )
}

export default RightRail
