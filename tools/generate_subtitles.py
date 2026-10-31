import os
import re

SCENES_DATA = [
    {
        "id": 1,
        "audio": "video_production/audio/scene_01_intro.mp3",
        "duration": 53.78,
        "sentences": [
            "Welcome to VidyaDwaar, India's Unified Academic Credential Infrastructure, developed for the Smart India Hackathon.",
            "Across India, over forty million students are enrolled in higher education across more than fifty thousand colleges and universities.",
            "Yet today, verifying academic qualifications remains a manual, fragmented, and vulnerable process.",
            "Degree fraud, counterfeit marksheets, and unauthorized institutions cost employers and regulators thousands of hours.",
            "VidyaDwaar solves this national challenge by introducing a tamper-proof, decentralized academic credential network.",
            "Aligned with the National Education Policy and the APAAR student identity framework."
        ]
    },
    {
        "id": 2,
        "audio": "video_production/audio/scene_02_architecture.mp3",
        "duration": 49.82,
        "sentences": [
            "VidyaDwaar is engineered around three foundational pillars:",
            "Institutional Sovereignty, Student Privacy, and Sub-Twelve-Millisecond Offline Verification.",
            "Instead of a vulnerable central database, VidyaDwaar implements the W3C Verifiable Credentials 2.0 standard.",
            "Each university is provisioned with sovereign cryptographic keypairs using the Ed25519 digital signature algorithm.",
            "Academic degrees are cryptographically signed at the source, transforming every certificate into a verifiable digital asset."
        ]
    },
    {
        "id": 3,
        "audio": "video_production/audio/scene_03_institution.mp3",
        "duration": 53.71,
        "sentences": [
            "Let us examine the workflow from the university registrar's perspective.",
            "Colleges connect existing campus ERPs using our open-source Python client, vidyadwaar-connector, or upload graduation batches.",
            "The registrar dashboard validates student records, maps curriculum codes, and initiates automated batch signing.",
            "Within seconds, hundreds of degree certificates are cryptographically signed with the institution's private key.",
            "The corresponding public key is registered on the state authority ledger, with zero changes to university legacy databases."
        ]
    },
    {
        "id": 4,
        "audio": "video_production/audio/scene_04_student.mp3",
        "duration": 50.50,
        "sentences": [
            "For students, VidyaDwaar delivers a seamless, empowering digital wallet experience.",
            "By authenticating with their twelve-digit APAAR identification, students instantly access their verified academic credentials.",
            "Graduates can securely view high-fidelity degree certificates or download tamper-proof cryptographic JSON-LD documents.",
            "They can present credentials as a high-density, offline QR code.",
            "Furthermore, VidyaDwaar supports privacy-preserving selective disclosure to protect sensitive personal identifiers."
        ]
    },
    {
        "id": 5,
        "audio": "video_production/audio/scene_05_verifier.mp3",
        "duration": 67.46,
        "sentences": [
            "Here is where VidyaDwaar's cryptographic architecture delivers unmatched performance: the Verifier Portal.",
            "Employers, screening agencies, or embassies verify a candidate's degree by scanning the QR code or uploading credential files.",
            "Using our client-side verification engine, signatures are checked against the university's public key in under 12 milliseconds.",
            "Crucially, this verification requires zero network communication with the issuing university or any central server.",
            "Even if the university portal is offline or facing downtime, verification succeeds instantly.",
            "If an attacker alters CGPA, name, or graduation year by even a single character, the signature check fails immediately."
        ]
    },
    {
        "id": 6,
        "audio": "video_production/audio/scene_06_aicte.mp3",
        "duration": 55.32,
        "sentences": [
            "For national regulators like AICTE and the Ministry of Education, VidyaDwaar provides real-time academic compliance.",
            "The AICTE regulatory oversight dashboard features automated cross-institutional anomaly detection.",
            "The system continuously monitors institutional seat matrices, flagging colleges that exceed legally approved intake caps.",
            "It detects ghost institutions issuing degrees without valid AICTE approval.",
            "It identifies duplicate enrolments where a student is concurrently enrolled in multiple full-time degree programs across states.",
            "This empowers regulatory officers to take proactive, evidence-based enforcement actions."
        ]
    },
    {
        "id": 7,
        "audio": "video_production/audio/scene_07_developer.mp3",
        "duration": 57.82,
        "sentences": [
            "VidyaDwaar is built to be adopted nationwide from day one.",
            "In our Developer Portal, we provide production-grade, open-source SDKs for both ecosystem stakeholders.",
            "For universities and ERP vendors, we published vidyadwaar-connector on PyPI for webhook synchronization in five lines of code.",
            "For corporate HR platforms and screening agencies, we published vidyadwaar-verifier on the npm registry.",
            "This lightweight TypeScript library enables any application to embed sub-12ms offline verification with zero external dependencies.",
            "Both packages are freely available under the Apache 2.0 license."
        ]
    },
    {
        "id": 8,
        "audio": "video_production/audio/scene_08_conclusion.mp3",
        "duration": 38.69,
        "sentences": [
            "In conclusion, VidyaDwaar transforms India's academic credentialing ecosystem.",
            "By replacing vulnerable paper verification with decentralized W3C credentials, VidyaDwaar eliminates fraud.",
            "It protects student privacy and reduces verification costs to absolute zero.",
            "Fully aligned with the National Education Policy and built on India's digital public infrastructure,",
            "VidyaDwaar stands ready to power the next generation of trust in Indian education. Thank you."
        ]
    }
]

def format_timestamp(seconds):
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    msecs = int(round((seconds - int(seconds)) * 1000))
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{msecs:03d}"

def generate_srt(output_file):
    current_time = 0.0
    subtitle_index = 1
    srt_lines = []

    for scene in SCENES_DATA:
        sentences = scene["sentences"]
        total_chars = sum(len(s) for s in sentences)
        scene_dur = scene["duration"]
        
        scene_time = current_time
        for s in sentences:
            dur = (len(s) / total_chars) * scene_dur
            start_t = scene_time
            end_t = scene_time + dur
            
            srt_lines.append(f"{subtitle_index}")
            srt_lines.append(f"{format_timestamp(start_t)} --> {format_timestamp(end_t)}")
            srt_lines.append(s.strip())
            srt_lines.append("")
            
            subtitle_index += 1
            scene_time = end_t
            
        current_time += scene_dur

    content = "\n".join(srt_lines)
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated {output_file} with {subtitle_index - 1} subtitle cues.")
    return content

if __name__ == "__main__":
    generate_srt("Subtitles.srt")
    generate_srt("video_production/subtitles/Subtitles.srt")

