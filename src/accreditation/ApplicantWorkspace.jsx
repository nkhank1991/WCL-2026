import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { statusLabels } from "../../lib/accreditation-model.mjs";
import {accessSections,pmoaEligible} from '../../lib/access-sections.mjs';
import {AccessChoices,TeamAccessRole} from './AccessChoices';
import "./operations.css";
import "./applicant-form.css";

async function api(route, body) {
  const r = await fetch("/api/accreditation/" + route, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  const result = await r.json().catch(() => ({}));
  if (!r.ok)
    throw Error(
      result.error ||
        "The accreditation service could not be reached. Please try again.",
    );
  return result;
}
const encode = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(Error("Could not read the photograph."));
    r.readAsDataURL(file);
  });
const fieldLabels = {
  name: "Full name",
  displayName: "Name on badge",
  email: "Work email",
  mobile: "Mobile with country code",
  organisation: "Organisation or team",
  jobTitle: "Working role",
  assignment: "Assignment",
  category: "Requested category",
  headshot: "Replacement photograph",
};

export function ApplicantWorkspace() {
  const [config, setConfig] = useState(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [receipt, setReceipt] = useState(null),
    [secret, setSecret] = useState(
      () => new URLSearchParams(location.hash.slice(1)).get("receipt") || "",
    ),
    [category, setCategory] = useState(
      () => new URLSearchParams(location.search).get("category") || "",
    ),
    [notice, setNotice] = useState(""),
    [teamRole,setTeamRole] = useState(''),
    [requestedZones,setRequestedZones] = useState([]),
    [photo, setPhoto] = useState(null);
  useEffect(()=>{
    if(!pmoaEligible(category,teamRole))setRequestedZones(z=>z.filter(id=>id!=='SEC-5'));
  },[category,teamRole]);
  const photoRef = useRef(null);
  const link = secret
    ? location.origin + "/accreditation/apply#receipt=" + secret
    : "";
  async function load() {
    setLoading(true);
    setError("");
    try {
      setConfig(await api("config"));
      if (secret) setReceipt(await api("status", { token: secret }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (location.hash)
      history.replaceState(null, "", location.pathname + location.search);
    load();
    return () => {
      if (photoRef.current) URL.revokeObjectURL(photoRef.current);
    };
  }, []);
  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    run(async () => {
      const f = new FormData(form),
        file = f.get("headshot");
      if (!file?.size || file.size > 2 * 1024 * 1024)
        throw Error("Choose a photograph below 2 MB.");
      const result = await api("apply", {
        ...Object.fromEntries(f),
        headshot: await encode(file),
        requestedVenues: f.getAll("requestedVenues"),
        requestedZones: f.getAll("requestedZones"),
        consent: f.get("consent") === "on",
        consentVersion: config.consentVersion,
      });
      setSecret(result.token);
      setReceipt(result);
      setNotice('Application received. Save your application number and private status link.');
      form.reset();
      setPhoto(null);
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }
  return (
    <div className="ops-shell applicant-simple">
      <header className="ops-topbar">
        <Link to="/" aria-label="WCL homepage">
          <img src="/assets/wcl-official-logo.png" alt="WCL" />
        </Link>
        <span>
          Accreditation<span>Season 3 · 2026</span>
        </span>
        <Link to="/accreditation/review">Staff sign-in</Link>
      </header>
      <main>
        <div className="ops-page-heading">
          <div>
            <p>WCL / ACCREDITATION</p>
            <h1>{receipt ? "Your application" : "Apply for accreditation"}</h1>
          </div>
        </div>
        <p className="ops-lead">
          Your details, your photograph, one application. WCL reviews each
          request before granting access.
        </p>
        {error && (
          <div className="ops-error" role="alert">
            {error}
            {!config && <button onClick={load}>Try again</button>}
          </div>
        )}
        {notice && (
          <p className="ops-notice" role="status">
            {notice}
          </p>
        )}
        {loading ? (
          <p role="status">Checking application availability…</p>
        ) : receipt ? (
          <section className="ops-panel application-receipt">
            <span className={"ops-status " + receipt.status}>
              {statusLabels[receipt.status] || receipt.status}
            </span>
            <h2>{receipt.reference}</h2>
            <p>
              Save your private status link to follow the review and respond to
              corrections. This receipt is not an entry pass.
            </p>
            <div className="ops-actions">
              <button
                className="ops-primary"
                onClick={() =>
                  navigator.clipboard
                    .writeText(link)
                    .then(() => setNotice("Private status link copied."))
                    .catch(() =>
                      setNotice("Select and copy your private link below."),
                    )
                }
              >
                Copy private status link
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  run(async () =>
                    setReceipt(await api("status", { token: secret })),
                  )
                }
              >
                Refresh status
              </button>
            </div>
            <label>
              Private status link
              <input readOnly value={link} onFocus={(e) => e.target.select()} />
            </label>
            <p className="ops-caption">
              Automatic email notifications are not connected. Keep this link
              private; it is needed to return to your application.
            </p>
            {receipt.correction && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  run(async () => {
                    const fields = {};
                    for (const key of receipt.correction.fields) {
                      fields[key] =
                        key === "headshot"
                          ? await encode(f.get(key))
                          : f.get(key);
                    }
                    setReceipt(
                      await api("correct", {
                        token: secret,
                        version: receipt.version,
                        fields,
                      }),
                    );
                    setNotice(
                      "Corrections submitted. Your application is back with the reviewer.",
                    );
                  });
                }}
              >
                <fieldset disabled={busy}>
                  <h3>Correction requested</h3>
                  <p>{receipt.correction.message}</p>
                  {receipt.correction.fields.map((key) => (
                    <label key={key}>
                      {fieldLabels[key]}
                      {key === "headshot" ? (
                        <input
                          type="file"
                          name={key}
                          accept="image/jpeg,image/png,image/webp"
                          required
                        />
                      ) : key === "category" ? (
                        <select
                          name={key}
                          defaultValue={receipt.correction.values[key]}
                        >
                          {config?.categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          name={key}
                          type={key === "email" ? "email" : "text"}
                          required
                          defaultValue={receipt.correction.values[key]}
                          maxLength={key === "assignment" ? 1000 : 200}
                        />
                      )}
                    </label>
                  ))}
                  <button className="ops-primary">Submit corrections</button>
                </fieldset>
              </form>
            )}
          </section>
        ) : (
          <>
            {!config?.enabled && (
              <div className="ops-notice">
                <strong>Applications are not open yet</strong>
                <p>
                  You can see what is needed below. Personal details and uploads
                  are disabled until setup and WCL approvals are complete.
                </p>
              </div>
            )}
            <form onSubmit={submit} className="application-form">
              <fieldset disabled={!config?.enabled || busy}>
                <section className="ops-panel">
                  <div className="application-section-title">
                    <span>01</span>
                    <h2>Your details</h2>
                  </div>
                  <div className="ops-two">
                    <label>
                      Full name
                      <input
                        name="name"
                        required
                        maxLength={200}
                        autoComplete="name"
                      />
                    </label>
                    <label>
                      Name on badge
                      <input
                        name="displayName"
                        maxLength={200}
                        placeholder="Leave blank to use your full name"
                      />
                    </label>
                    <label>
                      Work email
                      <input
                        name="email"
                        type="email"
                        required
                        maxLength={200}
                        autoComplete="email"
                      />
                    </label>
                    <label>
                      Mobile with country code
                      <input
                        name="mobile"
                        type="tel"
                        required
                        maxLength={24}
                        placeholder="+971…"
                        autoComplete="tel"
                      />
                    </label>
                  </div>
                </section>
                <section className="ops-panel">
                  <div className="application-section-title">
                    <span>02</span>
                    <h2>Your assignment</h2>
                  </div>
                  <div className="ops-two">
                    <label>
                      Organisation or team
                      <input
                        name="organisation"
                        required
                        maxLength={200}
                        autoComplete="organization"
                      />
                    </label>
                    <label>
                      Working role
                      <input
                        name="jobTitle"
                        required
                        maxLength={200}
                        autoComplete="organization-title"
                      />
                    </label>
                  </div>
                  <label>
                    Requested category
                    <select
                      name="category"
                      required
                      value={category}
                      onChange={(e) => {setCategory(e.target.value);setTeamRole('');}}
                    >
                      <option value="">Choose your category</option>
                      {config?.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TeamAccessRole category={category} value={teamRole} onChange={setTeamRole}/>
                  {category && (
                    <p className="ops-caption">
                      Reviewed by{" "}
                      {config?.categories.find((c) => c.id === category)
                        ?.department || "the assigned department"}
                      .
                    </p>
                  )}
                  <label>
                    Assignment / purpose of attendance
                    <textarea
                      name="assignment"
                      required
                      minLength={8}
                      maxLength={1000}
                      rows={3}
                    />
                  </label>
                  <AccessChoices zones={config?.zones?.length?config.zones:accessSections}
                    selected={requestedZones} onChange={setRequestedZones} name="requestedZones"
                    category={category} teamRole={teamRole}/>
                  <p className="ops-caption">
                    Requested access is subject to approval.
                  </p>
                </section>
                <section className="ops-panel">
                  <div className="application-section-title">
                    <span>03</span>
                    <h2>Your photograph</h2>
                  </div>
                  <div className="application-photo">
                    <div>
                      <label>
                        Recent headshot
                        <input
                          type="file"
                          name="headshot"
                          required
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            if (photoRef.current)
                              URL.revokeObjectURL(photoRef.current);
                            const file = e.target.files[0];
                            if(file&&(file.size>2*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))){
                              setError('Choose a JPEG, PNG or WebP photograph below 2 MB.');
                              e.target.value='';photoRef.current=null;setPhoto(null);return;
                            }
                            setError('');
                            photoRef.current = file
                              ? URL.createObjectURL(file)
                              : null;
                            setPhoto(photoRef.current);
                          }}
                        />
                      </label>
                      <p>
                        One person, face visible, no sunglasses or filters.
                        JPEG, PNG or WebP, up to 2 MB. Do not upload a passport
                        or identity-document copy.
                      </p>
                    </div>
                    {photo && (
                      <figure>
                        <img
                          src={photo}
                          alt="Photograph selected for your application"
                        />
                        <figcaption>
                          Full photograph submitted; no automatic face editing.
                        </figcaption>
                      </figure>
                    )}
                  </div>
                </section>
                <section className="ops-panel">
                  <label className="application-honeypot" aria-hidden="true">
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                  <label className="ops-check">
                    <input type="checkbox" name="consent" required />
                    <span>
                      I confirm these details are accurate and acknowledge the{" "}
                      {config?.privacyNoticeUrl ? (
                        <a
                          href={config.privacyNoticeUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          accreditation privacy notice
                        </a>
                      ) : (
                        "privacy notice (awaiting approval)"
                      )}
                      .
                    </span>
                  </label>
                  <button className="ops-primary application-submit">
                    {busy ? "Submitting…" : "Submit"}
                  </button>
                  <p className="ops-caption">
                    Submission does not grant event access. Save the private
                    receipt link shown after submission.
                  </p>
                </section>
              </fieldset>
            </form>
          </>
        )}
      </main>
      <footer className="ops-footer">
        <span>WCL accreditation</span>
        {config?.contactEmail ? (
          <a href={"mailto:" + config.contactEmail}>Get help</a>
        ) : (
          <Link to="/">Return to WCL</Link>
        )}
      </footer>
    </div>
  );
}
