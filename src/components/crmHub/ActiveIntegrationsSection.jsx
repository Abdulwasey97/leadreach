import { activeIntegrations } from '../../data/crmHubData'
import IntegrationCard from './IntegrationCard'

function ActiveIntegrationsSection() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Active Integrations</p>
      </div>
      <div className="mx-auto grid max-w-2xl gap-4">
        {activeIntegrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
    </section>
  )
}

export default ActiveIntegrationsSection
