import { quotas } from '../../data/dashboardData'

function buildUsageQuotas(usageDetails) {
  if (!usageDetails) {
    return quotas
  }

  return [
    {
      id: 'google',
      platform: 'Google Search',
      value: usageDetails.GoogleSearchLimitUtilized || 0,
      max: usageDetails.TotalGoogleSearchLimit || 0,
      color: 'bg-emerald-500',
    },
    {
      id: 'linkedin',
      platform: 'LinkedIn Search',
      value: usageDetails.LinkedinSearchLimitUtilized || 0,
      max: usageDetails.TotalLinkedinSearchLimit || 0,
      color: 'bg-sky-500',
    },
    {
      id: 'facebook',
      platform: 'Facebook Search',
      value: usageDetails.FbSearchLimitUtilized || 0,
      max: usageDetails.TotalFbSearchLimit || 0,
      color: 'bg-indigo-500',
    },
    {
      id: 'instagram',
      platform: 'Instagram Search',
      value: usageDetails.InstaSearchLimitUtilized || 0,
      max: usageDetails.TotalInstaSearchLimit || 0,
      color: 'bg-fuchsia-500',
    },
    {
      id: 'email',
      platform: 'Email Enrichment',
      value: usageDetails.EmailEnrichmentUtilized || 0,
      max: usageDetails.TotalEmailEnrichment || 0,
      color: 'bg-amber-500',
    },
  ]
}

function QuotaList({ usageDetails }) {
  const quotaItems = buildUsageQuotas(usageDetails)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-slate-800">Platform Quotas</h3>
        <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.12em] text-white">Live</span>
      </div>

      <ul className="space-y-4">
        {quotaItems.map((quota) => {
          const percentage = quota.max > 0 ? Math.min(100, Math.round((quota.value / quota.max) * 100)) : 0

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

   
    </section>
  )
}

export default QuotaList
