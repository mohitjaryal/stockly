
"use client";

import { useState } from "react";
import StockSearch from "@/features/stocks/components/StockSearch";
import StockPriceCards from "@/features/stocks/components/StockPriceCards";
import StockHistoryChart from "@/features/stocks/components/StockHistoryChart";
import type { Stock } from "@/features/stocks/services/stockService";

export default function StocksPage() {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Investments / Stocks
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Stock research
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Discover and analyse stocks across US and Indian markets.
        </p>
      </section>

      <StockSearch onSelect={setSelectedStock} />

      {selectedStock ? (
        <>
          <StockPriceCards symbol={selectedStock.symbol} />

          <section className="rounded-lg border border-white/[0.08] bg-[#111722] p-5">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-white">
                Price performance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Historical market data · {selectedStock.symbol}
              </p>
            </div>

            <StockHistoryChart symbol={selectedStock.symbol} />
          </section>
        </>
      ) : (
        <section className="rounded-lg border border-dashed border-white/10 bg-[#111722] p-10 text-center">
          <h2 className="text-sm font-medium text-white">
            Select a stock to get started
          </h2>

          <p className="mt-2 text-xs text-slate-500">
            Search for a company or symbol above to view its market data and chart.
          </p>
        </section>
      )}
    </div>
  );
}
