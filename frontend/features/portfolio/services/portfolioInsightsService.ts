
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("stockly_token");

  if (!token) throw new Error("Please login first");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Something went wrong");
  }

  if (response.status === 204) return null;
  return response.json();
}

export interface RiskAllocation {
  symbol: string;
  company_name: string;
  current_value: number;
  allocation_percentage: number;
  risk_level: string;
}

export interface CurrencyRiskReport {
  currency: string;
  total_current_value: number;
  holdings_count: number;
  diversification_score: number;
  highest_concentration: RiskAllocation | null;
  allocations: RiskAllocation[];
  warnings: string[];
}

export interface PortfolioRisk {
  currency_reports: CurrencyRiskReport[];
  unpriced_holdings: { symbol: string; company_name: string }[];
  unpriced_holdings_count: number;
  disclaimer: string;
}

export interface InvestmentGoal {
  id: number;
  goal_name: string;
  description: string | null;
  target_amount: number;
  currency: "INR" | "USD";
  deadline: string | null;
  created_at: string;

  portfolio_value: number;
  portfolio_progress_percentage: number;

  manual_contributions: number;
  contribution_progress_percentage: number;

  achieved_at: string | null;
  is_completed: boolean;

  // Backward-compatible fields
  current_amount: number;
  progress_percentage: number;
  remaining_amount: number;
}

export interface CreateInvestmentGoal {
  goal_name: string;
  description?: string;
  target_amount: number;
  currency: "INR" | "USD";
  deadline?: string;
}

export interface GoalContribution {
  id: number;
  goal_id: number;
  amount: number;
  note: string | null;
  contributed_at: string;
}

export interface CreateGoalContribution {
  amount: number;
  note?: string;
}

export const getPortfolioRisk = () =>
  request("/portfolio/risk") as Promise<PortfolioRisk>;

export const getInvestmentGoals = () =>
  request("/investment-goals/") as Promise<InvestmentGoal[]>;

export const createInvestmentGoal = (data: CreateInvestmentGoal) =>
  request("/investment-goals/", {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<InvestmentGoal>;

export const deleteInvestmentGoal = (id: number) =>
  request(`/investment-goals/${id}`, { method: "DELETE" });

export const addGoalContribution = (
  goalId: number,
  data: CreateGoalContribution
) =>
  request(`/investment-goals/${goalId}/contributions`, {
    method: "POST",
    body: JSON.stringify(data),
  }) as Promise<GoalContribution>;

export const getGoalContributions = (goalId: number) =>
  request(`/investment-goals/${goalId}/contributions`) as Promise<
    GoalContribution[]
  >;

export const deleteGoalContribution = (contributionId: number) =>
  request(`/investment-goals/contributions/${contributionId}`, {
    method: "DELETE",
  });
