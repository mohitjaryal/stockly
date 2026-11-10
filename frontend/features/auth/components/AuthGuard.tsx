
"use client";

import { useEffect, useState } from "react";
import { verifyToken } from "@/features/auth/services/authService";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const token = localStorage.getItem("stockly_token");

      if (!token) {
        window.location.replace("/login");
        return;
      }

      try {
        const isValid = await verifyToken(token);

        if (cancelled) return;

        if (!isValid) {
          localStorage.removeItem("stockly_token");
          window.location.replace("/login");
          return;
        }

        setAuthenticated(true);
      } catch {
        if (!cancelled) {
          setError("Unable to connect to Stockly server.");
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [retry]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0F17] text-white">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => {
            setError("");
            setRetry((value) => value + 1);
          }}
          className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-black"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] text-sm text-slate-400">
        Verifying your session...
      </div>
    );
  }

  return <>{children}</>;
}
