import { useEffect, useState } from 'react'
import LeadAccumulationCard from '../components/dashboard/LeadAccumulationCard'
import StatsGrid from '../components/dashboard/StatsGrid'
import RightRail from '../components/layout/RightRail'

import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'

function DashboardPage({ onNavigate }) {
  const [usageDetails, setUsageDetails] = useState(() => JSON.parse(localStorage.getItem('usage_details') || 'null'))

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://leadreach.api-pct.com'
    const orgPayload = JSON.parse(localStorage.getItem('organization_details_response') || '{}')
    const orgDetails = orgPayload?.OrgDetails || {}
    const orgIdentifier = orgDetails?.organizationID || localStorage.getItem('organization_identifier') || 'ORG-2012'
    const walletIdentifier = orgDetails?.walletIdentifier || 'Wal775AAC24994C'

    const fetchUsage = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/Org/v1/Update_Usage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            DataCenter: 'crm.zoho.com',
            referer: 'https://localhost:44352',
          },
          body: JSON.stringify({
            orgIdentifier,
            walletIdentifier,
            UsageType: 'Google',
            UsageQty: 1,
          }),
        })

        if (!response.ok) {
          throw new Error(`Update_Usage failed (${response.status})`)
        }

        const payload = await response.json()
        const failed = payload?.Code === 500 || String(payload?.Status || '').toLowerCase() === 'failure'

        if (failed) {
          throw new Error(payload?.Reason || 'Update_Usage failed')
        }

        localStorage.setItem('usage_details_response', JSON.stringify(payload))
        localStorage.setItem('usage_details', JSON.stringify(payload?.UsageDetails || {}))
        localStorage.setItem('usage_details_org_identifier', orgIdentifier)
        localStorage.setItem('usage_details_wallet_identifier', walletIdentifier)
        setUsageDetails(payload?.UsageDetails || null)
      } catch (error) {
        localStorage.setItem('usage_details_error', error instanceof Error ? error.message : 'Failed to fetch usage details')
      }
    }

    fetchUsage()
  }, [])

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

              <StatsGrid usageDetails={usageDetails} />
              <LeadAccumulationCard />
            </main>

            <RightRail usageDetails={usageDetails} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
