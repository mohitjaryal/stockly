
"use client";

import { useEffect, useState } from "react";
import { getStockPrice, type StockPrice } from "../services/stockService";

interface StockPriceCardsProps {
  symbol: string;
}

export default function StockPriceCards({
  symbol,
}: StockPriceCardsProps) {
  const [stock, setStock] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPrice() {
      setLoading(true);
      setError("");

      try {
        const data = await getStockPrice(symbol);

        if (!cancelled) {
          setStock(data);
        }
      } catch {
        if (!cancelled) {
          setStock(null);
          setError(`Unable to load ${symbol} price.`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPrice();

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-[#111722] p-5">
        <p className="text-sm text-slate-400">
          Loading {symbol} market data...
        </p>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-[#111722] p-5">
        <p className="text-sm text-red-400">
          {error || "Stock data unavailable."}
        </p>
      </div>
    );
  }

  const price = Number(stock.price);
  const open = Number(stock.open_price);
  const high = Number(stock.high_price);
  const low = Number(stock.low_price);

  const change = price - open;
  const percentage = open ? (change / open) * 100 : 0;
  const positive = change >= 0;

  const details = [
    { label: "Open", value: `$${open.toFixed(2)}` },
    { label: "High", value: `$${high.toFixed(2)}` },
    { label: "Low", value: `$${low.toFixed(2)}` },
    {
      label: "Volume",
      value:
        stock.volume != null
          ? stock.volume.toLocaleString("en-US")
          : "—",
    },
  ];

  return (
    <section className="rounded-lg border border-white/[0.08] bg-[#111722] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{symbol}</p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            ${price.toFixed(2)}
          </p>

          <p
            className={`mt-2 text-sm ${
              positive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {positive ? "+" : ""}
            {change.toFixed(2)} ({positive ? "+" : ""}
            {percentage.toFixed(2)}%)
            <span className="ml-2 text-xs text-slate-500">
              vs. open
            </span>
          </p>
        </div>

        <span className="rounded border border-white/10 px-2.5 py-1 text-[11px] text-slate-400">
          Latest available
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-5 sm:grid-cols-4">
        {details.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="mt-2 text-sm font-medium text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs text-slate-500">
        Updated: {new Date(stock.recorded_at).toLocaleString()}
      </p>
    </section>
  );
}
