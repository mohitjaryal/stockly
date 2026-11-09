
"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  getAlerts,
  createAlert,
  deleteAlert,
} from "../services/alertService";
import { getStocks, Stock } from "../../stocks/services/stockService";

export default function AlertPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockId, setStockId] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      const [alertData, stockData] = await Promise.all([
        getAlerts(),
        getStocks(),
      ]);

      setAlerts(alertData);
      setStocks(stockData);

      if (stockData.length > 0 && !stockId) {
        setStockId(String(stockData[0].id));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load alerts"
      );
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateAlert() {
    setError("");
    setSuccess("");

    const price = Number(targetPrice);

    if (!stockId || !targetPrice || !Number.isFinite(price) || price <= 0) {
      setError("Please select a stock and enter a valid target price.");
      return;
    }

    try {
      setLoading(true);

      const newAlert = await createAlert({
        stock_id: Number(stockId),
        condition,
        target_price: price,
      });

      setAlerts((current) => [newAlert, ...current]);
      setTargetPrice("");
      setSuccess("Price alert created successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create alert"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAlert(alertId: number) {
    setError("");
    setSuccess("");

    try {
      await deleteAlert(alertId);
      setAlerts((current) =>
        current.filter((alert) => alert.id !== alertId)
      );
      setSuccess("Alert deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete alert"
      );
    }
  }

  function getStockSymbol(id: number) {
    return stocks.find((stock) => stock.id === id)?.symbol ?? `Stock #${id}`;
  }

  return (
    <section className="rounded-xl border border-white/10 bg-[#111827] p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">Price Alerts</h2>
        <p className="mt-1 text-sm text-gray-400">
          Set target prices for your favorite stocks.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-gray-400">Stock</label>
          <select
            value={stockId}
            onChange={(e) => setStockId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0B1220] px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
          >
            {stocks.map((stock) => (
              <option key={stock.id} value={stock.id}>
                {stock.symbol} — {stock.company_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Condition
          </label>
          <select
            value={condition}
            onChange={(e) =>
              setCondition(e.target.value as "above" | "below")
            }
            className="w-full rounded-lg border border-white/10 bg-[#0B1220] px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
          >
            <option value="above">Price goes above</option>
            <option value="below">Price goes below</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm text-gray-400">
            Target Price ($)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="Enter target price"
            className="w-full rounded-lg border border-white/10 bg-[#0B1220] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-500"
          />
        </div>
      </div>

      <button
        onClick={handleCreateAlert}
        disabled={loading || stocks.length === 0}
        className="mt-4 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Alert"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}

      {success && (
        <p className="mt-3 text-sm text-emerald-400">{success}</p>
      )}

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium text-white">Your Alerts</h3>
          <span className="text-xs text-gray-400">
            {alerts.length} total
          </span>
        </div>

        {alerts.length === 0 ? (
          <p className="py-5 text-center text-sm text-gray-500">
            No price alerts yet.
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0B1220] p-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {getStockSymbol(alert.stock_id)}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Price {alert.condition} ${Number(alert.target_price).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs capitalize text-emerald-400">
                    {alert.status}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="rounded-md border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
