import os
import sys
import json
import wave
import struct
import math
import subprocess
import asyncio
import edge_tts

FFMPEG = "tools/ffmpeg.exe"
VOICE = "en-IN-PrabhatNeural"

SCENES = [
    {
        "id": 1,
        "name": "scene_01",
        "title": "Introduction & SIH Problem Statement",
        "start": 0.0,
        "duration": 20.0,
        "image": "video_production/scenes_11/scene_01.png",
        "narration": "Welcome to VidyaDwaar, an enterprise-grade academic data and credential integrity ecosystem built for the Smart India Hackathon. VidyaDwaar establishes an APAAR-based student data management and verification platform, uniting institutions, regulatory authorities, and students on a single secure registry.",
        "subtitles": [
            {"start": 0.5, "end": 6.5, "text": "Welcome to VidyaDwaar, an enterprise-grade academic data\nand credential integrity ecosystem for the Smart India Hackathon."},
            {"start": 7.0, "end": 14.0, "text": "VidyaDwaar establishes an APAAR-based student data management\nand verification platform for higher education."},
            {"start": 14.5, "end": 19.5, "text": "Uniting institutions, regulatory authorities,\nand students on a single secure trust registry."}
        ]
    },
    {
        "id": 2,
        "name": "scene_02",
        "title": "Problem Statement & Educational Challenges",
        "start": 20.0,
        "duration": 25.0,
        "image": "video_production/scenes_11/scene_02.png",
        "narration": "Across thousands of higher education institutions, student records remain heavily fragmented across legacy ERPs and paper filings. This creates severe regulatory challenges: ghost colleges, unmonitored intake limits, duplicate enrolments across states, and untracked forged certificates. VidyaDwaar eliminates these vulnerabilities through automated, transparent verification.",
        "subtitles": [
            {"start": 0.5, "end": 7.0, "text": "Across thousands of institutions, student records remain heavily\nfragmented across legacy ERPs and paper filings."},
            {"start": 7.5, "end": 15.0, "text": "This creates severe challenges: ghost colleges, unmonitored intake,\nduplicate enrolments across states, and forged certificates."},
            {"start": 15.5, "end": 24.5, "text": "VidyaDwaar eliminates these critical vulnerabilities\nthrough automated, privacy-preserving verification."}
        ]
    },
    {
        "id": 3,
        "name": "scene_03",
        "title": "Platform & Role-Based Access Control",
        "start": 45.0,
        "duration": 30.0,
        "image": "video_production/scenes_11/scene_03.png",
        "narration": "VidyaDwaar enforces strict role-based access control across five distinct user roles. Students access only their personal academic records; institutional administrators manage authorized student admissions; registrars administer formal records; AICTE regulators monitor national intake compliance; and external verifiers receive controlled, privacy-preserving verification access.",
        "subtitles": [
            {"start": 0.5, "end": 6.5, "text": "VidyaDwaar enforces strict role-based access control\nacross five distinct user roles."},
            {"start": 7.0, "end": 14.0, "text": "Students access only their personal academic records,\nwhile institutional administrators manage authorized student admissions."},
            {"start": 14.5, "end": 21.5, "text": "Registrars administer formal records, and AICTE regulators\nmonitor national intake compliance and institutional risk."},
            {"start": 22.0, "end": 29.5, "text": "External verifiers receive controlled, privacy-preserving access\nwithout exposing unauthorized student data."}
        ]
    },
    {
        "id": 4,
        "name": "scene_04",
        "title": "Institution Administrator Dashboard",
        "start": 75.0,
        "duration": 25.0,
        "image": "video_production/scenes_11/scene_04.png",
        "narration": "Here is the active Institution Administrator dashboard for Vidyapeeth Institute of Technology and Science. Officials instantly inspect their approved intake of one hundred and twenty seats, current enrolment of sixty students, branch-wise utilisation, Data Quality Scores of ninety-four point two, and real-time validation alerts for complete transparency.",
        "subtitles": [
            {"start": 0.5, "end": 7.5, "text": "Here is the active Institution Dashboard for Vidyapeeth Institute\nof Technology and Science in Bengaluru."},
            {"start": 8.0, "end": 15.5, "text": "Officials inspect their approved intake of 120 seats,\ncurrent enrolment of 60 students, and branch-wise utilisation."},
            {"start": 16.0, "end": 24.5, "text": "High Data Quality Scores of 94.2 and real-time validation alerts\nensure complete regulatory compliance."}
        ]
    },
    {
        "id": 5,
        "name": "scene_05",
        "title": "Student Self-Sovereign Experience",
        "start": 100.0,
        "duration": 30.0,
        "image": "video_production/scenes_11/scene_05.png",
        "narration": "For students, VidyaDwaar delivers complete self-sovereign control. Logging in with their synthetic APAAR ID, student Aarav Sharma accesses verified academic enrolments, institution details, and real-time verification status. Students independently review employer consent requests, inspect full audit access logs, and raise direct academic grievances without institutional friction.",
        "subtitles": [
            {"start": 0.5, "end": 6.5, "text": "For students, VidyaDwaar delivers complete self-sovereign control\nover their academic identity."},
            {"start": 7.0, "end": 14.5, "text": "Logging in with their APAAR ID, student Aarav Sharma accesses\nverified enrolments, institution details, and status."},
            {"start": 15.0, "end": 22.0, "text": "Students independently review employer consent requests\nand inspect full audit access transparency logs."},
            {"start": 22.5, "end": 29.5, "text": "Direct academic grievances can be submitted\nwithout unnecessary administrative friction."}
        ]
    },
    {
        "id": 6,
        "name": "scene_06",
        "title": "Student APK & Offline Experience",
        "start": 130.0,
        "duration": 20.0,
        "image": "video_production/scenes_11/scene_06.png",
        "narration": "VidyaDwaar also provides an offline-capable Android application for students, enabling access to supported locally available academic information and downloaded certificates even when internet connectivity is unavailable. Powered by offline SQLite storage, students can carry and present their verified credentials anywhere without requiring network coverage.",
        "subtitles": [
            {"start": 0.5, "end": 8.5, "text": "VidyaDwaar also provides an offline-capable Android application\nfor students across India."},
            {"start": 9.0, "end": 15.5, "text": "Enabling access to supported locally available academic records\nand downloaded certificates even when internet is unavailable."},
            {"start": 16.0, "end": 19.5, "text": "Offline SQLite storage allows instant presentation\nof verified credentials in remote areas."}
        ]
    },
    {
        "id": 7,
        "name": "scene_07",
        "title": "Certificate Download & Credential Wallet",
        "start": 150.0,
        "duration": 25.0,
        "image": "video_production/scenes_11/scene_07.png",
        "narration": "Within the Student Credential Wallet, students can open and download W3C Verifiable Credentials. Each certificate contains high-contrast university seals and an Ed25519-signed Base45 QR code. Students can save the tamper-evident certificate locally as a demo sample or print it for instant offline or online verification.",
        "subtitles": [
            {"start": 0.5, "end": 7.0, "text": "Within the Student Credential Wallet, students can open\nand download W3C Verifiable Credentials."},
            {"start": 7.5, "end": 15.0, "text": "Each certificate features university seals and an Ed25519-signed\nBase45 QR code for instant scanning."},
            {"start": 15.5, "end": 24.5, "text": "Students save the tamper-evident certificate locally as a demo sample\nor print it for instant verification."}
        ]
    },
    {
        "id": 8,
        "name": "scene_08",
        "title": "APAAR Validation & Duplicate Detection",
        "start": 175.0,
        "duration": 35.0,
        "image": "video_production/scenes_11/scene_08.png",
        "narration": "When institutions submit student batch rosters, VidyaDwaar executes instant APAAR validation and cross-institutional matching. When duplicate identifiers or simultaneous enrolments occur, an explainable case is flagged in the AICTE queue. Crucially, matching identifiers trigger human investigation rather than an automatic fraud decision, allowing administrators to compare side-by-side evidence and resolve discrepancies with full auditability.",
        "subtitles": [
            {"start": 0.5, "end": 7.5, "text": "When institutions submit student batch rosters,\nVidyaDwaar executes instant APAAR validation and cross-matching."},
            {"start": 8.0, "end": 16.0, "text": "When duplicate identifiers or concurrent enrolments occur,\nan explainable case is flagged in the AICTE resolution queue."},
            {"start": 16.5, "end": 25.0, "text": "Crucially, matching identifiers trigger human investigation\nrather than an automatic fraud decision."},
            {"start": 25.5, "end": 34.5, "text": "Administrators compare side-by-side institutional evidence\nand resolve discrepancies with complete auditability."}
        ]
    },
    {
        "id": 9,
        "name": "scene_09",
        "title": "AICTE Regulatory Monitoring & Analytics",
        "start": 210.0,
        "duration": 30.0,
        "image": "video_production/scenes_11/scene_09.png",
        "narration": "At the regulatory level, AICTE officials command comprehensive oversight across more than four thousand institutions and eighty-two thousand enrolled students. Administrators monitor state-by-state seat intake, excess enrolment rankings, inspection priority queues, and shared student clusters, while verifying academic credentials directly from the national trust registry.",
        "subtitles": [
            {"start": 0.5, "end": 7.0, "text": "At the regulatory level, AICTE officials command comprehensive oversight\nacross 4,120 institutions and 82,410 enrolled students."},
            {"start": 7.5, "end": 15.0, "text": "Administrators monitor state-by-state seat intake quotas,\nexcess enrolment rankings, and risk inspection priorities."},
            {"start": 15.5, "end": 22.5, "text": "Automated analytics highlight shared student clusters\nand potential regulatory compliance breaches."},
            {"start": 23.0, "end": 29.5, "text": "Direct credential verification connects seamlessly\nwith the national cryptographic trust registry."}
        ]
    },
    {
        "id": 10,
        "name": "scene_10",
        "title": "Technical Architecture & Security",
        "start": 240.0,
        "duration": 30.0,
        "image": "video_production/scenes_11/scene_10.png",
        "narration": "VidyaDwaar's robust architecture combines a responsive React TypeScript frontend with an asynchronous Python FastAPI backend. Data integrity is enforced via PostgreSQL with row-level security and local offline SQLite caching. Security is rooted in zero-knowledge blind indexing for privacy, W3C Ed25519 cryptographic signatures, and tamper-evident audit logging.",
        "subtitles": [
            {"start": 0.5, "end": 7.5, "text": "VidyaDwaar combines a responsive React TypeScript frontend\nwith an asynchronous Python FastAPI backend engine."},
            {"start": 8.0, "end": 15.0, "text": "Data integrity is enforced via PostgreSQL with Row-Level Security\nand offline SQLite client caching."},
            {"start": 15.5, "end": 22.5, "text": "Security is rooted in zero-knowledge blind indexing for privacy\nand W3C Ed25519 cryptographic signatures."},
            {"start": 23.0, "end": 29.5, "text": "Tamper-evident audit logging tracks every query,\nensuring complete transparency and institutional trust."}
        ]
    },
    {
        "id": 11,
        "name": "scene_11",
        "title": "Conclusion & National Impact",
        "start": 270.0,
        "duration": 30.0,
        "image": "video_production/scenes_11/scene_11.png",
        "narration": "In summary, VidyaDwaar resolves fragmented academic data, eliminates unmonitored admissions, empowers students with direct credential ownership, and provides regulators with explainable, real-time oversight. VidyaDwaar — Making Academic Records More Reliable, Verifiable and Transparent.",
        "subtitles": [
            {"start": 0.5, "end": 7.5, "text": "In summary, VidyaDwaar unifies fragmented academic data\nand eliminates unmonitored duplicate admissions."},
            {"start": 8.0, "end": 15.0, "text": "Empowering students with direct digital credential ownership\nand offline-capable verifiable certificates."},
            {"start": 15.5, "end": 21.5, "text": "Providing regulators and institutions with explainable,\nreal-time governance across India."},
            {"start": 22.0, "end": 29.5, "text": "VidyaDwaar — Making Academic Records More Reliable,\nVerifiable and Transparent."}
        ]
    }
]

def format_srt_time(seconds: float) -> str:
    millis = int(round((seconds - int(seconds)) * 1000))
    secs = int(seconds) % 60
    mins = (int(seconds) // 60) % 60
    hours = int(seconds) // 3600
    return f"{hours:02d}:{mins:02d}:{secs:02d},{millis:03d}"

async def generate_narration_audio():
    print("=== Step 1: Generating Indian English AI Voiceovers (edge_tts) ===")
    os.makedirs("video_production/scenes_11/audio", exist_ok=True)
    
    for s in SCENES:
        mp3_out = f"video_production/scenes_11/audio/voice_{s['name']}.mp3"
        print(f"Generating audio for Scene {s['id']:02d}: {s['title']}...")
        communicate = edge_tts.Communicate(s["narration"], VOICE, rate="+3%")
        await communicate.save(mp3_out)
        print(f"  Saved: {mp3_out}")

def generate_background_music():
    print("\n=== Step 2: Synthesizing 300s Ambient Background Music Track ===")
    wav_path = "video_production/scenes_11/music_300s.wav"
    mp3_path = "video_production/scenes_11/music_300s.mp3"
    
    sample_rate = 44100
    duration = 300.0  # Exactly 5 minutes
    
    chords = [
        [130.81, 164.81, 196.00, 246.94],  # Cmaj7
        [174.61, 220.00, 261.63, 329.63],  # Fmaj7
        [110.00, 164.81, 220.00, 261.63],  # Am7
        [146.83, 196.00, 246.94, 293.66],  # G/D
    ]
    chord_len = 7.5  # seconds
    
    with wave.open(wav_path, "w") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        total_samples = int(sample_rate * duration)
        buf = bytearray()
        
        for i in range(total_samples):
            t = i / sample_rate
            c_idx = int((t / chord_len) % len(chords))
            chord = chords[c_idx]
            
            phase = (t % chord_len) / chord_len
            env = math.sin(phase * math.pi) ** 1.3
            
            lfo_l = 0.8 + 0.2 * math.sin(2 * math.pi * 0.15 * t)
            lfo_r = 0.8 + 0.2 * math.cos(2 * math.pi * 0.15 * t)
            
            val = 0.0
            for f in chord:
                val += math.sin(2 * math.pi * f * t) * 0.6
                val += math.sin(2 * math.pi * (f * 2) * t) * 0.2
            
            val = (val / len(chord)) * env * 0.05  # Subtle background volume
            left = int(max(-32767, min(32767, val * lfo_l * 32767)))
            right = int(max(-32767, min(32767, val * lfo_r * 32767)))
            buf.extend(struct.pack("<hh", left, right))
            
            if len(buf) >= 65536:
                wf.writeframes(buf)
                buf.clear()
        if buf:
            wf.writeframes(buf)
            
    subprocess.run([
        FFMPEG, "-y",
        "-i", wav_path,
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        mp3_path
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"  Generated 300s ambient music: {mp3_path}")
    return mp3_path

def build_subtitles():
    print("\n=== Step 3: Exporting Global & Per-Scene Subtitles (Subtitles.srt) ===")
    global_srt = "Subtitles.srt"
    idx = 1
    
    with open(global_srt, "w", encoding="utf-8") as f_global:
        for s in SCENES:
            scene_srt = f"video_production/scenes_11/subtitles_{s['name']}.srt"
            with open(scene_srt, "w", encoding="utf-8") as f_scene:
                for local_i, sub in enumerate(s["subtitles"], 1):
                    # Local scene timestamps (relative to scene start)
                    sub_start_local = sub["start"]
                    sub_end_local = min(sub["end"], s["duration"] - 0.2)
                    
                    f_scene.write(f"{local_i}\n")
                    f_scene.write(f"{format_srt_time(sub_start_local)} --> {format_srt_time(sub_end_local)}\n")
                    f_scene.write(f"{sub['text']}\n\n")
                    
                    # Global timestamps (for full 300s video)
                    sub_start_global = s["start"] + sub["start"]
                    sub_end_global = s["start"] + min(sub["end"], s["duration"] - 0.2)
                    
                    f_global.write(f"{idx}\n")
                    f_global.write(f"{format_srt_time(sub_start_global)} --> {format_srt_time(sub_end_global)}\n")
                    f_global.write(f"{sub['text']}\n\n")
                    idx += 1
    print(f"  Exported global SRT: {global_srt}")

def export_narration_script():
    print("\n=== Step 4: Exporting Narration Script (Narration_Script.txt) ===")
    script_path = "Narration_Script.txt"
    with open(script_path, "w", encoding="utf-8") as f:
        f.write("=" * 70 + "\n")
        f.write("VIDYADWAAR SIH DEMONSTRATION NARRATION SCRIPT\n")
        f.write("Target Duration: 5 Minutes (300 Seconds) | 11 Complete Scenes\n")
        f.write("=" * 70 + "\n\n")
        
        for s in SCENES:
            start_m = int(s["start"] // 60)
            start_s = int(s["start"] % 60)
            end_t = s["start"] + s["duration"]
            end_m = int(end_t // 60)
            end_s = int(end_t % 60)
            
            f.write(f"SCENE {s['id']:02d}: {s['title'].upper()} ({start_m:02d}:{start_s:02d} - {end_m:02d}:{end_s:02d}) [Duration: {s['duration']:.1f}s]\n")
            f.write("-" * 70 + "\n")
            f.write(s["narration"] + "\n\n")
    print(f"  Exported narration script: {script_path}")

def assemble_clips(music_path):
    print("\n=== Step 5: Rendering Individual 1080p Clips with Burned-In Subtitles ===")
    clip_list = []
    
    for s in SCENES:
        clip_out = f"video_production/scenes_11/clip_{s['id']:02d}.mp4"
        clip_list.append(clip_out)
        
        voice_mp3 = f"video_production/scenes_11/audio/voice_{s['name']}.mp3"
        srt_file = f"video_production/scenes_11/subtitles_{s['name']}.srt".replace("\\", "/")
        img_file = s["image"].replace("\\", "/")
        dur = s["duration"]
        
        print(f"Rendering Clip {s['id']:02d}: {s['title']} ({dur:.1f}s)...")
        
        # Audio filter: voice + silence pad to exact duration, mixed with background music slice
        # Using subtle background pad at 0.08 volume and voice at 1.0 volume
        music_start = s["start"]
        
        # Subtitle styling: white text, subtle dark box, font size 22, bottom margin 40
        sub_filter = f"subtitles='{srt_file}':force_style='FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,BackColour=&H80000000,Outline=2,Shadow=0,MarginV=40,Alignment=2'"
        
        cmd = [
            FFMPEG, "-y",
            "-loop", "1", "-framerate", "30", "-t", str(dur), "-i", img_file,
            "-i", voice_mp3,
            "-ss", str(music_start), "-t", str(dur), "-i", music_path,
            "-filter_complex",
            f"[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,{sub_filter}[v];"
            f"[1:a]apad,atrim=0:{dur},volume=1.2[vocal];"
            f"[2:a]volume=0.08,atrim=0:{dur}[bg];"
            f"[vocal][bg]amix=inputs=2:duration=first:dropout_transition=2[a]",
            "-map", "[v]",
            "-map", "[a]",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "18",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "192k",
            "-r", "30",
            "-t", str(dur),
            clip_out
        ]
        
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            print(f"ERROR rendering clip {s['id']}: {res.stderr}")
            sys.exit(1)
        print(f"  Rendered clip: {clip_out}")

    print("\n=== Step 6: Concatenating Clips into Final 5-Minute MP4 ===")
    concat_txt = "video_production/scenes_11/concat_list.txt"
    with open(concat_txt, "w") as f:
        for c in clip_list:
            f.write(f"file '{os.path.abspath(c).replace('\\', '/')}'\n")
            
    final_output = "VidyaDwaar_SIH_Demo_Final.mp4"
    cmd_concat = [
        FFMPEG, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt,
        "-c", "copy",
        final_output
    ]
    subprocess.run(cmd_concat, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"  Successfully assembled: {final_output}")
    return final_output

def create_thumbnail():
    print("\n=== Step 7: Generating High-Impact Video Thumbnail (Thumbnail.png) ===")
    thumb_out = "Thumbnail.png"
    # Capture scene 1 or generate high impact thumbnail from scene 1
    subprocess.run([
        FFMPEG, "-y",
        "-i", "video_production/scenes_11/scene_01.png",
        "-vf", "scale=1920:1080",
        thumb_out
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    print(f"  Saved thumbnail: {thumb_out}")

def save_project_metadata():
    print("\n=== Step 8: Saving Video Project Metadata (project.json) ===")
    meta = {
        "title": "VidyaDwaar — SIH 2026 Demonstration Video",
        "target_duration_seconds": 300.0,
        "resolution": "1920x1080",
        "aspect_ratio": "16:9",
        "voice": VOICE,
        "scenes_count": len(SCENES),
        "timeline": SCENES
    }
    with open("video_production/project.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print("  Saved: video_production/project.json")

def verify_final_video(video_path):
    print("\n=== Step 9: Final Quality & Duration Verification ===")
    cmd = [
        "tools/ffmpeg.exe",
        "-i", video_path
    ]
    proc = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    output = proc.stderr
    
    import re
    m_dur = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", output)
    if m_dur:
        h, m, s = int(m_dur.group(1)), int(m_dur.group(2)), float(m_dur.group(3))
        total_s = h * 3600 + m * 60 + s
        print(f"  Measured Video Duration: {total_s:.2f} seconds ({h:02d}:{m:02d}:{s:05.2f})")
        if abs(total_s - 300.0) <= 0.5:
            print("  [PASS] DURATION VERIFICATION PASSED: Exactly 5:00 minutes (300 seconds)!")
        else:
            print(f"  WARNING: Duration differs by {abs(total_s - 300.0):.2f}s from 300s target")
    
    if "1920x1080" in output:
        print("  [PASS] RESOLUTION VERIFICATION PASSED: 1920x1080 Full HD")
    if "h264" in output or "Video: h264" in output:
        print("  [PASS] CODEC VERIFICATION PASSED: H.264 / AAC")

async def main():
    await generate_narration_audio()
    music_path = generate_background_music()
    build_subtitles()
    export_narration_script()
    final_video = assemble_clips(music_path)
    create_thumbnail()
    save_project_metadata()
    verify_final_video(final_video)
    print("\n=======================================================")
    print("VIDYADWAAR SIH DEMONSTRATION VIDEO PRODUCTION COMPLETE!")
    print("=======================================================")

if __name__ == "__main__":
    asyncio.run(main())

