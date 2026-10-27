/**
 * Client-side audio synthesizer & Web Speech API narrator for the walkthrough.
 * Requires no external audio assets; runs smoothly in modern browsers.
 */

class AudioController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazily init AudioContext upon first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopNarration();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /** Subtle chime when switching scenes */
  public playSceneTransition() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, this.ctx.currentTime + 0.12); // E5

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {
      // AudioContext policy suppression gracefully handled
    }
  }

  /** Subtle click on control buttons */
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Gracefully ignored
    }
  }

  /** Crystal verification success chime */
  public playSuccess() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5
      osc.frequency.setValueAtTime(880.00, this.ctx.currentTime + 0.1); // A5

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {
      // Gracefully ignored
    }
  }

  /** Radar ping sound */
  public playPing() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // Gracefully ignored
    }
  }

  /** Speak scene narration text using Web Speech API */
  public speak(text: string, speed: number = 1.0, onEnd?: () => void) {
    if (this.isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.min(Math.max(speed, 0.8), 1.8);
      utterance.pitch = 1.0;
      utterance.lang = "en-IN"; // Prefer English (India) or fallback

      // Look for preferred English voices if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => (v.lang === "en-IN" || v.lang.startsWith("en")) && !v.name.includes("whisper")
      );
      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onend = () => {
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {};

      window.speechSynthesis.speak(utterance);
    } catch {
      // Browser Speech API gracefully handled
    }
  }

  public stopNarration() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  public pauseNarration() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
  }

  public resumeNarration() {
    if (typeof window !== "undefined" && "speechSynthesis" in window && !this.isMuted) {
      window.speechSynthesis.resume();
    }
  }
}

export const audioController = new AudioController();
