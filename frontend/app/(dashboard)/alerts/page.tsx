
"use client";

import AlertPanel from "@/features/alerts/components/AlertPanel";

export default function AlertsPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Workspace / Alerts
        </p>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Price Alerts
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Create and manage price targets for your favorite stocks.
        </p>
      </section>

      <div className="max-w-4xl">
        <AlertPanel />
      </div>
    </div>
  );
}
