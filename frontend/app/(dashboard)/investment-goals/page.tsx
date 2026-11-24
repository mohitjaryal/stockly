
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getInvestmentGoals,
  createInvestmentGoal,
  deleteInvestmentGoal,
  addGoalContribution,
  getGoalContributions,
  deleteGoalContribution,
  type InvestmentGoal,
  type GoalContribution,
} from "@/features/portfolio/services/portfolioInsightsService";

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const percentage = (value: number) =>
  Math.min(100, Math.max(0, value || 0));

export default function InvestmentGoalsPage() {
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);
  const [contributions, setContributions] = useState<
    Record<number, GoalContribution[]>
  >({});
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionNote, setContributionNote] = useState("");
  const [contributionSaving, setContributionSaving] = useState(false);
  const [contributionLoading, setContributionLoading] = useState(false);

  async function loadGoals() {
    try {
      setError("");
      const result = await getInvestmentGoals();
      setGoals(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load goals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadContributions(goalId: number) {
    setContributionLoading(true);

    try {
      const result = await getGoalContributions(goalId);
      setContributions((current) => ({
        ...current,
        [goalId]: result,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load contributions"
      );
    } finally {
      setContributionLoading(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await createInvestmentGoal({
        goal_name: goalName.trim(),
        target_amount: Number(targetAmount),
        currency,
        deadline: deadline || undefined,
        description: description.trim() || undefined,
      });

      setGoalName("");
      setTargetAmount("");
      setDeadline("");
      setDescription("");
      await loadGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create goal");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      await deleteInvestmentGoal(id);
      setGoals((current) => current.filter((goal) => goal.id !== id));

      if (expandedGoalId === id) {
        setExpandedGoalId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete goal");
    }
  }

  async function handleToggleContributions(goalId: number) {
    setError("");

    if (expandedGoalId === goalId) {
      setExpandedGoalId(null);
      return;
    }

    setExpandedGoalId(goalId);
    setContributionAmount("");
    setContributionNote("");
    await loadContributions(goalId);
  }

  async function handleAddContribution(
    event: FormEvent<HTMLFormElement>,
    goalId: number
  ) {
    event.preventDefault();

    const amount = Number(contributionAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid contribution amount.");
      return;
    }

    setContributionSaving(true);
    setError("");

    try {
      await addGoalContribution(goalId, {
        amount,
        note: contributionNote.trim() || undefined,
      });

      setContributionAmount("");
      setContributionNote("");

      await Promise.all([loadContributions(goalId), loadGoals()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not add contribution"
      );
    } finally {
      setContributionSaving(false);
    }
  }

  async function handleDeleteContribution(
    contributionId: number,
    goalId: number
  ) {
    if (!window.confirm("Delete this contribution?")) return;

    try {
      await deleteGoalContribution(contributionId);
      await Promise.all([loadContributions(goalId), loadGoals()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete contribution"
      );
    }
  }

  const completed = goals.filter((goal) => goal.is_completed).length;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Your financial journey
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Investment Goals
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Track your portfolio value, personal savings and financial targets.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
          <p className="text-sm text-slate-400">Total Goals</p>
          <p className="mt-2 text-3xl font-bold text-white">{goals.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
          <p className="text-sm text-slate-400">Completed Goals</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {completed}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
          <p className="text-sm text-slate-400">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {goals.length - completed}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Create a new goal</h2>
        <p className="mt-1 text-sm text-slate-400">
          Define what you are investing or saving towards.
        </p>

        <form onSubmit={handleCreate} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Goal name
            </label>
            <input
              required
              minLength={2}
              maxLength={120}
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="e.g. Buy a Car"
              className="w-full rounded-xl border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Target amount
            </label>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full rounded-xl border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "INR" | "USD")}
              className="w-full rounded-xl border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            >
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Target deadline
            </label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-slate-300">
              Description (optional)
            </label>
            <textarea
              rows={2}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you saving or investing for?"
              className="w-full rounded-xl border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#07110D] transition hover:bg-emerald-300 disabled:opacity-50 sm:col-span-2"
          >
            {saving ? "Creating..." : "+ Create Investment Goal"}
          </button>
        </form>
      </section>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Your Goals</h2>
          <span className="text-sm text-slate-500">{goals.length} goals</span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading your goals...</p>
        ) : goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#111827] p-10 text-center">
            <p className="text-lg font-semibold text-white">No goals yet</p>
            <p className="mt-2 text-sm text-slate-400">
              Create your first investment goal above to start tracking progress.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {goals.map((goal) => {
              const isExpanded = expandedGoalId === goal.id;
              const goalContributions = contributions[goal.id] || [];

              return (
                <article
                  key={goal.id}
                  className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {goal.goal_name}
                      </h3>
                      {goal.description && (
                        <p className="mt-1 text-sm text-slate-400">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                        goal.is_completed
                          ? "bg-emerald-400/10 text-emerald-400"
                          : "bg-blue-400/10 text-blue-300"
                      }`}
                    >
                      {goal.is_completed ? "Completed" : "In progress"}
                    </span>
                  </div>

                  <div className="mt-6 rounded-xl bg-[#0B0F17] p-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Portfolio market value
                        </p>
                        <p className="mt-1 text-xl font-bold text-white">
                          {money(goal.portfolio_value, goal.currency)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-blue-300">
                        {goal.portfolio_progress_percentage.toFixed(1)}%
                      </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-blue-400 transition-all"
                        style={{
                          width: `${percentage(goal.portfolio_progress_percentage)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Your existing portfolio value in {goal.currency}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#0B0F17] p-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Manual savings contributions
                        </p>
                        <p className="mt-1 text-xl font-bold text-white">
                          {money(goal.manual_contributions, goal.currency)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-400">
                        {goal.contribution_progress_percentage.toFixed(1)}%
                      </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all"
                        style={{
                          width: `${percentage(goal.contribution_progress_percentage)}%`,
                        }}
                      />
                    </div>

                    <div className="mt-4 flex justify-between gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Target</p>
                        <p className="mt-1 text-white">
                          {money(goal.target_amount, goal.currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          Savings remaining
                        </p>
                        <p className="mt-1 text-white">
                          {money(goal.remaining_amount, goal.currency)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {goal.is_completed && goal.achieved_at && (
                    <p className="mt-4 text-sm text-emerald-400">
                      Goal first achieved on{" "}
                      {new Date(goal.achieved_at).toLocaleDateString("en-IN")}
                    </p>
                  )}

                  {goal.deadline && (
                    <p className="mt-3 text-xs text-slate-500">
                      Target date:{" "}
                      {new Date(goal.deadline + "T00:00:00").toLocaleDateString(
                        "en-IN"
                      )}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleContributions(goal.id)}
                      className="rounded-xl border border-emerald-400/30 px-4 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-400/10"
                    >
                      {isExpanded ? "Hide Contributions" : "Manage Contributions"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(goal.id)}
                      className="text-xs text-red-400 transition hover:text-red-300"
                    >
                      Delete goal
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-5 border-t border-white/10 pt-5">
                      <h4 className="font-semibold text-white">
                        Add a contribution
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Enter an amount saved towards this goal in{" "}
                        {goal.currency}.
                      </p>

                      <form
                        onSubmit={(event) =>
                          handleAddContribution(event, goal.id)
                        }
                        className="mt-4 space-y-3"
                      >
                        <input
                          required
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={contributionAmount}
                          onChange={(e) =>
                            setContributionAmount(e.target.value)
                          }
                          placeholder={`Amount in ${goal.currency}`}
                          className="w-full rounded-xl border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                        />

                        <input
                          type="text"
                          maxLength={300}
                          value={contributionNote}
                          onChange={(e) => setContributionNote(e.target.value)}
                          placeholder="Note (optional, e.g. Monthly savings)"
                          className="w-full rounded-xl border border-white/10 bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                        />

                        <button
                          type="submit"
                          disabled={contributionSaving}
                          className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-[#07110D] transition hover:bg-emerald-300 disabled:opacity-50"
                        >
                          {contributionSaving
                            ? "Adding..."
                            : "+ Add Contribution"}
                        </button>
                      </form>

                      <div className="mt-6">
                        <h4 className="font-semibold text-white">
                          Contribution history
                        </h4>

                        {contributionLoading ? (
                          <p className="mt-3 text-sm text-slate-400">
                            Loading contributions...
                          </p>
                        ) : goalContributions.length === 0 ? (
                          <p className="mt-3 text-sm text-slate-500">
                            No contributions added yet.
                          </p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {goalContributions.map((contribution) => (
                              <div
                                key={contribution.id}
                                className="flex items-center justify-between gap-3 rounded-xl bg-[#0B0F17] p-3"
                              >
                                <div>
                                  <p className="font-semibold text-white">
                                    {money(contribution.amount, goal.currency)}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {contribution.note || "Savings contribution"}
                                    {" · "}
                                    {new Date(
                                      contribution.contributed_at
                                    ).toLocaleDateString("en-IN")}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteContribution(
                                      contribution.id,
                                      goal.id
                                    )
                                  }
                                  className="shrink-0 text-xs text-red-400 hover:text-red-300"
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
