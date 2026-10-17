"use client";

import { useState, type FormEvent } from "react";
import { Lock, User, ArrowRight, ShieldCheck, KeyRound, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "@/src/lib/auth";

export function LoginScreen() {
  const { isConfigured, setupAdmin, login } = useAuth();
  const [username, setUsername] = useState(isConfigured ? "admin" : "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please fill in both username and password.");
      return;
    }

    setLoading(true);

    if (!isConfigured) {
      if (password.length < 6) {
        setError("Password should be at least 6 characters long.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      const ok = setupAdmin(username, password);
      if (!ok) setError("Could not complete admin setup. Please try again.");
    } else {
      const ok = login(username, password);
      if (!ok) {
        setError("Invalid username or password.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#07090e] px-4 font-sans select-none overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full bg-blue-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-[600px] rounded-full bg-emerald-600/10 blur-[140px]" />

      <div className="relative w-full max-w-sm">
        {/* Glass Card */}
        <div className="relative rounded-3xl border border-white/12 bg-zinc-950/80 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          {/* Header Icon */}
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.2)] mb-5">
            {isConfigured ? <Lock className="size-6" /> : <ShieldCheck className="size-7" />}
          </div>

          <div className="text-center">
            <h1 className="text-[20px] font-bold tracking-tight text-white">
              {isConfigured ? "ServerUI Access" : "Create Admin Account"}
            </h1>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">
              {isConfigured
                ? "Enter your credentials to unlock your server workspace."
                : "Initial setup: protect this control panel with admin login."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1 pl-1">
                Username
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 size-4 text-white/40" />
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus={!isConfigured}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-[13px] text-white placeholder-white/30 outline-none transition-all focus:border-emerald-400/60 focus:bg-white/[0.08]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1 pl-1">
                Password
              </label>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3.5 size-4 text-white/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus={isConfigured}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-[13px] text-white placeholder-white/30 outline-none transition-all focus:border-emerald-400/60 focus:bg-white/[0.08]"
                />
              </div>
            </div>

            {!isConfigured ? (
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1 pl-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3.5 size-4 text-white/40" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-[13px] text-white placeholder-white/30 outline-none transition-all focus:border-emerald-400/60 focus:bg-white/[0.08]"
                  />
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-[12px] text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[13px] font-semibold text-zinc-950 shadow-md transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isConfigured ? "Sign In to ServerUI" : "Complete Setup & Launch"}</span>
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>

        <div className="mt-4 text-center text-[11px] text-white/40">
          ServerUI v0.3.1 • Protected with AES-256-GCM
        </div>
      </div>
    </div>
  );
}
