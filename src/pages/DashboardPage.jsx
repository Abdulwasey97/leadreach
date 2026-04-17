import LeadAccumulationCard from '../components/dashboard/LeadAccumulationCard'
import StatsGrid from '../components/dashboard/StatsGrid'
import RightRail from '../components/layout/RightRail'
import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'

function DashboardPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px] bg-slate-100">
        <Sidebar activeItem="dashboard" onNavigate={onNavigate} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar />
          <div className="grid flex-1 gap-6 p-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <main className="space-y-5">
              <header>
                <h2 className="text-4xl font-bold tracking-tight text-slate-800">Executive Overview</h2>
                <p className="text-slate-500">Real-time performance analytics across all acquisition channels.</p>
              </header>

              <StatsGrid />
              <LeadAccumulationCard />
            </main>

            <RightRail />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
