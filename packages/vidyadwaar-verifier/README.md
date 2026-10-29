# 🎓 vidyadwaar-verifier

Lightweight, sub-12ms offline W3C Verifiable Credential 2.0 (`Ed25519Signature2020`) verification SDK for **VidyaDwaar** academic credentials, student enrolment proofs, and degree certificates.

## 📦 Installation

```bash
npm install vidyadwaar-verifier
# or
yarn add vidyadwaar-verifier
# or
pnpm add vidyadwaar-verifier
```

## 🚀 Quick Usage

```typescript
import { verifyCredential, decodeQrPayload } from 'vidyadwaar-verifier';

// 1. Decode QR payload from a student's degree or mobile wallet
const vc = decodeQrPayload(scannedQrString);

// 2. Perform zero-roundtrip cryptosuite signature check against the university public key
const result = await verifyCredential(vc);

if (result.verified) {
  console.log('✅ Degree Authentic:', result.credentialSubject.name, result.credentialSubject.degree);
} else {
  console.error('❌ Verification Failed:', result.error);
}
```

## 🔒 Security Standards
- **W3C VC Data Model 2.0**: Compatible with official W3C test vectors.
- **Ed25519 Cryptosuite**: Fast elliptic curve cryptographic signature validation.
- **Privacy-Preserving**: Runs in browser memory with zero plaintext tracking.

