
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

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
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

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setError("");
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
        closeSearch();
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

      closeSearch();
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
      // Search can still work if saved stocks cannot be loaded.
    }

    setTimeout(() => searchRef.current?.focus(), 0);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/8 bg-[#0B0F17]/95 px-3 backdrop-blur sm:h-18 sm:px-6 lg:px-8">

      {/* Left section */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-lg text-slate-300 transition hover:bg-white/5 lg:hidden"
        >
          ☰
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            Market Overview
          </p>
          <p className="mt-0.5 hidden text-[11px] text-slate-500 sm:block">
            Your market at a glance
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">

        {/* Search */}
        <div className="relative">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search stocks"
            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-slate-300 transition hover:border-emerald-400/40 hover:bg-white/3 sm:px-4"
          >
            <span className="text-lg">⌕</span>
            <span className="hidden text-xs text-slate-400 sm:inline">
              Search stocks...
            </span>
            <span className="hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500 lg:inline">
              ⌘ K
            </span>
          </button>

          {/* Search dropdown */}
          {isOpen && (
            <>
              <button
                type="button"
                aria-label="Close search"
                onClick={closeSearch}
                className="fixed inset-0 z-40 cursor-default bg-black/30"
              />

              <div className="fixed left-3 right-3 top-20 z-50 overflow-hidden rounded-xl border border-white/10 bg-[#111722] shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-95">
                <div className="border-b border-white/8 p-3">
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search company or symbol..."
                    className="w-full rounded-lg border border-white/10 bg-[#151d2a] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
                  />

                  <p className="mt-2 text-[10px] text-slate-500">
                    Search US and Indian stocks
                  </p>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
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
                        className="flex w-full items-center justify-between gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 disabled:opacity-50"
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

                <div className="flex justify-between border-t border-white/8 px-4 py-3">
                  <span className="text-[10px] text-slate-500">
                    Press ESC to close
                  </span>

                  <button
                    type="button"
                    onClick={closeSearch}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-medium text-slate-300">
          M
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="rounded-lg border border-white/10 px-2.5 py-2 text-[11px] font-medium text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 sm:px-3 sm:text-xs"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
