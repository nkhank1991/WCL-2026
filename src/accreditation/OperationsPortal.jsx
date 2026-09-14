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
const PdfPreview = lazy(() => import("./PdfPreview"));
const workspaceNames = {
  Reviewer: "Applications",
  Approver: "Approvals",
  "Restricted Approver": "Restricted approvals",
  "Print Operator": "Print queue",
  "Issuance Officer": "Collection",
  "Gate Operator": "Gate check",
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
  useEffect(() => {
    if (location.hash) history.replaceState(null, "", location.pathname);
    api("auth/session")
      .then((r) => setUser(r.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (user) {
      setTab(workspaceNames[user.role] || "Setup");
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
            ].includes(tab) && (
              <ReviewWorkspace
                key={tab}
                user={user}
                config={config}
                run={run}
                onPreview={(blob, title) => setPreview({ blob, title })}
              />
            )}
            {tab === "Print queue" && (
              <PrintWorkspace
                config={config}
                run={run}
                onPreview={(blob, title) => setPreview({ blob, title })}
              />
            )}
            {tab === "Badge designs" && (
              <DesignWorkspace
                run={run}
                onPreview={(blob, title) => setPreview({ blob, title })}
              />
            )}
            {tab === "Setup" && (
              <>
                <section className="ops-panel ops-readiness">
                  <h2>Activation checks</h2>
                  <p>
                    Applications stay closed while any required check is
                    outstanding.
                  </p>
                  {setup?.checks.map((c) => (
                    <div key={c.id}>
                      <span>{c.label}</span>
                      <strong className={c.ok ? "is-verified" : ""}>
                        {c.ok ? "Verified" : "Incomplete"}
                      </strong>
                    </div>
                  ))}
                  <button onClick={() => run(refresh)}>Recheck setup</button>
                </section>
                <AccessSettings api={api} onDirtyChange={setDirty} />
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
          <select name="venue" required>
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
          <select name="zone" required>
            {config.zones
              .filter((z) => z.enabled)
              .map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label}
                </option>
              ))}
          </select>
        </label>
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
