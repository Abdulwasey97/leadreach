import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/layout/Sidebar";

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

  return list
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
  const [expandedAddressRows, setExpandedAddressRows] = useState({});

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    const orgIdentifier =
      localStorage.getItem("organization_identifier") || "ORG-2012";
    const selectedSource = PLATFORM_SOURCES.find(
      (source) => source.platform === platformFilter,
    );

    try {
      const searchedLeads = await fetchSearchedLeads(
        apiBaseUrl,
        orgIdentifier,
        selectedSource,
        sortConfig,
      );

      setLeads(searchedLeads);
      setExpandedAddressRows({});
    } catch (requestError) {
      setLeads([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load search history.",
      );
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, platformFilter, sortConfig]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadHistory();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadHistory]);

  const filteredLeads = useMemo(() => {
    if (platformFilter === "all") {
      return leads;
    }

    return leads.filter((lead) => lead.platform === platformFilter);
  }, [leads, platformFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const visiblePage = Math.min(currentPage, totalPages);

  const paginatedLeads = useMemo(() => {
    const startIndex = (visiblePage - 1) * PAGE_SIZE;
    return filteredLeads.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLeads, visiblePage]);

  const handlePlatformFilterChange = (value) => {
    setPlatformFilter(value);
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
                <label className="relative">
                  <span className="sr-only">Filter platform</span>
                  <select
                    value={platformFilter}
                    onChange={(event) =>
                      handlePlatformFilterChange(event.target.value)
                    }
                    className="h-9 cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm font-medium text-slate-700 outline-none transition hover:border-cyan-200 focus:border-cyan-400"
                  >
                    <option value="all">All</option>
                    {PLATFORM_SOURCES.map((source) => (
                      <option key={source.platform} value={source.platform}>
                        {source.platform}
                      </option>
                    ))}
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

              <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-slate-500">
                <p>
                  {loading
                    ? "Loading saved leads from all platforms..."
                    : `${filteredLeads.length} leads found`}
                </p>
              </div>

              {error ? (
                <p className="border-y border-amber-100 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-800">
                  {error}
                </p>
              ) : null}

              <div className="space-y-3 bg-slate-50/60 p-3 min-[786px]:hidden">
                {paginatedLeads.map((lead) => {
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
                })}

                {!loading && filteredLeads.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
                    <p className="text-base font-bold text-slate-800">
                      No historical leads yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Run a lead search and the saved results will appear here.
                    </p>
                  </div>
                ) : null}

                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={`mobile-loading-${index}`}
                        className="animate-pulse rounded-lg border border-slate-200 bg-white p-4"
                      >
                        <span className="block h-4 w-3/4 rounded-full bg-slate-100" />
                        <span className="mt-3 block h-3 w-1/2 rounded-full bg-slate-100" />
                        <span className="mt-5 block h-14 rounded-lg bg-slate-100" />
                      </div>
                    ))
                  : null}
              </div>

              <div className="hidden overflow-hidden min-[786px]:block">
                <table className="w-full table-fixed border-separate border-spacing-0">
                  <colgroup>
                    {platformFilter === "LinkedIn" ? (
                      <>
                        <col className="w-[22%]" />
                        <col className="w-[20%]" />
                        <col className="w-[24%]" />
                        <col className="w-[10%]" />
                        <col className="w-[14%]" />
                        <col className="w-[10%]" />
                      </>
                    ) : (
                      <>
                        <col className="w-[21%]" />
                        <col className="w-[18%]" />
                        <col className="w-[11%]" />
                        <col className="w-[24%]" />
                        <col className="w-[10%]" />
                        <col className="w-[6%]" />
                        <col className="w-[10%]" />
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
                    {paginatedLeads.map((lead) => {
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
                            <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700">
                              <span className="size-1.5 rounded-full bg-cyan-600" />
                              <span className="truncate">{lead.platform}</span>
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
                    })}

                    {!loading && filteredLeads.length === 0 ? (
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
                    ) : null}

                    {loading
                      ? Array.from({ length: 5 }).map((_, index) => (
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
                      : null}
                  </tbody>
                </table>
              </div>

              {filteredLeads.length > PAGE_SIZE ? (
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
