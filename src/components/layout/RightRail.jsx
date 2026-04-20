import ActivityList from '../dashboard/ActivityList'
import QuotaList from '../dashboard/QuotaList'

function RightRail({ usageDetails }) {
  return (
    <aside className="space-y-4">
      <QuotaList usageDetails={usageDetails} />
      <ActivityList />
     
    </aside>
  )
}

export default RightRail
