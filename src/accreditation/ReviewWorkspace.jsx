import { useEffect, useState } from "react";
import {AccessChoices,TeamAccessRole} from './AccessChoices';
import {OwnerDecision} from './OwnerDecision';
import {pmoaEligible} from '../../lib/access-sections.mjs';
import {seatingLabels,seatingError} from '../../lib/accreditation-venues.mjs';
import {
  statusLabels,
  correctionFields,
  restrictedZones,
} from "../../lib/accreditation-model.mjs";
import {
  operationsApi as api,
  toUaeInput,
  fromUaeInput,
  uaeDate,
} from "./operations-api";

export function ReviewWorkspace({ user, config, run, onPreview }) {
  const [rows, setRows] = useState(null),
    [selected, setSelected] = useState(null),
    [department, setDepartment] = useState(""),
    [status, setStatus] = useState(""),
    [query, setQuery] = useState("");
  const load = async () => {
    const { items } = await api("admin/accreditations");
    setRows(items);
    return items;
  };
  useEffect(() => {
    run(load);
  }, []);
  const update = async (id, body) => {
    const r = await api("admin/accreditations/" + id, body);
    if (r instanceof Blob) {
      onPreview(r, "Draft · not valid for entry");
      return;
    }
    setSelected(r);
    await load();
    return r;
  };
  const shown = (rows || []).filter(
    (r) =>
      (!department || r.department === department) &&
      (!status || r.status === status) &&
      [r.name, r.organisation, r.source.reference]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (selected)
    return (
      <CaseDetail
        key={selected.id + ":" + selected.version}
        record={selected}
        user={user}
        config={config}
        run={run}
        update={update}
        onPreview={onPreview}
        onBack={() => setSelected(null)}
      />
    );
  return (
    <>
      <div className="ops-toolbar">
        <label>
          Department
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">My departments</option>
            {config.departments
              .filter((d) => rows?.some((r) => r.department === d.id))
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All applications</option>
            {Object.entries(statusLabels).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="ops-search">
          Find an application
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, company or reference"
          />
        </label>
        <button onClick={() => run(load)}>Refresh</button>
      </div>
      <section className="ops-panel">
        <div className="ops-section-heading">
          <h2>
            {rows === null ? "Applications" : shown.length + " applications"}
          </h2>
          <span>Department workspace</span>
        </div>
        {rows === null ? (
          <p role="status">Loading your queue…</p>
        ) : !shown.length ? (
          <div className="ops-empty">
            <h3>No applications here yet</h3>
            <p>
              Submitted applications appear in their assigned department. Try a
              different filter or refresh.
            </p>
          </div>
        ) : (
          <div className="ops-list">
            {shown.map((r) => (
              <button key={r.id} onClick={() => setSelected(r)}>
                <span>
                  <strong>{r.name}</strong>
                  <small>
                    {r.organisation} ·{" "}
                    {config.categories.find((c) => c.id === r.category)?.label}
                  </small>
                </span>
                <span className={"ops-status " + r.status}>
                  {statusLabels[r.status] || r.status}
                </span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function CaseDetail({ record: r, user, config, run, update, onBack, onPreview }) {
  const p = r.proposal || {},
    [zones, setZones] = useState(p.zones || r.requested.requestedZones || []),
    [venues, setVenues] = useState(
      p.venues || r.requested.requestedVenues || [],
    ),
    [correction, setCorrection] = useState(false),
    [category,setCategory] = useState(p.category || r.category),
    [teamRole,setTeamRole] = useState(p.teamRole || r.requested.teamRole || ''),
    [conditions,setConditions] = useState(p.conditions || ''),
    [pmoaChecked,setPmoaChecked] = useState(p.pmoaEligibilityChecked === true),
    [fields, setFields] = useState([]);
  useEffect(()=>{
    if(!pmoaEligible(category,teamRole))setZones(z=>z.filter(id=>id!=='SEC-5'));
  },[category,teamRole]);
  const role = user.role,
    canReview =
      role === "Reviewer" &&
      ["review", "resubmitted", "approval"].includes(r.status),
    canApprove = role === "Approver" && r.status === "approval";
  const change = (setter, values, id) =>
    setter(
      values.includes(id) ? values.filter((v) => v !== id) : [...values, id],
    );
  const act = (action, extra = {}) =>
    run(() => update(r.id, { action, version: r.version, ...extra }));
  const same=(a=[],b=[])=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
  const accessChanged=!same(zones,p.zones)||!same(venues,p.venues)||teamRole!==(p.teamRole||'')||conditions!==(p.conditions||'')||pmoaChecked!==(p.pmoaEligibilityChecked===true);
  const accessProblem=!zones.length||(zones.includes('SEC-5')&&!pmoaChecked);
  const legacyProblem=p.category&&p.accessMode!=='sections'?seatingError(config,p):'';
  const chooseZones=next=>{setZones(next);setPmoaChecked(false);};
  const chooseRole=next=>{setTeamRole(next);setPmoaChecked(false);};
  const pmoaCheck=zones.includes('SEC-5')&&<label className="ops-check"><input type="checkbox" required checked={pmoaChecked} onChange={e=>setPmoaChecked(e.target.checked)}/>PMOA eligibility verified against the assigned duties</label>;
  return (
    <>
      <button className="ops-back" onClick={onBack}>
        ← Back to applications
      </button>
      <div className="ops-case-heading">
        <div>
          <p>
            {config.departments.find((d) => d.id === r.department)?.label} /{" "}
            {r.source.reference}
          </p>
          <h2>{r.name}</h2>
        </div>
        <span className={"ops-status " + r.status}>
          {statusLabels[r.status]}
        </span>
      </div>
      <div className="ops-case-grid">
        <section className="ops-panel ops-identity">
          <img
            src={"/api/operations/admin/media/" + r.photo_id}
            alt={"Submitted photograph of " + r.name}
          />
          <h3>{r.requested.displayName || r.name}</h3>
          <p>
            {r.organisation}
            <br />
            {r.job_title}
          </p>
          <dl>
            <dt>Requested category</dt>
            <dd>
              {
                config.categories.find(
                  (c) => c.id === r.requested.requestedCategory,
                )?.label
              }
            </dd>
            <dt>Assignment</dt>
            <dd>{r.requested.assignment}</dd>
            <dt>Requested access</dt>
            <dd>
              {config.zones
                .filter((z) => r.requested.requestedZones?.includes(z.id))
                .map((z) => z.label)
                .join(", ")}
            </dd>
            {r.requested.requestedVenues?.length>0&&<><dt>Requested venues</dt>
            <dd>
              {config.venues
                .filter((v) => r.requested.requestedVenues?.includes(v.id))
                .map((v) => v.label)
                .join(", ")}
            </dd></>}
          </dl>
        </section>
        <section className="ops-panel">
          {role!=='Owner'&&<h3>
            {canReview
              ? "Review application"
              : canApprove
                ? "Approval decision"
                : "Application details"}
          </h3>}
          {role==='Owner'&&<OwnerDecision record={r} config={config} act={act} run={run} onPreview={onPreview}/>}
          {role!=='Owner'&&p.category && (
            <div className="ops-proposal">
              <strong>{canApprove?'Badge details':'Proposed access'}</strong>
              <p>
                {config.categories.find((c) => c.id === p.category)?.label}
                {!canApprove&&' · '}
                {!canApprove&&p.zones
                  .map((z) => config.zones.find((x) => x.id === z)?.label)
                  .join(", ")}
              </p>
              <p>
                {!canApprove&&p.venues
                  .map((v) => config.venues.find((x) => x.id === v)?.label)
                  .join(", ")}
                {!canApprove&&<br />}
                {uaeDate(p.validFrom)} — {uaeDate(p.validTo)}
              </p>
              {!canApprove&&<p>{p.conditions}</p>}
              {p.seatingAreas?.length>0&&<p>Permitted areas: {seatingLabels(p.seatingAreas).join(' · ')}</p>}
              <p>{p.validityType==='operational'?'Operational access':'Tournament access'}</p>
              {p.zones.some((z) => restrictedZones.includes(z)) && (
                <p className="ops-status">
                  Restricted decision:{" "}
                  {r.restricted?.decision ||
                    "Pending assigned restricted approver"}
                </p>
              )}
            </div>
          )}
          {canReview && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                act("recommend", {
                  category: f.get("category"),
                  zones,
                  venues,
                  teamRole,
                  pmoaEligibilityChecked:pmoaChecked,
                  validityType: f.get('validityType'),
                  validFrom: fromUaeInput(f.get("validFrom")),
                  validTo: fromUaeInput(f.get("validTo")),
                  conditions: f.get("conditions"),
                  notes: f.get("notes"),
                  identityChecked: f.get("identity") === "on",
                  accessReviewed: f.get("access") === "on",
                });
              }}
            >
              <label>
                Recommended category
                <select name="category" value={category} onChange={e=>{setCategory(e.target.value);chooseRole('');}}>
                  {config.categories
                    .filter((c) =>
                      config.departments
                        .find((d) => d.id === r.department)
                        ?.categories.includes(c.id),
                    )
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                </select>
              </label>
              <TeamAccessRole category={category} value={teamRole} onChange={chooseRole}/>
              <AccessChoices legend="Proposed access areas" zones={config.zones.filter(z=>z.enabled)} selected={zones} onChange={chooseZones} category={category} teamRole={teamRole}/>
              {pmoaCheck}
              <fieldset className="ops-choices">
                <legend>Optional venue limits</legend>
                {config.venues
                  .filter((v) => v.enabled)
                  .map((v) => (
                    <label key={v.id}>
                      <input
                        type="checkbox"
                        checked={venues.includes(v.id)}
                        onChange={() => change(setVenues, venues, v.id)}
                      />
                      {v.label}
                    </label>
                  ))}
              </fieldset>
              <label>Validity period<select name="validityType" defaultValue={p.validityType||'tournament'}><option value="tournament">Tournament · 3–18 October 2026</option><option value="operational" disabled={!config.operationalAccess?.enabled}>Separately approved operational dates</option></select></label>
              <div className="ops-two">
                <label>
                  Valid from · UAE
                  <input
                    name="validFrom"
                    type="datetime-local"
                    required
                    defaultValue={toUaeInput(p.validFrom || config.event.from)}
                  />
                </label>
                <label>
                  Valid until · UAE
                  <input
                    name="validTo"
                    type="datetime-local"
                    required
                    defaultValue={toUaeInput(p.validTo || config.event.to)}
                  />
                </label>
              </div>
              <label>
                Access conditions
                <textarea
                  name="conditions"
                  maxLength={500}
                  rows={3}
                  value={conditions}
                  onChange={e=>setConditions(e.target.value)}
                  placeholder="Assigned area, shift, escort or device conditions"
                />
              </label>
              <label>
                Internal review notes
                <textarea
                  name="notes"
                  maxLength={500}
                  rows={2}
                  defaultValue={p.notes}
                />
              </label>
              <label className="ops-check">
                <input type="checkbox" name="identity" required />
                Identity, organisation and photograph checked
              </label>
              <label className="ops-check">
                <input type="checkbox" name="access" required />
                Proposed access matches the assignment
              </label>
              <button className="ops-primary">Send for Approval</button>
            </form>
          )}
          {canApprove && (
            <>
              {p.accessMode==='sections'&&<form className="ops-access-review" onSubmit={e=>{e.preventDefault();act('access',{zones,venues,teamRole,conditions,pmoaEligibilityChecked:pmoaChecked});}}>
                <TeamAccessRole category={category} value={teamRole} onChange={chooseRole}/>
                <AccessChoices legend="Select access" zones={config.zones.filter(z=>z.enabled)} selected={zones} onChange={chooseZones} category={category} teamRole={teamRole}/>
                {config.venues.some(v=>v.enabled)&&<fieldset className="ops-choices"><legend>Optional venue limits</legend>{config.venues.filter(v=>v.enabled).map(v=><label key={v.id}><input type="checkbox" checked={venues.includes(v.id)} onChange={()=>{change(setVenues,venues,v.id);setPmoaChecked(false);}}/>{v.label}</label>)}</fieldset>}
                <label>Access conditions<textarea name="conditions" rows={2} maxLength={500} value={conditions} onChange={e=>setConditions(e.target.value)}/></label>
                {pmoaCheck}
                <button disabled={!accessChanged||accessProblem}>Save access</button>
                {accessChanged&&<p className="ops-caption" role="status">Save your changes before previewing or approving. Restricted access needs a fresh independent decision.</p>}
              </form>}
              {legacyProblem&&<p className="ops-error" role="status">Return this application for a fresh review to use section selection.</p>}
              <button disabled={accessChanged||!!legacyProblem} onClick={() => act("preview")}>
                Preview front & back
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  act("approve", { confirmed: true });
                }}
              >
                <label className="ops-check">
                  <input type="checkbox" required />I have checked the details,
                  proposed access and badge preview.
                </label>
                <button className="ops-primary" disabled={accessChanged||!!legacyProblem}>Approve</button>
              </form>
            </>
          )}
          {role === "Restricted Approver" && r.status === "approval" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                act("restricted", {
                  decision: f.get("decision"),
                  reason: f.get("reason"),
                });
              }}
            >
              <label>
                Restricted-access decision
                <select name="decision">
                  <option value="approve">Approve restricted access</option>
                  <option value="reject">Reject restricted access</option>
                </select>
              </label>
              <label>
                Decision reason
                <textarea
                  name="reason"
                  minLength={8}
                  maxLength={500}
                  required
                />
              </label>
              <button className="ops-primary">Save restricted decision</button>
            </form>
          )}
          {["Owner", "Reviewer", "Approver"].includes(role) &&
            [
              "review",
              "resubmitted",
              "approval",
              "approved",
              "printed",
            ].includes(r.status) && (
              <div className="ops-actions">
                <button onClick={() => setCorrection(!correction)}>
                  Request Correction
                </button>
                {["Owner","Approver"].includes(role) && ["review","resubmitted","approval"].includes(r.status) && (
                  <button
                    className="ops-danger"
                    onClick={() => {
                      const reason = prompt(
                        "Reason for rejection (recorded in the audit):",
                      );
                      if (reason) act("reject", { reason });
                    }}
                  >
                    Reject
                  </button>
                )}
                {["Owner","Approver"].includes(role) &&
                  ["approved", "printed"].includes(r.status) && (
                    <button
                      className="ops-danger"
                      onClick={() => {
                        const reason = prompt(
                          "Reason for revoking this credential:",
                        );
                        if (reason) act("revoke", { reason });
                      }}
                    >
                      Revoke
                    </button>
                  )}
              </div>
            )}
          {correction && (
            <form
              className="ops-correction"
              onSubmit={(e) => {
                e.preventDefault();
                act("correction", {
                  fields,
                  message: new FormData(e.currentTarget).get("message"),
                });
              }}
            >
              <fieldset className="ops-choices">
                <legend>What needs correcting?</legend>
                {correctionFields.map((f) => (
                  <label key={f}>
                    <input
                      type="checkbox"
                      checked={fields.includes(f)}
                      onChange={() => change(setFields, fields, f)}
                    />
                    {f.replace(/([A-Z])/g, " $1")}
                  </label>
                ))}
              </fieldset>
              <label>
                Message for the applicant
                <textarea
                  name="message"
                  required
                  minLength={8}
                  maxLength={1500}
                />
              </label>
              <button className="ops-primary" disabled={!fields.length}>
                Send correction request
              </button>
              <p>
                The applicant sees this message through their private status
                link. Automatic email is not connected.
              </p>
            </form>
          )}
          {r.correction && (
            <div className="ops-notice">
              <strong>Correction requested</strong>
              <p>{r.correction.message}</p>
            </div>
          )}
          {role === "Issuance Officer" && r.status === "printed" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                act("collect", { identityChecked: true });
              }}
            >
              <label className="ops-check">
                <input type="checkbox" required />
                Recipient identity verified and the printed card handed over
              </label>
              <button className="ops-primary">
                Confirm handover & activate
              </button>
            </form>
          )}
          {!canReview &&
            !canApprove &&
            !["Owner","Restricted Approver", "Issuance Officer"].includes(role) && (
              <p>
                Details are locked at this stage. Use the assigned role to take
                the next action.
              </p>
            )}
        </section>
      </div>
    </>
  );
}
