
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getPortfolioHoldings,
  getPortfolioTransactions,
  type PortfolioHolding,
  type PortfolioTransaction,
} from "@/features/portfolio/services/portfolioService";

type Currency = "INR" | "USD";

function getCurrency(symbol: string): Currency {
  return symbol.endsWith(".NS") || symbol.endsWith(".BO") ? "INR" : "USD";
}

function safeNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function money(value: number, currency: Currency) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(safeNumber(value));
}

function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function FinancialReportsPage() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState<Currency>("INR");

  useEffect(() => {
    Promise.all([getPortfolioHoldings(), getPortfolioTransactions()])
      .then(([holdingData, transactionData]) => {
        setHoldings(holdingData);
        setTransactions(transactionData);

        if (holdingData.length > 0) {
          setCurrency(getCurrency(holdingData[0].symbol));
        }
      })
      .catch((err) => setError(err.message || "Unable to load reports"))
      .finally(() => setLoading(false));
  }, []);

  const filteredHoldings = useMemo(
    () => holdings.filter((item) => getCurrency(item.symbol) === currency),
    [holdings, currency]
  );

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        (item) => getCurrency(item.stock.symbol) === currency
      ),
    [transactions, currency]
  );

  const stats = useMemo(() => {
    const invested = filteredHoldings.reduce(
      (sum, item) =>
        sum +
        safeNumber(item.quantity) * safeNumber(item.average_buy_price),
      0
    );

    const current = filteredHoldings.reduce((sum, item) => {
      const currentValue =
        item.current_value != null
          ? safeNumber(item.current_value)
          : safeNumber(item.quantity) * safeNumber(item.current_price);

      return sum + currentValue;
    }, 0);

    const unrealized = current - invested;

    const realized = filteredHoldings.reduce(
      (sum, item) => sum + safeNumber(item.realized_profit_loss),
      0
    );

    const pricedCount = filteredHoldings.filter(
      (item) => item.current_value != null || item.current_price != null
    ).length;

    return {
      invested,
      current,
      unrealized,
      realized,
      totalProfit: unrealized + realized,
      pricedCount,
      holdingsCount: filteredHoldings.length,
    };
  }, [filteredHoldings]);

  const monthlyActivity = useMemo(() => {
    const months: Record<
      string,
      { buys: number; sells: number; buyCount: number; sellCount: number }
    > = {};

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.transaction_date);

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!months[key]) {
        months[key] = { buys: 0, sells: 0, buyCount: 0, sellCount: 0 };
      }

      const value =
        safeNumber(transaction.quantity) * safeNumber(transaction.price);

      if (transaction.transaction_type === "BUY") {
        months[key].buys += value;
        months[key].buyCount += 1;
      } else {
        months[key].sells += value;
        months[key].sellCount += 1;
      }
    });

    return Object.entries(months)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, data]) => ({
        month: new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        }),
        ...data,
      }));
  }, [filteredTransactions]);

  function exportHoldings() {
    downloadCSV(`stockly-holdings-${currency}.csv`, [
      [
        "Symbol",
        "Company",
        "Quantity",
        "Average Buy Price",
        "Current Price",
        "Invested Value",
        "Current Value",
        "Unrealized P/L",
        "Realized P/L",
        "Currency",
      ],
      ...filteredHoldings.map((item) => [
        item.symbol,
        item.company_name,
        safeNumber(item.quantity),
        safeNumber(item.average_buy_price),
        item.current_price ?? "",
        item.invested_value,
        item.current_value ?? "",
        item.unrealized_profit_loss ?? "",
        item.realized_profit_loss,
        currency,
      ]),
    ]);
  }

  function exportTransactions() {
    downloadCSV(`stockly-transactions-${currency}.csv`, [
      [
        "Date",
        "Symbol",
        "Company",
        "Type",
        "Quantity",
        "Price",
        "Total",
        "Currency",
        "Notes",
      ],
      ...filteredTransactions.map((item) => [
        item.transaction_date,
        item.stock.symbol,
        item.stock.company_name,
        item.transaction_type,
        safeNumber(item.quantity),
        safeNumber(item.price),
        safeNumber(item.quantity) * safeNumber(item.price),
        currency,
        item.notes ?? "",
      ]),
    ]);
  }

  const maxMonthlyValue = Math.max(
    1,
    ...monthlyActivity.map((item) => Math.max(item.buys, item.sells))
  );

  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#19313b] via-[#111827] to-[#111827] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold tracking-wider text-cyan-300">
            FINANCIAL INTELLIGENCE
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Financial Reports
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Track your investment performance, review transaction history
            and understand how your portfolio is growing.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {(["INR", "USD"] as Currency[]).map((item) => (
              <button
                key={item}
                onClick={() => setCurrency(item)}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  currency === item
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {item} Report
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-10 text-center text-slate-400">
          Preparing your financial reports...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Performance Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your {currency} portfolio snapshot
                </p>
              </div>

              <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                {stats.holdingsCount} holdings
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Invested",
                  value: money(stats.invested, currency),
                  color: "text-white",
                },
                {
                  label: "Current Value",
                  value: money(stats.current, currency),
                  color: "text-cyan-300",
                },
                {
                  label: "Unrealized P/L",
                  value: money(stats.unrealized, currency),
                  color:
                    stats.unrealized >= 0
                      ? "text-emerald-400"
                      : "text-red-400",
                },
                {
                  label: "Realized P/L",
                  value: money(stats.realized, currency),
                  color:
                    stats.realized >= 0
                      ? "text-emerald-400"
                      : "text-red-400",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-white/10 bg-[#111827] p-5"
                >
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <p
                    className={`mt-3 break-words text-xl font-bold ${card.color}`}
                  >
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 xl:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Monthly Investment Activity
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Based on recorded BUY and SELL transactions
                  </p>
                </div>

                <span className="text-xs text-slate-500">
                  {monthlyActivity.length} months
                </span>
              </div>

              {monthlyActivity.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">
                  No transaction activity available yet.
                </p>
              ) : (
                <div className="mt-7 space-y-5">
                  {monthlyActivity.map((item) => (
                    <div key={item.month}>
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span className="font-medium text-white">
                          {item.month}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.buyCount + item.sellCount} transactions
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="w-10 text-xs text-slate-500">
                            BUY
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-emerald-400"
                              style={{
                                width: `${(item.buys / maxMonthlyValue) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="w-24 text-right text-xs text-slate-400">
                            {money(item.buys, currency)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="w-10 text-xs text-slate-500">
                            SELL
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-amber-400"
                              style={{
                                width: `${(item.sells / maxMonthlyValue) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="w-24 text-right text-xs text-slate-400">
                            {money(item.sells, currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex gap-5 border-t border-white/10 pt-4">
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Buy activity
                </span>
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Sell activity
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">
              <h2 className="text-lg font-bold text-white">Profit & Loss</h2>
              <p className="mt-1 text-xs text-slate-500">
                Realized plus unrealized P/L
              </p>

              <p
                className={`mt-7 break-words text-2xl font-bold ${
                  stats.totalProfit >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {money(stats.totalProfit, currency)}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Combined reported profit or loss
              </p>

              <div className="mt-7 space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-400">Priced holdings</span>
                    <span className="text-white">
                      {stats.pricedCount}/{stats.holdingsCount}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{
                        width: `${
                          stats.holdingsCount
                            ? (stats.pricedCount / stats.holdingsCount) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.04] p-4">
                  <p className="text-xs text-slate-500">Total transactions</p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {filteredTransactions.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-white">Holdings Report</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Detailed stock-wise portfolio breakdown
                </p>
              </div>

              <button
                onClick={exportHoldings}
                disabled={filteredHoldings.length === 0}
                className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↓ Export Holdings CSV
              </button>
            </div>

            {filteredHoldings.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                No holdings available in this currency.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-white/[0.03] text-xs text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Stock</th>
                      <th className="px-5 py-4">Quantity</th>
                      <th className="px-5 py-4">Avg. Buy</th>
                      <th className="px-5 py-4">Current Value</th>
                      <th className="px-5 py-4">Unrealized P/L</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredHoldings.map((item) => (
                      <tr key={item.stock_id} className="border-t border-white/5">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{item.symbol}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.company_name}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {item.quantity}
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {money(item.average_buy_price, currency)}
                        </td>

                        <td className="px-5 py-4 text-slate-300">
                          {item.current_value == null
                            ? "—"
                            : money(item.current_value, currency)}
                        </td>

                        <td
                          className={`px-5 py-4 font-semibold ${
                            safeNumber(item.unrealized_profit_loss) >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {item.unrealized_profit_loss == null
                            ? "—"
                            : money(item.unrealized_profit_loss, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Transaction History
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your recorded investment activity
                </p>
              </div>

              <button
                onClick={exportTransactions}
                disabled={filteredTransactions.length === 0}
                className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↓ Export Transactions CSV
              </button>
            </div>

            {filteredTransactions.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                No transactions recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-white/[0.03] text-xs text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Stock</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Quantity</th>
                      <th className="px-5 py-4">Total Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[...filteredTransactions]
                      .sort(
                        (a, b) =>
                          new Date(b.transaction_date).getTime() -
                          new Date(a.transaction_date).getTime()
                      )
                      .map((item) => (
                        <tr key={item.id} className="border-t border-white/5">
                          <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                            {new Date(item.transaction_date).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-5 py-4 font-semibold text-white">
                            {item.stock.symbol}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                item.transaction_type === "BUY"
                                  ? "bg-emerald-400/10 text-emerald-400"
                                  : "bg-amber-400/10 text-amber-400"
                              }`}
                            >
                              {item.transaction_type}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {item.quantity}
                          </td>

                          <td className="px-5 py-4 font-medium text-white">
                            {money(
                              safeNumber(item.quantity) * safeNumber(item.price),
                              currency
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="text-xs leading-6 text-slate-500">
            Reports are generated from your recorded portfolio holdings and
            transactions. INR and USD figures are shown separately and are
            not converted into a common currency. Past performance does not
            guarantee future returns. Unpriced holdings may affect the
            displayed current value.
          </p>
        </>
      )}
    </div>
  );
}
