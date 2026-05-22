import ActivityList from '../dashboard/ActivityList'
import QuotaList from '../dashboard/QuotaList'

function RightRail({ usageDetails }) {
  return (
    <aside className="flex h-full flex-col">
      <QuotaList usageDetails={usageDetails} />
      <ActivityList />
    </aside>
  )
}

export default RightRail
