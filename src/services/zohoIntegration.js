const DEFAULT_API_BASE_URL = 'https://leadreach.api-pct.com'
const DEFAULT_DATA_CENTER = 'crm.zoho.com'
const DEFAULT_REFERER = 'https://localhost:44352'
const DEFAULT_ORG_IDENTIFIER = 'ORG-2012'
const ZOHO_WIDGET_SDK_URL = 'https://live.zwidgets.com/js-sdk/1.2/ZohoEmbededAppSDK.min.js'
const ZOHO_WIDGET_SDK_SCRIPT_ID = 'zoho-widget-javascript-sdk'

export const ZOHO_INTEGRATION_TYPE = 'Zoho'

let widgetSdkLoadPromise
let widgetInitPromise

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
  return (
    localStorage.getItem('module_list_org_identifier') ||
    localStorage.getItem('field_list_org_identifier') ||
    localStorage.getItem('organization_identifier') ||
    import.meta.env.VITE_MODULE_LIST_ORG_IDENTIFIER ||
    import.meta.env.VITE_FIELD_LIST_ORG_IDENTIFIER ||
    DEFAULT_ORG_IDENTIFIER
  )
}

export function getZohoWidgetSdk() {
  return window.ZOHO || null
}

export function loadZohoWidgetSdk() {
  if (window.ZOHO?.embeddedApp) {
    return Promise.resolve(window.ZOHO)
  }

  if (widgetSdkLoadPromise) {
    return widgetSdkLoadPromise
  }

  widgetSdkLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(ZOHO_WIDGET_SDK_SCRIPT_ID)

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.ZOHO), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Zoho Widget JavaScript SDK')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.id = ZOHO_WIDGET_SDK_SCRIPT_ID
    script.src = ZOHO_WIDGET_SDK_URL
    script.async = true
    script.onload = () => resolve(window.ZOHO)
    script.onerror = () => reject(new Error('Unable to load Zoho Widget JavaScript SDK'))
    document.head.appendChild(script)
  })

  return widgetSdkLoadPromise
}

export async function initializeZohoWidgetSdk({ onPageLoad, onNotify, onNotifyAndWait } = {}) {
  if (widgetInitPromise) {
    return widgetInitPromise
  }

  widgetInitPromise = loadZohoWidgetSdk().then((zoho) => {
    if (!zoho?.embeddedApp?.on || !zoho?.embeddedApp?.init) {
      throw new Error('Zoho Widget JavaScript SDK is unavailable')
    }

    zoho.embeddedApp.on('PageLoad', (data) => {
      localStorage.setItem('zoho_widget_page_load', JSON.stringify(data || {}))
      window.dispatchEvent(new CustomEvent('zoho-widget-page-load', { detail: data || {} }))
      onPageLoad?.(data || {})
    })

    zoho.embeddedApp.on('Notify', (data) => {
      localStorage.setItem('zoho_widget_notify', JSON.stringify(data || {}))
      window.dispatchEvent(new CustomEvent('zoho-widget-notify', { detail: data || {} }))
      onNotify?.(data || {})
    })

    zoho.embeddedApp.on('NotifyAndWait', (data) => {
      localStorage.setItem('zoho_widget_notify_and_wait', JSON.stringify(data || {}))
      window.dispatchEvent(new CustomEvent('zoho-widget-notify-and-wait', { detail: data || {} }))
      onNotifyAndWait?.(data || {})
    })

    zoho.embeddedApp.init()
    localStorage.setItem('zoho_widget_sdk_ready', 'true')
    localStorage.removeItem('zoho_widget_sdk_error')
    window.dispatchEvent(new Event('zoho-widget-sdk-ready'))

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
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...requestOptions,
    headers: getZohoRequestHeaders(headers),
    body: body == null ? undefined : JSON.stringify(body),
  })

  const payload = await parseJsonResponse(response)

  if (!response.ok) {
    throw new Error(`${path.split('/').pop()} failed (${response.status})`)
  }

  if (isFailurePayload(payload)) {
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

export function createZohoIntegration({ grantCode, orgIdentifier = DEFAULT_ORG_IDENTIFIER }, options = {}) {
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
