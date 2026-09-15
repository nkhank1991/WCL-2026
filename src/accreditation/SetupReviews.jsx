import {useEffect,useState} from 'react';
import {uaeDate} from './operations-api';
import {sharjahSeatingAreas} from '../../lib/accreditation-venues.mjs';
import './setup-reviews.css';

export function ApprovalRecord({record}){
  if(!record)return null;
  return <div className="setup-record"><strong>{record.approvedBy.name}</strong><span>{record.approvedBy.role} · {uaeDate(record.approvedAt)}</span><span>{record.reference} · record version {record.version}</span></div>;
}
function PolicyContents({documents}){return Object.values(documents).map(d=><details key={d.documentId}><summary>{d.title} · {d.documentId}</summary><p>{d.intro}</p>{d.sections.map(s=><section key={s.id}><h4>{s.title}</h4>{s.paragraphs.map((p,i)=><p key={i}>{p}</p>)}{s.rows?.map(([label,detail])=><p key={label}><strong>{label}</strong> — {detail}</p>)}</section>)}</details>);}
const titles={privacy:'Review and approve privacy policy',access:'Review and approve venue/access plan',provider:'Review ID-hosting evidence'};
const actions={privacy:'Approve privacy policy',access:'Approve access plan',provider:'Approve documented provider route'};
export function SetupReviews({api,config,dirty,onApproved,change}){
  const [data,setData]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(''),[name,setName]=useState(''),[checks,setChecks]=useState({});
  async function load(){try{setError('');const r=await api('admin/setup-reviews');setData(r);setName(r.reviewer.name);setChecks({});}catch(e){setError(e.message);}}
  useEffect(()=>{if(!dirty)load();},[dirty]);
  const tick=(kind,key,value)=>setChecks(c=>({...c,[kind]:{...c[kind],[key]:value}}));
  async function approve(item){
    setBusy(item.kind);setError('');setNotice('');
    try{const r=await api('admin/setup-reviews',{action:'approve',kind:item.kind,fingerprint:item.fingerprint,displayName:name,...checks[item.kind]});setNotice('Approval recorded: '+r.approval.reference);await onApproved();await load();}
    catch(e){setError(e.message);}finally{setBusy('');}
  }
  return <section className="setup-reviews" aria-label="Setup approvals"><header><h2>Review & approve</h2><p>Apply → Review → Print → Issue. Setup decisions are recorded here once, by an authorised person.</p></header>
    {error&&<p role="alert">{error} <button type="button" onClick={load}>Reload reviews</button></p>}{notice&&<p role="status">{notice}</p>}
    {!data&&!error&&<p role="status">Loading current documents and approvals…</p>}
    {dirty&&<p className="setup-warning">Save your settings before reviewing or approving the updated version.</p>}
    {data&&!data.reviewer.name&&<label>Your name for approval records<input value={name} onChange={e=>setName(e.target.value)} maxLength={150} autoComplete="name"/><small>Your signed-in account and role are recorded automatically.</small></label>}
    {data?.policyAdoption&&<p>Existing policy adoption retained: {data.policyAdoption.reference}. Operational approvals remain separate.</p>}
    {data?.items.map(item=><details className="setup-review-card" key={item.kind}><summary><span>{titles[item.kind]}</span><small>{item.status}</small></summary>
      <div className="setup-review-layout"><div className="setup-review-source">
        {item.kind==='privacy'&&<><PolicyContents documents={item.snapshot.documents}/><h4>Settings included in this decision</h4><p>Support/privacy contact: <strong>{item.snapshot.contactEmail||'Not set'}</strong></p><p>Consent version: {item.snapshot.consentVersion||'Not set'}</p><p>{item.snapshot.retention||'Save the retention policy before approval.'}</p></>}
        {item.kind==='access'&&<><h4>Requestable sections</h4>{item.snapshot.zones.filter(z=>z.enabled).map(z=><p key={z.id}><strong>{z.code||z.id}</strong> · {z.label}</p>)}<h4>Optional venue limits</h4>{item.snapshot.venues.some(v=>v.enabled)?item.snapshot.venues.filter(v=>v.enabled).map(v=><p key={v.id}>{v.label}</p>):<p>Section-only approval. No separate venue mapping is required.</p>}<p>Event validity: {uaeDate(item.snapshot.event.from)} – {uaeDate(item.snapshot.event.to)}</p>{item.snapshot.operationalAccess.enabled&&<p>Separate operational window: {uaeDate(item.snapshot.operationalAccess.from)} – {uaeDate(item.snapshot.operationalAccess.to)}</p>}<p>PMOA still needs verified duties and explicit clearance for each applicant. This plan does not grant anyone access.</p></>}
        {item.kind==='provider'&&<><h4>Existing ID-processing route</h4><dl>{item.snapshot.route.stages.map(([title,detail])=><div key={title}><dt>{title}</dt><dd>{detail}</dd></div>)}</dl><p>{item.snapshot.route.nextAction}</p><p>Public terms are research sources, not evidence of WCL’s account agreement or a permission exception.</p>{item.snapshot.route.sources.map(([title,url])=><p key={url}><a href={url} target="_blank" rel="noreferrer">{title} ↗</a></p>)}<p>{data.identityConnectionReady?'Runtime provider checks are configured.':'Runtime provider checks are still incomplete. This review cannot turn them on.'}</p></>}
        {item.kind==='access'&&<details><summary>Departments and optional seating in this version</summary>{item.snapshot.departments.filter(d=>d.enabled).map(d=><p key={d.id}><strong>{d.label}</strong>{d.roles?.length?' · '+d.roles.join(', '):''}</p>)}{item.snapshot.seating.filter(a=>a.enabled).map(a=><p key={a.id}>{sharjahSeatingAreas.find(s=>s.id===a.id)?.label||a.id} · {a.zone}</p>)}</details>}
        {item.kind==='provider'&&<details open><summary>Account evidence included in this review</summary>{item.snapshot.evidence.length?item.snapshot.evidence.map(e=><section key={e.provider}><h4>{e.provider}</h4><p>{e.account} · {e.documentTitle} · {e.version}</p>{/^https:\/\//.test(e.url||'')&&<a href={e.url} target="_blank" rel="noreferrer">Open supporting agreement or confirmation ↗</a>}<p>{e.scope}</p></section>):<p>No account agreement or provider confirmation is recorded. Add the supporting provider records below; this item remains pending.</p>}</details>}
      </div><div className="setup-review-decision"><ApprovalRecord record={item.approval}/>{item.legacyReference&&<p>Existing record: {item.legacyReference}. Preserved without creating a new approval.</p>}
        <label className="access-check"><input type="checkbox" checked={!!checks[item.kind]?.reviewed} onChange={e=>tick(item.kind,'reviewed',e.target.checked)}/>I reviewed this exact version.</label>
        <label className="access-check"><input type="checkbox" checked={!!checks[item.kind]?.authorised} onChange={e=>tick(item.kind,'authorised',e.target.checked)}/>I am authorised to approve this item for WCL.</label>
        {item.kind==='privacy'&&<label className="access-check"><input type="checkbox" checked={!!checks.privacy?.contactConfirmed} onChange={e=>tick('privacy','contactConfirmed',e.target.checked)}/>The displayed privacy/support contact is monitored.</label>}
        {item.kind==='provider'&&<>{[['accountAgreementChecked','The recorded agreements apply to these company accounts.'],['completeRouteChecked','I checked the permitted data scope across upload, viewing, storage, logs, backup and deletion.']].map(([key,label])=><label className="access-check" key={key}><input type="checkbox" checked={!!checks.provider?.[key]} onChange={e=>tick('provider',key,e.target.checked)}/>{label}</label>)}</>}
        <button type="button" className="admin-primary" disabled={dirty||!!busy||item.status==='Approved'||!name||!checks[item.kind]?.reviewed||!checks[item.kind]?.authorised} onClick={()=>approve(item)}>{busy===item.kind?'Recording…':actions[item.kind]}</button>
        <p>Records your name, account role, time, document version and generated reference. Material changes require another review.</p>
      </div></div>
    </details>)}
    <section className="setup-review-card"><h3>Review and approve physical badge proof</h3><p>Upload your own front and back in Badge designs. Preview the exact PDF, print it at actual size and record the physical and QR tests for that category.</p><a href="/accreditation/owner?workspace=Badge%20designs">Open badge designs →</a></section>
    <details className="setup-review-card"><summary>Supporting provider records</summary><p>Keep pending if an applicable account contract or written confirmation is missing. Do not upload applicant IDs here.</p>{['Google Workspace','Render','Vercel'].map(provider=>{
      const evidence=(config.providerEvidence||[]).find(e=>e.provider===provider)||{provider};
      const update=patch=>change({providerEvidence:[...(config.providerEvidence||[]).filter(e=>e.provider!==provider),{...evidence,...patch}]});
      return <fieldset key={provider}><legend>{provider}</legend>{[['account','Company account / tenant'],['documentTitle','Accepted contract or provider confirmation'],['version','Contract version / date'],['url','Private agreement or confirmation link']].map(([key,label])=><label key={key}>{label}<input type={key==='url'?'url':'text'} value={evidence[key]||''} onChange={e=>update({[key]:e.target.value})} maxLength={1000}/></label>)}<label>Permitted data and relevant clause / confirmation<textarea value={evidence.scope||''} onChange={e=>update({scope:e.target.value})} maxLength={4000}/></label><label className="access-check"><input type="checkbox" checked={evidence.applicable===true} onChange={e=>update({applicable:e.target.checked})}/>Evidence checked against this company account and its actual processing role.</label></fieldset>;
    })}</details>
    {!!data?.history.length&&<details className="setup-review-card"><summary>Approval history · {data.history.length} records</summary>{data.history.map(r=><section key={r.reference}><h4>{r.kind} · {r.scope}</h4><ApprovalRecord record={r}/></section>)}</details>}
  </section>;
}
