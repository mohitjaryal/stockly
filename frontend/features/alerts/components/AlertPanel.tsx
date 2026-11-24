
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
} from "../services/alertService";
import { getStocks, Stock } from "../../stocks/services/stockService";

function getCurrency(symbol: string) {
  return symbol.endsWith(".NS") || symbol.endsWith(".BO") ? "₹" : "$";
}

export default function AlertPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockId, setStockId] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notification, setNotification] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCondition, setEditCondition] = useState<"above" | "below">("above");
  const [editPrice, setEditPrice] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const knownAlertStatuses = useRef<Map<number, string>>(new Map());
  const isFirstLoad = useRef(true);

  async function loadData() {
    try {
      const [alertData, stockData] = await Promise.all([
        getAlerts(),
        getStocks(),
      ]);

      setStocks(stockData);

      setStockId((current) =>
        current || (stockData.length ? String(stockData[0].id) : "")
      );

      if (isFirstLoad.current) {
        alertData.forEach((alert) => {
          knownAlertStatuses.current.set(alert.id, alert.status);
        });
        isFirstLoad.current = false;
      } else {
        alertData.forEach((alert) => {
          const previousStatus = knownAlertStatuses.current.get(alert.id);

          if (previousStatus === "active" && alert.status === "triggered") {
            const stock = stockData.find((item) => item.id === alert.stock_id);
            const symbol = stock?.symbol ?? `Stock #${alert.stock_id}`;
            const currency = getCurrency(symbol);

            const message = `${symbol} reached your ${currency}${Number(
              alert.target_price
            ).toFixed(2)} target.`;

            setNotification(message);

            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("Stockly Price Alert", { body: message });
            }
          }

          knownAlertStatuses.current.set(alert.id, alert.status);
        });
      }

      setAlerts(alertData);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    }
  }

  useEffect(() => {
    void loadData();

    const interval = window.setInterval(() => {
      void loadData();
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  async function requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setError("Browser notifications are not supported.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      setSuccess("Browser notifications enabled.");
      setError("");
    } else {
      setError("Browser notification permission was not granted.");
    }
  }

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

      knownAlertStatuses.current.set(newAlert.id, newAlert.status);
      setAlerts((current) => [newAlert, ...current]);
      setTargetPrice("");
      setSuccess("Price alert created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create alert");
    } finally {
      setLoading(false);
    }
  }

  function startEditing(alert: Alert) {
    setEditingId(alert.id);
    setEditCondition(alert.condition);
    setEditPrice(String(alert.target_price));
    setError("");
    setSuccess("");
  }

  async function handleUpdateAlert(alertId: number) {
    const price = Number(editPrice);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid target price.");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      const updated = await updateAlert(alertId, {
        condition: editCondition,
        target_price: price,
      });

      setAlerts((current) =>
        current.map((alert) => alert.id === alertId ? updated : alert)
      );

      knownAlertStatuses.current.set(updated.id, updated.status);
      setEditingId(null);
      setSuccess("Alert updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update alert");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteAlert(alertId: number) {
    setError("");
    setSuccess("");

    try {
      await deleteAlert(alertId);
      knownAlertStatuses.current.delete(alertId);
      setAlerts((current) => current.filter((alert) => alert.id !== alertId));
      setSuccess("Alert deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete alert");
    }
  }

  function getStockSymbol(id: number) {
    return stocks.find((stock) => stock.id === id)?.symbol ?? `Stock #${id}`;
  }

  const selectedSymbol = stocks.find(
    (stock) => String(stock.id) === stockId
  )?.symbol ?? "";

  const selectedCurrency = getCurrency(selectedSymbol);

  const inputClass =
    "w-full min-w-0 rounded-lg border border-white/10 bg-[#0B1220] px-3 py-3 text-sm text-white outline-none focus:border-emerald-500";

  return (
    <section className="w-full min-w-0 rounded-xl border border-white/10 bg-[#111827] p-3 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white">Price Alerts</h2>
          <p className="mt-1 text-sm leading-5 text-gray-400">
            Set target prices for your favorite stocks.
          </p>
        </div>

        {typeof window !== "undefined" && "Notification" in window && (
          <button
            onClick={requestNotificationPermission}
            className="w-full rounded-lg border border-white/10 px-3 py-2.5 text-xs text-gray-300 transition hover:bg-white/5 sm:w-auto"
          >
            Enable Notifications
          </button>
        )}
      </div>

      {notification && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="text-sm font-medium text-emerald-400">
            <span className="mr-2">🔔</span>
            Price alert triggered!
          </p>
          <p className="mt-1 wrap-break-word text-sm text-gray-300">
            {notification}
          </p>
          <button
            onClick={() => setNotification("")}
            className="mt-2 text-xs text-gray-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-2 block text-sm text-gray-400">Stock</label>
          <select
            value={stockId}
            onChange={(e) => setStockId(e.target.value)}
            className={inputClass}
          >
            {stocks.length === 0 && (
              <option value="">No stocks available</option>
            )}
            {stocks.map((stock) => (
              <option key={stock.id} value={stock.id}>
                {stock.symbol} — {stock.company_name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label className="mb-2 block text-sm text-gray-400">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as "above" | "below")}
            className={inputClass}
          >
            <option value="above">Price goes above</option>
            <option value="below">Price goes below</option>
          </select>
        </div>

        <div className="min-w-0 sm:col-span-2">
          <label className="mb-2 block text-sm text-gray-400">
            Target Price ({selectedCurrency})
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="Enter target price"
            className={inputClass}
          />
        </div>
      </div>

      <button
        onClick={handleCreateAlert}
        disabled={loading || stocks.length === 0}
        className="mt-4 w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Creating..." : "Create Alert"}
      </button>

      {error && (
        <p className="mt-3 wrap-break-word text-sm text-red-400">{error}</p>
      )}
      {success && (
        <p className="mt-3 wrap-break-word text-sm text-emerald-400">{success}</p>
      )}

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="font-medium text-white">Your Alerts</h3>
          <span className="shrink-0 text-xs text-gray-400">
            {alerts.length} total
          </span>
        </div>

        {alerts.length === 0 ? (
          <p className="py-5 text-center text-sm text-gray-500">
            No price alerts yet.
          </p>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const currency = getCurrency(getStockSymbol(alert.stock_id));

              return (
                <div
                  key={alert.id}
                  className="min-w-0 rounded-lg border border-white/10 bg-[#0B1220] p-3 sm:p-4"
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="wrap-break-word font-medium text-white">
                        {getStockSymbol(alert.stock_id)}
                      </p>
                      <p className="mt-1 wrap-break-word text-sm text-gray-400">
                        Price {alert.condition} {currency}
                        {Number(alert.target_price).toFixed(2)}
                      </p>
                      <p
                        className={`mt-1 text-xs capitalize ${
                          alert.status === "triggered"
                            ? "text-emerald-400"
                            : "text-gray-400"
                        }`}
                      >
                        {alert.status}
                      </p>
                      {alert.triggered_at && (
                        <p className="mt-1 wrap-break-word text-xs text-gray-500">
                          Triggered:{" "}
                          {new Date(alert.triggered_at).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                      {alert.status === "active" && (
                        <button
                          onClick={() => startEditing(alert)}
                          className="rounded-md border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/5"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="rounded-md border border-red-500/20 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingId === alert.id && (
                    <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
                      <select
                        value={editCondition}
                        onChange={(e) =>
                          setEditCondition(e.target.value as "above" | "below")
                        }
                        className={inputClass}
                      >
                        <option value="above">Price goes above</option>
                        <option value="below">Price goes below</option>
                      </select>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className={inputClass}
                      />

                      <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                        <button
                          onClick={() => handleUpdateAlert(alert.id)}
                          disabled={savingEdit}
                          className="w-full rounded-lg bg-emerald-500 px-3 py-3 text-xs font-medium text-black disabled:opacity-50 sm:w-auto"
                        >
                          {savingEdit ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="w-full rounded-lg border border-white/10 px-3 py-3 text-xs text-gray-300 sm:w-auto"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
