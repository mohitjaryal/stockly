
"use client";

import { useEffect, useState } from "react";
import StockPriceCards from "@/features/stocks/components/StockPriceCards";
import StockHistoryChart from "@/features/stocks/components/StockHistoryChart";
import StockSearch from "@/features/stocks/components/StockSearch";
import { getWatchlist } from "@/features/watchlist/services/watchlistService";
import { getAlerts } from "@/features/alerts/services/alertService";
import type { Stock } from "@/features/stocks/services/stockService";

export default function DashboardPage() {
  const [selectedStock, setSelectedStock] = useState<Stock>({
    id: 4,
    symbol: "GOOGL",
    company_name: "Alphabet Inc.",
    exchange: "NASDAQ",
  });

  const [watchlistCount, setWatchlistCount] = useState<number | null>(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState<number | null>(
    null
  );
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardStats() {
      const [watchlistResult, alertsResult] = await Promise.allSettled([
        getWatchlist(),
        getAlerts(),
      ]);

      if (!isMounted) return;

      if (watchlistResult.status === "fulfilled") {
        setWatchlistCount(watchlistResult.value.length);
      }

      if (alertsResult.status === "fulfilled") {
        const activeAlerts = alertsResult.value.filter(
          (alert) => alert.status === "active"
        );

        setActiveAlertsCount(activeAlerts.length);
      }

      setIsLoadingStats(false);
    }

    loadDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const marketStats = [
    {
      label: "Market status",
      value: "Awaiting data",
      detail: "Latest available market data",
    },
    {
      label: "Watchlist",
      value: isLoadingStats ? "..." : watchlistCount?.toString() ?? "—",
      detail: "Tracked stocks",
    },
    {
      label: "Price alerts",
      value: isLoadingStats ? "..." : activeAlertsCount?.toString() ?? "—",
      detail: "Active alerts",
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <section className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.16em]">
            Workspace / Overview
          </p>

          <h1 className="mt-2 text-xl font-semibold tracking-tight text-white sm:mt-3 sm:text-2xl">
            Market overview
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Monitor your stocks and market activity in one place.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Latest available market data
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {marketStats.map((stat) => (
          <div
            key={stat.label}
            className="min-w-0 rounded-lg border border-white/8 bg-[#111722] p-4 sm:p-5"
          >
            <p className="text-xs text-slate-400">{stat.label}</p>

            <p className="mt-3 wrap-break-word text-2xl font-semibold tracking-tight text-white sm:mt-4">
              {stat.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="w-full min-w-0">
        <StockSearch onSelect={setSelectedStock} />
      </section>

      <section className="w-full min-w-0">
        <StockPriceCards symbol={selectedStock.symbol} />
      </section>

      <section className="w-full min-w-0">
        <div className="min-h-70 w-full min-w-0 overflow-hidden rounded-lg border border-white/8 bg-[#111722] p-3 sm:min-h-90 sm:p-5">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">
              Stock performance
            </h2>

            <p className="mt-1 wrap-break-word text-xs text-slate-500">
              Historical price chart · {selectedStock.symbol}
            </p>
          </div>

          <div className="mt-4 w-full min-w-0 sm:mt-5">
            <StockHistoryChart symbol={selectedStock.symbol} />
          </div>
        </div>
      </section>
    </div>
  );
}
