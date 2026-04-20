import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'

function readBootstrapState() {
  return {
    organizationResponse: localStorage.getItem('organization_details_response') || '',
    userResponse: localStorage.getItem('user_details_response') || '',
    bootstrapError: localStorage.getItem('bootstrap_details_error') || '',
    hubspotConnected: localStorage.getItem('hubspot_connected') === 'true',
  }
}

function safeParseJson(value) {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function normalizePossibleJson(value) {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) {
    return value
  }

  const parsed = safeParseJson(trimmed)
  return parsed ?? value
}

function humanizeKey(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function flattenFields(input, prefix = '') {
  const value = normalizePossibleJson(input)

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenFields(item, `${prefix}${prefix ? ' ' : ''}${index + 1}`))
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, nestedValue]) => {
      const nextPrefix = prefix ? `${prefix} ${humanizeKey(key)}` : humanizeKey(key)
      return flattenFields(nestedValue, nextPrefix)
    })
  }

  return [[prefix || 'Value', value]]
}

function formatFieldValue(value) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function DetailCards({ title, fields }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-slate-700">{title}</h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(([key, value]) => (
          <article key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{key}</p>
            <p className="mt-2 break-all text-sm font-medium text-slate-800">{formatFieldValue(value)}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

function SettingsPage({ onNavigate }) {
  const [bootstrapState, setBootstrapState] = useState(() => readBootstrapState())
  const organizationPayload = safeParseJson(bootstrapState.organizationResponse)
  const userPayload = safeParseJson(bootstrapState.userResponse)
  const organizationFields = flattenFields(organizationPayload?.OrgDetails || {})
  const userFields = flattenFields(userPayload?.UserDetails || {})

  const handleRefresh = () => {
    setBootstrapState(readBootstrapState())
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
             
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
           

              {organizationFields.length > 0 ? (
                <DetailCards title="Organization Details" fields={organizationFields} />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-base font-semibold text-slate-700">No data found</p>
                  <p className="mt-1 text-sm text-slate-500">Organization API response is not available yet.</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            

              {userFields.length > 0 ? (
                <DetailCards title="User Details" fields={userFields} />
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-base font-semibold text-slate-700">No data found</p>
                  <p className="mt-1 text-sm text-slate-500">User API response is not available yet.</p>
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
