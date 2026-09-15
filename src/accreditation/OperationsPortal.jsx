import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { operationsApi as api } from "./operations-api";
import { ReviewWorkspace } from "./ReviewWorkspace";
import { PrintWorkspace } from "./PrintWorkspace";
import { DesignWorkspace } from "./DesignWorkspace";
import { AccessSettings } from "./AccessSettings";
import {
  accreditationRoles,
  restrictedZones,
} from "../../lib/accreditation-model.mjs";
import "./operations.css";
import {sharjahSeatingAreas} from '../../lib/accreditation-venues.mjs';
const PdfPreview = lazy(() => import("./PdfPreview"));
const workspaceNames = {
  Owner: "Applications",
  Reviewer: "Applications",
  Approver: "Approvals",
  "Restricted Approver": "Restricted approvals",
  "Print Operator": "Print queue",
  "Issuance Officer": "Collection",
  "Gate Operator": "Gate check",
  "Security Lead": "Security",
};

export function OperationsPortal() {
  const [user, setUser] = useState(null),
    [config, setConfig] = useState(null),
    [setup, setSetup] = useState(null),
    [tab, setTab] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [preview, setPreview] = useState(null),
    [dirty, setDirty] = useState(false);
  const [connection, setConnection] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const [invite, setInvite] = useState(
    () => new URLSearchParams(location.hash.slice(1)).get("invite") || "",
  );
  const pending = useRef(0);
  const run = async (fn) => {
    pending.current++;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      pending.current--;
      setBusy(pending.current > 0);
    }
  };
  async function refresh() {
    const [c, w] = await Promise.all([
      api("admin/config"),
      api("admin/workflow"),
    ]);
    setConfig(
      ["Owner", "Administrator"].includes(user?.role)
        ? c
        : { ...c, departments: w.departments },
    );
    setSetup(w);
  }
  async function checkConnection() {
    setLoading(true);
    setConnectionError('');
    try {
      setConnection(await api('status'));
      try { setUser((await api('auth/session')).user); }
      catch (e) { if(e.status !== 401) throw e; }
    } catch(e) { setConnectionError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    if (location.hash) history.replaceState(null, "", location.pathname);
    checkConnection();
  }, []);
  useEffect(() => {
    if (user) {
      const requested=location.pathname==='/accreditation/print'?'Print queue':new URLSearchParams(location.search).get('workspace');
      const allowed=user.role==='Owner'?['Setup','Applications','Print queue','Badge designs','Staff']:user.role==='Administrator'?['Setup','Badge designs']:[workspaceNames[user.role]];
      setTab(allowed.includes(requested)?requested:workspaceNames[user.role] || "Setup");
      run(refresh);
    }
  }, [user?.id]);
  const tabs = user
    ? user.role === "Owner"
      ? ["Setup", "Applications", "Print queue", "Badge designs", "Staff"]
      : user.role === "Administrator"
        ? ["Setup", "Badge designs"]
        : [workspaceNames[user.role]].filter(Boolean)
    : [];
  const leave = () => !dirty || confirm("Discard unsaved settings changes?");
  // Keep real staff authentication on its HTTPS origin when the preview's
  // separate local service is offline. Never forward query data or invitations.
  const localStaffUrl = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    && ['/accreditation/review', '/accreditation/owner', '/accreditation/print'].includes(location.pathname)
    ? 'https://wcl-2026-iota.vercel.app' + location.pathname : null;
  return (
    <div className="ops-shell">
      <header className="ops-topbar">
        <Link to="/" aria-label="WCL homepage">
          <img src="/assets/wcl-official-logo.png" alt="WCL" />
        </Link>
        <span>
          Accreditation<span>Season 3 · 2026</span>
        </span>
        {user ? (
          <div>
            <small>
              {user.email}
              <br />
              {user.role}
            </small>
            <button
              onClick={() => {
                if (leave())
                  run(async () => {
                    await api("auth/logout", {});
                    setUser(null);
                    setConfig(null);
                  });
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link to="/accreditation/apply">Applicant portal</Link>
        )}
      </header>
      <main>
        {user && (
          <nav className="ops-nav" aria-label="Accreditation workspace">
            {tabs.map((t) => (
              <button
                key={t}
                aria-current={tab === t ? "page" : undefined}
                onClick={() => {
                  if (leave()) {
                    setTab(t);
                    const url=new URL(location.href);
                    url.pathname=t==='Print queue'?'/accreditation/print':user.role==='Owner'?'/accreditation/owner':'/accreditation/review';
                    url.searchParams.set('workspace',t);
                    history.replaceState(null,'',url.pathname+url.search);
                    setDirty(false);
                    setError("");
                  }
                }}
              >
                {t}
              </button>
            ))}
          </nav>
        )}
        <div className="ops-page-heading">
          <div>
            <p>WCL / {user ? "OPERATIONS" : "PRIVATE STAFF ACCESS"}</p>
            <h1>{user ? tab : "Welcome back"}</h1>
          </div>
          {user && (
            <span className="ops-status">
              {config?.intake.enabled
                ? "Applications open"
                : "Applications closed"}
            </span>
          )}
        </div>
        {error && (
          <div className="ops-error" role="alert">
            {error}
            <button onClick={() => setError("")} aria-label="Dismiss error">
              Dismiss
            </button>
          </div>
        )}
        {notice && (
          <p className="ops-notice" role="status">
            {notice}
          </p>
        )}
        {busy && (
          <p role="status" className="ops-progress">
            Working…
          </p>
        )}
        {loading ? (
          <p role="status">Checking your session…</p>
        ) : !user && connectionError ? (
          <section className="ops-panel ops-login">
            {localStaffUrl ? <>
              <h2>Continue to the secure staff portal</h2>
              <p>This website preview is not connected to a local staff service. Use the live WCL portal with your existing account.</p>
              <a className="ops-primary ops-portal-link" href={localStaffUrl} referrerPolicy="no-referrer" rel="noreferrer">Open staff sign-in</a>
              <p className="ops-caption">Your account and records stay in the secure portal. No password has been checked here.</p>
              <button onClick={checkConnection}>Retry local connection</button>
            </> : <>
              <h2>Staff sign-in is temporarily unavailable</h2>
              <p role="alert">{connectionError}</p>
              <p>No password has been checked. Retry when the service connection is ready.</p>
              <button className="ops-primary" onClick={checkConnection}>Retry connection</button>
            </>}
          </section>
        ) : !user && !invite && connection?.ownerConfigured === false ? (
          <section className="ops-panel ops-login">
            <h2>Staff access is not ready yet</h2>
            <p>Use your private account invitation, or contact the WCL accreditation team. If you already have an account, check again.</p>
            <button className="ops-primary" onClick={checkConnection}>Check again</button>
          </section>
        ) : !user ? (
          <section className="ops-panel ops-login">
            <h2>
              {invite ? "Set up your account" : "Sign in to your workspace"}
            </h2>
            <p>
              Use your individual WCL staff invitation. Your assigned role opens
              the right workspace.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                run(async () => {
                  if (invite) {
                    await api("auth/accept", {
                      token: invite,
                      password: f.get("password"),
                    });
                    setInvite("");
                    setConnection(c => ({...c, ownerConfigured:true}));
                    setNotice(
                      "Account created. Sign in with your invited email.",
                    );
                  } else {
                    const r = await api("auth/login", {
                      email: f.get("email"),
                      password: f.get("password"),
                    });
                    setUser(r.user);
                  }
                });
              }}
            >
              <fieldset disabled={busy}>
                {!invite && (
                  <label>
                    Work email
                    <input
                      type="email"
                      name="email"
                      autoComplete="username"
                      required
                    />
                  </label>
                )}
                <label>
                  {invite ? "Choose a password" : "Password"}
                  <input
                    type="password"
                    name="password"
                    autoComplete={invite ? "new-password" : "current-password"}
                    minLength={invite ? 14 : 1}
                    maxLength={128}
                    required
                  />
                </label>
                {invite && (
                  <small>At least 14 characters. Use a unique password.</small>
                )}
                <button className="ops-primary">
                  {invite ? "Activate account" : "Sign in securely"}
                </button>
              </fieldset>
            </form>
            <p className="ops-caption">
              Need access or a password reset? Contact your WCL account Owner.
              Sessions close after 30 minutes without activity.
            </p>
          </section>
        ) : !config ? (
          <section className="ops-panel">
            <p>Workspace settings could not be loaded.</p>
            <button onClick={() => run(refresh)}>Retry loading</button>
          </section>
        ) : (
          <fieldset className="ops-workspace" disabled={busy}>
            {[
              "Applications",
              "Approvals",
              "Restricted approvals",
              "Collection",
              "Security",
            ].includes(tab) && (
              <ReviewWorkspace
                key={tab}
                user={user}
                config={config}
                run={run}
                onPreview={(blob, title, download=false) => setPreview({ blob, title, download })}
              />
            )}
            {tab === "Print queue" && (
              <PrintWorkspace
                config={config}
                run={run}
                onPreview={(blob, title) => setPreview({ blob, title, download:true })}
              />
            )}
            {tab === "Badge designs" && (
              <DesignWorkspace
                run={run}
                onPreview={(blob, title) => setPreview({ blob, title, download:true })}
              />
            )}
            {tab === "Setup" && (
              <>
                <details className="ops-panel ops-readiness">
                  <summary>Activation checks <small>{setup?.checks.filter(c=>c.ok).length||0} / {setup?.checks.length||0} verified</small></summary>
                  <p>
                    Intake checks control submissions. Artwork and print proof
                    control final PDFs, not application approval.
                  </p>
                  {setup?.checks.map((c) => (
                    <div key={c.id}>
                      <span>{c.label}{c.stage==='printing'?' · Printing':''}</span>
                      <strong className={c.ok ? "is-verified" : ""}>
                        {c.ok ? "Verified" : "Incomplete"}
                      </strong>
                      {!c.ok&&c.nextAction&&<p className="setup-next-action">{c.nextAction}</p>}
                    </div>
                  ))}
                  <button onClick={() => run(refresh)}>Recheck setup</button>
                </details>
                <AccessSettings api={api} onDirtyChange={setDirty} onSaved={refresh} />
              </>
            )}
            {tab === "Staff" && <StaffWorkspace config={config} run={run} />}
            {tab === "Gate check" && (
              <GateWorkspace config={config} run={run} />
            )}
            {!tabs.length && (
              <p>
                Your account needs a current accreditation role. Ask the Owner
                to update it.
              </p>
            )}
          </fieldset>
        )}
      </main>
      <footer className="ops-footer">
        <span>WCL accreditation</span>
        <Link to="/">Return to website</Link>
      </footer>
      {preview && (
        <Suspense fallback={<p role="status">Preparing badge preview…</p>}>
          <PdfPreview {...preview} onClose={() => setPreview(null)} />
        </Suspense>
      )}
    </div>
  );
}

function StaffWorkspace({ config, run }) {
  const [rows, setRows] = useState([]),
    [departments, setDepartments] = useState([]),
    [zones, setZones] = useState([]),
    [invitation, setInvitation] = useState(null);
  const load = async () => setRows((await api("admin/staff")).items);
  useEffect(() => {
    run(load);
  }, []);
  const choose = (setter, values, id) =>
    setter(
      values.includes(id) ? values.filter((v) => v !== id) : [...values, id],
    );
  return (
    <div className="ops-case-grid">
      <section className="ops-panel">
        <h2>Invite a colleague</h2>
        <p>
          Assign one role and the departments they may work on. No shared
          accounts.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            run(async () => {
              const email = f.get("email");
              await api("admin/assignments", { email, departments, zones });
              const result = await api("admin/staff/invite", {
                email,
                role: f.get("role"),
              });
              setInvitation(result);
              await load();
            });
          }}
        >
          <label>
            Work email
            <input type="email" name="email" required />
          </label>
          <label>
            Role
            <select name="role">
              {accreditationRoles
                .filter((r) => r !== "Owner")
                .map((r) => (
                  <option key={r}>{r}</option>
                ))}
            </select>
          </label>
          <fieldset className="ops-choices">
            <legend>Assigned departments</legend>
            {config.departments.map((d) => (
              <label key={d.id}>
                <input
                  type="checkbox"
                  checked={departments.includes(d.id)}
                  onChange={() => choose(setDepartments, departments, d.id)}
                />
                {d.label}
              </label>
            ))}
          </fieldset>
          <details>
            <summary>Restricted approver authority</summary>
            <p>Only the Restricted Approver role can use these permissions.</p>
            {config.zones
              .filter((z) => restrictedZones.includes(z.id))
              .map((z) => (
                <label className="ops-check" key={z.id}>
                  <input
                    type="checkbox"
                    checked={zones.includes(z.id)}
                    onChange={() => choose(setZones, zones, z.id)}
                  />
                  {z.label}
                </label>
              ))}
          </details>
          <button className="ops-primary">Create private invitation</button>
        </form>
        {invitation && (
          <div className="ops-notice">
            <p>{invitation.delivery}</p>
            <label>
              One-use link · expires in 24 hours
              <input
                readOnly
                value={invitation.link}
                onFocus={(e) => e.target.select()}
              />
            </label>
            <button
              onClick={() =>
                navigator.clipboard.writeText(invitation.link).catch(() => {})
              }
            >
              Copy private invitation
            </button>
          </div>
        )}
      </section>
      <section className="ops-panel">
        <h2>Staff accounts</h2>
        {rows.map((s) => (
          <article className="ops-staff-row" key={s.id}>
            <strong>{s.email}</strong>
            <p>
              {s.role} · {s.active ? "Active" : "Inactive"}
            </p>
            <div className="ops-actions">
              <button
                onClick={() =>
                  run(async () =>
                    setInvitation(await api("admin/staff/reset", { id: s.id })),
                  )
                }
              >
                Password reset link
              </button>
              {s.role !== "Owner" && (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        (s.active ? "Disable" : "Enable") +
                          " this staff account?",
                      )
                    )
                      run(async () => {
                        await api("admin/staff/" + s.id, {
                          role: s.role,
                          active: !s.active,
                        });
                        await load();
                      });
                  }}
                >
                  {s.active ? "Disable" : "Enable"}
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function GateWorkspace({ config, run }) {
  const [result, setResult] = useState(null);
  const [venue,setVenue]=useState(config.venues.find(v=>v.enabled)?.id||'');
  const [zone,setZone]=useState(config.zones.find(z=>z.enabled)?.id||'');
  return (
    <section className="ops-panel ops-login">
      <h2>Verify a credential</h2>
      <p>
        Scan with a USB QR reader or paste its code. Offline requests do not
        grant entry.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setResult(null);
          run(async () =>
            setResult(await api("admin/scan", Object.fromEntries(f))),
          );
        }}
      >
        <label>
          Venue
          <select name="venue" required value={venue} onChange={e=>{setVenue(e.target.value);setResult(null);}}>
            {config.venues
              .filter((v) => v.enabled)
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
          </select>
        </label>
        <label>
          Checkpoint area
          <select name="zone" required value={zone} onChange={e=>{setZone(e.target.value);setResult(null);}}>
            {config.zones
              .filter((z) => z.enabled)
              .map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label}
                </option>
              ))}
          </select>
        </label>
        {venue==='sharjah'&&['SEC-3','SEC-4'].includes(zone)&&config.sharjahSeating?.approved&&<details><summary>Legacy seating checkpoint</summary><label>Seating checkpoint<select key={venue+zone} name="area" defaultValue=""><option value="">Section access · no seating allocation</option>{(config.sharjahSeating.areas||[]).filter(a=>a.enabled&&a.zone===zone).map(a=><option key={a.id} value={a.id}>{sharjahSeatingAreas.find(x=>x.id===a.id)?.label}</option>)}</select></label></details>}
        <label>
          Credential code
          <input name="token" required autoComplete="off" />
        </label>
        <button className="ops-primary">Check access</button>
      </form>
      {result && (
        <div
          className={result.allowed ? "ops-notice" : "ops-error"}
          role="status"
        >
          <h3>{result.allowed ? "Access permitted" : "Access denied"}</h3>
          <p>{result.reason}</p>
          <p>{result.name}</p>
        </div>
      )}
    </section>
  );
}
