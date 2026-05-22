import LeadChart from './LeadChart'

function buildUsageSummary(usageDetails) {
  if (!usageDetails) {
    return [
      { id: 'total-used', label: 'Total Used', value: '0' },
      { id: 'total-limit', label: 'Total Limit', value: '0' },
      { id: 'utilization', label: 'Utilization', value: '0%' },
      { id: 'active-platforms', label: 'Active Platforms', value: '0/5' },
    ]
  }

  const utilizedValues = [
    usageDetails.GoogleSearchLimitUtilized || 0,
    usageDetails.LinkedinSearchLimitUtilized || 0,
    usageDetails.FbSearchLimitUtilized || 0,
    usageDetails.InstaSearchLimitUtilized || 0,
    usageDetails.EmailEnrichmentUtilized || 0,
  ]
  const totalValues = [
    usageDetails.TotalGoogleSearchLimit || 0,
    usageDetails.TotalLinkedinSearchLimit || 0,
    usageDetails.TotalFbSearchLimit || 0,
    usageDetails.TotalInstaSearchLimit || 0,
    usageDetails.TotalEmailEnrichment || 0,
  ]

  const totalUsed = utilizedValues.reduce((sum, value) => sum + value, 0)
  const totalLimit = totalValues.reduce((sum, value) => sum + value, 0)
  const utilizationPercent = totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0
  const activePlatforms = utilizedValues.filter((value) => value > 0).length

  return [
    { id: 'total-used', label: 'Total Used', value: totalUsed.toLocaleString() },
    { id: 'total-limit', label: 'Total Limit', value: totalLimit.toLocaleString() },
    { id: 'utilization', label: 'Utilization', value: `${utilizationPercent}%` },
    { id: 'active-platforms', label: 'Active Platforms', value: `${activePlatforms}/5` },
  ]
}

function LeadAccumulationCard({ usageDetails }) {
  const usageSummary = buildUsageSummary(usageDetails)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Usage trend</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Lead Accumulation</h2>
      </div>

      <div className="mt-4">
        <LeadChart usageDetails={usageDetails} />
      </div>

      <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        {usageSummary.map((item) => (
          <div key={item.id} className="min-w-0">
            <dt className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{item.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default LeadAccumulationCard
