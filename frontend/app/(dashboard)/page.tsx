
const marketStats = [
  { label: "Market status", value: "Awaiting data", detail: "Live market feed" },
  { label: "Watchlist", value: "—", detail: "Tracked stocks" },
  { label: "Price alerts", value: "—", detail: "Active alerts" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Workspace / Overview
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            Market overview
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor your stocks and market activity in one place.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Data will appear when the market feed is connected.
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {marketStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-white/[0.08] bg-[#111722] p-5"
          >
            <p className="text-xs text-slate-400">{stat.label}</p>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-white">
              {stat.value}
            </p>
            <p className="mt-2 text-xs text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-h-[360px] rounded-lg border border-white/[0.08] bg-[#111722] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Stock performance
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Historical price chart
              </p>
            </div>
            <span className="rounded border border-white/10 px-2.5 py-1 text-[11px] text-slate-400">
              1D
            </span>
          </div>

          <div className="flex h-[260px] items-center justify-center">
            <p className="text-sm text-slate-500">
              Connect historical market data to display the chart.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-[#111722] p-5">
          <h2 className="text-sm font-semibold text-white">Watchlist</h2>
          <p className="mt-1 text-xs text-slate-500">
            Your tracked stocks
          </p>

          <div className="mt-8 border-t border-white/[0.08] pt-6 text-center">
            <p className="text-sm text-slate-400">
              No watchlist data yet
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Your tracked stocks will appear here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
