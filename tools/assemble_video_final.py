import subprocess
import os
import json

PROJECT_FILE = "video_production/project.json"
FFMPEG = "tools/ffmpeg.exe"

with open(PROJECT_FILE, "r") as f:
    project = json.load(f)

timeline = project["timeline"]
clip_files = []

print("=== Phase 1: Generating Individual 1080p Scene Video Clips (12 Scenes) ===")
for scene in timeline:
    scene_id = scene["scene_id"]
    visual = scene["visual"]
    audio = scene["audio"]
    clip_path = f"video_production/scenes/clip_{scene_id:02d}.mp4"
    clip_files.append(clip_path)
    
    print(f"Rendering Clip {scene_id:02d}: {scene['title']} ({scene['duration_seconds']:.2f}s)...")
    
    # Render crisp 1080p clip with exact audio duration and matching AAC stream
    cmd = [
        FFMPEG, "-y",
        "-loop", "1",
        "-framerate", "30",
        "-i", visual,
        "-i", audio,
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-preset", "veryfast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "44100",
        "-shortest",
        clip_path
    ]
    subprocess.run(cmd, check=True)

print("\n=== Phase 2: Concatenating 12 Scene Video Clips ===")
concat_list_path = "video_production/concat_list_12.txt"
with open(concat_list_path, "w", encoding="utf-8") as f:
    for c in clip_files:
        abs_c = os.path.abspath(c).replace("\\", "/")
        f.write(f"file '{abs_c}'\n")

raw_combined = "video_production/scenes/raw_combined_12.mp4"
concat_cmd = [
    FFMPEG, "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_list_path,
    "-c", "copy",
    raw_combined
]
subprocess.run(concat_cmd, check=True)
print("Raw 12-scene video combined successfully.")

print("\n=== Phase 3: Mixing Background Music and Embedding English Subtitles ===")
bg_music = project["background_music"]["file"]
srt_file = project["subtitles"]["file"]
final_mp4 = "VidyaDwaar_SIH_Demo_Final.mp4"
backup_mp4 = "video_production/VidyaDwaar_SIH_Demo_Final.mp4"

# Mix voiceover with subtle background music and embed subtitles
mix_cmd = [
    FFMPEG, "-y",
    "-i", raw_combined,
    "-stream_loop", "-1",
    "-i", bg_music,
    "-i", srt_file,
    "-filter_complex", "[0:a]volume=1.0[vocal];[1:a]volume=0.07[bg];[vocal][bg]amix=inputs=2:duration=first:dropout_transition=2[aout]",
    "-map", "0:v",
    "-map", "[aout]",
    "-map", "2:s",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-c:s", "mov_text",
    "-metadata:s:s:0", "language=eng",
    "-metadata:s:s:0", "title=English Subtitles",
    "-movflags", "+faststart",
    final_mp4
]
subprocess.run(mix_cmd, check=True)

# Also copy to backup directory
subprocess.run([FFMPEG, "-y", "-i", final_mp4, "-c", "copy", backup_mp4], check=True)

print("\n=== VIDYADWAAR SIH FINAL VIDEO PRODUCTION COMPLETE! ===")
print(f"Primary Output: {final_mp4}")
print(f"Backup Output: {backup_mp4}")

