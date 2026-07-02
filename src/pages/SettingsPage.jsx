import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";

const settingsTopNavItems = ["Organization", "Team"];
const USERS_PAGE_SIZE = 5;

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function getOrganizationDetailsFromStorage() {
  const payload = safeParseJson(
    localStorage.getItem("organization_details_response") || "{}",
  );
  return payload?.OrgDetails || payload?.OrganizationDetails || {};
}

function initials(name) {
  return name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getUserDisplayName(user) {
  const firstName = String(user?.userFirstName || "").trim();
  const lastName = String(user?.userLastName || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user?.userName || "N/A";
}

function SettingsPage() {
  const [activeSettingsTab, setActiveSettingsTab] = useState("Organization");
  const [organizationDetails, setOrganizationDetails] = useState(() =>
    getOrganizationDetailsFromStorage(),
  );
  const [usersPage, setUsersPage] = useState(1);
  const organizationUsers = Array.isArray(organizationDetails.Users)
    ? organizationDetails.Users
    : [];
  const totalUsers = organizationUsers.length;
  const activeUsers = organizationUsers.filter(
    (user) => user?.userStatus === true,
  ).length;
  const inactiveUsers = Math.max(0, totalUsers - activeUsers);
  const activeUserPercent =
    totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
  const totalUserPages = Math.max(
    1,
    Math.ceil(organizationUsers.length / USERS_PAGE_SIZE),
  );
  const paginatedOrganizationUsers = organizationUsers.slice(
    (usersPage - 1) * USERS_PAGE_SIZE,
    usersPage * USERS_PAGE_SIZE,
  );
  const shouldShowUsersPagination = organizationUsers.length > USERS_PAGE_SIZE;

  useEffect(() => {
    const refreshOrganizationDetails = () => {
      setOrganizationDetails(getOrganizationDetailsFromStorage());
    };

    refreshOrganizationDetails();
    window.addEventListener(
      "organization-details-updated",
      refreshOrganizationDetails,
    );

    return () =>
      window.removeEventListener(
        "organization-details-updated",
        refreshOrganizationDetails,
      );
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setUsersPage((currentPage) => Math.min(currentPage, totalUserPages));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [totalUserPages]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar
            searchPlaceholder="Search settings..."
            navItems={settingsTopNavItems}
            activeNavItem={activeSettingsTab}
            onNavItemClick={setActiveSettingsTab}
            showUpgrade={false}
          />

          <div className="flex-1 space-y-5 p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm min-[786px]:hidden">
              {settingsTopNavItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveSettingsTab(item)}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                    activeSettingsTab === item
                      ? "bg-cyan-600 text-white shadow-sm shadow-cyan-600/20"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {activeSettingsTab === "Team" ? (
              <>
                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                        Access Control
                      </p>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Team &amp; Access
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Manage organizational hierarchy and member privileges.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <article className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                        User Utilization
                      </p>
                      <p className="mt-2 text-3xl font-extrabold text-slate-800">
                        {activeUsers}{" "}
                        <span className="text-xl font-semibold text-slate-500">
                          / {totalUsers}
                        </span>
                      </p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <span
                          className="block h-full rounded-full bg-emerald-500"
                          style={{ width: `${activeUserPercent}%` }}
                        />
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        {activeUserPercent}% of fetched organization users are
                        active.
                      </p>
                    </article>

                    <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <p className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
                        {totalUsers}
                      </p>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500 sm:text-[11px]">
                        Total Users
                      </p>
                    </article>

                    <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <p className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
                        {inactiveUsers}
                      </p>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500 sm:text-[11px]">
                        Inactive Users
                      </p>
                    </article>

                    <article className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <p className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
                        {activeUsers}
                      </p>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500 sm:text-[11px]">
                        Active Users
                      </p>
                    </article>
                  </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">
                      Showing {organizationUsers.length} team member
                      {organizationUsers.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="space-y-3 bg-slate-50/60 p-3 min-[786px]:hidden">
                    {paginatedOrganizationUsers.map((user) => {
                      const displayName = getUserDisplayName(user);
                      const isActive = user?.userStatus === true;

                      return (
                        <article
                          key={
                            user.userIdentifier || user.userEmail || displayName
                          }
                          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                              {initials(displayName)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="break-words text-sm font-bold text-slate-900">
                                    {displayName}
                                  </p>
                                  <p className="mt-1 break-all text-xs font-medium text-slate-500">
                                    {user.userEmail || "N/A"}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                                >
                                  <span
                                    className={`size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                                  />
                                  {isActive ? "Active" : "Inactive"}
                                </span>
                              </div>

                              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-3 text-xs">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                                    User Name
                                  </p>
                                  <p className="mt-1 font-semibold text-cyan-700">
                                    {user.userName || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                                    Phone
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-700">
                                    {user.userPhone || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                                    User Identifier
                                  </p>
                                  <p className="mt-1 break-all font-semibold text-slate-700">
                                    {user.userIdentifier || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}

                    {organizationUsers.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                        No users found in the fetched organization details.
                      </div>
                    ) : null}
                  </div>

                  <div className="hidden overflow-x-auto min-[786px]:block">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                            Member Identity
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                            User Name
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                            Account Status
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                            Phone
                          </th>
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                            User Identifier
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {paginatedOrganizationUsers.map((user) => {
                          const displayName = getUserDisplayName(user);
                          const isActive = user?.userStatus === true;

                          return (
                            <tr
                              key={
                                user.userIdentifier ||
                                user.userEmail ||
                                displayName
                              }
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                                    {initials(displayName)}
                                  </span>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                      {displayName}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {user.userEmail || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex rounded bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-700">
                                  {user.userName || "N/A"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                <span
                                  className={`inline-flex items-center gap-1.5 ${isActive ? "text-emerald-600" : "text-slate-400"}`}
                                >
                                  <span
                                    className={`size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                                  />
                                  {isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                                {user.userPhone || "N/A"}
                              </td>
                              <td className="break-all px-4 py-3 text-sm text-slate-500">
                                {user.userIdentifier || "N/A"}
                              </td>
                            </tr>
                          );
                        })}
                        {organizationUsers.length === 0 ? (
                          <tr>
                            <td
                              className="px-4 py-6 text-center text-sm text-slate-500"
                              colSpan={5}
                            >
                              No users found in the fetched organization
                              details.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>

                  {shouldShowUsersPagination ? (
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          setUsersPage((page) => Math.max(1, page - 1))
                        }
                        disabled={usersPage === 1}
                        className="cursor-pointer text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        &lt; Previous
                      </button>
                      <div className="flex items-center gap-2">
                        {Array.from(
                          { length: totalUserPages },
                          (_, index) => index + 1,
                        ).map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setUsersPage(page)}
                            className={`size-7 rounded text-xs font-semibold ${
                              usersPage === page
                                ? "bg-cyan-600 text-white"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setUsersPage((page) =>
                            Math.min(totalUserPages, page + 1),
                          )
                        }
                        disabled={usersPage === totalUserPages}
                        className="cursor-pointer text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next &gt;
                      </button>
                    </div>
                  ) : null}
                </section>
              </>
            ) : null}

            {activeSettingsTab === "Organization" ? (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <header>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                    Enterprise Profile
                  </p>
                  <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                    Organization Profile
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage your enterprise identity, logic rules, and secure
                    access.
                  </p>
                </header>

                <div className="mt-5">
                  <article className="w-full rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-semibold text-slate-800">
                          Company Identity
                        </h4>
                        <p className="text-sm text-slate-500">
                          Fetched organization details from your connected CRM
                          workspace.
                        </p>
                      </div>
                      <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700">
                        {organizationDetails.organizationStatus ||
                          "Unavailable"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                          Organization Name
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {organizationDetails.organizationName || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                          Primary Email
                        </p>
                        <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                          {organizationDetails.organizationPrimaryEmail ||
                            "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                          Organization Status
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {organizationDetails.organizationStatus || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                          Organization ID
                        </p>
                        <p className="mt-2 break-all text-sm font-semibold text-slate-800">
                          {organizationDetails.organizationID || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                          Organization Source
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {organizationDetails.organizationSource || "N/A"}
                        </p>
                      </div>
                    </div>
                  </article>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <article className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
                          <path d="M8 6h8M8 10h8" />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800">
                          Documentation
                        </h4>
                        <p className="text-xs font-medium text-slate-500">
                          Deep dive into our API endpoints and SDKs
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://www.zoho.com/crm/developer/docs/api/v8/insert-records.html"
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-sm font-bold text-cyan-700 transition hover:text-cyan-900"
                    >
                      View Docs
                    </a>
                  </article>

                  <article className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M12 3a7 7 0 0 0-7 7v3a3 3 0 0 0 3 3h1v-6H6" />
                          <path d="M12 3a7 7 0 0 1 7 7v3a3 3 0 0 1-3 3h-1v-6h3" />
                          <path d="M9 19h2a4 4 0 0 0 4-4" />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800">
                          Priority Support
                        </h4>
                        <p className="text-xs font-medium text-slate-500">
                          Contact your dedicated account manager
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-500">
                      Priority
                    </span>
                  </article>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
