import { navigationItems } from '../../data/dashboardData'

function NavIcon({ icon }) {
  const iconClassName = 'size-4 text-slate-500'

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

function Sidebar({ activeItem = 'dashboard', onNavigate }) {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-50 p-4">
      <header className="px-2 py-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">LeadReach</h1>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Executive Ledger</p>
      </header>

      <nav className="mt-6 space-y-1">
        {navigationItems.map((item) => {
          const isActive = item.id === activeItem

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate?.(item.id)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                isActive ? 'border-l-2 border-cyan-500 bg-cyan-50 text-cyan-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <NavIcon icon={item.icon} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto space-y-3">
       

        <button type="button" className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">?</span>
          Help Center
        </button>

        <button type="button" className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">
          <span className="inline-flex size-5 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600">@</span>
          Account
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
