import { useEffect, useMemo, useState } from 'react'
import AdvancedFilteringCard from '../components/leadSearch/AdvancedFilteringCard'
import Sidebar from '../components/layout/Sidebar'
import { platformTargets } from '../data/leadSearchData'

const EMAIL_TYPES_BY_CATEGORY = {
  personal: ['gmail', 'outlook', 'hotmail', 'yahoo'],
  business: ['info', 'contact', 'sales', 'support', 'admin'],
}

const SOURCE_TO_API_VALUE = {
  google: 'google',
  facebook: 'fb',
  linkedin: 'linkedin',
}

const SOURCE_TO_USAGE_TYPE = {
  google: 'Google',
  facebook: 'Facebook',
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
  linkedin: {
    enabledKey: 'IsLinkedinSearchEnabled',
    totalKey: 'TotalLinkedinSearchLimit',
    utilizedKey: 'LinkedinSearchLimitUtilized',
  },
}

const USAGE_TYPE_TO_PLATFORM = {
  Google: 'google',
  Facebook: 'facebook',
  LinkedIn: 'linkedin',
}

const EXPORT_MAPPING_FIELDS = ['Name', 'Phone', 'Website', 'Email', 'Address', 'Rating']
const EXPORT_CRM_FIELDS = ['Select', 'Company', 'First Name', 'Last Name', 'Email', 'Phone', 'Website', 'Street', 'Rating', 'Lead Source']
const DEFAULT_EXPORT_FIELD_MAPPINGS = {
  Name: 'Company',
  Phone: 'Phone',
  Website: 'Website',
  Email: 'Email',
  Address: 'Street',
  Rating: 'Rating',
}
const EXPORT_MODULES = [
  { label: 'Leads', value: 'Leads' },
  { label: 'Contacts', value: 'Contacts' },
  { label: 'Accounts', value: 'Accounts' },
  { label: 'Deals', value: 'Deals' },
]

function normalizeModuleList(payload) {
  const source =
    payload?.ModuleList ||
    payload?.Module_List ||
    payload?.Modules ||
    payload?.modules ||
    payload?.data ||
    payload

  if (!Array.isArray(source)) {
    return []
  }

  return source
    .map((module) => {
      if (typeof module === 'string') {
        return { label: module, value: module }
      }

      const label =
        module?.ModuleName ||
        module?.moduleName ||
        module?.displayName ||
        module?.DisplayName ||
        module?.module_label ||
        module?.name ||
        module?.Name ||
        module?.apiName ||
        module?.APIName
      const value =
        module?.ModuleApiName ||
        module?.moduleApiName ||
        module?.module_api_name ||
        module?.apiName ||
        module?.APIName ||
        module?.ModuleName ||
        module?.moduleName ||
        label

      if (!label || !value) {
        return null
      }

      return { label, value }
    })
    .filter(Boolean)
    .filter((module) => module.value !== 'Actions_Performed')
    .filter((module, index, modules) => modules.findIndex((item) => item.value === module.value) === index)
}

function normalizeFieldList(payload) {
  const source =
    payload?.FieldList ||
    payload?.Field_List ||
    payload?.Fields ||
    payload?.fields ||
    payload?.data ||
    payload

  if (!Array.isArray(source)) {
    return []
  }

  return source
    .map((field) => {
      if (typeof field === 'string') {
        return { label: field, value: field }
      }

      const label =
        field?.FieldName ||
        field?.fieldName ||
        field?.displayName ||
        field?.DisplayName ||
        field?.field_Label ||
        field?.label ||
        field?.Label ||
        field?.name ||
        field?.Name ||
        field?.apiName ||
        field?.APIName
      const value =
        field?.FieldApiName ||
        field?.fieldApiName ||
        field?.field_api_name ||
        field?.apiName ||
        field?.APIName ||
        field?.FieldName ||
        field?.fieldName ||
        label

      if (!label || !value) {
        return null
      }

      return { label, value }
    })
    .filter(Boolean)
    .filter((field, index, fields) => fields.findIndex((item) => item.value === field.value) === index)
}

function SortIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m7 6 3-3 3 3" />
      <path d="m13 14-3 3-3-3" />
    </svg>
  )
}

function getLeadIdentifier(lead) {
  const value =
    lead?.leadIdentifier ??
    lead?.LeadIdentifier ??
    lead?.leadId ??
    lead?.LeadId ??
    lead?.placeId ??
    lead?.place_id ??
    lead?.entityUrn ??
    lead?.publicIdentifier

  if (value != null && String(value).trim() !== '') {
    return String(value).trim()
  }

  return ''
}

function normalizeLookupLead(lead) {
  const leadIdentifier = getLeadIdentifier(lead)
  return leadIdentifier ? { ...lead, leadIdentifier } : lead
}

function getLeadDisplayName(lead) {
  const first = String(lead?.firstName || '').trim()
  const last = String(lead?.lastName || '').trim()
  if (first && last) {
    return `${first} ${last}`
  }
  if (lead?.Name != null && String(lead.Name).trim() !== '') {
    return String(lead.Name).trim()
  }
  if (lead?.name != null && String(lead.name).trim() !== '') {
    return String(lead.name).trim()
  }
  return first || last || '-'
}

function getLeadWebsite(lead) {
  const publicIdentifier = String(lead?.publicIdentifier || '').trim()
  const linkedinProfileUrl = publicIdentifier ? `https://www.linkedin.com/in/${publicIdentifier}/` : ''
  const w = lead?.website ?? lead?.Website ?? lead?.url ?? lead?.Url ?? lead?.companylink ?? lead?.profileUrl ?? linkedinProfileUrl ?? ''
  return String(w || '').trim()
}

function getLeadWebsiteLabel(lead, selectedSource) {
  const website = String(lead?.website ?? lead?.Website ?? '').trim()
  if (website) {
    return 'Visit Website'
  }

  const leadSource = String(lead?.LeadSource || lead?.leadSource || '').toLowerCase()
  if (selectedSource === 'linkedin' || leadSource === 'linkedin') {
    return 'View Profile'
  }
  if (leadSource === 'facebook') {
    return 'View Page'
  }
  return 'Visit Website'
}

function getLeadPhone(lead) {
  return String(lead?.phone ?? lead?.Phone ?? lead?.phoneNumber ?? '').trim() || '-'
}

function getLeadAddress(lead) {
  return String(lead?.address ?? lead?.Address ?? lead?.location ?? lead?.PageIntro ?? '').trim() || '-'
}

function extractEmailFromText(value) {
  const match = String(value || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match?.[0] || ''
}

function getLeadEmails(lead, fallbackEmails = []) {
  if (fallbackEmails.length > 0) {
    return fallbackEmails
  }

  const enrichedEmails = Array.isArray(lead?.EnrichedEmails)
    ? lead.EnrichedEmails.map((item) => String(item?.emailAddress || '').trim()).filter(Boolean)
    : []

  if (enrichedEmails.length > 0) {
    return enrichedEmails
  }

  return [
    lead?.email,
    lead?.Email,
    lead?.emailAddress,
    lead?.EmailAddress,
    extractEmailFromText(lead?.headline),
  ]
    .map((email) => String(email || '').trim())
    .filter(Boolean)
}

function getLeadRatingLabel(lead) {
  const rating = lead?.rating ?? lead?.Rating
  const reviews = lead?.reviews ?? lead?.reviewCount ?? lead?.RatingCount

  if (rating != null && String(rating).trim() !== '') {
    const ratingLabel = String(rating).trim()
    if (reviews != null && String(reviews).trim() !== '' && !ratingLabel.toLowerCase().includes('review')) {
      return `${ratingLabel} (${reviews} reviews)`
    }
    return ratingLabel
  }

  if (reviews != null && String(reviews).trim() !== '') {
    return `${reviews} reviews`
  }

  return ''
}

function pickEnrichedEmailsFromPayload(payload) {
  const captured = payload?.CapturedEmails ?? payload?.capturedEmails
  if (Array.isArray(captured) && captured.length > 0) {
    return captured.map((e) => String(e).trim()).filter(Boolean)
  }

  const direct =
    payload?.emailAddress ??
    payload?.EmailAddress ??
    payload?.email ??
    payload?.Email ??
    payload?.enrichedEmail ??
    null
  if (direct) {
    return [String(direct)]
  }

  const list = payload?.EnrichedEmails ?? payload?.enrichedEmails
  if (Array.isArray(list) && list[0]?.emailAddress) {
    return list.map((item) => String(item?.emailAddress || '').trim()).filter(Boolean)
  }

  return []
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

const getWalletIdentifierFromStorage = () => {
  const orgPayload = safeParseJson(localStorage.getItem('organization_details_response') || '{}')
  return (
    orgPayload?.OrganizationDetails?.walletIdentifier ||
    orgPayload?.OrgDetails?.walletIdentifier ||
    localStorage.getItem('usage_details_wallet_identifier') ||
    'Wal775AAC24994C'
  )
}

const findNestedValue = (source, keys) => {
  if (!source || typeof source !== 'object') {
    return ''
  }

  for (const key of keys) {
    if (source[key]) {
      return source[key]
    }
  }

  for (const value of Object.values(source)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const nestedValue = findNestedValue(item, keys)
        if (nestedValue) {
          return nestedValue
        }
      }
    } else if (value && typeof value === 'object') {
      const nestedValue = findNestedValue(value, keys)
      if (nestedValue) {
        return nestedValue
      }
    }
  }

  return ''
}

const getIntegrationOrgIdentifierFromStorage = () =>
  localStorage.getItem('module_list_org_identifier') ||
  localStorage.getItem('field_list_org_identifier') ||
  localStorage.getItem('organization_identifier') ||
  import.meta.env.VITE_MODULE_LIST_ORG_IDENTIFIER ||
  import.meta.env.VITE_FIELD_LIST_ORG_IDENTIFIER ||
  ''

const getIntegrationAccessTokenFromStorage = () => {
  const directToken =
    localStorage.getItem('integration_access_token') ||
    localStorage.getItem('field_list_integration_access_token') ||
    import.meta.env.VITE_INTEGRATION_ACCESS_TOKEN ||
    import.meta.env.VITE_FIELD_LIST_INTEGRATION_ACCESS_TOKEN ||
    ''

  if (directToken) {
    return directToken
  }

  const integrationList = safeParseJson(localStorage.getItem('zoho_integration_list') || '[]')
  const integrationListResponse = safeParseJson(localStorage.getItem('zoho_integration_list_response') || '{}')
  const tokenKeys = [
    'integrationAccessToken',
    'IntegrationAccessToken',
    'accessToken',
    'AccessToken',
    'access_token',
    'access_Token',
    'token',
    'Token',
  ]

  return findNestedValue(integrationList, tokenKeys) || findNestedValue(integrationListResponse, tokenKeys) || ''
}

async function postUpdateUsage(apiBaseUrl, { orgIdentifier, walletIdentifier, usageType }) {
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

  return usagePayload
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

function LeadSearchPage() {
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
  const [enrichLoadingByRow, setEnrichLoadingByRow] = useState({})
  const [enrichEmailsByRow, setEnrichEmailsByRow] = useState({})
  const [enrichCompletedByRow, setEnrichCompletedByRow] = useState({})
  const [orgWallet, setOrgWallet] = useState(() => getOrgWalletFromStorage())
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportModule, setExportModule] = useState('')
  const [exportStep, setExportStep] = useState(1)
  const [exportModules, setExportModules] = useState(EXPORT_MODULES)
  const [exportModulesLoading, setExportModulesLoading] = useState(false)
  const [exportModulesError, setExportModulesError] = useState('')
  const [crmFields, setCrmFields] = useState(EXPORT_CRM_FIELDS.map((field) => ({ label: field, value: field })))
  const [crmFieldsLoading, setCrmFieldsLoading] = useState(false)
  const [crmFieldsError, setCrmFieldsError] = useState('')
  const [exportFieldMappings, setExportFieldMappings] = useState(DEFAULT_EXPORT_FIELD_MAPPINGS)
  const [exportSubmitting, setExportSubmitting] = useState(false)

  const selectedCount = useMemo(
    () => Object.values(selectedRows).filter(Boolean).length,
    [selectedRows],
  )

  const selectedExportModule = useMemo(
    () => exportModules.find((module) => module.value === exportModule),
    [exportModule, exportModules],
  )

  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil((totalLeads || leads.length) / PAGE_SIZE))
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return leads.slice(startIndex, startIndex + PAGE_SIZE)
  }, [currentPage, leads])

  useEffect(() => {
    if (!showExportModal) {
      return undefined
    }

    const controller = new AbortController()
    const moduleListApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44352'

    const fetchExportModules = async () => {
      setExportModulesLoading(true)
      setExportModulesError('')

      try {
        const response = await fetch(`${moduleListApiBaseUrl}/api/Integration/v1/Module_List`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            DataCenter: 'crm.zoho.com',
            referer: 'https://localhost:44352',
          },
          body: JSON.stringify({
            orgIdentifier: getIntegrationOrgIdentifierFromStorage(),
            integrationAccessToken: getIntegrationAccessTokenFromStorage(),
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Module_List failed (${response.status})`)
        }

        const payload = await response.json()
        const modules = normalizeModuleList(payload)

        if (!modules.length) {
          throw new Error('No modules were returned')
        }

        setExportModules(modules)
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name === 'AbortError') {
          return
        }

        setExportModules(EXPORT_MODULES)
        setExportModulesError(requestError instanceof Error ? requestError.message : 'Module_List request failed')
      } finally {
        if (!controller.signal.aborted) {
          setExportModulesLoading(false)
        }
      }
    }

    fetchExportModules()

    return () => controller.abort()
  }, [showExportModal])

  useEffect(() => {
    if (!showExportModal || exportStep !== 2) {
      return undefined
    }

    const controller = new AbortController()
    const fieldListApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44352'

    const fetchCrmFields = async () => {
      setCrmFieldsLoading(true)
      setCrmFieldsError('')

      try {
        const response = await fetch(`${fieldListApiBaseUrl}/api/Integration/v1/Field_List`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            DataCenter: 'crm.zoho.com',
            referer: 'https://localhost:44352',
          },
          body: JSON.stringify({
            orgIdentifier: getIntegrationOrgIdentifierFromStorage(),
            integrationAccessToken: getIntegrationAccessTokenFromStorage(),
            moduleName: exportModule,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Field_List failed (${response.status})`)
        }

        const payload = await response.json()
        const fields = normalizeFieldList(payload)

        if (!fields.length) {
          throw new Error('No fields were returned')
        }

        setCrmFields([{ label: 'Select', value: 'Select' }, ...fields])
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name === 'AbortError') {
          return
        }

        setCrmFields(EXPORT_CRM_FIELDS.map((field) => ({ label: field, value: field })))
        setCrmFieldsError(requestError instanceof Error ? requestError.message : 'Field_List request failed')
      } finally {
        if (!controller.signal.aborted) {
          setCrmFieldsLoading(false)
        }
      }
    }

    fetchCrmFields()

    return () => controller.abort()
  }, [exportModule, exportStep, showExportModal])
  const currentPageRowKeys = useMemo(
    () =>
      paginatedLeads.map((lead, index) => {
        const id = getLeadIdentifier(lead)
        const label = getLeadDisplayName(lead)
        return id ? `${id}-${label}` : `${label}-${(currentPage - 1) * PAGE_SIZE + index}`
      }),
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
      const timeoutId = window.setTimeout(() => {
        setSelectedSource(availablePlatformIds[0])
      }, 0)

      return () => window.clearTimeout(timeoutId)
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

      const rawList = Array.isArray(payload?.Leads) ? payload.Leads : Array.isArray(payload?.leads) ? payload.leads : []
      const list = rawList.map(normalizeLookupLead)
      setLeads(list)
      setTotalLeads(Number(payload?.TotalLeads ?? payload?.totalEmails) || list.length)
      setSelectedRows({})
      setEnrichEmailsByRow({})
      setEnrichCompletedByRow({})
      setEnrichLoadingByRow({})
      setCurrentPage(1)

      try {
        const usageType = resolveUsageTypeFromPayload(payload, selectedSource)
        const usagePlatform = USAGE_TYPE_TO_PLATFORM[usageType]

        if (usagePlatform && !isPlatformAvailable(usagePlatform, orgWallet)) {
          throw new Error(`${usageType} quota is exhausted. Update_Usage was skipped.`)
        }

        await postUpdateUsage(apiBaseUrl, { orgIdentifier, walletIdentifier, usageType })
      } catch (usageError) {
        localStorage.setItem('usage_details_error', usageError instanceof Error ? usageError.message : 'Update_Usage failed')
      }
    } catch (requestError) {
      setLeads([])
      setTotalLeads(0)
      setSelectedRows({})
      setEnrichEmailsByRow({})
      setEnrichCompletedByRow({})
      setEnrichLoadingByRow({})
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

  const getExportRowKey = (lead, index) => {
    const id = getLeadIdentifier(lead)
    const label = getLeadDisplayName(lead)
    return id ? `${id}-${label}` : `${label}-${index}`
  }

  const getExportSourceValue = (lead, field, rowKey) => {
    if (field === 'Name') {
      return getLeadDisplayName(lead) === '-' ? '' : getLeadDisplayName(lead)
    }

    if (field === 'Phone') {
      return getLeadPhone(lead) === '-' ? '' : getLeadPhone(lead)
    }

    if (field === 'Website') {
      return getLeadWebsite(lead)
    }

    if (field === 'Email') {
      return getLeadEmails(lead, enrichEmailsByRow[rowKey] || [])[0] || ''
    }

    if (field === 'Address') {
      return getLeadAddress(lead) === '-' ? '' : getLeadAddress(lead)
    }

    if (field === 'Rating') {
      return getLeadRatingLabel(lead)
    }

    return ''
  }

  const buildExportData = () => {
    const selectedLeads = leads
      .map((lead, index) => ({ lead, rowKey: getExportRowKey(lead, index) }))
      .filter(({ rowKey }) => selectedCount === 0 || selectedRows[rowKey])

    return selectedLeads
      .map(({ lead, rowKey }) => {
        const mappedRecord = {}

        EXPORT_MAPPING_FIELDS.forEach((field) => {
          const crmField = exportFieldMappings[field]
          if (!crmField || crmField === 'Select') {
            return
          }

          mappedRecord[crmField] = getExportSourceValue(lead, field, rowKey)
        })

        return mappedRecord
      })
      .filter((record) => Object.keys(record).length > 0)
  }

  const handleOpenExportModal = () => {
    setExportModule('')
    setExportStep(1)
    setExportFieldMappings(DEFAULT_EXPORT_FIELD_MAPPINGS)
    setShowExportModal(true)
  }

  const handleCloseExportModal = () => {
    setShowExportModal(false)
    setExportStep(1)
  }

  const handleExportNext = async () => {
    if (exportStep === 1) {
      setExportStep(2)
      return
    }

    if (exportStep === 2) {
      setExportStep(3)
      return
    }

    const dataToExport = buildExportData()
    if (!dataToExport.length) {
      window.dispatchEvent(new CustomEvent('zoho-toast', { detail: { type: 'error', message: 'No lead data is available to export.' } }))
      return
    }

    setExportSubmitting(true)

    try {
      const exportApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:44352'
      const integrationAccessToken = getIntegrationAccessTokenFromStorage()
      if (!integrationAccessToken) {
        throw new Error('Missing integration access token. Please reconnect Zoho and try again.')
      }

      const response = await fetch(`${exportApiBaseUrl}/api/Integration/ExportToCrm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integrationType: 'Zoho',
          integrationAccessToken,
          moduleName: exportModule,
          dataToExport,
        }),
      })

      if (!response.ok) {
        throw new Error(`ExportToCrm failed (${response.status})`)
      }

      const payload = await response.json().catch(() => ({}))
      const exportFailed =
        payload?.Code === 500 ||
        (payload?.Status && String(payload.Status).toLowerCase() !== 'success' && payload.Code !== 200)

      if (exportFailed) {
        throw new Error(payload?.Reason || 'ExportToCrm failed')
      }

      window.dispatchEvent(
        new CustomEvent('zoho-toast', {
          detail: {
            type: 'success',
            message:
              payload?.Reason ||
              `Exported ${dataToExport.length} lead${dataToExport.length === 1 ? '' : 's'} to ${selectedExportModule?.label || exportModule}.`,
          },
        }),
      )
      setShowExportModal(false)
      setExportStep(1)
    } catch (exportError) {
      window.dispatchEvent(
        new CustomEvent('zoho-toast', {
          detail: { type: 'error', message: exportError instanceof Error ? exportError.message : 'ExportToCrm request failed' },
        }),
      )
    } finally {
      setExportSubmitting(false)
    }
  }

  const handleEnrichEmail = async (lead, rowKey) => {
    const orgIdentifier = localStorage.getItem('organization_identifier') || 'ORG-2012'
    const leadIdentifier = getLeadIdentifier(lead)
    const leadName = getLeadDisplayName(lead)
    const leadWebsite = getLeadWebsite(lead)
    const leadSource = selectedSource

    if (!leadIdentifier) {
      window.dispatchEvent(
        new CustomEvent('zoho-toast', {
          detail: { type: 'error', message: 'This lead has no identifier; email enrichment cannot be requested.' },
        }),
      )
      return
    }
    if (!leadWebsite) {
      window.dispatchEvent(
        new CustomEvent('zoho-toast', {
          detail: { type: 'error', message: 'Add or select a lead with a website URL to enrich email.' },
        }),
      )
      return
    }

    setEnrichLoadingByRow((prev) => ({ ...prev, [rowKey]: true }))
    try {
      const response = await fetch(`${apiBaseUrl}/api/Leads/v1/Enrich_Email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgIdentifier,
          leadIdentifier,
          leadName: leadName === '-' ? '' : leadName,
          leadWebsite,
          leadSource,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      const ok = response.ok && payload?.Code === 200 && String(payload?.Status || '').toLowerCase() === 'success'

      if (!ok) {
        const message = payload?.Reason || `Enrich email failed (${response.status})`
        window.dispatchEvent(new CustomEvent('zoho-toast', { detail: { type: 'error', message } }))
        return
      }

      const emails = pickEnrichedEmailsFromPayload(payload)
      setEnrichCompletedByRow((prev) => ({ ...prev, [rowKey]: true }))
      if (emails.length > 0) {
        setEnrichEmailsByRow((prev) => ({ ...prev, [rowKey]: emails }))
      }

      window.dispatchEvent(
        new CustomEvent('zoho-toast', {
          detail: {
            type: 'success',
            message: payload?.Reason || 'Successfully captured lead emails.',
          },
        }),
      )

      try {
        const walletIdentifier = getWalletIdentifierFromStorage()
        await postUpdateUsage(apiBaseUrl, {
          orgIdentifier,
          walletIdentifier,
          usageType: 'EmailEnrichment',
        })
        setOrgWallet(getOrgWalletFromStorage())
        window.dispatchEvent(new Event('organization-details-updated'))
      } catch (usageError) {
        localStorage.setItem(
          'usage_details_error',
          usageError instanceof Error ? usageError.message : 'Update_Usage failed',
        )
      }
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent('zoho-toast', {
          detail: { type: 'error', message: err instanceof Error ? err.message : 'Email enrichment request failed.' },
        }),
      )
    } finally {
      setEnrichLoadingByRow((prev) => {
        const next = { ...prev }
        delete next[rowKey]
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1 p-5">
            <main className="w-full min-w-0 space-y-5">
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
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Search Results</h3>
                    <p className="text-sm text-slate-500">
                      {loading ? 'Fetching results from Zoho CRM...' : `${totalLeads} leads found`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenExportModal}
                      disabled={leads.length === 0}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 3v12" />
                        <path d="m7 10 5 5 5-5" />
                        <path d="M5 21h14" />
                      </svg>
                      Export
                    </button>
                    <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                      Selected: {selectedCount}
                    </div>
                  </div>
                </div>

                {error ? (
                  <p className="px-5 py-4 text-sm font-medium text-red-600">{error}</p>
                ) : null}

                <div className="overflow-x-auto">
                  <table className="min-w-[1120px] w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="w-12 border-b border-slate-200 px-4 py-3 text-left">
                          <button
                            type="button"
                            onClick={handleSelectAll}
                            className={`inline-flex size-4 items-center justify-center rounded-full border transition ${
                              allRowsSelected
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-300 bg-white text-transparent hover:border-cyan-500'
                            }`}
                            aria-label="Select all visible rows"
                          >
                            <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="m4 8 2.4 2.4L12 5" />
                            </svg>
                          </button>
                        </th>
                        {['Name', 'Phone', 'Website', 'Email', 'Address', 'Rating'].map((heading) => (
                          <th key={heading} className="border-b border-slate-200 px-4 py-3 text-left text-xs font-medium text-slate-900">
                            <span className="inline-flex items-center gap-2">
                              {heading}
                              {['Name', 'Rating'].includes(heading) ? <SortIcon /> : null}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {paginatedLeads.map((lead, index) => {
                        const absoluteIndex = (currentPage - 1) * PAGE_SIZE + index
                        const leadIdentifier = getLeadIdentifier(lead)
                        const leadName = getLeadDisplayName(lead)
                        const leadWebsite = getLeadWebsite(lead)
                        const rowKey = leadIdentifier
                          ? `${leadIdentifier}-${leadName}`
                          : `${leadName}-${absoluteIndex}`
                        const isSelected = Boolean(selectedRows[rowKey])
                        const lookupEmails = getLeadEmails(lead)
                        const emails = getLeadEmails(lead, enrichEmailsByRow[rowKey] || [])
                        const canEnrichEmail = lookupEmails.length === 0 && !enrichCompletedByRow[rowKey]
                        const leadRating = getLeadRatingLabel(lead)

                        return (
                          <tr key={rowKey} className={`group transition ${isSelected ? 'bg-cyan-50/50' : 'hover:bg-slate-50'}`}>
                            <td className="border-b border-slate-100 px-4 py-4">
                              <button
                                type="button"
                                onClick={() => handleRowSelection(rowKey)}
                                className={`inline-flex size-4 items-center justify-center rounded-full border transition ${
                                  isSelected
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : 'border-slate-300 bg-white text-transparent hover:border-cyan-500'
                                }`}
                                aria-label={`Select ${leadName}`}
                              >
                                <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="m4 8 2.4 2.4L12 5" />
                                </svg>
                              </button>
                            </td>
                          <td className="border-b border-slate-100 px-4 py-4">
                              <p className="max-w-[300px] text-sm font-semibold text-slate-900">{leadName}</p>
                            </td>
                            <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-700">{getLeadPhone(lead)}</td>
                            <td className="border-b border-slate-100 px-4 py-4 text-sm">
                              {leadWebsite ? (
                                <a href={leadWebsite} target="_blank" rel="noreferrer" className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-cyan-700 transition hover:border-cyan-200 hover:bg-cyan-50">
                                  {getLeadWebsiteLabel(lead, selectedSource)}
                                </a>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-700">
                              <div className="flex flex-wrap items-center gap-2">
                                {emails.length ? (
                                  <div
                                    className="flex min-w-0 max-w-[220px] flex-col gap-0.5 text-slate-800"
                                    title={emails.join('\n')}
                                  >
                                    {emails.map((email, emailIndex) => (
                                      <a
                                        key={`${rowKey}-${emailIndex}-${email}`}
                                        href={`mailto:${email}`}
                                        className="truncate text-sm text-cyan-700 hover:underline"
                                      >
                                        {email}
                                      </a>
                                    ))}
                                  </div>
                                ) : enrichCompletedByRow[rowKey] ? (
                                  <span className="text-sm text-slate-400">—</span>
                                ) : null}
                                {canEnrichEmail ? (
                                  <button
                                    type="button"
                                    aria-label="Enrich email"
                                    disabled={Boolean(enrichLoadingByRow[rowKey])}
                                    onClick={() => handleEnrichEmail(lead, rowKey)}
                                    className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {enrichLoadingByRow[rowKey] ? (
                                      <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                      </svg>
                                    ) : (
                                      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                      </svg>
                                    )}
                                  </button>
                                ) : null}
                              </div>
                            </td>
                            <td className="max-w-md border-b border-slate-100 px-4 py-4 text-sm leading-6 text-slate-600">{getLeadAddress(lead)}</td>
                            <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-700">
                              {leadRating ? (
                                <span className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-1 font-medium">
                                  {leadRating}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      {!loading && leads.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
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

            {showExportModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-[2px]">
                <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4">
                    <div>
                      <h3 className="text-2xl font-bold text-cyan-700">Import Data</h3>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                        Step {exportStep} of 3
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseExportModal}
                      className="inline-flex size-9 items-center justify-center rounded-md border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-900"
                      aria-label="Close export modal"
                    >
                      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>

                  {exportStep === 1 ? (
                    <div className="bg-white px-7 py-10">
                      <div className="mx-auto max-w-xs text-center">
                        <label htmlFor="export-module" className="text-xl font-bold text-cyan-700">
                          Select Module
                        </label>
                        <div className="relative mt-3">
                          <select
                            id="export-module"
                            value={exportModule}
                            onChange={(event) => setExportModule(event.target.value)}
                            disabled={exportModulesLoading}
                            className="h-11 w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-cyan-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 disabled:cursor-wait disabled:bg-slate-50"
                          >
                            <option value="">{exportModulesLoading ? 'Loading modules...' : 'Select'}</option>
                            {exportModules.map((module) => (
                              <option key={module.value} value={module.value}>
                                {module.label}
                              </option>
                            ))}
                          </select>
                          <svg
                            viewBox="0 0 20 20"
                            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="m6 8 4 4 4-4" />
                          </svg>
                        </div>
                        {exportModulesError ? <p className="mt-2 text-xs text-amber-700">{exportModulesError}</p> : null}
                      </div>

                      <div className="mt-6 flex items-start justify-between gap-4 rounded-lg border border-cyan-100 bg-cyan-50 px-5 py-4 text-sm leading-7 text-slate-700 shadow-sm">
                        <p className="border-l-2 border-cyan-400 pl-4">
                          It is recommended to setup <span className="font-bold text-slate-900">Decimal Fields</span> for mapping{' '}
                          <span className="font-bold text-slate-900">Latitude</span>, <span className="font-bold text-slate-900">Longitude</span>,{' '}
                          <span className="font-bold text-slate-900">Rating</span> etc in your{' '}
                          <span className="font-bold text-slate-900">CRM Module</span> before attempting data import.
                        </p>
                        <button
                          type="button"
                          className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-cyan-700"
                          aria-label="Dismiss export recommendation"
                        >
                          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : exportStep === 2 ? (
                    <div className="bg-white px-7 py-5">
                      <div className="flex items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">
                        <p>
                          You must map <span className="font-semibold">"Last Name"</span> because these are the required fields in this module.
                        </p>
                        <button
                          type="button"
                          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-amber-900 transition hover:bg-amber-100 hover:text-slate-950"
                          aria-label="Dismiss required field warning"
                        >
                          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>

                      <h4 className="mt-4 text-sm font-bold text-slate-800">
                        {selectedExportModule?.label || exportModule} ( Mapping )
                      </h4>
                      <div className="mt-3 max-h-[260px] overflow-y-auto rounded-lg border border-slate-200 shadow-sm">
                        {EXPORT_MAPPING_FIELDS.map((field) => (
                          <div key={field} className="grid grid-cols-[1fr_1.45fr] items-center border-b border-slate-100 bg-white last:border-b-0 hover:bg-slate-50/70">
                            <div className="px-4 py-3 text-sm font-semibold text-slate-700">{field}</div>
                            <div className="border-l border-slate-100 px-4 py-2">
                              <div className="relative">
                                <select
                                  value={exportFieldMappings[field] || 'Select'}
                                  onChange={(event) =>
                                    setExportFieldMappings((prev) => ({
                                      ...prev,
                                      [field]: event.target.value,
                                    }))
                                  }
                                  disabled={crmFieldsLoading}
                                  className="h-10 w-full cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none transition hover:border-cyan-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 disabled:cursor-wait disabled:bg-slate-50"
                                >
                                  {crmFieldsLoading ? <option value="">Loading fields...</option> : null}
                                  {crmFields.map((crmField) => (
                                    <option key={crmField.value} value={crmField.value}>
                                      {crmField.label}
                                    </option>
                                  ))}
                                </select>
                                <svg
                                  viewBox="0 0 20 20"
                                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                >
                                  <path d="m6 8 4 4 4-4" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {crmFieldsError ? <p className="mt-2 text-xs text-amber-700">{crmFieldsError}</p> : null}
                    </div>
                  ) : (
                    <div className="bg-white px-7 py-10">
                      <div className="mx-auto max-w-sm text-center">
                        <h4 className="text-xl font-bold text-cyan-700">Summary</h4>
                        <div className="mt-7 space-y-4 rounded-lg border border-slate-200 bg-slate-50 px-5 py-5 text-base shadow-sm">
                          <p className="text-slate-600">
                            <span className="font-bold text-slate-800">Selected Module:</span>{' '}
                            {selectedExportModule?.label || exportModule}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-bold text-slate-800">Review Locale:</span> Field{' '}
                            <span className="text-slate-700">✓</span>
                          </p>
                          <p className="text-slate-600">
                            <span className="font-bold text-slate-800">Records Selected:</span>{' '}
                            {selectedCount || leads.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/80 px-5 py-4">
                    {exportStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setExportStep((prev) => Math.max(1, prev - 1))}
                        className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                      >
                        Previous
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleExportNext}
                      disabled={(exportStep === 1 && !exportModule) || exportSubmitting}
                      className={`rounded-full border px-5 py-2 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        exportStep === 3
                          ? 'border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100'
                          : 'border-cyan-200 bg-white text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50'
                      }`}
                    >
                      {exportSubmitting ? 'Importing...' : exportStep === 3 ? 'Import' : 'Next'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeadSearchPage
