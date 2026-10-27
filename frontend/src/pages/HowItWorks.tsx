import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Volume2, ShieldCheck, Info } from "lucide-react";
import { BrandLogo } from "../components/BrandMark";
import { SCENES } from "../components/walkthrough/types";
import { audioController } from "../components/walkthrough/sound";
import Controls from "../components/walkthrough/Controls";
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
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const timerRef = useRef<number | null>(null);
  const currentScene = SCENES[currentSceneIdx];

  // Initialize reduced motion from user system preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setIsReducedMotion(media.matches);
    }
  }, []);

  // Narration speech trigger when scene changes or speech rate updates
  useEffect(() => {
    if (!isMuted && isPlaying) {
      audioController.speak(currentScene.narration, speed);
    } else {
      audioController.stopNarration();
    }
  }, [currentSceneIdx, isMuted, isPlaying, speed]);

  // Scene auto-advance timer loop
  const goToNextScene = useCallback(() => {
    if (currentSceneIdx < SCENES.length - 1) {
      audioController.playSceneTransition();
      setCurrentSceneIdx((prev) => prev + 1);
      setProgressPercent(0);
    } else {
      setIsPlaying(false);
      setProgressPercent(100);
    }
  }, [currentSceneIdx]);

  const goToPrevScene = useCallback(() => {
    if (currentSceneIdx > 0) {
      audioController.playSceneTransition();
      setCurrentSceneIdx((prev) => prev - 1);
      setProgressPercent(0);
    }
  }, [currentSceneIdx]);

  // Ticker for progress bar
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const durationMs = (currentScene.durationSeconds * 1000) / speed;
    const intervalMs = 100;
    const increment = (intervalMs / durationMs) * 100;

    timerRef.current = window.setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          goToNextScene();
          return 0;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSceneIdx, speed, goToNextScene, currentScene.durationSeconds]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          audioController.playClick();
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
          setIsMuted((prev) => {
            const next = !prev;
            audioController.setMuted(next);
            return next;
          });
          break;
        case "KeyR":
          e.preventDefault();
          setProgressPercent(0);
          if (!isMuted) audioController.speak(currentScene.narration, speed);
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
            audioController.playSceneTransition();
            setCurrentSceneIdx(idx);
            setProgressPercent(0);
          }
          break;
        case "Escape":
          go("/");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextScene, goToPrevScene, isMuted, currentScene.narration, speed]);

  const selectScene = (idx: number) => {
    audioController.playSceneTransition();
    setCurrentSceneIdx(idx);
    setProgressPercent(0);
  };

  const toggleSpeed = () => {
    audioController.playClick();
    setSpeed((prev) => (prev === 1.0 ? 1.5 : prev === 1.5 ? 2.0 : 1.0));
  };

  const toggleMute = () => {
    audioController.playClick();
    setIsMuted((prev) => {
      const next = !prev;
      audioController.setMuted(next);
      return next;
    });
  };

  const replay = () => {
    audioController.playClick();
    setProgressPercent(0);
    if (!isMuted) audioController.speak(currentScene.narration, speed);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/60 font-sans text-slate-900 selection:bg-amber-400/20 selection:text-amber-950 flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => go("/")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
            <span className="text-slate-200 hidden sm:inline">|</span>
            <div className="hidden sm:block">
              <BrandLogo size="sm" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              title="Show implementation grounding notes"
            >
              <Info className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Technical Grounding</span>
            </button>

            <button
              type="button"
              onClick={() => go("/signin")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#F5C067] to-[#E5A93C] px-4 py-2 text-xs font-bold text-black shadow-sm hover:brightness-110 transition-all"
            >
              <span>Live Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Walkthrough Content Container */}
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-8 py-8 flex-1">
        {/* Editorial Subtitle & Badge */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-extrabold tracking-wider text-amber-600 uppercase">
            {currentScene.badge}
          </span>
          <span className="text-xs text-slate-600 font-medium">
            Step {currentScene.number} of {SCENES.length} · Interactive Walkthrough
          </span>
        </div>

        {/* Dynamic Scene Transition View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: isReducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isReducedMotion ? 0 : -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-3xl border border-slate-200/90 bg-white/80 p-6 sm:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-xl"
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

        {/* Dynamic Narration Subtitle Transcript Bar */}
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Volume2 className="h-4 w-4 text-amber-600" />
              Narration Transcript (Live Audio Companion)
            </span>
            <span className="text-[11px] text-slate-600 font-medium">
              Press <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">Space</kbd> to Pause · <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">M</kbd> to Mute Voice
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700 italic">
            "{currentScene.narration}"
          </p>
        </div>

        {/* Technical Grounding Drawer (Optional / Expandable) */}
        {showTechnicalDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs text-amber-950"
          >
            <div className="flex items-center gap-2 font-bold mb-1 text-amber-900">
              <ShieldCheck className="h-4 w-4 text-amber-700" />
              Underlying Platform Implementation &amp; Backend Grounding
            </div>
            <p className="leading-relaxed">{currentScene.technicalGrounding}</p>
          </motion.div>
        )}
      </main>

      {/* Floating Bottom Cinematic Controls Bar */}
      <Controls
        currentSceneIdx={currentSceneIdx}
        isPlaying={isPlaying}
        progressPercent={progressPercent}
        speed={speed}
        isMuted={isMuted}
        isReducedMotion={isReducedMotion}
        onPlayPause={() => {
          audioController.playClick();
          setIsPlaying((prev) => !prev);
        }}
        onPrev={goToPrevScene}
        onNext={goToNextScene}
        onSelectScene={selectScene}
        onToggleSpeed={toggleSpeed}
        onToggleMute={toggleMute}
        onToggleReducedMotion={() => setIsReducedMotion((prev) => !prev)}
        onReplay={replay}
      />
    </div>
  );
}
