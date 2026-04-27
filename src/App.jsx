import { useEffect, useState } from 'react'
import CrmHubPage from './pages/CrmHubPage'
import DashboardPage from './pages/DashboardPage'
import LeadSearchPage from './pages/LeadSearchPage'
import SettingsPage from './pages/SettingsPage'

const PAGE_STORAGE_KEY = 'leadreach_active_page'
const ALLOWED_PAGES = new Set(['dashboard', 'search', 'crm', 'settings'])

function normalizePageKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

function hasConnectedIntegration(payload) {
  const integrations = payload?.IntegrationList
  return Array.isArray(integrations) && integrations.length > 0
}

function BootstrapLoader() {
  return (
    <svg
      aria-label="loader being flipped clockwise and circled by three white curves fading in and out"
      role="img"
      height="56px"
      width="56px"
      viewBox="0 0 56 56"
      className="loader"
    >
      <clipPath id="sand-mound-top">
        <path
          d="M 14.613 13.087 C 15.814 12.059 19.3 8.039 20.3 6.539 C 21.5 4.789 21.5 2.039 21.5 2.039 L 3 2.039 C 3 2.039 3 4.789 4.2 6.539 C 5.2 8.039 8.686 12.059 9.887 13.087 C 11 14.039 12.25 14.039 12.25 14.039 C 12.25 14.039 13.5 14.039 14.613 13.087 Z"
          className="loader__sand-mound-top"
        />
      </clipPath>
      <clipPath id="sand-mound-bottom">
        <path
          d="M 14.613 20.452 C 15.814 21.48 19.3 25.5 20.3 27 C 21.5 28.75 21.5 31.5 21.5 31.5 L 3 31.5 C 3 31.5 3 28.75 4.2 27 C 5.2 25.5 8.686 21.48 9.887 20.452 C 11 19.5 12.25 19.5 12.25 19.5 C 12.25 19.5 13.5 19.5 14.613 20.452 Z"
          className="loader__sand-mound-bottom"
        />
      </clipPath>
      <g transform="translate(2,2)">
        <g
          transform="rotate(-90,26,26)"
          strokeLinecap="round"
          strokeDashoffset="153.94"
          strokeDasharray="153.94 153.94"
          stroke="hsl(0,0%,100%)"
          fill="none"
        >
          <circle
            transform="rotate(0,26,26)"
            r="24.5"
            cy="26"
            cx="26"
            strokeWidth="2.5"
            className="loader__motion-thick"
          />
          <circle
            transform="rotate(90,26,26)"
            r="24.5"
            cy="26"
            cx="26"
            strokeWidth="1.75"
            className="loader__motion-medium"
          />
          <circle
            transform="rotate(180,26,26)"
            r="24.5"
            cy="26"
            cx="26"
            strokeWidth="1"
            className="loader__motion-thin"
          />
        </g>
        <g transform="translate(13.75,9.25)" className="loader__model">
          <path
            d="M 1.5 2 L 23 2 C 23 2 22.5 8.5 19 12 C 16 15.5 13.5 13.5 13.5 16.75 C 13.5 20 16 18 19 21.5 C 22.5 25 23 31.5 23 31.5 L 1.5 31.5 C 1.5 31.5 2 25 5.5 21.5 C 8.5 18 11 20 11 16.75 C 11 13.5 8.5 15.5 5.5 12 C 2 8.5 1.5 2 1.5 2 Z"
            fill="hsl(var(--hue),90%,85%)"
          />

          <g strokeLinecap="round" stroke="hsl(35,90%,90%)">
            <line
              y2="20.75"
              x2="12"
              y1="15.75"
              x1="12"
              strokeDasharray="0.25 33.75"
              strokeWidth="1"
              className="loader__sand-grain-left"
            />
            <line
              y2="21.75"
              x2="12.5"
              y1="16.75"
              x1="12.5"
              strokeDasharray="0.25 33.75"
              strokeWidth="1"
              className="loader__sand-grain-right"
            />
            <line
              y2="31.5"
              x2="12.25"
              y1="18"
              x1="12.25"
              strokeDasharray="0.5 107.5"
              strokeWidth="1"
              className="loader__sand-drop"
            />
            <line
              y2="31.5"
              x2="12.25"
              y1="14.75"
              x1="12.25"
              strokeDasharray="54 54"
              strokeWidth="1.5"
              className="loader__sand-fill"
            />
            <line
              y2="31.5"
              x2="12"
              y1="16"
              x1="12"
              strokeDasharray="1 107"
              strokeWidth="1"
              stroke="hsl(35,90%,83%)"
              className="loader__sand-line-left"
            />
            <line
              y2="31.5"
              x2="12.5"
              y1="16"
              x1="12.5"
              strokeDasharray="12 96"
              strokeWidth="1"
              stroke="hsl(35,90%,83%)"
              className="loader__sand-line-right"
            />

            <g strokeWidth="0" fill="hsl(35,90%,90%)">
              <path
                d="M 12.25 15 L 15.392 13.486 C 21.737 11.168 22.5 2 22.5 2 L 2 2.013 C 2 2.013 2.753 11.046 9.009 13.438 L 12.25 15 Z"
                clipPath="url(#sand-mound-top)"
              />
              <path
                d="M 12.25 18.5 L 15.392 20.014 C 21.737 22.332 22.5 31.5 22.5 31.5 L 2 31.487 C 2 31.487 2.753 22.454 9.009 20.062 Z"
                clipPath="url(#sand-mound-bottom)"
              />
            </g>
          </g>

          <g strokeWidth="2" strokeLinecap="round" opacity="0.7" fill="none">
            <path
              d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5"
              stroke="hsl(0,0%,100%)"
              className="loader__glare-top"
            />
            <path
              transform="rotate(180,12.25,16.75)"
              d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5"
              stroke="hsla(0,0%,100%,0)"
              className="loader__glare-bottom"
            />
          </g>

          <rect height="2" width="24.5" fill="hsl(var(--hue),90%,50%)" />
          <rect
            height="1"
            width="19.5"
            y="0.5"
            x="2.5"
            ry="0.5"
            rx="0.5"
            fill="hsl(var(--hue),90%,57.5%)"
          />
          <rect
            height="2"
            width="24.5"
            y="31.5"
            fill="hsl(var(--hue),90%,50%)"
          />
          <rect
            height="1"
            width="19.5"
            y="32"
            x="2.5"
            ry="0.5"
            rx="0.5"
            fill="hsl(var(--hue),90%,57.5%)"
          />
        </g>
      </g>
    </svg>
  )
}

function App() {
  const [activePage, setActivePage] = useState(() => {
    const storedPage = localStorage.getItem(PAGE_STORAGE_KEY)
    return ALLOWED_PAGES.has(storedPage) ? storedPage : 'dashboard'
  })
  const [errorToast, setErrorToast] = useState('')
  const [successToast, setSuccessToast] = useState('')
  const [isBootstrapping, setIsBootstrapping] = useState(true)

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
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://leadreach.api-pct.com'

    const bootstrapOrgAndUser = async () => {
      const orgRequestBody = {
        orgIdentifier: 'ORG-2012',
        orgName: 'Prime Cloud Industries',
        orgPrimayEmail: 'prime@cloudtech.com',
        orgPhone: '+92-321-9876543',
        orgAddress: 'Plot 45, G-10 Markaz, Islamabad, Pakistan',
        orgStatus: 'Paid',
      }

      try {
        const orgResponse = await fetch(`${apiBaseUrl}/api/Org/v1/FetchOrganizationDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            DataCenter: 'crm.zoho.com',
            referer: 'https://localhost:44352',
          },
          body: JSON.stringify(orgRequestBody),
        })

        if (!orgResponse.ok) {
          throw new Error(`FetchOrganizationDetails failed (${orgResponse.status})`)
        }

        const orgPayload = await orgResponse.json()
        const orgFailed = orgPayload?.Code === 500 || String(orgPayload?.Status || '').toLowerCase() === 'failure'

        if (orgFailed) {
          throw new Error(orgPayload?.Reason || 'FetchOrganizationDetails failed')
        }

        localStorage.setItem('organization_details_response', JSON.stringify(orgPayload))
        window.dispatchEvent(new Event('organization-details-updated'))

        const orgIdentifier =
          orgPayload?.OrganizationDetails?.orgIdentifier ||
          orgPayload?.OrgDetails?.organizationID ||
          orgPayload?.orgIdentifier ||
          orgRequestBody.orgIdentifier

        localStorage.setItem('organization_identifier', orgIdentifier)

        const userRequestBody = {
          userName: 'hassan.ali',
          userPass: 'P@ssw0rd123',
          userFirstName: 'Hassan',
          userLastName: 'Ali',
          userPhone: '+923259511211',
          userEmail: 'hassan.ali@primecloudtech.net',
          orgIdentifier,
        }

        const userResponse = await fetch(`${apiBaseUrl}/api/User/v1/FetchUserDetails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userRequestBody),
        })

        if (!userResponse.ok) {
          throw new Error(`FetchUserDetails failed (${userResponse.status})`)
        }

        const userPayload = await userResponse.json()
        const userFailed = userPayload?.Code === 500 || String(userPayload?.Status || '').toLowerCase() === 'failure'

        if (userFailed) {
          throw new Error(userPayload?.Reason || 'FetchUserDetails failed')
        }

        localStorage.setItem('user_details_response', JSON.stringify(userPayload))
        localStorage.setItem('user_details', JSON.stringify(userPayload?.UserDetails || {}))

        const integrationListResponse = await fetch(`${apiBaseUrl}/api/Integration/v1/RetrieveIntegrationList`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            DataCenter: 'crm.zoho.com',
            referer: 'https://localhost:44352',
          },
          body: JSON.stringify({
            orgIdentifier,
          }),
        })

        if (!integrationListResponse.ok) {
          throw new Error(`RetrieveIntegrationList failed (${integrationListResponse.status})`)
        }

        const integrationListPayload = await integrationListResponse.json()
        const integrationListFailed =
          integrationListPayload?.Code === 500 || String(integrationListPayload?.Status || '').toLowerCase() === 'failure'

        if (integrationListFailed) {
          throw new Error(integrationListPayload?.Reason || 'RetrieveIntegrationList failed')
        }

        localStorage.setItem('zoho_integration_list_response', JSON.stringify(integrationListPayload))
        localStorage.setItem('zoho_integration_list', JSON.stringify(integrationListPayload?.IntegrationList || []))
        localStorage.setItem('zoho_connected', hasConnectedIntegration(integrationListPayload) ? 'true' : 'false')
        localStorage.removeItem('zoho_integration_error')
        window.dispatchEvent(new Event('zoho-connection-updated'))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to fetch organization/user details'
        localStorage.setItem('bootstrap_details_error', message)
      } finally {
        setIsBootstrapping(false)
      }
    }

    bootstrapOrgAndUser()
  }, [])

  useEffect(() => {
    if (ALLOWED_PAGES.has(activePage)) {
      localStorage.setItem(PAGE_STORAGE_KEY, activePage)
    }
  }, [activePage])

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
          orgIdentifier: 'ORG-2012',
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

        localStorage.setItem('zoho_integration_response', JSON.stringify(payload))

        try {
          const retrieveListRequestBody = {
            orgIdentifier: 'ORG-2012',
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
          localStorage.setItem('zoho_connected', hasConnectedIntegration(retrieveListPayload) ? 'true' : 'false')
          localStorage.removeItem('zoho_integration_error')
          window.dispatchEvent(new Event('zoho-connection-updated'))
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

    if (key === 'settings') {
      setActivePage('settings')
    }
  }

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="text-center">
          <div className="loader-host inline-flex items-center justify-center">
            <BootstrapLoader />
          </div>
          <p className="mt-3 text-base font-semibold text-slate-700">Loading...</p>
        </div>
      </div>
    )
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

  if (activePage === 'settings') {
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
        <SettingsPage onNavigate={handleNavigate} />
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
