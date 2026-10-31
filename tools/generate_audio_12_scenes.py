import asyncio
import os
import edge_tts

VOICE = "en-IN-PrabhatNeural"
OUTPUT_DIR = "video_production/audio"

SCENES = [
    {
        "id": 1,
        "name": "scene_01",
        "title": "Introduction & SIH Problem Statement",
        "text": """Welcome to Vidya Dwaar, an enterprise-grade academic data and credential integrity ecosystem built for the Smart India Hackathon. 
In Indian higher education, over forty thousand institutions enroll millions of students annually under statutory regulatory oversight. 
However, fragmented institutional ERPs, manual student records, and siloed university databases create severe vulnerabilities—from ghost colleges and duplicate admissions to forged degree certificates. 
Vidya Dwaar bridges this trust deficit through a unified, privacy-first platform powered by A P A A R identifiers and W 3 C Verifiable Credentials."""
    },
    {
        "id": 2,
        "name": "scene_02",
        "title": "Existing Challenges",
        "text": """Today, state regulators and national bodies like A I C T E face critical administrative friction. 
Seat caps approved by the council are routinely obscured across disconnected state registries. 
Students struggle with delays in issuing and authenticating genuine transcripts, while employers face cumbersome, multi-week background verifications. 
Crucially, bad actors exploit offline loopholes, creating counterfeit marksheets and dual government scholarship claims. 
What the nation needs is not another static web portal, but a deterministic, cryptographic truth engine that protects student privacy while enforcing statutory admission limits."""
    },
    {
        "id": 3,
        "name": "scene_03",
        "title": "VidyaDwaar Solution & Unique Value Proposition",
        "text": """Vidya Dwaar introduces a paradigm shift. 
By anchoring every student record to the One Nation, One Student ID—the Automated Permanent Academic Account Registry, or A P A A R—Vidya Dwaar creates a verifiable academic lifecycle. 
Our unique value proposition rests on three pillars: sub-twelve-millisecond deterministic ingestion auditing, zero-honeypot cryptographic privacy compliant with India's DPDP Act 2023, and instant offline-verifiable digital degrees using W 3 C Verifiable Credentials Two Point Zero and Ed twenty-five five-nineteen digital signatures. 
All demonstrations here use synthetic prototype data created specifically for the Smart India Hackathon."""
    },
    {
        "id": 4,
        "name": "scene_04",
        "title": "Multi-Role Login & Access Permissions",
        "text": """Vidya Dwaar is engineered from the ground up as a multi-role ecosystem where every stakeholder operates under strict principle-of-least-privilege permissions. 
As demonstrated on our live evaluator sign-in interface, Vidya Dwaar defines distinct personas: 
Students access their own personal academic records and privacy consent controls; 
Institutions manage authorized student rosters and intake ceilings; 
Affiliating University Registrars administer degree issuance; 
Central A I C T E Regulators inspect nationwide duplicate overlap radar; 
and External Verifiers receive controlled, instant credential verification without accessing sensitive student databases."""
    },
    {
        "id": 5,
        "name": "scene_05",
        "title": "Institution Administrator Dashboard",
        "text": """Here, an institution administrator signs into the live dashboard for Vidyapeeth Institute of Technology and Science. 
In real time, the institution audits its active academic year, approved intake quota of one hundred and twenty seats, and sixty enrolled students. 
The system immediately reports A P A A R coverage—confirming fifty-four verified records and flagging six pending verifications. 
Statutory intake counters prevent illegal over-admissions before student data is ever committed to the ledger, eliminating compliance notices and ensuring complete alignment with A I C T E approval guidelines."""
    },
    {
        "id": 6,
        "name": "scene_06",
        "title": "Student Login & Student Dashboard",
        "text": """Now, let us examine the core student experience. 
A student, Aarav Sharma, logs into the dedicated Vidya Dwaar student portal using synthetic demonstration credentials with date-of-birth authentication or WebAuthn passkeys. 
Instantly, Aarav gains independent, transparent access to his academic profile. 
His A P A A R I D is securely masked for privacy, his active enrollment in B.E. Computer Science at Vidyapeeth Institute is displayed, and his academic status is verified. 
Students never have to run between institutional desks; their verifiable educational history is available directly at their fingertips."""
    },
    {
        "id": 7,
        "name": "scene_07",
        "title": "Student APK & Offline Experience",
        "text": """Recognizing that reliable internet connectivity remains a challenge across remote Indian colleges, Vidya Dwaar provides a native, offline-capable Android application. 
Students can download the official Vidya Dwaar Student Portal APK directly from the platform. 
The application securely caches cryptographically signed academic credentials on the mobile device. 
As stated in our architecture: Vidya Dwaar also provides an offline-capable Android application for students, enabling access to supported locally available academic information and downloaded certificates even when internet connectivity is unavailable. 
This empowers students across rural and semi-urban India."""
    },
    {
        "id": 8,
        "name": "scene_08",
        "title": "Certificate Viewing & Downloading",
        "text": """Within the credential wallet, students can view, verify, and download their official academic certificates. 
Clicking on his degree certificate, Aarav views his cryptographically signed W 3 C Verifiable Credential. 
The certificate displays his verified name, university registration number, A P A A R identifier, and a tamper-evident two-dimensional barcode containing a compressed Base45 payload. 
Students can save the certificate locally or print it as a high-fidelity document labeled as a demonstration sample. 
Any third party can scan this barcode offline to verify university authenticity in sub-twelve milliseconds."""
    },
    {
        "id": 9,
        "name": "scene_09",
        "title": "APAAR Validation & Cross-Institution Matching",
        "text": """Under the hood, Vidya Dwaar continuously safeguards the integrity of admissions across state lines. 
Through blind H M A C pseudonymization, our cross-institution duplicate radar detects dual enrolments and illegal multi-college seat blocking without centralizing raw Aadhaar or A P A A R numbers. 
When an anomaly occurs—such as a student enrolled simultaneously in two full-time degree programs—the system flags an E203 duplicate dispute for regulatory resolution, stopping fraudulent scholarship claims while safeguarding student data privacy."""
    },
    {
        "id": 10,
        "name": "scene_10",
        "title": "AICTE Monitoring Dashboard",
        "text": """At the central regulatory level, the A I C T E National Monitoring Cell accesses macro-level analytics across participating states. 
Regulatory officers monitor real-time ingestion health, data quality scorecards, seat utilization percentiles, and regional compliance trends across engineering, polytechnic, and management institutions. 
High-risk outliers, intake breaches, and cross-state overlaps are automatically highlighted in regulatory audit queues, allowing officers to take targeted statutory action rather than conducting slow, retrospective manual inspections."""
    },
    {
        "id": 11,
        "name": "scene_11",
        "title": "Technical Architecture & Security",
        "text": """Vidya Dwaar's technical architecture is built for national scale and sovereign security. 
It combines a robust Python FastAPI backend with PostgreSQL, high-performance Vite React frontend, and modern cryptography. 
The identity layer leverages W 3 C Verifiable Credentials Two Point Zero with Ed twenty-five five-nineteen signatures, RFC ninety-four fifty-seven structured problem details, and W 3 C Bitstring Status Lists for instant credential revocation. 
Our zero-honeypot design ensures that personally identifiable information is never exposed to external verifiers, fulfilling the highest standards of the Digital Personal Data Protection Act."""
    },
    {
        "id": 12,
        "name": "scene_12",
        "title": "Expected Impact & Conclusion",
        "text": """In conclusion, Vidya Dwaar delivers a transformative solution for Indian higher education. 
For students, it provides permanent, self-sovereign ownership of their academic achievements. 
For institutions, it streamlines regulatory compliance and automated seat management. 
For A I C T E and universities, it establishes an unforgeable, transparent record of national educational truth. 
Thank you for evaluating Vidya Dwaar—empowering education through verified integrity for the Smart India Hackathon."""
    }
]

async def generate_scene_audio(scene):
    out_file = os.path.join(OUTPUT_DIR, f"{scene['name']}.mp3")
    print(f"Generating audio for Scene {scene['id']}: {scene['title']} at +22% rate...")
    communicate = edge_tts.Communicate(scene["text"], VOICE, rate="+22%", pitch="+0Hz")
    await communicate.save(out_file)
    print(f"Saved: {out_file}")

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for scene in SCENES:
        await generate_scene_audio(scene)
    print("ALL 12 SCENE VOICEOVERS GENERATED AT TARGET RATE!")

if __name__ == "__main__":
    asyncio.run(main())
