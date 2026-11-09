
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface WatchlistItem {
  id: number;
  symbol: string;
  company_name: string;
  exchange: string | null;
  created_at: string;
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

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const response = await fetch(`${API_BASE_URL}/watchlist/`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await handleResponse(response);
  return response.json();
}

export async function addToWatchlist(
  symbol: string
): Promise<WatchlistItem> {
  const response = await fetch(`${API_BASE_URL}/watchlist/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ symbol }),
  });

  await handleResponse(response);
  return response.json();
}

export async function removeFromWatchlist(
  symbol: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/watchlist/${encodeURIComponent(symbol)}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  await handleResponse(response);
}
