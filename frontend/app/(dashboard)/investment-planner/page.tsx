
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  InvestmentPlan,
  InvestmentPlanInput,
  getInvestmentPlans,
  createInvestmentPlan,
  updateInvestmentPlan,
  deleteInvestmentPlan,
} from "@/features/portfolio/services/investmentPlanService";

const initialForm: InvestmentPlanInput = {
  investment_name: "",
  asset_type: "STOCK",
  planned_amount: 0,
  actual_amount: 0,
  currency: "INR",
  planned_date: new Date().toISOString().split("T")[0],
  status: "PLANNED",
  notes: "",
};

const assetColors: Record<string, string> = {
  STOCK: "#60A5FA",
  MUTUAL_FUND: "#A78BFA",
  ETF: "#34D399",
  OTHER: "#FBBF24",
};

const assetLabels: Record<string, string> = {
  STOCK: "Stocks",
  MUTUAL_FUND: "Mutual Funds",
  ETF: "ETFs",
  OTHER: "Other",
};

export default function InvestmentPlannerPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [form, setForm] = useState<InvestmentPlanInput>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setPlans(await getInvestmentPlans());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load investment plans."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const formatMoney = (amount: number, curr: string) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 0,
    }).format(amount);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split("T")[0];

  const activePlans = plans.filter((p) => p.status === "PLANNED");
  const completedPlans = plans.filter((p) => p.status === "COMPLETED");
  const cancelledPlans = plans.filter((p) => p.status === "CANCELLED");

  const overduePlans = activePlans.filter(
    (p) => p.planned_date < todayString
  );

  const upcomingPlans = activePlans.filter(
    (p) => p.planned_date >= todayString
  );

  const currencyPlans = plans.filter(
    (p) => p.currency === currency && p.status !== "CANCELLED"
  );

  const plannedCapital = currencyPlans.reduce(
    (sum, p) => sum + Number(p.planned_amount),
    0
  );

  const deployedCapital = currencyPlans.reduce(
    (sum, p) => sum + Number(p.actual_amount),
    0
  );

  const remainingCapital = Math.max(plannedCapital - deployedCapital, 0);

  const deploymentRate =
    plannedCapital > 0
      ? Math.min((deployedCapital / plannedCapital) * 100, 100)
      : 0;

  const assetAllocation = useMemo(() => {
    const groups = ["STOCK", "MUTUAL_FUND", "ETF", "OTHER"];

    return groups.map((type) => {
      const amount = currencyPlans
        .filter((p) => p.asset_type === type)
        .reduce((sum, p) => sum + Number(p.planned_amount), 0);

      return {
        type,
        amount,
        percentage:
          plannedCapital > 0 ? (amount / plannedCapital) * 100 : 0,
      };
    }).filter((item) => item.amount > 0);
  }, [currencyPlans, plannedCapital]);

  let accumulated = 0;
  const gradientStops = assetAllocation.map((item) => {
    const start = accumulated;
    accumulated += item.percentage;
    return `${assetColors[item.type]} ${start}% ${accumulated}%`;
  });

  const donutBackground =
    plannedCapital > 0
      ? `conic-gradient(${gradientStops.join(", ")})`
      : "conic-gradient(#374151 0% 100%)";

  const visiblePlans = [...plans]
    .filter((p) => {
      if (filter === "ALL") return true;
      if (filter === "OVERDUE") {
        return p.status === "PLANNED" && p.planned_date < todayString;
      }
      return p.status === filter;
    })
    .sort((a, b) => a.planned_date.localeCompare(b.planned_date));

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createInvestmentPlan(form);

      setForm({
        ...initialForm,
        planned_date: new Date().toISOString().split("T")[0],
      });

      setShowForm(false);
      setSuccess("Investment plan created successfully!");
      await loadPlans();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create investment plan."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (plan: InvestmentPlan) => {
    const amountInput = window.prompt(
      "Enter actual invested amount:",
      String(plan.actual_amount)
    );

    if (amountInput === null) return;

    const amount = Number(amountInput);

    if (!Number.isFinite(amount) || amount < 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const statusInput = window.prompt(
      "Enter status: PLANNED, COMPLETED or CANCELLED",
      plan.status
    );

    if (statusInput === null) return;

    const status = statusInput.trim().toUpperCase();

    if (!["PLANNED", "COMPLETED", "CANCELLED"].includes(status)) {
      setError("Invalid status.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await updateInvestmentPlan(plan.id, {
        actual_amount: amount,
        status: status as InvestmentPlan["status"],
      });

      setSuccess("Investment plan updated successfully!");
      await loadPlans();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update investment plan."
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this investment plan?")) return;

    try {
      setError("");
      setSuccess("");
      await deleteInvestmentPlan(id);
      setSuccess("Investment plan deleted successfully!");
      await loadPlans();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete investment plan."
      );
    }
  };

  const dateLabel = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const statusInfo = (plan: InvestmentPlan) => {
    if (plan.status === "COMPLETED") {
      return { label: "Completed", style: "text-emerald-400 bg-emerald-400/10" };
    }
    if (plan.status === "CANCELLED") {
      return { label: "Cancelled", style: "text-gray-400 bg-gray-400/10" };
    }
    if (plan.planned_date < todayString) {
      return { label: "Overdue", style: "text-red-400 bg-red-400/10" };
    }
    return { label: "Upcoming", style: "text-blue-400 bg-blue-400/10" };
  };

  return (
    <div className="min-h-screen space-y-7 p-4 text-white md:p-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Investment Strategy
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Investment Roadmap
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Turn your financial goals into an actionable investment plan.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500"
        >
          {showForm ? "Close Form" : "+ New Investment Plan"}
        </button>
      </header>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <section className="rounded-2xl border border-blue-500/20 bg-[#111827] p-5 md:p-7">
          <h2 className="text-xl font-semibold">Create Investment Strategy</h2>
          <p className="mt-1 text-sm text-gray-400">
            Define the asset, capital and target execution date.
          </p>

          <form onSubmit={handleCreate} className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-300">Investment Name</label>
              <input
                required
                maxLength={150}
                value={form.investment_name}
                onChange={(e) => setForm({ ...form, investment_name: e.target.value })}
                placeholder="e.g. Nifty 50 ETF"
                className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Asset Class</label>
              <select
                value={form.asset_type}
                onChange={(e) => setForm({ ...form, asset_type: e.target.value as InvestmentPlanInput["asset_type"] })}
                className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white"
              >
                <option value="STOCK">Stocks</option>
                <option value="MUTUAL_FUND">Mutual Funds</option>
                <option value="ETF">ETFs</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Planned Capital</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.planned_amount || ""}
                onChange={(e) => setForm({ ...form, planned_amount: Number(e.target.value) })}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value as "INR" | "USD" })}
                className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Target Investment Date</label>
              <input
                required
                type="date"
                value={form.planned_date}
                onChange={(e) => setForm({ ...form, planned_date: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Already Invested</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.actual_amount ?? 0}
                onChange={(e) => setForm({ ...form, actual_amount: Number(e.target.value) })}
                className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-gray-300">Investment Notes</label>
              <textarea
                rows={3}
                maxLength={300}
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Your strategy, allocation reasoning or reminders..."
                className="w-full rounded-xl border border-white/10 bg-[#0B1220] px-4 py-3 text-white"
              />
            </div>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Investment Plan"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-white/10 px-6 py-3 text-gray-300 hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-12 text-center text-gray-400">
          Loading your investment roadmap...
        </div>
      ) : (
        <>
          {/* Capital overview */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#172554] via-[#111827] to-[#111827] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-blue-200/70">Capital Deployment Overview</p>
                <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                  {formatMoney(plannedCapital, currency)}
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Total planned investment capital
                </p>
              </div>

              <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
                {(["INR", "USD"] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      currency === curr ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-400">Capital Deployed</p>
                <p className="mt-2 text-xl font-semibold text-emerald-400">
                  {formatMoney(deployedCapital, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Capital Remaining</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatMoney(remainingCapital, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Deployment Progress</p>
                <p className="mt-2 text-xl font-semibold text-blue-300">
                  {deploymentRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all"
                style={{ width: `${deploymentRate}%` }}
              />
            </div>
          </section>

          {/* Strategy stats */}
          <section className="grid gap-4 grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Strategies" value={String(plans.length)} detail="All investment plans" />
            <StatCard label="Upcoming" value={String(upcomingPlans.length)} detail="Scheduled investments" color="text-blue-400" />
            <StatCard label="Overdue" value={String(overduePlans.length)} detail="Past target date" color="text-red-400" />
            <StatCard label="Completed" value={String(completedPlans.length)} detail="Completed plans" color="text-emerald-400" />
          </section>

          {/* Allocation and roadmap summary */}
          <section className="grid gap-5 xl:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 xl:col-span-2">
              <div>
                <h2 className="text-lg font-semibold">Asset Allocation</h2>
                <p className="mt-1 text-xs text-gray-400">
                  Planned capital by asset class · {currency}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-7">
                <div
                  className="relative h-44 w-44 shrink-0 rounded-full"
                  style={{ background: donutBackground }}
                >
                  <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-[#111827]">
                    <span className="text-xs text-gray-400">Allocated</span>
                    <span className="mt-1 text-xl font-bold">
                      {plannedCapital > 0 ? "100%" : "0%"}
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  {assetAllocation.length === 0 ? (
                    <p className="text-sm text-gray-500">No allocation data yet.</p>
                  ) : (
                    assetAllocation.map((item) => (
                      <div key={item.type}>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex items-center gap-2 text-gray-300">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: assetColors[item.type] }}
                            />
                            {assetLabels[item.type]}
                          </span>
                          <span className="font-medium text-white">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <p className="mt-1 pl-5 text-xs text-gray-500">
                          {formatMoney(item.amount, currency)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 xl:col-span-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Roadmap Snapshot</h2>
                  <p className="mt-1 text-xs text-gray-400">
                    Your next investment milestones
                  </p>
                </div>
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                  {upcomingPlans.length} upcoming
                </span>
              </div>

              <div className="mt-6 space-y-5">
                {upcomingPlans.slice(0, 4).length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No upcoming investments. Add a new plan to build your roadmap.
                  </p>
                ) : (
                  upcomingPlans
                    .slice()
                    .sort((a, b) => a.planned_date.localeCompare(b.planned_date))
                    .slice(0, 4)
                    .map((plan, index) => (
                      <div key={plan.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/10 text-sm font-semibold text-blue-400">
                            {index + 1}
                          </div>
                          {index < Math.min(upcomingPlans.length, 4) - 1 && (
                            <div className="mt-1 h-7 w-px bg-white/10" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white">{plan.investment_name}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {assetLabels[plan.asset_type]} · {dateLabel(plan.planned_date)}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-gray-200">
                          {formatMoney(Number(plan.planned_amount), plan.currency)}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </section>

          {/* Full investment schedule */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Investment Schedule</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Monitor the execution of each investment strategy.
                </p>
              </div>
              <button
                onClick={loadPlans}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
              >
                ↻ Refresh
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                ["ALL", "All Plans"],
                ["PLANNED", "Planned"],
                ["OVERDUE", "Overdue"],
                ["COMPLETED", "Completed"],
                ["CANCELLED", "Cancelled"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                    filter === value
                      ? "bg-blue-600 text-white"
                      : "border border-white/10 bg-[#111827] text-gray-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {visiblePlans.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-[#111827] p-10 text-center">
                  <p className="font-medium text-white">No investments in this view</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Create a new plan or select another filter.
                  </p>
                </div>
              ) : (
                visiblePlans.map((plan) => {
                  const progress = Math.min(
                    Number(plan.progress_percentage) || 0,
                    100
                  );
                  const status = statusInfo(plan);

                  return (
                    <article
                      key={plan.id}
                      className="rounded-2xl border border-white/10 bg-[#111827] p-5 transition hover:border-blue-500/30"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
                            style={{
                              backgroundColor: `${assetColors[plan.asset_type]}18`,
                              color: assetColors[plan.asset_type],
                            }}
                          >
                            {plan.asset_type === "STOCK" ? "↗" :
                             plan.asset_type === "MUTUAL_FUND" ? "◈" :
                             plan.asset_type === "ETF" ? "▦" : "◆"}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {plan.investment_name}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                              {assetLabels[plan.asset_type]} · Target date: {dateLabel(plan.planned_date)}
                            </p>
                          </div>
                        </div>

                        <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${status.style}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-xs text-gray-500">Planned Capital</p>
                          <p className="mt-1 font-semibold text-white">
                            {formatMoney(Number(plan.planned_amount), plan.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Actual Invested</p>
                          <p className="mt-1 font-semibold text-emerald-400">
                            {formatMoney(Number(plan.actual_amount), plan.currency)}
                          </p>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-xs text-gray-500">Remaining</p>
                          <p className="mt-1 font-semibold text-white">
                            {formatMoney(Number(plan.remaining_amount), plan.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex justify-between text-xs">
                          <span className="text-gray-400">Execution progress</span>
                          <span className="font-semibold text-blue-400">
                            {progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {plan.notes && (
                        <p className="mt-4 rounded-lg bg-white/[0.03] p-3 text-sm text-gray-400">
                          {plan.notes}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
                        <button
                          onClick={() => handleUpdate(plan)}
                          className="rounded-lg border border-blue-500/30 px-4 py-2 text-xs font-medium text-blue-400 hover:bg-blue-500/10"
                        >
                          Update Progress
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="rounded-lg border border-red-500/30 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10"
                        >
                          Delete Plan
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </>
      )}

      <p className="border-t border-white/10 pt-5 text-xs text-gray-500">
        Investment plans are manually maintained. Actual invested amounts are
        not automatically synchronized with portfolio transactions. INR and
        USD are displayed separately. This tool is for tracking and planning,
        not investment advice.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  color = "text-white",
}: {
  label: string;
  value: string;
  detail: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${color}`}>{value}</p>
      <p className="mt-2 text-xs text-gray-500">{detail}</p>
    </div>
  );
}
