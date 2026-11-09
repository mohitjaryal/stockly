
"use client";

import { useState } from "react";
import StockPriceCards from "@/features/stocks/components/StockPriceCards";
import StockHistoryChart from "@/features/stocks/components/StockHistoryChart";
import StockSearch from "@/features/stocks/components/StockSearch";
import WatchlistPanel from "@/features/watchlist/components/WatchlistPanel";
import AlertPanel from "@/features/alerts/components/AlertPanel";
import type { Stock } from "@/features/stocks/services/stockService";

const marketStats = [
  {
    label: "Market status",
    value: "Awaiting data",
    detail: "Latest available market data",
  },
  {
    label: "Watchlist",
    value: "—",
    detail: "Tracked stocks",
  },
  {
    label: "Price alerts",
    value: "—",
    detail: "Active alerts",
  },
];

export default function DashboardPage() {
  const [selectedStock, setSelectedStock] = useState<Stock>({
    id: 4,
    symbol: "GOOGL",
    company_name: "Alphabet Inc.",
    exchange: "NASDAQ",
  });

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

            <p className="mt-2 text-xs text-slate-500">
              {stat.detail}
            </p>
          </div>
        ))}
      </section>

      <StockSearch onSelect={setSelectedStock} />

      <StockPriceCards symbol={selectedStock.symbol} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
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

        <WatchlistPanel
          onSelect={(stock) =>
            setSelectedStock((current) => ({
              ...current,
              ...stock,
            }))
          }
        />
      </section>

      <AlertPanel />
    </div>
  );
}
