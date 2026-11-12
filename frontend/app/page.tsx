
import Link from "next/link";

const features = [
  {
    icon: "◫",
    title: "Portfolio Tracking",
    description:
      "Track your investments, monitor portfolio performance and understand your gains in one place.",
  },
  {
    icon: "↗",
    title: "Stock Directory",
    description:
      "Explore stocks, discover opportunities and stay informed about the companies you follow.",
  },
  {
    icon: "☆",
    title: "Smart Watchlist",
    description:
      "Keep your favourite stocks close and follow the market movements that matter to you.",
  },
  {
    icon: "◎",
    title: "Price Alerts",
    description:
      "Set your target prices and get notified when stocks reach the levels you care about.",
  },
  {
    icon: "◈",
    title: "Mutual Funds",
    description:
      "Explore mutual funds and keep your investment journey organised.",
  },
  {
    icon: "✳",
    title: "Stockly Intelligence",
    description:
      "Get useful market insights to make more informed investment decisions.",
  },
];

const marketData = [
  { symbol: "AAPL", name: "Apple Inc.", price: "$273.50", change: "+1.84%" },
  { symbol: "NVDA", name: "NVIDIA", price: "$186.25", change: "+2.42%" },
  { symbol: "GOOGL", name: "Alphabet", price: "$298.40", change: "+1.16%" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl font-black text-white">
        S
      </div>
      <span className="text-2xl font-bold tracking-tight text-slate-900">
        stockly<span className="text-emerald-600">.</span>
      </span>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-10">
          <Logo />

          <div className="hidden items-center gap-9 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-emerald-600">Features</a>
            <a href="#how-it-works" className="transition hover:text-emerald-600">How it works</a>
            <a href="#about" className="transition hover:text-emerald-600">About</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:block"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              Get started <span className="ml-1">→</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
        <div className="pointer-events-none absolute -right-40 -top-32 h-[550px] w-[550px] rounded-full bg-emerald-100/50 blur-[100px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              YOUR MONEY. YOUR MOVES.
            </div>

            <h1 className="max-w-2xl text-5xl font-bold leading-[1.12] tracking-tight text-slate-950 sm:text-6xl lg:text-[68px]">
              Invest smarter.
              <br />
              Track better.
              <br />
              <span className="text-emerald-600">Grow with Stockly.</span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-500">
              Your investments deserve a better view. Track stocks, manage your
              portfolio, follow the market and make more informed decisions —
              all in one place.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-emerald-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/20 transition hover:-translate-y-1 hover:bg-emerald-700"
              >
                Start investing smarter <span className="ml-2">→</span>
              </Link>
              <a
                href="#features"
                className="rounded-xl border border-slate-200 px-7 py-4 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                Explore features
              </a>
            </div>

            <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
              <div className="flex -space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-xs font-bold text-emerald-700">S</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-xs font-bold text-blue-700">I</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-100 text-xs font-bold text-amber-700">M</div>
              </div>
              <span>One platform for your investment journey</span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="absolute -inset-5 rounded-[36px] bg-emerald-100/70 blur-2xl" />

            <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/80 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">PORTFOLIO OVERVIEW</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">My Investments</h3>
                </div>
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                  ● Market view
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Portfolio value</p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">$24,850.00</h2>
                  <span className="rounded-lg bg-emerald-100 px-2.5 py-1.5 text-sm font-bold text-emerald-700">+12.8%</span>
                </div>

                <div className="mt-7 h-36 w-full">
                  <svg viewBox="0 0 480 145" className="h-full w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity=".22" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 112 C25 105 35 115 58 92 S90 98 110 77 S145 92 170 66 S205 80 230 56 S270 72 295 42 S330 56 355 30 S395 47 420 20 S455 32 480 8 L480 145 L0 145 Z" fill="url(#chartFill)" />
                    <path d="M0 112 C25 105 35 115 58 92 S90 98 110 77 S145 92 170 66 S205 80 230 56 S270 72 295 42 S330 56 355 30 S395 47 420 20 S455 32 480 8" fill="none" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="mt-4 flex justify-between text-xs font-medium text-slate-400">
                  <span>1D</span><span>1W</span><span className="rounded-md bg-emerald-600 px-2 py-1 text-white">1M</span><span>3M</span><span>1Y</span><span>ALL</span>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between">
                <h4 className="font-bold text-slate-900">Your watchlist</h4>
                <span className="text-xs font-semibold text-emerald-600">View all →</span>
              </div>

              <div className="mt-3 divide-y divide-slate-100">
                {marketData.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-bold text-slate-800">{stock.symbol}</p>
                      <p className="mt-1 text-xs text-slate-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{stock.price}</p>
                      <p className="mt-1 text-xs font-bold text-emerald-600">{stock.change}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-center text-[10px] text-slate-400">
                Illustrative dashboard preview. Values are not live market data.
              </p>
            </div>

            <div className="absolute -bottom-7 -left-5 hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:block">
              <p className="text-xs text-slate-400">Stay in control</p>
              <p className="mt-1 font-bold text-slate-900">Your investments, organised.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-600">Everything in one place</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              A smarter way to manage your money.
            </h2>
            <p className="mt-5 leading-7 text-slate-500">
              All the essential tools you need to follow the market and manage your investment journey.
            </p>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="group rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl font-bold text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-600">Simple by design</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Your investment journey, made simpler.
              </h2>
              <p className="mt-5 max-w-lg leading-8 text-slate-500">
                Spend less time managing scattered information and more time understanding your investments.
              </p>

              <div className="mt-10 space-y-8">
                {[
                  ["01", "Create your account", "Sign up and get started with your personal investment workspace."],
                  ["02", "Build your portfolio", "Add your stock transactions and organise your watchlist."],
                  ["03", "Track your progress", "Monitor holdings, follow price movements and explore insights."],
                ].map(([number, title, description]) => (
                  <div key={number} className="flex gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700">{number}</div>
                    <div>
                      <h3 className="font-bold text-slate-900">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="about" className="rounded-3xl bg-slate-950 p-8 text-white sm:p-12">
              <div className="text-sm font-bold uppercase tracking-[.2em] text-emerald-400">The Stockly approach</div>
              <h3 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl">
                Clarity first. Better decisions follow.
              </h3>
              <p className="mt-5 leading-8 text-slate-400">
                Stockly brings your portfolio, watchlist, alerts and market tools together in one thoughtfully designed experience.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-3xl font-bold text-emerald-400">01</div>
                  <p className="mt-2 text-sm text-slate-300">One organised workspace</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-3xl font-bold text-emerald-400">02</div>
                  <p className="mt-2 text-sm text-slate-300">Tools for your journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-emerald-600 px-7 py-16 text-center text-white sm:px-14 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-emerald-100">Your next step starts here</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Make your investment journey more organised.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-emerald-50">
            Get your own investment workspace with Stockly. Start exploring today.
          </p>
          <Link
            href="/signup"
            className="mt-9 inline-flex rounded-xl bg-white px-8 py-4 text-sm font-bold text-emerald-700 shadow-xl transition hover:-translate-y-1 hover:bg-emerald-50"
          >
            Get started for free <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-12 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-slate-400">A clearer view of your investment journey.</p>
          </div>
          <div className="flex flex-wrap gap-7 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-emerald-600">Features</a>
            <a href="#about" className="hover:text-emerald-600">About</a>
            <Link href="/login" className="hover:text-emerald-600">Login</Link>
            <Link href="/signup" className="hover:text-emerald-600">Sign up</Link>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-100 pt-6 text-xs leading-6 text-slate-400">
          © {new Date().getFullYear()} Stockly. All rights reserved. Stockly is an investment tracking platform, not investment advice. Market figures shown in the preview are illustrative.
        </div>
      </footer>
    </main>
  );
}
