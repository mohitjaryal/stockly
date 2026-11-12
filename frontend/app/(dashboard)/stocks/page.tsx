
"use client";

import { useEffect, useState } from "react";
import StockPriceCards from "@/features/stocks/components/StockPriceCards";
import StockHistoryChart from "@/features/stocks/components/StockHistoryChart";
import StockDirectory from "@/features/stocks/components/StockDirectory";
import {
  getStocks,
  type Stock,
} from "@/features/stocks/services/stockService";

export default function StocksPage() {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [resolvingStock, setResolvingStock] = useState(false);
  const [selectionError, setSelectionError] = useState("");

  useEffect(() => {
    const symbol = new URLSearchParams(window.location.search).get("symbol");

    if (!symbol) return;

    let cancelled = false;

    async function resolveStock() {
      try {
        setResolvingStock(true);
        setSelectionError("");

        const stocks = await getStocks();

        const match = stocks.find(
          (stock) =>
            stock.symbol.toUpperCase() === symbol!.trim().toUpperCase()
        );

        if (!match) {
          throw new Error(
            `Stock ${symbol} was not found in the research database.`
          );
        }

        if (!cancelled) {
          setSelectedStock(match);
        }
      } catch (err) {
        if (!cancelled) {
          setSelectionError(
            err instanceof Error
              ? err.message
              : "Unable to open this stock."
          );
        }
      } finally {
        if (!cancelled) {
          setResolvingStock(false);
        }
      }
    }

    void resolveStock();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSelectStock(stock: Stock) {
    setSelectedStock(stock);
    setSelectionError("");

    window.history.replaceState(
      null,
      "",
      `/stocks?symbol=${encodeURIComponent(stock.symbol)}`
    );
  }

  function clearSelection() {
    setSelectedStock(null);
    setSelectionError("");

    window.history.replaceState(null, "", "/stocks");
  }

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

      {selectionError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{selectionError}</p>
        </div>
      )}

      {resolvingStock ? (
        <section className="rounded-xl border border-white/10 bg-[#111722] px-6 py-7 text-center">
          <p className="text-sm text-slate-400">
            Loading selected stock...
          </p>
        </section>
      ) : selectedStock ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-400">
                Selected stock
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                {selectedStock.company_name}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {selectedStock.symbol} · {selectedStock.exchange}
              </p>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Clear selection
            </button>
          </div>

          <StockPriceCards symbol={selectedStock.symbol} />

          <section className="rounded-xl border border-white/[0.08] bg-[#111722] p-5">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white">
                Price performance
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Historical market data · {selectedStock.symbol}
              </p>
            </div>

            <StockHistoryChart symbol={selectedStock.symbol} />
          </section>
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-white/10 bg-[#111722] px-6 py-7 text-center">
          <h2 className="text-sm font-medium text-white">
            Select a stock to get started
          </h2>

          <p className="mt-2 text-xs text-slate-500">
            Choose any company from the directory below to open its research.
          </p>
        </section>
      )}

      <StockDirectory onSelect={handleSelectStock} />
    </div>
  );
}
