import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Fingerprint,
  GraduationCap,
  History,
  Layers,
  LayoutDashboard,
  Lock,
  RefreshCw,
  Scale,
  ScrollText,
  Search,
  ShieldCheck,
  UserCheck,
  Wallet,
} from "lucide-react";
import { ApiError, approveWithPasskey, getJson, sendJson, type S } from "../api/client";
import { passkeyError } from "../webauthn";
import { CertificateButton, CredentialCard, downloadJson } from "../credentials";
import { Badge, Button, Card, Empty, ErrorNote, fmtTime, go, Loading, PageHeader, Table, Td, Updated, usePoll, type Tone } from "../ui";
import { StudentGrievanceSection } from "../components/StudentGrievance";

const ACTION_LABEL: Record<string, string> = {
  "credential.verify": "Verified a credential",
  "credential.issue": "Issued a credential",
  "credential.read": "Viewed your credentials",
  "credential.certificate": "Opened a certificate",
  "consent.request": "Requested your consent",
  "consent.grant": "Consent granted",
  "consent.deny": "Consent denied",
  "consent.revoke": "Consent revoked",
  "enrolment.read": "Looked up your enrolment",
  "enrolment.update": "Updated your enrolment",
  "activation_code.issue": "Issued a passkey activation code",
  "passkey.register": "Registered a passkey",
  "passkey.sign_in": "Signed in with a passkey",
  "passkey.revoke": "Revoked a passkey",
  "case.unmask": "Unmasked your record for a duplicate case",
};

interface StudentHomeProps {
  hash?: string;
}

export default function StudentHome({ hash = "/student" }: StudentHomeProps) {
  const me = usePoll(() => getJson<S["StudentProfile"]>("/v1/students/me"), 10000);
  const creds = usePoll(() => getJson<S["CredentialOut"][]>("/v1/credentials"), 5000);
  const consents = usePoll(() => getJson<S["ConsentOut"][]>("/v1/consents"), 3000);
  const log = usePoll(() => getJson<S["AccessLogEntry"][]>("/v1/students/me/access-log"), 5000);

  const refresh = () => {
    me.refresh();
    creds.refresh();
    consents.refresh();
    log.refresh();
  };

  const [path] = (hash || "/student").split("?");
  let activeTab: "record" | "consents" | "wallet" | "grievances" | "access-log" | "all" = "record";
  if (path.includes("consents")) activeTab = "consents";
  else if (path.includes("wallet")) activeTab = "wallet";
  else if (path.includes("grievance")) activeTab = "grievances";
  else if (path.includes("access-log") || path.includes("log")) activeTab = "access-log";
  else if (path.includes("all")) activeTab = "all";
  else activeTab = "record";

  if (me.error && !me.data) return <ErrorNote>{me.error}</ErrorNote>;
  if (!me.data) return <Loading />;

  const consentsList = Array.isArray(consents.data) ? consents.data : [];
  const credsList = Array.isArray(creds.data) ? creds.data : [];
  const logList = Array.isArray(log.data) ? log.data : [];

  const pending = consentsList.filter((c) => c && c.status === "pending");
  const others = consentsList.filter((c) => c && c.status !== "pending");

  const TABS = [
    { id: "record" as const, route: "/student", label: "My record", icon: LayoutDashboard },
    {
      id: "consents" as const,
      route: "/student/consents",
      label: "Consent requests",
      icon: Fingerprint,
      count: pending.length,
      badgeTone: "flag" as Tone,
    },
    {
      id: "wallet" as const,
      route: "/student/wallet",
      label: "Credential wallet",
      icon: Wallet,
      count: credsList.length,
      badgeTone: "ok" as Tone,
    },
    { id: "grievances" as const, route: "/student/grievances", label: "Grievances & disputes", icon: Scale },
    {
      id: "access-log" as const,
      route: "/student/access-log",
      label: "Who accessed my data",
      icon: ScrollText,
      count: logList.length,
      badgeTone: "neutral" as Tone,
    },
    { id: "all" as const, route: "/student/all", label: "All views", icon: Layers },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Student Navigation Tab Strip */}
      <div className="sticky top-[57px] z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0b0f14]/85 px-4 py-3 backdrop-blur-xl shadow-lg">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {TABS.map((tab) => {
            const on = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => go(tab.route)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  on
                    ? "bg-gold/15 text-champagne border border-gold/40 shadow-sm"
                    : "text-mute hover:bg-white/[0.04] hover:text-ink border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${on ? "text-gold" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.2 text-[10px] font-bold ${
                      tab.badgeTone === "flag"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                        : "bg-white/10 text-champagne border border-white/10"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <Updated at={consents.updatedAt} />
          <Button variant="secondary" onClick={refresh}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Sub-view switcher */}
      {activeTab === "record" && (
        <RecordView
          profile={me.data}
          pendingCount={pending.length}
          credsCount={credsList.length}
          logCount={logList.length}
          onRefresh={refresh}
        />
      )}

      {activeTab === "consents" && (
        <ConsentsView
          pending={pending}
          others={others}
          onDone={refresh}
          profile={me.data}
        />
      )}

      {activeTab === "wallet" && (
        <WalletView
          creds={credsList}
          loading={!creds.data}
          profile={me.data}
        />
      )}

      {activeTab === "grievances" && (
        <GrievancesView profile={me.data} />
      )}

      {activeTab === "access-log" && (
        <AccessLogView
          logs={logList}
          loading={!log.data}
          profile={me.data}
        />
      )}

      {activeTab === "all" && (
        <div className="space-y-8">
          <div className="rounded-xl border border-gold/25 bg-gold/[0.06] p-4 text-xs text-champagne flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Layers className="h-4 w-4 text-gold" /> You are viewing the unified overview with all student record sections.
            </span>
            <Button variant="secondary" onClick={() => go("/student")}>
              Switch to Tabbed View
            </Button>
          </div>
          <RecordView
            profile={me.data}
            pendingCount={pending.length}
            credsCount={creds.data?.length ?? 0}
            logCount={log.data?.length ?? 0}
            onRefresh={refresh}
          />
          <ConsentsView
            pending={pending}
            others={others}
            onDone={refresh}
            profile={me.data}
          />
          <WalletView
            creds={creds.data ?? []}
            loading={!creds.data}
            profile={me.data}
          />
          <GrievancesView profile={me.data} />
          <AccessLogView
            logs={log.data ?? []}
            loading={!log.data}
            profile={me.data}
          />
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   SUB-VIEWS
   ========================================================================= */

/** 1. MY RECORD VIEW */
function RecordView({
  profile,
  pendingCount,
  credsCount,
  logCount,
  onRefresh,
}: {
  profile: S["StudentProfile"];
  pendingCount: number;
  credsCount: number;
  logCount: number;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Student Profile & Digital APAAR ID Card */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Holographic APAAR identity card */}
        <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-[#1a1710] via-raised to-surface p-6 text-white ring-1 ring-gold/25 shadow-premium-lg md:col-span-1 flex flex-col justify-between">
          <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-accent-600/20 blur-2xl" />

          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <span className="text-[11px] font-extrabold tracking-widest text-white uppercase">
                  APAAR ID
                </span>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                {profile.apaar_status}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Student Name</span>
                <div className="font-display text-lg font-bold text-champagne">
                  {profile.name ?? "Aarav Sharma"}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">APAAR ID (masked)</span>
                <div className="font-mono text-base font-extrabold tracking-wider text-white">
                  {profile.apaar_masked ?? profile.provisional_id}
                </div>
                {profile.provisional_id && !profile.apaar_masked && (
                  <span className="text-[10px] text-warning-text font-medium">Provisional ID: APAAR not linked</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-mute font-medium">
            <span>APAAR registry (MOCK)</span>
            <span className="font-mono text-[10px] text-gold">ACTIVE</span>
          </div>
        </div>

        {/* Overview Header */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-surface p-6 shadow-premium md:col-span-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
              <UserCheck className="h-4 w-4" /> Academic Identity Verified
            </div>
            <h1 className="mt-2 font-display text-[32px] font-bold leading-tight text-ink sm:text-[38px]">
              {profile.viewer === "guardian"
                ? `Guardian View: ${profile.name ?? "Aarav Sharma"}'s Academic Record`
                : `${profile.name ?? "Aarav Sharma"}'s Academic Record`}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Enrolled in <strong className="text-slate-800">{profile.enrolments[0]?.programme ?? "B.E. Computer Science and Engineering"}</strong> at <strong className="text-slate-800">{profile.enrolments[0]?.institution ?? "Vidyapeeth Institute of Technology & Science"}</strong>.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-500">
              Institution: <strong className="text-slate-800">{profile.enrolments[0]?.institution ?? "Enrolled"}</strong>
            </span>
            <Button variant="secondary" onClick={onRefresh}>
              <RefreshCw className="h-3 w-3" /> Refresh data
            </Button>
          </div>
        </div>
      </div>

      {profile.passkey_cooldown_until && (
        <div role="alert" className="rounded-xl border border-warn/30 bg-warn-bg px-4 py-3 text-sm text-warn">
          A new passkey was registered for this account. As a safety measure it can approve consent requests only from
          {" "}{fmtTime(profile.passkey_cooldown_until)}. If this wasn't you, contact your institution and AICTE: every activation
          code, with its reason, is listed under "Who accessed my data".
        </div>
      )}

      {/* Quick Action Navigation Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          onClick={() => go("/student/consents")}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold group-hover:bg-gold/20">
              <Fingerprint className="h-5 w-5" />
            </div>
            {pendingCount > 0 ? (
              <Badge tone="flag" dot>{pendingCount} pending</Badge>
            ) : (
              <Badge tone="ok">All verified</Badge>
            )}
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-ink group-hover:text-gold transition-colors">
            Consent requests
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {pendingCount > 0
              ? `${pendingCount} verification request waiting for passkey approval.`
              : "Review past third-party approvals and revoke access."}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-gold">
            <span>Review requests</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        <div
          onClick={() => go("/student/wallet")}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20">
              <Wallet className="h-5 w-5" />
            </div>
            <Badge tone="brand">{credsCount} credentials</Badge>
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-ink group-hover:text-gold transition-colors">
            Credential wallet
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            View signed W3C credentials, download JSON, and view official certificates.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-gold">
            <span>Open wallet</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        <div
          onClick={() => go("/student/grievances")}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-500/20">
              <Scale className="h-5 w-5" />
            </div>
            <Badge tone="neutral">Redressal</Badge>
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-ink group-hover:text-gold transition-colors">
            Grievances & disputes
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Contest duplicate admission flags or submit academic profile corrections.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-gold">
            <span>Track & file</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        <div
          onClick={() => go("/student/access-log")}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/20">
              <ScrollText className="h-5 w-5" />
            </div>
            <Badge tone="ok">{logCount} events</Badge>
          </div>
          <h3 className="mt-4 font-display text-base font-bold text-ink group-hover:text-gold transition-colors">
            Who accessed my data
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Immutable audit log under DPDP 2023 of every read, verification, and unmasking.
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-gold">
            <span>View audit trail</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Enrolment Registry Record */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-accent-600" />
            <span>Enrolments</span>
          </div>
        }
      >
        {profile.enrolments.length === 0 ? (
          <Empty>No enrolments.</Empty>
        ) : (
          <Table head={["Programme", "Institution", "Year", "Student ID", "Status"]}>
            {profile.enrolments.map((e, i) => (
              <tr key={i} className="transition-colors hover:bg-slate-50/70">
                <Td className="font-bold text-gov-900">{e.programme}</Td>
                <Td className="font-medium text-slate-700">{e.institution}</Td>
                <Td>{e.academic_year}</Td>
                <Td className="font-mono text-xs font-bold text-slate-600">{e.institution_student_id}</Td>
                <Td>
                  <Badge tone={e.status === "active" ? "ok" : "neutral"} dot>
                    {e.status.toUpperCase()}
                  </Badge>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

function StudentIdentityBar({ profile }: { profile: S["StudentProfile"] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-surface px-4 py-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-gold/15 text-gold">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          {profile.viewer === "guardian" ? "Guardian View" : "Student"}:
        </span>
        <span className="font-display text-sm font-bold text-ink">
          {profile.name ?? "Aarav Sharma"}
        </span>
        <span className="font-mono text-xs text-slate-500 font-bold">
          ({profile.apaar_masked ?? profile.provisional_id})
        </span>
        <Badge tone="ok" dot>{profile.apaar_status}</Badge>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
        <GraduationCap className="h-3.5 w-3.5 text-accent-600" />
        <span>{profile.enrolments[0]?.programme ?? "Academic Enrolment"}</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-500">{profile.enrolments[0]?.institution ?? "Enrolled"}</span>
      </div>
    </div>
  );
}

/** 2. CONSENT REQUESTS VIEW */
function ConsentsView({
  pending,
  others,
  onDone,
  profile,
}: {
  pending: S["ConsentOut"][];
  others: S["ConsentOut"][];
  onDone: () => void;
  profile: S["StudentProfile"];
}) {
  return (
    <div className="space-y-6" id="consents">
      <PageHeader
        eyebrow="DPDP Act 2023 · Privacy Architecture"
        title="Consent Requests & Data Sharing"
        meta={
          <span>
            Under the Digital Personal Data Protection Act, verifiers, employers, and financial institutions cannot inspect your records without your permission.
          </span>
        }
      />
      <StudentIdentityBar profile={profile} />

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-surface p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Pending Authorizations</span>
            <Fingerprint className="h-4 w-4 text-gold" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-ink">{pending.length}</div>
          <p className="mt-1 text-xs text-slate-500">Requires passkey or OTP signing</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-surface p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Active Granted Consents</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-ink">
            {others.filter((c) => c.status === "granted").length}
          </div>
          <p className="mt-1 text-xs text-slate-500">Selective disclosure tokens active</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-surface p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Historical Inquiries</span>
            <History className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-ink">{pending.length + others.length}</div>
          <p className="mt-1 text-xs text-slate-500">Total requests logged</p>
        </div>
      </div>

      {/* Pending Consent Requests Inbox */}
      <Card
        title={
          <div className="flex items-center gap-2.5">
            <Fingerprint className="h-4 w-4 text-accent-600" />
            <span>Pending consent requests</span>
            {pending.length > 0 && (
              <Badge tone="flag" dot>
                {pending.length} pending authorization
              </Badge>
            )}
          </div>
        }
        actions={<span className="text-xs text-slate-500 font-medium">Verify third-party requests before granting access</span>}
      >
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-display text-base font-bold text-ink">All caught up</h4>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              No pending consent requests waiting for authorization. When a verifier or employer asks to inspect your degree or marks, their request will appear here for your cryptographic signature.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((c) => (
              <PendingConsent key={c.id} c={c} onDone={onDone} />
            ))}
          </div>
        )}
      </Card>

      {/* Prior Consent History & Instant Access Revocation */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-accent-600" />
            <span>Prior consent history & instant revocation</span>
          </div>
        }
        actions={<span className="text-xs text-slate-500 font-medium">Revoking access immediately invalidates credential on status lists</span>}
      >
        {others.length === 0 ? (
          <Empty>No historical consent decisions recorded yet.</Empty>
        ) : (
          <Table head={["Verification Entity", "Declared Purpose", "Disclosed Claims", "Current Status", "Expires", "Action"]}>
            {others.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-slate-50/70">
                <Td className="font-semibold text-gov-900">{c.requester}</Td>
                <Td wrap className="min-w-48 text-xs">{c.purpose}</Td>
                <Td wrap className="text-xs text-slate-600">{c.fields.join(", ")}</Td>
                <Td>
                  <Badge tone={c.status === "granted" ? "ok" : c.status === "revoked" || c.status === "denied" ? "error" : "neutral"} dot>
                    {c.status.toUpperCase()}
                  </Badge>
                  {c.granted_by === "guardian" && (
                    <span className="ml-1.5 text-[11px] font-semibold text-slate-500">(Guardian Approved)</span>
                  )}
                </Td>
                <Td className="text-xs text-slate-500">{fmtTime(c.expires_at)}</Td>
                <Td>
                  {c.status === "granted" && <RevokeButton id={c.id} onDone={onDone} />}
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}

/** 3. CREDENTIAL WALLET VIEW */
function WalletView({
  creds,
  loading,
  profile,
}: {
  creds: S["CredentialOut"][];
  loading: boolean;
  profile: S["StudentProfile"];
}) {
  return (
    <div className="space-y-6" id="wallet">
      <PageHeader
        eyebrow="W3C Verifiable Credentials"
        title="Academic Credential Wallet"
        meta={
          <span>
            Cryptographically signed degrees, diplomas, and enrolment records issued directly to your APAAR identity. Verifiable anywhere without contacting your registrar.
          </span>
        }
      />
      <StudentIdentityBar profile={profile} />

      {/* Wallet Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-surface p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Verified Credentials</span>
            <Award className="h-4 w-4 text-gold" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-ink">{creds.length}</div>
          <p className="mt-1 text-xs text-slate-500">Digitally signed by issuer</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-surface p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Cryptographic Standard</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-lg font-mono font-bold text-ink">W3C VC 1.0 (Ed25519)</div>
          <p className="mt-1 text-xs text-slate-500">Tamper-evident hash proof</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-surface p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Trust Network</span>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-ink">Vidyadwaar Registry</div>
          <p className="mt-1 text-xs text-slate-500">Instant offline & online validation</p>
        </div>
      </div>

      {/* Credential Cards */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-accent-600" />
            <span>Issued academic credentials</span>
          </div>
        }
        actions={<span className="text-xs text-slate-500 font-medium">W3C Verifiable Credentials · verified online</span>}
      >
        {loading ? (
          <Loading />
        ) : creds.length === 0 ? (
          <Empty>No credentials issued yet. Your approved institution or university issues them upon enrolment confirmation.</Empty>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {creds.map((c) => (
              <CredentialCard
                key={c.id}
                c={c}
                actions={
                  <>
                    {c.type !== "VerificationCredential" && <CertificateButton id={c.id} />}
                    <Button variant="secondary" onClick={() => downloadJson(c.credential, `${c.type}.json`)}>
                      Download JSON
                    </Button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/** 4. GRIEVANCES & DISPUTES VIEW */
function GrievancesView({ profile }: { profile: S["StudentProfile"] }) {
  return (
    <div className="space-y-6" id="grievances">
      <PageHeader
        eyebrow="Institutional Redressal System"
        title="Grievances & Dispute Resolution"
        meta={
          <span>
            Formally contest duplicate admission flags (E203), submit corrections to your personal record, or dispute administrative findings with immutable evidentiary hashing.
          </span>
        }
      />
      <StudentIdentityBar profile={profile} />
      <StudentGrievanceSection />
    </div>
  );
}

/** 5. ACCESS LOG VIEW ("Who Accessed My Data") */
function AccessLogView({
  logs,
  loading,
  profile,
}: {
  logs: S["AccessLogEntry"][];
  loading: boolean;
  profile: S["StudentProfile"];
}) {
  const [filterType, setFilterType] = useState<"all" | "verify" | "consent" | "admin">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return logs.filter((e) => {
      if (filterType === "verify" && !e.action.includes("verify") && !e.action.includes("certificate") && !e.action.includes("read")) {
        return false;
      }
      if (filterType === "consent" && !e.action.includes("consent") && !e.action.includes("passkey")) {
        return false;
      }
      if (filterType === "admin" && !e.action.includes("case") && !e.action.includes("enrolment") && !e.action.includes("activation")) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const actionLabel = (ACTION_LABEL[e.action] ?? e.action).toLowerCase();
        const actor = (e.actor ?? "").toLowerCase();
        const role = (e.role ?? "").toLowerCase();
        const reason = (e.reason ?? "").toLowerCase();
        return actionLabel.includes(q) || actor.includes(q) || role.includes(q) || reason.includes(q);
      }
      return true;
    });
  }, [logs, filterType, search]);

  return (
    <div className="space-y-6" id="access-log">
      <PageHeader
        eyebrow="DPDP 2023 Compliance & Security"
        title="Who Accessed My Data"
        meta={
          <span>
            An immutable, transparent audit trail. Every verification, read, export, or administrative unmasking of your academic record is permanently logged here.
          </span>
        }
      />
      <StudentIdentityBar profile={profile} />

      {/* Log Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-surface p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Total Logged Events</span>
            <History className="h-4 w-4 text-gold" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-ink">{logs.length}</div>
          <p className="mt-1 text-xs text-slate-500">Every recorded external inspection</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-surface p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Audit Trail Integrity</span>
            <Lock className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-ink">100% Immutable</div>
          <p className="mt-1 text-xs text-slate-500">Append-only database logs</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-surface p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Governing Regulation</span>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-ink">DPDP Act 2023</div>
          <p className="mt-1 text-xs text-slate-500">Right to data access disclosure</p>
        </div>
      </div>

      {/* Controls: Search and Filter Pills */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-accent-600" />
            <span>Access audit trail ({filtered.length} of {logs.length})</span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search actor or purpose…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 rounded-lg border border-slate-300 pl-8 pr-3 text-xs focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5 text-xs bg-slate-50">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`rounded px-2 py-1 font-medium transition-colors ${
                  filterType === "all" ? "bg-white text-ink shadow-xs" : "text-slate-600 hover:text-ink"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType("verify")}
                className={`rounded px-2 py-1 font-medium transition-colors ${
                  filterType === "verify" ? "bg-white text-ink shadow-xs" : "text-slate-600 hover:text-ink"
                }`}
              >
                Verifications
              </button>
              <button
                type="button"
                onClick={() => setFilterType("consent")}
                className={`rounded px-2 py-1 font-medium transition-colors ${
                  filterType === "consent" ? "bg-white text-ink shadow-xs" : "text-slate-600 hover:text-ink"
                }`}
              >
                Consents
              </button>
              <button
                type="button"
                onClick={() => setFilterType("admin")}
                className={`rounded px-2 py-1 font-medium transition-colors ${
                  filterType === "admin" ? "bg-white text-ink shadow-xs" : "text-slate-600 hover:text-ink"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        }
      >
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Empty>No access log events match the selected criteria.</Empty>
        ) : (
          <ol className="space-y-3 border-l-2 border-slate-200 pl-4 py-2">
            {filtered.map((e, i) => (
              <li key={i} className="text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gov-900">{ACTION_LABEL[e.action] ?? e.action}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                    {e.role.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-0.5 text-slate-500">
                  By <strong className="text-slate-800">{e.actor}</strong>
                  {e.reason && <span> · Purpose: {e.reason}</span>}
                </div>
                <span className="mt-0.5 block font-mono text-[10px] text-slate-400">{fmtTime(e.ts)}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

/* =========================================================================
   COMPONENTS: PendingConsent, RevokeButton
   ========================================================================= */

function PendingConsent({ c, onDone }: { c: S["ConsentOut"]; onDone: () => void }) {
  const [demo, setDemo] = useState(false);
  const [otp, setOtp] = useState("");
  const [guardian, setGuardian] = useState(false);
  const [gotp, setGotp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    getJson<S["AuthConfig"]>("/v1/auth/config")
      .then((x) => setDemo(x.demo_mode))
      .catch(() => {});
  }, []);

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onDone();
    } catch (e) {
      setError(passkeyError(e) ?? (e instanceof ApiError ? e.text : "Request failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-accent-300 bg-accent-50/50 p-5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-gov-900">
            <strong className="text-accent-700">{c.requester}</strong> asks to see:
          </h4>
          <p className="mt-1 font-semibold text-accent-950 text-xs">{c.fields.join(", ")}</p>
          <p className="mt-1 text-xs text-slate-600">
            Purpose: <span className="font-medium">{c.purpose}</span> · until {fmtTime(c.expires_at)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            They will receive a signed credential with only these fields. You can revoke it at any time. Your passkey signs exactly this request.
          </p>
        </div>
        <Badge tone="flag" dot>
          Action required
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-accent-200/60 pt-3 text-xs">
        <Button disabled={busy} onClick={() => act(() => approveWithPasskey(c.id))}>
          <Fingerprint className="h-4 w-4" aria-hidden /> {busy ? "Waiting for passkey…" : "Approve with passkey"}
        </Button>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => act(() => sendJson(`/v1/consents/${c.id}/deny`, "POST"))}
        >
          Deny
        </Button>
      </div>

      {demo && (
        <details className="mt-3 rounded-lg border border-warning-border bg-warning-bg p-2 text-sm">
          <summary className="cursor-pointer text-xs font-medium text-warning-text">
            Demo fallback: approve with MOCK OTP (DEMO_MODE)
          </summary>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="block text-xs text-slate-600">OTP (MOCK: 123456)</span>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-28 rounded-lg border border-slate-300 px-2 py-1"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={guardian}
                onChange={(e) => setGuardian(e.target.checked)}
              />
              Under 18: guardian approves (self-asserted, MOCK)
            </label>
            {guardian && (
              <label className="text-sm">
                <span className="block text-xs text-slate-600">Guardian OTP (MOCK)</span>
                <input
                  value={gotp}
                  onChange={(e) => setGotp(e.target.value)}
                  inputMode="numeric"
                  className="mt-1 w-28 rounded-lg border border-slate-300 px-2 py-1"
                />
              </label>
            )}
            <Button
              variant="secondary"
              disabled={busy || !otp}
              onClick={() =>
                act(() =>
                  sendJson(`/v1/consents/${c.id}/approve`, "POST", {
                    otp,
                    approved_by: guardian ? "guardian" : "student",
                    guardian_otp: guardian ? gotp : null,
                  })
                )
              }
            >
              Approve (MOCK)
            </Button>
          </div>
        </details>
      )}

      {error && (
        <div className="mt-3">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}
    </div>
  );
}

function RevokeButton({ id, onDone }: { id: number; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="danger"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm("Revoke this consent? The verifier's credential will instantly cease to verify.")) return;
        setBusy(true);
        try {
          await sendJson(`/v1/consents/${id}/revoke`, "POST");
          onDone();
        } finally {
          setBusy(false);
        }
      }}
    >
      Revoke Access
    </Button>
  );
}
