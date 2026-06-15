import { useEffect, useState } from "react";
import LeadAccumulationCard from "../components/dashboard/LeadAccumulationCard";
import StatsGrid from "../components/dashboard/StatsGrid";
import RightRail from "../components/layout/RightRail";

import Sidebar from "../components/layout/Sidebar";

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getOrgWalletFromStorage() {
  const orgPayload = safeParseJson(
    localStorage.getItem("organization_details_response") || "{}",
  );
  return (
    orgPayload?.OrgDetails?.Org_Wallet ||
    orgPayload?.OrganizationDetails?.Org_Wallet ||
    null
  );
}

function getOrgIdentifierFromStorage() {
  const orgPayload = safeParseJson(
    localStorage.getItem("organization_details_response") || "{}",
  );

  return (
    localStorage.getItem("organization_identifier") ||
    orgPayload?.OrganizationDetails?.orgIdentifier ||
    orgPayload?.OrgDetails?.organizationID ||
    orgPayload?.orgIdentifier ||
    "ORG-2012"
  );
}

function DashboardPage() {
  const [usageDetails, setUsageDetails] = useState(() =>
    getOrgWalletFromStorage(),
  );
  const [orgIdentifier, setOrgIdentifier] = useState(() =>
    getOrgIdentifierFromStorage(),
  );
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "https://leadreach.api-pct.com";

  useEffect(() => {
    const updateUsageFromOrgWallet = () => {
      setUsageDetails(getOrgWalletFromStorage());
      setOrgIdentifier(getOrgIdentifierFromStorage());
    };

    updateUsageFromOrgWallet();
    window.addEventListener(
      "organization-details-updated",
      updateUsageFromOrgWallet,
    );

    return () => {
      window.removeEventListener(
        "organization-details-updated",
        updateUsageFromOrgWallet,
      );
    };
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <div className="mx-auto flex h-screen max-w-[1500px] overflow-hidden bg-slate-100">
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="dashboard-scrollbar grid min-h-0 flex-1 auto-rows-max content-start gap-2 overflow-y-auto p-4 pt-3 sm:p-5 min-[786px]:gap-3 xl:h-full xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] xl:grid-rows-none xl:gap-5 xl:overflow-hidden">
            <main className="relative z-10 space-y-4 xl:min-h-0 xl:overflow-hidden">
              <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm min-[786px]:flex min-[786px]:flex-wrap min-[786px]:items-start min-[786px]:justify-between min-[786px]:gap-3 min-[786px]:border-0 min-[786px]:bg-transparent min-[786px]:p-0 min-[786px]:shadow-none">
                <div>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Executive Overview
                  </h2>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
                    Real-time performance analytics across all acquisition
                    channels.
                  </p>
                </div>
                <div className="rounded-lg border border-cyan-100 bg-white px-3 py-2 text-left shadow-sm sm:text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-cyan-700">
                    Live usage
                  </p>
                </div>
              </header>

              <div className="hidden md:block">
                <StatsGrid usageDetails={usageDetails} />
              </div>
              <div className="hidden md:block">
                <LeadAccumulationCard usageDetails={usageDetails} />
              </div>
            </main>

            <RightRail
              apiBaseUrl={apiBaseUrl}
              orgIdentifier={orgIdentifier}
              usageDetails={usageDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
