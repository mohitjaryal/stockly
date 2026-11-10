
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getStocks,
  searchStocks,
  addStock,
  type Stock,
  type StockSearchResult,
} from "@/features/stocks/services/stockService";

export default function Topbar() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [savedStocks, setSavedStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingSymbol, setAddingSymbol] = useState("");
  const [error, setError] = useState("");

  function handleLogout() {
    localStorage.removeItem("stockly_token");
    router.replace("/login");
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => searchRef.current?.focus(), 0);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        setResults([]);
      }
    }

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await searchStocks(query.trim());

        if (!cancelled) {
          setResults(data.slice(0, 8));
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setError(
            err instanceof Error ? err.message : "Search failed."
          );
        }
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
  }, [query, isOpen]);

  async function openStock(result: StockSearchResult) {
    const symbol = result.symbol.toUpperCase();

    setAddingSymbol(symbol);
    setError("");

    try {
      const saved = savedStocks.find(
        (stock) => stock.symbol.toUpperCase() === symbol
      );

      if (!saved) {
        try {
          const newStock = await addStock(result);
          setSavedStocks((previous) => [...previous, newStock]);
        } catch (addError) {
          // Handle a stock that may already have been saved elsewhere.
          const latestStocks = await getStocks();
          const existing = latestStocks.find(
            (stock) => stock.symbol.toUpperCase() === symbol
          );

          if (!existing) {
            throw addError;
          }

          setSavedStocks(latestStocks);
        }
      }

      setIsOpen(false);
      setQuery("");
      setResults([]);

      router.push(`/?symbol=${encodeURIComponent(symbol)}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to open this stock."
      );
    } finally {
      setAddingSymbol("");
    }
  }

  async function openSearch() {
    setIsOpen(true);

    try {
      const data = await getStocks();
      setSavedStocks(data);
    } catch {
      // Search can still work even if saved stocks cannot be loaded.
    }

    setTimeout(() => searchRef.current?.focus(), 0);
  }

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-white/8 bg-[#0B0F17]/95 px-8 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-white">Market Overview</p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Your market at a glance
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={openSearch}
            className="flex items-center gap-2 rounded-md border border-white/9 px-3 py-2 transition hover:border-emerald-400/40 hover:bg-white/[0.03]"
          >
            <span className="text-slate-500">⌕</span>
            <span className="text-xs text-slate-400">
              Search stocks...
            </span>
            <span className="ml-8 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500">
              ⌘ K
            </span>
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-[380px] overflow-hidden rounded-lg border border-white/10 bg-[#111722] shadow-2xl">
              <div className="border-b border-white/[0.08] p-3">
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search company or symbol..."
                  className="w-full rounded-md border border-white/10 bg-[#151d2a] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
                />
                <p className="mt-2 text-[10px] text-slate-500">
                  Search US and Indian stocks
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loading && (
                  <p className="p-4 text-xs text-slate-400">
                    Searching stocks...
                  </p>
                )}

                {error && (
                  <p className="p-4 text-xs text-red-400">{error}</p>
                )}

                {!loading &&
                  !error &&
                  query.trim() &&
                  results.length === 0 && (
                    <p className="p-4 text-xs text-slate-400">
                      No matching stocks found.
                    </p>
                  )}

                {results.map((result) => {
                  const saved = savedStocks.some(
                    (stock) =>
                      stock.symbol.toUpperCase() ===
                      result.symbol.toUpperCase()
                  );

                  return (
                    <button
                      key={result.symbol}
                      type="button"
                      disabled={!!addingSymbol}
                      onClick={() => openStock(result)}
                      className="flex w-full items-center justify-between gap-3 border-b border-white/[0.05] px-4 py-3 text-left transition hover:bg-white/[0.05] disabled:opacity-50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">
                          {result.symbol}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {result.description}
                        </p>
                      </div>

                      <span className="shrink-0 text-[10px] font-medium text-emerald-400">
                        {addingSymbol === result.symbol.toUpperCase()
                          ? "Adding..."
                          : saved
                            ? "Open"
                            : "Add & open"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between border-t border-white/[0.08] px-4 py-3">
                <span className="text-[10px] text-slate-500">
                  Press ESC to close
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                    setResults([]);
                  }}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-medium text-slate-300">
          M
        </div>

        <button
          onClick={handleLogout}
          className="rounded-md border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
