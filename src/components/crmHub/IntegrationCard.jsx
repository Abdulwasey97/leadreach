import { useEffect, useState } from 'react'

function IntegrationIcon({ icon }) {
  if (icon === 'hub') {
    return (
      <svg viewBox="0 0 24 24" className="size-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 4v3" />
        <path d="M12 17v3" />
        <path d="M4 12h3" />
        <path d="M17 12h3" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 16a4 4 0 1 1 .5-7.98A5 5 0 0 1 19 10a3.5 3.5 0 0 1-1 6.86H6Z" />
    </svg>
  )
}

function IntegrationCard({ integration }) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [showDisconnectAction, setShowDisconnectAction] = useState(false)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  const isZohoIntegration = integration.id === 'zoho'
  const [errorMessage, setErrorMessage] = useState(() =>
    isZohoIntegration ? localStorage.getItem('zoho_integration_error') || '' : '',
  )
  const [isZohoConnected, setIsZohoConnected] = useState(() =>
    isZohoIntegration ? localStorage.getItem('zoho_connected') === 'true' : false,
  )
  const resolvedStatus = isZohoConnected ? 'Connected' : 'Not Connected'
  const isConnected = resolvedStatus.toLowerCase() === 'connected'

  useEffect(() => {
    if (!isZohoIntegration) {
      return undefined
    }

    const handleConnectionUpdated = () => {
      setIsZohoConnected(localStorage.getItem('zoho_connected') === 'true')
      setErrorMessage(localStorage.getItem('zoho_integration_error') || '')
    }

    window.addEventListener('zoho-connection-updated', handleConnectionUpdated)
    return () => {
      window.removeEventListener('zoho-connection-updated', handleConnectionUpdated)
    }
  }, [isZohoIntegration])

  const handleConnect = async () => {
    if (isConnecting || !apiBaseUrl) {
      if (!apiBaseUrl) {
        setErrorMessage('Missing VITE_API_BASE_URL in .env')
      }
      return
    }

    setIsConnecting(true)
    setErrorMessage('')

    try {
      const requestUrl = `${apiBaseUrl}/api/Integration/v1/RetrieveAuthUrl`
      const requestHeaders = {
        DataCenter: 'crm.zoho.com',
      }

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: requestHeaders,
      })

      if (!response.ok) {
        throw new Error(`Auth URL request failed (${response.status})`)
      }

      const payload = await response.json()
      const authUrl =
        payload?.Auth_Urls?.Zoho_AuthUrl || payload?.authUrl || payload?.url || payload?.data || payload

      if (typeof authUrl === 'string' && authUrl) {
        window.open(authUrl, '_blank', 'noopener,noreferrer')
        return
      }

      throw new Error('Auth URL not found in API response')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to connect to Zoho CRM')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!apiBaseUrl || isDisconnecting) {
      if (!apiBaseUrl) {
        setErrorMessage('Missing VITE_API_BASE_URL in .env')
      }
      return
    }

    const integrationList = JSON.parse(localStorage.getItem('zoho_integration_list') || '[]')
    const integrationIdentifier = integrationList?.[0]?.integrationIdentifier

    if (!integrationIdentifier) {
      const message = 'Missing integrationIdentifier for delete'
      setErrorMessage(message)
      window.dispatchEvent(new CustomEvent('zoho-toast', { detail: { type: 'error', message } }))
      return
    }

    setIsDisconnecting(true)
    setErrorMessage('')

    try {
      const response = await fetch(`${apiBaseUrl}/api/Integration/v1/DeleteIntegration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integrationIdentifier,
        }),
      })

      if (!response.ok) {
        throw new Error(`DeleteIntegration failed (${response.status})`)
      }

      const payload = await response.json()
      const deleteFailed =
        payload?.Code !== 200 || !['success', 'succcess'].includes(String(payload?.Status || '').toLowerCase())

      if (deleteFailed) {
        throw new Error(payload?.Reason || 'DeleteIntegration failed')
      }

      localStorage.setItem('zoho_connected', 'false')
      localStorage.removeItem('zoho_grant_code')
      localStorage.removeItem('zoho_integration_response')
      localStorage.removeItem('zoho_integration_list_response')
      localStorage.removeItem('zoho_integration_list')
      localStorage.removeItem('zoho_integration_error')
      setIsZohoConnected(false)
      setShowDisconnectAction(false)
      window.dispatchEvent(new Event('zoho-connection-updated'))
      window.dispatchEvent(
        new CustomEvent('zoho-toast', {
          detail: { type: 'success', message: payload?.Reason || 'Successfully Deleted Integration' },
        }),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'DeleteIntegration request failed'
      setErrorMessage(message)
      window.dispatchEvent(new CustomEvent('zoho-toast', { detail: { type: 'error', message } }))
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <article className="relative overflow-hidden rounded-3xl border-2 border-cyan-200/90 bg-gradient-to-br from-white via-cyan-50/60 to-indigo-50 p-6 shadow-[0_18px_40px_-24px_rgba(14,116,144,0.45)]">
      <div className="pointer-events-none absolute -right-14 -top-20 h-44 w-44 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/90 shadow-sm ring-1 ring-cyan-100">
            <IntegrationIcon icon={integration.icon} />
          </span>
          <div>
            <h4 className="text-xl font-bold tracking-tight text-slate-800">{integration.name}</h4>
            <p className="mt-1 text-sm text-slate-500">{integration.subtitle}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
            isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {resolvedStatus}
        </span>
      </div>

      <div className="relative mt-5 h-px w-full bg-gradient-to-r from-cyan-100 via-cyan-200/60 to-transparent" />

      <div className="relative mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">Secure OAuth connection</p>
        <button
          type="button"
          onClick={isZohoConnected ? handleDisconnect : handleConnect}
          onMouseEnter={() => {
            if (isZohoConnected) {
              setShowDisconnectAction(true)
            }
          }}
          onMouseLeave={() => {
            if (isZohoConnected) {
              setShowDisconnectAction(false)
            }
          }}
          disabled={isConnecting || isDisconnecting}
          className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed ${
            isZohoConnected
              ? showDisconnectAction
                ? 'bg-red-600 shadow-md shadow-red-600/25 hover:-translate-y-0.5 hover:bg-red-700'
                : 'bg-emerald-600 shadow-md shadow-emerald-600/25 hover:-translate-y-0.5 hover:bg-emerald-700'
              : 'bg-cyan-600 shadow-md shadow-cyan-600/25 hover:-translate-y-0.5 hover:bg-cyan-700'
          } ${isConnecting || isDisconnecting ? 'opacity-70' : ''}`}
        >
          {isDisconnecting
            ? 'Disconnecting...'
            : isZohoConnected
              ? showDisconnectAction
                ? 'Disconnect'
                : 'Connected'
              : isConnecting
                ? 'Connecting...'
                : 'Connect to Zoho'}
        </button>
      </div>
      {errorMessage ? <p className="relative mt-3 text-xs font-medium text-red-600">{errorMessage}</p> : null}
    </article>
  )
}

export default IntegrationCard
