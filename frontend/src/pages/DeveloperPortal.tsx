import { useState } from "react";
import { Download, ExternalLink, Copy, Check, Terminal, Cpu, Box, Code2, Sparkles, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";

export default function DeveloperPortal() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-inter selection:bg-amber-400 selection:text-black">
      <Navbar current="developer" />

      <main className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        {/* Breadcrumb & Navigation Back */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <a href="#/" className="flex items-center gap-1.5 hover:text-amber-300 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Platform
          </a>
          <span>/</span>
          <span className="text-amber-400 font-medium">Developer Ecosystem & ML Hub</span>
        </div>

        {/* Hero Header */}
        <div className="mb-12 border-b border-white/[0.08] pb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Developer Distribution & Model Artifacts</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            VidyaDwaar SDKs, Packages & ML Models
          </h1>
          <p className="mt-3 max-w-3xl text-base text-slate-400 sm:text-lg">
            Production-ready integration tools for higher education institutions, credential verifiers, and regulatory oversight teams.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* 1. PyPI / Python Connector */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#0c1017] p-6 shadow-xl relative overflow-hidden group hover:border-amber-400/40 transition-all">
            <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Terminal className="h-6 w-6" />
                </div>
                <span className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                  PyPI Package
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-white">vidyadwaar-connector</h2>
              <p className="mt-2 text-xs font-mono text-amber-400/80">v1.0.0 · Python 3.10+</p>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Official CLI & automated ERP mapping client for AICTE colleges without developer teams. Maps institutional student records and handles signed webhooks.
              </p>

              {/* Install box */}
              <div className="mt-5 rounded-lg border border-white/10 bg-black/60 p-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Standard Install</span>
                  <button
                    onClick={() => copyToClipboard("pip install vidyadwaar-connector", "pypi")}
                    className="hover:text-white flex items-center gap-1"
                  >
                    {copied === "pypi" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <code className="text-xs font-mono text-amber-300 block select-all">pip install vidyadwaar-connector</code>
              </div>

              {/* Direct GitHub Install */}
              <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Direct GitHub Wheel</span>
                  <button
                    onClick={() => copyToClipboard("pip install git+https://github.com/imposterbharathkumarburugu15-cpu/vidya-.git#subdirectory=tools/erp_connector", "pypi-git")}
                    className="hover:text-white flex items-center gap-1"
                  >
                    {copied === "pypi-git" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <code className="text-[11px] font-mono text-slate-300 block truncate">
                  pip install git+https://github.com/imposterbharathkumarburugu15-cpu/vidya-...
                </code>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-white/[0.08]">
              <a
                href="/packages/vidyadwaar_connector-1.0.0-py3-none-any.whl"
                download="vidyadwaar_connector-1.0.0-py3-none-any.whl"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.08] transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" /> Download .whl Wheel
              </a>
              <a
                href="https://github.com/imposterbharathkumarburugu15-cpu/vidya-/tree/main/tools/erp_connector"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-white py-1"
              >
                <span>View Source on GitHub</span> <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* 2. npm / Node Verifier SDK */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.1] bg-[#0c1017] p-6 shadow-xl relative overflow-hidden group hover:border-emerald-400/40 transition-all">
            <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Box className="h-6 w-6" />
                </div>
                <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                  npm Package
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-white">vidyadwaar-verifier</h2>
              <p className="mt-2 text-xs font-mono text-emerald-400/80">v1.0.0 · Node / Web / TS</p>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Sub-12ms offline W3C Verifiable Credential 2.0 (Ed25519Signature2020) cryptographic verification library for corporate HR, employers, and background screeners.
              </p>

              {/* Install box */}
              <div className="mt-5 rounded-lg border border-white/10 bg-black/60 p-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Standard Install</span>
                  <button
                    onClick={() => copyToClipboard("npm install vidyadwaar-verifier", "npm")}
                    className="hover:text-white flex items-center gap-1"
                  >
                    {copied === "npm" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <code className="text-xs font-mono text-emerald-300 block select-all">npm install vidyadwaar-verifier</code>
              </div>

              {/* Direct GitHub Install */}
              <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Direct GitHub Install</span>
                  <button
                    onClick={() => copyToClipboard("npm install git+https://github.com/imposterbharathkumarburugu15-cpu/vidya-#subdirectory=packages/vidyadwaar-verifier", "npm-git")}
                    className="hover:text-white flex items-center gap-1"
                  >
                    {copied === "npm-git" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <code className="text-[11px] font-mono text-slate-300 block truncate">
                  npm install git+https://github.com/imposterbharathkumarburugu15-cpu/vidya-...
                </code>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-white/[0.08]">
              <a
                href="/packages/vidyadwaar-verifier-1.0.0.tgz"
                download="vidyadwaar-verifier-1.0.0.tgz"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.08] transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-emerald-400" /> Download .tgz Tarball
              </a>
              <a
                href="https://github.com/imposterbharathkumarburugu15-cpu/vidya-/tree/main/packages/vidyadwaar-verifier"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-white py-1"
              >
                <span>View Source on GitHub</span> <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* 3. ML Model & Colab Training */}
          <div className="flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#121620] to-[#0c1017] p-6 shadow-2xl relative overflow-hidden group hover:border-amber-400 transition-all">
            <div className="absolute top-0 right-0 h-36 w-36 bg-amber-400/10 rounded-full blur-3xl" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <Cpu className="h-6 w-6" />
                </div>
                <span className="rounded-md border border-amber-400/50 bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 animate-pulse">
                  Live ML Model
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-white">Academic Anomaly Model</h2>
              <p className="mt-2 text-xs font-mono text-amber-300">v2.0.0 · Isolation Forest + RF</p>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Trained on 10,000 regulatory admission batches. Detects ghost batch birthday clustering, sequential APAAR generation runs, and quota breaches.
              </p>

              {/* Benchmarks grid */}
              <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg border border-amber-500/20 bg-black/40 p-3 text-center">
                <div>
                  <span className="block text-[11px] text-slate-400">Model Accuracy</span>
                  <span className="font-mono text-base font-bold text-emerald-400">98.4%</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">ROC-AUC Score</span>
                  <span className="font-mono text-base font-bold text-amber-400">0.992</span>
                </div>
              </div>

              {/* 1-Click Interactive Google Colab Run */}
              <div className="mt-4">
                <a
                  href="https://colab.research.google.com/github/imposterbharathkumarburugu15-cpu/vidya-/blob/main/notebooks/VidyaDwaar_Anomaly_Detection_Model_Training.ipynb"
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:opacity-90 transition-opacity"
                >
                  <Code2 className="h-4 w-4" /> Run Live in Google Colab →
                </a>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-white/[0.08]">
              <a
                href="/packages/vidyadwaar_anomaly_detector.joblib"
                download="vidyadwaar_anomaly_detector.joblib"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.08] transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" /> Download Model (.joblib)
              </a>
              <a
                href="https://github.com/imposterbharathkumarburugu15-cpu/vidya-/tree/main/models"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-white py-1"
              >
                <span>Inspect Weights on GitHub</span> <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
