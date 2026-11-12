
"use client";

import { useRouter } from "next/navigation";
import WatchlistPanel from "@/features/watchlist/components/WatchlistPanel";

export default function WatchlistPage() {
  const router = useRouter();

  function handleSelectStock(stock: {
    symbol: string;
    company_name: string;
    exchange: string;
  }) {
    router.push(`/stocks?symbol=${encodeURIComponent(stock.symbol)}`);
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Workspace / Watchlist
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          My Watchlist
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Track your favorite stocks and monitor their latest available prices.
        </p>
      </section>

      <div className="max-w-4xl">
        <WatchlistPanel onSelect={handleSelectStock} />
      </div>
    </div>
  );
}
