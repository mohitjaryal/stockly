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

function RiskReport({ report }: { report: CurrencyRiskReport }) {
  const score = report.diversification_score;

  return (
    <section className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{report.currency} Portfolio</p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            {formatMoney(report.total_current_value, report.currency)}
          </h2>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-400">
          {report.holdings_count} holdings
        </span>
      </div>

      <div className="mt-6 rounded-xl bg-[#0B0F17] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-400">Diversification score</p>
            <p className="mt-1 text-3xl font-bold text-white">{score}/100</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            Concentration indicator
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
      </div>

      {report.warnings.length > 0 && (
        <div className="mt-5 space-y-2">
          {report.warnings.map((warning, index) => (
            <div
              key={index}
              className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-300"
            >
              ⚠ {warning}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <h3 className="mb-4 font-semibold text-white">Stock allocation</h3>
        {report.allocations.map((item) => (
          <div key={item.symbol} className="mb-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{item.symbol}</p>
                <p className="text-xs text-slate-500">{item.company_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">
                  {item.allocation_percentage.toFixed(2)}%
                </p>
                <p className="text-xs text-slate-500">
                  {formatMoney(item.current_value, report.currency)}
                </p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{
                  width: `${Math.min(100, Math.max(0, item.allocation_percentage))}%`,
                }}
              />
            </div>
            <p className="mt-1 text-right text-[11px] text-slate-500">
              {item.risk_level} concentration
            </p>
          </div>
        ))}
      </div>
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
      .catch((err) => setError(err.message || "Unable to load risk report"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Portfolio intelligence
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">Risk Monitor</h1>
        <p className="mt-2 text-sm text-slate-400">
          Understand portfolio concentration and stock allocation.
        </p>
      </div>

      {loading && <p className="text-slate-400">Analyzing your portfolio...</p>}

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {data && (
        <>
          {data.currency_reports.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#111827] p-8 text-center">
              <p className="text-lg font-semibold text-white">No portfolio data yet</p>
              <p className="mt-2 text-sm text-slate-400">
                Add investments to your portfolio to see your risk analysis.
              </p>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            {data.currency_reports.map((report) => (
              <RiskReport key={report.currency} report={report} />
            ))}
          </div>

          {data.unpriced_holdings_count > 0 && (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
              <p className="font-medium text-amber-300">
                {data.unpriced_holdings_count} holdings could not be priced
              </p>
              <p className="mt-1 text-sm text-slate-400">
                These holdings are excluded from the allocation calculation.
              </p>
            </div>
          )}

          <p className="text-xs leading-5 text-slate-500">{data.disclaimer}</p>
        </>
      )}
    </div>
  );
}
