import ActivityList from "../dashboard/ActivityList";
import QuotaList from "../dashboard/QuotaList";
import RecentSearchesPanel from "../dashboard/RecentSearchesPanel";

function RightRail({ apiBaseUrl, orgIdentifier, usageDetails }) {
  return (
    <aside className="flex flex-col gap-4 xl:min-h-0">
      <QuotaList usageDetails={usageDetails} />
      <RecentSearchesPanel
        apiBaseUrl={apiBaseUrl}
        orgIdentifier={orgIdentifier}
      />
      <ActivityList />
    </aside>
  );
}

export default RightRail;
