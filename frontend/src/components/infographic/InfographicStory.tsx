import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { BrandLogo } from "../BrandMark";
import InfographicCanvas from "./InfographicCanvas";
import { INFOGRAPHIC_SCENES } from "./types";
import { ResolutionStatus } from "./ReviewInspector";
import { audioController } from "../walkthrough/sound";
import { useReducedMotion } from "../motion";
import { go } from "../../ui";

export default function InfographicStory() {
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [resolutionStatus, setResolutionStatus] = useState<ResolutionStatus>("verified");
  const [sceneProgress, setSceneProgress] = useState<number>(0);
  const [showTechnicalModal, setShowTechnicalModal] = useState<boolean>(false);

  const isReducedMotion = useReducedMotion();
  const currentScene = INFOGRAPHIC_SCENES[currentSceneIdx];

  const playSceneAudio = useCallback((sceneIdx: number) => {
    if (isMuted) return;
    if (sceneIdx === 1) {
      audioController.playPing(); // Collision alarm ping
    } else if (sceneIdx === 4) {
      audioController.playSuccess(); // Resolution success chime
    } else {
      audioController.playSceneTransition();
    }
  }, [isMuted]);

  const goToNext = useCallback(() => {
    if (currentSceneIdx < INFOGRAPHIC_SCENES.length - 1) {
      playSceneAudio(currentSceneIdx + 1);
      setCurrentSceneIdx((prev) => prev + 1);
      setSceneProgress(0);
    } else {
      setIsPlaying(false);
      setSceneProgress(100);
    }
  }, [currentSceneIdx, playSceneAudio]);

  const goToPrev = useCallback(() => {
    if (currentSceneIdx > 0) {
      playSceneAudio(currentSceneIdx - 1);
      setCurrentSceneIdx((prev) => prev - 1);
      setSceneProgress(0);
    }
  }, [currentSceneIdx, playSceneAudio]);

  const selectScene = (idx: number) => {
    if (idx !== currentSceneIdx) {
      playSceneAudio(idx);
      setCurrentSceneIdx(idx);
      setSceneProgress(0);
    }
  };

  // Fast auto-play loop (~3.8s per scene)
  useEffect(() => {
    if (!isPlaying) return;

    const durationMs = (currentScene.durationSeconds * 1000) / speed;
    const tickIntervalMs = 40;
    const progressPerTick = (tickIntervalMs / durationMs) * 100;

    const interval = setInterval(() => {
      setSceneProgress((prev) => Math.min(100, prev + progressPerTick));
    }, tickIntervalMs);

    const timer = setTimeout(() => {
      goToNext();
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isPlaying, currentSceneIdx, currentScene.durationSeconds, speed, goToNext]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          audioController.playClick();
          setIsPlaying((prev) => !prev);
          break;
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          goToNext();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          goToPrev();
          break;
        case "KeyM":
          e.preventDefault();
          setIsMuted((prev) => {
            const next = !prev;
            audioController.setMuted(next);
            return next;
          });
          break;
        case "KeyR":
          e.preventDefault();
          setSceneProgress(0);
          setIsPlaying(true);
          break;
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit5":
        case "Digit6": {
          const idx = parseInt(e.key, 10) - 1;
          if (idx >= 0 && idx < INFOGRAPHIC_SCENES.length) {
            selectScene(idx);
          }
          break;
        }
        case "Escape":
          e.preventDefault();
          if (showTechnicalModal) {
            setShowTechnicalModal(false);
          } else {
            go("/");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, showTechnicalModal]);

  return (
    <div className="h-screen max-h-screen w-full bg-[#07090E] text-white font-sans selection:bg-[#F5C067]/30 selection:text-white flex flex-col justify-between overflow-hidden relative">
      {/* Background radial gradient glow matching the screenshot */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,192,103,0.15),rgba(255,255,255,0))]"
      />

      {/* Faint ambient cyber grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ============================================================== */}
      {/* 1. TOP HEADER & CHAPTER SCRUBBER (Dark Obsidian + Gold) */}
      {/* ============================================================== */}
      <header className="shrink-0 h-13 border-b border-white/[0.08] bg-[#07090E]/90 backdrop-blur-2xl px-3 sm:px-6 flex items-center justify-between gap-3 z-30">
        {/* Brand & Home */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => go("/")}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Return to Platform (Esc)"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <span className="text-white/20 hidden sm:inline">|</span>
          <div className="hidden sm:block">
            <BrandLogo size="sm" />
          </div>
        </div>

        {/* 6-Scene Scrubber Navigation Bar */}
        <nav aria-label="Story Scenes" className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {INFOGRAPHIC_SCENES.map((scene, idx) => {
            const isCurrent = idx === currentSceneIdx;
            const isPast = idx < currentSceneIdx;

            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => selectScene(idx)}
                className={`group flex flex-col items-center px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-amber-400/20 text-[#FBE7A1] font-bold border border-amber-400/40 shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                title={`Jump to Scene ${scene.number}: ${scene.headline}`}
              >
                <span className="text-[10px] font-mono tracking-tight whitespace-nowrap">
                  {scene.number} {scene.shortTag}
                </span>
                <div className="w-7 sm:w-10 h-0.5 rounded-full bg-white/10 overflow-hidden mt-0.5">
                  <div
                    className={`h-full transition-all duration-75 ${
                      isCurrent
                        ? "bg-gradient-to-r from-[#F5C067] to-[#D4AF37]"
                        : isPast
                        ? "bg-[#D4AF37]"
                        : "bg-transparent"
                    }`}
                    style={{
                      width: isCurrent ? `${sceneProgress}%` : isPast ? "100%" : "0%",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowTechnicalModal(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="View Architecture Notes"
          >
            <Info className="h-3 w-3 text-amber-400" />
            <span className="hidden md:inline">Specs</span>
          </button>

          <button
            type="button"
            onClick={() => go("/signin")}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#F5C067] via-[#E5A93C] to-[#D4AF37] px-3.5 py-1 text-xs font-black text-black shadow-lg shadow-amber-500/25 hover:brightness-110 transition-all cursor-pointer"
          >
            <Zap className="h-3 w-3 fill-black text-black" />
            <span>One-Click Sign In</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN STORY VIEWPORT (100% SINGLE-SCREEN FIT) */}
      {/* ============================================================== */}
      <main className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-2 sm:px-4 py-1.5 flex flex-col justify-between relative z-10">
        {/* Top Editorial Headline (Gold & White Luxury Typography) */}
        <div className="shrink-0 text-center space-y-0.5 max-w-3xl mx-auto pt-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.2 text-[9.5px] font-mono font-bold tracking-wider uppercase border backdrop-blur-md ${
                currentScene.tagColor === "warning"
                  ? "bg-red-950/80 text-red-300 border-red-700"
                  : currentScene.tagColor === "saffron"
                  ? "bg-amber-950/80 text-amber-300 border-amber-700"
                  : currentScene.tagColor === "verified"
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700"
                  : "bg-white/5 text-amber-200 border-white/10"
              }`}
            >
              <span className="h-1 w-1 rounded-full bg-current" />
              SCENE {currentScene.number} · {currentScene.focalTag}
            </span>
          </div>

          <motion.h1
            key={currentScene.headline}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="font-sans text-lg sm:text-2xl font-black tracking-[-0.03em] leading-tight bg-gradient-to-r from-white via-[#FBE7A1] to-[#E2BC4A] bg-clip-text text-transparent"
          >
            {currentScene.headline}
          </motion.h1>

          <motion.p
            key={currentScene.poeticLead}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.2 }}
            className="text-xs text-slate-300 leading-tight max-w-2xl mx-auto font-normal"
          >
            {currentScene.poeticLead}
          </motion.p>
        </div>

        {/* Master Connected 3-Column Infographic Stage */}
        <div className="flex-1 min-h-0 my-1 flex items-center justify-center">
          <InfographicCanvas
            sceneId={currentScene.id}
            resolutionStatus={resolutionStatus}
            onStatusChange={(s) => setResolutionStatus(s)}
            isReducedMotion={isReducedMotion}
          />
        </div>

        {/* Subtle Educational Footnote */}
        <div className="shrink-0 text-center pb-0.5">
          <span className="inline-block font-mono text-[9.5px] text-amber-200/80 bg-white/5 border border-white/10 rounded-full px-3 py-0.5 backdrop-blur-md">
            {currentScene.detail}
          </span>
        </div>
      </main>

      {/* ============================================================== */}
      {/* 3. BOTTOM CINEMATIC CONTROLS & TIMELINE DOCK */}
      {/* ============================================================== */}
      <footer className="shrink-0 h-13 border-t border-white/[0.08] bg-[#07090E]/95 backdrop-blur-2xl px-3 sm:px-6 flex items-center justify-between gap-3 z-30">
        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              audioController.playClick();
              setIsPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-3 py-1.5 text-xs font-black text-black shadow-md hover:brightness-110 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3 w-3 fill-black text-black" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-black text-black" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              audioController.playClick();
              setSceneProgress(0);
              setIsPlaying(true);
            }}
            className="p-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Replay Current Scene (R)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              const nextSpeed = speed === 1.0 ? 1.5 : speed === 1.5 ? 2.0 : speed === 2.0 ? 0.75 : 1.0;
              setSpeed(nextSpeed);
            }}
            className="px-2 py-1 rounded-lg border border-white/10 text-[11px] font-mono font-bold text-amber-300 hover:bg-white/5 transition-colors cursor-pointer"
            title="Adjust Speed"
          >
            {speed}x
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMuted((prev) => {
                const next = !prev;
                audioController.setMuted(next);
                return next;
              });
            }}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              !isMuted
                ? "border-amber-400 bg-amber-400/20 text-amber-300 font-bold"
                : "border-white/10 text-slate-400 hover:text-slate-200"
            }`}
            title={isMuted ? "Unmute Audio (M)" : "Mute Sound (M)"}
          >
            {!isMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Center Keyboard Shortcuts */}
        <div className="hidden lg:flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
          <span>Keys:</span>
          <kbd className="rounded bg-white/10 px-1 py-0.5 border border-white/15 text-slate-200">Space</kbd> Play
          <kbd className="rounded bg-white/10 px-1 py-0.5 border border-white/15 text-slate-200">←/→</kbd> Step
          <kbd className="rounded bg-white/10 px-1 py-0.5 border border-white/15 text-slate-200">1-6</kbd> Scene
        </div>

        {/* Step Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentSceneIdx === 0}
            onClick={goToPrev}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            type="button"
            disabled={currentSceneIdx === INFOGRAPHIC_SCENES.length - 1}
            onClick={goToNext}
            className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white border border-white/15 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5 text-amber-400" />
          </button>
        </div>
      </footer>

      {/* Technical Spec Modal */}
      <AnimatePresence>
        {showTechnicalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-2xl bg-[#12141F] p-5 shadow-2xl border border-amber-400/40 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/30">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      VidyaDwaar SIH26263 Grounding
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTechnicalModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <div className="rounded-lg bg-black/40 p-2.5 border border-white/10">
                  <strong className="text-amber-300 block font-semibold">1. Blind HMAC Matching:</strong>
                  Cross-institution duplicate detection uses HMAC blind indexes with secret salts. Institution isolation is strictly enforced via PostgreSQL Row-Level Security (RLS).
                </div>
                <div className="rounded-lg bg-black/40 p-2.5 border border-white/10">
                  <strong className="text-amber-300 block font-semibold">2. Approved Quota Limit:</strong>
                  Intake caps come solely from AICTE approval registries (MOCK).
                </div>
                <div className="rounded-lg bg-black/40 p-2.5 border border-white/10">
                  <strong className="text-amber-300 block font-semibold">3. W3C Verifiable Credentials:</strong>
                  Ed25519 signatures with canonical JCS formatting rendered as tamper-evident Base45 QR codes.
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowTechnicalModal(false)}
                  className="rounded-lg bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-4 py-1.5 text-xs font-black text-black hover:brightness-110 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
