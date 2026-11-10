
export default function IntelligencePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Stockly / Intelligence
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Stockly Intelligence
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Understand your investments beyond market prices.
        </p>
      </section>

      <section className="rounded-lg border border-white/8 bg-[#111722] p-8">
        <div className="text-2xl text-emerald-400">✧</div>
        <h2 className="mt-4 text-sm font-semibold text-white">
          Your investment intelligence hub
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Analyse stocks and mutual funds together, understand portfolio risk,
          discover sector concentration, identify mutual fund overlap and
          review performance.
        </p>
        <p className="mt-5 text-xs text-slate-500">
          Insights will be based on available market and portfolio data.
          Unsupported predictions will not be shown.
        </p>
      </section>
    </div>
  );
}
