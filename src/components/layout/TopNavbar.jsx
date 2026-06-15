function TopNavbar({
  showSupport = false,
  showAvatar = false,
  showUpgrade = false,
  navItems = [],
  activeNavItem = '',
  onNavItemClick,
}) {
  return (
    <header className="hidden border-b border-slate-200 bg-white px-5 py-3 min-[786px]:block">
      <div className="flex min-h-[44px] items-center justify-end gap-6">
        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onNavItemClick?.(item)}
              className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeNavItem === item
                  ? 'bg-cyan-50 text-cyan-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {showSupport && (
          <button className="cursor-pointer text-sm font-semibold text-cyan-600 transition hover:text-cyan-700">Support</button>
        )}

        {showSupport && (
          <div className="hidden items-center gap-3 lg:flex">
            <button type="button" aria-label="Notifications" className="cursor-pointer text-slate-500 transition hover:text-slate-700">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <button type="button" aria-label="History" className="cursor-pointer text-slate-500 transition hover:text-slate-700">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3v5h5" />
                <path d="M3.05 13A9 9 0 1 0 6 6.3L3 8" />
                <path d="M12 7v5l4 2" />
              </svg>
            </button>
          </div>
        )}

        {showUpgrade ? (
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Upgrade Plan
          </button>
        ) : null}

        {showAvatar && (
          <span
            title="User profile"
            className="inline-flex size-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"
          >
            M
          </span>
        )}
      </div>
    </header>
  )
}

export default TopNavbar
