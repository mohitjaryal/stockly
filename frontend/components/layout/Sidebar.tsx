"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const sections = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/", icon: "◫" }],
  },
  {
    title: "Investments",
    items: [
      { label: "Portfolio", href: "/portfolio", icon: "▤" },
      { label: "Stocks", href: "/stocks", icon: "↗" },
      { label: "Mutual Funds", href: "/mutual-funds", icon: "◈" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Stockly Intelligence", href: "/intelligence", icon: "✧" },
    ],
  },
  {
    title: "Your Workspace",
    items: [
      { label: "Watchlist", href: "/watchlist", icon: "☆" },
      { label: "Alerts", href: "/alerts", icon: "◎" },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/8 bg-[#0D1119] transition-[width] duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`flex h-[72px] shrink-0 items-center border-b border-white/8 ${
          collapsed ? "justify-center px-2" : "justify-between px-6"
        }`}
      >
        {!collapsed && (
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-white"
          >
            stockly<span className="text-emerald-400">.</span>
          </Link>
        )}

        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          {collapsed ? "☰" : "‹"}
        </button>
      </div>

      <div
        className={`flex-1 overflow-y-auto pt-7 ${collapsed ? "px-3" : "px-4"}`}
      >
        {sections.map((section) => (
          <div key={section.title} className="mb-7">
            {!collapsed && (
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {section.title}
              </p>
            )}

            {collapsed && <div className="mb-3 border-t border-white/[0.06]" />}

            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-lg py-3 text-[13px] transition-colors ${
                      collapsed ? "justify-center px-2" : "gap-3 px-3"
                    } ${
                      isActive
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "text-slate-400 hover:bg-white/4 hover:text-white"
                    }`}
                  >
                    <span className="w-6 shrink-0 text-center text-lg">
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div
        className={`shrink-0 border-t border-white/8 py-5 ${collapsed ? "px-2 text-center" : "px-5"}`}
      >
        {collapsed ? (
          <span
            className="text-xs font-semibold text-emerald-400"
            title="Stockly"
          >
            S.
          </span>
        ) : (
          <>
            <p className="text-xs text-slate-500">Stockly</p>
            <p className="mt-1 text-[11px] text-slate-600">
              Investment research platform
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
