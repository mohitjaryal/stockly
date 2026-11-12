
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  unrealized_profit_loss: number;
  realized_profit_loss: number;
  total_profit_loss: number;
  holdings_count: number;
  priced_holdings_count: number;
}

export interface PortfolioHolding {
  stock_id: number;
  symbol: string;
  company_name: string;
  exchange: string | null;
  quantity: number;
  average_buy_price: number;
  current_price: number | null;
  invested_value: number;
  current_value: number | null;
  unrealized_profit_loss: number | null;
  realized_profit_loss: number;
}

export interface PortfolioTransaction {
  id: number;
  stock_id: number;
  transaction_type: "BUY" | "SELL";
  quantity: number;
  price: number;
  transaction_date: string;
  notes: string | null;
  stock: {
    id: number;
    symbol: string;
    company_name: string;
    exchange: string | null;
  };
}

export interface CreatePortfolioTransaction {
  stock_id: number;
  transaction_type: "BUY" | "SELL";
  quantity: number;
  price: number;
  transaction_date?: string;
  notes?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("stockly_token");

  if (!token) {
    throw new Error("Please login first");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Something went wrong");
  }

  return response;
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const response = await fetch(`${API_BASE_URL}/portfolio/summary`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await handleResponse(response);
  return response.json();
}

export async function getPortfolioHoldings(): Promise<PortfolioHolding[]> {
  const response = await fetch(`${API_BASE_URL}/portfolio/holdings`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await handleResponse(response);
  return response.json();
}

export async function getPortfolioTransactions(): Promise<PortfolioTransaction[]> {
  const response = await fetch(`${API_BASE_URL}/portfolio/transactions`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await handleResponse(response);
  return response.json();
}

export async function createPortfolioTransaction(
  data: CreatePortfolioTransaction
): Promise<PortfolioTransaction> {
  const response = await fetch(`${API_BASE_URL}/portfolio/transactions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleResponse(response);
  return response.json();
}
