
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/features/auth/services/authService";

const stocks = [
  { symbol: "RELIANCE", exchange: "NSE", price: "₹1,482.60", change: "+1.84%", up: true },
  { symbol: "TCS", exchange: "NSE", price: "₹3,124.50", change: "+0.92%", up: true },
  { symbol: "HDFCBANK", exchange: "NSE", price: "₹964.25", change: "-0.38%", up: false },
  { symbol: "NVDA", exchange: "NASDAQ", price: "$186.40", change: "+2.41%", up: true },
  { symbol: "AAPL", exchange: "NASDAQ", price: "$274.20", change: "+0.76%", up: true },
];

function Logo() {
  return (
    <Link href="/" aria-label="Stockly home" className="inline-flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-xl font-bold text-[#07130f]">
        S
      </span>
      <span className="text-xl font-semibold tracking-tight text-white">
        stockly<span className="text-emerald-400">.</span>
      </span>
    </Link>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem("stockly_token", data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page min-h-svh bg-[#080d16] text-white">
      <div className="login-grid-bg pointer-events-none fixed inset-0 opacity-40" />

      <div className="relative mx-auto grid min-h-svh w-full max-w-[1600px] lg:grid-cols-[1.05fr_0.95fr]">

        {/* Desktop market showcase */}
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.07] px-10 py-8 lg:flex xl:px-16">
          <div className="pointer-events-none absolute -left-40 top-28 h-96 w-96 rounded-full bg-emerald-400/8 blur-[110px]" />
          <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-blue-500/8 blur-[120px]" />

          <div className="relative z-10">
            <Logo />
          </div>

          <div className="relative z-10 my-8 max-w-155 login-enter">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3.5 py-2 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              One view. Smarter investing.
            </div>

            <h1 className="text-5xl font-semibold leading-[1.12] tracking-[-0.045em] xl:text-6xl">
              Make every
              <br />
              market move
              <br />
              <span className="bg-linear-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                count.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 xl:text-base">
              Your stocks, watchlists, portfolio and price alerts — all in one
              beautifully clear investing workspace.
            </p>

            <div className="login-float mt-8 max-w-140 rounded-2xl border border-white/10 bg-[#101a27]/90 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium tracking-wider text-slate-400">MARKET OVERVIEW</p>
                  <p className="mt-2 text-lg font-semibold">Your markets, together</p>
                  <p className="mt-1 text-xs text-slate-500">India · United States</p>
                </div>
                <span className="rounded-lg border border-emerald-400/15 bg-emerald-400/8 px-2.5 py-1.5 text-[11px] text-emerald-300">
                  NSE + NASDAQ
                </span>
              </div>

              <div className="relative mt-5 h-28 overflow-hidden rounded-xl bg-linear-to-b from-emerald-400/[0.07] to-transparent">
                <div className="absolute inset-0 flex flex-col justify-between py-2">
                  <div className="border-t border-dashed border-white/[0.07]" />
                  <div className="border-t border-dashed border-white/[0.07]" />
                  <div className="border-t border-dashed border-white/[0.07]" />
                </div>
                <svg viewBox="0 0 520 120" preserveAspectRatio="none" className="relative h-full w-full">
                  <defs>
                    <linearGradient id="loginChartFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity=".24" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 91 C25 85 30 97 55 77 S88 82 110 66 S145 78 166 57 S200 67 222 49 S253 61 278 43 S310 53 332 35 S365 49 388 28 S420 41 443 21 S482 30 520 8 V120 H0Z"
                    fill="url(#loginChartFill)"
                  />
                  <path
                    className="login-chart-line"
                    d="M0 91 C25 85 30 97 55 77 S88 82 110 66 S145 78 166 57 S200 67 222 49 S253 61 278 43 S310 53 332 35 S365 49 388 28 S420 41 443 21 S482 30 520 8"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle className="login-chart-dot" cx="520" cy="8" r="4" fill="#6ee7b7" />
                </svg>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/[0.035] p-3">
                  <p className="text-[10px] text-slate-500">INDIA</p>
                  <p className="mt-1 text-sm font-semibold">NSE / BSE</p>
                </div>
                <div className="rounded-xl bg-white/[0.035] p-3">
                  <p className="text-[10px] text-slate-500">USA</p>
                  <p className="mt-1 text-sm font-semibold">NASDAQ</p>
                </div>
                <div className="rounded-xl bg-white/[0.035] p-3">
                  <p className="text-[10px] text-slate-500">PLATFORM</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-300">Stockly</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-slate-500">
              EXPLORE THE MARKETS
            </p>
            <div className="overflow-hidden rounded-xl border border-white/8 bg-white/2.5">
              <div className="login-ticker-track flex w-max">
                {[...stocks, ...stocks].map((stock, index) => (
                  <div key={`${stock.symbol}-${index}`} className="flex min-w-43.75 items-center gap-3 border-r border-white/[0.07] px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{stock.symbol}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{stock.exchange}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs font-medium">{stock.price}</p>
                      <p className={`mt-0.5 text-[10px] ${stock.up ? "text-emerald-400" : "text-rose-400"}`}>
                        {stock.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-600">
              Illustrative market data · Not live quotes or investment advice
            </p>
          </div>
        </section>

        {/* Login panel */}
        <section className="relative flex min-h-svh flex-col px-5 py-4 sm:px-8 sm:py-6 lg:px-12 xl:px-20">
          <header className="flex items-center justify-between gap-3">
            <div className="lg:hidden">
              <Logo />
            </div>
            <Link
              href="/"
              className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 text-xs font-medium text-slate-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span aria-hidden="true">←</span>
              Back to Home
            </Link>
          </header>

          <div className="mx-auto flex w-full max-w-105 flex-1 flex-col justify-center py-6 sm:py-10 lg:py-8">
            <div className="login-enter">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/8 text-emerald-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path d="M4 18V6m0 12h16M7 14l4-4 3 3 6-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 6h4v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <p className="text-sm font-medium text-emerald-300">Welcome back</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Sign in to Stockly
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Your investing workspace is just one step away.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#101925] px-4 text-base text-white outline-none transition-colors placeholder:text-slate-600 hover:border-white/20 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/8"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#101925] px-4 pr-16 text-base text-white outline-none transition-colors placeholder:text-slate-600 hover:border-white/20 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-400/8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-3 my-auto rounded-md px-2 text-xs font-medium text-slate-400 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" aria-live="polite" className="login-error rounded-xl border border-rose-400/20 bg-rose-400/8 px-4 py-3 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-[#07130f] shadow-lg shadow-emerald-400/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-xl hover:shadow-emerald-400/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#07130f]/30 border-t-[#07130f]" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign in to your account
                    <span aria-hidden="true">↗</span>
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/8" />
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600">
                New to Stockly?
              </span>
              <div className="h-px flex-1 bg-white/8" />
            </div>

            <Link
              href="/signup"
              className="flex min-h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-white/2.5 text-sm font-medium text-slate-200 transition-colors hover:border-emerald-400/30 hover:bg-emerald-400/5 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Create your free account
            </Link>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/2.5 p-3.5">
              <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true">
                <path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-xs font-medium text-slate-300">Your account, your control</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Sign in securely to access your personal Stockly workspace.
                </p>
              </div>
            </div>
          </div>

          <footer className="pb-2 pt-2 text-center text-[10px] text-slate-600">
            © {new Date().getFullYear()} Stockly. Built for smarter investing.
          </footer>
        </section>
      </div>
    </main>
  );
}
