import { useMemo, useState } from 'react'
import AdvancedFilteringCard from '../components/leadSearch/AdvancedFilteringCard'
import LeadSearchHero from '../components/leadSearch/LeadSearchHero'
import LeadSearchRightRail from '../components/leadSearch/LeadSearchRightRail'
import PlatformTargets from '../components/leadSearch/PlatformTargets'
import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'

function LeadSearchPage({ onNavigate }) {
  const PAGE_SIZE = 10
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://leadreach.api-pct.com'
  const leadLookupUserEmail = import.meta.env.VITE_LEAD_LOOKUP_USER_EMAIL || 'hassan.a@zenithinnovations.net'
  const [query, setQuery] = useState('software houses in rawalpindi')
  const [selectedSource, setSelectedSource] = useState('google')
  const [emailCategory, setEmailCategory] = useState('personal')
  const [emailTypes, setEmailTypes] = useState(['info', 'contact'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [leads, setLeads] = useState([])
  const [totalLeads, setTotalLeads] = useState(0)
  const [selectedRows, setSelectedRows] = useState({})

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

  const handleToggleEmailType = (type) => {
    setEmailTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((item) => item !== type)
      }
      return [...prev, type]
    })
  }

  const handleSelectSource = (source) => {
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

    setLoading(true)
    setError('')
    const orgIdentifier = localStorage.getItem('organization_identifier') || 'ORG-2002'

    try {
      const response = await fetch(`${apiBaseUrl}/api/Leads/v2/LookingUp_Leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgIdentifier,
          query: query.trim(),
          source: selectedSource,
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
              <PlatformTargets selectedSource={selectedSource} onSelectSource={handleSelectSource} />
              <AdvancedFilteringCard
                emailCategory={emailCategory}
                onEmailCategoryChange={setEmailCategory}
                emailTypes={emailTypes}
                onToggleEmailType={handleToggleEmailType}
              />
              <LeadSearchHero
                query={query}
                onQueryChange={setQuery}
                selectedSource={selectedSource}
                onSearch={handleSearch}
                loading={loading}
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
