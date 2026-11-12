
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/features/auth/services/authService";

const marketStocks = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: "₹1,462.80", change: "+1.84%", positive: true },
  { symbol: "TCS", name: "Tata Consultancy", price: "₹3,284.50", change: "+0.92%", positive: true },
  { symbol: "INFY", name: "Infosys Limited", price: "₹1,542.20", change: "-0.38%", positive: false },
];

function StocklyLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-lg font-black text-slate-950">
        S
      </span>
      <span className="text-xl font-bold tracking-tight text-white">
        stockly<span className="text-emerald-400">.</span>
      </span>
    </Link>
  );
}

function DashboardPreview() {
  return (
    <div className="signup-preview">
      <div className="signup-dashboard">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold text-white">Stockly Dashboard</span>
          </div>
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-slate-400">
            DEMO PREVIEW
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
            <p className="text-[11px] text-slate-400">Portfolio value</p>
            <p className="mt-1 text-xl font-bold text-white">$24,850.60</p>
            <p className="mt-1 text-xs font-medium text-emerald-400">↗ 8.42% this month</p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
            <p className="text-[11px] text-slate-400">Today's return</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">+$384.20</p>
            <p className="mt-1 text-xs text-slate-500">+1.56% today</p>
          </div>
        </div>

        <div className="mx-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Portfolio performance</p>
              <p className="mt-1 text-[11px] text-slate-500">Your investment overview</p>
            </div>
            <span className="rounded-lg bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-400">
              +12.8%
            </span>
          </div>

          <div className="mt-4 h-[130px] w-full">
            <svg
              viewBox="0 0 520 130"
              className="h-full w-full"
              preserveAspectRatio="none"
              fill="none"
              aria-label="Illustrative portfolio performance chart"
              role="img"
            >
              <defs>
                <linearGradient id="signupChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity=".24" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 60, 95].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="520"
                  y2={y}
                  stroke="white"
                  strokeOpacity=".07"
                  strokeDasharray="4 5"
                />
              ))}
              <path
                d="M0 104 C25 100 35 83 60 91 S100 78 125 84 S160 58 185 70 S220 60 245 66 S280 35 305 48 S345 37 370 43 S410 19 435 31 S485 13 520 8 V130 H0 Z"
                fill="url(#signupChartFill)"
              />
              <path
                d="M0 104 C25 100 35 83 60 91 S100 78 125 84 S160 58 185 70 S220 60 245 66 S280 35 305 48 S345 37 370 43 S410 19 435 31 S485 13 520 8"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="520" cy="8" r="4" fill="#34d399" />
            </svg>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-500">
            <span>Mon</span><span>Tue</span><span>Wed</span>
            <span>Thu</span><span>Fri</span><span>Today</span>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Market watch</p>
            <span className="text-[10px] text-slate-500">Sample data</span>
          </div>
          <div className="space-y-1">
            {marketStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 transition hover:bg-white/[0.04]"
              >
                <div>
                  <p className="text-xs font-semibold text-white">{stock.symbol}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-white">{stock.price}</p>
                  <p className={`mt-0.5 text-[10px] ${stock.positive ? "text-emerald-400" : "text-rose-400"}`}>
                    {stock.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[10px] text-slate-500">
        Illustrative dashboard preview · Not live market data
      </p>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordScore = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const passwordLabel = ["", "Weak", "Fair", "Good", "Strong"];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await signup(name.trim(), email.trim(), password);
      setSuccess("Account created! Redirecting you to login...");
      window.setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100svh] bg-[#080d18] text-white">
      <nav className="flex h-[72px] items-center justify-between border-b border-white/[0.07] px-5 sm:px-8 lg:px-12">
        <StocklyLogo />
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-sm text-slate-300 transition hover:border-emerald-400/50 hover:bg-white/[0.04] hover:text-white"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Home</span>
        </Link>
      </nav>

      <div className="mx-auto grid min-h-[calc(100svh-72px)] max-w-[1440px] grid-cols-1 items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:px-14 lg:py-12">
        <section className="hidden lg:block">
          <div className="mb-7 max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Your smarter investment workspace
            </div>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
              Everything you invest in,
              <span className="block text-emerald-400">all in one place.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">
              Track your portfolio, keep an eye on stocks, and set price alerts
              with a clearer view of your investments.
            </p>
          </div>
          <DashboardPreview />
        </section>

        <section className="mx-auto w-full max-w-[440px]">
          <div className="mb-7 text-center lg:text-left">
            <div className="mb-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 lg:hidden">
              Your investment workspace
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Start managing your investments with Stockly.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/[0.09] bg-[#101827] p-5 shadow-2xl shadow-black/20 sm:p-7"
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="mb-2 block text-sm font-medium text-slate-300">
                  Full name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 pr-16 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 text-xs font-medium text-slate-400 transition hover:text-emerald-400"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-3">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            passwordScore >= level
                              ? passwordScore <= 1
                                ? "bg-rose-400"
                                : passwordScore === 2
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Password strength: {passwordLabel[passwordScore]}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-sm text-rose-300">
                {error}
              </div>
            )}

            {success && (
              <div role="status" className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5 text-sm text-emerald-300">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : success ? "Account created" : "Create account"}
              {!loading && !success && <span aria-hidden="true">→</span>}
            </button>

            <p className="mt-5 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-400 transition hover:text-emerald-300">
                Log in
              </Link>
            </p>
          </form>

          <p className="mt-5 text-center text-[11px] leading-5 text-slate-500">
            By creating an account, you agree to use Stockly responsibly.
            Your investments always remain your decision.
          </p>
        </section>

        <div className="lg:hidden">
          <DashboardPreview />
        </div>
      </div>
    </main>
  );
}
