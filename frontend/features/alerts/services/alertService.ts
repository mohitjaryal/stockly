
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface Alert {
  id: number;
  user_id: number;
  stock_id: number;
  condition: "above" | "below";
  target_price: string;
  status: string;
  created_at: string;
  triggered_at: string | null;
}

interface AlertCreate {
  stock_id: number;
  condition: "above" | "below";
  target_price: number;
}

interface AlertUpdate {
  condition?: "above" | "below";
  target_price?: number;
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

export async function getAlerts(): Promise<Alert[]> {
  const response = await fetch(`${API_BASE_URL}/alerts/`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  await handleResponse(response);
  return response.json();
}

export async function createAlert(
  data: AlertCreate
): Promise<Alert> {
  const response = await fetch(`${API_BASE_URL}/alerts/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleResponse(response);
  return response.json();
}

export async function updateAlert(
  alertId: number,
  data: AlertUpdate
): Promise<Alert> {
  const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  await handleResponse(response);
  return response.json();
}

export async function deleteAlert(alertId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleResponse(response);
}
