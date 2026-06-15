import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ROUTES, navigationItems } from '../../routes'

function NavIcon({ icon }) {
  const iconClassName = 'size-4 shrink-0'

  if (icon === 'search') {
    return (
      <svg viewBox="0 0 24 24" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    )
  }

  if (icon === 'users') {
    return (
      <svg viewBox="0 0 24 24" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }

  if (icon === 'chart') {
    return (
      <svg viewBox="0 0 24 24" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 3 3 5-6" />
      </svg>
    )
  }

  if (icon === 'history') {
    return (
      <svg viewBox="0 0 24 24" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l3 2" />
      </svg>
    )
  }

  if (icon === 'settings') {
    return (
      <svg viewBox="0 0 24 24" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.86l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.86-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.86.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.86 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.86l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.86.34h.02a1.7 1.7 0 0 0 .98-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.86-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.86v.02a1.7 1.7 0 0 0 1.55.98H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={iconClassName} fill="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  )
}

function Sidebar() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth >= 786
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 786px)')

    const handleViewportChange = (event) => {
      setIsOpen(event.matches)
    }

    setIsOpen(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleViewportChange)

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange)
    }
  }, [])

  const closeMobileSidebar = () => {
    if (window.innerWidth < 786) {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`fixed left-4 top-4 z-[100] size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-cyan-200 hover:text-cyan-700 min-[786px]:hidden ${
          isOpen ? 'hidden' : 'inline-flex'
        }`}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      </button>

      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-[1px] min-[786px]:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Close navigation overlay"
        />
      ) : null}

      <aside
        className={`leadreach-sidebar-shell fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-50 px-3 py-5 shadow-xl transition-transform duration-300 min-[786px]:sticky min-[786px]:top-0 min-[786px]:translate-x-0 min-[786px]:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <header className="flex items-start justify-between gap-3 px-3 py-2">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">LeadReach</h1>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Executive Ledger</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700 min-[786px]:hidden"
            aria-label="Close navigation menu"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6 6 18" />
            </svg>
          </button>
        </header>

        <nav className="mt-5 space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                  isActive
                    ? 'border-l-2 border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-100/60'
                    : 'text-slate-500 hover:bg-white hover:text-slate-800'
                }`
              }
            >
              <NavIcon icon={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <NavLink
            to={ROUTES.help}
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'border-l-2 border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-100/60'
                  : 'text-slate-500 hover:bg-white hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`inline-flex size-5 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  ?
                </span>
                Help Center
              </>
            )}
          </NavLink>

        </div>
      </aside>
    </>
  )
}

export default Sidebar
