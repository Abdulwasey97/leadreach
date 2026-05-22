function StatCard({ title, value, insight, limit = 0 }) {
  const usedValue = Number(value) || 0
  const usagePercent = limit > 0 ? Math.min(Math.round((usedValue / limit) * 100), 100) : 0

  return (
    <article className="relative overflow-hidden rounded-lg border border-cyan-200 bg-cyan-600 p-4 text-white shadow-sm">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-white/15" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100">{title}</p>
          <span className="h-2.5 w-2.5 rounded-full bg-white ring-4 ring-cyan-400" />
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-4xl font-bold tracking-tight">{value}</p>
          <p className="text-xs font-medium text-cyan-50">{insight}</p>
        </div>

        <div className="mt-4 h-1.5 rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>
    </article>
  )
}

export default StatCard
