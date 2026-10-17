"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Root Global Error]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 flex min-h-screen items-center justify-center bg-[#090d16] p-4 font-sans text-white">
        <div className="flex max-w-md w-full flex-col items-center rounded-3xl border border-white/10 bg-zinc-900/95 p-8 text-center shadow-2xl backdrop-blur-2xl">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-4">
            <AlertTriangle className="size-7" />
          </div>
          <h1 className="text-[18px] font-semibold tracking-tight text-white">
            ServerUI Recovery
          </h1>
          <p className="mt-2 text-[13px] text-white/60">
            A system error was encountered. Click below to reload the workspace.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-zinc-950 shadow-md transition-all hover:bg-white/90"
          >
            <RefreshCw className="size-4" />
            Reload Workspace
          </button>
        </div>
      </body>
    </html>
  );
}
