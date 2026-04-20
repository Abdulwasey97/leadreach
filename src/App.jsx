import { useEffect, useState } from 'react'
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
  const [errorToast, setErrorToast] = useState('')
  const [successToast, setSuccessToast] = useState('')

  const showErrorToast = (message) => {
    setErrorToast(message)
    window.setTimeout(() => {
      setErrorToast('')
    }, 4000)
  }

  const showSuccessToast = (message) => {
    setSuccessToast(message)
    window.setTimeout(() => {
      setSuccessToast('')
    }, 4000)
  }

  useEffect(() => {
    const handleZohoToast = (event) => {
      const toastType = event?.detail?.type
      const message = event?.detail?.message

      if (!message) {
        return
      }

      if (toastType === 'error') {
        showErrorToast(message)
        return
      }

      showSuccessToast(message)
    }

    window.addEventListener('zoho-toast', handleZohoToast)
    return () => {
      window.removeEventListener('zoho-toast', handleZohoToast)
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const grantCode = params.get('code')

    if (!grantCode) {
      return
    }

    const integrationApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://leadreach.api-pct.com'

    const finalizeOAuth = async () => {
      localStorage.setItem('zoho_grant_code', grantCode)
      localStorage.setItem('zoho_datacenter', 'crm.zoho.com')
      setActivePage('crm')

      try {
        const requestUrl = `${integrationApiBaseUrl}/api/Integration/v1/CreateIntegration`
        const requestBody = {
          orgIdentifier: 'ORG-2002',
          integrationAlias: 'Persona',
          integrationType: 'Zoho',
          GrantCode: grantCode,
          integrationExpiryTime: '3600',
        }
        const requestHeaders = {
          'Content-Type': 'application/json',
          DataCenter: 'crm.zoho.com',
          referer: 'https://localhost:44352',
        }

        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          throw new Error(`CreateIntegration failed (${response.status})`)
        }

        const payload = await response.json()
        const integrationFailed =
          payload?.Code === 500 || String(payload?.Status || '').toLowerCase() === 'failure'

        if (integrationFailed) {
          throw new Error(payload?.Reason || 'CreateIntegration failed')
        }

        localStorage.setItem('zoho_connected', 'true')
        localStorage.setItem('zoho_integration_response', JSON.stringify(payload))
        localStorage.removeItem('zoho_integration_error')
        window.dispatchEvent(new Event('zoho-connection-updated'))

        try {
          const retrieveListRequestBody = {
            orgIdentifier: 'ORG-2002',
          }
          const retrieveListResponse = await fetch(`${integrationApiBaseUrl}/api/Integration/v1/RetrieveIntegrationList`, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(retrieveListRequestBody),
          })

          if (!retrieveListResponse.ok) {
            throw new Error(`RetrieveIntegrationList failed (${retrieveListResponse.status})`)
          }

          const retrieveListPayload = await retrieveListResponse.json()
          const retrieveListFailed =
            retrieveListPayload?.Code === 500 || String(retrieveListPayload?.Status || '').toLowerCase() === 'failure'

          if (retrieveListFailed) {
            throw new Error(retrieveListPayload?.Reason || 'RetrieveIntegrationList failed')
          }

          localStorage.setItem('zoho_integration_list_response', JSON.stringify(retrieveListPayload))
          localStorage.setItem('zoho_integration_list', JSON.stringify(retrieveListPayload?.IntegrationList || []))
          showSuccessToast('Retrieved successfully')
        } catch (error) {
          const failureMessage = error instanceof Error ? error.message : 'RetrieveIntegrationList request failed'
          localStorage.setItem('zoho_integration_error', failureMessage)
          showErrorToast(failureMessage)
        }
      } catch (error) {
        const failureMessage = error instanceof Error ? error.message : 'Integration setup request failed'
        localStorage.setItem('zoho_connected', 'false')
        localStorage.setItem('zoho_integration_error', failureMessage)
        window.dispatchEvent(new Event('zoho-connection-updated'))
        showErrorToast(failureMessage)
      } finally {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }

    finalizeOAuth()
  }, [])

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
    return (
      <>
        {successToast ? (
          <div className="fixed right-4 top-4 z-[1000] rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
            {successToast}
          </div>
        ) : null}
        {errorToast ? (
          <div className="fixed right-4 top-20 z-[1000] rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
            {errorToast}
          </div>
        ) : null}
        <DashboardPage onNavigate={handleNavigate} />
      </>
    )
  }

  if (activePage === 'crm') {
    return (
      <>
        {successToast ? (
          <div className="fixed right-4 top-4 z-[1000] rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
            {successToast}
          </div>
        ) : null}
        {errorToast ? (
          <div className="fixed right-4 top-20 z-[1000] rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
            {errorToast}
          </div>
        ) : null}
        <CrmHubPage onNavigate={handleNavigate} />
      </>
    )
  }

  return (
    <>
      {successToast ? (
        <div className="fixed right-4 top-4 z-[1000] rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {successToast}
        </div>
      ) : null}
      {errorToast ? (
        <div className="fixed right-4 top-20 z-[1000] rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {errorToast}
        </div>
      ) : null}
      <LeadSearchPage onNavigate={handleNavigate} />
    </>
  )
}

export default App
