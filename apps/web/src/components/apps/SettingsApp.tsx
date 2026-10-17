"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  Monitor,
  Palette,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Upload,
} from "lucide-react";
import { AppearanceSettings } from "@/src/components/shell/AppearanceSettings";
import { useAppearance, type AppearanceId } from "@/src/lib/appearance";
import { useWallpaper, type WallpaperId } from "@/src/lib/wallpaper";
import { useAutoUpdater } from "@/src/lib/updater.tsx";
import type { WindowPayload } from "@/src/components/window/window-context";

type SettingsTab = "general" | "wallpaper" | "updates";

export function SettingsApp({ payload }: { payload?: WindowPayload }) {
  const initialTab: SettingsTab =
    payload?.cwd === "wallpaper" ? "wallpaper" : payload?.cwd === "updates" ? "updates" : "general";

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (payload?.cwd === "wallpaper") setActiveTab("wallpaper");
    if (payload?.cwd === "updates") setActiveTab("updates");
  }, [payload]);

  const {
    wallpaperId,
    wallpaperSrc,
    wallpapers,
    customSrc,
    hasCustom,
    blur,
    brightness,
    setWallpaper,
    setCustomWallpaper,
    setCustomWallpaperUrl,
    clearCustomWallpaper,
    setBlur,
    setBrightness,
  } = useWallpaper();

  const [wallpaperError, setWallpaperError] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const { appearance, setAppearance } = useAppearance();

  const {
    currentVersion,
    latestVersion,
    updateAvailable,
    checking,
    lastChecked,
    releaseUrl,
    releaseNotes,
    autoCheck,
    setAutoCheck,
    checkForUpdates,
    applyUpdate,
  } = useAutoUpdater();

  const [manualCheckMsg, setManualCheckMsg] = useState<string | null>(null);

  const handleManualCheck = async () => {
    setManualCheckMsg(null);
    const hasNew = await checkForUpdates(false);
    if (!hasNew) {
      setManualCheckMsg("You are using the latest version of ServerUI!");
    }
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden sui-app select-none">
      {/* Sidebar Navigation */}
      <aside className="sui-sidebar flex w-[190px] shrink-0 flex-col gap-1 px-3 py-4 text-[13px] border-r border-white/8">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] sui-muted">
          Settings
        </p>
        <button
          type="button"
          aria-current={activeTab === "general" ? "page" : undefined}
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium transition-colors outline-none ${
            activeTab === "general"
              ? "sui-selected text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Palette className="size-4 opacity-70" />
          General
        </button>

        <button
          type="button"
          aria-current={activeTab === "wallpaper" ? "page" : undefined}
          onClick={() => setActiveTab("wallpaper")}
          className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left font-medium transition-colors outline-none ${
            activeTab === "wallpaper"
              ? "sui-selected text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="size-4 opacity-70" />
            Wallpapers
          </div>
          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400">
            10 Free
          </span>
        </button>

        <button
          type="button"
          aria-current={activeTab === "updates" ? "page" : undefined}
          onClick={() => setActiveTab("updates")}
          className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left font-medium transition-colors outline-none ${
            activeTab === "updates"
              ? "sui-selected text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <RefreshCw className={`size-4 opacity-70 ${checking ? "animate-spin" : ""}`} />
            Updates
          </div>
          {updateAvailable ? (
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          ) : null}
        </button>
      </aside>

      {/* Main Settings Content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto px-7 py-6">
        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div>
            <h3 className="text-2xl font-semibold tracking-tight sui-title">General</h3>
            <section
              className="sui-card mt-5 max-w-2xl space-y-3 rounded-2xl p-4.5 border border-white/10"
              aria-label="Theme"
            >
              <h4 className="text-sm font-medium sui-title">Desktop Theme</h4>
              <p className="text-xs leading-5 sui-muted">
                Choose your desktop interface style. macOS features an Apple-inspired floating Dock,
                while Aura offers a vertical side rail with modern glass styling.
              </p>
              <div className="flex flex-wrap gap-2 pt-1" role="radiogroup" aria-label="Theme">
                <ThemeChoice
                  id="macos"
                  label="macOS (Dock)"
                  selected={appearance === "macos"}
                  onSelect={() => setAppearance("macos")}
                />
                <ThemeChoice
                  id="aura"
                  label="Aura (Side Rail)"
                  selected={appearance === "aura"}
                  onSelect={() => setAppearance("aura")}
                />
              </div>
              {appearance === "aura" ? <AppearanceSettings /> : null}
            </section>
          </div>
        )}

        {/* TAB 2: WALLPAPERS */}
        {activeTab === "wallpaper" && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight sui-title">Wallpapers</h3>
                <p className="mt-1 text-xs text-white/50">
                  Select from 10 free built-in themes, paste a custom image URL, or upload your own.
                </p>
              </div>
            </div>

            {/* 10 Built-In Free Wallpapers */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  Built-in Wallpapers (10 Free)
                </p>
                <span className="text-[11px] text-emerald-400 font-medium">Ready Offline</span>
              </div>

              <div
                className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
                role="listbox"
                aria-label="Wallpaper collection"
              >
                {wallpapers.map((option) => {
                  const isSelected = wallpaperId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setWallpaperError(null);
                        setWallpaper(option.id);
                      }}
                      className={`group relative overflow-hidden rounded-xl border text-left outline-none transition-all ${
                        isSelected
                          ? "border-emerald-400 ring-2 ring-emerald-400/50 shadow-md scale-[1.02]"
                          : "border-white/10 hover:border-white/30 hover:scale-[1.01]"
                      }`}
                    >
                      <span
                        className="block aspect-16/10 bg-cover bg-center"
                        style={{ backgroundImage: `url("${option.src}")` }}
                      />
                      <div className="flex items-center justify-between p-2 bg-[#121316]">
                        <span className="truncate text-[11px] font-medium text-white/80">
                          {option.name}
                        </span>
                        {isSelected ? (
                          <span className="flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-black">
                            <Check className="size-2.5 stroke-[3]" />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Wallpaper Section */}
            <section className="sui-card mt-6 max-w-2xl space-y-4 rounded-2xl p-4.5 border border-white/10">
              <h4 className="text-sm font-medium sui-title">Custom Wallpaper</h4>
              <p className="text-xs leading-5 sui-muted">
                Upload any wallpaper from your computer or provide an online image link:
              </p>

              {/* Upload & URL Input */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={wallpaperInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      setWallpaperError(null);
                      void setCustomWallpaper(file).catch((err) => {
                        setWallpaperError(
                          err instanceof Error ? err.message : "Unable to use that image.",
                        );
                      });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => wallpaperInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
                  >
                    <Upload className="size-3.5" />
                    Upload from computer…
                  </button>

                  {hasCustom ? (
                    <button
                      type="button"
                      onClick={() => {
                        setWallpaperError(null);
                        void clearCustomWallpaper().catch((err) => {
                          setWallpaperError(
                            err instanceof Error ? err.message : "Unable to remove custom wallpaper.",
                          );
                        });
                      }}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-colors"
                    >
                      Remove custom
                    </button>
                  ) : null}
                </div>

                {/* Paste URL */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customUrlInput.trim()) {
                      setCustomWallpaperUrl(customUrlInput.trim());
                      setCustomUrlInput("");
                    }
                  }}
                  className="flex gap-2 max-w-md"
                >
                  <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5">
                    <LinkIcon className="size-3.5 text-white/40" />
                    <input
                      type="url"
                      placeholder="Or paste image URL (https://...)"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/30"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!customUrlInput.trim()}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-40 transition-colors"
                  >
                    Apply URL
                  </button>
                </form>
              </div>

              {wallpaperError ? (
                <p className="text-xs text-red-300" role="alert">
                  {wallpaperError}
                </p>
              ) : null}
            </section>

            {/* Display Tuning / Effects */}
            <section className="sui-card mt-6 max-w-2xl space-y-4 rounded-2xl p-4.5 border border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium sui-title">Wallpaper Adjustments</h4>
                <button
                  type="button"
                  onClick={() => {
                    setBlur(0);
                    setBrightness(100);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white transition-colors"
                >
                  <RotateCcw className="size-3" />
                  Reset Effects
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Blur Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70">Backdrop Blur</span>
                    <span className="font-mono text-white/40">{blur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                {/* Brightness Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70">Brightness</span>
                    <span className="font-mono text-white/40">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: UPDATES */}
        {activeTab === "updates" && (
          <div>
            <h3 className="text-2xl font-semibold tracking-tight sui-title">Software Updates</h3>
            <p className="mt-1 text-xs text-white/50">
              ServerUI automatically checks for updates whenever maintainers push new releases.
            </p>

            <section className="sui-card mt-5 max-w-2xl space-y-4 rounded-2xl p-5 border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                    <Sparkles className="size-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-white">ServerUI</h4>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-mono font-medium text-white/80">
                        v{currentVersion}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">
                      {lastChecked
                        ? `Last checked: ${new Date(lastChecked).toLocaleTimeString()}`
                        : "Never checked"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={checking}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-50 transition-all shadow-sm"
                >
                  <RefreshCw className={`size-3.5 ${checking ? "animate-spin" : ""}`} />
                  {checking ? "Checking…" : "Check for Updates"}
                </button>
              </div>

              {/* Status Message */}
              {updateAvailable && latestVersion ? (
                <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                      <Sparkles className="size-4 animate-pulse" />
                      <span>New Update Available: {latestVersion}</span>
                    </div>
                    <button
                      type="button"
                      onClick={applyUpdate}
                      className="rounded-lg bg-emerald-500 px-3 py-1 font-medium text-black hover:bg-emerald-400 transition-colors shadow-sm"
                    >
                      Update &amp; Reload Now
                    </button>
                  </div>
                  <p className="mt-2 text-white/70 leading-relaxed">{releaseNotes}</p>
                </div>
              ) : manualCheckMsg ? (
                <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-emerald-400 flex items-center gap-2">
                  <Check className="size-4" />
                  <span>{manualCheckMsg}</span>
                </div>
              ) : null}

              {/* Auto Check Settings Toggle */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/90">Automatic Update Checks</p>
                  <p className="text-[11px] text-white/50">
                    Periodically check GitHub releases in the background (every 30 minutes)
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoCheck}
                  onClick={() => setAutoCheck(!autoCheck)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoCheck ? "bg-emerald-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoCheck ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* How Auto-Updates Work */}
            <section className="sui-card mt-5 max-w-2xl space-y-3 rounded-2xl p-4.5 border border-white/10">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                How Continuous Updates Work
              </h4>
              <p className="text-xs leading-5 text-white/70">
                Whenever you push new commits or publish a release to GitHub, ServerUI’s auto-update
                listener recognizes the update within seconds and presents an instant 1-click update
                banner on the desktop.
              </p>
              <div className="pt-1">
                <a
                  href={releaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline underline-offset-2"
                >
                  View Releases on GitHub
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function ThemeChoice({
  label,
  selected,
  onSelect,
}: {
  id: AppearanceId;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`rounded-full px-4 py-1.5 text-xs font-medium outline-none transition-all ${
        selected
          ? "bg-emerald-500 text-black shadow-sm font-semibold"
          : "sui-card sui-title hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}
