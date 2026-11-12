
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getPortfolioSummary,
  getPortfolioHoldings,
  getPortfolioTransactions,
  createPortfolioTransaction,
  type PortfolioSummary,
  type PortfolioHolding,
  type PortfolioTransaction,
} from "@/features/portfolio/services/portfolioService";
import {
  getStocks,
  type Stock,
} from "@/features/stocks/services/stockService";

function formatAmount(value: number | string | null, symbol: string) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: symbol.endsWith(".NS") || symbol.endsWith(".BO")
      ? "INR"
      : "USD",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatNumber(value: number | string) {
  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 4,
  });
}

export default function PortfolioPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const [
        summaryData,
        holdingsData,
        transactionsData,
        stocksData,
      ] = await Promise.all([
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
      value: summary
        ? formatNumber(summary.total_invested)
        : "—",
      detail: "Remaining cost basis",
    },
    {
      label: "Current Value",
      value: summary
        ? formatNumber(summary.current_value)
        : "—",
      detail: "Latest available prices",
    },
    {
      label: "Unrealized P&L",
      value: summary
        ? formatNumber(summary.unrealized_profit_loss)
        : "—",
      detail: "Open positions",
      profit: Number(summary?.unrealized_profit_loss ?? 0) >= 0,
    },
    {
      label: "Total P&L",
      value: summary
        ? formatNumber(summary.total_profit_loss)
        : "—",
      detail: "Realized + unrealized",
      profit: Number(summary?.total_profit_loss ?? 0) >= 0,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Workspace / Investments
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            My Portfolio
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track your investments, holdings and portfolio performance.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#08110e] transition hover:bg-emerald-300"
        >
          + Add Transaction
        </button>
      </section>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
          <button
            onClick={loadPortfolio}
            className="ml-3 underline"
          >
            Retry
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-white/8 bg-[#111722] p-5"
          >
            <p className="text-xs text-slate-400">{stat.label}</p>

            <p
              className={`mt-4 text-2xl font-semibold tracking-tight ${
                stat.profit === undefined
                  ? "text-white"
                  : stat.profit
                    ? "text-emerald-400"
                    : "text-red-400"
              }`}
            >
              {loading ? "..." : stat.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Holdings",
            value: summary?.holdings_count ?? 0,
          },
          {
            label: "Priced Holdings",
            value: summary?.priced_holdings_count ?? 0,
          },
          {
            label: "Transactions",
            value: transactions.length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-white/8 bg-[#111722] p-5"
          >
            <p className="text-xs text-slate-400">{item.label}</p>
            <p className="mt-3 text-xl font-semibold text-white">
              {loading ? "..." : item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-lg border border-white/8 bg-[#111722]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-5">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Your Holdings
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Your currently active stock positions
            </p>
          </div>

          <button
            onClick={loadPortfolio}
            className="text-xs text-slate-400 transition hover:text-emerald-400"
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading holdings...
          </div>
        ) : holdings.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-300">
              No holdings yet
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Add your first BUY transaction to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/8 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Stock</th>
                  <th className="px-5 py-4 font-medium">Quantity</th>
                  <th className="px-5 py-4 font-medium">Avg. Price</th>
                  <th className="px-5 py-4 font-medium">Current Price</th>
                  <th className="px-5 py-4 font-medium">Invested</th>
                  <th className="px-5 py-4 font-medium">Current Value</th>
                  <th className="px-5 py-4 font-medium">P&L</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {holdings.map((holding) => (
                  <tr
                    key={holding.stock_id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">
                        {holding.symbol}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {holding.company_name}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {formatNumber(holding.quantity)}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {formatAmount(holding.average_buy_price, holding.symbol)}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {formatAmount(holding.current_price, holding.symbol)}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {formatAmount(holding.invested_value, holding.symbol)}
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {formatAmount(holding.current_value, holding.symbol)}
                    </td>

                    <td className={`px-5 py-4 font-medium ${
                      Number(holding.unrealized_profit_loss ?? 0) >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}>
                      {formatAmount(
                        holding.unrealized_profit_loss,
                        holding.symbol
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-lg border border-white/8 bg-[#111722]">
        <div className="border-b border-white/8 px-5 py-5">
          <h2 className="text-sm font-semibold text-white">
            Recent Transactions
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Your BUY and SELL activity
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No transactions yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${
                      transaction.transaction_type === "BUY"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-red-400/10 text-red-400"
                    }`}
                  >
                    {transaction.transaction_type === "BUY" ? "↗" : "↙"}
                  </span>

                  <div>
                    <p className="text-sm font-medium text-white">
                      {transaction.stock.symbol}
                      <span className="ml-2 text-xs text-slate-500">
                        {transaction.transaction_type}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(transaction.transaction_date).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-white">
                    {formatNumber(transaction.quantity)} ×{" "}
                    {formatAmount(transaction.price, transaction.stock.symbol)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {transaction.notes || "No notes"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111722] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Add Transaction
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Record a stock purchase or sale
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="text-xl text-slate-500 transition hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Transaction Type
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {(["BUY", "SELL"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTransactionType(type)}
                      className={`rounded-lg border py-3 text-sm font-semibold transition ${
                        transactionType === type
                          ? type === "BUY"
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                            : "border-red-400/40 bg-red-400/10 text-red-400"
                          : "border-white/10 text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {type}
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
                  className="w-full rounded-lg border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
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
                <p className="text-xs text-slate-500">
                  Available quantity:{" "}
                  {formatNumber(
                    holdings.find((item) => item.stock_id === selectedStock.id)
                      ?.quantity ?? 0
                  )}
                </p>
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
                    className="w-full rounded-lg border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Price per share (
                    {selectedStock?.symbol.endsWith(".NS") ||
                    selectedStock?.symbol.endsWith(".BO")
                      ? "₹"
                      : "$"}
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
                    className="w-full rounded-lg border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  maxLength={500}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add a note..."
                  className="w-full rounded-lg border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
                />
              </div>

              {formError && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-white/10 py-3 text-sm text-slate-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 rounded-lg py-3 text-sm font-semibold text-[#08110e] transition disabled:cursor-not-allowed disabled:opacity-50 ${
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

      <p className="text-xs text-slate-600">
        Portfolio summary amounts currently use native currency values. USD
        and INR holdings are not yet converted into one common currency.
      </p>
    </div>
  );
}
