
"use client";

import AlertPanel from "@/features/alerts/components/AlertPanel";

export default function AlertsPage() {
  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <section className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.16em]">
          Workspace / Alerts
        </p>

        <h1 className="mt-2 text-xl font-semibold tracking-tight text-white sm:mt-3 sm:text-2xl">
          Price Alerts
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
          Create and manage price targets for your favorite stocks.
        </p>
      </section>

      <section className="w-full min-w-0 max-w-4xl">
        <AlertPanel />
      </section>
    </div>
  );
}
