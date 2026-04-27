export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', active: true },
  { id: 'search', label: 'Lead Search', icon: 'search', active: false },
  { id: 'crm', label: 'CRM Hub', icon: 'users', active: false },
  { id: 'settings', label: 'Settings', icon: 'settings', active: false },
]

export const topNavItems = ['Platform Targeting', 'Email Filters', 'Export']

export const stats = [
  {
    id: 'leads',
    title: 'Total Leads',
    value: '12,842',
    insight: '+14.2% from last month',
    highlighted: false,
  },
  {
    id: 'conversion',
    title: 'Conversion Rate',
    value: '4.82%',
    insight: '+0.4% efficiency',
    highlighted: false,
  },
  {
    id: 'queries',
    title: 'Active Queries',
    value: '853',
    insight: 'Processing in 24 nodes',
    highlighted: true,
  },
]

export const leadChartPoints = [6800, 7000, 6200, 7200, 10400, 12300, 11800, 9200, 6800, 7900, 13800]

export const leadSummaryStats = [
  { id: 'avg-daily', label: 'Avg Daily', value: '428' },
  { id: 'peak-volume', label: 'Peak Volume', value: '1,102' },
  { id: 'bounce-rate', label: 'Bounce Rate', value: '2.1%' },
  { id: 'verified', label: 'Verified', value: '94%' },
]

export const quotas = [
  { id: 'google', platform: 'Google Search Ads', value: 8200, max: 10000, color: 'bg-emerald-500' },
  { id: 'linkedin', platform: 'LinkedIn Outreach', value: 2450, max: 5000, color: 'bg-emerald-500' },
  { id: 'meta', platform: 'Facebook Meta', value: 1100, max: 2500, color: 'bg-green-500' },
  { id: 'instagram', platform: 'Instagram Visuals', value: 920, max: 1000, color: 'bg-red-500' },
]

export const activities = [
  {
    id: 'export',
    title: 'Export Completed',
    detail: 'Financial Sector Lead set (4,200 records) pushed to CRM Hub.',
    when: '2m ago',
    color: 'bg-emerald-500',
  },
  {
    id: 'query',
    title: 'Query Optimization',
    detail: 'System adjusted targeting parameters for LinkedIn API v3.2.',
    when: '1h ago',
    color: 'bg-sky-500',
  },
  {
    id: 'security',
    title: 'Security Audit',
    detail: 'Biometric re-verification successful for Marcus Sterling.',
    when: '5h ago',
    color: 'bg-slate-900',
  },
  {
    id: 'autosync',
    title: 'Auto-Sync Paused',
    detail: 'External database FB_Meta_Global timed out during handshake.',
    when: 'Yesterday',
    color: 'bg-slate-300',
  },
]
