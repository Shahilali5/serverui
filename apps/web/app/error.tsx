"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ServerUI Global Error Boundary]:", error);
  }, [error]);

  const handleResetStorage = () => {
    try {
      localStorage.removeItem("serverui-windows");
      localStorage.removeItem("serverui-session");
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 px-6 text-white font-sans">
      <div className="relative flex max-w-md w-full flex-col items-center rounded-3xl border border-white/10 bg-zinc-900/90 p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.2)] mb-5">
          <AlertTriangle className="size-8" />
        </div>

        <h2 className="text-[20px] font-bold tracking-tight text-white">
          ServerUI Encountered an Issue
        </h2>

        <p className="mt-2 text-[13px] leading-relaxed text-white/60">
          The desktop workspace experienced an unexpected condition. You can reload the view or reset active window sessions.
        </p>

        {error.message ? (
          <div className="mt-4 max-h-24 w-full overflow-y-auto rounded-xl border border-white/5 bg-black/40 p-3 text-left font-mono text-[11px] text-red-400/90">
            {error.message}
          </div>
        ) : null}

        <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-zinc-950 shadow-md transition-all hover:bg-white/90 active:scale-95"
          >
            <RefreshCw className="size-4" />
            Reload View
          </button>

          <button
            type="button"
            onClick={handleResetStorage}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            <RotateCcw className="size-4" />
            Reset State
          </button>
        </div>
      </div>
    </div>
  );
}
