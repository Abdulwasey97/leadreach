const LOG_PREFIX = '[LeadReach CRM]'
const STORAGE_KEY = 'leadreach_crm_diagnostics'

function isDiagnosticsEnabled() {
  if (typeof window === 'undefined') {
    return false
  }

  const params = new URLSearchParams(window.location.search)
  const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?').slice(1).join('?') : ''
  const hashParams = new URLSearchParams(hashQuery)
  return (
    params.has('debug') ||
    params.has('zohoLocal') ||
    hashParams.has('debug') ||
    hashParams.has('zohoLocal') ||
    window.self !== window.top ||
    /(^|\.)zoho\./i.test(document.referrer)
  )
}

function serializeDetail(detail) {
  if (detail instanceof Error) {
    return {
      name: detail.name,
      message: detail.message,
      stack: detail.stack,
    }
  }

  return detail
}

function persistDiagnostic(level, message, detail) {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    current.push({
      level,
      message,
      detail: serializeDetail(detail),
      href: window.location.href,
      referrer: document.referrer,
      at: new Date().toISOString(),
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(-80)))
  } catch (error) {
    console.warn(`${LOG_PREFIX} unable to store diagnostic`, error)
  }
}

export function crmLog(message, detail) {
  if (!isDiagnosticsEnabled()) {
    return
  }

  persistDiagnostic('info', message, detail)
  console.info(LOG_PREFIX, message, detail || '')
}

export function crmWarn(message, detail) {
  if (!isDiagnosticsEnabled()) {
    return
  }

  persistDiagnostic('warn', message, detail)
  console.warn(LOG_PREFIX, message, detail || '')
}

export function crmError(message, detail) {
  persistDiagnostic('error', message, detail)
  console.error(LOG_PREFIX, message, detail || '')
}
