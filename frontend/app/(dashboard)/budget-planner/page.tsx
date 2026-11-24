
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  type InvestmentBudget,
} from "@/features/portfolio/services/budgetService";

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const currentDate = new Date();

export default function BudgetPlannerPage() {
  const [budgets, setBudgets] = useState<InvestmentBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [budgetName, setBudgetName] = useState("Monthly Investment Budget");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [notes, setNotes] = useState("");

  async function loadBudgets() {
    try {
      setError("");
      const result = await getBudgets({ month, year });
      setBudgets(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load budgets"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBudgets();
  }, [month, year]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createBudget({
        budget_name: budgetName.trim(),
        amount: Number(amount),
        currency,
        month,
        year,
        notes: notes.trim() || undefined,
      });

      setAmount("");
      setNotes("");
      setSuccess("Monthly budget created successfully!");
      await loadBudgets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create budget"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(budget: InvestmentBudget) {
    const newAmount = window.prompt(
      `Enter new budget amount (${budget.currency}):`,
      String(budget.amount)
    );

    if (newAmount === null) return;

    const parsedAmount = Number(newAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await updateBudget(budget.id, {
        amount: parsedAmount,
      });

      setSuccess("Budget updated successfully!");
      await loadBudgets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update budget"
      );
    }
  }

  async function handleDelete(budgetId: number) {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteBudget(budgetId);
      setSuccess("Budget deleted successfully!");
      await loadBudgets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete budget"
      );
    }
  }

  const totalFor = (selectedCurrency: "INR" | "USD", field: "amount" | "actual_invested" | "remaining_budget") =>
    budgets
      .filter((budget) => budget.currency === selectedCurrency)
      .reduce((total, budget) => total + budget[field], 0);

  const monthName = new Date(year, month - 1).toLocaleString("en-IN", {
    month: "long",
  });

  return (
    <div className="space-y-8 pb-10">
      <div>
        <p className="text-sm font-medium text-emerald-400">
          FINANCIAL PLANNING
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Budget Planner
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Plan your monthly investments and track your budget utilization.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Monthly Overview
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {monthName} {year}
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-[#0B0F17] px-3 py-2 text-sm text-white"
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Date(2026, index).toLocaleString("en-IN", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-[#0B0F17] px-3 py-2 text-sm text-white"
            >
              {Array.from({ length: 7 }, (_, index) => (
                <option key={2026 + index} value={2026 + index}>
                  {2026 + index}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-slate-400">
            Loading budget overview...
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(["INR", "USD"] as const).map((selectedCurrency) => (
              <div
                key={selectedCurrency}
                className="rounded-xl border border-white/10 bg-[#0B0F17] p-4"
              >
                <p className="text-sm text-slate-400">
                  {selectedCurrency} Budget
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {money(
                    totalFor(selectedCurrency, "amount"),
                    selectedCurrency
                  )}
                </p>

                <div className="mt-4 flex justify-between text-xs text-slate-400">
                  <span>Invested</span>
                  <span>
                    {money(
                      totalFor(selectedCurrency, "actual_invested"),
                      selectedCurrency
                    )}
                  </span>
                </div>

                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>Remaining</span>
                  <span className="text-emerald-400">
                    {money(
                      totalFor(selectedCurrency, "remaining_budget"),
                      selectedCurrency
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white">
          Create Monthly Budget
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Set a separate investment budget for each currency and month.
        </p>

        <form onSubmit={handleCreate} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Budget name
            </label>
            <input
              required
              maxLength={100}
              value={budgetName}
              onChange={(e) => setBudgetName(e.target.value)}
              placeholder="Monthly Investment Budget"
              className="w-full rounded-xl border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Budget amount
            </label>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as "INR" | "USD")
              }
              className="w-full rounded-xl border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Notes (optional)
            </label>
            <input
              maxLength={300}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note..."
              className="w-full rounded-xl border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#07110D] transition hover:bg-emerald-300 disabled:opacity-50 sm:w-auto"
            >
              {saving ? "Creating..." : "+ Create Budget"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">
            Your Monthly Budgets
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Actual investments are calculated from your recorded BUY transactions.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#111827] p-10 text-center">
            <h3 className="font-semibold text-white">
              No budgets for this month
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Create your first monthly investment budget above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {budgets.map((budget) => {
              const progress = Math.min(
                100,
                Math.max(0, budget.utilization_percentage)
              );

              return (
                <article
                  key={budget.id}
                  className="rounded-2xl border border-white/10 bg-[#111827] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">
                        {budget.budget_name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {monthName} {year} · {budget.currency}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        budget.overspent
                          ? "bg-red-500/10 text-red-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {budget.overspent ? "Over budget" : "On track"}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Budget</p>
                      <p className="mt-1 text-lg font-bold text-white">
                        {money(budget.amount, budget.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Invested</p>
                      <p className="mt-1 text-lg font-bold text-emerald-400">
                        {money(budget.actual_invested, budget.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Remaining</p>
                      <p className="mt-1 font-semibold text-white">
                        {money(budget.remaining_budget, budget.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Utilization</p>
                      <p className="mt-1 font-semibold text-white">
                        {budget.utilization_percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs text-slate-400">
                      <span>Budget utilization</span>
                      <span>
                        {budget.utilization_percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all ${
                          budget.overspent ? "bg-red-400" : "bg-emerald-400"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {budget.notes && (
                    <p className="mt-4 text-xs text-slate-400">
                      Note: {budget.notes}
                    </p>
                  )}

                  <div className="mt-5 flex gap-4 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => handleEdit(budget)}
                      className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      Edit budget
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(budget.id)}
                      className="text-sm font-medium text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-xs leading-relaxed text-slate-500">
        Budget tracking is based on BUY transactions recorded in Stockly.
        INR and USD budgets are displayed separately and are not converted
        using an exchange rate.
      </p>
    </div>
  );
}
