import { activities } from '../../data/dashboardData'

function ActivityList() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-slate-800">Recent Activity</h3>
        <button type="button" className="text-sm font-medium text-cyan-600 hover:text-cyan-700">
          View Log
        </button>
      </div>

      <ul className="space-y-5">
        {activities.map((activity) => (
          <li key={activity.id} className="relative pl-5">
            <span className={`absolute left-0 top-2 size-2 rounded-full ${activity.color}`} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">{activity.title}</p>
                <p className="mt-1 text-sm text-slate-500">{activity.detail}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{activity.when}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ActivityList
