function StatCard({ title, value, insight, highlighted }) {
  const cardClasses = highlighted
    ? 'rounded-2xl bg-cyan-600 p-6 text-white shadow-sm'
    : 'rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm'

  const titleClassName = highlighted ? 'text-xs uppercase tracking-[0.15em] text-cyan-100' : 'text-xs uppercase tracking-[0.15em] text-slate-400'
  const insightClassName = highlighted ? 'mt-4 text-sm text-cyan-100' : 'mt-4 text-sm text-emerald-500'

  return (
    <article className={cardClasses}>
      <p className={titleClassName}>{title}</p>
      <p className="mt-3 text-5xl font-bold tracking-tight">{value}</p>
      <p className={insightClassName}>{insight}</p>
    </article>
  )
}

export default StatCard
