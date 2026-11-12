
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface Stock {
  id: number;
  symbol: string;
  company_name: string;
  exchange: string;
}

export interface StockPrice {
  id: number;
  stock_id: number;
  price: string;
  open_price: string;
  high_price: string;
  low_price: string;
  volume: number | null;
  recorded_at: string;
}

export interface StockSearchResult {
  symbol: string;
  description: string;
  displaySymbol?: string;
  type?: string;
}

export interface StockListing {
  id: number;
  symbol: string;
  company_name: string;
  exchange: string;
  country: string;
  currency: string;
  isin: string | null;
  sector: string | null;
  industry: string | null;
  asset_type: string;
  is_active: boolean;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockDirectoryFilters {
  country?: string;
  exchange?: string;
  sector?: string;
  limit?: number;
  offset?: number;
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

function buildDirectoryParams(
  filters: StockDirectoryFilters = {}
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.country) {
    params.set("country", filters.country);
  }

  if (filters.exchange) {
    params.set("exchange", filters.exchange);
  }

  if (filters.sector) {
    params.set("sector", filters.sector);
  }

  params.set("limit", String(filters.limit ?? 50));
  params.set("offset", String(filters.offset ?? 0));

  return params;
}

// Existing stock functions

export async function getStocks(): Promise<Stock[]> {
  const response = await fetch(`${API_BASE_URL}/stocks/`);

  await handleResponse(response);
  return response.json();
}

export async function searchStocks(
  query: string,
  exchange?: string
): Promise<StockSearchResult[]> {
  const params = new URLSearchParams({ q: query });

  if (exchange) {
    params.set("exchange", exchange);
  }

  const response = await fetch(
    `${API_BASE_URL}/stocks/search?${params.toString()}`,
    { cache: "no-store" }
  );

  await handleResponse(response);

  const data = await response.json();
  return data.result ?? [];
}

export async function addStock(
  stock: StockSearchResult
): Promise<Stock> {
  const response = await fetch(`${API_BASE_URL}/stocks/add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      symbol: stock.symbol,
      company_name: stock.description,
      exchange:
        stock.symbol.endsWith(".NS") ||
        stock.symbol.endsWith(".BO")
          ? "NSE/BSE"
          : "US",
    }),
  });

  await handleResponse(response);
  return response.json();
}

export async function getStockPrice(
  symbol: string
): Promise<StockPrice> {
  const response = await fetch(
    `${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/price`,
    { cache: "no-store" }
  );

  await handleResponse(response);
  return response.json();
}

// Stock directory functions

export async function getStockDirectory(
  filters: StockDirectoryFilters = {}
): Promise<StockListing[]> {
  const params = buildDirectoryParams(filters);

  const response = await fetch(
    `${API_BASE_URL}/stocks/directory?${params.toString()}`,
    { cache: "no-store" }
  );

  await handleResponse(response);
  return response.json();
}

export async function searchStockDirectory(
  query: string,
  filters: StockDirectoryFilters = {}
): Promise<StockListing[]> {
  const params = buildDirectoryParams(filters);
  params.set("q", query.trim());

  const response = await fetch(
    `${API_BASE_URL}/stocks/directory/search?${params.toString()}`,
    { cache: "no-store" }
  );

  await handleResponse(response);
  return response.json();
}

// Historical stock data

export interface HistoricalCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function getStockHistory(
  symbol: string,
  resolution = "D",
  period = "1mo"
): Promise<HistoricalCandle[]> {
  const params = new URLSearchParams({ resolution, period });

  const response = await fetch(
    `${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/history?${params}`,
    { cache: "no-store" }
  );

  await handleResponse(response);
  return response.json();
}
