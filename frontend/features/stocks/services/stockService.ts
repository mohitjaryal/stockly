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

export async function getStocks(): Promise<Stock[]> {
  const response = await fetch(`${API_BASE_URL}/stocks/`);

  if (!response.ok) {
    throw new Error("Failed to fetch stocks");
  }

  return response.json();
}

export async function getStockPrice(
  symbol: string
): Promise<StockPrice> {
  const response = await fetch(
    `${API_BASE_URL}/stocks/${encodeURIComponent(symbol)}/price`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${symbol} price`);
  }

  return response.json();
}

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

  if (!response.ok) {
    throw new Error(`Failed to fetch ${symbol} history`);
  }

  return response.json();
}
