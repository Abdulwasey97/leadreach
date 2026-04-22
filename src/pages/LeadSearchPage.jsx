import { useMemo, useState } from 'react'
import AdvancedFilteringCard from '../components/leadSearch/AdvancedFilteringCard'
import LeadSearchHero from '../components/leadSearch/LeadSearchHero'
import LeadSearchRightRail from '../components/leadSearch/LeadSearchRightRail'
import PlatformTargets from '../components/leadSearch/PlatformTargets'
import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'

function LeadSearchPage({ onNavigate }) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://leadreach.api-pct.com'
  const leadLookupUserEmail = import.meta.env.VITE_LEAD_LOOKUP_USER_EMAIL || 'hassan.a@zenithinnovations.net'
  const [query, setQuery] = useState('software houses in rawalpindi')
  const [selectedSource, setSelectedSource] = useState('google')
  const [emailCategory, setEmailCategory] = useState('personal')
  const [emailTypes, setEmailTypes] = useState(['info', 'contact'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [leads, setLeads] = useState([])
  const [totalEmails, setTotalEmails] = useState(0)
  const [selectedRows, setSelectedRows] = useState({})

  const selectedCount = useMemo(
    () => Object.values(selectedRows).filter(Boolean).length,
    [selectedRows],
  )

  const allRowsSelected = leads.length > 0 && selectedCount === leads.length

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
      const response = await fetch(`${apiBaseUrl}/api/Lead/v1/LookingUp_Leads`, {
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

      const list = Array.isArray(payload?.leads) ? payload.leads : []
      setLeads(list)
      setTotalEmails(Number(payload?.totalEmails) || list.length)
      setSelectedRows({})
    } catch (requestError) {
      setLeads([])
      setTotalEmails(0)
      setSelectedRows({})
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

    const nextSelectedRows = {}
    leads.forEach((lead, index) => {
      const key = `${lead.email || 'lead'}-${index}`
      nextSelectedRows[key] = true
    })
    setSelectedRows(nextSelectedRows)
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
                      {loading ? 'Fetching results from Zoho CRM...' : `${totalEmails} emails found`}
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
                          Email
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Platform
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Source URL
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {leads.map((lead, index) => {
                        const rowKey = `${lead.email || 'lead'}-${index}`
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
                            <td className="px-5 py-3 text-sm text-slate-700">{lead.email || '-'}</td>
                            <td className="px-5 py-3 text-sm">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                {lead.platform || '-'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-sm text-cyan-700">
                              {lead.sourceUrl ? (
                                <a href={lead.sourceUrl} target="_blank" rel="noreferrer" className="hover:underline">
                                  View Source
                                </a>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      {!loading && leads.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">
                            Start a search to load leads from Zoho CRM.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
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
