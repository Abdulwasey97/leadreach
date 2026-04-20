import { useMemo, useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'

function readLocalStorageEntries() {
  return Object.entries(localStorage).sort(([a], [b]) => a.localeCompare(b))
}

function SettingsPage({ onNavigate }) {
  const [entries, setEntries] = useState(() => readLocalStorageEntries())

  const hubspotEntries = useMemo(
    () => entries.filter(([key]) => key.toLowerCase().includes('hubspot')),
    [entries],
  )
  const isHubspotConnected = localStorage.getItem('hubspot_connected') === 'true'

  const handleRefresh = () => {
    setEntries(readLocalStorageEntries())
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar activeItem="settings" onNavigate={onNavigate} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar searchPlaceholder="Search settings..." showSupport showAvatar />

          <div className="flex-1 space-y-5 p-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-800">Settings</h2>
                  <p className="text-slate-500">Manage integration state and connection details.</p>
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-100"
                >
                  Refresh Data
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">HubSpot Settings</h3>
              <p className="mb-4 text-sm text-slate-500">Integration data available for HubSpot connection.</p>

              {!isHubspotConnected || hubspotEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-base font-semibold text-slate-700">No data found</p>
                  <p className="mt-1 text-sm text-slate-500">HubSpot is not connected yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {hubspotEntries.map(([key, value]) => (
                    <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{key}</p>
                      <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-xs text-slate-700">{value}</pre>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
