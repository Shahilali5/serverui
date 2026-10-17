"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw, XCircle } from "lucide-react";

interface Props {
  windowTitle?: string;
  onClose?: () => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WindowErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[WindowErrorBoundary] Uncaught window error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      const title = this.props.windowTitle || "Application";
      const message = this.state.error?.message || "An unexpected error occurred while rendering this window.";

      return (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center select-none bg-zinc-950/80 backdrop-blur-xl">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.15)] mb-4">
            <AlertCircle className="size-7" />
          </div>

          <h3 className="text-[16px] font-semibold text-white tracking-tight">
            {title} Encountered an Issue
          </h3>

          <p className="mt-2 max-w-sm text-[12.5px] leading-5 text-white/60">
            {message}
          </p>

          <div className="mt-6 flex items-center gap-2.5">
            <button
              type="button"
              onClick={this.handleRetry}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-[12.5px] font-medium text-white transition-all hover:bg-white/20 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <RefreshCw className="size-3.5" />
              Reload {title}
            </button>

            {this.props.onClose ? (
              <button
                type="button"
                onClick={this.props.onClose}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-transparent px-4 py-2 text-[12.5px] font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-95 outline-none"
              >
                <XCircle className="size-3.5" />
                Close Window
              </button>
            ) : null}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
