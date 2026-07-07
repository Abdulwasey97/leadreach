import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { getStoredOrgIdentifier } from "../services/zohoIntegration";

const PAGE_SIZE = 10;

const PLATFORM_SOURCES = [
  { platform: "Facebook", apiValue: "fb" },
  { platform: "Google", apiValue: "google" },
  { platform: "LinkedIn", apiValue: "linkedin" },
];

const PLATFORM_DOT_STYLES = {
  Facebook: "bg-cyan-600",
  Google: "bg-cyan-600",
  LinkedIn: "bg-cyan-600",
};

const SOURCE_TO_PLATFORM = {
  fb: "Facebook",
  facebook: "Facebook",
  google: "Google",
  linkedin: "LinkedIn",
};

const SORTABLE_COLUMNS = [
  { heading: "Name", sortKey: "leadName" },
  { heading: "Date", sortKey: "leadCreatedOn" },
];

const ADDRESS_PREVIEW_LENGTH = 42;

function formatLeadName(lead) {
  const leadName = String(lead?.leadName || "").trim();
  const first = String(lead?.firstName || "").trim();
  const last = String(lead?.lastName || "").trim();
  const name = String(lead?.name || "").trim();

  if (first && last && first !== last) {
    return `${first} ${last}`;
  }

  return leadName || first || last || name || "N/A";
}

function formatAddressPreview(address, isExpanded) {
  const value = String(address || "").trim();

  if (!value) {
    return "N/A";
  }

  if (isExpanded || value.length <= ADDRESS_PREVIEW_LENGTH) {
    return value;
  }

  return `${value.slice(0, ADDRESS_PREVIEW_LENGTH).trim()}...`;
}

function parseUtcDate(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }

  if (/[zZ]$|[+-]\d{2}:\d{2}$|[+-]\d{4}$/.test(raw)) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const parsed = new Date(`${normalized}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value) {
  const parsed = parseUtcDate(value);
  if (!parsed) {
    return value ? String(value) : "-";
  }

  return parsed.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRating(value) {
  if (!value) {
    return "N/A";
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? String(value) : parsed.toFixed(1);
}

function getEnrichedEmailSummary(lead) {
  const directEmails = [
    lead?.email,
    lead?.Email,
    lead?.emailAddress,
    lead?.EmailAddress,
    lead?.enrichedEmail,
    lead?.EnrichedEmail,
  ]
    .map((email) => String(email || "").trim())
    .filter(Boolean);

  const enrichedEmails = Array.isArray(lead?.EnrichedEmails)
    ? lead.EnrichedEmails
        .map((email) =>
          String(
            email?.emailAddress ??
              email?.EmailAddress ??
              email?.email ??
              email?.Email ??
              email ??
              "",
          ).trim(),
        )
        .filter(Boolean)
    : [];

  const emails = [...new Set([...directEmails, ...enrichedEmails])];
  if (emails.length === 0) {
    return "No enriched";
  }

  if (emails.length === 1) {
    return emails[0];
  }

  return `${emails[0]} (+${emails.length - 1} more)`;
}

function SortIcon({ direction, active }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`size-3.5 ${active ? "text-cyan-700" : "text-slate-500"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {direction === "ASC" ? (
        <>
          <path d="m7 8 3-3 3 3" />
          <path d="M10 5v10" />
        </>
      ) : direction === "DESC" ? (
        <>
          <path d="m7 12 3 3 3-3" />
          <path d="M10 5v10" />
        </>
      ) : (
        <>
          <path d="m7 6 3-3 3 3" />
          <path d="m13 14-3 3-3-3" />
        </>
      )}
    </svg>
  );
}

function getPlatformFromLead(lead, fallbackSource) {
  const source =
    lead?.source ||
    lead?.Source ||
    lead?.sourcePlatform ||
    lead?.SourcePlatform ||
    lead?.leadSource ||
    lead?.LeadSource ||
    lead?.platform ||
    lead?.Platform ||
    fallbackSource ||
    "";
  const normalizedSource = String(source).trim().toLowerCase();

  return SOURCE_TO_PLATFORM[normalizedSource] || source || "-";
}

function getPlatformIcon(platform) {
  const norm = String(platform || "").trim().toLowerCase();
  if (norm === "facebook" || norm === "fb") {
    return (
      <svg className="size-3.5 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
      </svg>
    );
  }
  if (norm === "google") {
    return (
      <svg className="size-3.5 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    );
  }
  if (norm === "linkedin") {
    return (
      <svg className="size-3.5 shrink-0 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8.5 19H5.5V10h3v9zM7 8.5c-1 0-1.8-.8-1.8-1.8S6 5 7 5s1.8.8 1.8 1.8S8 8.5 7 8.5zM19 19h-3v-4.5c0-1.1-.9-2-2-2s-2 .9-2 2V19h-3V10h3v1.5c.8-1.2 2.1-2 3.5-2 2.5 0 4.5 2 4.5 4.5V19z"/>
      </svg>
    );
  }
  return <span className="size-1.5 rounded-full bg-cyan-600 shrink-0" />;
}

function getSearchedLeadList(payload) {
  const leadKeys = [
    "Searched_Leads",
    "SearchedLeads",
    "Leads",
    "leads",
    "Lead_Data",
    "Data",
    "data",
  ];

  for (const key of leadKeys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
}

async function fetchSearchedLeads(
  apiBaseUrl,
  orgIdentifier,
  selectedSource,
  sortConfig,
  pageNo,
  pageSize,
) {
  const requestBody = { orgIdentifier };
  const sortKey =
    sortConfig?.sortKey === "leadName"
      ? !selectedSource?.apiValue
        ? "leadName"
        : selectedSource.apiValue === "google"
          ? "name"
          : "firstName"
      : sortConfig?.sortKey;

  requestBody.source = selectedSource?.apiValue || "all";

  if (sortKey && sortConfig?.direction) {
    requestBody.sort = sortConfig.direction;
    requestBody.sortKey = sortKey;
  }

  if (pageNo !== undefined) {
    requestBody.pageNo = pageNo;
  }
  if (pageSize !== undefined) {
    requestBody.pageSize = pageSize;
  }

  const response = await fetch(
    `${apiBaseUrl}/api/Leads/v1/Retrieve_SearchedLeads`,
    {
      method: "POST",
      headers: {
        accept: "text/plain",
        "Content-Type": "application/json-patch+json",
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (!response.ok) {
    throw new Error(`Search history failed (${response.status})`);
  }

  const payload = await response.json();
  const requestFailed =
    payload?.Code !== 200 ||
    String(payload?.Status || "").toLowerCase() !== "success";

  if (requestFailed) {
    throw new Error(payload?.Reason || "Unable to load search history.");
  }

  const list = getSearchedLeadList(payload);
  const fallbackSource = selectedSource?.apiValue || "";

  const leads = list
    .map((lead) => {
      const platform = getPlatformFromLead(lead, fallbackSource);

      return {
        ...lead,
        platform,
        rowId: `${platform}-${lead?.id ?? lead?.leadIdentifier ?? Math.random()}`,
      };
    })
    .filter((lead) => {
      const platform = String(lead.platform || "").trim().toLowerCase();
      return platform !== "instagram" && platform !== "insta";
    });

  return {
    leads,
    totalRecords: payload?.TotalRecords ?? leads.length,
    googleCount: payload?.Google_LeadCount ?? 0,
    facebookCount: payload?.Facebook_LeadCount ?? 0,
    linkedinCount: payload?.Linkedin_LeadCount ?? 0,
  };
}

function LeadSearchHistoryPage() {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "https://leadreach.api-pct.com";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState([]);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    sortKey: "leadCreatedOn",
    direction: "DESC",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [platformCounts, setPlatformCounts] = useState({
    google: 0,
    facebook: 0,
    linkedin: 0,
    all: 0,
  });
  const [expandedAddressRows, setExpandedAddressRows] = useState({});

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    const orgIdentifier = getStoredOrgIdentifier();
    const selectedSource = PLATFORM_SOURCES.find(
      (source) => source.platform === platformFilter,
    );

    try {
      if (!orgIdentifier) {
        throw new Error("Zoho organization details are not available yet. Please reload the widget and try again.");
      }

      const {
        leads: list,
        totalRecords: total,
        googleCount,
        facebookCount,
        linkedinCount,
      } = await fetchSearchedLeads(
        apiBaseUrl,
        orgIdentifier,
        selectedSource,
        sortConfig,
        currentPage,
        pageSize,
      );

      setLeads(list);
      setTotalRecords(total);
      setPlatformCounts((prev) => ({
        google: googleCount || prev.google,
        facebook: facebookCount || prev.facebook,
        linkedin: linkedinCount || prev.linkedin,
        all: platformFilter === "all" ? total : (prev.all || total),
      }));
      setExpandedAddressRows({});
    } catch (requestError) {
      setLeads([]);
      setTotalRecords(0);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load search history.",
      );
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, platformFilter, sortConfig, currentPage, pageSize]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadHistory();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadHistory]);

  const totalPages = Math.ceil(totalRecords / pageSize);
  const visiblePage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedLeads = leads;

  const handlePlatformFilterChange = (value) => {
    setPlatformFilter(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const handleSortChange = (sortKey) => {
    setSortConfig((prev) => ({
      sortKey,
      direction:
        prev.sortKey === sortKey && prev.direction === "ASC" ? "DESC" : "ASC",
    }));
    setCurrentPage(1);
  };

  const handleToggleAddress = (rowId) => {
    setExpandedAddressRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <div className="mx-auto flex h-screen max-w-[1500px] overflow-hidden">
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="dashboard-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
            <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Acquisition Archive
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Lead Search History
              </h2>
            </header>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <label className="relative">
                    <span className="sr-only">Filter platform</span>
                    <select
                      value={platformFilter}
                      onChange={(event) =>
                        handlePlatformFilterChange(event.target.value)
                      }
                      className="h-9 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition hover:border-cyan-200 focus:border-cyan-400"
                    >
                      <option value="all">All Platforms ({platformCounts.all || totalRecords})</option>
                      {PLATFORM_SOURCES.map((source) => {
                        const countKey = source.platform.toLowerCase();
                        const count = platformCounts[countKey] ?? 0;
                        return (
                          <option key={source.platform} value={source.platform}>
                            {source.platform} ({count})
                          </option>
                        );
                      })}
                    </select>
                    <svg
                      viewBox="0 0 20 20"
                      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="m6 8 4 4 4-4" />
                    </svg>
                  </label>

                  <label className="relative">
                    <span className="sr-only">Page size</span>
                    <select
                      value={pageSize}
                      onChange={(event) =>
                        handlePageSizeChange(event.target.value)
                      }
                      className="h-9 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition hover:border-cyan-200 focus:border-cyan-400"
                    >
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={30}>30 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                    <svg
                      viewBox="0 0 20 20"
                      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="m6 8 4 4 4-4" />
                    </svg>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-slate-500">
                <p>
                  {loading
                    ? "Loading saved leads from all platforms..."
                    : `${totalRecords} leads found`}
                </p>
              </div>

              {error ? (
                <p className="border-y border-amber-100 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800">
                  {error}
                </p>
              ) : null}

              <div className="space-y-3 bg-slate-50/60 p-3 min-[786px]:hidden">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={`mobile-loading-${index}`}
                      className="animate-pulse rounded-lg border border-slate-200 bg-white p-4"
                    >
                      <span className="block h-4 w-3/4 rounded-full bg-slate-100" />
                      <span className="mt-3 block h-3 w-1/2 rounded-full bg-slate-100" />
                      <span className="mt-5 block h-14 rounded-lg bg-slate-100" />
                    </div>
                  ))
                ) : paginatedLeads.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
                    <p className="text-base font-bold text-slate-800">
                      No historical leads yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Run a lead search and the saved results will appear here.
                    </p>
                  </div>
                ) : (
                  paginatedLeads.map((lead) => {
                    const isAddressExpanded = Boolean(
                      expandedAddressRows[lead.rowId],
                    );
                    const address = String(
                      lead.platform === "LinkedIn" && lead.location
                        ? lead.location
                        : lead.address || "",
                    ).trim();
                    const canExpandAddress =
                      address.length > ADDRESS_PREVIEW_LENGTH;

                    return (
                      <article
                        key={lead.rowId}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="break-words text-sm font-bold leading-5 text-slate-900">
                                  {formatLeadName(lead)}
                                </p>
                                {lead?.headline ? (
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                    {lead.headline}
                                  </p>
                                ) : null}
                              </div>
                              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-cyan-100 bg-cyan-50 px-2 py-1 text-[11px] font-bold text-cyan-700">
                                <span className="size-1.5 rounded-full bg-cyan-600" />
                                {lead.platform}
                              </span>
                            </div>

                            <div className="mt-4 grid gap-3 text-xs text-slate-600">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                  Email
                                </p>
                                <p className="mt-1 break-words font-semibold text-slate-700">
                                  {getEnrichedEmailSummary(lead)}
                                </p>
                              </div>

                              {platformFilter !== "LinkedIn" ? (
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Phone
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-700">
                                    {lead.platform === "LinkedIn"
                                      ? "N/A"
                                      : lead.phone || "N/A"}
                                  </p>
                                </div>
                              ) : null}

                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                  Address
                                </p>
                                <p className="mt-1 break-words font-semibold text-slate-700">
                                  {formatAddressPreview(
                                    address,
                                    isAddressExpanded,
                                  )}
                                </p>
                                {canExpandAddress ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleAddress(lead.rowId)
                                    }
                                    className="mt-1 text-xs font-bold text-cyan-700"
                                  >
                                    {isAddressExpanded ? "See less" : "See more"}
                                  </button>
                                ) : null}
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {lead.platform === "LinkedIn"
                                  ? `${lead?.followerCount ?? "N/A"} followers`
                                  : `Rating ${formatRating(lead.rating)}`}
                              </span>
                              <span className="text-xs font-semibold text-slate-500">
                                {formatDate(lead.leadCreatedOn)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              <div className="hidden overflow-hidden min-[786px]:block">
                <table className="w-full table-fixed border-separate border-spacing-0">
                  <colgroup>
                    {platformFilter === "LinkedIn" ? (
                      <>
                        <col className="w-[20%]" />
                        <col className="w-[18%]" />
                        <col className="w-[22%]" />
                        <col className="w-[8%]" />
                        <col className="w-[24%]" />
                        <col className="w-[8%]" />
                      </>
                    ) : (
                      <>
                        <col className="w-[18%]" />
                        <col className="w-[16%]" />
                        <col className="w-[10%]" />
                        <col className="w-[20%]" />
                        <col className="w-[8%]" />
                        <col className="w-[20%]" />
                        <col className="w-[8%]" />
                      </>
                    )}
                  </colgroup>
                  <thead>
                    <tr className="bg-slate-100">
                      {[
                        "Name",
                        "Email",
                        platformFilter === "LinkedIn" ? null : "Phone",
                        "Address",
                        "Platform",
                        platformFilter === "LinkedIn" ? "Followers / Connections" : "Rating",
                        "Date",
                      ].filter(Boolean).map((heading) => {
                        const sortableColumn = SORTABLE_COLUMNS.find(
                          (column) => column.heading === heading,
                        );
                        const isActiveSort =
                          sortableColumn?.sortKey === sortConfig.sortKey;

                        return (
                          <th
                            key={heading}
                            className="border-b border-slate-200 px-3 py-3 text-left text-xs font-medium text-slate-900"
                          >
                            {sortableColumn ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSortChange(sortableColumn.sortKey)
                                }
                                className={`inline-flex max-w-full items-center gap-2 transition hover:text-cyan-700 ${
                                  isActiveSort ? "text-cyan-700" : ""
                                }`}
                                aria-label={`Sort by ${heading}`}
                              >
                                {heading}
                                <SortIcon
                                  active={isActiveSort}
                                  direction={
                                    isActiveSort
                                      ? sortConfig.direction
                                      : undefined
                                  }
                                />
                              </button>
                            ) : (
                              <span className="truncate">{heading}</span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr
                          key={`loading-${index}`}
                          className="animate-pulse"
                        >
                          {Array.from({ length: platformFilter === "LinkedIn" ? 6 : 7 }).map((__, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="border-b border-slate-100 px-4 py-4"
                            >
                              <span className="block h-4 rounded-full bg-slate-100" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : paginatedLeads.length === 0 ? (
                      <tr>
                        <td colSpan={platformFilter === "LinkedIn" ? 6 : 7} className="px-5 py-14 text-center">
                          <p className="text-base font-bold text-slate-800">
                            No historical leads yet
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Run a lead search and the saved results will appear
                            here.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedLeads.map((lead) => {
                        const isAddressExpanded = Boolean(
                          expandedAddressRows[lead.rowId],
                        );
                        const address = String(
                          lead.platform === "LinkedIn" && lead.location
                            ? lead.location
                            : lead.address || ""
                        ).trim();
                        const canExpandAddress =
                          address.length > ADDRESS_PREVIEW_LENGTH;

                        return (
                          <tr
                            key={lead.rowId}
                            className="group transition hover:bg-slate-50"
                          >
                            <td className="min-w-0 border-b border-slate-100 px-3 py-4">
                              {lead.platform === "LinkedIn" ? (
                                <div className="flex items-center gap-3">
                                  {lead?.profilePictureUrl ? (
                                    <img
                                      src={lead.profilePictureUrl}
                                      alt={formatLeadName(lead)}
                                      className="size-10 rounded-full object-cover border border-slate-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
                                      {lead?.firstName && lead?.lastName
                                        ? `${lead.firstName[0] || ''}${lead.lastName[0] || ''}`.toUpperCase()
                                        : formatLeadName(lead)[0]?.toUpperCase() || '?'}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                      {formatLeadName(lead)}
                                    </p>
                                    {lead?.headline && (
                                      <p className="truncate text-xs text-slate-500" title={lead.headline}>
                                        {lead.headline}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="truncate text-sm font-semibold text-slate-900" title={formatLeadName(lead)}>
                                  {formatLeadName(lead)}
                                </p>
                              )}
                            </td>
                            <td className="min-w-0 border-b border-slate-100 px-3 py-4 text-sm text-slate-700">
                              <p className="break-words" title={getEnrichedEmailSummary(lead)}>
                                {getEnrichedEmailSummary(lead)}
                              </p>
                            </td>
                            {platformFilter !== "LinkedIn" && (
                              <td className="break-words border-b border-slate-100 px-3 py-4 text-sm text-slate-700">
                                {lead.platform === "LinkedIn" ? "N/A" : (lead.phone || "N/A")}
                              </td>
                            )}
                            <td className="min-w-0 border-b border-slate-100 px-3 py-4 text-sm text-slate-700">
                              <div className="min-w-0">
                                <p
                                  className={
                                    isAddressExpanded
                                      ? "whitespace-normal break-words"
                                      : "truncate"
                                  }
                                >
                                  {formatAddressPreview(
                                    address,
                                    isAddressExpanded,
                                  )}
                                </p>
                                {canExpandAddress ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleAddress(lead.rowId)
                                    }
                                    className="mt-1 text-xs font-semibold text-cyan-700 transition hover:text-cyan-900"
                                  >
                                    {isAddressExpanded ? "See less" : "See more"}
                                  </button>
                                ) : null}
                              </div>
                            </td>
                            <td className="min-w-0 border-b border-slate-100 px-3 py-4">
                              <span
                                title={lead.platform}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm"
                              >
                                {getPlatformIcon(lead.platform)}
                              </span>
                            </td>
                            <td className="min-w-0 border-b border-slate-100 px-3 py-4 text-sm text-slate-700">
                              {lead.platform === "LinkedIn" ? (
                                <div className="flex flex-col gap-1 text-xs">
                                  <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 rounded px-2 py-0.5 w-fit">
                                    <strong>{lead?.followerCount ?? "N/A"}</strong> followers
                                  </span>
                                  <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-100 rounded px-2 py-0.5 w-fit">
                                    <strong>{lead?.connectionCount ?? "N/A"}</strong> connections
                                  </span>
                                </div>
                              ) : (
                                formatRating(lead.rating)
                              )}
                            </td>
                            <td className="break-words border-b border-slate-100 px-3 py-4 text-sm text-slate-700">
                              {formatDate(lead.leadCreatedOn)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {totalRecords > pageSize ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-4">
                  <p className="text-sm font-medium text-slate-500">
                    Page{" "}
                    <span className="font-bold text-slate-800">
                      {visiblePage}
                    </span>{" "}
                    of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={visiblePage === 1}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={visiblePage === totalPages}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadSearchHistoryPage;
