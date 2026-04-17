export const activeIntegrations = [
  {
    id: 'salesforce',
    name: 'Salesforce Enterprise',
    subtitle: 'Production Instance: SF-4482-X',
    status: 'Connected',
    lastSync: '4 minutes ago',
    volume: '12.4k leads / day',
    icon: 'cloud',
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    subtitle: 'Marketing Hub Professional',
    status: 'Connected',
    lastSync: '12 minutes ago',
    volume: '3.2k leads / day',
    icon: 'hub',
  },
]

export const partnerLibrary = [
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Sales-focused CRM for growing teams.',
    type: 'Sales',
    icon: 'db',
  },
  {
    id: 'zendesk',
    name: 'Zendesk Sell',
    description: 'Modern sales force automation suite.',
    type: 'Support',
    icon: 'sync',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows between 5,000+ apps.',
    type: 'Workflow',
    icon: 'bolt',
  },
]

export const syncSettings = [
  { id: 'auto-export', label: 'Auto-export Leads', description: 'Sync new leads instantly.', enabled: true },
  { id: 'dedupe', label: 'Smart De-duplication', description: 'Prevent duplicate CRM records.', enabled: true },
  { id: 'intent', label: 'Intent Scoring Sync', description: 'Sync priority scores.', enabled: false },
]
