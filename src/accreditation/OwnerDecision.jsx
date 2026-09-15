import {useState} from 'react';
import {AccessChoices,TeamAccessRole} from './AccessChoices';
import {restrictedZones} from '../../lib/accreditation-model.mjs';
import {originalIdAtCollection as isNoCopyWorkflow} from '../../lib/application-form.mjs';
import {pmoaEligible} from '../../lib/access-sections.mjs';
import {toUaeInput,fromUaeInput,uaeDate,operationsApi as api} from './operations-api';

export function OwnerDecision({record:r,config,act,run,onPreview,viewSessions=[]}) {
  const p=r.proposal||{},noCopy=isNoCopyWorkflow(r.requested);
  const [category,setCategory]=useState(p.category||r.category);
  const [teamRole,setTeamRole]=useState(p.teamRole||r.requested.teamRole||'');
  const [zones,setZones]=useState((p.zones||r.requested.requestedZones||[]).filter(z=>config.zones.some(x=>x.id===z&&x.enabled)));
  const [identity,setIdentity]=useState(false),[access,setAccess]=useState(false);
  const [originalIdAtCollection,setOriginalIdAtCollection]=useState(false);
  const [documentsChecked,setDocumentsChecked]=useState(false),[approvedDays,setApprovedDays]=useState(p.approvedDays||r.requested.requestedDays||[]);
  const [pmoa,setPmoa]=useState(false),[restricted,setRestricted]=useState(false);
  const [conditions,setConditions]=useState(p.conditions||'');
  const [from,setFrom]=useState(toUaeInput(p.validFrom||config.event.from));
  const [to,setTo]=useState(toUaeInput(p.validTo||config.event.to));
  const pending=['review','resubmitted','approval'].includes(r.status);
  const chooseRole=next=>{setTeamRole(next);setPmoa(false);setRestricted(false);if(!pmoaEligible(category,next))setZones(z=>z.filter(x=>x!=='SEC-5'));};
  const chooseZones=next=>{setZones(next);setPmoa(false);setRestricted(false);};
  const needsRestricted=zones.some(z=>restrictedZones.includes(z));
  const idVerified=r.identity?.status==='verified';
  const idReady=!r.requested.documents?.some(d=>d.external)||idVerified||viewSessions.length===(r.requested.documents||[]).length;
  const valid=idReady&&zones.length&&identity&&access&&(r.requested.formVersion!==2||((noCopy||documentsChecked)&&approvedDays.length))&&(!zones.includes('SEC-5')||pmoa)&&(!needsRestricted||(restricted&&conditions.trim().length>=8));
  const values=()=>({category,teamRole,zones,venues:p.venues||[],accessMode:'sections',validFrom:fromUaeInput(from),validTo:fromUaeInput(to),validityType:p.validityType||'tournament',identityChecked:identity,accessReviewed:access,pmoaEligibilityChecked:pmoa,restrictedConfirmed:restricted,conditions,confirmed:true,...(r.requested.formVersion===2?{...(noCopy?{}:{documentsChecked}),approvedDays}:{})});
  if(!pending)return <section className="ops-owner-result">
    {r.approval&&<><h3>Approved access</h3><p>{r.approval.snapshot.zones.map(id=>config.zones.find(z=>z.id===id)?.label||id).join(' · ')}</p>{r.approval.snapshot.approvedDays&&<p>Approved dates: {r.approval.snapshot.approvedDays.map(d=>Number(d.slice(-2))).join(', ')} October 2026</p>}<p className="ops-caption">{uaeDate(r.approval.created)} · Owner decision recorded</p></>}
    {r.status==='approved'&&<div className="ops-notice" role="status">
      <strong>{r.badge?.state==='ready'?'Badge ready to print':'Application approved · badge not ready'}</strong>
      {r.badge?.reason&&<p>{r.badge.reason}</p>}
      {r.badge?.state==='ready'?<button onClick={()=>run(async()=>{
        const {items}=await api('admin/print');
        const file=items.find(f=>f.applicantId===r.id&&f.version===r.version);
        if(!file)throw Error('This badge is no longer print-ready. Refresh the application.');
        onPreview(await api('admin/print/'+file.id),'Approved front & back',true);
      })}>Open final PDF</button>:<button onClick={()=>act('generate-badge')}>Check badge readiness</button>}
    </div>}
  </section>;
  return <form className="ops-owner-decision" onSubmit={e=>{e.preventDefault();act(idVerified||!r.requested.documents?.some(d=>d.external)?'owner-approve':'owner-verify-approve',{...values(),viewSessions,originalIdAtCollection});}}>
    <h3>Grant access</h3>
    {!idReady&&<p className="ops-notice">Open the ID proof and check it before approving.</p>}
    <label>Approved category<select value={category} onChange={e=>{setCategory(e.target.value);setTeamRole('');chooseZones(zones.filter(z=>z!=='SEC-5'));}}>
      {config.categories.filter(c=>config.departments.find(d=>d.id===r.department)?.categories.includes(c.id)).map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
    </select></label>
    <TeamAccessRole category={category} value={teamRole} onChange={chooseRole}/>
    <AccessChoices legend="Access to grant" zones={config.zones.filter(z=>z.enabled)} selected={zones} onChange={chooseZones} category={category} teamRole={teamRole}/>
    {r.requested.formVersion===2&&<details className="ops-days-review"><summary>Approved dates · {approvedDays.length} match days</summary><fieldset><legend>Approved dates · October 2026</legend>{r.requested.requestedDays.map(day=><label className="ops-check" key={day}><input type="checkbox" checked={approvedDays.includes(day)} onChange={e=>setApprovedDays(ds=>e.target.checked?[...ds,day]:ds.filter(d=>d!==day))}/>{Number(day.slice(-2))} October</label>)}</fieldset></details>}
    <div className="ops-two">
      <label>Valid from · UAE<input type="datetime-local" required value={from} onChange={e=>setFrom(e.target.value)}/></label>
      <label>Valid until · UAE<input type="datetime-local" required value={to} onChange={e=>setTo(e.target.value)}/></label>
    </div>
    <label>Assignment / access conditions<textarea rows={2} maxLength={500} required={needsRestricted||zones.some(z=>['SEC-3','SEC-4'].includes(z))} value={conditions} onChange={e=>{setConditions(e.target.value);setRestricted(false);}}/></label>
    <label className="ops-check"><input type="checkbox" required checked={identity} onChange={e=>{setIdentity(e.target.checked);if(r.requested.simpleApplication)setDocumentsChecked(e.target.checked);}}/>{noCopy?'Photograph, name, organisation and assigned role checked':'ID, photograph, name, organisation and role checked'}</label>
    {r.requested.formVersion===2&&!noCopy&&!r.requested.simpleApplication&&<label className="ops-check"><input type="checkbox" required checked={documentsChecked} onChange={e=>setDocumentsChecked(e.target.checked)}/>ID proof, nominating contact and required assignment evidence checked</label>}
    <label className="ops-check"><input type="checkbox" required checked={access} onChange={e=>setAccess(e.target.checked)}/>Selected access matches the verified assignment</label>
    {zones.includes('SEC-5')&&<label className="ops-check"><input type="checkbox" required checked={pmoa} onChange={e=>setPmoa(e.target.checked)}/>PMOA eligibility verified against assigned duties</label>}
    {needsRestricted&&<label className="ops-check"><input type="checkbox" required checked={restricted} onChange={e=>setRestricted(e.target.checked)}/>I explicitly approve the selected restricted access as Owner</label>}
    <div className="ops-actions">
      <button type="submit" className="ops-primary" disabled={!valid}>Approve</button>
      <button type="button" disabled={!valid||(!noCopy&&!idVerified)} onClick={()=>act('owner-preview',values())}>Preview draft</button>
    </div>
    <p className="ops-caption">Only an approved final PDF enters the print queue. A draft is not an access pass.</p>
    {noCopy?<p className="ops-caption">Original ID and photo matching are required at collection. Approval does not verify the ID or activate the badge.</p>:r.requested.simpleApplication&&<label className="ops-check"><input type="checkbox" checked={originalIdAtCollection} onChange={e=>setOriginalIdAtCollection(e.target.checked)}/>Require an additional original-ID check at collection</label>}
  </form>;
}
