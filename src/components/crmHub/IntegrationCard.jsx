import { useEffect, useState } from 'react'
import { deleteZohoIntegration, retrieveZohoAuthUrl } from '../../services/zohoIntegration'

function IntegrationIcon({ icon }) {
  if (typeof icon === 'string' && /^https?:\/\//.test(icon)) {
    return <img src={icon} alt="Integration logo" className="size-5 object-contain" loading="lazy" />
  }

  if (icon === 'hub') {
    return (
      <svg viewBox="0 0 24 24" className="size-5 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 4v3" />
        <path d="M12 17v3" />
        <path d="M4 12h3" />
        <path d="M17 12h3" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="size-5 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="1.8">
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
  const isComingSoon = integration.comingSoon === true
  const [errorMessage, setErrorMessage] = useState(() =>
    isZohoIntegration ? localStorage.getItem('zoho_integration_error') || '' : '',
  )
  const [isZohoConnected, setIsZohoConnected] = useState(() =>
    isZohoIntegration ? localStorage.getItem('zoho_connected') === 'true' : false,
  )
  const resolvedStatus = isComingSoon ? 'Coming Soon' : isZohoConnected ? 'Connected' : 'Not Connected'
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
      const authUrl = await retrieveZohoAuthUrl({ apiBaseUrl })
      window.open(authUrl, '_blank', 'noopener,noreferrer')
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
      const payload = await deleteZohoIntegration({ integrationIdentifier }, { apiBaseUrl })

      localStorage.setItem('zoho_connected', 'false')
      localStorage.removeItem('zoho_grant_code')
      localStorage.removeItem('zoho_integration_response')
      localStorage.removeItem('zoho_integration_list_response')
      localStorage.removeItem('zoho_integration_list')
      localStorage.removeItem('integration_access_token')
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
    <article
      className={`relative overflow-hidden rounded-lg border border-cyan-200 bg-cyan-50/50 p-4 shadow-sm sm:p-5 ${
        isComingSoon ? 'opacity-70' : ''
      }`}
    >
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-cyan-600 shadow-sm ring-1 ring-cyan-100 sm:size-10">
            <IntegrationIcon icon={integration.icon} />
          </span>
          <div className="min-w-0">
            <h4 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{integration.name}</h4>
            <p className="mt-1 max-w-[18rem] text-sm leading-5 text-slate-500">{integration.subtitle}</p>
          </div>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] sm:shrink-0 ${
            isConnected ? 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
          }`}
        >
          {resolvedStatus}
        </span>
      </div>

      <div className="relative mt-5 h-px w-full bg-gradient-to-r from-cyan-100 via-cyan-200/60 to-transparent" />

      <div className="relative mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium leading-5 text-slate-500">Secure OAuth connection</p>
        <button
          type="button"
          onClick={isComingSoon ? undefined : isZohoConnected ? handleDisconnect : handleConnect}
          onMouseEnter={() => {
            if (isZohoConnected && !isComingSoon) {
              setShowDisconnectAction(true)
            }
          }}
          onMouseLeave={() => {
            if (isZohoConnected && !isComingSoon) {
              setShowDisconnectAction(false)
            }
          }}
          disabled={isComingSoon || isConnecting || isDisconnecting}
          className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed sm:w-auto sm:py-2 ${
            isComingSoon
              ? 'bg-slate-400'
              : isZohoConnected
              ? showDisconnectAction
                ? 'bg-slate-900 shadow-md shadow-slate-900/20 hover:-translate-y-0.5 hover:bg-slate-800'
                : 'bg-cyan-600 shadow-md shadow-cyan-600/25 hover:-translate-y-0.5 hover:bg-cyan-700'
              : 'bg-cyan-600 shadow-md shadow-cyan-600/25 hover:-translate-y-0.5 hover:bg-cyan-700'
          } ${isConnecting || isDisconnecting ? 'opacity-70' : ''}`}
        >
          {isComingSoon
            ? 'Coming Soon'
            : isDisconnecting
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
