
"use client";

import { useEffect, useState } from "react";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  type WatchlistItem,
} from "@/features/watchlist/services/watchlistService";
import {
  getStockPrice,
  type StockPrice,
  type Stock,
} from "@/features/stocks/services/stockService";

interface WatchlistPanelProps {
  onSelect: (
    stock: Pick<Stock, "symbol" | "company_name" | "exchange">
  ) => void;
}

export default function WatchlistPanel({
  onSelect,
}: WatchlistPanelProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [prices, setPrices] = useState<Record<string, StockPrice>>({});
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadWatchlist() {
    try {
      setError("");

      const data = await getWatchlist();
      setItems(data);

      const results = await Promise.allSettled(
        data.map(async (item) => ({
          symbol: item.symbol,
          price: await getStockPrice(item.symbol),
        }))
      );

      const nextPrices: Record<string, StockPrice> = {};

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          nextPrices[result.value.symbol] = result.value.price;
        }
      });

      setPrices(nextPrices);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load watchlist"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWatchlist();
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanSymbol = symbol.trim().toUpperCase();
    if (!cleanSymbol) return;

    try {
      setAdding(true);
      setError("");
      setMessage("");

      await addToWatchlist(cleanSymbol);
      setSymbol("");
      setMessage(`${cleanSymbol} added to watchlist`);

      await loadWatchlist();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add stock"
      );
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(stockSymbol: string) {
    try {
      setError("");
      setMessage("");

      await removeFromWatchlist(stockSymbol);

      setItems((current) =>
        current.filter((item) => item.symbol !== stockSymbol)
      );

      setPrices((current) => {
        const updated = { ...current };
        delete updated[stockSymbol];
        return updated;
      });

      setMessage(`${stockSymbol} removed from watchlist`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove stock"
      );
    }
  }

  return (
    <section className="rounded-lg border border-white/8 bg-[#111722] p-5">
      <div>
        <h2 className="text-sm font-semibold text-white">Watchlist</h2>
        <p className="mt-1 text-xs text-slate-500">
          Your tracked stocks · Latest available prices
        </p>
      </div>

      <form onSubmit={handleAdd} className="mt-5 flex gap-2">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Add symbol (e.g. AAPL)"
          maxLength={20}
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-[#090d18] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
        />

        <button
          type="submit"
          disabled={adding || !symbol.trim()}
          className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-[#07110d] hover:bg-emerald-400 disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}

      {message && (
        <p className="mt-3 text-xs text-emerald-400">{message}</p>
      )}

      <div className="mt-5 border-t border-white/8">
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Loading watchlist...
          </p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No stocks in your watchlist yet.
          </p>
        ) : (
          <div className="divide-y divide-white/6">
            {items.map((item) => {
              const stockPrice = prices[item.symbol];
              const currentPrice = Number(stockPrice?.price);
              const openPrice = Number(stockPrice?.open_price);

              const change = currentPrice - openPrice;
              const changePercent =
                openPrice > 0 ? (change / openPrice) * 100 : 0;

              const hasPrice =
                !!stockPrice && Number.isFinite(currentPrice);

              const isPositive = change >= 0;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onSelect({
                        symbol: item.symbol,
                        company_name: item.company_name,
                        exchange: item.exchange || "",
                      })
                    }
                    className="min-w-0 text-left"
                  >
                    <p className="text-sm font-semibold text-white transition hover:text-emerald-400">
                      {item.symbol}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {item.company_name} · {item.exchange || "—"}
                    </p>
                  </button>

                  <div className="shrink-0 text-right">
                    {hasPrice ? (
                      <>
                        <p className="text-sm font-semibold tabular-nums text-white">
                          ${currentPrice.toFixed(2)}
                        </p>
                        <p
                          className={`mt-1 text-xs tabular-nums ${
                            isPositive
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}$
                          {change.toFixed(2)} (
                          {isPositive ? "+" : ""}
                          {changePercent.toFixed(2)}%)
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Price unavailable
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(item.symbol)}
                      className="mt-2 text-xs text-slate-500 transition hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
