import { useEffect, useState } from "react";

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
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
        <div className="dashboard-scrollbar h-full space-y-3 overflow-y-auto pr-1">
          {visibleSearches.map((search, index) => {
            return (
              <article
                key={search.id}
                className={`group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md ${
                  loading ? "animate-pulse" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-[11px] font-bold text-cyan-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold leading-snug text-slate-900">
                        {loading ? "Loading search..." : search.query}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {loading ? "Recent" : formatDate(search.createdAt)}
                        </span>
                      </div>
                    </div>
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
