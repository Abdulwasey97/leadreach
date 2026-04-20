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
  const resolvedStatus = isZohoIntegration ? (isZohoConnected ? 'Connected' : 'Not Connected') : integration.status
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
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="mt-1 inline-flex size-8 items-center justify-center rounded-lg bg-slate-100">
            <IntegrationIcon icon={integration.icon} />
          </span>
          <div>
            <h4 className="text-lg font-semibold text-slate-800">{integration.name}</h4>
            <p className="text-xs text-slate-500">{integration.subtitle}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
            isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {resolvedStatus}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Last Sync</p>
          <p className="font-semibold text-slate-700">{integration.lastSync}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Sync Volume</p>
          <p className="font-semibold text-slate-700">{integration.volume}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {isZohoIntegration ? (
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
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed ${
              isZohoConnected
                ? showDisconnectAction
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-cyan-600 hover:bg-cyan-700'
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
                  : 'Connect'}
          </button>
        ) : (
          <button type="button" className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Manage
          </button>
        )}
        <button type="button" aria-label="Connection settings" className="rounded-lg bg-slate-100 px-3 py-2 text-slate-600 hover:bg-slate-200">
          o
        </button>
      </div>
      {isZohoIntegration && errorMessage ? <p className="mt-2 text-xs text-red-600">{errorMessage}</p> : null}
    </article>
  )
}

export default IntegrationCard
