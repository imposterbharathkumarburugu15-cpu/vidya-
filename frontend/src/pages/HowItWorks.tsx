import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Gauge,
  Info,
  ShieldCheck,
  X,
  ExternalLink,
} from "lucide-react";
import { BrandLogo } from "../components/BrandMark";
import { SCENES } from "../components/walkthrough/types";
import { audioController } from "../components/walkthrough/sound";
import Scene1Challenge from "../components/walkthrough/Scene1Challenge";
import Scene2IntegrityEngine from "../components/walkthrough/Scene2IntegrityEngine";
import Scene3PrivacyMatching from "../components/walkthrough/Scene3PrivacyMatching";
import Scene4EvidenceResolution from "../components/walkthrough/Scene4EvidenceResolution";
import Scene5PolicySimulation from "../components/walkthrough/Scene5PolicySimulation";
import Scene6VerifiableCredentials from "../components/walkthrough/Scene6VerifiableCredentials";
import Scene7TrustNetwork from "../components/walkthrough/Scene7TrustNetwork";
import { go } from "../ui";

export default function HowItWorks() {
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [currentBeatIdx, setCurrentBeatIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [sceneProgress, setSceneProgress] = useState<number>(0);

  // ResizeObserver for fixed-aspect canvas stage scaling
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState<number>(1);

  const currentScene = SCENES[currentSceneIdx];
  const beats = currentScene.beats && currentScene.beats.length > 0 ? currentScene.beats : [
    { ms: 7000, line: currentScene.title, sub: currentScene.subtitle },
  ];
  const currentBeat = beats[Math.min(currentBeatIdx, beats.length - 1)];

  // Auto-scale canvas stage to fit viewport smoothly
  useEffect(() => {
    const el = stageContainerRef.current;
    if (!el) return;

    const updateScale = () => {
      const rect = el.getBoundingClientRect();
      // Base stage design is 1120px by 450px
      const scaleW = rect.width / 1120;
      const scaleH = rect.height / 450;
      const scale = Math.min(1, Math.min(scaleW, scaleH));
      setStageScale(scale > 0.35 ? scale : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  // Initialize reduced motion from user preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setIsReducedMotion(media.matches);
    }
  }, []);

  // Voice narration & audio companion on scene/beat change
  useEffect(() => {
    if (!isMuted && isPlaying) {
      audioController.speak(`${currentBeat.line}. ${currentBeat.sub}`, speed);
    } else {
      audioController.stopNarration();
    }
  }, [currentSceneIdx, currentBeatIdx, isMuted, isPlaying, speed, currentBeat.line, currentBeat.sub]);

  // Scene navigation handlers
  const goToNextScene = useCallback(() => {
    if (currentSceneIdx < SCENES.length - 1) {
      audioController.playSceneTransition();
      setCurrentSceneIdx((prev) => prev + 1);
      setCurrentBeatIdx(0);
      setSceneProgress(0);
    } else {
      setIsPlaying(false);
      setSceneProgress(100);
    }
  }, [currentSceneIdx]);

  const goToPrevScene = useCallback(() => {
    if (currentSceneIdx > 0) {
      audioController.playSceneTransition();
      setCurrentSceneIdx((prev) => prev - 1);
      setCurrentBeatIdx(0);
      setSceneProgress(0);
    }
  }, [currentSceneIdx]);

  const selectScene = (idx: number) => {
    if (idx !== currentSceneIdx) {
      audioController.playSceneTransition();
      setCurrentSceneIdx(idx);
      setCurrentBeatIdx(0);
      setSceneProgress(0);
    }
  };

  // Beat progression & progress timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const beatDurationMs = (currentBeat.ms || 6500) / speed;
    const tickIntervalMs = 50;
    const progressPerTick = (tickIntervalMs / ((currentScene.durationSeconds * 1000) / speed)) * 100;

    const interval = setInterval(() => {
      setSceneProgress((prev) => Math.min(100, prev + progressPerTick));
    }, tickIntervalMs);

    const beatTimeout = setTimeout(() => {
      if (currentBeatIdx < beats.length - 1) {
        setCurrentBeatIdx((prev) => prev + 1);
      } else {
        goToNextScene();
      }
    }, beatDurationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(beatTimeout);
    };
  }, [isPlaying, currentSceneIdx, currentBeatIdx, speed, beats.length, currentBeat.ms, currentScene.durationSeconds, goToNextScene]);

  // Keyboard navigation shortcuts
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
        case "PageDown":
          e.preventDefault();
          goToNextScene();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          goToPrevScene();
          break;
        case "KeyM":
          e.preventDefault();
          audioController.playClick();
          setIsMuted((prev) => {
            const next = !prev;
            audioController.setMuted(next);
            return next;
          });
          break;
        case "KeyR":
          e.preventDefault();
          audioController.playClick();
          setCurrentBeatIdx(0);
          setSceneProgress(0);
          break;
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit5":
        case "Digit6":
        case "Digit7":
          const idx = parseInt(e.key, 10) - 1;
          if (idx >= 0 && idx < SCENES.length) {
            selectScene(idx);
          }
          break;
        case "Escape":
          e.preventDefault();
          if (showTechnicalDetails) {
            setShowTechnicalDetails(false);
          } else {
            go("/");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextScene, goToPrevScene, showTechnicalDetails]);

  const toggleSpeed = () => {
    audioController.playClick();
    setSpeed((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 2.0 : prev === 2.0 ? 0.75 : 1.0));
  };

  const toggleMute = () => {
    audioController.playClick();
    setIsMuted((prev) => {
      const next = !prev;
      audioController.setMuted(next);
      return next;
    });
  };

  const replayCurrentScene = () => {
    audioController.playClick();
    setCurrentBeatIdx(0);
    setSceneProgress(0);
    setIsPlaying(true);
  };

  const chapterShortTitles = [
    "01 Silos",
    "02 Engine",
    "03 Privacy",
    "04 Evidence",
    "05 Policy",
    "06 Credentials",
    "07 Network",
  ];

  return (
    <div className="fixed inset-0 bg-[#07090E] p-2 sm:p-3 md:p-4 overflow-hidden select-none font-sans z-50 text-slate-900">
      {/* Outer Obsidian Bezel */}
      <div className="h-full max-w-[1520px] mx-auto bg-[#181A20] rounded-[28px] sm:rounded-[32px] p-2 sm:p-2.5 shadow-2xl border border-white/10 flex flex-col justify-between overflow-hidden relative">
        
        {/* Inner Theatre Stage Card */}
        <div className="h-full bg-slate-50/95 rounded-[22px] sm:rounded-[24px] text-slate-900 flex flex-col justify-between overflow-hidden relative p-3 sm:p-5 md:p-6 shadow-inner">
          
          {/* Top Chapter Progress Scrubber & Navigation Header */}
          <header className="flex items-center justify-between gap-3 shrink-0 pb-3 border-b border-slate-200/80 z-20">
            {/* Left: Brand & Return to Home */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => go("/")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs"
                title="Return to Main Platform (Esc)"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Platform</span>
              </button>
              <span className="text-slate-300 hidden md:inline">|</span>
              <div className="hidden sm:block">
                <BrandLogo size="sm" />
              </div>
            </div>

            {/* Center: 7 Chapter Tabs with Progress Lines */}
            <div className="flex items-center gap-1 sm:gap-1.5 max-w-2xl flex-1 justify-center overflow-x-auto py-1 scrollbar-none">
              {SCENES.map((scene, idx) => {
                const isCurrent = idx === currentSceneIdx;
                const isPast = idx < currentSceneIdx;

                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => selectScene(idx)}
                    className={`group flex flex-col items-center px-2 py-1 rounded-xl transition-all ${
                      isCurrent
                        ? "bg-slate-900 text-amber-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                    title={`Jump to Scene ${idx + 1}: ${scene.title}`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap">
                      {chapterShortTitles[idx]}
                    </span>
                    <div className="w-8 sm:w-12 h-1 rounded-full bg-slate-200 overflow-hidden mt-1">
                      <div
                        className={`h-full transition-all duration-150 ${
                          isCurrent
                            ? "bg-gradient-to-r from-amber-400 to-amber-500"
                            : isPast
                            ? "bg-slate-900"
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
            </div>

            {/* Right: Technical Notes & Live Portal Link */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                title="Underlying Architecture & SIH Compliance Notes"
              >
                <Info className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden lg:inline">Technical Grounding</span>
              </button>

              <button
                type="button"
                onClick={() => go("/signin")}
                className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#F5C067] via-[#E5A93C] to-[#D4AF37] px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm hover:brightness-110 transition-all"
              >
                <span>Live Portal</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </header>

          {/* Center Stage: Fixed-Aspect Scaled Interactive Canvas */}
          <div
            ref={stageContainerRef}
            className="flex-1 w-full relative flex items-center justify-center overflow-hidden my-2"
          >
            <div
              style={{
                width: 1120,
                height: 450,
                transform: `scale(${stageScale})`,
                transformOrigin: "center center",
              }}
              className="shrink-0 relative flex items-center justify-center select-none"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScene.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full h-full"
                >
                  {currentSceneIdx === 0 && <Scene1Challenge isReducedMotion={isReducedMotion} />}
                  {currentSceneIdx === 1 && <Scene2IntegrityEngine isReducedMotion={isReducedMotion} />}
                  {currentSceneIdx === 2 && <Scene3PrivacyMatching isReducedMotion={isReducedMotion} />}
                  {currentSceneIdx === 3 && <Scene4EvidenceResolution isReducedMotion={isReducedMotion} />}
                  {currentSceneIdx === 4 && <Scene5PolicySimulation isReducedMotion={isReducedMotion} />}
                  {currentSceneIdx === 5 && <Scene6VerifiableCredentials isReducedMotion={isReducedMotion} />}
                  {currentSceneIdx === 6 && (
                    <Scene7TrustNetwork
                      isReducedMotion={isReducedMotion}
                      onReplay={() => selectScene(0)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Storytelling & Controls Zone */}
          <footer className="shrink-0 pt-3 border-t border-slate-200/80 flex flex-col md:flex-row md:items-end justify-between gap-4 z-20">
            {/* Left: Dynamic Kinetic Word-by-Word Story Headline */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] font-extrabold tracking-wider text-amber-700 uppercase flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  {currentScene.badge}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Beat {currentBeatIdx + 1} of {beats.length}
                </span>
              </div>

              {/* Kinetic Typography Reveal matching SAKSHI Reference */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug min-h-[2.2rem]">
                {currentBeat.line.split(" ").map((word, i) => (
                  <motion.span
                    key={`${currentSceneIdx}-${currentBeatIdx}-${word}-${i}`}
                    initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.45, delay: i * 0.05 }}
                    className="inline-block mr-2"
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>

              <motion.p
                key={`sub-${currentSceneIdx}-${currentBeatIdx}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl line-clamp-2"
              >
                {currentBeat.sub}
              </motion.p>
            </div>

            {/* Right: Floating Pill Playback Controls */}
            <div className="flex items-center gap-2 shrink-0 bg-white/95 p-1.5 rounded-2xl border border-slate-200/90 shadow-lg backdrop-blur-md">
              {/* Prev Scene */}
              <button
                type="button"
                onClick={goToPrevScene}
                disabled={currentSceneIdx === 0}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous Scene (←)"
                aria-label="Previous Scene"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={() => {
                  audioController.playClick();
                  setIsPlaying((prev) => !prev);
                }}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-amber-400 shadow-sm hover:bg-slate-800 transition-colors"
                title="Play / Pause Walkthrough (Space)"
                aria-label={isPlaying ? "Pause walkthrough" : "Play walkthrough"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Play</span>
                  </>
                )}
              </button>

              {/* Next Scene */}
              <button
                type="button"
                onClick={goToNextScene}
                disabled={currentSceneIdx === SCENES.length - 1}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next Scene (→)"
                aria-label="Next Scene"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="h-5 w-px bg-slate-200 mx-0.5" />

              {/* Speed Selector */}
              <button
                type="button"
                onClick={toggleSpeed}
                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                title="Playback Speed"
              >
                <Gauge className="h-3.5 w-3.5 text-slate-500" />
                <span>{speed}x</span>
              </button>

              {/* Sound Audio Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  isMuted
                    ? "text-slate-400 hover:bg-slate-100"
                    : "bg-amber-50 text-amber-900 border border-amber-300"
                }`}
                title="Audio Voice Companion (M)"
                aria-label={isMuted ? "Unmute voice narration" : "Mute voice narration"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4 text-amber-600" />
                )}
              </button>

              {/* Replay Scene */}
              <button
                type="button"
                onClick={replayCurrentScene}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Replay Current Scene (R)"
                aria-label="Replay Scene"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* Technical Grounding Drawer Modal */}
      <AnimatePresence>
        {showTechnicalDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="h-5 w-5 text-amber-600" />
                  <span>Technical Grounding &amp; Architecture</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-700">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Current Scene</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {currentScene.number}. {currentScene.title}
                  </div>
                  <p className="mt-2 text-slate-600">{currentScene.technicalGrounding}</p>
                </div>

                <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200/80 text-amber-950">
                  <div className="font-bold mb-1">SIH 2026 Problem Statement 26263 Compliance</div>
                  <p>
                    Vidyadwaar models multi-institution enrolment integrity, salted blind indexing, OCR evidence verification, counterfactual policy simulation, and W3C VC 2.0 digital degrees.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px]">Esc</kbd> to Close</span>
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
