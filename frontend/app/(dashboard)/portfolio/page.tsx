
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getPortfolioSummary,
  getPortfolioHoldings,
  getPortfolioTransactions,
  createPortfolioTransaction,
  type PortfolioSummary,
  type PortfolioHolding,
  type PortfolioTransaction,
} from "@/features/portfolio/services/portfolioService";
import { getStocks, type Stock } from "@/features/stocks/services/stockService";

function isINR(symbol: string) {
  return symbol.endsWith(".NS") || symbol.endsWith(".BO");
}

function formatAmount(value: number | string | null, symbol: string) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: isINR(symbol) ? "INR" : "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatNumber(value: number | string) {
  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 4,
  });
}

const allocationColors = [
  "#34D399",
  "#60A5FA",
  "#A78BFA",
  "#FBBF24",
  "#F87171",
  "#22D3EE",
  "#F472B6",
  "#A3E635",
];

export default function PortfolioPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [stockId, setStockId] = useState("");
  const [transactionType, setTransactionType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryData, holdingsData, transactionsData, stocksData] =
        await Promise.all([
          getPortfolioSummary(),
          getPortfolioHoldings(),
          getPortfolioTransactions(),
          getStocks(),
        ]);

      setSummary(summaryData);
      setHoldings(holdingsData);
      setTransactions(transactionsData);
      setStocks(stocksData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load portfolio"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const selectedStock = stocks.find(
    (stock) => stock.id === Number(stockId)
  );

  const filteredHoldings = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return holdings;

    return holdings.filter(
      (holding) =>
        holding.symbol.toLowerCase().includes(term) ||
        holding.company_name.toLowerCase().includes(term)
    );
  }, [holdings, search]);

  const allocationGroups = (["INR", "USD"] as const)
    .map((currency) => {
      const items = holdings.filter(
        (holding) =>
          (currency === "INR"
            ? isINR(holding.symbol)
            : !isINR(holding.symbol)) &&
          Number(holding.invested_value) > 0
      );

      const total = items.reduce(
        (sum, holding) => sum + Number(holding.invested_value),
        0
      );

      let cumulative = 0;

      const segments = items.map((holding, index) => {
        const amount = Number(holding.invested_value);
        const percentage = total > 0 ? (amount / total) * 100 : 0;

        const segment = {
          holding,
          amount,
          percentage,
          color: allocationColors[index % allocationColors.length],
          start: cumulative,
          end: cumulative + percentage,
        };

        cumulative += percentage;
        return segment;
      });

      const gradient = segments
        .map(
          (segment) =>
            `${segment.color} ${segment.start}% ${segment.end}%`
        )
        .join(", ");

      return { currency, items, total, segments, gradient };
    })
    .filter((group) => group.items.length > 0);

  const resetForm = () => {
    setStockId("");
    setTransactionType("BUY");
    setQuantity("");
    setPrice("");
    setNotes("");
    setFormError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!stockId || !quantity || !price) {
      setFormError("Please fill all required fields.");
      return;
    }

    if (Number(quantity) <= 0 || Number(price) <= 0) {
      setFormError("Quantity and price must be greater than zero.");
      return;
    }

    setSaving(true);

    try {
      await createPortfolioTransaction({
        stock_id: Number(stockId),
        transaction_type: transactionType,
        quantity: Number(quantity),
        price: Number(price),
        notes: notes.trim() || undefined,
      });

      setShowForm(false);
      resetForm();
      await loadPortfolio();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Transaction failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    {
      label: "Total Invested",
      value: summary ? formatNumber(summary.total_invested) : "—",
      detail: "Remaining cost basis",
      icon: "↗",
      color: "text-blue-400",
      background: "bg-blue-400/10",
    },
    {
      label: "Current Value",
      value: summary ? formatNumber(summary.current_value) : "—",
      detail: "Latest available prices",
      icon: "◈",
      color: "text-violet-400",
      background: "bg-violet-400/10",
    },
    {
      label: "Unrealized P&L",
      value: summary ? formatNumber(summary.unrealized_profit_loss) : "—",
      detail: "Open positions",
      icon: "⌁",
      color:
        Number(summary?.unrealized_profit_loss ?? 0) >= 0
          ? "text-emerald-400"
          : "text-red-400",
      background: "bg-emerald-400/10",
    },
    {
      label: "Total P&L",
      value: summary ? formatNumber(summary.total_profit_loss) : "—",
      detail: "Realized + unrealized",
      icon: "✦",
      color:
        Number(summary?.total_profit_loss ?? 0) >= 0
          ? "text-emerald-400"
          : "text-red-400",
      background: "bg-emerald-400/10",
    },
  ];

  const counts = [
    { label: "Total Holdings", value: summary?.holdings_count ?? 0, icon: "◫" },
    {
      label: "Priced Holdings",
      value: summary?.priced_holdings_count ?? 0,
      icon: "◉",
    },
    { label: "Transactions", value: transactions.length, icon: "⇄" },
  ];

  return (
    <div className="min-h-screen space-y-7 pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-[#142b27] via-[#111d22] to-[#111722] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Investment Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              My Portfolio<span className="text-emerald-400">.</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
              Your investments, all in one place. Monitor holdings, track
              performance and manage your transactions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadPortfolio}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-[#07130f] shadow-lg shadow-emerald-400/10 transition hover:bg-emerald-300"
            >
              + Add Transaction
            </button>
          </div>
        </div>

        <div className="relative mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5">
          {counts.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xl text-emerald-400">{item.icon}</span>
              <div>
                <p className="text-lg font-bold text-white">
                  {loading ? "..." : item.value}
                </p>
                <p className="text-xs text-slate-400">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <span>{error}</span>
          <button onClick={loadPortfolio} className="underline">
            Retry
          </button>
        </div>
      )}

      {/* Summary */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Portfolio Overview
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              A snapshot of your investment performance
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Overview
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-white/[0.08] bg-[#111722] p-5 transition duration-200 hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-[#141e2a]"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">
                  {stat.label}
                </p>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${stat.background} ${stat.color}`}
                >
                  {stat.icon}
                </span>
              </div>

              <p className={`mt-5 break-words text-2xl font-bold tracking-tight ${stat.color}`}>
                {loading ? "..." : stat.value}
              </p>

              <p className="mt-2 text-xs text-slate-500">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Allocation */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#111722] p-5 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Asset Allocation
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              How your invested capital is distributed across holdings
            </p>
          </div>
          <span className="rounded-lg bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-400">
            By invested value
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading allocation...
          </div>
        ) : allocationGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
            <div className="text-3xl text-slate-600">◉</div>
            <p className="mt-3 text-sm font-medium text-slate-300">
              No allocation data yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add a BUY transaction to see your portfolio distribution.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {allocationGroups.map((group) => (
              <div
                key={group.currency}
                className="rounded-xl border border-white/[0.06] bg-[#0c121c] p-5"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {group.currency === "INR"
                        ? "Indian Investments"
                        : "International Investments"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {group.items.length} active positions
                    </p>
                  </div>
                  <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400">
                    {group.currency}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-7 sm:flex-row">
                  <div className="relative h-48 w-48 shrink-0">
                    <div
                      className="h-full w-full rounded-full"
                      style={{
                        background: `conic-gradient(${group.gradient})`,
                      }}
                    />
                    <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full border border-white/5 bg-[#111722]">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">
                        Invested
                      </span>
                      <span className="mt-2 px-2 text-center text-lg font-bold text-white">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: group.currency,
                          maximumFractionDigits: 0,
                        }).format(group.total)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full min-w-0 space-y-4">
                    {group.segments.map((segment) => (
                      <div key={segment.holding.stock_id}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: segment.color }}
                            />
                            <span className="truncate text-sm font-medium text-slate-200">
                              {segment.holding.symbol}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-white">
                            {segment.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${segment.percentage}%`,
                              backgroundColor: segment.color,
                            }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-slate-500">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: group.currency,
                            maximumFractionDigits: 2,
                          }).format(segment.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Holdings */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111722]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Your Holdings
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Detailed view of your active stock positions
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              ⌕
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search stocks..."
              className="w-full rounded-xl border border-white/10 bg-[#0c121c] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/40"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading holdings...
          </div>
        ) : holdings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-3xl text-slate-600">◫</div>
            <p className="mt-3 text-sm font-medium text-slate-300">
              No holdings yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add your first BUY transaction to get started.
            </p>
          </div>
        ) : filteredHoldings.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No stocks match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#0c121c] text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Asset</th>
                  <th className="px-5 py-4 font-semibold">Quantity</th>
                  <th className="px-5 py-4 font-semibold">Avg. Price</th>
                  <th className="px-5 py-4 font-semibold">Market Price</th>
                  <th className="px-5 py-4 font-semibold">Invested</th>
                  <th className="px-5 py-4 font-semibold">Current Value</th>
                  <th className="px-5 py-4 font-semibold">Unrealized P&L</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {filteredHoldings.map((holding) => {
                  const profit = Number(
                    holding.unrealized_profit_loss ?? 0
                  ) >= 0;

                  return (
                    <tr
                      key={holding.stock_id}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/10 text-xs font-bold text-emerald-400">
                            {holding.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {holding.symbol}
                            </p>
                            <p className="mt-1 max-w-[150px] truncate text-xs text-slate-500">
                              {holding.company_name}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-300">
                        {formatNumber(holding.quantity)}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {formatAmount(holding.average_buy_price, holding.symbol)}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {formatAmount(holding.current_price, holding.symbol)}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {formatAmount(holding.invested_value, holding.symbol)}
                      </td>
                      <td className="px-5 py-4 font-medium text-white">
                        {formatAmount(holding.current_value, holding.symbol)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                            profit
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-red-400/10 text-red-400"
                          }`}
                        >
                          {profit ? "↗" : "↘"}{" "}
                          {formatAmount(
                            holding.unrealized_profit_loss,
                            holding.symbol
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-white/[0.06] px-6 py-3">
          <p className="text-xs text-slate-500">
            Showing {filteredHoldings.length} of {holdings.length} holdings
          </p>
        </div>
      </section>

      {/* Transactions */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111722]">
        <div className="flex items-center justify-between border-b border-white/[0.07] p-5 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Activity
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your latest BUY and SELL transactions
            </p>
          </div>
          <span className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-400">
            Last 10
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No transactions yet.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {transactions.slice(0, 10).map((transaction) => {
              const isBuy = transaction.transaction_type === "BUY";

              return (
                <div
                  key={transaction.id}
                  className="flex flex-col justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                        isBuy
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {isBuy ? "↗" : "↙"}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-white">
                          {transaction.stock.symbol}
                        </p>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            isBuy
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-red-400/10 text-red-400"
                          }`}
                        >
                          {transaction.transaction_type}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(
                          transaction.transaction_date
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-sm font-semibold text-white">
                      {formatNumber(transaction.quantity)} shares
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatAmount(
                        transaction.price,
                        transaction.stock.symbol
                      )}{" "}
                      per share
                    </p>
                    {transaction.notes && (
                      <p className="mt-1 max-w-xs truncate text-xs text-slate-600 sm:ml-auto">
                        {transaction.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Transaction Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#111722] shadow-2xl shadow-black/50">
            <div className="border-b border-white/[0.07] bg-gradient-to-r from-emerald-400/[0.08] to-transparent p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                    Portfolio Management
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">
                    Add Transaction
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Record a stock purchase or sale
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-3 py-1 text-2xl text-slate-500 transition hover:bg-white/5 hover:text-white"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["BUY", "SELL"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTransactionType(type)}
                      className={`rounded-xl border py-3.5 text-sm font-bold transition ${
                        transactionType === type
                          ? type === "BUY"
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                            : "border-red-400/40 bg-red-400/10 text-red-400"
                          : "border-white/10 bg-[#0c121c] text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {type === "BUY" ? "↗ Buy Stock" : "↙ Sell Stock"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Select Stock
                </label>
                <select
                  value={stockId}
                  onChange={(event) => setStockId(event.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0c121c] px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-400/50"
                >
                  <option value="">Choose a stock</option>
                  {stocks.map((stock) => (
                    <option key={stock.id} value={stock.id}>
                      {stock.symbol} — {stock.company_name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStock && transactionType === "SELL" && (
                <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.05] p-3">
                  <p className="text-xs text-amber-300">
                    Available quantity:{" "}
                    <strong>
                      {formatNumber(
                        holdings.find(
                          (item) => item.stock_id === selectedStock.id
                        )?.quantity ?? 0
                      )}
                    </strong>
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0.00000001"
                    step="any"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    required
                    placeholder="e.g. 10"
                    className="w-full rounded-xl border border-white/10 bg-[#0c121c] px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-400/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Price per share (
                    {selectedStock
                      ? isINR(selectedStock.symbol)
                        ? "₹"
                        : "$"
                      : "₹ / $"}
                    )
                  </label>
                  <input
                    type="number"
                    min="0.00000001"
                    step="any"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    required
                    placeholder="e.g. 150"
                    className="w-full rounded-xl border border-white/10 bg-[#0c121c] px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Notes <span className="text-slate-600">(optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={500}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Why are you making this transaction?"
                  className="w-full rounded-xl border border-white/10 bg-[#0c121c] px-4 py-3.5 text-sm text-white outline-none transition focus:border-emerald-400/50"
                />
              </div>

              {formError && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-white/10 py-3.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 rounded-xl py-3.5 text-sm font-bold text-[#07130f] transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    transactionType === "BUY"
                      ? "bg-emerald-400 hover:bg-emerald-300"
                      : "bg-red-400 hover:bg-red-300"
                  }`}
                >
                  {saving ? "Saving..." : `Confirm ${transactionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <p className="text-xs leading-5 text-slate-500">
          Currency note: Portfolio summary amounts use native currency values.
          INR and USD holdings are displayed separately and are not converted
          into one common currency. Prices depend on available market data.
        </p>
      </div>
    </div>
  );
}
