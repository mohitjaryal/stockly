
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addStock,
  getStockDirectory,
  getStocks,
  searchStockDirectory,
  type Stock,
  type StockListing,
} from "@/features/stocks/services/stockService";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
} from "@/features/watchlist/services/watchlistService";

type Market = "ALL" | "US" | "IN";

interface StockDirectoryProps {
  onSelect: (stock: Stock) => void;
}

const PAGE_SIZE = 50;

const exchanges = [
  { value: "", label: "All exchanges" },
  { value: "NSE", label: "NSE" },
  { value: "NASDAQ", label: "NASDAQ" },
  { value: "NYSE", label: "NYSE" },
  { value: "NYSE_AMERICAN", label: "NYSE American" },
  { value: "NYSE_ARCA", label: "NYSE Arca" },
  { value: "CBOE_BZX", label: "CBOE BZX" },
];

function getTargetSymbol(listing: StockListing) {
  return listing.country === "IN"
    ? `${listing.symbol}.NS`
    : listing.symbol;
}

export default function StockDirectory({
  onSelect,
}: StockDirectoryProps) {
  const [stocks, setStocks] = useState<StockListing[]>([]);
  const [market, setMarket] = useState<Market>("ALL");
  const [exchange, setExchange] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openingSymbol, setOpeningSymbol] = useState("");
  const [error, setError] = useState("");
  const [selectionError, setSelectionError] = useState("");

  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const [watchlistBusySymbol, setWatchlistBusySymbol] = useState("");
  const [watchlistError, setWatchlistError] = useState("");

  const loadStocks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const filters = {
        country: market === "ALL" ? undefined : market,
        exchange: exchange || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      };

      const results = query.trim()
        ? await searchStockDirectory(query, filters)
        : await getStockDirectory(filters);

      setStocks(results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load stock directory"
      );
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [market, exchange, query, page]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        void loadStocks();
      },
      query.trim() ? 350 : 0
    );

    return () => window.clearTimeout(timer);
  }, [loadStocks, query]);

  useEffect(() => {
    let cancelled = false;

    async function loadWatchlistSymbols() {
      try {
        const entries = await getWatchlist();

        if (!cancelled) {
          setWatchlistSymbols(
            entries.map((entry) => entry.symbol.toUpperCase())
          );
          setWatchlistError("");
        }
      } catch (err) {
        if (!cancelled) {
          setWatchlistError(
            err instanceof Error
              ? err.message
              : "Unable to load watchlist"
          );
        }
      }
    }

    void loadWatchlistSymbols();

    return () => {
      cancelled = true;
    };
  }, []);

  function changeMarket(value: Market) {
    setMarket(value);
    setExchange("");
    setPage(0);
  }

  function changeExchange(value: string) {
    setExchange(value);
    setPage(0);
  }

  function changeQuery(value: string) {
    setQuery(value);
    setPage(0);
  }

  async function handleSelectStock(listing: StockListing) {
    if (openingSymbol) return;

    setOpeningSymbol(listing.symbol);
    setSelectionError("");

    try {
      const symbol = getTargetSymbol(listing);
      const savedStocks = await getStocks();

      const existingStock = savedStocks.find(
        (stock) => stock.symbol.toUpperCase() === symbol.toUpperCase()
      );

      if (existingStock) {
        onSelect(existingStock);
        return;
      }

      const newStock = await addStock({
        symbol,
        description: listing.company_name,
      });

      onSelect(newStock);
    } catch (err) {
      setSelectionError(
        err instanceof Error
          ? err.message
          : "Unable to open this stock. Please try again."
      );
    } finally {
      setOpeningSymbol("");
    }
  }

  async function handleToggleWatchlist(listing: StockListing) {
    const symbol = getTargetSymbol(listing);
    const normalizedSymbol = symbol.toUpperCase();

    if (watchlistBusySymbol) return;

    setWatchlistBusySymbol(normalizedSymbol);
    setWatchlistError("");

    try {
      const alreadyAdded = watchlistSymbols.includes(normalizedSymbol);

      if (alreadyAdded) {
        await removeFromWatchlist(normalizedSymbol);

        setWatchlistSymbols((current) =>
          current.filter((item) => item !== normalizedSymbol)
        );
      } else {
        const savedStocks = await getStocks();

        const existingStock = savedStocks.find(
          (stock) => stock.symbol.toUpperCase() === normalizedSymbol
        );

        if (!existingStock) {
          await addStock({
            symbol,
            description: listing.company_name,
          });
        }

        await addToWatchlist(symbol);

        setWatchlistSymbols((current) =>
          current.includes(normalizedSymbol)
            ? current
            : [...current, normalizedSymbol]
        );
      }
    } catch (err) {
      setWatchlistError(
        err instanceof Error
          ? err.message
          : "Unable to update watchlist. Please try again."
      );
    } finally {
      setWatchlistBusySymbol("");
    }
  }

  const availableExchanges = exchanges.filter(
    (item) =>
      !item.value ||
      market === "ALL" ||
      (market === "IN" && item.value === "NSE") ||
      (market === "US" && item.value !== "NSE")
  );

  return (
    <section className="w-full min-w-0 space-y-5">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-400 sm:text-xs sm:tracking-[0.16em]">
          Market explorer
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
          Stock Directory
        </h2>

        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
          Explore listed companies across Indian and US markets.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-5">
        <aside className="min-w-0 rounded-xl border border-white/8 bg-[#111722] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Filters</h3>

            <button
              type="button"
              onClick={() => {
                setMarket("ALL");
                setExchange("");
                setQuery("");
                setPage(0);
              }}
              className="shrink-0 text-xs text-emerald-400 transition hover:text-emerald-300"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
            <div className="min-w-0">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Market
              </p>

              <div className="grid grid-cols-3 gap-1 sm:grid-cols-1">
                {(
                  [
                    ["ALL", "All markets"],
                    ["US", "United States"],
                    ["IN", "India"],
                  ] as [Market, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => changeMarket(value)}
                    className={`flex min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-center text-[11px] transition sm:justify-between sm:px-3 sm:text-left sm:text-xs ${
                      market === value
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{label}</span>

                    {market === value && (
                      <span className="hidden h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 sm:block" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/6 pt-4 sm:border-t-0 sm:pt-0 lg:border-t lg:pt-5">
              <label
                htmlFor="directory-exchange"
                className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
              >
                Exchange
              </label>

              <select
                id="directory-exchange"
                value={exchange}
                onChange={(event) => changeExchange(event.target.value)}
                className="w-full min-w-0 rounded-lg border border-white/8 bg-[#0B111A] px-3 py-3 text-xs text-slate-300 outline-none focus:border-emerald-500/50"
              >
                {availableExchanges.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-white/6 pt-4 sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:border-t-0 sm:pt-0 lg:col-span-1 lg:block lg:border-t lg:pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Coverage
              </p>

              <div className="mt-3 space-y-2 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>US market</span>
                  <span className="text-slate-500">US</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Indian market</span>
                  <span className="text-slate-500">NSE</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <div className="min-w-0 rounded-xl border border-white/8 bg-[#111722] p-3 sm:p-4">
            <label htmlFor="directory-search" className="sr-only">
              Search stocks
            </label>

            <div className="relative min-w-0">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                ⌕
              </span>

              <input
                id="directory-search"
                type="search"
                value={query}
                onChange={(event) => changeQuery(event.target.value)}
                placeholder="Search company name or symbol..."
                className="w-full min-w-0 rounded-lg border border-white/8 bg-[#0B111A] py-3 pl-11 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50 sm:pr-4"
              />
            </div>
          </div>

          {selectionError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="wrap-break-word text-xs text-red-400">
                {selectionError}
              </p>
            </div>
          )}

          {watchlistError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="wrap-break-word text-xs text-red-400">
                {watchlistError}
              </p>
            </div>
          )}

          <div className="min-w-0 overflow-hidden rounded-xl border border-white/8 bg-[#111722]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/6 px-3 py-4 sm:px-5">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white">
                  Listed companies
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {loading
                    ? "Loading listings..."
                    : `${stocks.length} results on this page`}
                </p>
              </div>

              <span className="shrink-0 rounded-md border border-white/8 px-3 py-1.5 text-[11px] text-slate-400">
                Page {page + 1}
              </span>
            </div>

            {error ? (
              <div className="p-6 text-center sm:p-8">
                <p className="wrap-break-word text-sm text-red-400">{error}</p>

                <button
                  type="button"
                  onClick={() => void loadStocks()}
                  className="mt-3 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className="py-16 text-center text-sm text-slate-500">
                Loading stock directory...
              </div>
            ) : stocks.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <p className="text-sm font-medium text-white">
                  No stocks found
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Try another company name, symbol or market.
                </p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-190 text-left">
                  <thead>
                    <tr className="border-b border-white/6 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      <th className="px-5 py-3 font-medium">Company</th>
                      <th className="px-3 py-3 font-medium">Symbol</th>
                      <th className="px-3 py-3 font-medium">Exchange</th>
                      <th className="px-3 py-3 font-medium">Market</th>
                      <th className="px-3 py-3 text-right font-medium">
                        Watchlist
                      </th>
                      <th className="px-5 py-3 text-right font-medium">
                        Open
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {stocks.map((stock) => {
                      const isOpening = openingSymbol === stock.symbol;
                      const targetSymbol = getTargetSymbol(stock);
                      const normalizedTargetSymbol =
                        targetSymbol.toUpperCase();

                      const isInWatchlist = watchlistSymbols.includes(
                        normalizedTargetSymbol
                      );

                      const isWatchlistBusy =
                        watchlistBusySymbol === normalizedTargetSymbol;

                      return (
                        <tr
                          key={stock.id}
                          tabIndex={0}
                          role="button"
                          aria-label={`Open ${stock.company_name} research`}
                          aria-disabled={Boolean(openingSymbol)}
                          onClick={() => void handleSelectStock(stock)}
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter" ||
                              event.key === " "
                            ) {
                              event.preventDefault();
                              void handleSelectStock(stock);
                            }
                          }}
                          className={`group cursor-pointer border-b border-white/5 transition last:border-0 hover:bg-emerald-400/4 focus-visible:bg-emerald-400/6 focus-visible:outline-none ${
                            openingSymbol && !isOpening
                              ? "pointer-events-none opacity-50"
                              : ""
                          }`}
                        >
                          <td className="max-w-70 px-5 py-4">
                            <p className="truncate text-sm font-medium text-white transition group-hover:text-emerald-300">
                              {stock.company_name}
                            </p>

                            <p className="mt-1 truncate text-[11px] text-slate-500">
                              {stock.sector ||
                                stock.industry ||
                                "Sector unavailable"}
                            </p>
                          </td>

                          <td className="px-3 py-4">
                            <span className="text-xs font-semibold text-emerald-400">
                              {stock.symbol}
                            </span>
                          </td>

                          <td className="px-3 py-4 text-xs text-slate-300">
                            {stock.exchange.replaceAll("_", " ")}
                          </td>

                          <td className="px-3 py-4 text-xs text-slate-400">
                            {stock.country === "IN"
                              ? "India"
                              : "United States"}
                          </td>

                          <td className="px-3 py-4 text-right">
                            <button
                              type="button"
                              disabled={
                                Boolean(watchlistBusySymbol) ||
                                Boolean(openingSymbol)
                              }
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleToggleWatchlist(stock);
                              }}
                              onKeyDown={(event) => {
                                event.stopPropagation();
                              }}
                              aria-label={
                                isInWatchlist
                                  ? `Remove ${stock.company_name} from watchlist`
                                  : `Add ${stock.company_name} to watchlist`
                              }
                              className={`rounded-md border px-3 py-2 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                isInWatchlist
                                  ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                                  : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                            >
                              {isWatchlistBusy
                                ? "Saving..."
                                : isInWatchlist
                                  ? "Remove"
                                  : "Add"}
                            </button>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <span className="text-xs font-medium text-slate-500 transition group-hover:text-emerald-400">
                              {isOpening ? "Opening..." : "View →"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 border-t border-white/6 px-3 py-4 sm:px-5">
              <button
                type="button"
                disabled={page === 0 || loading}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-white/8 px-3 py-2.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30 sm:px-4"
              >
                Previous
              </button>

              <span className="text-center text-[11px] text-slate-500">
                {stocks.length} listings
              </span>

              <button
                type="button"
                disabled={stocks.length < PAGE_SIZE || loading}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-white/8 px-3 py-2.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30 sm:px-4"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
