import Link from "next/link";
import { notFound } from "next/navigation";

type Guide = {
  name: string;
  eyebrow: string;
  headline: string;
  description: string;
  status: string;
  statusColor: string;
  what: string;
  benefits: string[];
  steps: { title: string; description: string }[];
  note?: string;
  appHref: string;
};

const guides: Record<string, Guide> = {
  portfolio: {
    name: "Portfolio Management",
    eyebrow: "INVESTMENT TRACKING",
    headline: "Your entire portfolio. One clear view.",
    description:
      "Track your stock investments, record BUY and SELL transactions, and understand how your holdings are performing.",
    status: "Available",
    statusColor: "text-emerald-400",
    what:
      "Stockly Portfolio helps you maintain a record of your investments. Add transactions with quantity, price and date, then review your holdings and portfolio summary.",
    benefits: [
      "Record BUY and SELL transactions.",
      "View your current holdings and quantities.",
      "Track average purchase price and remaining cost basis.",
      "Review current value and unrealized profit or loss.",
      "See your transaction history.",
    ],
    steps: [
      {
        title: "Open your portfolio",
        description: "Sign in to Stockly and open Portfolio from the dashboard.",
      },
      {
        title: "Record a transaction",
        description:
          "Choose a stock, select BUY or SELL, and enter quantity, price and transaction date.",
      },
      {
        title: "Review your holdings",
        description:
          "Check your quantities, average cost, current value and profit or loss.",
      },
    ],
    note:
      "Stockly records investment transactions. It does not place buy or sell orders with a broker.",
    appHref: "/portfolio",
  },

  stocks: {
    name: "Stock Directory",
    eyebrow: "EXPLORE THE MARKET",
    headline: "Discover stocks worth keeping an eye on.",
    description:
      "Explore the stock directory, find companies and add stocks to your personal watchlist.",
    status: "Available",
    statusColor: "text-emerald-400",
    what:
      "The Stock Directory gives you a place to search and explore available stocks before deciding which ones you want to track.",
    benefits: [
      "Search and explore available stocks.",
      "Find stocks across supported markets.",
      "Add stocks to your watchlist.",
      "Keep your stock research organised in one place.",
    ],
    steps: [
      {
        title: "Open Stock Directory",
        description: "Sign in and select Stocks from the dashboard.",
      },
      {
        title: "Find a company",
        description: "Search the directory for the stock you want to explore.",
      },
      {
        title: "Add it to your watchlist",
        description: "Use the watchlist action to save a stock for tracking.",
      },
    ],
    appHref: "/stocks",
  },

  watchlist: {
    name: "Smart Watchlist",
    eyebrow: "YOUR PERSONAL TRACKER",
    headline: "Keep your favourite stocks close.",
    description:
      "Build a personal list of stocks you want to follow and keep your market research organised.",
    status: "Available",
    statusColor: "text-emerald-400",
    what:
      "Your Watchlist stores the stocks you choose to follow, separately from the investments you actually own in your portfolio.",
    benefits: [
      "Add stocks you want to monitor.",
      "Remove stocks when they are no longer relevant.",
      "Keep your selected stocks together.",
      "Access your saved watchlist across sessions.",
    ],
    steps: [
      {
        title: "Find a stock",
        description: "Open Stock Directory and search for a company.",
      },
      {
        title: "Save it",
        description: "Add the stock to your watchlist.",
      },
      {
        title: "Review your list",
        description: "Open Watchlist whenever you want to revisit saved stocks.",
      },
    ],
    note:
      "A watchlist is for tracking stocks. Adding a stock does not mean you own it.",
    appHref: "/watchlist",
  },

  alerts: {
    name: "Price Alerts",
    eyebrow: "STAY INFORMED",
    headline: "Let your target prices do the watching.",
    description:
      "Set price conditions for stocks and let Stockly check whether your targets have been reached.",
    status: "Available",
    statusColor: "text-emerald-400",
    what:
      "Price Alerts lets you create an above-price or below-price condition for a stock. Stockly periodically checks active alerts and marks matching alerts as triggered.",
    benefits: [
      "Set alerts when a stock goes above a target price.",
      "Set alerts when a stock falls below a target price.",
      "View active and triggered alerts.",
      "Edit or delete your alerts.",
      "Receive in-app notification updates when alerts trigger.",
    ],
    steps: [
      {
        title: "Choose a stock",
        description: "Open Price Alerts and select the stock you want to monitor.",
      },
      {
        title: "Set your target",
        description:
          "Choose Above or Below and enter the price that matters to you.",
      },
      {
        title: "Track the alert",
        description:
          "Stockly checks active alerts periodically. Review the alert status in your dashboard.",
      },
    ],
    note:
      "Alerts are checked periodically, not tick-by-tick. Market data availability and provider delays may affect trigger timing.",
    appHref: "/alerts",
  },

  "mutual-funds": {
    name: "Mutual Fund Explorer",
    eyebrow: "INDIAN MUTUAL FUNDS",
    headline: "Explore mutual funds beyond their names.",
    description:
      "Search Indian mutual fund schemes, review their latest available NAV and explore historical NAV performance.",
    status: "Available",
    statusColor: "text-emerald-400",
    what:
      "Stockly Mutual Funds helps you research Indian mutual fund schemes using NAV data. You can inspect the latest NAV, fund house, scheme category and historical NAV chart.",
    benefits: [
      "Search funds by scheme name or fund house.",
      "View the latest available NAV and its date.",
      "Check fund house, scheme type and category.",
      "Explore historical NAV charts across 1M, 3M, 6M, 1Y and ALL ranges.",
      "See data freshness indicators and stale-data warnings.",
    ],
    steps: [
      {
        title: "Search for a fund",
        description:
          "Open Mutual Funds and type at least two characters from a scheme name or fund house.",
      },
      {
        title: "Select a scheme",
        description:
          "Choose a matching fund from the search results to load its NAV information.",
      },
      {
        title: "Explore its history",
        description:
          "Review the latest NAV, fund details and historical chart. Change the time range to explore different periods.",
      },
    ],
    note:
      "NAV data is retrieved from MFAPI. Historical NAV does not guarantee future returns. This tool is for research, not investment advice.",
    appHref: "/mutual-funds",
  },

  intelligence: {
    name: "Stockly Intelligence",
    eyebrow: "COMING SOON",
    headline: "A smarter way to understand your investments.",
    description:
      "Our vision is to bring portfolio insights and deeper investment analysis together in one place.",
    status: "Early stage",
    statusColor: "text-amber-400",
    what:
      "Stockly Intelligence is an early-stage area of Stockly. The current dashboard contains an introductory screen describing planned investment analysis capabilities.",
    benefits: [
      "Planned portfolio risk analysis.",
      "Planned sector concentration insights.",
      "Planned mutual fund overlap analysis.",
      "Planned combined stock and mutual fund research.",
      "Insights grounded in available market and portfolio data.",
    ],
    steps: [
      {
        title: "Explore Stockly",
        description: "Use Portfolio, Watchlist, Alerts and Mutual Funds today.",
      },
      {
        title: "Keep your data organised",
        description: "Maintain your portfolio and research in Stockly.",
      },
      {
        title: "Watch this space",
        description: "Intelligence capabilities will be introduced as they become available.",
      },
    ],
    note:
      "The capabilities listed here are planned, not currently available. Stockly does not currently provide AI-generated investment predictions through this section.",
    appHref: "/intelligence",
  },
};

export function generateStaticParams() {
  return Object.keys(guides).map((slug) => ({ slug }));
}

export default async function FeatureGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides[slug];

  if (!guide) notFound();

  return (
    <main className="min-h-screen overflow-hidden bg-[#090d18] text-slate-100">
      <header className="border-b border-white/8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white">
            stockly<span className="text-emerald-400">.</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-sm text-slate-300 transition hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#07110e] transition hover:bg-emerald-300"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative border-b border-white/8">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl px-6 py-20 lg:px-10 lg:py-28">
          <Link
            href="/"
            className="text-sm text-slate-500 transition hover:text-emerald-400"
          >
            ← Back to home
          </Link>

          <p className="mt-12 text-xs font-semibold tracking-[0.2em] text-emerald-400">
            {guide.eyebrow}
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {guide.headline}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            {guide.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#07110e] transition hover:bg-emerald-300"
            >
              Get started →
            </Link>
            <span className={`text-sm font-medium ${guide.statusColor}`}>
              ● {guide.status}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-emerald-400">
            THE OVERVIEW
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            What is {guide.name}?
          </h2>
          <p className="mt-5 text-sm leading-8 text-slate-400">
            {guide.what}
          </p>
        </div>

        <div className="rounded-xl border border-white/8 bg-[#111722] p-6">
          <h3 className="text-base font-semibold text-white">
            What you can do
          </h3>
          <ul className="mt-5 space-y-4">
            {guide.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm leading-6 text-slate-400">
                <span className="mt-0.5 text-emerald-400">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-white/8 bg-[#0d131f]">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
          <p className="text-xs font-semibold tracking-[0.18em] text-emerald-400">
            GETTING STARTED
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            How to use it
          </h2>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {guide.steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-xl border border-white/8 bg-[#111722] p-6"
              >
                <span className="text-sm font-semibold text-emerald-400">
                  0{index + 1}
                </span>
                <h3 className="mt-5 text-base font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {guide.note && (
            <div className="mt-7 rounded-lg border border-amber-400/15 bg-amber-400/5 p-5">
              <p className="text-sm leading-7 text-amber-200/80">
                {guide.note}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center lg:py-20">
        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-400">
          READY WHEN YOU ARE
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-white">
          Make your investment journey clearer.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
          Create your Stockly account and explore the tools available to you.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#07110e] transition hover:bg-emerald-300"
          >
            Create free account
          </Link>
          <Link
            href={guide.appHref}
            className="rounded-md border border-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/5"
          >
            Open in Stockly
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/8 px-6 py-7">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold text-white">
            stockly<span className="text-emerald-400">.</span>
          </Link>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Stockly. Built for smarter investing.
          </p>
        </div>
      </footer>
    </main>
  );
}
