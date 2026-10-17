"use client";

import { type ReactNode } from "react";
import { Box, ExternalLink, GitPullRequest, Globe, Lock, Monitor, Zap, type LucideIcon } from "lucide-react";
import { BrandMark } from "@/src/components/brand/BrandMark";

const SOURCE_URL = "https://github.com/rakhechashubham/serverui";
const SITE_URL = "https://serverui.dev";
const SITE_LABEL = "serverui.dev";
const GITHUB_URL = "https://github.com/rakhechashubham";
const X_URL = "https://x.com/RakhechaShubham";
const LINKEDIN_URL = "https://www.linkedin.com/in/shubham-rakhecha-75a3b621a/";

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Box,
    title: "Open Source",
    body: "Built with the community, for the community.",
  },
  {
    icon: Zap,
    title: "Simple",
    body: "Powerful tools without unnecessary complexity.",
  },
  {
    icon: Monitor,
    title: "Cross-Server",
    body: "Manage multiple servers from one place.",
  },
  {
    icon: Lock,
    title: "Your Infrastructure",
    body: "Your servers. Your data. You stay in control.",
  },
];

export function AboutApp() {
  return (
    <div className="h-full overflow-auto px-7 py-4 sui-title">
      <div className="mx-auto flex max-w-[680px] flex-col items-center">
        <BrandMark size={64} className="drop-shadow-sm" />
        <h3 className="mt-3 text-[28px] font-semibold tracking-tight">ServerUI</h3>
        <p className="mt-1 max-w-[380px] text-center text-[13px] leading-5 text-white/55">
          A modern, open-source control panel for managing servers from the browser.
        </p>

        <a
          href={SITE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex h-9 w-full max-w-[460px] items-center gap-3 rounded-full sui-card px-3.5 text-[12px] text-white/80 transition-colors hover:bg-white/12"
        >
          <Globe className="size-3.5 shrink-0 text-white/45" strokeWidth={1.75} />
          <span className="min-w-0 flex-1 truncate text-left">{SITE_LABEL}</span>
          <ExternalLink className="size-3.5 shrink-0 text-white/35" strokeWidth={1.75} />
        </a>

        <div className="mt-4 h-px w-full bg-white/10" />

        <div className="mt-4 grid w-full grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center">
              <span className="flex size-10 items-center justify-center rounded-[12px] sui-card text-white/90">
                <feature.icon className="size-[18px]" strokeWidth={1.6} />
              </span>
              <p className="mt-2 text-[12px] font-semibold tracking-tight">{feature.title}</p>
              <p className="mt-0.5 max-w-[150px] text-[11px] leading-[1.4] text-white/45">
                {feature.body}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-4 w-full rounded-[18px] sui-card px-4 py-3.5 text-left">
          <div className="flex gap-3.5">
            <span className="flex size-[72px] shrink-0 overflow-hidden rounded-full bg-black/30 ring-1 ring-white/10">
              <img
                src="/brand/builder.png"
                alt=""
                className="size-full object-cover object-[50%_18%]"
                draggable={false}
              />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-white/40">BUILT BY</p>
              <h4 className="mt-0.5 text-[18px] font-semibold tracking-tight">Shubham Rakhecha</h4>
              <p className="text-[12px] text-white/50">Software Engineer · Founder @ Skyrekon</p>
              <p className="mt-2 text-[12px] leading-5 text-white/70">
                I build software, break servers, and occasionally fix both.
              </p>
              <p className="mt-1.5 text-[12px] leading-5 text-white/70">
                Founder of Skyrekon, builder of products, and the person behind ServerUI — because
                apparently SSH needed a UI.
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <SocialLink href={GITHUB_URL} label="GitHub">
              <GitHubMark />
              GitHub
            </SocialLink>
            <SocialLink href={X_URL} label="X">
              <XMark />X
            </SocialLink>
            <SocialLink href={LINKEDIN_URL} label="LinkedIn">
              <LinkedInMark />
              LinkedIn
            </SocialLink>
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 px-1 text-[13px] text-white/45 transition-colors hover:text-white/80"
            >
              View Source
              <ExternalLink className="size-3.5" strokeWidth={1.75} />
            </a>
          </div>
        </section>

        {/* px0 Technology Attribution Card */}
        <section className="mt-4 w-full rounded-[18px] sui-card px-4 py-3.5 text-left border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.05] to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded bg-[#FFC107] text-[10px] font-bold text-black shadow-sm font-mono">
                px0
              </span>
              <h4 className="text-[13.5px] font-semibold text-white">Built-in Code Editor (px0 IDE)</h4>
            </div>
            <a
              href="https://github.com/px0-ai/px0"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>px0-ai/px0</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
          <p className="mt-1.5 text-[12px] leading-5 text-white/60">
            ServerUI features full A-to-Z remote code editing powered by <strong className="text-white">px0</strong> — the speed-first, zero-latency editor. Includes multi-tab remote buffers, quick file palette (<kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px]">Cmd+O</kbd>), direct remote file saving (<kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px]">Cmd+S</kbd>), regex find &amp; replace, syntax detection across 15+ languages, and dynamic cursor tracking.
          </p>
        </section>

        {/* Contributors Section */}
        <section className="mt-4 w-full rounded-[18px] sui-card px-4 py-3.5 text-left">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-white/40">CORE CONTRIBUTORS</p>
            <a
              href={`${SOURCE_URL}/graphs/contributors`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-white/50 transition-colors hover:text-white/80"
            >
              All Contributors
              <ExternalLink className="size-3" strokeWidth={1.75} />
            </a>
          </div>

          <div className="mt-3 flex gap-3.5 items-start">
            <span className="flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-[18px] font-bold text-white shadow-md ring-1 ring-white/20 select-none">
              S
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[16px] font-semibold tracking-tight text-white/95">Shahil</h4>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
                  Core Contributor
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-white/50">Terminal Stability · UI Polish · Editor Integration</p>
              <p className="mt-1.5 text-[12px] leading-5 text-white/70">
                Resolved terminal lifecycle &amp; resize crashes, modernized terminal UI components, and integrated the px0 code editor environment into ServerUI.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SocialLink href="https://github.com/shahilali5" label="Shahil's GitHub">
                  <GitHubMark />
                  shahilali5
                </SocialLink>
                <a
                  href={`${SOURCE_URL}/commits?author=shahilali5`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] text-white/60 transition-colors hover:text-white/90 hover:bg-white/5"
                >
                  <GitPullRequest className="size-3.5 text-emerald-400" strokeWidth={1.75} />
                  View Contributions
                </a>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
            <span>Want to join the team? ServerUI is 100% open source.</span>
            <a
              href={`${SOURCE_URL}/blob/main/CONTRIBUTING.md`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 font-medium hover:underline underline-offset-2"
            >
              Contributing Guide
              <ExternalLink className="size-3" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-9 items-center gap-2 rounded-full sui-card px-3.5 text-[13px] font-medium text-white/85 transition-colors hover:bg-white/12"
    >
      {children}
    </a>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 fill-current">
      <path d="M8 0a8 8 0 0 0-2.5 15.6c.4.07.5-.17.5-.38v-1.3c-2.2.48-2.7-1.05-2.7-1.05-.36-.92-.88-1.17-.88-1.17-.72-.5.05-.49.05-.49.8.06 1.22.83 1.22.83.71 1.22 1.86.87 2.31.66.07-.52.28-.87.5-1.07-1.76-.2-3.62-.88-3.62-3.92 0-.87.31-1.58.82-2.13-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.55.82 1.26.82 2.13 0 3.05-1.86 3.72-3.64 3.92.29.25.54.73.54 1.48v2.2c0 .21.14.46.55.38A8 8 0 0 0 8 0Z" />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 fill-current">
      <path d="M14.8 0H1.2C.5 0 0 .5 0 1.2v13.6C0 15.5.5 16 1.2 16h13.6c.7 0 1.2-.5 1.2-1.2V1.2C16 .5 15.5 0 14.8 0ZM4.7 13.6H2.4V6h2.3v7.6ZM3.6 4.9A1.34 1.34 0 1 1 3.6 2.2a1.34 1.34 0 0 1 0 2.7ZM13.6 13.6h-2.3V9.9c0-.9 0-2-1.2-2s-1.4 1-1.4 1.9v3.8H6.4V6h2.2v1c.3-.6 1.1-1.2 2.2-1.2 2.4 0 2.8 1.6 2.8 3.6v4.2Z" />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 fill-current">
      <path d="M12.6 1.5h2.1L9.7 7.2 16 14.5h-4.4L8.1 9.9 4.2 14.5H2.1l5.3-6.1L0 1.5h4.5l3.3 4.2 3.8-4.2Zm-.7 11.7h1.2L4.2 2.7H2.9l8.9 10.5Z" />
    </svg>
  );
}
