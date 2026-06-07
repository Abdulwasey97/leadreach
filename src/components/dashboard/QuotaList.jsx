import { useEffect, useMemo, useState } from "react";
import { quotas } from "../../data/dashboardData";

function buildUsageQuotas(usageDetails) {
  if (!usageDetails) {
    return quotas;
  }

  return [
    {
      id: "google",
      platform: "Google Search",
      value: usageDetails.GoogleSearchLimitUtilized || 0,
      max: usageDetails.TotalGoogleSearchLimit || 0,
      color: "bg-emerald-500",
    },
    {
      id: "linkedin",
      platform: "LinkedIn Search",
      value: usageDetails.LinkedinSearchLimitUtilized || 0,
      max: usageDetails.TotalLinkedinSearchLimit || 0,
      color: "bg-sky-500",
    },
    {
      id: "facebook",
      platform: "Facebook Search",
      value: usageDetails.FbSearchLimitUtilized || 0,
      max: usageDetails.TotalFbSearchLimit || 0,
      color: "bg-indigo-500",
    },
    {
      id: "email",
      platform: "Email Enrichment",
      value: usageDetails.EmailEnrichmentUtilized || 0,
      max: usageDetails.TotalEmailEnrichment || 0,
      color: "bg-amber-500",
    },
  ];
}

function QuotaList({ usageDetails }) {
  const [isVisible, setIsVisible] = useState(false);
  const quotaItems = useMemo(
    () => buildUsageQuotas(usageDetails),
    [usageDetails],
  );
  const totalUsed = quotaItems.reduce((sum, quota) => sum + quota.value, 0);
  const totalLimit = quotaItems.reduce((sum, quota) => sum + quota.max, 0);
  const totalPercentage =
    totalLimit > 0
      ? Math.min(100, Math.round((totalUsed / totalLimit) * 100))
      : 0;

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section
      className={`flex pb-10 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Quota health
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Platform Quotas
          </h3>
        </div>
        <span className="rounded-lg bg-cyan-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
          Live
        </span>
      </div>

      <div className="mb-4 rounded-lg border border-cyan-100 bg-cyan-50 p-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
              Overall usage
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {totalPercentage}%
            </p>
          </div>
          <p className="text-sm font-medium text-slate-600">
            {totalUsed.toLocaleString()} / {totalLimit.toLocaleString()}
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <span
            className="block h-full rounded-full bg-cyan-600 transition-[width] duration-700 ease-out"
            style={{ width: isVisible ? `${totalPercentage}%` : "0%" }}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {quotaItems.map((quota) => {
          const percentage =
            quota.max > 0
              ? Math.min(100, Math.round((quota.value / quota.max) * 100))
              : 0;

          return (
            <li
              key={quota.id}
              className={`rounded-lg border border-slate-100 bg-slate-50/70 p-3 transition-all duration-500 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-3 opacity-0"
              }`}
              style={{
                transitionDelay: isVisible
                  ? `${80 + quotaItems.indexOf(quota) * 60}ms`
                  : "0ms",
              }}
            >
              <div className="mb-2 flex justify-between gap-2 text-sm text-slate-700">
                <span className="font-semibold">{quota.platform}</span>
                <span className="font-medium text-slate-500">
                  {quota.value.toLocaleString()} / {quota.max.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <span
                    className="block h-full rounded-full bg-cyan-500 transition-[width] duration-700 ease-out"
                    style={{
                      width: isVisible ? `${percentage}%` : "0%",
                      transitionDelay: isVisible
                        ? `${160 + quotaItems.indexOf(quota) * 80}ms`
                        : "0ms",
                    }}
                  />
                </div>
                <span className="w-9 text-right text-xs font-bold text-cyan-700">
                  {percentage}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default QuotaList;
