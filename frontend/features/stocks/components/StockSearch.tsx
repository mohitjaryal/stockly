
"use client";

import { useEffect, useMemo, useState } from "react";
import { getStocks, type Stock } from "../services/stockService";

interface StockSearchProps {
  onSelect: (stock: Stock) => void;
}

export default function StockSearch({ onSelect }: StockSearchProps) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [query, setQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadStocks() {
      try {
        const data = await getStocks();
        setStocks(data);
      } catch {
        setError("Unable to load stocks. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadStocks();
  }, []);

  const filteredStocks = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return [];

    return stocks
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(search) ||
          stock.company_name.toLowerCase().includes(search) ||
          stock.exchange.toLowerCase().includes(search)
      )
      .slice(0, 8);
  }, [stocks, query]);

  function selectStock(stock: Stock) {
    setSelectedStock(stock);
    setQuery(stock.symbol);
    setIsOpen(false);
    onSelect(stock);
  }

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#111722] p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Search stocks</h2>
        <p className="mt-1 text-xs text-slate-500">
          Search by company name or stock symbol
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedStock(null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Search AAPL, Apple, Google..."
          className="w-full rounded-md border border-white/10 bg-[#151d2a] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
        />

        {isOpen && query.trim() !== "" && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-md border border-white/10 bg-[#151d2a] shadow-xl">
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <button
                  key={stock.id}
                  type="button"
                  onMouseDown={() => selectStock(stock)}
                  className="flex w-full items-center justify-between border-b border-white/[0.06] px-4 py-3 text-left last:border-0 hover:bg-white/[0.05]"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {stock.symbol}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {stock.company_name}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {stock.exchange}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-4 py-4 text-xs text-slate-400">
                No matching stocks found.
              </p>
            )}
          </div>
        )}
      </div>

      {loading && (
        <p className="mt-3 text-xs text-slate-500">Loading stocks...</p>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-400">{error}</p>
      )}

      {selectedStock && (
        <div className="mt-4 rounded-md border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
          <p className="text-xs text-emerald-400">Selected stock</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {selectedStock.symbol}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {selectedStock.company_name}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {selectedStock.exchange}
          </p>
        </div>
      )}
    </section>
  );
}
