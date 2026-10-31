import os
import subprocess

def get_duration(audio_file):
    cmd = ['tools/ffmpeg.exe', '-i', audio_file]
    p = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    for line in p.stderr.splitlines():
        if 'Duration:' in line:
            dur = line.split('Duration:')[1].split(',')[0].strip()
            h, m, s = dur.split(':')
            return float(h)*3600 + float(m)*60 + float(s)
    return 38.0

SCENES = [
    {
        "id": 1,
        "name": "scene_01",
        "text": [
            "Welcome to VidyaDwaar, an enterprise-grade academic data and credential integrity ecosystem built for the Smart India Hackathon.",
            "In Indian higher education, over forty thousand institutions enroll millions of students annually under statutory regulatory oversight.",
            "However, fragmented institutional ERPs, manual student records, and siloed university databases create severe vulnerabilities—from ghost colleges to forged degree certificates.",
            "VidyaDwaar bridges this trust deficit through a unified, privacy-first platform powered by APAAR identifiers and W3C Verifiable Credentials."
        ]
    },
    {
        "id": 2,
        "name": "scene_02",
        "text": [
            "Today, state regulators and national bodies like AICTE face critical administrative friction.",
            "Seat caps approved by the council are routinely obscured across disconnected state registries.",
            "Students struggle with delays in issuing and authenticating genuine transcripts, while employers face cumbersome background verifications.",
            "Crucially, bad actors exploit offline loopholes, creating counterfeit marksheets and dual government scholarship claims.",
            "What the nation needs is a deterministic, cryptographic truth engine that protects student privacy while enforcing statutory admission limits."
        ]
    },
    {
        "id": 3,
        "name": "scene_03",
        "text": [
            "VidyaDwaar introduces a paradigm shift.",
            "By anchoring every student record to the One Nation, One Student ID—the Automated Permanent Academic Account Registry, or APAAR—VidyaDwaar creates a verifiable academic lifecycle.",
            "Our unique value proposition rests on three pillars: sub-12ms deterministic ingestion auditing, zero-honeypot cryptographic privacy compliant with DPDP Act 2023,",
            "and instant offline-verifiable digital degrees using W3C Verifiable Credentials 2.0 and Ed25519 digital signatures.",
            "All demonstrations here use synthetic prototype data created specifically for the Smart India Hackathon."
        ]
    },
    {
        "id": 4,
        "name": "scene_04",
        "text": [
            "VidyaDwaar is engineered from the ground up as a multi-role ecosystem where every stakeholder operates under strict principle-of-least-privilege permissions.",
            "As demonstrated on our live evaluator sign-in interface, VidyaDwaar defines distinct personas:",
            "Students access their own personal academic records and privacy consent controls; Institutions manage authorized student rosters and intake ceilings;",
            "Affiliating University Registrars administer degree issuance; Central AICTE Regulators inspect nationwide duplicate overlap radar;",
            "and External Verifiers receive controlled, instant credential verification without accessing sensitive student databases."
        ]
    },
    {
        "id": 5,
        "name": "scene_05",
        "text": [
            "Here, an institution administrator signs into the live dashboard for Vidyapeeth Institute of Technology and Science.",
            "In real time, the institution audits its active academic year, approved intake quota of 120 seats, and 60 enrolled students.",
            "The system immediately reports APAAR coverage—confirming 54 verified records and flagging 6 pending verifications.",
            "Statutory intake counters prevent illegal over-admissions before student data is ever committed to the ledger, eliminating compliance notices."
        ]
    },
    {
        "id": 6,
        "name": "scene_06",
        "text": [
            "Now, let us examine the core student experience.",
            "A student, Aarav Sharma, logs into the dedicated VidyaDwaar student portal using synthetic demonstration credentials with date-of-birth authentication or WebAuthn passkeys.",
            "Instantly, Aarav gains independent, transparent access to his academic profile.",
            "His APAAR ID is securely masked for privacy, his active enrollment in B.E. Computer Science at Vidyapeeth Institute is displayed, and his academic status is verified.",
            "Students never have to run between institutional desks; their verifiable educational history is available directly at their fingertips."
        ]
    },
    {
        "id": 7,
        "name": "scene_07",
        "text": [
            "Recognizing that reliable internet connectivity remains a challenge across remote Indian colleges, VidyaDwaar provides a native, offline-capable Android application.",
            "Students can download the official VidyaDwaar Student Portal APK directly from the platform.",
            "The application securely caches cryptographically signed academic credentials on the mobile device.",
            "VidyaDwaar also provides an offline-capable Android application for students, enabling access to supported locally available academic information and downloaded certificates even when internet connectivity is unavailable.",
            "This empowers students across rural and semi-urban India."
        ]
    },
    {
        "id": 8,
        "name": "scene_08",
        "text": [
            "Within the credential wallet, students can view, verify, and download their official academic certificates.",
            "Clicking on his degree certificate, Aarav views his cryptographically signed W3C Verifiable Credential.",
            "The certificate displays his verified name, university registration number, APAAR identifier, and a tamper-evident two-dimensional barcode containing a compressed Base45 payload.",
            "Students can save the certificate locally or print it as a high-fidelity document labeled as a demonstration sample.",
            "Any third party can scan this barcode offline to verify university authenticity in sub-twelve milliseconds."
        ]
    },
    {
        "id": 9,
        "name": "scene_09",
        "text": [
            "Under the hood, VidyaDwaar continuously safeguards the integrity of admissions across state lines.",
            "Through blind HMAC pseudonymization, our cross-institution duplicate radar detects dual enrolments and illegal multi-college seat blocking without centralizing raw identifiers.",
            "When an anomaly occurs—such as a student enrolled simultaneously in two full-time degree programs—the system flags an E203 duplicate dispute for regulatory resolution,",
            "stopping fraudulent scholarship claims while safeguarding student data privacy."
        ]
    },
    {
        "id": 10,
        "name": "scene_10",
        "text": [
            "At the central regulatory level, the AICTE National Monitoring Cell accesses macro-level analytics across participating states.",
            "Regulatory officers monitor real-time ingestion health, data quality scorecards, seat utilization percentiles, and regional compliance trends.",
            "High-risk outliers, intake breaches, and cross-state overlaps are automatically highlighted in regulatory audit queues,",
            "allowing officers to take targeted statutory action rather than conducting slow, retrospective manual inspections."
        ]
    },
    {
        "id": 11,
        "name": "scene_11",
        "text": [
            "VidyaDwaar's technical architecture is built for national scale and sovereign security.",
            "It combines a robust Python FastAPI backend with PostgreSQL, high-performance Vite React frontend, and modern cryptography.",
            "The identity layer leverages W3C Verifiable Credentials 2.0 with Ed25519 signatures, RFC 9457 problem details, and W3C Bitstring Status Lists for instant credential revocation.",
            "Our zero-honeypot design ensures that PII is never exposed to external verifiers, fulfilling the highest standards of the DPDP Act."
        ]
    },
    {
        "id": 12,
        "name": "scene_12",
        "text": [
            "In conclusion, VidyaDwaar delivers a transformative solution for Indian higher education.",
            "For students, it provides permanent, self-sovereign ownership of their academic achievements.",
            "For institutions, it streamlines regulatory compliance and automated seat management.",
            "For AICTE and universities, it establishes an unforgeable, transparent record of national educational truth.",
            "Thank you for evaluating VidyaDwaar—empowering education through verified integrity for the Smart India Hackathon."
        ]
    }
]

def fmt_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int(round((seconds - int(seconds)) * 1000))
    if ms >= 1000:
        ms = 999
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def main():
    srt_lines = []
    srt_idx = 1
    current_time = 0.0

    for scene in SCENES:
        audio_file = f"video_production/audio/{scene['name']}.mp3"
        dur = get_duration(audio_file)
        lines = scene["text"]
        line_dur = dur / len(lines)

        for l in lines:
            start_s = current_time
            end_s = current_time + line_dur - 0.1
            srt_lines.append(f"{srt_idx}\n{fmt_time(start_s)} --> {fmt_time(end_s)}\n{l}\n")
            srt_idx += 1
            current_time += line_dur

    content = "\n".join(srt_lines)
    with open("Subtitles.srt", "w", encoding="utf-8") as f:
        f.write(content)
    with open("video_production/subtitles/Subtitles.srt", "w", encoding="utf-8") as f:
        f.write(content)
    print("Subtitles.srt generated successfully with", srt_idx - 1, "cues!")

if __name__ == "__main__":
    main()

