import { useEffect, useState } from "react";
import { loadSession, saveSession, setUnauthorizedHandler, type Role, type Session } from "./api/client";
import AppLayout from "./components/AppLayout";
import { VerifyTool } from "./credentials";
import AicteHome from "./pages/Aicte";
import BatchDetail from "./pages/Batch";
import Certificate from "./pages/Certificate";
import InstitutionHome from "./pages/Institution";
import Login from "./pages/Login";
import RegistrarHome from "./pages/Registrar";
import StudentHome from "./pages/Student";
import VerifierHome from "./pages/Verifier";
import ErrorBoundary from "./components/ErrorBoundary";
import HowItWorks from "./pages/HowItWorks";
import DeveloperPortal from "./pages/DeveloperPortal";
import { go, PageHeader } from "./ui";

/** Flexible router: supports hash (#/inst, #/batch/12) and pathname (/how-it-works, /inst) */
function getRoute() {
  if (typeof window === "undefined") return "/";
  if (window.location.hash && window.location.hash.length > 1) {
    return window.location.hash.slice(1);
  }
  const path = window.location.pathname;
  if (path && path !== "/") {
    return path + window.location.search;
  }
  return "/";
}

function useHash() {
  const [hash, setHash] = useState(getRoute);
  useEffect(() => {
    const on = () => setHash(getRoute());
    window.addEventListener("hashchange", on);
    window.addEventListener("popstate", on);
    return () => {
      window.removeEventListener("hashchange", on);
      window.removeEventListener("popstate", on);
    };
  }, []);
  return hash;
}

const HOME: Record<Role, string> = {
  institution_admin: "/inst",
  aicte_officer: "/aicte",
  auditor: "/aicte",
  verifier: "/verifier",
  university_registrar: "/registrar",
  student: "/student",
  guardian: "/student",
};

const CAN_VERIFY: Role[] = ["institution_admin", "aicte_officer", "auditor", "verifier", "university_registrar"];

const ROLE_LABEL: Record<Role, string> = {
  institution_admin: "Institution Admin",
  aicte_officer: "AICTE Officer",
  auditor: "National Auditor (Read-only)",
  verifier: "Credential Verifier",
  university_registrar: "University Registrar",
  student: "Student",
  guardian: "Guardian",
};

export default function App() {
  const [session, setSession] = useState<Session | null>(loadSession);
  const hash = useHash();

  const logout = () => {
    saveSession(null);
    setSession(null);
    go("/");
  };

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, []);

  // Public full-screen interactive walkthrough
  if (hash === "/how-it-works" || hash === "/how") {
    return <HowItWorks />;
  }

  if (hash === "/developer" || hash === "/packages") {
    return <DeveloperPortal />;
  }

  if (!session) {
    return (
      <Login
        hash={hash}
        onLogin={(s) => {
          setSession(s);
          go(HOME[s.role]);
        }}
      />
    );
  }

  const batch = hash.match(/^\/(?:inst\/)?batch\/(\d+)$/);
  const cert = hash.match(/^\/certificate(?:\?id=|\/)(.+)$/);
  const r = session.role;
  let page;

  if (cert) {
    page = <Certificate id={decodeURIComponent(cert[1])} />;
  } else if (hash === "/verify" && CAN_VERIFY.includes(r)) {
    page = (
      <div className="space-y-6">
        <PageHeader eyebrow="Verification" title="Verify a credential"
          meta={<span>Paste a credential or the certificate QR text. Checked online against the trust registry (MOCK) and status lists.</span>} />
        <VerifyTool allowForgedDemo={r === "aicte_officer" || r === "auditor"} />
      </div>
    );
  } else if (r === "institution_admin" && batch) {
    page = <BatchDetail id={Number(batch[1])} />;
  } else if (r === "institution_admin") {
    page = <InstitutionHome />;
  } else if (r === "aicte_officer" || r === "auditor") {
    page = <AicteHome role={r} hash={hash} />;
  } else if (r === "verifier") {
    page = <VerifierHome />;
  } else if (r === "university_registrar") {
    page = <RegistrarHome />;
  } else {
    page = <StudentHome hash={hash} />;
  }

  return (
    <AppLayout
      session={session}
      roleLabel={ROLE_LABEL[session.role]}
      onLogout={logout}
      canVerify={CAN_VERIFY.includes(session.role)}
      currentHash={hash}
      home={HOME[session.role]}
    >
      <ErrorBoundary>
        {page}
      </ErrorBoundary>
    </AppLayout>
  );
}
