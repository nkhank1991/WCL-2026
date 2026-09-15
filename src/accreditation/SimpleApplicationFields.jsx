import {useState} from 'react';
import {AccessChoices} from './AccessChoices';
import {PortraitCrop} from './PortraitCrop';
import {DriveDocumentInput} from './DriveDocumentInput';
import {SecureDocumentInput} from './SecureDocumentInput';
import {DocumentInput,ApplicationSection} from './ApplicationFields';
import {requestedTeamRole} from '../../lib/application-form.mjs';
import {pmoaEligible} from '../../lib/access-sections.mjs';
import {policyPaths} from './policy-content';
import {idUploadHelper} from '../../lib/accreditation-policy-pack.mjs';

export function SimpleApplicationFields({config,busy,onPhoto}){
  const initial=new URLSearchParams(location.search).get('category')||'';
  const [department,setDepartment]=useState(config.departments.find(d=>d.categories.includes(initial))?.id||'');
  const [category,setCategory]=useState(initial),[role,setRole]=useState(''),[zones,setZones]=useState([]);
  const dept=config.departments.find(d=>d.id===department);
  const chooseRole=value=>{setRole(value);const c=department==='teams'?(value==='Player'?'player':'team-staff'):category;setCategory(c);if(!pmoaEligible(c,requestedTeamRole(c,value)))setZones(z=>z.filter(x=>x!=='SEC-5'));};
  const Document=config.identityProvider==='google-drive'?DriveDocumentInput:config.identityMode==='external'?SecureDocumentInput:DocumentInput;
  return <>
    <ApplicationSection number="01" title="Your details">
      <div className="ops-two">
        <label>Full name, matching ID<input name="name" autoComplete="name" required maxLength={200}/></label>
        <label>Company / organisation<input name="organisation" autoComplete="organization" required maxLength={200}/></label>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={200}/></label>
        <label>Mobile with country code<input name="mobile" type="tel" autoComplete="tel" required placeholder="+971…" pattern="\+[0-9 ()-]{7,20}"/></label>
        <label>Department<select name="department" required value={department} onChange={e=>{const d=config.departments.find(x=>x.id===e.target.value);setDepartment(e.target.value);setCategory(d?.categories[0]||'');setRole('');setZones([]);}}><option value="">Select department</option>{config.departments.map(d=><option value={d.id} key={d.id}>{d.label}</option>)}</select></label>
        <label>Role<select name="roleChoice" required value={role} onChange={e=>chooseRole(e.target.value)}><option value="">Select role</option>{dept?.roles.map(r=><option key={r}>{r}</option>)}</select></label>
      </div>
      {department==='other'&&<label>Department name<input name="departmentOther" required maxLength={200}/></label>}
      {role==='Other'?<label>Job title<input name="jobTitle" required maxLength={200}/></label>:<input type="hidden" name="jobTitle" value={role}/>}
      {dept?.categories.length>1&&department!=='teams'?<label>Category<select name="category" value={category} onChange={e=>{setCategory(e.target.value);setZones([]);}}>{config.categories.filter(c=>dept.categories.includes(c.id)).map(c=><option value={c.id} key={c.id}>{c.label}</option>)}</select></label>:<input type="hidden" name="category" value={category}/>}
      {(department==='teams'||['player','team-staff'].includes(category))&&<label>Team<select name="team" required><option value="">Select team</option>{config.teams.map(t=><option key={t}>{t}</option>)}</select></label>}
    </ApplicationSection>
    <ApplicationSection number="02" title="Photo & ID">
      <PortraitCrop onChange={onPhoto}/>
      <label>ID type<select name="idType" required><option value="">Select ID</option><option value="emirates-id">Emirates ID</option><option value="passport">Passport</option></select></label>
      <Document kind="idFront" required/>
      <details><summary>How your ID is used</summary><p className="ops-caption">{idUploadHelper}</p><a href={policyPaths.storage} target="_blank" rel="noreferrer">ID handling and retention policy</a></details>
    </ApplicationSection>
    <ApplicationSection number="03" title="Requested access">
      <AccessChoices zones={config.zones} selected={zones} onChange={setZones} name="requestedZones" category={category} teamRole={requestedTeamRole(category,role)}/>
      <p className="ops-caption">Requested access is subject to approval.</p>
      {zones.some(z=>['SEC-5','FOP','DRESS'].includes(z))&&<label>Why is restricted access needed?<textarea name="restrictedReason" required minLength={8} maxLength={1000} rows={2}/></label>}
      <input type="hidden" name="assignment" value="Event accreditation request"/>
      {config.matchDays.map(day=><input type="hidden" name="requestedDays" value={day} key={day}/>)}
      <label className="application-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
      <label className="ops-check"><input type="checkbox" name="accuracy" required/>I confirm that the information and documents are accurate, relate to the named applicant, and I am authorised to submit them.</label>
      <label className="ops-check"><input type="checkbox" name="eventTerms" required/><span>I agree to the <a href={config.eventTermsUrl||policyPaths.terms} target="_blank" rel="noreferrer">Event Accreditation Terms</a>.</span></label>
      <label className="ops-check"><input type="checkbox" name="consent" required/><span>I have read the <a href={config.privacyNoticeUrl||policyPaths.privacy} target="_blank" rel="noreferrer">Accreditation Privacy Notice</a>.</span></label>
      <p className="ops-caption">Submission does not grant access. A badge becomes usable only after approval and recorded issuance.</p>
      <button className="ops-primary application-submit" disabled={busy}>{busy?'Submitting…':'Submit application'}</button>
    </ApplicationSection>
  </>;
}
