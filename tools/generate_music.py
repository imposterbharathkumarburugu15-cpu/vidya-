import wave
import struct
import math
import subprocess
import os

SAMPLE_RATE = 44100
DURATION = 500  # 8.33 minutes (covers 7.6 minute video seamlessly)

# Chord frequencies in Hz: Warm tech ambient pad (Cmaj7 -> Fmaj7 -> Am7 -> G)
CHORDS = [
    [130.81, 164.81, 196.00, 246.94],  # C3, E3, G3, B3 (Cmaj7)
    [174.61, 220.00, 261.63, 329.63],  # F3, A3, C4, E4 (Fmaj7)
    [110.00, 164.81, 220.00, 261.63],  # A2, E3, A3, C4 (Am7)
    [146.83, 196.00, 246.94, 293.66],  # D3, G3, B3, D4 (G/D)
]
CHORD_DURATION = 8.0  # 8 seconds per chord

print("Synthesizing ambient background music track (500s)...")
wav_path = "video_production/music/ambient_pad.wav"
mp3_path = "video_production/music/ambient_pad.mp3"
os.makedirs("video_production/music", exist_ok=True)

with wave.open(wav_path, "w") as wav_file:
    wav_file.setnchannels(2)  # Stereo
    wav_file.setsampwidth(2)  # 16-bit
    wav_file.setframerate(SAMPLE_RATE)
    
    total_samples = int(SAMPLE_RATE * DURATION)
    buffer = bytearray()
    
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        chord_idx = int((t / CHORD_DURATION) % len(CHORDS))
        chord = CHORDS[chord_idx]
        
        # Smooth envelope for chord transitions
        phase_in_chord = (t % CHORD_DURATION) / CHORD_DURATION
        env = math.sin(phase_in_chord * math.pi) ** 1.5
        
        # LFO for subtle stereo movement
        lfo_left = 0.8 + 0.2 * math.sin(2 * math.pi * 0.1 * t)
        lfo_right = 0.8 + 0.2 * math.cos(2 * math.pi * 0.1 * t)
        
        sample_val = 0.0
        for f in chord:
            sample_val += math.sin(2 * math.pi * f * t) * 0.6
            sample_val += math.sin(2 * math.pi * (f * 2) * t) * 0.2
        
        sample_val = (sample_val / len(chord)) * env * 0.07  # gentle volume (subtle background)
        
        left = int(max(-32767, min(32767, sample_val * lfo_left * 32767)))
        right = int(max(-32767, min(32767, sample_val * lfo_right * 32767)))
        
        buffer.extend(struct.pack("<hh", left, right))
        
        if len(buffer) >= 65536:
            wav_file.writeframes(buffer)
            buffer.clear()
            
    if buffer:
        wav_file.writeframes(buffer)

print(f"Saved WAV: {wav_path}")
# Convert to MP3 using ffmpeg
subprocess.run([
    "tools/ffmpeg.exe", "-y",
    "-i", wav_path,
    "-c:a", "libmp3lame",
    "-b:a", "192k",
    mp3_path
], check=True)
print(f"Saved MP3: {mp3_path}")
