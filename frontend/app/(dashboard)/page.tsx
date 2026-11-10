
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
      value: isLoadingStats
        ? "..."
        : watchlistCount?.toString() ?? "—",
      detail: "Tracked stocks",
    },
    {
      label: "Price alerts",
      value: isLoadingStats
        ? "..."
        : activeAlertsCount?.toString() ?? "—",
      detail: "Active alerts",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Workspace / Overview
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Market overview
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Monitor your stocks and market activity in one place.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Latest available market data
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {marketStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-white/8 bg-[#111722] p-5"
          >
            <p className="text-xs text-slate-400">{stat.label}</p>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-white">
              {stat.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </section>

      <StockSearch onSelect={setSelectedStock} />

      <StockPriceCards symbol={selectedStock.symbol} />

      <section>
        <div className="min-h-90 rounded-lg border border-white/8 bg-[#111722] p-5">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Stock performance
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Historical price chart · {selectedStock.symbol}
            </p>
          </div>

          <div className="mt-5">
            <StockHistoryChart symbol={selectedStock.symbol} />
          </div>
        </div>
      </section>
    </div>
  );
}
