
"use client";

import { useEffect, useState } from "react";
import {
  getStocks,
  searchStocks,
  addStock,
  type Stock,
  type StockSearchResult,
} from "../services/stockService";

interface StockSearchProps {
  onSelect: (stock: Stock) => void;
}

type MarketFilter = "ALL" | "US" | "INDIA";

export default function StockSearch({ onSelect }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState<MarketFilter>("ALL");

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [results, setResults] = useState<StockSearchResult[]>([]);

  const [loading, setLoading] = useState(false);
  const [addingSymbol, setAddingSymbol] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadStocks() {
      try {
        const data = await getStocks();
        setStocks(data);
      } catch {
        setError("Unable to load saved stocks.");
      }
    }

    loadStocks();
  }, []);

  useEffect(() => {
    const search = query.trim();

    if (!search) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const data = await searchStocks(
          search,
          market === "US" ? "US" : undefined
        );

        if (cancelled) return;

        let filtered = data;

        if (market === "INDIA") {
          filtered = data.filter(
            (stock) =>
              stock.symbol.toUpperCase().endsWith(".NS") ||
              stock.symbol.toUpperCase().endsWith(".BO")
          );
        }

        setResults(filtered.slice(0, 10));
      } catch (err) {
        if (cancelled) return;

        setResults([]);
        setError(
          err instanceof Error
            ? err.message
            : "Stock search failed. Please try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, market]);

  function findSavedStock(symbol: string) {
    return stocks.find(
      (stock) => stock.symbol.toUpperCase() === symbol.toUpperCase()
    );
  }

  function selectSavedStock(stock: Stock) {
    onSelect(stock);
    setQuery(stock.symbol);
    setResults([]);
    setSuccess(`${stock.symbol} selected.`);
    setError("");
  }

  async function handleAddStock(result: StockSearchResult) {
    setAddingSymbol(result.symbol);
    setError("");
    setSuccess("");

    try {
      const existing = findSavedStock(result.symbol);

      if (existing) {
        selectSavedStock(existing);
        return;
      }

      const stock = await addStock(result);

      setStocks((previous) => [...previous, stock]);

      onSelect(stock);
      setQuery(stock.symbol);
      setResults([]);

      setSuccess(`${stock.symbol} added to Stockly successfully.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to add this stock."
      );
    } finally {
      setAddingSymbol("");
    }
  }

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#111722] p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">
          Search stocks
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Discover stocks from US and Indian markets.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["ALL", "US", "INDIA"] as MarketFilter[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMarket(item)}
            className={`rounded-md px-4 py-2 text-xs font-medium transition ${
              market === item
                ? "bg-emerald-400/15 text-emerald-400"
                : "border border-white/10 text-slate-400 hover:bg-white/5"
            }`}
          >
            {item === "ALL"
              ? "All markets"
              : item === "US"
                ? "US market"
                : "Indian market"}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search AAPL, Apple, RELIANCE..."
        className="w-full rounded-md border border-white/10 bg-[#151d2a] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
      />

      {loading && (
        <p className="mt-3 text-xs text-slate-500">
          Searching stocks...
        </p>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-3 text-xs text-emerald-400">
          {success}
        </p>
      )}

      {!loading && query.trim() && results.length === 0 && !error && (
        <p className="mt-4 text-xs text-slate-500">
          No matching stocks found.
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-md border border-white/10">
          {results.map((result) => {
            const savedStock = findSavedStock(result.symbol);

            return (
              <div
                key={result.symbol}
                className="flex flex-col gap-3 border-b border-white/[0.06] p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    {result.symbol}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {result.description}
                  </p>

                  {result.type && (
                    <p className="mt-1 text-xs text-slate-500">
                      {result.type}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={addingSymbol === result.symbol}
                  onClick={() => handleAddStock(result)}
                  className="shrink-0 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addingSymbol === result.symbol
                    ? "Adding..."
                    : savedStock
                      ? "Select"
                      : "Add to Stockly"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="text-xs text-slate-500">
          Saved stocks: {stocks.length}
        </p>
      </div>
    </section>
  );
}
