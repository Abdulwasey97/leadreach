import { useState } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TopNavbar from '../components/layout/TopNavbar'

const teamMembers = [
  { id: 1, name: 'Marcus Thorne', email: 'm.thorne@leadreach.io', access: 'Admin', status: 'Active', activity: '2 minutes ago' },
  { id: 2, name: 'Elena Rodriguez', email: 'e.rodriguez@leadreach.io', access: 'Editor', status: 'Active', activity: '1 hour ago' },
  { id: 3, name: 'Julian Schmidt', email: 'j.schmidt@leadreach.io', access: 'Viewer', status: 'Invited', activity: 'Pending' },
  { id: 4, name: 'Sarah Lin', email: 's.lin@leadreach.io', access: 'Editor', status: 'Active', activity: 'Yesterday' },
]
const settingsTopNavItems = ['Organization', 'Team', 'Field Mapping']
const crmFieldMappings = [
  {
    id: 'fullName',
    label: 'Full Name',
    description: 'Lead Identity',
    salesforceField: 'Full Name (Lead)',
    icon: 'user',
  },
  {
    id: 'company',
    label: 'Company',
    description: 'Firmographic Data',
    salesforceField: 'Account Name',
    icon: 'building',
  },
  {
    id: 'email',
    label: 'Email',
    description: 'Communication Channel',
    salesforceField: 'Email Address',
    icon: 'mail',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn Profile',
    description: 'Social Intelligence',
    salesforceField: 'LinkedIn URL (Custom)',
    icon: 'link',
  },
]

function initials(name) {
  return name
    .split(' ')
    .map((item) => item[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function MappingIcon({ type }) {
  if (type === 'user') {
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21a8 8 0 1 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    )
  }

  if (type === 'building') {
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="3" width="16" height="18" rx="1.5" />
        <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M11 21v-4h2v4" />
      </svg>
    )
  }

  if (type === 'mail') {
    return (
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 13a5 5 0 0 0 7.54.54l2.12-2.12a5 5 0 0 0-7.08-7.08L11.36 5.6" />
      <path d="M14 11a5 5 0 0 0-7.54-.54L4.34 12.58a5 5 0 1 0 7.08 7.08l1.22-1.22" />
    </svg>
  )
}

function SettingsPage({ onNavigate }) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('Organization')

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar activeItem="settings" onNavigate={onNavigate} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar
            searchPlaceholder="Search settings..."
            navItems={settingsTopNavItems}
            activeNavItem={activeSettingsTab}
            onNavItemClick={setActiveSettingsTab}
            showUpgrade={false}
          />

          <div className="flex-1 space-y-5 p-5">
            {activeSettingsTab === 'Team' ? (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight text-slate-800">Team &amp; Access</h2>
                  <p className="text-slate-500">Manage organizational hierarchy and member privileges.</p>
                </div>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
                >
                  <span className="text-base leading-none">+</span>
                  Invite New Member
                </button>
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-4">
                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500">Seat Utilization</p>
                  <p className="mt-2 text-4xl font-extrabold text-slate-800">
                    12 <span className="text-xl font-semibold text-slate-500">/ 20</span>
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <span className="block h-full w-[60%] rounded-full bg-emerald-500" />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">8 seats remaining in your Executive Ledger plan.</p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-4xl font-extrabold text-slate-800">3</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500">Full Administrators</p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-4xl font-extrabold text-slate-800">4</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500">Pending Invitations</p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-4xl font-extrabold text-slate-800">9</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500">Active Today</p>
                </article>
              </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <button type="button" className="cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Filter
                  </button>
                  <button type="button" className="cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Sort By
                  </button>
                </div>
                <p className="text-xs font-medium text-slate-500">Showing 12 team members</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Member Identity</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Access Level</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Account Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Last Activity</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {teamMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                              {initials(member.name)}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                              <p className="text-xs text-slate-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                              member.access === 'Admin'
                                ? 'bg-sky-100 text-sky-700'
                                : member.access === 'Editor'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {member.access}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <span className={`inline-flex items-center gap-1.5 ${member.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                            <span className={`size-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            {member.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{member.activity}</td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" className="cursor-pointer text-xl leading-none text-slate-400 hover:text-slate-600">
                            ...
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
                <button type="button" className="cursor-pointer text-slate-500 hover:text-slate-700">
                  &lt; Previous
                </button>
                <div className="flex items-center gap-2">
                  <button type="button" className="size-7 rounded bg-sky-500 text-xs font-semibold text-white">
                    1
                  </button>
                  <button type="button" className="size-7 rounded text-xs font-semibold text-slate-500 hover:bg-slate-100">
                    2
                  </button>
                  <button type="button" className="size-7 rounded text-xs font-semibold text-slate-500 hover:bg-slate-100">
                    3
                  </button>
                </div>
                <button type="button" className="cursor-pointer text-slate-500 hover:text-slate-700">
                  Next &gt;
                </button>
              </div>
                </section>
              </>
            ) : null}

            {activeSettingsTab === 'Organization' ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <header>
                <h3 className="text-3xl font-bold tracking-tight text-slate-800">Organization Profile</h3>
                <p className="text-slate-500">Manage your enterprise identity, logic rules, and secure access.</p>
              </header>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-2xl font-semibold text-slate-800">Company Identity</h4>
                      <p className="text-sm text-slate-500">Basic identification for your global ledger</p>
                    </div>
                    <button type="button" className="cursor-pointer rounded-md px-2 py-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
                      ...
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[84px_1fr]">
                    <div className="flex h-[84px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-400">
                      <span className="text-2xl">+</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Company Name</p>
                        <p className="mt-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700">Horizon Strategic Group</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Industry</p>
                          <p className="mt-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700">Strategic Consulting</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Website</p>
                          <p className="mt-1 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700">https://horizon.ai</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-2xl font-semibold text-slate-800">Logic Config</h4>
                      <p className="text-sm text-slate-500">Rule-based automation settings</p>
                    </div>
                    <button type="button" className="cursor-pointer rounded-md px-2 py-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
                      ...
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Lead Freshness Threshold</p>
                        <p className="text-xs text-slate-500">Archiving leads older than X days</p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">90 DAYS</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-md bg-white px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Smart Deduplication</p>
                        <p className="text-xs text-slate-500">Prevents redundant entries across teams</p>
                      </div>
                      <span className="inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 p-1">
                        <span className="ml-auto size-4 rounded-full bg-white" />
                      </span>
                    </div>

                    <div className="rounded-md bg-white px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Confidence Score Limit</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <span className="block h-full w-[75%] rounded-full bg-emerald-500" />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                        <span>75% Minimum</span>
                        <span>Optimized for Accuracy</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <article className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div>
                    <h4 className="text-2xl font-semibold text-slate-800">API Credentials</h4>
                    <p className="text-sm text-slate-500">Manage secure access keys for enterprise integrations</p>
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Generate New Key
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Key Label</th>
                        <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Client ID</th>
                        <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Status</th>
                        <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Last Used</th>
                        <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      <tr>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-800">Production Main</p>
                          <p className="text-xs text-slate-500">Created March 12, 2024</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600">lr_pub_8231...9x2</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                            Active
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">2 hours ago</td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" className="cursor-pointer text-slate-400 hover:text-slate-600">
                            ...
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-slate-800">Sandbox Testing</p>
                          <p className="text-xs text-slate-500">Created January 05, 2024</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-600">lr_test_0912...k5m</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                            Inactive
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">3 months ago</td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" className="cursor-pointer text-slate-400 hover:text-slate-600">
                            ...
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-200 bg-sky-50/60 px-4 py-2 text-xs text-slate-600">
                  <span className="font-semibold text-sky-700">Pro Tip:</span> Keep your Secret Keys secure. Never commit them to version control or
                  share them in unencrypted messaging.
                </div>
              </article>
              </section>
            ) : null}

            {activeSettingsTab === 'Field Mapping' ? (
              <section className="rounded-2xl border border-slate-200 bg-[#f3f5f7] p-6 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">Configuration Engine</p>
                <h3 className="mt-1 text-[40px] font-extrabold leading-tight text-slate-800">CRM Field Mapping</h3>
                <p className="mt-2 max-w-3xl text-base text-slate-600">
                  Align your outbound intelligence with your system of record. Bridge LeadReach data attributes to Salesforce standard and
                  custom objects to maintain a high-fidelity database.
                </p>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="grid grid-cols-[1.1fr_1.3fr] gap-6 border-b border-slate-100 bg-slate-50 px-6 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">LeadReach Attribute</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Salesforce Field</p>
                  </div>

                  <div className="divide-y divide-slate-100 px-4 py-2">
                    {crmFieldMappings.map((mapping) => (
                      <div key={mapping.id} className="grid grid-cols-[1.1fr_1.3fr] items-center gap-6 px-2 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex size-10 items-center justify-center rounded-md bg-[#072b42] text-white">
                            <MappingIcon type={mapping.icon} />
                          </span>
                          <div>
                            <p className="text-[22px] font-semibold leading-tight text-slate-800">{mapping.label}</p>
                            <p className="text-xs font-medium text-slate-500">{mapping.description}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-left text-lg font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-200/70"
                        >
                          <span>{mapping.salesforceField}</span>
                          <span className="text-slate-400">
                            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="m5 7 5 6 5-6" />
                            </svg>
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <span className="inline-flex size-5 items-center justify-center rounded-full border border-emerald-500">
                      <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m4 10 4 4 8-8" />
                      </svg>
                    </span>
                    Ready for synchronization
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-700"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
                    >
                      Save Mapping
                    </button>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
