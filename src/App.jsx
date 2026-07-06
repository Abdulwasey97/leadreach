import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import CrmHubPage from './pages/CrmHubPage'
import DashboardPage from './pages/DashboardPage'
import LeadSearchHistoryPage from './pages/LeadSearchHistoryPage'
import LeadSearchPage from './pages/LeadSearchPage'
import NotFoundPage from './pages/NotFoundPage'
import SettingsPage from './pages/SettingsPage'
import { ROUTES } from './routes'
import {
  createZohoIntegration,
  getStoredOrgIdentifier,
  initializeZohoWidgetSdk,
  retrieveZohoIntegrationList,
} from './services/zohoIntegration'
import { crmError, crmLog } from './utils/diagnostics'

function safeParseJson(value, fallback = {}) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function hasConnectedIntegration(payload) {
  const integrations = payload?.IntegrationList
  return Array.isArray(integrations) && integrations.length > 0
}

function getIntegrationAccessToken(payload) {
  const integrations = payload?.IntegrationList
  if (!Array.isArray(integrations)) {
    return ''
  }

  const integration = integrations.find((item) => item?.access_Token) || integrations[0]
  return integration?.access_Token || ''
}

function isKnownAppPath(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  return normalizedPath === '/' || normalizedPath === '/home' || Object.values(ROUTES).includes(normalizedPath)
}

function getCurrentOrganizationIdentifier() {
  return localStorage.getItem('organization_identifier') || getStoredOrgIdentifier()
}

function isZohoCrmIframeContext() {
  return window.self !== window.top || /(^|\.)zoho\./i.test(document.referrer)
}

function firstArrayItem(value) {
  return Array.isArray(value) ? value[0] || {} : {}
}

function firstObjectFromPayload(payload, keys) {
  if (Array.isArray(payload)) {
    return firstArrayItem(payload)
  }

  for (const key of keys) {
    const value = payload?.[key]

    if (Array.isArray(value)) {
      return firstArrayItem(value)
    }

    if (value && typeof value === 'object') {
      return value
    }
  }

  return {}
}

function getZohoSdkOrgIdentifier(org) {
  return (
    org?.zgid ||
    org?.id ||
    org?.org_id ||
    org?.organization_id ||
    org?.organizationID ||
    org?.company_id ||
    ''
  )
}

function getZohoSdkOrgName(org) {
  return org?.company_name || org?.name || org?.organization_name || org?.organizationName || ''
}

function normalizeZohoSdkOrgResponse(orgResponse) {
  const org = firstObjectFromPayload(orgResponse, ['org', 'org_info', 'organization', 'data'])
  const organizationID = getZohoSdkOrgIdentifier(org)

  return {
    Code: 200,
    Status: 'Success',
    Reason: 'Retrieved from Zoho CRM SDK',
    OrgDetails: {
      organizationID,
      organizationName: getZohoSdkOrgName(org),
      organizationPrimaryEmail: org?.primary_email || org?.email || '',
      organizationPhone: org?.phone || org?.company_phone || '',
      organizationAddress: org?.street || org?.address || '',
      organizationStatus: org?.status || 'Active',
      organizationSource: 'Zoho CRM SDK',
      zohoOrg: org,
    },
    ZohoSdkResponse: orgResponse || {},
  }
}

function splitDisplayName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  }
}

function normalizeZohoSdkUserResponse(userResponse, orgIdentifier) {
  const user = firstObjectFromPayload(userResponse, ['users', 'user', 'current_user', 'data'])
  const displayName = user?.full_name || user?.name || ''
  const fallbackName = splitDisplayName(displayName)
  const firstName = user?.first_name || user?.firstName || fallbackName.firstName
  const lastName = user?.last_name || user?.lastName || fallbackName.lastName

  return {
    Code: 200,
    Status: 'Success',
    Reason: 'Retrieved from Zoho CRM SDK',
    UserDetails: {
      userIdentifier: user?.id || user?.zuid || '',
      userName: user?.alias || user?.email || displayName || '',
      userFirstName: firstName,
      userLastName: lastName,
      userEmail: user?.email || '',
      userPhone: user?.phone || user?.mobile || '',
      userStatus: user?.status == null ? true : String(user.status).toLowerCase() === 'active',
      orgIdentifier,
      zohoUser: user,
    },
    ZohoSdkResponse: userResponse || {},
  }
}

async function getZohoConfigPayload(methodName, storageKey) {
  const request = window.ZOHO?.CRM?.CONFIG?.[methodName]

  if (typeof request === 'function') {
    try {
      const payload = await request.call(window.ZOHO.CRM.CONFIG)
      localStorage.setItem(storageKey, JSON.stringify(payload || {}))
      crmLog(`Zoho CRM SDK ${methodName} response stored`, payload || {})
      return payload || {}
    } catch (error) {
      crmError(`Zoho CRM SDK ${methodName} failed`, error)
    }
  }

  return safeParseJson(localStorage.getItem(storageKey) || '{}')
}

async function getZohoCrmSdkContext() {
  await initializeZohoWidgetSdk()

  if (typeof window.leadReachStoreZohoContext === 'function') {
    await window.leadReachStoreZohoContext()
  }

  const orgResponse = await getZohoConfigPayload('getOrgInfo', 'zoho_crm_org_response')
  const userResponse = await getZohoConfigPayload('getCurrentUser', 'zoho_crm_user_response')

  const orgPayload = normalizeZohoSdkOrgResponse(orgResponse)
  const orgIdentifier = orgPayload.OrgDetails.organizationID

  if (!orgIdentifier) {
    throw new Error('Zoho CRM SDK did not return an organization identifier')
  }

  const userPayload = normalizeZohoSdkUserResponse(userResponse, orgIdentifier)

  localStorage.setItem('organization_details_response', JSON.stringify(orgPayload))
  localStorage.setItem('organization_identifier', orgIdentifier)
  localStorage.setItem('user_details_response', JSON.stringify(userPayload))
  localStorage.setItem('user_details', JSON.stringify(userPayload.UserDetails || {}))
  window.dispatchEvent(new Event('organization-details-updated'))

  crmLog('Zoho CRM SDK organization/user stored', {
    orgIdentifier,
    orgName: orgPayload.OrgDetails.organizationName,
    userEmail: userPayload.UserDetails.userEmail,
    hasOrg: Boolean(orgPayload.OrgDetails.organizationID),
    hasUser: Boolean(userPayload.UserDetails.userIdentifier || userPayload.UserDetails.userEmail),
  })

  return { orgIdentifier, orgPayload, userPayload }
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

function AppToasts({ successToast, errorToast }) {
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
    </>
  )
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const isKnownRoute = isKnownAppPath(location.pathname)
  const hasBootstrappedRef = useRef(false)
  const [errorToast, setErrorToast] = useState('')
  const [successToast, setSuccessToast] = useState('')
  const [isBootstrapping, setIsBootstrapping] = useState(isKnownRoute)

  useEffect(() => {
    crmLog('App route evaluated', {
      pathname: location.pathname,
      search: location.search,
      hash: window.location.hash,
      isKnownRoute,
      isBootstrapping,
    })
  }, [isBootstrapping, isKnownRoute, location.pathname, location.search])

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
    const handleZohoConsentComplete = (event) => {
      const isSameOrigin = event.origin === window.location.origin
      const isZohoOrigin = event.origin.endsWith('.zappsusercontent.com') || event.origin.endsWith('.zoho.com')
      
      if (!isSameOrigin && !isZohoOrigin) {
        return
      }

      if (event.data?.type !== 'leadreach-zoho-consent-complete') {
        return
      }

      console.log('Parent tab received consent completion message from new tab:', event.data)
      window.focus?.()
      navigate(ROUTES.crm, { replace: true })
      window.dispatchEvent(new Event('zoho-connection-updated'))

      if (event.data?.error) {
        showErrorToast(event.data.error)
        return
      }

      showSuccessToast('Retrieved successfully')
    }

    window.addEventListener('message', handleZohoConsentComplete)
    return () => {
      window.removeEventListener('message', handleZohoConsentComplete)
    }
  }, [navigate])

  useEffect(() => {
    if (!isKnownRoute) {
      return
    }

    initializeZohoWidgetSdk().catch((error) => {
      const message = error instanceof Error ? error.message : 'Unable to initialize Zoho Widget JavaScript SDK'
      crmError('Zoho Widget SDK initialization failed', error)
      localStorage.setItem('zoho_widget_sdk_ready', 'false')
      localStorage.setItem('zoho_widget_sdk_error', message)
    })
  }, [isKnownRoute])

  useEffect(() => {
    if (!isKnownRoute) {
      return
    }

    if (hasBootstrappedRef.current) {
      return
    }

    hasBootstrappedRef.current = true

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://leadreach.api-pct.com'
    crmLog('Bootstrap started', {
      apiBaseUrl,
      href: window.location.href,
      referrer: document.referrer,
      inIframe: window.self !== window.top,
    })

    const bootstrapOrgAndUser = async () => {
      try {
        let orgIdentifier = ''

        if (isZohoCrmIframeContext()) {
          crmLog('Bootstrap using Zoho CRM SDK organization/user context')
          const sdkContext = await getZohoCrmSdkContext()
          orgIdentifier = sdkContext.orgIdentifier
        } else {
          const orgRequestBody = {
            orgIdentifier: 'ORG-2012',
            orgName: 'Prime Cloud Industries',
            orgPrimayEmail: 'prime@cloudtech.com',
            orgPhone: '+92-321-9876543',
            orgAddress: 'Plot 45, G-10 Markaz, Islamabad, Pakistan',
            orgStatus: 'Paid',
          }

          crmLog('FetchOrganizationDetails started', orgRequestBody)
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
            crmError('FetchOrganizationDetails HTTP failure', {
              status: orgResponse.status,
              statusText: orgResponse.statusText,
            })
            throw new Error(`FetchOrganizationDetails failed (${orgResponse.status})`)
          }

          const orgPayload = await orgResponse.json()
          crmLog('FetchOrganizationDetails response parsed', orgPayload)
          const orgFailed = orgPayload?.Code === 500 || String(orgPayload?.Status || '').toLowerCase() === 'failure'

          if (orgFailed) {
            crmError('FetchOrganizationDetails returned failure payload', orgPayload)
            throw new Error(orgPayload?.Reason || 'FetchOrganizationDetails failed')
          }

          localStorage.setItem('organization_details_response', JSON.stringify(orgPayload))
          window.dispatchEvent(new Event('organization-details-updated'))

          orgIdentifier =
            orgPayload?.OrganizationDetails?.orgIdentifier ||
            orgPayload?.OrgDetails?.organizationID ||
            orgPayload?.orgIdentifier ||
            orgRequestBody.orgIdentifier

          localStorage.setItem('organization_identifier', orgIdentifier)
          crmLog('Organization identifier stored', { orgIdentifier })

          const userRequestBody = {
            userName: 'hassan.ali',
            userPass: 'P@ssw0rd123',
            userFirstName: 'Hassan',
            userLastName: 'Ali',
            userPhone: '+923259511211',
            userEmail: 'hassan.ali@primecloudtech.net',
            orgIdentifier,
          }

          crmLog('FetchUserDetails started', {
            ...userRequestBody,
            userPass: '[hidden]',
          })
          const userResponse = await fetch(`${apiBaseUrl}/api/User/v1/FetchUserDetails`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userRequestBody),
          })

          if (!userResponse.ok) {
            crmError('FetchUserDetails HTTP failure', {
              status: userResponse.status,
              statusText: userResponse.statusText,
            })
            throw new Error(`FetchUserDetails failed (${userResponse.status})`)
          }

          const userPayload = await userResponse.json()
          crmLog('FetchUserDetails response parsed', userPayload)
          const userFailed = userPayload?.Code === 500 || String(userPayload?.Status || '').toLowerCase() === 'failure'

          if (userFailed) {
            crmError('FetchUserDetails returned failure payload', userPayload)
            throw new Error(userPayload?.Reason || 'FetchUserDetails failed')
          }

          localStorage.setItem('user_details_response', JSON.stringify(userPayload))
          localStorage.setItem('user_details', JSON.stringify(userPayload?.UserDetails || {}))
        }

        const integrationListPayload = await retrieveZohoIntegrationList({ orgIdentifier }, { apiBaseUrl })
        crmLog('RetrieveIntegrationList completed during bootstrap', integrationListPayload)

        localStorage.setItem('zoho_integration_list_response', JSON.stringify(integrationListPayload))
        localStorage.setItem('zoho_integration_list', JSON.stringify(integrationListPayload?.IntegrationList || []))
        localStorage.setItem('integration_access_token', getIntegrationAccessToken(integrationListPayload))
        localStorage.setItem('zoho_connected', hasConnectedIntegration(integrationListPayload) ? 'true' : 'false')
        localStorage.removeItem('zoho_integration_error')
        window.dispatchEvent(new Event('zoho-connection-updated'))
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to fetch organization/user details'
        crmError('Bootstrap failed', error)
        localStorage.setItem('bootstrap_details_error', message)
      } finally {
        crmLog('Bootstrap finished')
        setIsBootstrapping(false)
      }
    }

    bootstrapOrgAndUser()
  }, [isKnownRoute])

  useEffect(() => {
    if (!isKnownRoute) {
      return
    }

    const params = new URLSearchParams(window.location.search)
    const grantCode = params.get('code')
    
    if (grantCode) {
      console.log('Extracted grant code from URL:', grantCode)
    }

    if (!grantCode) {
      crmLog('OAuth finalize skipped: no grant code')
      return
    }

    const integrationApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://leadreach.api-pct.com'

    const finalizeOAuth = async () => {
      crmLog('OAuth finalize started', {
        integrationApiBaseUrl,
        hasGrantCode: Boolean(grantCode),
      })
      localStorage.setItem('zoho_grant_code', grantCode)
      localStorage.setItem('zoho_datacenter', 'crm.zoho.com')
      let consentError = ''

      try {
        const orgIdentifier = getCurrentOrganizationIdentifier()
        const payload = await createZohoIntegration(
          { grantCode, orgIdentifier },
          { apiBaseUrl: integrationApiBaseUrl },
        )

        localStorage.setItem('zoho_integration_response', JSON.stringify(payload))
        crmLog('CreateIntegration completed', payload)

        try {
          const retrieveListPayload = await retrieveZohoIntegrationList(
            { orgIdentifier },
            { apiBaseUrl: integrationApiBaseUrl },
          )

          localStorage.setItem('zoho_integration_list_response', JSON.stringify(retrieveListPayload))
          crmLog('RetrieveIntegrationList completed after OAuth', retrieveListPayload)
          localStorage.setItem('zoho_integration_list', JSON.stringify(retrieveListPayload?.IntegrationList || []))
          localStorage.setItem('integration_access_token', getIntegrationAccessToken(retrieveListPayload))
          localStorage.setItem('zoho_connected', hasConnectedIntegration(retrieveListPayload) ? 'true' : 'false')
          localStorage.removeItem('zoho_integration_error')
          window.dispatchEvent(new Event('zoho-connection-updated'))
          showSuccessToast('Retrieved successfully')
        } catch (error) {
          const failureMessage = error instanceof Error ? error.message : 'RetrieveIntegrationList request failed'
          crmError('RetrieveIntegrationList failed after OAuth', error)
          consentError = failureMessage
          localStorage.setItem('zoho_integration_error', failureMessage)
          showErrorToast(failureMessage)
        }
      } catch (error) {
        const failureMessage = error instanceof Error ? error.message : 'Integration setup request failed'
        crmError('CreateIntegration failed', error)
        consentError = failureMessage
        localStorage.setItem('zoho_connected', 'false')
        localStorage.setItem('zoho_integration_error', failureMessage)
        window.dispatchEvent(new Event('zoho-connection-updated'))
        showErrorToast(failureMessage)
      }

      const consentMessage = {
        type: 'leadreach-zoho-consent-complete',
        connected: localStorage.getItem('zoho_connected') === 'true',
        error: consentError,
        url: window.location.href,
        grantCode: grantCode,
      }

      if (window.opener && !window.opener.closed) {
        crmLog('Posting OAuth result to opener', consentMessage)
        console.log('New tab is sending consent data back to parent tab:', consentMessage)
        // Use '*' so the message reaches the parent even if the parent is on localhost and child is on Zoho
        window.opener.postMessage(consentMessage, '*')
        window.opener.focus?.()
        window.setTimeout(() => window.close(), 100)
        return
      }

      crmLog('OAuth finalize finished without opener', consentMessage)
      navigate(ROUTES.crm, { replace: true })
    }

    finalizeOAuth()
  }, [isKnownRoute, navigate])

  if (isKnownRoute && isBootstrapping) {
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

  return (
    <>
      <AppToasts successToast={successToast} errorToast={errorToast} />
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path="/home" element={<Navigate to={ROUTES.dashboard} replace />} />
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.search} element={<LeadSearchPage />} />
        <Route path={ROUTES.history} element={<LeadSearchHistoryPage />} />
        <Route path={ROUTES.crm} element={<CrmHubPage />} />
        <Route path={ROUTES.settings} element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
