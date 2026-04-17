import { stats } from '../../data/dashboardData'
import StatCard from './StatCard'

function StatsGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
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
