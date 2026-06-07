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

function DashboardPage() {
  const [usageDetails, setUsageDetails] = useState(() =>
    getOrgWalletFromStorage(),
  );

  useEffect(() => {
    const updateUsageFromOrgWallet = () => {
      setUsageDetails(getOrgWalletFromStorage());
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
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px] bg-slate-100">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="grid flex-1 gap-5 p-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <main className="space-y-4">
              <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                    Executive Overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Real-time performance analytics across all acquisition
                    channels.
                  </p>
                </div>
                <div className="rounded-lg border border-cyan-100 bg-white px-3 py-2 text-right shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-cyan-700">
                    Live usage
                  </p>
                </div>
              </header>

              <StatsGrid usageDetails={usageDetails} />
              <LeadAccumulationCard usageDetails={usageDetails} />
            </main>

            <RightRail usageDetails={usageDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
