import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  ArrowRight,
} from "lucide-react";
import { SCENES } from "./types";
import { go } from "../../ui";

interface ControlsProps {
  currentSceneIdx: number;
  isPlaying: boolean;
  progressPercent: number;
  speed: number;
  isMuted: boolean;
  isReducedMotion: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectScene: (idx: number) => void;
  onToggleSpeed: () => void;
  onToggleMute: () => void;
  onToggleReducedMotion: () => void;
  onReplay: () => void;
}

export default function Controls({
  currentSceneIdx,
  isPlaying,
  progressPercent,
  speed,
  isMuted,
  isReducedMotion,
  onPlayPause,
  onPrev,
  onNext,
  onSelectScene,
  onToggleSpeed,
  onToggleMute,
  onToggleReducedMotion,
  onReplay,
}: ControlsProps) {
  const currentScene = SCENES[currentSceneIdx];

  return (
    <div className="sticky bottom-4 z-40 mx-auto w-full max-w-5xl px-3 sm:px-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-2xl backdrop-blur-xl">
        {/* Progress Timeline Header */}
        <div className="mb-2.5 flex items-center justify-between text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-mono text-amber-700 font-bold">SCENE {currentScene.number} OF {SCENES.length}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-900 truncate max-w-[240px] sm:max-w-none">{currentScene.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleReducedMotion}
              className={`hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition-colors ${
                isReducedMotion
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              title="Toggle reduced motion animations"
            >
              Reduced Motion: {isReducedMotion ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={() => go("/signin")}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-amber-700 transition-colors"
            >
              Skip to Platform <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Scene Timeline Scrubber */}
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {SCENES.map((s, idx) => {
            const isCurrent = idx === currentSceneIdx;
            const isPast = idx < currentSceneIdx;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectScene(idx)}
                className="group relative h-2 rounded-full overflow-hidden bg-slate-100 hover:bg-slate-200 transition-colors text-left"
                title={`${s.number}. ${s.title}`}
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    isCurrent
                      ? "bg-gradient-to-r from-[#F5C067] to-[#E5A93C]"
                      : isPast
                      ? "bg-slate-400"
                      : "bg-transparent"
                  }`}
                  style={{
                    width: isCurrent ? `${progressPercent}%` : isPast ? "100%" : "0%",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Primary Playback Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Left: Previous / Play-Pause / Next */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentSceneIdx === 0}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous scene (Left Arrow)"
              aria-label="Previous scene"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onPlayPause}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
              title="Play / Pause (Space)"
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

            <button
              type="button"
              onClick={onNext}
              disabled={currentSceneIdx === SCENES.length - 1}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next scene (Right Arrow)"
              aria-label="Next scene"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={onReplay}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors ml-1"
              title="Replay scene (R)"
              aria-label="Replay current scene"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Right: Audio Narration & Speed Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSpeed}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              title="Playback speed"
            >
              <Gauge className="h-3.5 w-3.5 text-slate-400" />
              <span>{speed}x</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isMuted
                  ? "border-slate-200 text-slate-400 hover:bg-slate-50"
                  : "border-amber-300 bg-amber-50/80 text-amber-900"
              }`}
              title="Toggle audio voice narration (M)"
              aria-label={isMuted ? "Unmute narration" : "Mute narration"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Voice ON</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
