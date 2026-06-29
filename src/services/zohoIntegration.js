import { crmError, crmLog, crmWarn } from '../utils/diagnostics'

const DEFAULT_API_BASE_URL = 'https://leadreach.api-pct.com'
const DEFAULT_DATA_CENTER = 'crm.zoho.com'
const DEFAULT_REFERER = 'https://localhost:44352'
const ZOHO_WIDGET_SDK_URL = 'https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js'
const ZOHO_WIDGET_SDK_SCRIPT_ID = 'zoho-widget-javascript-sdk'

export const ZOHO_INTEGRATION_TYPE = 'Zoho'

let widgetSdkLoadPromise
let widgetInitPromise

function isZohoIframeContext() {
  return window.self !== window.top || /(^|\.)zoho\./i.test(document.referrer)
}

async function storeZohoCrmContext(pageLoadData) {
  const storeContext = window.leadReachStoreZohoContext

  if (typeof storeContext !== 'function') {
    return null
  }

  return storeContext(pageLoadData)
}

const safeParseJson = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const compactObject = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== ''),
  )

const firstArrayItem = (...values) => {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) {
      return value[0]
    }
  }

  return null
}

const pickNestedValue = (source, keys) => {
  if (!source || typeof source !== 'object') {
    return ''
  }

  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
      return source[key]
    }
  }

  for (const value of Object.values(source)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const nestedValue = pickNestedValue(item, keys)
        if (nestedValue) {
          return nestedValue
        }
      }
    } else if (value && typeof value === 'object') {
      const nestedValue = pickNestedValue(value, keys)
      if (nestedValue) {
        return nestedValue
      }
    }
  }

  return ''
}

export function getStoredZohoOrgInfo() {
  const payload = safeParseJson(localStorage.getItem('zoho_crm_org_response') || '{}') || {}
  return firstArrayItem(payload.org, payload.orgInfo, payload.OrgInfo, payload.data, payload.Data) || payload
}

export function getStoredZohoUserInfo() {
  const payload = safeParseJson(localStorage.getItem('zoho_crm_user_response') || '{}') || {}
  return firstArrayItem(payload.users, payload.Users, payload.user, payload.User, payload.data, payload.Data) || payload
}

export function getStoredZohoOrgIdentifier() {
  const orgInfo = getStoredZohoOrgInfo()
  
  if (isZohoIframeContext()) {
    const zgid = String(
      pickNestedValue(orgInfo, [
        'zgid',
        'zg_id',
        'ezgid',
        'ezg_id',
      ]) || '',
    ).trim()
    if (zgid) return zgid
  }

  return String(
    pickNestedValue(orgInfo, [
      'orgIdentifier',
      'organizationID',
      'organizationId',
      'Organization_ID',
      'id',
      'zgid',
      'zg_id',
      'org_id',
      'OrgId',
      'OrgID',
    ]) || '',
  ).trim()
}

export function getStoredUserEmail() {
  const userInfo = getStoredZohoUserInfo()
  const email = String(
    pickNestedValue(userInfo, [
      'email',
      'Email',
      'userEmail',
      'UserEmail',
      'email_id',
      'emailId',
      'primary_email',
      'PrimaryEmail',
    ]) || '',
  ).trim()

  if (email) return email

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    import.meta.env.DEV

  if (isLocal) {
    return 'hassan.a@zenithinnovations.net'
  }

  return ''
}

export function getStoredWalletIdentifier() {
  const orgPayload = safeParseJson(localStorage.getItem('organization_details_response') || '{}') || {}
  const walletId = (
    orgPayload?.OrganizationDetails?.walletIdentifier ||
    orgPayload?.OrgDetails?.walletIdentifier ||
    localStorage.getItem('usage_details_wallet_identifier') ||
    ''
  ).trim()

  if (walletId) return walletId

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    import.meta.env.DEV

  if (isLocal) {
    return 'Wal775AAC24994C'
  }

  return ''
}

export async function fetchAndStoreZohoCrmContext(pageLoadData) {
  return storeZohoCrmContext(pageLoadData)
}

export function buildOrganizationDetailsRequestBody() {
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    import.meta.env.DEV

  if (isLocal) {
    return {
      orgIdentifier: 'ORG-2012',
      orgName: 'Prime Cloud Industries',
      orgPrimayEmail: 'prime@cloudtech.com',
      orgPhone: '+92-321-9876543',
      orgAddress: 'Plot 45, G-10 Markaz, Islamabad, Pakistan',
      orgStatus: 'Paid',
    }
  }

  const orgInfo = getStoredZohoOrgInfo()
  const orgIdentifier = getStoredZohoOrgIdentifier()

  return compactObject({
    orgIdentifier,
    orgName: pickNestedValue(orgInfo, ['company_name', 'companyName', 'orgName', 'organizationName', 'name', 'Name']),
    orgPrimayEmail: pickNestedValue(orgInfo, [
      'primary_email',
      'primaryEmail',
      'organizationPrimaryEmail',
      'orgPrimaryEmail',
      'email',
      'Email',
    ]),
    orgPhone: pickNestedValue(orgInfo, ['phone', 'Phone', 'mobile', 'Mobile', 'orgPhone']),
    orgAddress: pickNestedValue(orgInfo, ['address', 'Address', 'street', 'Street', 'orgAddress']),
    orgStatus: pickNestedValue(orgInfo, ['organizationStatus', 'orgStatus', 'status', 'Status']),
  })
}

export function buildUserDetailsRequestBody(orgIdentifier = getStoredOrgIdentifier()) {
  const userInfo = getStoredZohoUserInfo()
  const email = getStoredUserEmail()
  const fullName = String(
    pickNestedValue(userInfo, ['full_name', 'fullName', 'name', 'Name', 'userName', 'UserName']) || '',
  ).trim()
  const [firstName = '', ...lastNameParts] = fullName.split(/\s+/).filter(Boolean)

  return compactObject({
    userName: pickNestedValue(userInfo, ['userName', 'UserName', 'alias', 'Alias', 'zuid', 'id']) || email,
    userFirstName: pickNestedValue(userInfo, ['first_name', 'firstName', 'userFirstName']) || firstName,
    userLastName: pickNestedValue(userInfo, ['last_name', 'lastName', 'userLastName']) || lastNameParts.join(' '),
    userPhone: pickNestedValue(userInfo, ['phone', 'Phone', 'mobile', 'Mobile', 'userPhone']),
    userEmail: email,
    orgIdentifier,
  })
}

export function getZohoApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_INTEGRATION_API_BASE_URL || DEFAULT_API_BASE_URL
}

export function getZohoRequestHeaders(headers = {}) {
  return {
    DataCenter: DEFAULT_DATA_CENTER,
    referer: DEFAULT_REFERER,
    ...headers,
  }
}

export function getStoredOrgIdentifier() {
  const stored = (
    localStorage.getItem('module_list_org_identifier') ||
    localStorage.getItem('field_list_org_identifier') ||
    localStorage.getItem('organization_identifier') ||
    getStoredZohoOrgIdentifier() ||
    import.meta.env.VITE_MODULE_LIST_ORG_IDENTIFIER ||
    import.meta.env.VITE_FIELD_LIST_ORG_IDENTIFIER ||
    ''
  ).trim()

  if (stored) return stored

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    import.meta.env.DEV

  if (isLocal) {
    return 'ORG-2012'
  }

  return ''
}

export function getZohoWidgetSdk() {
  return window.ZOHO || null
}

export function loadZohoWidgetSdk() {
  if (window.ZOHO?.embeddedApp) {
    crmLog('Zoho Widget SDK already available')
    return Promise.resolve(window.ZOHO)
  }

  if (widgetSdkLoadPromise) {
    crmLog('Reusing Zoho Widget SDK load promise')
    return widgetSdkLoadPromise
  }

  crmLog('Loading Zoho Widget SDK', {
    hasExistingScript: Boolean(document.getElementById(ZOHO_WIDGET_SDK_SCRIPT_ID)),
  })

  widgetSdkLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(ZOHO_WIDGET_SDK_SCRIPT_ID)

    if (existingScript) {
      if (existingScript.dataset.sdkLoadState === 'loaded') {
        crmLog('Existing Zoho Widget SDK script was already loaded', { hasZoho: Boolean(window.ZOHO) })
        resolve(window.ZOHO)
        return
      }

      if (existingScript.dataset.sdkLoadState === 'error') {
        const error = new Error('Unable to load Zoho Widget JavaScript SDK')
        crmError('Existing Zoho Widget SDK script had already failed', error)
        reject(error)
        return
      }

      existingScript.addEventListener(
        'load',
        () => {
          crmLog('Existing Zoho Widget SDK script loaded', { hasZoho: Boolean(window.ZOHO) })
          resolve(window.ZOHO)
        },
        { once: true },
      )
      existingScript.addEventListener(
        'error',
        () => {
          const error = new Error('Unable to load Zoho Widget JavaScript SDK')
          crmError('Existing Zoho Widget SDK script failed', error)
          reject(error)
        },
        {
          once: true,
        },
      )
      return
    }

    const script = document.createElement('script')
    script.id = ZOHO_WIDGET_SDK_SCRIPT_ID
    script.src = ZOHO_WIDGET_SDK_URL
    script.async = true
    script.onload = () => {
      crmLog('Zoho Widget SDK script loaded', { hasZoho: Boolean(window.ZOHO) })
      resolve(window.ZOHO)
    }
    script.onerror = () => {
      const error = new Error('Unable to load Zoho Widget JavaScript SDK')
      crmError('Zoho Widget SDK script failed', error)
      reject(error)
    }
    document.head.appendChild(script)
  })

  return widgetSdkLoadPromise
}

export async function initializeZohoWidgetSdk({ onPageLoad, onNotify, onNotifyAndWait } = {}) {
  if (widgetInitPromise) {
    crmLog('Reusing Zoho Widget SDK init promise')
    return widgetInitPromise
  }

  widgetInitPromise = loadZohoWidgetSdk().then((zoho) => {
    if (!zoho?.embeddedApp?.on || !zoho?.embeddedApp?.init) {
      crmError('Zoho Widget SDK object missing embeddedApp methods', {
        hasZoho: Boolean(zoho),
        hasEmbeddedApp: Boolean(zoho?.embeddedApp),
      })
      throw new Error('Zoho Widget JavaScript SDK is unavailable')
    }

    crmLog('Registering Zoho embedded app events')

    zoho.embeddedApp.on('PageLoad', (data) => {
      crmLog('Zoho PageLoad event received', data || {})
      localStorage.setItem('zoho_widget_page_load', JSON.stringify(data || {}))
      window.dispatchEvent(new CustomEvent('zoho-widget-page-load', { detail: data || {} }))
      storeZohoCrmContext(data || {}).catch((error) => {
        crmError('Unable to store Zoho CRM context after PageLoad', error)
        localStorage.setItem(
          'zoho_crm_context_error',
          error instanceof Error ? error.message : 'Unable to store Zoho CRM context',
        )
      })
      onPageLoad?.(data || {})
    })

    zoho.embeddedApp.on('Notify', (data) => {
      crmLog('Zoho Notify event received', data || {})
      localStorage.setItem('zoho_widget_notify', JSON.stringify(data || {}))
      window.dispatchEvent(new CustomEvent('zoho-widget-notify', { detail: data || {} }))
      onNotify?.(data || {})
    })

    zoho.embeddedApp.on('NotifyAndWait', (data) => {
      crmLog('Zoho NotifyAndWait event received', data || {})
      localStorage.setItem('zoho_widget_notify_and_wait', JSON.stringify(data || {}))
      window.dispatchEvent(new CustomEvent('zoho-widget-notify-and-wait', { detail: data || {} }))
      onNotifyAndWait?.(data || {})
    })

    crmLog('Calling Zoho embeddedApp.init')
    zoho.embeddedApp.init()
    localStorage.setItem('zoho_widget_sdk_ready', 'true')
    localStorage.setItem('zoho_widget_iframe_context', isZohoIframeContext() ? 'true' : 'false')
    localStorage.removeItem('zoho_widget_sdk_error')
    window.dispatchEvent(new Event('zoho-widget-sdk-ready'))
    crmLog('Zoho Widget SDK initialized', {
      inZohoIframe: isZohoIframeContext(),
    })

    if (isZohoIframeContext()) {
      storeZohoCrmContext().catch((error) => {
        crmError('Unable to store initial Zoho CRM context', error)
        localStorage.setItem(
          'zoho_crm_context_error',
          error instanceof Error ? error.message : 'Unable to store Zoho CRM context',
        )
      })
    }

    return zoho
  })

  return widgetInitPromise
}

function isFailurePayload(payload) {
  return payload?.Code === 500 || String(payload?.Status || '').toLowerCase() === 'failure'
}

async function parseJsonResponse(response) {
  return response.json().catch(() => ({}))
}

async function requestZohoIntegration(path, options = {}) {
  const { apiBaseUrl = getZohoApiBaseUrl(), body, headers, ...requestOptions } = options
  const method = requestOptions.method || 'GET'

  crmLog('API request started', {
    method,
    path,
    apiBaseUrl,
    body,
  })

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...requestOptions,
    headers: getZohoRequestHeaders(headers),
    body: body == null ? undefined : JSON.stringify(body),
  })

  const payload = await parseJsonResponse(response)

  crmLog('API response received', {
    method,
    path,
    status: response.status,
    ok: response.ok,
    payload,
  })

  if (!response.ok) {
    crmError('API response was not ok', {
      path,
      status: response.status,
      payload,
    })
    throw new Error(`${path.split('/').pop()} failed (${response.status})`)
  }

  if (isFailurePayload(payload)) {
    crmWarn('API returned failure payload', {
      path,
      payload,
    })
    throw new Error(payload?.Reason || `${path.split('/').pop()} failed`)
  }

  return payload
}

export async function retrieveZohoAuthUrl(options = {}) {
  const payload = await requestZohoIntegration('/api/Integration/v1/RetrieveAuthUrl', {
    method: 'GET',
    ...options,
  })
  const authUrl = payload?.Auth_Urls?.Zoho_AuthUrl || payload?.authUrl || payload?.url || payload?.data || payload

  if (typeof authUrl !== 'string' || !authUrl) {
    throw new Error('Auth URL not found in API response')
  }

  return authUrl
}

export function createZohoIntegration({ grantCode, orgIdentifier = getStoredOrgIdentifier() }, options = {}) {
  return requestZohoIntegration('/api/Integration/v1/CreateIntegration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      orgIdentifier,
      integrationAlias: 'Persona',
      integrationType: ZOHO_INTEGRATION_TYPE,
      GrantCode: grantCode,
      integrationExpiryTime: '3600',
    },
    ...options,
  })
}

export function retrieveZohoIntegrationList({ orgIdentifier = getStoredOrgIdentifier() } = {}, options = {}) {
  return requestZohoIntegration('/api/Integration/v1/RetrieveIntegrationList', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      orgIdentifier,
    },
    ...options,
  })
}

export async function deleteZohoIntegration({ integrationIdentifier }, options = {}) {
  const payload = await requestZohoIntegration('/api/Integration/v1/DeleteIntegration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      integrationIdentifier,
    },
    ...options,
  })
  const deleteSucceeded =
    payload?.Code === 200 && ['success', 'succcess'].includes(String(payload?.Status || '').toLowerCase())

  if (!deleteSucceeded) {
    throw new Error(payload?.Reason || 'DeleteIntegration failed')
  }

  return payload
}

export function fetchZohoModules({ orgIdentifier = getStoredOrgIdentifier(), integrationAccessToken }, options = {}) {
  return requestZohoIntegration('/api/Integration/v1/Module_List', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      orgIdentifier,
      integrationAccessToken,
    },
    ...options,
  })
}

export function fetchZohoFields(
  { orgIdentifier = getStoredOrgIdentifier(), integrationAccessToken, moduleName },
  options = {},
) {
  return requestZohoIntegration('/api/Integration/v1/Field_List', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      orgIdentifier,
      integrationAccessToken,
      moduleName,
    },
    ...options,
  })
}

export async function exportToZohoCrm({ integrationAccessToken, moduleName, dataToExport }, options = {}) {
  const payload = await requestZohoIntegration('/api/Integration/ExportToCrm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      integrationType: ZOHO_INTEGRATION_TYPE,
      integrationAccessToken,
      moduleName,
      dataToExport,
    },
    ...options,
  })
  const exportFailed =
    payload?.Code === 500 ||
    (payload?.Status && String(payload.Status).toLowerCase() !== 'success' && payload.Code !== 200)

  if (exportFailed) {
    throw new Error(payload?.Reason || 'ExportToCrm failed')
  }

  return payload
}
