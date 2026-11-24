
"use client";

import { useEffect, useState } from "react";
import {
  getPortfolioRisk,
  type PortfolioRisk,
  type CurrencyRiskReport,
} from "@/features/portfolio/services/portfolioInsightsService";

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function getScoreLabel(score: number) {
  if (score >= 70) return "Well diversified";
  if (score >= 40) return "Moderately diversified";
  return "Highly concentrated";
}

function getRiskStyle(level: string) {
  const normalized = level.toLowerCase();

  if (normalized === "high") {
    return {
      text: "text-red-400",
      background: "bg-red-400/10",
      bar: "bg-red-400",
      border: "border-red-400/20",
    };
  }

  if (normalized === "moderate") {
    return {
      text: "text-amber-400",
      background: "bg-amber-400/10",
      bar: "bg-amber-400",
      border: "border-amber-400/20",
    };
  }

  return {
    text: "text-emerald-400",
    background: "bg-emerald-400/10",
    bar: "bg-emerald-400",
    border: "border-emerald-400/20",
  };
}

function RiskReport({ report }: { report: CurrencyRiskReport }) {
  const score = Math.min(100, Math.max(0, report.diversification_score));
  const scoreColor =
    score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#f87171";

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-xl shadow-black/10">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-400">
              {report.currency} Portfolio
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              {formatMoney(report.total_current_value, report.currency)}
            </h2>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            {report.holdings_count} Holdings
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[170px_1fr] sm:items-center sm:p-6">
        <div className="flex justify-center">
          <div
            className="relative flex h-36 w-36 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${scoreColor} ${score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
            }}
          >
            <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-[#111827]">
              <span className="text-3xl font-bold text-white">{score}</span>
              <span className="text-xs text-slate-500">out of 100</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-slate-400">Diversification Score</p>
          <h3 className="mt-1 text-xl font-bold text-white">
            {getScoreLabel(score)}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            This score indicates how concentrated your portfolio is across
            its holdings. A higher score indicates a more evenly distributed
            allocation.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: scoreColor }}
            />
            <span className="text-xs text-slate-400">
              Concentration indicator
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Asset Concentration</h3>
            <p className="mt-1 text-xs text-slate-500">
              Portfolio allocation by stock
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {report.holdings_count} assets
          </span>
        </div>

        {report.allocations.length === 0 ? (
          <p className="text-sm text-slate-500">No priced holdings available.</p>
        ) : (
          <div className="space-y-5">
            {report.allocations.map((item) => {
              const style = getRiskStyle(item.risk_level);

              return (
                <div key={item.symbol}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {item.symbol}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {item.company_name}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-white">
                        {item.allocation_percentage.toFixed(2)}%
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatMoney(item.current_value, report.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${style.bar} transition-all duration-700`}
                      style={{
                        width: `${Math.min(100, Math.max(0, item.allocation_percentage))}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-end">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${style.background} ${style.text}`}
                    >
                      {item.risk_level} concentration
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {report.warnings.length > 0 && (
        <div className="border-t border-white/10 bg-amber-400/[0.03] p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
              !
            </span>
            <div>
              <h3 className="font-semibold text-white">Risk Alerts</h3>
              <p className="text-xs text-slate-500">
                Areas that may need your attention
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {report.warnings.map((warning, index) => (
              <div
                key={index}
                className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-3 text-sm leading-5 text-amber-200"
              >
                <span className="mr-2 text-amber-400">⚠</span>
                {warning}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function PortfolioRiskPage() {
  const [data, setData] = useState<PortfolioRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPortfolioRisk()
      .then(setData)
      .catch((err) =>
        setError(err.message || "Unable to load risk report")
      )
      .finally(() => setLoading(false));
  }, []);

  const totalHoldings =
    data?.currency_reports.reduce(
      (total, report) => total + report.holdings_count,
      0
    ) ?? 0;

  const totalWarnings =
    data?.currency_reports.reduce(
      (total, report) => total + report.warnings.length,
      0
    ) ?? 0;

  return (
    <div className="min-h-full space-y-7 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#172b35] via-[#111827] to-[#111827] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            PORTFOLIO INTELLIGENCE
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Risk Monitor
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Get a clearer picture of your portfolio concentration,
            diversification and potential areas of risk.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-slate-400">Total Holdings</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {loading ? "—" : totalHoldings}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs text-slate-400">Risk Alerts</p>
              <p className="mt-2 text-2xl font-bold text-amber-400">
                {loading ? "—" : totalWarnings}
              </p>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
          <p className="mt-4 text-sm text-slate-400">
            Analyzing your portfolio...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
          <p className="font-semibold text-red-300">
            Unable to load risk analysis
          </p>
          <p className="mt-2 text-sm text-red-200/70">{error}</p>
        </div>
      )}

      {data && (
        <>
          {data.currency_reports.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-[#111827] px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl">
                ◈
              </div>
              <h2 className="mt-5 text-xl font-bold text-white">
                No portfolio data yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                Add investments to your portfolio to unlock your
                diversification and concentration analysis.
              </p>
            </div>
          )}

          {data.currency_reports.length > 0 && (
            <>
              <div>
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-white">
                    Portfolio Risk Analysis
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Separate analysis for each portfolio currency
                  </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  {data.currency_reports.map((report) => (
                    <RiskReport
                      key={report.currency}
                      report={report}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {data.unpriced_holdings_count > 0 && (
            <div className="flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5">
              <span className="text-xl text-amber-400">⚠</span>
              <div>
                <p className="font-semibold text-amber-300">
                  {data.unpriced_holdings_count} holdings could not be priced
                </p>
                <p className="mt-1 text-sm leading-5 text-slate-400">
                  These holdings are excluded from the allocation calculation.
                  Check whether their latest price data is available.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Important note
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              {data.disclaimer} This dashboard provides informational
              concentration indicators only. It does not predict market
              movements, investment returns or future losses.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
