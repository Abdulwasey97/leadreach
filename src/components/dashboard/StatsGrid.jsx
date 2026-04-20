import { stats } from '../../data/dashboardData'
import StatCard from './StatCard'

function buildUsageStats(usageDetails) {
  if (!usageDetails) {
    return stats
  }

  const googleRemaining = (usageDetails.TotalGoogleSearchLimit || 0) - (usageDetails.GoogleSearchLimitUtilized || 0)
  const linkedinRemaining = (usageDetails.TotalLinkedinSearchLimit || 0) - (usageDetails.LinkedinSearchLimitUtilized || 0)
  const emailRemaining = (usageDetails.TotalEmailEnrichment || 0) - (usageDetails.EmailEnrichmentUtilized || 0)

  return [
    {
      id: 'google-usage',
      title: 'Google Search Used',
      value: `${usageDetails.GoogleSearchLimitUtilized || 0}`,
      insight: `${googleRemaining} remaining`,
      highlighted: false,
    },
    {
      id: 'linkedin-usage',
      title: 'LinkedIn Used',
      value: `${usageDetails.LinkedinSearchLimitUtilized || 0}`,
      insight: `${linkedinRemaining} remaining`,
      highlighted: false,
    },
    {
      id: 'email-usage',
      title: 'Email Enrichment Used',
      value: `${usageDetails.EmailEnrichmentUtilized || 0}`,
      insight: `${emailRemaining} remaining`,
      highlighted: true,
    },
  ]
}

function StatsGrid({ usageDetails }) {
  const statItems = buildUsageStats(usageDetails)

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {statItems.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          insight={stat.insight}
          highlighted={stat.highlighted}
        />
      ))}
    </section>
  )
}

export default StatsGrid
