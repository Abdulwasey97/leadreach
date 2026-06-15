import { useEffect, useRef, useState } from "react";

const HISTORY_KEYS = [
  "RecentSearches",
  "Recent_Searches",
  "Recent_Queries",
  "SearchHistory",
  "Search_History",
  "Searches",
  "History",
  "Data",
  "data",
  "recentSearches",
  "recentQueries",
  "searchHistory",
  "searches",
  "history",
];

function findFirstArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  for (const key of HISTORY_KEYS) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) {
      return value;
    }

    if (value && typeof value === "object") {
      const nestedArray = findFirstArray(value);
      if (nestedArray.length > 0) {
        return nestedArray;
      }
    }
  }

  return [];
}

function normalizePlatform(value) {
  const raw = String(value || "").trim();
  const lowered = raw.toLowerCase();

  if (lowered === "fb") {
    return "Facebook";
  }

  if (lowered === "google") {
    return "Google";
  }

  if (lowered === "linkedin") {
    return "LinkedIn";
  }

  if (lowered.includes("email")) {
    return "Email";
  }

  return raw || "Unknown";
}

function getField(item, keys, fallback = "") {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return fallback;
}

function parseDate(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return null;
  }

  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const parsed = new Date(/[zZ]$|[+-]\d{2}:?\d{2}$/.test(raw) ? raw : `${normalized}Z`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const parsed = parseDate(value);
  if (!parsed) {
    return value ? String(value) : "Recently";
  }

  const day = parsed.getDate();
  const month = parsed.toLocaleString("en-GB", { month: "short" });
  const hours = parsed.getHours();
  const displayHour = hours % 12 || 12;
  const minutes = String(parsed.getMinutes()).padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";

  return `${day} ${month}, ${displayHour}:${minutes} ${meridiem}`;
}

function getSearchList(payload) {
  return findFirstArray(payload).filter(
    (item) => item && typeof item === "object",
  );
}

function normalizeSearch(item, index) {
  const platform = normalizePlatform(
    getField(item, [
      "source",
      "Source",
      "platform",
      "Platform",
      "searchSource",
      "SearchSource",
      "type",
      "Type",
    ]),
  );
  const query = String(
    getField(
      item,
      [
        "searchText",
        "SearchText",
        "searchTerm",
        "SearchTerm",
        "searchQuery",
        "SearchQuery",
        "query",
        "Query",
        "keyword",
        "Keyword",
        "leadName",
        "name",
        "Name",
      ],
      "Recent search",
    ),
  ).trim();
  const location = String(
    getField(item, [
      "location",
      "Location",
      "city",
      "City",
      "address",
      "Address",
      "targetLocation",
      "TargetLocation",
    ]),
  ).trim();
  const resultCount = Number(
    getField(item, [
      "resultCount",
      "ResultCount",
      "results",
      "Results",
      "leadCount",
      "LeadCount",
      "totalLeads",
      "TotalLeads",
      "count",
      "Count",
    ]),
  );
  const createdAt = getField(item, [
    "createdOn",
    "CreatedOn",
    "createdAt",
    "CreatedAt",
    "searchDate",
    "SearchDate",
    "date",
    "Date",
    "leadCreatedOn",
  ]);

  return {
    id:
      getField(item, [
        "id",
        "Id",
        "searchIdentifier",
        "SearchIdentifier",
        "recentSearchIdentifier",
      ]) || `search-${index}`,
    platform,
    query,
    location,
    resultCount: Number.isFinite(resultCount) ? resultCount : null,
    createdAt,
  };
}

function QueryText({ loading, query }) {
  const textRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    const element = textRef.current;
    setShowTooltip(
      Boolean(element && element.scrollWidth > element.clientWidth),
    );
  };

  return (
    <div
      className="group/query relative min-w-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <p
        ref={textRef}
        className="min-w-0 truncate text-sm font-bold leading-snug text-slate-900"
      >
        {loading ? "Loading search..." : query}
      </p>
      {!loading && showTooltip ? (
        <span className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 max-w-[280px] whitespace-normal rounded-lg border border-slate-200 bg-slate-950 px-3 py-2 text-xs font-semibold leading-5 text-white shadow-lg">
          {query}
        </span>
      ) : null}
    </div>
  );
}

async function fetchRecentSearches(apiBaseUrl, orgIdentifier) {
  const response = await fetch(
    `${apiBaseUrl}/api/Org/v1/Retrieve_RecentSearches`,
    {
      method: "POST",
      headers: {
        accept: "text/plain",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orgIdentifier }),
    },
  );

  if (!response.ok) {
    throw new Error(`Recent searches failed (${response.status})`);
  }

  const payload = await response.json();
  const failed =
    payload?.Code === 500 ||
    String(payload?.Status || "").toLowerCase() === "failure";

  if (failed) {
    throw new Error(payload?.Reason || "Unable to load recent searches.");
  }

  return getSearchList(payload)
    .map(normalizeSearch)
    .sort((first, second) => {
      const firstDate = parseDate(first.createdAt)?.getTime() || 0;
      const secondDate = parseDate(second.createdAt)?.getTime() || 0;

      return secondDate - firstDate;
    });
}

function RecentSearchesPanel({ apiBaseUrl, orgIdentifier }) {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadRecentSearches() {
      if (!orgIdentifier) {
        setSearches([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const recentSearches = await fetchRecentSearches(
          apiBaseUrl,
          orgIdentifier,
        );

        if (isActive) {
          setSearches(recentSearches);
        }
      } catch (requestError) {
        if (isActive) {
          setSearches([]);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Failed to load recent searches.",
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadRecentSearches();

    return () => {
      isActive = false;
    };
  }, [apiBaseUrl, orgIdentifier]);

  const visibleSearches = loading
    ? Array.from({ length: 5 }).map((_, index) => ({
        id: `loading-${index}`,
      }))
    : searches;

  return (
    <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:min-h-0 xl:flex-1">
      <div className="shrink-0 border-b border-slate-100 px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
          Search history
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Recent Searches
          </h2>
          <p className="text-xs font-medium text-slate-500">
            {loading ? "Loading..." : `${searches.length} saved searches`}
          </p>
        </div>
      </div>

      {error ? (
        <p className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800">
          {error}
        </p>
      ) : null}

      <div className="min-h-0 flex-1 bg-slate-50/60 p-3">
        <div className="space-y-3">
          {visibleSearches.map((search, index) => {
            return (
              <article
                key={search.id}
                className={`group relative overflow-visible rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md ${
                  loading ? "animate-pulse" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-[11px] font-bold text-cyan-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <QueryText loading={loading} query={search.query} />
                    <span className="whitespace-nowrap rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                      {loading ? "Recent" : formatDate(search.createdAt)}
                    </span>
                  </div>
                </div>
                <span className="absolute inset-y-0 left-0 w-1 bg-cyan-500" />
              </article>
            );
          })}

          {!loading && searches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-base font-bold text-slate-800">
                No recent searches yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                New organization searches will appear here automatically.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default RecentSearchesPanel;
