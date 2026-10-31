import asyncio
import os
import re
import edge_tts

SCENES = [
    {
        "id": 1,
        "name": "scene_01_intro",
        "title": "Introduction & National Challenge",
        "text": """Welcome to Vidya Dwaar, India's Unified Academic Credential Infrastructure, developed for the Smart India Hackathon. 
Across India, over forty million students are enrolled in higher education across more than fifty thousand colleges and universities. 
Yet today, verifying academic qualifications remains a manual, fragmented, and vulnerable process. 
Degree fraud, counterfeit marksheets, and unauthorized institutions cost employers and regulatory bodies thousands of hours in manual verifications. 
Vidya Dwaar solves this national challenge by introducing a tamper-proof, decentralized academic credential network aligned with the National Education Policy and the A P A A R student identity framework."""
    },
    {
        "id": 2,
        "name": "scene_02_architecture",
        "title": "System Architecture & Decentralized Sovereignty",
        "text": """Vidya Dwaar is engineered around three foundational pillars: Institutional Sovereignty, Student Privacy, and Sub-Twelve-Millisecond Offline Verification. 
Instead of maintaining a massive centralized database of student grades—which would become an attractive honeypot for cyberattacks—Vidya Dwaar implements the official W 3 C Verifiable Credentials Two Point Zero standard. 
Each university is provisioned with sovereign cryptographic keypairs using the high performance Ed twenty-five five-nineteen digital signature algorithm. 
Academic degrees are cryptographically signed at the source, transforming every issued certificate into a mathematically verifiable, self-contained digital asset."""
    },
    {
        "id": 3,
        "name": "scene_03_institution",
        "title": "University & Registrar Workflow",
        "text": """Let us examine the workflow from the university registrar's perspective. 
Colleges can easily onboard and connect their existing campus management systems using our open-source Python client, vidyadwaar connector, or simply upload standard student graduation batches. 
The registrar dashboard automatically validates student identity records, maps degree specifications against approved curriculum codes, and initiates automated batch signing. 
Within seconds, hundreds of degree certificates are cryptographically signed with the institution's private key, while the corresponding public key is registered on the state authority ledger. 
Institutional sovereignty is preserved, with zero changes required to existing university legacy databases."""
    },
    {
        "id": 4,
        "name": "scene_04_student",
        "title": "Student Experience & APAAR Cryptographic Wallet",
        "text": """For students, Vidya Dwaar delivers a seamless, empowering digital wallet experience. 
By authenticating with their twelve-digit A P A A R identification, students instantly access their verified academic credentials. 
Graduates can securely view high-fidelity verifiable degree certificates, download tamper-proof cryptographic JSON-LD documents, or present their credential as a high-density, offline Q R code. 
Furthermore, Vidya Dwaar supports privacy-preserving selective disclosure. 
Students can prove graduation status and major specialization to a prospective employer without exposing sensitive personal identifiers such as phone numbers or home addresses."""
    },
    {
        "id": 5,
        "name": "scene_05_verifier",
        "title": "Lightning-Fast Offline Verification & Tamper Detection",
        "text": """Here is where Vidya Dwaar's cryptographic architecture delivers unmatched performance: the Verifier Portal. 
When an employer, background screening agency, or embassy needs to verify a candidate's degree, they simply scan the student's Q R code or upload the credential file. 
Using our client-side verification engine, the signature is cryptographically checked against the university's registered public key in less than twelve milliseconds. 
Crucially, this verification requires zero network communication with the issuing university or any central server. 
Even if the issuing university's portal is offline or facing server downtime, verification succeeds instantly. 
And if an attacker attempts to alter a student's C G P A, name, or graduation year by even a single character, the Ed twenty-five five-nineteen signature check fails instantly, alerting the employer to fraudulent tampering."""
    },
    {
        "id": 6,
        "name": "scene_06_aicte",
        "title": "AICTE National Regulatory Oversight Dashboard",
        "text": """For national regulators like A I C T E and the Ministry of Education, Vidya Dwaar provides unprecedented real-time visibility into academic compliance. 
The A I C T E regulatory oversight dashboard features automated cross-institutional anomaly detection. 
The system continuously monitors institutional seat matrices, flagging colleges that exceed their legally approved student intake caps. 
It detects ghost institutions issuing degrees without valid A I C T E approval, and identifies suspicious duplicate enrolments where a single student is concurrently enrolled in multiple full-time degree programs across different states. 
This empowers regulatory officers to take proactive, evidence-based enforcement actions."""
    },
    {
        "id": 7,
        "name": "scene_07_developer",
        "title": "Open-Source Developer Ecosystem (PyPI & npm)",
        "text": """Vidya Dwaar is built to be adopted nationwide from day one. 
In our Developer Portal, we provide production-grade, open-source S D K s for both ecosystem stakeholders. 
For universities and campus E R P vendors, we published the vidyadwaar connector library on Py P I, enabling automated, signed webhook synchronization in just five lines of Python. 
For corporate H R tech platforms, job portals, and screening agencies, we published vidyadwaar verifier on the npm registry. 
This lightweight TypeScript library enables any web or mobile application to embed sub-twelve-millisecond offline verification with zero external dependencies. 
Both packages are freely available under the Apache Two Point Zero license."""
    },
    {
        "id": 8,
        "name": "scene_08_conclusion",
        "title": "Conclusion & Vision for Smart India Hackathon",
        "text": """In conclusion, Vidya Dwaar transforms India's academic credentialing ecosystem. 
By replacing slow, vulnerable paper verification with mathematically provable, decentralized W 3 C credentials, Vidya Dwaar eliminates credential fraud, protects student privacy, and reduces verification costs to absolute zero. 
Fully aligned with the National Education Policy and built on India's digital public infrastructure, Vidya Dwaar stands ready to power the next generation of trust in Indian education. 
Thank you."""
    }
]

VOICE = "en-IN-PrabhatNeural"
OUTPUT_DIR = "video_production/audio"

async def generate_scene_audio(scene):
    out_path = os.path.join(OUTPUT_DIR, f"{scene['name']}.mp3")
    print(f"Generating audio for Scene {scene['id']}: {scene['title']}...")
    communicate = edge_tts.Communicate(
        text=scene["text"],
        voice=VOICE,
        rate="-2%",  # slightly measured, authoritative documentary pace
        pitch="+0Hz"
    )
    await communicate.save(out_path)
    print(f"Saved: {out_path}")

async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for scene in SCENES:
        await generate_scene_audio(scene)
    print("All scene audio files generated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
