with open('frontend/src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''  if (hash === "/developer" || hash === "/packages") {
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
    page = <Certificate id={decodeURIComponent(cert[1])} />;'''

replacement = '''  if (hash === "/developer" || hash === "/packages") {
    return <DeveloperPortal />;
  }

  // Public certificate view (accessible without sign-in)
  if (hash.startsWith("/certificate")) {
    const certMatch = hash.match(/^\/certificate(?:[/?](?:id=)?(.*))?$/);
    const certId = certMatch && certMatch[1] ? decodeURIComponent(certMatch[1]) : "vc-bntu-2026-001";
    if (!session) {
      return (
        <div className="relative min-h-screen w-full bg-[#121316] p-6 text-white selection:bg-[#d4af37]/40">
          <Certificate id={certId} />
        </div>
      );
    }
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
  const cert = hash.match(/^\/certificate(?:[/?](?:id=)?(.*))?$/);
  const r = session.role;
  let page;

  if (hash.startsWith("/certificate")) {
    const certId = cert && cert[1] ? decodeURIComponent(cert[1]) : "vc-bntu-2026-001";
    page = <Certificate id={certId} />;'''

content_norm = content.replace("\r\n", "\n")
target_norm = target.replace("\r\n", "\n")
assert target_norm in content_norm, "Target not found in App.tsx"

content_norm = content_norm.replace(target_norm, replacement)
with open('frontend/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content_norm)

print("SUCCESS: frontend/src/App.tsx updated!")

