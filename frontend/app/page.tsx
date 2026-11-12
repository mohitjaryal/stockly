
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const features = [
  {
    icon: "◫",
    title: "Portfolio Management",
    tag: "INVESTMENTS",
    description:
      "Track your holdings, manage transactions and understand your portfolio performance in one place.",
    href: "/features/portfolio",
  },
  {
    icon: "↗",
    title: "Stock Directory",
    tag: "DISCOVER",
    description:
      "Explore stocks, discover companies and keep important market information within reach.",
    href: "/features/stocks",
  },
  {
    icon: "☆",
    title: "Smart Watchlist",
    tag: "TRACK",
    description:
      "Build your own watchlist and follow the stocks that matter to your investment journey.",
    href: "/features/watchlist",
  },
  {
    icon: "◎",
    title: "Price Alerts",
    tag: "NOTIFICATIONS",
    description:
      "Set custom price targets and stay informed when stocks reach your selected levels.",
    href: "/features/alerts",
  },
  {
    icon: "◈",
    title: "Mutual Funds",
    tag: "INVEST",
    description:
      "Explore Indian mutual funds, latest NAV and historical performance.",
    href: "/features/mutual-funds",
  },
  {
    icon: "✳",
    title: "Stockly Intelligence",
    tag: "COMING SOON",
    description:
      "Discover our vision for portfolio insights, risk analysis and smarter investment research.",
    href: "/features/intelligence",
  },
];
const stocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: "$273.50",
    change: "+1.84%",
    positive: true,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    price: "$186.25",
    change: "+2.42%",
    positive: true,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet",
    price: "$298.40",
    change: "-0.42%",
    positive: false,
  },
];

function Logo() {
  return (
    <Link
      href="/"
      aria-label="Stockly home"
      className="group inline-flex items-center gap-2.5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[27px] font-black italic leading-none text-[#07110e] shadow-md shadow-emerald-400/15 transition duration-300 group-hover:scale-105">
        S
      </span>

      <span className="text-[26px] font-bold tracking-[-1.5px] text-white">
        stockly<span className="text-emerald-400">.</span>
      </span>
    </Link>
  );
}
function Reveal({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`stockly-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-emerald-400 sm:text-[11px]">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
      {children}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll(".stockly-reveal");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) =>
        element.classList.add("stockly-visible")
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("stockly-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080d16] text-white selection:bg-emerald-400/30">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080d16]/90 backdrop-blur-2xl">
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-[82px] lg:px-10">
          <Logo />

          <div className="hidden items-center gap-9 text-[13px] font-semibold text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-emerald-400">
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition hover:text-emerald-400"
            >
              How it works
            </a>
            <a href="#about" className="transition hover:text-emerald-400">
              About
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-[#06110d] shadow-lg shadow-emerald-500/15 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              Get started <span className="ml-1">→</span>
            </Link>
          </div>

          <button
            type="button"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-xl text-white transition hover:border-emerald-400/40 md:hidden"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/[0.07] bg-[#0b121d] px-5 py-5 shadow-2xl md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <a
                onClick={closeMenu}
                href="#features"
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
              >
                Features
              </a>
              <a
                onClick={closeMenu}
                href="#how-it-works"
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
              >
                How it works
              </a>
              <a
                onClick={closeMenu}
                href="#about"
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
              >
                About
              </a>

              <div className="my-2 border-t border-white/[0.07]" />

              <Link
                onClick={closeMenu}
                href="/login"
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                Login
              </Link>

              <Link
                onClick={closeMenu}
                href="/signup"
                className="mt-2 rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-bold text-[#06110d]"
              >
                Get started →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:px-10 lg:pb-28 lg:pt-28">
        <div className="pointer-events-none absolute -left-48 top-0 h-[450px] w-[450px] rounded-full bg-emerald-500/[0.10] blur-[130px]" />
        <div className="pointer-events-none absolute -right-40 top-20 h-[450px] w-[450px] rounded-full bg-blue-500/[0.07] blur-[140px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          <div className="stockly-hero-content">
            <SectionLabel>YOUR INVESTMENT WORKSPACE</SectionLabel>

            <h1 className="max-w-2xl text-[43px] font-extrabold leading-[1.1] tracking-[-0.055em] sm:text-6xl lg:text-[68px]">
              Your investments.
              <br />
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                One smarter view.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-7 text-slate-400 sm:mt-7 sm:text-lg sm:leading-8">
              Everything you need to organise your investment journey. Track
              your portfolio, discover stocks, follow the market and stay
              informed — all from one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row sm:mt-9">
              <Link
                href="/signup"
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-emerald-500 px-6 py-4 text-center text-sm font-bold text-[#06110d] shadow-xl shadow-emerald-500/20 transition duration-300 hover:-translate-y-1 hover:bg-emerald-400"
              >
                Create your free account <span className="ml-2">→</span>
              </Link>

              <a
                href="#features"
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
              >
                Explore Stockly
              </a>
            </div>

            {/* ORIGINAL SOCIAL PROOF */}
            <div className="mt-10 flex items-center gap-3 sm:mt-12">
              <div className="flex -space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#080d16] bg-emerald-400 text-xs font-extrabold text-[#07120f]">
                  S
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#080d16] bg-blue-400 text-xs font-extrabold text-[#07120f]">
                  I
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#080d16] bg-amber-400 text-xs font-extrabold text-[#07120f]">
                  M
                </div>
              </div>

              <span className="text-xs font-medium text-slate-400 sm:text-sm">
                One platform for your investment journey
              </span>
            </div>
          </div>

          {/* DASHBOARD PREVIEW */}
          <Reveal className="relative mx-auto w-full max-w-[570px] lg:justify-self-end">
            <div className="pointer-events-none absolute -inset-8 rounded-full bg-emerald-500/[0.10] blur-[90px]" />

            <div className="stockly-float relative overflow-hidden rounded-2xl border border-white/10 bg-[#101925] p-4 shadow-2xl shadow-black/40 sm:rounded-3xl sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 font-bold text-emerald-400">
                    S
                  </div>
                  <span className="text-sm font-bold text-white">
                    Stockly Dashboard
                  </span>
                </div>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-400">
                  PREVIEW
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-[#151f2c] p-3.5 sm:rounded-2xl sm:p-4">
                  <p className="text-[11px] text-slate-500 sm:text-xs">
                    Portfolio value
                  </p>
                  <p className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                    $24,850
                  </p>
                  <p className="mt-2 text-xs font-semibold text-emerald-400">
                    ↗ +12.8%
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-[#151f2c] p-3.5 sm:rounded-2xl sm:p-4">
                  <p className="text-[11px] text-slate-500 sm:text-xs">
                    Total holdings
                  </p>
                  <p className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                    12
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Across your portfolio
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-white/[0.06] bg-[#151f2c] p-4 sm:mt-4 sm:rounded-2xl sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Portfolio performance
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                      Illustrative monthly overview
                    </p>
                  </div>

                  <span className="rounded-lg bg-emerald-400/10 px-2.5 py-1.5 text-xs font-bold text-emerald-400">
                    +8.42%
                  </span>
                </div>

                <div className="mt-5 h-28 w-full sm:h-36">
                  <svg
                    viewBox="0 0 480 145"
                    className="h-full w-full"
                    preserveAspectRatio="none"
                    aria-label="Illustrative portfolio growth chart"
                  >
                    <defs>
                      <linearGradient
                        id="stocklyArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#34d399"
                          stopOpacity=".25"
                        />
                        <stop
                          offset="100%"
                          stopColor="#34d399"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    {[35, 75, 115].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="480"
                        y2={y}
                        stroke="#ffffff"
                        strokeOpacity=".06"
                        strokeDasharray="4 5"
                      />
                    ))}

                    <path
                      d="M0 115 C30 105 38 119 62 95 S98 103 120 79 S150 91 180 67 S220 82 244 54 S280 72 310 44 S345 55 370 30 S405 47 430 22 S460 28 480 10 L480 145 L0 145 Z"
                      fill="url(#stocklyArea)"
                    />

                    <path
                      className="stockly-chart-line"
                      d="M0 115 C30 105 38 119 62 95 S98 103 120 79 S150 91 180 67 S220 82 244 54 S280 72 310 44 S345 55 370 30 S405 47 430 22 S460 28 480 10"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    <circle cx="480" cy="10" r="5" fill="#34d399" />
                  </svg>
                </div>

                <div className="mt-3 flex justify-between text-[9px] font-medium text-slate-500 sm:text-[10px]">
                  <span>WEEK 01</span>
                  <span>WEEK 02</span>
                  <span>WEEK 03</span>
                  <span>WEEK 04</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Market watch</h3>
                <span className="text-[10px] text-slate-500">Sample data</span>
              </div>

              <div className="mt-2 divide-y divide-white/[0.06]">
                {stocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-[10px] font-bold text-slate-300">
                        {stock.symbol.slice(0, 2)}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200">
                          {stock.symbol}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {stock.name}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-white">
                        {stock.price}
                      </p>
                      <p
                        className={`mt-1 text-xs font-semibold ${
                          stock.positive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {stock.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-center text-[9px] text-slate-600">
                Illustrative preview. Not live market data.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="border-y border-white/[0.06] bg-[#0b121d] px-5 py-20 sm:px-8 sm:py-24 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionLabel>BUILT FOR YOUR JOURNEY</SectionLabel>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Everything you need.
              <span className="block text-emerald-400">
                All in one place.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
              From tracking your holdings to discovering new opportunities,
              Stockly brings your investment tools together.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 70}>
                <div className="group h-full rounded-2xl border border-white/[0.07] bg-[#101925] p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-[#14212b] hover:shadow-xl hover:shadow-emerald-950/20 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.08] text-2xl text-emerald-400 transition duration-300 group-hover:rotate-3 group-hover:bg-emerald-500 group-hover:text-[#06110d]">
                      {feature.icon}
                    </div>

                    <span className="text-[9px] font-bold tracking-[0.16em] text-slate-600">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-white sm:text-xl">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {feature.description}
                  </p>

                  <Link
                    href={feature.href}
                    className="mt-5 inline-flex items-center text-sm font-semibold text-emerald-400 transition duration-300 hover:text-emerald-300 group-hover:translate-x-1"
                  >
                    Discover more <span className="ml-1">→</span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="px-5 py-20 sm:px-8 sm:py-24 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionLabel>GET STARTED IN MINUTES</SectionLabel>

            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Less complexity.
              <span className="block text-emerald-400">More clarity.</span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-8 text-slate-400 sm:text-base">
              Your investment workspace should be simple to use. Get started
              in a few easy steps and keep everything organised.
            </p>

            <div className="mt-9 space-y-7 sm:mt-10">
              {[
                [
                  "01",
                  "Create your account",
                  "Set up your personal Stockly workspace.",
                ],
                [
                  "02",
                  "Organise your investments",
                  "Add transactions, build watchlists and set price alerts.",
                ],
                [
                  "03",
                  "Follow your progress",
                  "Review holdings and keep an eye on the stocks you follow.",
                ],
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-4 sm:gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-sm font-bold text-emerald-400 sm:h-12 sm:w-12">
                    {number}
                  </div>

                  <div>
                    <h3 className="font-bold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal id="about" className="relative">
            <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-[90px]" />

            <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#101925] p-7 sm:p-10 lg:p-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-xl font-black text-[#06110d]">
                S
              </div>

              <p className="mt-8 text-[10px] font-bold tracking-[0.2em] text-emerald-400 sm:text-xs">
                THE STOCKLY EXPERIENCE
              </p>

              <h3 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                A clearer view of your investment journey.
              </h3>

              <p className="mt-5 text-sm leading-8 text-slate-400 sm:text-base">
                Stockly brings your portfolio, stocks, watchlists, alerts and
                market tools into one organised experience — so you can focus
                on understanding your investments.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:p-5">
                  <p className="text-2xl font-bold text-emerald-400">01</p>
                  <p className="mt-2 text-sm font-semibold text-slate-200">
                    One workspace
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your investments together
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 sm:p-5">
                  <p className="text-2xl font-bold text-emerald-400">02</p>
                  <p className="mt-2 text-sm font-semibold text-slate-200">
                    More clarity
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Tools to stay organised
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-emerald-300/20 bg-[#10251f] px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 max-w-full -translate-x-1/2 rounded-full bg-emerald-400/15 blur-[100px]" />

            <div className="relative">
              <SectionLabel>YOUR JOURNEY STARTS HERE</SectionLabel>

              <h2 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Bring your investments together.
                <span className="block text-emerald-400">
                  Start with Stockly.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Create your workspace and get a clearer view of the investments
                you follow.
              </p>

              <Link
                href="/signup"
                className="mt-8 inline-flex min-h-13 items-center justify-center rounded-xl bg-emerald-500 px-8 py-4 text-sm font-bold text-[#06110d] shadow-xl shadow-emerald-500/15 transition duration-300 hover:-translate-y-1 hover:bg-emerald-400"
              >
                Get started for free <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.07] bg-[#060a11] px-5 pb-8 pt-14 sm:px-8 sm:pt-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12">
          <div>
            <Logo />

            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-500">
              A clearer view of your investment journey. Your stocks,
              portfolio and market tools — organised in one place.
            </p>

            <Link
              href="/signup"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
            >
              Get started <span>→</span>
            </Link>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Explore</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-slate-500">
              <a
                href="#features"
                className="transition hover:text-emerald-400"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="transition hover:text-emerald-400"
              >
                How it works
              </a>
              <a href="#about" className="transition hover:text-emerald-400">
                About Stockly
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Your account</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-slate-500">
              <Link
                href="/login"
                className="transition hover:text-emerald-400"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="transition hover:text-emerald-400"
              >
                Create account
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Get started</h3>

            <p className="mt-5 text-sm leading-7 text-slate-500">
              Start organising your investment journey with Stockly.
            </p>

            <Link
              href="/signup"
              className="mt-4 inline-flex rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-2.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-400/15"
            >
              Join Stockly →
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-4 border-t border-white/6 pt-6 text-xs leading-6 text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Stockly. All rights reserved.
          </p>

          <p className="max-w-xl md:text-center">
            Stockly is an investment tracking platform, not financial or
            investment advice. Dashboard figures are illustrative.
          </p>

          <p className="whitespace-nowrap">
            Designed &amp; Developed by{" "}
            <a
              href="https://mohitjaryal.online"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-400 transition hover:text-emerald-300"
            >
              Mohit Jaryal ↗
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
