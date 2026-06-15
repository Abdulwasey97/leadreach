const EMAIL_CATEGORY_OPTIONS = ["personal", "business"];

function TargetIcon({ icon }) {
  if (icon === "search") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
        <path d="M8.8 11h4.4" />
      </svg>
    );
  }

  if (icon === "globe") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M4 12h16" />
        <path d="M12 4a12 12 0 0 1 0 16" />
        <path d="M12 4a12 12 0 0 0 0 16" />
      </svg>
    );
  }

  if (icon === "briefcase") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="4" y="7" width="16" height="12" rx="2" />
        <path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
        <path d="M4 12h16" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function AdvancedFilteringCard({
  platforms,
  selectedSource,
  onSelectSource,
  blockedPlatformIds = [],
  query,
  onQueryChange,
  onSearch,
  loading,
  emailCategory,
  onEmailCategoryChange,
  emailTypes,
  emailTypeOptions,
  onToggleEmailType,
}) {
  const isSelectedPlatformBlocked = blockedPlatformIds.includes(selectedSource);
  const isSearchDisabled = loading || isSelectedPlatformBlocked;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSearchDisabled) {
      return;
    }

    onSearch();
  };

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-sm shadow-cyan-100">
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 5h16" />
              <path d="M7 12h10" />
              <path d="M10 19h4" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
              Lead controls
            </p>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              Advanced Filtering
            </h3>
          </div>
        </div>
        <p className="hidden rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-500 sm:block">
          Platform, email filters &amp; search
        </p>
      </header>

      <div className="space-y-2.5 p-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-2">
          <div className="flex flex-wrap items-stretch gap-3">
            <div className="w-full min-w-0 flex-[2_1_520px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 min-[900px]:min-w-[460px]">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Platform
              </p>
              <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-3">
                {platforms.map((platform) => {
                  const isSelected = selectedSource === platform.id;
                  const isBlocked = blockedPlatformIds.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => onSelectSource(platform.id)}
                    className={`group relative flex min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-lg border px-3 py-2 text-left transition ${
                        isSelected
                          ? "border-cyan-300 bg-cyan-50 text-cyan-900 shadow-sm shadow-cyan-100"
                          : isBlocked
                            ? "border-slate-200 bg-slate-50 text-slate-400 opacity-70"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-200 hover:bg-white"
                      }`}
                    >
                      <span
                        className={`absolute inset-x-0 top-0 h-0.5 ${isSelected ? "bg-cyan-500" : "bg-transparent group-hover:bg-cyan-200"}`}
                      />
                      <span
                        className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md ${
                          isSelected
                            ? "bg-cyan-600 text-white"
                            : isBlocked
                              ? "bg-slate-100 text-slate-400"
                              : "bg-white text-cyan-700"
                        }`}
                      >
                        <TargetIcon icon={platform.icon} />
                      </span>
                      <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold leading-4">
                          {platform.name}
                        </span>
                        {isBlocked ? (
                          <span className="text-[10px] font-semibold uppercase text-slate-400">
                            Limit reached
                          </span>
                        ) : isSelected ? (
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-cyan-700">
                            Active
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:w-auto sm:shrink-0">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Category
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EMAIL_CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onEmailCategoryChange(option)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition ${
                      emailCategory === option
                        ? "bg-white text-cyan-700 ring-1 ring-cyan-500 shadow-sm"
                        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-cyan-50 hover:text-cyan-800 hover:ring-cyan-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 min-[900px]:min-w-[430px]">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Email type
              </p>
              <div className="flex flex-wrap gap-1.5">
                {emailTypeOptions.map((type) => {
                  const selected = emailTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onToggleEmailType(type)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                        selected
                          ? "bg-white text-cyan-700 ring-1 ring-cyan-500 shadow-sm"
                          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-cyan-50 hover:text-cyan-800 hover:ring-cyan-100"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-3xl rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 ring-1 ring-slate-200">
              {selectedSource}
            </span>
            <div className="flex min-w-0 flex-1 basis-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 sm:basis-auto">
              <svg
                viewBox="0 0 24 24"
                className="size-4 shrink-0 text-cyan-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="e.g. software houses in rawalpindi"
                className="h-7 w-full min-w-0 border-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSearchDisabled}
              className="h-10 w-full shrink-0 rounded-lg bg-cyan-600 px-5 text-sm font-semibold text-white shadow-sm shadow-cyan-100 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AdvancedFilteringCard;
