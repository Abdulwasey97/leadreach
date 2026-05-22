import { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'

const PAGE_SIZE = 10

const PLATFORM_SOURCES = [
  { platform: 'Facebook', endpoint: 'Retrieve_FbLeads', leadsKey: 'Fb_Leads' },
  { platform: 'Google', endpoint: 'Retrieve_GoogleLeads', leadsKey: 'Google_Leads' },
  { platform: 'LinkedIn', endpoint: 'Retrieve_LinkedinLeads', leadsKey: 'Linkedin_Leads' },
  { platform: 'Instagram', endpoint: 'Retrieve_InstaLeads', leadsKey: 'Insta_Leads' },
]

const PLATFORM_DOT_STYLES = {
  Facebook: 'bg-cyan-600',
  Google: 'bg-cyan-600',
  LinkedIn: 'bg-cyan-600',
  Instagram: 'bg-cyan-600',
}

function formatLeadName(lead) {
  const first = String(lead?.firstName || '').trim()
  const last = String(lead?.lastName || '').trim()

  if (first && last && first !== last) {
    return `${first} ${last}`
  }

  return first || last || '-'
}

function parseUtcDate(value) {
  const raw = String(value ?? '').trim()
  if (!raw) {
    return null
  }

  if (/[zZ]$|[+-]\d{2}:\d{2}$|[+-]\d{4}$/.test(raw)) {
    const parsed = new Date(raw)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T')
  const parsed = new Date(`${normalized}Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDate(value) {
  const parsed = parseUtcDate(value)
  if (!parsed) {
    return value ? String(value) : '-'
  }

  return parsed.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatRating(value) {
  if (!value) {
    return '-'
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? String(value) : parsed.toFixed(1)
}

function getEnrichedEmailSummary(lead) {
  const emails = Array.isArray(lead?.EnrichedEmails) ? lead.EnrichedEmails : []
  if (emails.length === 0) {
    return '-'
  }

  const primary = emails[0]?.emailAddress
  if (emails.length === 1) {
    return primary || '-'
  }

  return `${primary} (+${emails.length - 1} more)`
}

function getLeadWebsite(lead) {
  return String(lead?.website || lead?.Website || '').trim()
}

async function fetchPlatformLeads(apiBaseUrl, orgIdentifier, source) {
  const response = await fetch(`${apiBaseUrl}/api/Leads/v1/${source.endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orgIdentifier }),
  })

  if (!response.ok) {
    throw new Error(`${source.platform} leads failed (${response.status})`)
  }

  const payload = await response.json()
  const requestFailed = payload?.Code !== 200 || String(payload?.Status || '').toLowerCase() !== 'success'

  if (requestFailed) {
    throw new Error(payload?.Reason || `Unable to load ${source.platform} leads.`)
  }

  const list = Array.isArray(payload?.[source.leadsKey]) ? payload[source.leadsKey] : []

  return list.map((lead) => ({
    ...lead,
    platform: source.platform,
    rowId: `${source.platform}-${lead?.id ?? lead?.leadIdentifier ?? Math.random()}`,
  }))
}

function LeadSearchHistoryPage() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://leadreach.api-pct.com'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [leads, setLeads] = useState([])
  const [platformFilter, setPlatformFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError('')

    const orgIdentifier = localStorage.getItem('organization_identifier') || 'ORG-2012'

    try {
      const results = await Promise.allSettled(
        PLATFORM_SOURCES.map((source) => fetchPlatformLeads(apiBaseUrl, orgIdentifier, source)),
      )

      const mergedLeads = []
      const errors = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          mergedLeads.push(...result.value)
          return
        }

        errors.push(result.reason instanceof Error ? result.reason.message : `${PLATFORM_SOURCES[index].platform} failed`)
      })

      mergedLeads.sort((a, b) => {
        const aTime = new Date(a?.leadCreatedOn || 0).getTime()
        const bTime = new Date(b?.leadCreatedOn || 0).getTime()
        return bTime - aTime
      })

      setLeads(mergedLeads)

      if (errors.length === PLATFORM_SOURCES.length) {
        throw new Error(errors[0] || 'Unable to load search history.')
      }

      if (errors.length > 0) {
        setError(errors.join(' '))
      }
    } catch (requestError) {
      setLeads([])
      setError(requestError instanceof Error ? requestError.message : 'Failed to load search history.')
    } finally {
      setLoading(false)
    }
  }, [apiBaseUrl])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadHistory()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadHistory])

  const filteredLeads = useMemo(() => {
    if (platformFilter === 'all') {
      return leads
    }

    return leads.filter((lead) => lead.platform === platformFilter)
  }, [leads, platformFilter])

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE))
  const visiblePage = Math.min(currentPage, totalPages)

  const paginatedLeads = useMemo(() => {
    const startIndex = (visiblePage - 1) * PAGE_SIZE
    return filteredLeads.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredLeads, visiblePage])

  const handlePlatformFilterChange = (value) => {
    setPlatformFilter(value)
    setCurrentPage(1)
  }

  const platformCounts = useMemo(() => {
    const counts = { all: leads.length }

    PLATFORM_SOURCES.forEach((source) => {
      counts[source.platform] = leads.filter((lead) => lead.platform === source.platform).length
    })

    return counts
  }, [leads])

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar searchPlaceholder="Search history by name, category, or address..." showSupport />

          <div className="flex-1 space-y-5 p-5">
            <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">Acquisition Archive</p>
              <h2 className="mt-1 text-4xl font-bold tracking-tight text-slate-800">Lead Search History</h2>
             
            </header>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-white px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700">Historical Results</p>
                    <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-800">Lead discovery ledger</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {loading ? 'Loading saved leads from all platforms...' : `${filteredLeads.length} leads found`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={loadHistory}
                      disabled={loading}
                      className="h-10 cursor-pointer rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <button
                    type="button"
                    onClick={() => handlePlatformFilterChange('all')}
                    className={`rounded-xl border px-4 py-3 text-left transition ${
                      platformFilter === 'all'
                        ? 'border-sky-300 bg-sky-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">All Platforms</span>
                    <span className="mt-1 block text-2xl font-bold text-slate-800">{platformCounts.all}</span>
                  </button>

                  {PLATFORM_SOURCES.map((source) => (
                    <button
                      key={source.platform}
                      type="button"
                      onClick={() => handlePlatformFilterChange(source.platform)}
                      className={`rounded-xl border px-4 py-3 text-left transition ${
                        platformFilter === source.platform
                          ? 'border-sky-300 bg-sky-50'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <span className={`size-2 rounded-full ${PLATFORM_DOT_STYLES[source.platform]}`} />
                        {source.platform}
                      </span>
                      <span className="mt-1 block text-2xl font-bold text-slate-800">{platformCounts[source.platform] || 0}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error ? (
                <p className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800">{error}</p>
              ) : null}

              <div className="bg-slate-50 p-4">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-[1040px] w-full border-separate border-spacing-0">
                      <thead>
                        <tr className="bg-slate-100/80">
                          {['Lead', 'Category', 'Phone', 'Website', 'Address', 'Rating', 'Enriched Emails', 'Searched On'].map(
                            (heading) => (
                              <th
                                key={heading}
                                className="sticky top-0 z-10 border-b border-slate-200 px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"
                              >
                                {heading}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {paginatedLeads.map((lead) => {
                          const website = getLeadWebsite(lead)

                          return (
                            <tr key={lead.rowId} className="group transition hover:bg-slate-50">
                              <td className="border-b border-slate-100 px-5 py-4">
                                <p className="text-sm font-bold text-slate-900">{formatLeadName(lead)}</p>
                                <p className="mt-0.5 text-xs text-slate-400">#{lead.leadIdentifier || lead.id || 'untracked'}</p>
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 text-sm text-slate-600">{lead.category || '-'}</td>
                              <td className="border-b border-slate-100 px-5 py-4 text-sm font-medium text-slate-700">{lead.phone || '-'}</td>
                              <td className="border-b border-slate-100 px-5 py-4 text-sm">
                                {website ? (
                                  <a
                                    href={website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 font-bold text-cyan-700 transition hover:bg-cyan-50"
                                  >
                                    Visit Website
                                  </a>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="max-w-xs border-b border-slate-100 px-5 py-4 text-sm leading-5 text-slate-600">
                                {lead.address || '-'}
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 text-sm">
                                <span className="inline-flex min-w-14 justify-center rounded-full bg-slate-100 px-3 py-1.5 font-bold text-slate-700">
                                  {formatRating(lead.rating)}
                                </span>
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 text-sm font-medium text-slate-600">
                                {getEnrichedEmailSummary(lead)}
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 text-sm font-medium text-slate-500">
                                {formatDate(lead.leadCreatedOn)}
                              </td>
                            </tr>
                          )
                        })}

                        {!loading && filteredLeads.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-5 py-14 text-center">
                              <p className="text-base font-bold text-slate-800">No historical leads yet</p>
                              <p className="mt-1 text-sm text-slate-500">Run a lead search and the saved results will appear here.</p>
                            </td>
                          </tr>
                        ) : null}

                        {loading
                          ? Array.from({ length: 5 }).map((_, index) => (
                              <tr key={`loading-${index}`} className="animate-pulse">
                                {Array.from({ length: 8 }).map((__, cellIndex) => (
                                  <td key={cellIndex} className="border-b border-slate-100 px-5 py-4">
                                    <span className="block h-4 rounded-full bg-slate-100" />
                                  </td>
                                ))}
                              </tr>
                            ))
                          : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {filteredLeads.length > PAGE_SIZE ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4">
                  <p className="text-sm font-medium text-slate-500">
                    Page <span className="font-bold text-slate-800">{visiblePage}</span> of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={visiblePage === 1}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={visiblePage === totalPages}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadSearchHistoryPage
