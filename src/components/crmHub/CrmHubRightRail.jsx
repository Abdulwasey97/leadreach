import { syncSettings } from '../../data/crmHubData'

function Toggle({ enabled }) {
  return (
    <span className={`relative inline-flex h-6 w-11 items-center rounded-full ${enabled ? 'bg-emerald-400' : 'bg-slate-300'}`}>
      <span className={`inline-block size-5 transform rounded-full bg-white transition ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
    </span>
  )
}

function CrmHubRightRail() {
  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
