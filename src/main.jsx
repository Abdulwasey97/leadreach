import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { crmError, crmLog } from './utils/diagnostics'

crmLog('React entry loaded', {
  href: window.location.href,
  referrer: document.referrer,
  inIframe: window.self !== window.top,
  hasZoho: Boolean(window.ZOHO),
})

window.addEventListener('error', (event) => {
  crmError('Unhandled window error', {
    message: event.message,
    filename: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error,
  })
})

window.addEventListener('unhandledrejection', (event) => {
  crmError('Unhandled promise rejection', event.reason)
})

const rootElement = document.getElementById('root')

if (!rootElement) {
  crmError('React root element not found')
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>,
  )

  crmLog('React render called')
}
