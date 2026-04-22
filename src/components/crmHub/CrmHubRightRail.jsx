import { useEffect, useState } from 'react'
import { syncSettings } from '../../data/crmHubData'

function Toggle({ enabled }) {
  return (
    <span className={`relative inline-flex h-6 w-11 items-center rounded-full ${enabled ? 'bg-emerald-400' : 'bg-slate-300'}`}>
      <span className={`inline-block size-5 transform rounded-full bg-white transition ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
    </span>
  )
}

function IntegrationStatusCard({ name, subtitle, status, tone }) {
  const badgeStyle =
    tone === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : tone === 'warning'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-slate-200 text-slate-600'

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{name}</p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${badgeStyle}`}>
          {status}
        </span>
      </div>
    </article>
  )
}

function CrmHubRightRail() {
  const [isZohoConnected, setIsZohoConnected] = useState(() => localStorage.getItem('zoho_connected') === 'true')

  useEffect(() => {
    const handleConnectionUpdated = () => {
      setIsZohoConnected(localStorage.getItem('zoho_connected') === 'true')
    }

    window.addEventListener('zoho-connection-updated', handleConnectionUpdated)
    return () => {
      window.removeEventListener('zoho-connection-updated', handleConnectionUpdated)
    }
  }, [])

  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">CRM Connectors</p>
        </div>
        <div className="space-y-3">
          <IntegrationStatusCard
            name="Zoho CRM"
            subtitle="Two-way contact and pipeline sync"
            status={isZohoConnected ? 'Connected' : 'Not Connected'}
            tone={isZohoConnected ? 'success' : 'neutral'}
          />
          <IntegrationStatusCard
            name="HubSpot CRM"
            subtitle="Marketing and lifecycle sync"
            status="Coming Soon"
            tone="warning"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Sync Controls</p>
        </div>
        <ul className="space-y-4">
          {syncSettings.map((setting) => (
            <li key={setting.id} className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-700">{setting.label}</p>
                <p className="text-xs text-slate-500">{setting.description}</p>
              </div>
              <Toggle enabled={setting.enabled} />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950 p-5 text-white shadow-sm">
        <p className="text-sm font-semibold text-cyan-200">Encryption & Security</p>
        <p className="mt-2 text-sm text-slate-300">
          All CRM bridges utilize AES-256 bank-level encryption and OAuth 2.0 protocols for zero-trust data handling.
        </p>
        <button type="button" className="mt-4 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
          Audit Logs {'->'}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Storage Quota</p>
          <span className="text-xs font-semibold text-slate-500">74%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <span className="block h-full w-[74%] rounded-full bg-emerald-500" />
        </div>
        <p className="mt-2 text-xs text-slate-500">9.2 GB of 12.4 GB used</p>
      </section>
    </aside>
  )
}

export default CrmHubRightRail
