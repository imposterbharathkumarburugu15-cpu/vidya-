import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon, ArrowLeft, RefreshCw, RotateCcw } from "lucide-react";
import { BrandLogo } from "./BrandMark";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    // Safe console reporting without sensitive payload exposure
    console.error("[Vidyadwaar ErrorBoundary Caught Exception]:", error.message);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = "/";
    window.location.reload();
  };

  private handleReset = () => {
    try {
      sessionStorage.removeItem("apaar.session");
    } catch {
      /* ignore storage errors */
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = "/";
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || "An unexpected rendering error occurred.";
      return (
        <div className="min-h-screen w-full bg-[#0b0f14] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#d4af37]/40">
          <div aria-hidden className="pointer-events-none fixed inset-0 opacity-40 bg-[radial-gradient(closest-side,rgba(212,175,55,0.15),transparent)]" />
          
          <div className="relative z-10 max-w-xl w-full rounded-2xl border border-white/[0.08] bg-[#12161f]/90 p-8 backdrop-blur-2xl shadow-2xl space-y-6 text-center">
            <div className="flex justify-center">
              <BrandLogo size="md" />
            </div>

            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400">
              <AlertOctagon className="h-7 w-7" aria-hidden />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                {this.props.fallbackTitle || "Something went wrong in this view"}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                The platform encountered a display error while rendering this page. Your session and data remain completely secure.
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-black/40 p-3.5 text-left text-xs font-mono text-rose-300 break-words max-h-32 overflow-y-auto">
              <span className="font-bold text-rose-400 block mb-1">Diagnostic Details:</span>
              {errorMsg}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 rounded-xl bg-gold/20 border border-gold/40 px-4 py-2.5 text-sm font-semibold text-champagne hover:bg-gold/30 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload Page</span>
              </button>
              
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Dashboard</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset Session</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

