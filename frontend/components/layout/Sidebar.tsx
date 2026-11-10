
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Overview", href: "/", icon: "◫" },
  { label: "Watchlist", href: "/watchlist", icon: "☆" },
  { label: "Alerts", href: "/alerts", icon: "◎" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/8 bg-[#0D1119]">
      <div className="flex h-18 items-center border-b border-white/8 px-7">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-white"
        >
          stockly<span className="text-emerald-400">.</span>
        </Link>
      </div>

      <div className="px-4 pt-8">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-colors ${
                  isActive
                    ? "bg-white/[0.07] text-white"
                    : "text-slate-400 hover:bg-white/4 hover:text-white"
                }`}
              >
                <span className="w-5 text-center text-base">
                  {item.icon}
                </span>

                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-white/8 p-5">
        <p className="text-xs text-slate-500">Stockly</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Market intelligence platform
        </p>
      </div>
    </aside>
  );
}
