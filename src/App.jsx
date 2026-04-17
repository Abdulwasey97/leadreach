import { useState } from 'react'
import CrmHubPage from './pages/CrmHubPage'
import DashboardPage from './pages/DashboardPage'
import LeadSearchPage from './pages/LeadSearchPage'

function normalizePageKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

function App() {
  const [activePage, setActivePage] = useState('search')

  const handleNavigate = (target) => {
    const key = normalizePageKey(target)

    if (key === 'dashboard') {
      setActivePage('dashboard')
      return
    }

    if (key === 'crm' || key === 'crmhub') {
      setActivePage('crm')
      return
    }

    if (key === 'search' || key === 'leadsearch') {
      setActivePage('search')
      return
    }
  }

  if (activePage === 'dashboard') {
    return <DashboardPage onNavigate={handleNavigate} />
  }

  if (activePage === 'crm') {
    return <CrmHubPage onNavigate={handleNavigate} />
  }

  return <LeadSearchPage onNavigate={handleNavigate} />
}

export default App
