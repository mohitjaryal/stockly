
"use client";

import { useEffect, useRef, useState } from "react";
import {
  LineSeries,
  createChart,
  type Time,
} from "lightweight-charts";

import {
  getLatestNAV,
  getNAVHistory,
  searchMutualFunds,
  type MutualFundNAV,
  type MutualFundSearchResult,
  type NAVRecord,
} from "@/features/mutual-funds/services/mutualFundService";

const ranges = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
  { label: "ALL", months: 0 },
];

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatNAV(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(value);
}

function getFromDate(months: number) {
  if (months === 0) return undefined;

  const date = new Date();
  date.setMonth(date.getMonth() - months);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function MutualFundsPage() {
  const chartContainer = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MutualFundSearchResult[]>([]);
  const [selectedFund, setSelectedFund] =
    useState<MutualFundSearchResult | null>(null);

  const [nav, setNav] = useState<MutualFundNAV | null>(null);
  const [history, setHistory] = useState<NAVRecord[]>([]);

  const [range, setRange] = useState(0);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [fundError, setFundError] = useState("");

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setSearchError("");
      setSearching(false);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        setSearchError("");

        const data = await searchMutualFunds(trimmedQuery);

        if (!cancelled) {
          setResults(data);
        }
      } catch (error) {
        if (!cancelled) {
          setResults([]);
          setSearchError(
            error instanceof Error
              ? error.message
              : "Unable to search mutual funds."
          );
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    if (!selectedFund) return;

    let cancelled = false;

    async function loadFund() {
      try {
        setLoading(true);
        setFundError("");
        setNav(null);
        setHistory([]);

        const [navData, historyData] = await Promise.all([
          getLatestNAV(selectedFund!.schemeCode),
          getNAVHistory(
            selectedFund!.schemeCode,
            getFromDate(range)
          ),
        ]);

        if (cancelled) return;

        setNav(navData);
        setHistory(historyData.history);
      } catch (error) {
        if (!cancelled) {
          setFundError(
            error instanceof Error
              ? error.message
              : "Unable to load fund data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFund();

    return () => {
      cancelled = true;
    };
  }, [selectedFund, range]);

  useEffect(() => {
    if (!chartContainer.current || history.length === 0) return;

    const chart = createChart(chartContainer.current, {
      autoSize: true,
      layout: {
        background: { color: "#111722" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      rightPriceScale: {
        borderColor: "#263244",
      },
      timeScale: {
        borderColor: "#263244",
        timeVisible: false,
      },
      crosshair: {
        vertLine: { color: "#64748b" },
        horzLine: { color: "#64748b" },
      },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#34d399",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });

    lineSeries.setData(
      history.map((item) => ({
        time: item.date as Time,
        value: item.nav,
      }))
    );

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [history]);

  function selectFund(fund: MutualFundSearchResult) {
    setSelectedFund(fund);
    setQuery(fund.schemeName);
    setResults([]);
    setRange(0);
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Investments / Mutual Funds
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Mutual funds
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Explore and analyse Indian mutual funds.
        </p>
      </section>

      <section className="relative rounded-lg border border-white/8 bg-[#111722] p-5">
        <label className="text-sm font-semibold text-white">
          Search mutual funds
        </label>

        <p className="mt-1 text-xs text-slate-500">
          Search by fund name or fund house.
        </p>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try HDFC Flexi Cap..."
          className="mt-4 w-full rounded-md border border-white/10 bg-[#0b111a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
        />

        {searching && (
          <p className="mt-2 text-xs text-slate-500">
            Searching funds...
          </p>
        )}

        {searchError && (
          <p className="mt-2 text-xs text-red-400">{searchError}</p>
        )}

        {results.length > 0 && (
          <div className="mt-3 max-h-72 overflow-y-auto rounded-md border border-white/10 bg-[#0b111a]">
            {results.map((fund) => (
              <button
                key={fund.schemeCode}
                onClick={() => selectFund(fund)}
                className="block w-full border-b border-white/5 px-4 py-3 text-left last:border-0 hover:bg-white/5"
              >
                <p className="text-sm font-medium text-white">
                  {fund.schemeName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Scheme code: {fund.schemeCode}
                </p>
              </button>
            ))}
          </div>
        )}

        {!searching &&
          query.trim().length >= 2 &&
          results.length === 0 &&
          !searchError && (
            <p className="mt-3 text-xs text-slate-500">
              No matching funds found.
            </p>
          )}
      </section>

      {selectedFund && (
        <section className="space-y-5">
          <div>
            <p className="text-xs text-slate-500">Selected fund</p>
            <h2 className="mt-1 text-lg font-semibold text-white">
              {selectedFund.schemeName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Scheme code: {selectedFund.schemeCode}
            </p>
          </div>

          {loading && (
            <div className="rounded-lg border border-white/8 bg-[#111722] p-6">
              <p className="text-sm text-slate-400">
                Loading mutual fund data...
              </p>
            </div>
          )}

          {fundError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-red-400">{fundError}</p>
            </div>
          )}

          {nav && !loading && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-white/8 bg-[#111722] p-5">
                  <p className="text-xs text-slate-500">Latest NAV</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {formatNAV(nav.latest_nav)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    As of {formatDate(nav.nav_date)}
                  </p>
                </div>

                <div className="rounded-lg border border-white/8 bg-[#111722] p-5">
                  <p className="text-xs text-slate-500">Fund house</p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {nav.fund_house}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {nav.scheme_type}
                  </p>
                </div>

                <div className="rounded-lg border border-white/8 bg-[#111722] p-5">
                  <p className="text-xs text-slate-500">Data freshness</p>
                  <p
                    className={`mt-3 text-lg font-semibold ${
                      nav.data_status === "fresh"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {nav.data_status === "fresh"
                      ? "Fresh"
                      : nav.data_status === "stale"
                        ? "Stale"
                        : "Check date"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    NAV is {nav.nav_age_days} day(s) old
                  </p>
                </div>
              </div>

              {nav.is_stale && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-sm text-amber-400">
                    This fund's latest available NAV is older than 7 days.
                    Treat the displayed value as stale data.
                  </p>
                </div>
              )}

              {nav.data_status === "future_dated" && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-sm text-amber-400">
                    The provider returned a future-dated NAV. Verify this
                    data before relying on it.
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-white/8 bg-[#111722] p-5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      NAV history
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Historical NAV performance · INR
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {ranges.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setRange(item.months)}
                        className={`rounded-md px-3 py-2 text-xs transition-colors ${
                          range === item.months
                            ? "bg-emerald-400/15 text-emerald-400"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {history.length > 0 ? (
                  <div
                    ref={chartContainer}
                    className="h-80 w-full"
                  />
                ) : (
                  <p className="py-16 text-center text-sm text-slate-500">
                    No historical NAV data available for this period.
                  </p>
                )}

                <p className="mt-4 text-xs text-slate-600">
                  Source: MFAPI. Historical NAV is not an indication of
                  future returns.
                </p>
              </div>

              <div className="rounded-lg border border-white/8 bg-[#111722] p-5">
                <h3 className="text-sm font-semibold text-white">
                  Fund details
                </h3>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Category</span>
                    <span className="text-right text-slate-300">
                      {nav.scheme_category}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Fund house</span>
                    <span className="text-right text-slate-300">
                      {nav.fund_house}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Scheme code</span>
                    <span className="text-slate-300">
                      {nav.scheme_code}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {!selectedFund && (
        <section className="rounded-lg border border-white/8 bg-[#111722] p-8">
          <h2 className="text-sm font-semibold text-white">
            Mutual fund research
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Search and select a fund to explore its latest NAV and
            historical performance.
          </p>
          <p className="mt-5 text-xs text-slate-500">
            Data is retrieved from MFAPI. No sample or fabricated fund
            data is displayed.
          </p>
        </section>
      )}
    </div>
  );
}
