import AdvancedFilteringCard from '../components/leadSearch/AdvancedFilteringCard'
import LeadSearchHero from '../components/leadSearch/LeadSearchHero'
import LeadSearchRightRail from '../components/leadSearch/LeadSearchRightRail'
import PlatformTargets from '../components/leadSearch/PlatformTargets'
import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'

function LeadSearchPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar activeItem="search" onNavigate={onNavigate} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar searchPlaceholder="Search leads by industry or role..." showSupport />

          <div className="grid flex-1 gap-5 p-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <main className="space-y-4">
              <LeadSearchHero />
              <PlatformTargets />
              <AdvancedFilteringCard />
            </main>

            <LeadSearchRightRail />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadSearchPage
