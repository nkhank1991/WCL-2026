import {useState} from 'react';
import {AccessChoices} from './AccessChoices';
import {PortraitCrop} from './PortraitCrop';
import {requestedTeamRole,documentLabels} from '../../lib/application-form.mjs';
import {pmoaEligible} from '../../lib/access-sections.mjs';
import {SecureDocumentInput} from './SecureDocumentInput';
import {DriveDocumentInput} from './DriveDocumentInput';

export function ApplicationSection({number,title,children}){return <section className="ops-panel"><div className="application-section-title"><span>{number}</span><h2>{title}</h2></div>{children}</section>;}
export function DocumentInput({kind,required=false}){
  const [error,setError]=useState('');
  return <label>{documentLabels[kind]}{!required&&' (optional)'}<input name={kind} type="file" accept="image/jpeg,image/png,application/pdf" required={required} onChange={e=>{
    const f=e.target.files[0];setError('');
    if(f&&(f.size>2*1024*1024||!['image/jpeg','image/png','application/pdf'].includes(f.type))){e.target.value='';setError('Choose a JPG, PNG or PDF below 2 MB.');}
  }}/>{error&&<span role="alert" className="ops-error">{error}</span>}</label>;
}

export function ApplicationFields({config,busy,onPhoto}){
  const initial=new URLSearchParams(location.search).get('category')||'';
  const [department,setDepartment]=useState(()=>config.departments.find(d=>d.categories.includes(initial))?.id||'');
  const [category,setCategory]=useState(initial),[role,setRole]=useState(''),[idType,setIdType]=useState(''),[reverse,setReverse]=useState(false),[zones,setZones]=useState([]);
  const dept=config.departments.find(d=>d.id===department);
  const Document=config.identityProvider==='google-drive'?DriveDocumentInput:config.identityMode==='external'?SecureDocumentInput:DocumentInput;
  const roleOptions=dept?.roles||[];
  const chooseRole=next=>{setRole(next);const c=department==='teams'?(next==='Player'?'player':'team-staff'):category;setCategory(c);if(!pmoaEligible(c,requestedTeamRole(c,next)))setZones(z=>z.filter(id=>id!=='SEC-5'));};
  const field=(name,label,options={})=><label>{label}<input name={name} required maxLength={200} {...options}/></label>;
  return <>
    <ApplicationSection number="01" title="Your details"><div className="ops-two">
      {field('name','Full name, matching ID',{autoComplete:'name'})}
      {field('displayName','Name on the card (optional)',{required:false,placeholder:'Defaults to your full name'})}
      {field('email','Email address',{type:'email',autoComplete:'email'})}
      {field('mobile','Mobile number with country code',{type:'tel',autoComplete:'tel',placeholder:'+971…',pattern:'\\+[0-9 ()-]{7,20}'})}
    </div></ApplicationSection>
    <ApplicationSection number="02" title="Department & role">
      {field('organisation','Company / organisation',{autoComplete:'organization'})}
      <div className="ops-two">
        <label>Department<select name="department" required value={department} onChange={e=>{const d=config.departments.find(x=>x.id===e.target.value);setDepartment(e.target.value);setCategory(d?.categories[0]||'');setRole('');setZones([]);}}><option value="">Choose department</option>{config.departments.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
        <label>Job title / actual role<select name="roleChoice" required value={role} onChange={e=>chooseRole(e.target.value)}><option value="">Choose role</option>{roleOptions.map(r=><option key={r}>{r}</option>)}</select></label>
      </div>
      {department==='other'&&field('departmentOther','Specify department')}
      {role==='Other'?field('jobTitle','Specify your actual role'):<input name="jobTitle" type="hidden" value={role}/>}
      <label>Accreditation category<select name="category" required value={category} onChange={e=>{setCategory(e.target.value);setZones([]);}}><option value="">Choose category</option>{config.categories.filter(c=>dept?.categories.includes(c.id)).map(c=><option value={c.id} key={c.id}>{c.label}</option>)}</select></label>
      {(department==='teams'||['player','team-staff'].includes(category))&&<label>Team<select name="team" required><option value="">Choose team</option>{config.teams.map(t=><option key={t}>{t}</option>)}</select></label>}
      <label>Assignment / purpose of attendance<textarea name="assignment" required minLength={8} maxLength={1000} rows={2}/></label>
      {dept?.nominationRequired&&<div className="ops-two">{field('nominatorName','Nominating manager / department contact')}{field('nominatorContact','Contact email or international phone')}</div>}
      {dept?.evidenceRequired&&<Document kind="assignmentEvidence" required/>}
    </ApplicationSection>
    <ApplicationSection number="03" title="Your photograph"><PortraitCrop onChange={onPhoto}/></ApplicationSection>
    <ApplicationSection number="04" title="Identity proof">
      <label>ID type<select name="idType" required value={idType} onChange={e=>{setIdType(e.target.value);setReverse(false);}}><option value="">Choose ID type</option><option value="passport">Passport</option><option value="emirates-id">Emirates ID</option><option value="other">Other government photo ID</option></select></label>
      {idType==='other'&&field('idDescription','Government photo ID name')}
      <Document kind="idFront" required/>
      {idType!=='emirates-id'&&<label className="ops-check"><input type="checkbox" name="idHasReverse" checked={reverse} onChange={e=>setReverse(e.target.checked)}/>My ID has a reverse side with identity details</label>}
      {(idType==='emirates-id'||reverse)&&<Document kind="idBack" required/>}
      <p className="ops-caption">Clear JPG, PNG or PDF · up to 2 MB each. PDF: up to five pages, without passwords, forms or attachments. Identity documents are private and never printed on the badge.</p>
    </ApplicationSection>
    <ApplicationSection number="05" title="Dates & requested access">
      <fieldset className="application-days"><legend>Required match days / working dates · October 2026</legend>{config.matchDays.map(day=><label key={day}><input type="checkbox" name="requestedDays" value={day}/><span>{Number(day.slice(-2))}<small>{new Date(day+'T12:00:00Z').toLocaleDateString('en-GB',{weekday:'short',timeZone:'Asia/Dubai'})}</small></span></label>)}</fieldset>
      <p className="ops-caption">Select every date you need. Setup and training dates are handled separately.</p>
      <AccessChoices zones={config.zones} selected={zones} onChange={setZones} name="requestedZones" category={category} teamRole={requestedTeamRole(category,role)}/>
      <p className="ops-caption">Requested access is subject to approval.</p>
      {zones.some(z=>['SEC-5','FOP','DRESS'].includes(z))&&<label>Reason for restricted access<textarea name="restrictedReason" required minLength={8} maxLength={1000} rows={2}/></label>}
      <label>Additional remarks (optional)<textarea name="remarks" maxLength={1000} rows={2}/></label>
    </ApplicationSection>
    <ApplicationSection number="06" title="Confirm & submit">
      <label className="application-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
      <label className="ops-check"><input type="checkbox" name="accuracy" required/>I confirm my details and documents are accurate.</label>
      {config.whatsappAvailable&&<label className="ops-check"><input type="checkbox" name="whatsappOptIn"/>Send accreditation status updates to my mobile number using WhatsApp (optional).</label>}
      <label className="ops-check"><input type="checkbox" name="eventTerms" required/><span>I accept the {config.eventTermsUrl?<a href={config.eventTermsUrl} target="_blank" rel="noreferrer">event terms</a>:'event terms (awaiting approval)'}.</span></label>
      <label className="ops-check"><input type="checkbox" name="consent" required/><span>I acknowledge the {config.privacyNoticeUrl?<a href={config.privacyNoticeUrl} target="_blank" rel="noreferrer">accreditation privacy notice</a>:'accreditation privacy notice (awaiting approval)'}.</span></label>
      <button className="ops-primary application-submit">{busy?'Submitting…':'Submit'}</button>
    </ApplicationSection>
  </>;
}
