-- APAAR SIH prototype schema (PostgreSQL 16+). PRD §8, trimmed to docs/MVP_SCOPE.md.
-- Approved intake comes only from the (mock) AICTE registry tables, never from uploads (F9).

CREATE TABLE IF NOT EXISTS institutions (
  id            text PRIMARY KEY,               -- AICTE permanent id, e.g. 1-0000000001
  name          text NOT NULL,
  state         text NOT NULL,
  status        text NOT NULL CHECK (status IN ('approved','closed','progressive_closure'))
);

CREATE TABLE IF NOT EXISTS academic_years (
  code          text PRIMARY KEY,               -- '2026-27'
  window_start  date NOT NULL,                  -- admission window (E403)
  window_end    date NOT NULL,
  deadline      timestamptz NOT NULL            -- mutations after this raise E501
);

CREATE TABLE IF NOT EXISTS programmes (
  id             text PRIMARY KEY,              -- '<institution>:<code>'
  institution_id text NOT NULL REFERENCES institutions(id),
  code           text NOT NULL,
  name           text NOT NULL,
  level          text NOT NULL,
  duration_years int  NOT NULL,
  UNIQUE (institution_id, code)
);

CREATE TABLE IF NOT EXISTS approved_intake (     -- mock AICTE EOA registry
  programme_id    text NOT NULL REFERENCES programmes(id),
  academic_year   text NOT NULL REFERENCES academic_years(code),
  approved_intake int  NOT NULL CHECK (approved_intake >= 0),
  source_eoa_ref  text NOT NULL,
  PRIMARY KEY (programme_id, academic_year)
);

CREATE TABLE IF NOT EXISTS intake_history (      -- prior-year filled counts (anomaly baseline)
  programme_id  text NOT NULL REFERENCES programmes(id),
  academic_year text NOT NULL,
  approved      int  NOT NULL,
  filled        int  NOT NULL,
  foreign_filled int,                           -- FN/OCI/CIWG/NRI pool; NULL = unknown (category-mix rule then skipped)
  PRIMARY KEY (programme_id, academic_year)
);

CREATE TABLE IF NOT EXISTS seat_categories (
  code          text PRIMARY KEY,
  scope         text NOT NULL CHECK (scope IN ('within_intake','supernumerary')),
  cap_rule_json jsonb NOT NULL,
  handbook_ref  text NOT NULL
);

CREATE TABLE IF NOT EXISTS programme_category_counters (   -- row-locked (F11)
  programme_id  text NOT NULL REFERENCES programmes(id),
  academic_year text NOT NULL,
  category_code text NOT NULL,                  -- seat category or sub-cap key (e.g. CIWG)
  filled        int  NOT NULL DEFAULT 0,
  cap           int  NOT NULL,
  PRIMARY KEY (programme_id, academic_year, category_code)
);

CREATE TABLE IF NOT EXISTS users (
  id             text PRIMARY KEY,
  role           text NOT NULL CHECK (role IN ('institution_admin','aicte_officer','auditor','verifier','student','university_registrar')),
  institution_id text REFERENCES institutions(id),
  student_id     bigint,
  issuer_did     text,                          -- university_registrar: the university it signs for
  display_name   text NOT NULL,
  password_hash  text                          -- argon2; NULL until the account is activated with an AICTE code
);

CREATE TABLE IF NOT EXISTS students (
  id                bigserial PRIMARY KEY,
  apaar_enc         bytea,                      -- AES-256-GCM (F1)
  apaar_bi          text UNIQUE,                -- HMAC(k_apaar_bi, apaar)
  apaar_masked      text,
  apaar_status      text NOT NULL CHECK (apaar_status IN ('VERIFIED','REFUSED','NOT_GENERATED','PENDING','MISMATCH')),
  provisional_id    text UNIQUE,
  name_enc          bytea NOT NULL,
  dob_enc           bytea NOT NULL,
  guardian_name_enc bytea,
  bi_dob_bucket     int,                        -- 16-bit truncated HMAC (F2)
  bi_name_phon      text[],
  created_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (apaar_bi IS NOT NULL OR provisional_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS upload_batches (
  id              bigserial PRIMARY KEY,
  institution_id  text NOT NULL REFERENCES institutions(id),
  channel         text NOT NULL CHECK (channel IN ('portal_csv','api_json')),
  status          text NOT NULL CHECK (status IN ('processing','completed','failed')),
  row_counts_json jsonb NOT NULL DEFAULT '{}',
  idempotency_key text,
  request_hash    text NOT NULL,                -- SHA-256 of the uploaded content; key reuse with other content → 422
  created_by      text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS enrolments (
  id                 bigserial PRIMARY KEY,
  student_id         bigint NOT NULL REFERENCES students(id),
  programme_id       text   NOT NULL REFERENCES programmes(id),
  academic_year      text   NOT NULL REFERENCES academic_years(code),
  institution_student_id text NOT NULL,         -- printed on certificates (Req 10)
  status             text   NOT NULL CHECK (status IN ('active','withdrawn','migrated','completed')),
  seat_category_code text   NOT NULL REFERENCES seat_categories(code),
  is_supernumerary   boolean NOT NULL,
  is_lateral_entry   boolean NOT NULL,
  year_of_study      int    NOT NULL,
  is_nri boolean NOT NULL, is_oci boolean NOT NULL, is_fn boolean NOT NULL, is_ciwg boolean NOT NULL,
  admission_date     date   NOT NULL,
  ended_on           date,
  batch_id           bigint NOT NULL REFERENCES upload_batches(id)
);
CREATE INDEX IF NOT EXISTS enrolments_dup_idx ON enrolments (student_id, academic_year, status);
CREATE INDEX IF NOT EXISTS enrolments_programme_idx ON enrolments (programme_id, academic_year, status);
CREATE INDEX IF NOT EXISTS upload_batches_inst_idx ON upload_batches (institution_id);

CREATE TABLE IF NOT EXISTS validation_issues (
  id        bigserial PRIMARY KEY,
  batch_id  bigint NOT NULL REFERENCES upload_batches(id),
  row_no    int    NOT NULL,                    -- 1-based data row; 0 = batch-level
  code      text   NOT NULL,
  severity  text   NOT NULL CHECK (severity IN ('error','warning','flag')),
  field     text,
  params    jsonb  NOT NULL DEFAULT '{}'      -- message rendered from i18n/<locale>.json on read
);
CREATE INDEX IF NOT EXISTS validation_issues_batch_idx ON validation_issues (batch_id);

CREATE TABLE IF NOT EXISTS batch_features (      -- F1: computed in memory from plaintext at upload; only aggregates persist
  batch_id          bigint NOT NULL REFERENCES upload_batches(id),
  programme_id      text   NOT NULL REFERENCES programmes(id),
  rows              int    NOT NULL,          -- rows submitted for this programme in the batch (accepted or not)
  max_dob_cluster   int    NOT NULL,          -- largest group sharing one date of birth (the DOB itself is not stored)
  longest_apaar_run int    NOT NULL,          -- longest run of consecutive APAAR numbers (the numbers are not stored)
  minutes_before_deadline double precision NOT NULL,
  PRIMARY KEY (batch_id, programme_id)
);
CREATE INDEX IF NOT EXISTS batch_features_programme_idx ON batch_features (programme_id);

CREATE TABLE IF NOT EXISTS duplicate_cases (
  id            bigserial PRIMARY KEY,
  student_id    bigint NOT NULL REFERENCES students(id),
  enrolment_ids bigint[] NOT NULL,
  category      text NOT NULL DEFAULT 'E203',   -- E203: duplicate, E301/E302: over-intake
  status        text NOT NULL CHECK (status IN ('flagged','confirmed_duplicate','false_positive','under_investigation','open','under_review','evidence_required','decision_pending','resolved','rejected','withdrawn','escalated')),
  resolution_note text,
  resolved_by   text,
  resolved_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS anomaly_flags (
  id             bigserial PRIMARY KEY,
  institution_id text NOT NULL REFERENCES institutions(id),
  programme_id   text REFERENCES programmes(id),
  type           text NOT NULL,
  score          double precision NOT NULL,
  evidence_json  jsonb NOT NULL,
  status         text NOT NULL DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS issuer_registry (     -- D4 trust registry (AICTE is the trust anchor)
  did            text PRIMARY KEY,
  kind           text NOT NULL CHECK (kind IN ('institution','university')),
  institution_id text REFERENCES institutions(id),
  name           text NOT NULL,
  public_keys_json jsonb NOT NULL,              -- [{id, type, controller, publicKeyMultibase, status}]
  status         text NOT NULL CHECK (status IN ('active','suspended','revoked')),
  valid_from     timestamptz NOT NULL,          -- credentials must be issued (validFrom) inside this window
  valid_until    timestamptz                    -- e.g. closure date: later credentials are untrusted
);

CREATE TABLE IF NOT EXISTS affiliations (        -- which university awards degrees for which institution
  university_did text NOT NULL REFERENCES issuer_registry(did),
  institution_id text NOT NULL REFERENCES institutions(id),
  PRIMARY KEY (university_did, institution_id)
);

CREATE TABLE IF NOT EXISTS status_lists (        -- W3C Bitstring Status List
  id            text PRIMARY KEY,               -- '<issuer-slug>-<purpose>'
  issuer_did    text NOT NULL REFERENCES issuer_registry(did),
  purpose       text NOT NULL CHECK (purpose IN ('revocation','suspension')),
  bits          bytea NOT NULL,                 -- uncompressed, >= 16KB (131,072 entries), index 0 = left-most bit
  version       int   NOT NULL DEFAULT 1,
  UNIQUE (issuer_did, purpose)
);

CREATE TABLE IF NOT EXISTS consents (
  id            bigserial PRIMARY KEY,
  student_id    bigint REFERENCES students(id),  -- NULL when the APAAR matched nobody: stored anyway so the
                                                 -- verifier can't tell registered from unregistered IDs
  requester_id  text   NOT NULL REFERENCES users(id),
  requester_name text  NOT NULL,                -- shown to the student in the consent inbox
  purpose       text   NOT NULL,
  scope_fields  text[] NOT NULL,
  status        text   NOT NULL CHECK (status IN ('pending','granted','denied','revoked')),
  granted_by    text CHECK (granted_by IN ('student','guardian')),
  requested_at  timestamptz NOT NULL DEFAULT now(),
  granted_at    timestamptz,
  expires_at    timestamptz NOT NULL,
  revoked_at    timestamptz,
  artifact_sig  text                            -- platform Ed25519 signature over the consent artifact (JCS)
);

CREATE TABLE IF NOT EXISTS credentials (
  id             text PRIMARY KEY,              -- urn:uuid
  type           text NOT NULL CHECK (type IN ('EnrolmentCredential','DegreeCredential','VerificationCredential')),
  enrolment_id   bigint REFERENCES enrolments(id),
  consent_id     bigint REFERENCES consents(id),
  subject_student_id bigint NOT NULL REFERENCES students(id),
  issuer_did     text NOT NULL REFERENCES issuer_registry(did),
  status_list_id text NOT NULL REFERENCES status_lists(id),
  status_index   int  NOT NULL,
  issued_at      timestamptz NOT NULL DEFAULT now(),
  vc_enc         bytea NOT NULL,                -- AES-GCM of the signed VC JSON (contains PII); AAD credentials|vc|id
  vc_hash        text NOT NULL,                 -- SHA-256 of JCS(signed VC)
  idempotency_key text,                         -- issuance retries return the same credential
  request_hash   text,                          -- enrolment + type the key was first used for
  UNIQUE (status_list_id, status_index),
  UNIQUE (issuer_did, idempotency_key),
  UNIQUE (consent_id)                           -- one VerificationCredential per consent
);

CREATE TABLE IF NOT EXISTS ledger_entries (      -- D1 hash chain
  seq            bigserial PRIMARY KEY,
  institution_id text NOT NULL,
  event_type     text NOT NULL,
  entity_id      bigint NOT NULL,               -- enrolment id
  payload_hash   text NOT NULL,
  prev_hash      text NOT NULL,
  entry_hash     text NOT NULL,
  ts             text NOT NULL                  -- UTC ISO-8601 exactly as hashed
);

CREATE TABLE IF NOT EXISTS ledger_checkpoints (
  id           bigserial PRIMARY KEY,
  upto_seq     bigint NOT NULL,
  root_hash    text   NOT NULL,                 -- chain head hash at upto_seq
  aicte_sig    text   NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id         bigserial PRIMARY KEY,
  actor      text NOT NULL,
  role       text NOT NULL,
  action     text NOT NULL,
  entity     text NOT NULL,
  entity_id  text,
  student_id bigint,                            -- lets the student see accesses (D6)
  reason     text,
  request_id text,
  ts         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_student_idx ON audit_logs (student_id);

-- Outbound webhooks (Req 7). Secrets are AES-GCM encrypted (HMAC signing needs them); shown once at creation.
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id              bigserial PRIMARY KEY,
  institution_id  text NOT NULL REFERENCES institutions(id),
  url             text NOT NULL,
  events          text[] NOT NULL,
  secret_enc      bytea NOT NULL,
  secret_fp       text NOT NULL,                -- first 8 hex of SHA-256, for display only
  prev_secret_enc bytea,                        -- after a rotation the old secret also signs until prev_expires_at
  prev_expires_at timestamptz,
  active          boolean NOT NULL DEFAULT true,
  idempotency_key text,
  request_hash    text,
  created_by      text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, idempotency_key)
);

-- Outbox and delivery log in one. Response bodies are never stored.
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id               bigserial PRIMARY KEY,
  endpoint_id      bigint NOT NULL REFERENCES webhook_endpoints(id),
  event_id         uuid NOT NULL,
  event_type       text NOT NULL,
  payload          jsonb NOT NULL,              -- ids, counts, codes and statuses only (no PII)
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','delivered','failed','cancelled')),
  attempts         int NOT NULL DEFAULT 0,
  next_attempt_at  timestamptz NOT NULL DEFAULT now(),
  last_status_code int,
  last_error       text,                        -- truncated
  created_at       timestamptz NOT NULL DEFAULT now(),
  delivered_at     timestamptz
);
CREATE INDEX IF NOT EXISTS webhook_deliveries_due_idx ON webhook_deliveries (next_attempt_at) WHERE status = 'pending';

-- Passkeys (P1, Req 5/8): one-time activation codes from the institution, WebAuthn passkeys, single-use challenges.
CREATE TABLE IF NOT EXISTS activation_codes (
  id             bigserial PRIMARY KEY,
  student_id     bigint NOT NULL REFERENCES students(id),
  kind           text NOT NULL CHECK (kind IN ('student','guardian')),
  code_hash      text NOT NULL UNIQUE,            -- HMAC(k_activation, code); the plaintext is never stored
  institution_id text NOT NULL REFERENCES institutions(id),
  issued_by      text NOT NULL,
  reissue        boolean NOT NULL,                -- true when issuing it revoked earlier passkeys (insider-impersonation cooldown)
  idempotency_key text,
  request_hash   text,
  expires_at     timestamptz NOT NULL,
  used_at        timestamptz,
  registered_at  timestamptz,                    -- one passkey per code (L2)
  voided_at      timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS passkeys (
  id            bigserial PRIMARY KEY,
  student_id    bigint NOT NULL REFERENCES students(id),
  kind          text NOT NULL CHECK (kind IN ('student','guardian')),
  credential_id bytea NOT NULL UNIQUE,
  public_key    bytea NOT NULL,                   -- COSE key
  sign_count    bigint NOT NULL,
  transports    text[],
  approve_after timestamptz NOT NULL DEFAULT now(), -- registered from a reissued code: no consent approval for 24 h
  activation_code_id bigint REFERENCES activation_codes(id), -- which institution's code created it (H1: revoke own only)
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_used_at  timestamptz,
  revoked_at    timestamptz
);

CREATE TABLE IF NOT EXISTS webauthn_challenges (
  challenge   bytea PRIMARY KEY,
  purpose     text NOT NULL CHECK (purpose IN ('register','login','consent')),
  student_id  bigint,
  kind        text,
  consent_id  bigint,
  terms_hash  text,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz
);

-- A4 inspector feedback: one row per review; the latest review per flag_key counts.
CREATE TABLE IF NOT EXISTS flag_reviews (
  id                bigserial PRIMARY KEY,
  flag_key          text NOT NULL,
  rule              text NOT NULL,
  institution_id    text NOT NULL,
  academic_year     text NOT NULL,
  decision          text NOT NULL CHECK (decision IN ('confirmed','dismissed','needs_info')),
  reason            text NOT NULL CHECK (length(reason) >= 10),
  evidence_snapshot jsonb NOT NULL,             -- the numbers the inspector saw
  reviewer          text NOT NULL,
  idempotency_key   text,
  request_hash      text,
  reviewed_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reviewer, idempotency_key)
);
CREATE INDEX IF NOT EXISTS flag_reviews_key_idx ON flag_reviews (flag_key);

CREATE TABLE IF NOT EXISTS account_codes (         -- AICTE-issued one-time codes: set the first password of an account
  id              bigserial PRIMARY KEY,
  user_id         text NOT NULL REFERENCES users(id),
  code_hash       text NOT NULL UNIQUE,            -- HMAC(k_activation, code); the plaintext is never stored
  issued_by       text NOT NULL,
  reason          text NOT NULL,
  idempotency_key text,
  request_hash    text NOT NULL,
  expires_at      timestamptz NOT NULL,
  used_at         timestamptz,
  voided_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issued_by, idempotency_key)
);

CREATE TABLE IF NOT EXISTS access_requests (       -- verifier organisations asking AICTE for an account
  id                bigserial PRIMARY KEY,
  organisation      text NOT NULL,
  contact_name_enc  bytea NOT NULL,                -- AES-GCM, AAD access_requests|contact_name|id
  contact_email_enc bytea NOT NULL,
  purpose           text NOT NULL,
  status            text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  decided_by        text,
  decision_reason   text,
  decided_at        timestamptz,
  user_id           text REFERENCES users(id),
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Phase 2 & Phase 6: Evidence-backed Case Management, Student Grievances & Record Correction Workflows
CREATE TABLE IF NOT EXISTS student_grievances (
  id                 bigserial PRIMARY KEY,
  student_id         bigint NOT NULL REFERENCES students(id),
  case_id            bigint REFERENCES duplicate_cases(id),
  enrolment_id       bigint REFERENCES enrolments(id),
  institution_id     text REFERENCES institutions(id),
  record_type        text NOT NULL DEFAULT 'grievance' CHECK (record_type IN ('grievance','correction_request')),
  category           text NOT NULL,
  subject            text NOT NULL,
  description        text NOT NULL,
  proposed_changes   jsonb NOT NULL DEFAULT '{}',
  current_values     jsonb NOT NULL DEFAULT '{}',
  status             text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','acknowledged','under_review','response_required','needs_more_information','resolution_proposed','resolved','accepted','rejected','escalated','withdrawn','closed')),
  assigned_to        text,
  resolution_summary text,
  review_decision    text CHECK (review_decision IN ('approved','rejected','more_info_needed','escalated')),
  reviewed_by        text,
  reviewed_at        timestamptz,
  applied_at         timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  resolved_at        timestamptz
);
CREATE INDEX IF NOT EXISTS student_grievances_student_idx ON student_grievances (student_id);
CREATE INDEX IF NOT EXISTS student_grievances_case_idx ON student_grievances (case_id);
CREATE INDEX IF NOT EXISTS student_grievances_enrolment_idx ON student_grievances (enrolment_id);
CREATE INDEX IF NOT EXISTS student_grievances_inst_idx ON student_grievances (institution_id);

-- Migration safety for pre-existing tables
ALTER TABLE student_grievances ADD COLUMN IF NOT EXISTS enrolment_id bigint REFERENCES enrolments(id);
ALTER TABLE student_grievances ADD COLUMN IF NOT EXISTS record_type text NOT NULL DEFAULT 'grievance';
ALTER TABLE student_grievances ADD COLUMN IF NOT EXISTS proposed_changes jsonb NOT NULL DEFAULT '{}';
ALTER TABLE student_grievances ADD COLUMN IF NOT EXISTS current_values jsonb NOT NULL DEFAULT '{}';
ALTER TABLE student_grievances ADD COLUMN IF NOT EXISTS review_decision text;
ALTER TABLE student_grievances ADD COLUMN IF NOT EXISTS reviewed_by text;
ALTER TABLE student_grievances ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE student_grievances ADD COLUMN IF NOT EXISTS applied_at timestamptz;
DO $$
BEGIN
  ALTER TABLE student_grievances DROP CONSTRAINT IF EXISTS student_grievances_status_check;
  ALTER TABLE student_grievances ADD CONSTRAINT student_grievances_status_check
    CHECK (status IN ('submitted','acknowledged','under_review','response_required','needs_more_information','resolution_proposed','resolved','accepted','rejected','escalated','withdrawn','closed'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS grievance_responses (
  id             bigserial PRIMARY KEY,
  grievance_id   bigint NOT NULL REFERENCES student_grievances(id) ON DELETE CASCADE,
  responder_id   text NOT NULL,
  responder_role text NOT NULL,
  message        text NOT NULL,
  visibility     text NOT NULL DEFAULT 'student_visible' CHECK (visibility IN ('student_visible','internal_only')),
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS grievance_responses_grievance_idx ON grievance_responses (grievance_id);

CREATE TABLE IF NOT EXISTS case_evidence (
  id                 bigserial PRIMARY KEY,
  case_id            bigint REFERENCES duplicate_cases(id),
  grievance_id       bigint REFERENCES student_grievances(id),
  category           text NOT NULL,
  filename           text NOT NULL,
  media_type         text NOT NULL,
  file_size          int NOT NULL,
  sha256_digest      text NOT NULL,
  storage_path       text NOT NULL,
  status             text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','under_review','verified','rejected','needs_clarification')),
  verification_notes text,
  uploaded_by        text NOT NULL,
  uploaded_at        timestamptz NOT NULL DEFAULT now(),
  reviewed_by        text,
  reviewed_at        timestamptz,
  CHECK (case_id IS NOT NULL OR grievance_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS case_evidence_case_idx ON case_evidence (case_id);
CREATE INDEX IF NOT EXISTS case_evidence_grievance_idx ON case_evidence (grievance_id);

CREATE TABLE IF NOT EXISTS case_decisions (
  id               bigserial PRIMARY KEY,
  case_id          bigint NOT NULL REFERENCES duplicate_cases(id),
  outcome          text NOT NULL CHECK (outcome IN ('CONFIRMED','NOT_CONFIRMED','INSUFFICIENT_EVIDENCE','REFERRED_FOR_ESCALATION')),
  reason           text NOT NULL,
  evidence_ids     bigint[] NOT NULL DEFAULT '{}',
  rule_ref         text,
  previous_status  text NOT NULL,
  resulting_status text NOT NULL,
  decision_maker   text NOT NULL,
  decided_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS case_decisions_case_idx ON case_decisions (case_id);

-- Offline OCR & Academic Field Extraction Subsystem
CREATE TABLE IF NOT EXISTS evidence_ocr_jobs (
  id                bigserial PRIMARY KEY,
  evidence_id       bigint NOT NULL REFERENCES case_evidence(id) ON DELETE CASCADE,
  source_digest     text NOT NULL,               -- SHA-256 of the exact evidence file at time of processing
  status            text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  language          text NOT NULL DEFAULT 'eng',
  extraction_method text NOT NULL DEFAULT 'hybrid' CHECK (extraction_method IN ('pdf_text_extraction', 'tesseract_ocr', 'hybrid')),
  page_count        int NOT NULL DEFAULT 0,
  pages_json        jsonb NOT NULL DEFAULT '[]', -- [{page_no, text, confidence, method}]
  fields_json       jsonb NOT NULL DEFAULT '[]', -- candidate academic fields with provenance & review status
  warnings          text[] NOT NULL DEFAULT '{}',
  duration_ms       int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  completed_at      timestamptz DEFAULT now(),
  error_message     text
);
CREATE INDEX IF NOT EXISTS evidence_ocr_jobs_evidence_idx ON evidence_ocr_jobs (evidence_id);
CREATE INDEX IF NOT EXISTS evidence_ocr_jobs_digest_idx ON evidence_ocr_jobs (source_digest);

-- ============================================================================
-- Phase 3: Policy Replay, Seat-Impact Simulation & Admission Integrity Analytics
-- ============================================================================

-- 1. Policy Definitions (Master catalog of statutory and regulatory policy documents)
CREATE TABLE IF NOT EXISTS policy_definitions (
  id                 text PRIMARY KEY,            -- e.g. 'POL-AICTE-INTAKE-2025'
  title              text NOT NULL,
  description        text NOT NULL,
  policy_source      text NOT NULL,            -- Reference e.g. 'AICTE Handbook Clause 7.12'
  academic_year      text NOT NULL,            -- e.g. '2025-26'
  institution_scope  text[] NOT NULL DEFAULT '{"*"}',
  programme_scope    text[] NOT NULL DEFAULT '{"*"}',
  created_at         timestamptz NOT NULL DEFAULT now(),
  created_by         text NOT NULL
);
CREATE INDEX IF NOT EXISTS policy_definitions_year_idx ON policy_definitions (academic_year);

-- 2. Policy Versions (Immutable, auditable revision history with formal lifecycle transitions)
CREATE TABLE IF NOT EXISTS policy_versions (
  id                 bigserial PRIMARY KEY,
  policy_id          text NOT NULL REFERENCES policy_definitions(id) ON DELETE CASCADE,
  version            int NOT NULL,
  status             text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'RETIRED')),
  effective_date     date NOT NULL,
  rules_json         jsonb NOT NULL,           -- Structured rule definitions (caps, multipliers, subcaps, age bounds)
  change_summary     text NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  created_by         text NOT NULL,
  approved_by        text,
  approved_at        timestamptz,
  activated_at       timestamptz,
  UNIQUE (policy_id, version)
);
CREATE INDEX IF NOT EXISTS policy_versions_lookup_idx ON policy_versions (policy_id, version);
CREATE INDEX IF NOT EXISTS policy_versions_status_idx ON policy_versions (status);

-- 3. Replay Snapshots (Immutable versioned admission datasets with cryptographic digest binding)
CREATE TABLE IF NOT EXISTS replay_snapshots (
  id                 text PRIMARY KEY,            -- e.g. 'SNAP-2025-BATCH-108'
  title              text NOT NULL,
  academic_year      text NOT NULL,
  institution_id     text REFERENCES institutions(id), -- NULL for multi-institution / national snapshots
  batch_id           int REFERENCES upload_batches(id),
  row_count          int NOT NULL,
  input_digest       text NOT NULL,               -- Canonical SHA-256 of raw snapshot records
  rows_json          jsonb NOT NULL,              -- Immutable snapshot records
  created_at         timestamptz NOT NULL DEFAULT now(),
  created_by         text NOT NULL
);
CREATE INDEX IF NOT EXISTS replay_snapshots_year_idx ON replay_snapshots (academic_year);
CREATE INDEX IF NOT EXISTS replay_snapshots_digest_idx ON replay_snapshots (input_digest);

-- 4. Policy Replay Execution Jobs (Deterministic execution logs & reproducibility metadata)
CREATE TABLE IF NOT EXISTS replay_jobs (
  id                 bigserial PRIMARY KEY,
  policy_id          text NOT NULL REFERENCES policy_definitions(id),
  policy_version     int NOT NULL,
  snapshot_id        text NOT NULL REFERENCES replay_snapshots(id),
  engine_version     text NOT NULL DEFAULT '1.0.0-phase3',
  input_digest       text NOT NULL,
  result_digest      text NOT NULL,               -- SHA-256 of deterministic replay outcome
  status             text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at         timestamptz NOT NULL DEFAULT now(),
  completed_at       timestamptz DEFAULT now(),
  duration_ms        int NOT NULL DEFAULT 0,
  summary_stats      jsonb NOT NULL DEFAULT '{}', -- Evaluated rows, violations, category breakdown
  violations_json    jsonb NOT NULL DEFAULT '[]',
  counters_json      jsonb NOT NULL DEFAULT '{}',
  warnings           text[] NOT NULL DEFAULT '{}',
  created_by         text NOT NULL
);
CREATE INDEX IF NOT EXISTS replay_jobs_snapshot_idx ON replay_jobs (snapshot_id);
CREATE INDEX IF NOT EXISTS replay_jobs_policy_idx ON replay_jobs (policy_id, policy_version);

-- 5. Seat-Impact Simulations (Comparative policy impact analyses isolated from live admissions)
CREATE TABLE IF NOT EXISTS seat_simulations (
  id                 bigserial PRIMARY KEY,
  title              text NOT NULL,
  baseline_policy_id text NOT NULL REFERENCES policy_definitions(id),
  baseline_version   int NOT NULL,
  proposed_policy_id text NOT NULL REFERENCES policy_definitions(id),
  proposed_version   int NOT NULL,
  snapshot_id        text NOT NULL REFERENCES replay_snapshots(id),
  simulation_scope   jsonb NOT NULL DEFAULT '{}', -- Optional filters by institution/programme
  impact_summary     jsonb NOT NULL,              -- Capacity diff, allocation diff, violation deltas
  programme_impacts  jsonb NOT NULL DEFAULT '[]', -- Breakdown per programme
  new_violations     jsonb NOT NULL DEFAULT '[]', -- Newly introduced violations
  resolved_violations jsonb NOT NULL DEFAULT '[]', -- Previously detected violations resolved
  manual_review_cases jsonb NOT NULL DEFAULT '[]',-- Ambiguous border-case candidates
  simulated_at       timestamptz NOT NULL DEFAULT now(),
  simulated_by       text NOT NULL
);
CREATE INDEX IF NOT EXISTS seat_simulations_snapshot_idx ON seat_simulations (snapshot_id);

-- 6. Explainable Admission Integrity Analytics Findings
CREATE TABLE IF NOT EXISTS admission_integrity_findings (
  id                 text PRIMARY KEY,            -- e.g. 'AIF-2025-0012'
  indicator_type     text NOT NULL CHECK (indicator_type IN (
                       'OVER_INTAKE_PERSISTENCE',
                       'SUPERNUMERARY_QUOTA_SPIKE',
                       'CROSS_INSTITUTION_DUPLICATE_CLUSTER',
                       'DISPUTE_RESOLUTION_BOTTLENECK',
                       'INTEGRITY_VERIFICATION_DEVIATION',
                       'VOLATILE_ADMISSION_SWING'
                     )),
  institution_id     text NOT NULL REFERENCES institutions(id),
  programme_id       text REFERENCES programmes(id),
  academic_year      text NOT NULL,
  severity           text NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
  score              double precision NOT NULL,
  detection_rule     text NOT NULL,
  supporting_measurements jsonb NOT NULL,
  explanation        text NOT NULL,
  detected_at        timestamptz NOT NULL DEFAULT now(),
  review_status      text NOT NULL DEFAULT 'NEW' CHECK (review_status IN ('NEW', 'UNDER_INVESTIGATION', 'DISMISSED', 'ESCALATED')),
  review_notes       text,
  reviewed_by        text,
  reviewed_at        timestamptz
);
CREATE INDEX IF NOT EXISTS aif_inst_idx ON admission_integrity_findings (institution_id);
CREATE INDEX IF NOT EXISTS aif_type_idx ON admission_integrity_findings (indicator_type);
CREATE INDEX IF NOT EXISTS aif_status_idx ON admission_integrity_findings (review_status);

-- 7. Finding Review Trail (Non-destructive human-in-the-loop review history)
CREATE TABLE IF NOT EXISTS finding_reviews (
  id                 bigserial PRIMARY KEY,
  finding_id         text NOT NULL REFERENCES admission_integrity_findings(id) ON DELETE CASCADE,
  action             text NOT NULL CHECK (action IN ('UNDER_INVESTIGATION', 'DISMISSED', 'ESCALATED')),
  notes              text NOT NULL,
  reviewer_id        text NOT NULL,
  reviewed_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS finding_reviews_finding_idx ON finding_reviews (finding_id);

-- Phase 5: Privacy-Preserving Cross-Institution Matching
CREATE TABLE IF NOT EXISTS candidate_matches (
  id                      text PRIMARY KEY,             -- e.g. 'MATCH-2026-0001'
  academic_year           text NOT NULL REFERENCES academic_years(code),
  rule_version            text NOT NULL DEFAULT 'RULE_V1_0',
  normalization_version   text NOT NULL DEFAULT 'NORM_V1_0',
  classification          text NOT NULL CHECK (classification IN (
                            'HIGH_CONFIDENCE_EXACT',
                            'MULTI_FIELD_COMPOSITE',
                            'CONFLICTING_INFO',
                            'NAME_ONLY_LEAD'
                          )),
  status                  text NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN (
                            'PENDING_REVIEW',
                            'UNDER_REVIEW',
                            'CONFIRMED_DUPLICATE',
                            'FALSE_POSITIVE',
                            'INSUFFICIENT_EVIDENCE',
                            'ESCALATED'
                          )),
  record_a_institution_id text NOT NULL REFERENCES institutions(id),
  record_a_enrolment_id   bigint NOT NULL REFERENCES enrolments(id),
  record_b_institution_id text NOT NULL REFERENCES institutions(id),
  record_b_enrolment_id   bigint NOT NULL REFERENCES enrolments(id),
  matched_fields          text[] NOT NULL,
  conflicting_fields      text[] NOT NULL DEFAULT '{}',
  confidence_score        double precision NOT NULL,
  measurements            jsonb NOT NULL DEFAULT '{}',
  linked_case_id          bigint REFERENCES duplicate_cases(id),
  created_at              timestamptz NOT NULL DEFAULT now(),
  reviewed_by             text,
  reviewed_at             timestamptz,
  review_notes            text,
  audit_ref               text
);

CREATE UNIQUE INDEX IF NOT EXISTS candidate_matches_pair_idx 
  ON candidate_matches (LEAST(record_a_enrolment_id, record_b_enrolment_id), GREATEST(record_a_enrolment_id, record_b_enrolment_id), rule_version);
CREATE INDEX IF NOT EXISTS candidate_matches_inst_a_idx ON candidate_matches (record_a_institution_id);
CREATE INDEX IF NOT EXISTS candidate_matches_inst_b_idx ON candidate_matches (record_b_institution_id);
CREATE INDEX IF NOT EXISTS candidate_matches_status_idx ON candidate_matches (status);
CREATE INDEX IF NOT EXISTS candidate_matches_case_idx ON candidate_matches (linked_case_id);



