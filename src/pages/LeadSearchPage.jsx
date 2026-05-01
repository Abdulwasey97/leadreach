import { useEffect, useMemo, useState } from 'react'
import AdvancedFilteringCard from '../components/leadSearch/AdvancedFilteringCard'
import LeadSearchRightRail from '../components/leadSearch/LeadSearchRightRail'
import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'
import { platformTargets } from '../data/leadSearchData'

const EMAIL_TYPES_BY_CATEGORY = {
  personal: ['gmail', 'outlook', 'hotmail', 'yahoo'],
  business: ['info', 'contact', 'sales', 'support', 'admin'],
}

const SOURCE_TO_API_VALUE = {
  google: 'google',
  facebook: 'fb',
  instagram: 'instagram',
  linkedin: 'linkedin',
}

const SOURCE_TO_USAGE_TYPE = {
  google: 'Google',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  emailenrichment: 'EmailEnrichment',
  email_enrichment: 'EmailEnrichment',
  email: 'EmailEnrichment',
  fb: 'Facebook',
}

const resolveUsageTypeFromPayload = (payload, fallbackSource) => {
  const payloadSource = payload?.source || payload?.Source
  const normalizedSource = String(payloadSource || fallbackSource || '')
    .trim()
    .toLowerCase()

  return SOURCE_TO_USAGE_TYPE[normalizedSource] || 'Google'
}

const PLATFORM_USAGE_CONFIG = {
  google: {
    enabledKey: 'IsGoogleSearchEnabled',
    totalKey: 'TotalGoogleSearchLimit',
    utilizedKey: 'GoogleSearchLimitUtilized',
  },
  facebook: {
    enabledKey: 'IsFbSearchEnabled',
    totalKey: 'TotalFbSearchLimit',
    utilizedKey: 'FbSearchLimitUtilized',
  },
  instagram: {
    enabledKey: 'IsInstaSearchEnabled',
    totalKey: 'TotalInstaSearchLimit',
    utilizedKey: 'InstaSearchLimitUtilized',
  },
  linkedin: {
    enabledKey: 'IsLinkedinSearchEnabled',
    totalKey: 'TotalLinkedinSearchLimit',
    utilizedKey: 'LinkedinSearchLimitUtilized',
  },
}

const USAGE_TYPE_TO_PLATFORM = {
  Google: 'google',
  Facebook: 'facebook',
  Instagram: 'instagram',
  LinkedIn: 'linkedin',
}

const safeParseJson = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const getOrgWalletFromStorage = () => {
  const orgPayload = safeParseJson(localStorage.getItem('organization_details_response') || '{}')
  return orgPayload?.OrgDetails?.Org_Wallet || orgPayload?.OrganizationDetails?.Org_Wallet || null
}

const isPlatformAvailable = (platformId, wallet) => {
  const config = PLATFORM_USAGE_CONFIG[platformId]
  if (!config || !wallet) {
    return true
  }

  const isEnabled = wallet?.[config.enabledKey] !== false
  const total = Number(wallet?.[config.totalKey] || 0)
  const utilized = Number(wallet?.[config.utilizedKey] || 0)

  return isEnabled && utilized < total
}

function LeadSearchPage({ onNavigate }) {
  const PAGE_SIZE = 10
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://leadreach.api-pct.com'
  const leadLookupUserEmail = import.meta.env.VITE_LEAD_LOOKUP_USER_EMAIL || 'hassan.a@zenithinnovations.net'
  const [query, setQuery] = useState('software houses in rawalpindi')
  const [selectedSource, setSelectedSource] = useState('google')
  const [emailCategory, setEmailCategory] = useState('personal')
  const [emailTypes, setEmailTypes] = useState(EMAIL_TYPES_BY_CATEGORY.personal)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [leads, setLeads] = useState([])
  const [totalLeads, setTotalLeads] = useState(0)
  const [selectedRows, setSelectedRows] = useState({})
  const [orgWallet, setOrgWallet] = useState(() => getOrgWalletFromStorage())

  const selectedCount = useMemo(
    () => Object.values(selectedRows).filter(Boolean).length,
    [selectedRows],
  )

  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil((totalLeads || leads.length) / PAGE_SIZE))
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return leads.slice(startIndex, startIndex + PAGE_SIZE)
  }, [currentPage, leads])
  const currentPageRowKeys = useMemo(
    () => paginatedLeads.map((lead, index) => `${lead.name || lead.email || 'lead'}-${(currentPage - 1) * PAGE_SIZE + index}`),
    [currentPage, paginatedLeads],
  )
  const allRowsSelected = currentPageRowKeys.length > 0 && currentPageRowKeys.every((rowKey) => Boolean(selectedRows[rowKey]))
  const availablePlatformIds = useMemo(
    () => platformTargets.filter((platform) => isPlatformAvailable(platform.id, orgWallet)).map((platform) => platform.id),
    [orgWallet],
  )
  const blockedPlatformIds = useMemo(
    () => platformTargets.filter((platform) => !isPlatformAvailable(platform.id, orgWallet)).map((platform) => platform.id),
    [orgWallet],
  )

  useEffect(() => {
    const refreshWallet = () => {
      setOrgWallet(getOrgWalletFromStorage())
    }

    refreshWallet()
    window.addEventListener('organization-details-updated', refreshWallet)
    return () => {
      window.removeEventListener('organization-details-updated', refreshWallet)
    }
  }, [])

  useEffect(() => {
    if (availablePlatformIds.length === 0) {
      return
    }

    if (!availablePlatformIds.includes(selectedSource)) {
      setSelectedSource(availablePlatformIds[0])
    }
  }, [availablePlatformIds, selectedSource])

  const handleToggleEmailType = (type) => {
    setEmailTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((item) => item !== type)
      }
      return [...prev, type]
    })
  }

  const handleEmailCategoryChange = (category) => {
    setEmailCategory(category)
    setEmailTypes(EMAIL_TYPES_BY_CATEGORY[category] || [])
  }

  const handleSelectSource = (source) => {
    if (!isPlatformAvailable(source, orgWallet)) {
      setError('This platform limit is reached. Please choose another platform.')
      return
    }

    setError('')
    setSelectedSource(source)
  }

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a query before searching.')
      return
    }

    if (emailTypes.length === 0) {
      setError('Please select at least one email type.')
      return
    }

    if (!selectedSource) {
      setError('Please select a source platform.')
      return
    }

    if (!isPlatformAvailable(selectedSource, orgWallet)) {
      setError('Selected platform is not available because its quota is consumed.')
      return
    }

    setLoading(true)
    setError('')
    const orgIdentifier = localStorage.getItem('organization_identifier') || 'ORG-2012'
    const sourceForPayload = SOURCE_TO_API_VALUE[selectedSource] || selectedSource
    const orgPayload = JSON.parse(localStorage.getItem('organization_details_response') || '{}')
    const walletIdentifier =
      orgPayload?.OrganizationDetails?.walletIdentifier ||
      orgPayload?.OrgDetails?.walletIdentifier ||
      localStorage.getItem('usage_details_wallet_identifier') ||
      'Wal775AAC24994C'

    try {
      const response = await fetch(`${apiBaseUrl}/api/Leads/v2/LookingUp_Leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgIdentifier,
          query: query.trim(),
          source: sourceForPayload,
          userEmail: leadLookupUserEmail,
          emailCategory,
          emailTypes,
        }),
      })

      if (!response.ok) {
        throw new Error(`Lead lookup failed (${response.status})`)
      }

      const payload = await response.json()
      const lookupFailed = payload?.Code !== 200 || String(payload?.Status || '').toLowerCase() !== 'success'
      if (lookupFailed) {
        throw new Error(payload?.Reason || 'Unable to fetch leads right now.')
      }

      const list = Array.isArray(payload?.Leads) ? payload.Leads : Array.isArray(payload?.leads) ? payload.leads : []
      setLeads(list)
      setTotalLeads(Number(payload?.TotalLeads ?? payload?.totalEmails) || list.length)
      setSelectedRows({})
      setCurrentPage(1)

      try {
        const usageType = resolveUsageTypeFromPayload(payload, selectedSource)
        const usagePlatform = USAGE_TYPE_TO_PLATFORM[usageType]

        if (usagePlatform && !isPlatformAvailable(usagePlatform, orgWallet)) {
          throw new Error(`${usageType} quota is exhausted. Update_Usage was skipped.`)
        }

        const usageResponse = await fetch(`${apiBaseUrl}/api/Org/v1/Update_Usage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            DataCenter: 'crm.zoho.com',
            referer: 'https://localhost:44352',
          },
          body: JSON.stringify({
            orgIdentifier,
            walletIdentifier,
            UsageType: usageType,
            UsageQty: 1,
          }),
        })

        if (!usageResponse.ok) {
          throw new Error(`Update_Usage failed (${usageResponse.status})`)
        }

        const usagePayload = await usageResponse.json()
        const usageFailed = usagePayload?.Code === 500 || String(usagePayload?.Status || '').toLowerCase() === 'failure'
        if (usageFailed) {
          throw new Error(usagePayload?.Reason || 'Update_Usage failed')
        }

        localStorage.setItem('usage_details_response', JSON.stringify(usagePayload))
        localStorage.setItem('usage_details', JSON.stringify(usagePayload?.UsageDetails || {}))
        localStorage.setItem('usage_details_org_identifier', orgIdentifier)
        localStorage.setItem('usage_details_wallet_identifier', walletIdentifier)
      } catch (usageError) {
        localStorage.setItem('usage_details_error', usageError instanceof Error ? usageError.message : 'Update_Usage failed')
      }
    } catch (requestError) {
      setLeads([])
      setTotalLeads(0)
      setSelectedRows({})
      setCurrentPage(1)
      setError(requestError instanceof Error ? requestError.message : 'Failed to search leads.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (allRowsSelected) {
      setSelectedRows({})
      return
    }

    setSelectedRows((prev) => {
      const nextSelectedRows = { ...prev }
      currentPageRowKeys.forEach((rowKey) => {
        nextSelectedRows[rowKey] = true
      })
      return nextSelectedRows
    })
  }

  const handleRowSelection = (rowKey) => {
    setSelectedRows((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }))
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar activeItem="search" onNavigate={onNavigate} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar searchPlaceholder="Search leads by industry or role..." showSupport />

          <div className="grid flex-1 gap-5 p-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <main className="space-y-4">
              <AdvancedFilteringCard
                platforms={platformTargets}
                selectedSource={selectedSource}
                onSelectSource={handleSelectSource}
                blockedPlatformIds={blockedPlatformIds}
                query={query}
                onQueryChange={setQuery}
                onSearch={handleSearch}
                loading={loading}
                emailCategory={emailCategory}
                onEmailCategoryChange={handleEmailCategoryChange}
                emailTypes={emailTypes}
                emailTypeOptions={EMAIL_TYPES_BY_CATEGORY[emailCategory] || []}
                onToggleEmailType={handleToggleEmailType}
              />
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Search Results</h3>
                    <p className="text-sm text-slate-500">
                      {loading ? 'Fetching results from Zoho CRM...' : `${totalLeads} leads found`}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                    Selected: {selectedCount}
                  </div>
                </div>

                {error ? (
                  <p className="px-5 py-4 text-sm font-medium text-red-600">{error}</p>
                ) : null}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={allRowsSelected}
                            onChange={handleSelectAll}
                            className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Name
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Phone
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Website
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Address
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {paginatedLeads.map((lead, index) => {
                        const absoluteIndex = (currentPage - 1) * PAGE_SIZE + index
                        const rowKey = `${lead.name || lead.email || 'lead'}-${absoluteIndex}`
                        const isSelected = Boolean(selectedRows[rowKey])

                        return (
                          <tr key={rowKey} className={isSelected ? 'bg-cyan-50/70' : ''}>
                            <td className="px-5 py-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleRowSelection(rowKey)}
                                className="size-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                              />
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-700">{lead.name || '-'}</td>
                            <td className="px-5 py-3 text-sm text-slate-700">{lead.phone || '-'}</td>
                            <td className="px-5 py-3 text-sm text-cyan-700">
                              {lead.website ? (
                                <a href={lead.website} target="_blank" rel="noreferrer" className="hover:underline">
                                  Visit Website
                                </a>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-5 py-3 text-sm text-slate-600">{lead.address || '-'}</td>
                            <td className="px-5 py-3 text-sm text-slate-700">
                              {lead.rating ? `${lead.rating} (${lead.reviews || 0} reviews)` : '-'}
                            </td>
                          </tr>
                        )
                      })}
                      {!loading && leads.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                            Start a search to load leads from Zoho CRM.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
                {totalLeads > PAGE_SIZE ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
                    <p className="text-sm text-slate-500">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>
            </main>

            <LeadSearchRightRail />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadSearchPage
