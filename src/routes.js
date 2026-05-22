export const ROUTES = {
  dashboard: '/dashboard',
  search: '/search',
  history: '/history',
  crm: '/crm',
  settings: '/settings',
}

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', path: ROUTES.dashboard },
  { id: 'search', label: 'Lead Search', icon: 'search', path: ROUTES.search },
  { id: 'history', label: 'Search History', icon: 'history', path: ROUTES.history },
  { id: 'crm', label: 'CRM Hub', icon: 'users', path: ROUTES.crm },
  { id: 'settings', label: 'Settings', icon: 'settings', path: ROUTES.settings },
]

const NAV_ID_ALIASES = {
  dashboard: 'dashboard',
  search: 'search',
  leadsearch: 'search',
  history: 'history',
  searchhistory: 'history',
  leadsearchhistory: 'history',
  crm: 'crm',
  crmhub: 'crm',
  settings: 'settings',
}

export function normalizeNavId(value) {
  const key = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
  return NAV_ID_ALIASES[key] || null
}

export function getRoutePath(navId) {
  return ROUTES[normalizeNavId(navId)] || ROUTES.dashboard
}
