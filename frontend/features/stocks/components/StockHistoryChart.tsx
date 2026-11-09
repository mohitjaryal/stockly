
"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  HistogramSeries,
  createChart,
  type UTCTimestamp,
} from "lightweight-charts";
import { getStockHistory } from "../services/stockService";

const ranges = [
  { label: "1W", period: "5d" },
  { label: "1M", period: "1mo" },
  { label: "3M", period: "3mo" },
  { label: "1Y", period: "1y" },
];

interface StockHistoryChartProps {
  symbol: string;
}

export default function StockHistoryChart({
  symbol,
}: StockHistoryChartProps) {
  const chartContainer = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState("1mo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!chartContainer.current) return;

    let cancelled = false;

    const chart = createChart(chartContainer.current, {
      autoSize: true,
      layout: {
        background: { color: "#111722" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      rightPriceScale: {
        borderColor: "#263244",
      },
      timeScale: {
        borderColor: "#263244",
        timeVisible: true,
      },
      crosshair: {
        vertLine: { color: "#64748b" },
        horzLine: { color: "#64748b" },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
      visible: false,
    });

    async function loadChart() {
      try {
        setLoading(true);
        setError("");

        const candles = await getStockHistory(symbol, "D", period);

        if (cancelled) return;

        candleSeries.setData(
          candles.map((candle) => ({
            time: candle.time as UTCTimestamp,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          }))
        );

        volumeSeries.setData(
          candles.map((candle) => ({
            time: candle.time as UTCTimestamp,
            value: candle.volume,
            color:
              candle.close >= candle.open
                ? "rgba(34, 197, 94, 0.5)"
                : "rgba(239, 68, 68, 0.5)",
          }))
        );

        if (candles.length === 0) {
          setError("No historical data available for this period.");
        }

        chart.timeScale().fitContent();
      } catch {
        if (!cancelled) {
          setError(`Unable to load ${symbol} historical data.`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChart();

    return () => {
      cancelled = true;
      chart.remove();
    };
  }, [symbol, period]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">Historical price</p>
          <p className="mt-1 text-sm font-medium text-white">{symbol}</p>
        </div>

        <div className="flex items-center gap-2">
          {ranges.map((range) => (
            <button
              key={range.label}
              onClick={() => setPeriod(range.period)}
              className={`rounded-md px-3 py-2 text-xs transition-colors ${
                period === range.period
                  ? "bg-emerald-400/15 text-emerald-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="mb-2 text-xs text-slate-500">Loading chart...</p>
      )}

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      <div ref={chartContainer} className="h-90 w-full" />
    </div>
  );
}
