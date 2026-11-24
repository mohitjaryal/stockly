
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface InvestmentPlan {
  id: number;
  investment_name: string;
  asset_type: "STOCK" | "MUTUAL_FUND" | "ETF" | "OTHER";
  planned_amount: number;
  actual_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  currency: "INR" | "USD";
  planned_date: string;
  status: "PLANNED" | "COMPLETED" | "CANCELLED";
  notes?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface InvestmentPlanInput {
  investment_name: string;
  asset_type: InvestmentPlan["asset_type"];
  planned_amount: number;
  actual_amount?: number;
  currency: InvestmentPlan["currency"];
  planned_date: string;
  status?: InvestmentPlan["status"];
  notes?: string;
}

function getToken(): string {
  if (typeof window === "undefined") return "";

  return localStorage.getItem("stockly_token") || "";
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.detail || "Something went wrong. Please try again."
    );
  }

  return response.json();
}

export async function getInvestmentPlans(): Promise<InvestmentPlan[]> {
  return request<InvestmentPlan[]>("/investment-plans");
}

export async function createInvestmentPlan(
  data: InvestmentPlanInput
): Promise<InvestmentPlan> {
  return request<InvestmentPlan>("/investment-plans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateInvestmentPlan(
  id: number,
  data: Partial<InvestmentPlanInput>
): Promise<InvestmentPlan> {
  return request<InvestmentPlan>(`/investment-plans/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteInvestmentPlan(id: number): Promise<void> {
  await request<{ message: string }>(`/investment-plans/${id}`, {
    method: "DELETE",
  });
}
