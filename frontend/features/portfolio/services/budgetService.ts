
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface InvestmentBudget {
  id: number;
  budget_name: string;
  amount: number;
  currency: "INR" | "USD";
  month: number;
  year: number;
  notes?: string | null;
  actual_invested: number;
  remaining_budget: number;
  utilization_percentage: number;
  overspent: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface BudgetInput {
  budget_name?: string;
  amount: number;
  currency: "INR" | "USD";
  month: number;
  year: number;
  notes?: string;
}

function getHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("stockly_token")
      : null;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.detail || `Request failed with status ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export async function getBudgets(params?: {
  month?: number;
  year?: number;
  currency?: "INR" | "USD";
}): Promise<InvestmentBudget[]> {
  const query = new URLSearchParams();

  if (params?.month) query.set("month", String(params.month));
  if (params?.year) query.set("year", String(params.year));
  if (params?.currency) query.set("currency", params.currency);

  const suffix = query.toString() ? `?${query.toString()}` : "";

  const response = await fetch(
    `${API_URL}/investment-budgets${suffix}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse<InvestmentBudget[]>(response);
}

export async function createBudget(
  data: BudgetInput
): Promise<InvestmentBudget> {
  const response = await fetch(`${API_URL}/investment-budgets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<InvestmentBudget>(response);
}

export async function updateBudget(
  budgetId: number,
  data: Partial<BudgetInput>
): Promise<InvestmentBudget> {
  const response = await fetch(
    `${API_URL}/investment-budgets/${budgetId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );

  return handleResponse<InvestmentBudget>(response);
}

export async function deleteBudget(budgetId: number): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/investment-budgets/${budgetId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return handleResponse<{ message: string }>(response);
}
