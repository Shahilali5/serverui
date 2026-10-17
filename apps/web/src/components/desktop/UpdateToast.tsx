"use client";

import { AlertCircle, ExternalLink, RefreshCw, Sparkles, X } from "lucide-react";
import { useAutoUpdater } from "@/src/lib/updater.tsx";

export function UpdateToast() {
  const { updateAvailable, latestVersion, releaseUrl, applyUpdate, dismissUpdate } =
    useAutoUpdater();

  if (!updateAvailable || !latestVersion) return null;

  return (
    <div
      role="alert"
      className="fixed top-12 right-6 z-[95] flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[#121316]/90 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl animate-menu-in"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
        <Sparkles className="size-4 animate-pulse" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-white">Update Available</span>
          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono font-medium text-emerald-300">
            {latestVersion}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-white/60 truncate">
          A new version has been pushed with enhancements!
        </p>

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={applyUpdate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-medium text-black hover:bg-emerald-400 transition-colors shadow-sm"
          >
            <RefreshCw className="size-3" />
            Update &amp; Reload
          </button>

          <a
            href={releaseUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors"
          >
            Changelog
            <ExternalLink className="size-2.5" />
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={dismissUpdate}
        className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
        title="Dismiss update notice"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
