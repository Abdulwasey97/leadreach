import ActiveIntegrationsSection from '../components/crmHub/ActiveIntegrationsSection'

import Sidebar from '../components/layout/Sidebar'

function CrmHubPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 p-4 sm:p-5">
            <main className="space-y-4 sm:space-y-5">
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">Integration Suite</p>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">CRM Connections</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Manage your enterprise data bridge and synchronization logic.</p>
                  </div>
                </div>
              </section>

              <ActiveIntegrationsSection />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrmHubPage
