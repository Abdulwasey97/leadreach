import ActiveIntegrationsSection from '../components/crmHub/ActiveIntegrationsSection'
import CrmHubRightRail from '../components/crmHub/CrmHubRightRail'

import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'

function CrmHubPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar activeItem="crm" onNavigate={onNavigate} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar searchPlaceholder="Filter CRM flows..." showSupport showAvatar />

          <div className="grid flex-1 gap-5 p-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <main className="space-y-4">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-bold tracking-tight text-slate-800">CRM Connections</h2>
                    <p className="max-w-2xl text-slate-500">Manage your enterprise data bridge and synchronization logic.</p>
                  </div>
                
                </div>
              </section>

              <ActiveIntegrationsSection />
             
            </main>

            <CrmHubRightRail />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrmHubPage
