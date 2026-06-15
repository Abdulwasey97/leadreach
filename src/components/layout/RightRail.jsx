import ActivityList from '../dashboard/ActivityList'
import QuotaList from '../dashboard/QuotaList'
import RecentSearchesPanel from '../dashboard/RecentSearchesPanel'

function RightRail({ apiBaseUrl, orgIdentifier, usageDetails }) {
  return (
    <aside className="flex min-h-0 flex-col gap-4 overflow-hidden">
      <QuotaList usageDetails={usageDetails} />
      <RecentSearchesPanel
        apiBaseUrl={apiBaseUrl}
        orgIdentifier={orgIdentifier}
      />
      <ActivityList />
    </aside>
  )
}

export default RightRail
