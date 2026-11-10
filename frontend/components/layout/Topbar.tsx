
"use client";

import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("stockly_token");
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-white/8 bg-[#0B0F17]/95 px-8 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-white">Market Overview</p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Your market at a glance
        </p>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden items-center gap-2 rounded-md border border-white/9 px-3 py-2 sm:flex">
          <span className="text-slate-500">⌕</span>
          <span className="text-xs text-slate-500">
            Search stocks...
          </span>
          <span className="ml-8 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500">
            ⌘ K
          </span>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-medium text-slate-300">
          M
        </div>

        <button
          onClick={handleLogout}
          className="rounded-md border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
