
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface MutualFundSearchResult {
  schemeCode: number;
  schemeName: string;
}

export interface MutualFundNAV {
  scheme_code: number;
  scheme_name: string;
  fund_house: string;
  scheme_type: string;
  scheme_category: string;
  latest_nav: number;
  nav_date: string;
  currency: string;
  nav_age_days: number;
  is_stale: boolean;
  data_status: string;
}

export interface NAVRecord {
  date: string;
  nav: number;
}

export interface NAVHistory {
  scheme_code: number;
  scheme_name: string;
  count: number;
  history: NAVRecord[];
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Something went wrong");
  }

  return response;
}

export async function searchMutualFunds(
  query: string
): Promise<MutualFundSearchResult[]> {
  const params = new URLSearchParams({ q: query });

  const response = await fetch(
    `${API_BASE_URL}/mutual-funds/search?${params.toString()}`,
    { cache: "no-store" }
  );

  await handleResponse(response);

  const data = await response.json();
  return data.results ?? [];
}

export async function getLatestNAV(
  schemeCode: number
): Promise<MutualFundNAV> {
  const response = await fetch(
    `${API_BASE_URL}/mutual-funds/${schemeCode}/nav`,
    { cache: "no-store" }
  );

  await handleResponse(response);
  return response.json();
}

export async function getNAVHistory(
  schemeCode: number,
  fromDate?: string
): Promise<NAVHistory> {
  const params = new URLSearchParams();

  if (fromDate) {
    params.set("from_date", fromDate);
  }

  const query = params.toString();

  const response = await fetch(
    `${API_BASE_URL}/mutual-funds/${schemeCode}/history${
      query ? `?${query}` : ""
    }`,
    { cache: "no-store" }
  );

  await handleResponse(response);
  return response.json();
}
