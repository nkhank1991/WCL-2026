import {useState} from 'react';
import {originalIdAtCollection} from '../../lib/application-form.mjs';
import {operationsApi as api} from './operations-api';

export function IdentityReview({record,run,act,canVerify=true,onSessions}){
  const [links,setLinks]=useState({});
  const docs=record.requested.documents||[];
  if(originalIdAtCollection(record.requested))return <section className="ops-identity-review"><h3>Identity check at collection</h3><p>{record.identity?.status==='verified'?'Original ID and photograph matched at issuance.':'No ID copy is collected. Staff must inspect the original ID and match the person to the approved photograph before issuing.'}</p>{record.identity?.created&&<p className="ops-caption">Verified {new Date(record.identity.created).toLocaleString()} · staff {record.identity.actor}</p>}</section>;
  if(!docs.some(d=>d.external))return null;
  return <section className="ops-identity-review"><h3>Identity verification</h3><p className="ops-status">{record.identity?.status==='verified'?'ID verified':'ID review required'}</p>
    {docs.map(d=><div className="ops-actions" key={d.id}><button type="button" onClick={()=>run(async()=>{const link=await api('admin/identity-view',{documentId:d.id});const next={...links,[d.id]:link};setLinks(next);onSessions?.(Object.values(next).map(l=>l.session));})}>{d.kind==='idFront'?'View ID':'View '+d.label}</button>{links[d.id]&&<a href={links[d.id].url} target="_blank" rel="noreferrer">Open private document ↗</a>}{links[d.id]?.provider==='google-drive'&&<iframe className="ops-id-preview" title="Private ID proof" src={links[d.id].url.replace(/\/view(?:\?.*)?$/,'/preview')} referrerPolicy="no-referrer"/>}</div>)}
    {record.identity?.status==='verified'?<p className="ops-caption">Verified {new Date(record.identity.created).toLocaleString()} · reviewer {record.identity.actor}</p>:canVerify&&<form onSubmit={e=>{e.preventDefault();act('verify-id',{nameMatches:true,photoMatches:true,documentValid:true,viewSessions:Object.values(links).map(l=>l.session)});}}>
      <label className="ops-check"><input type="checkbox" required/>Full name matches the submitted ID</label>
      <label className="ops-check"><input type="checkbox" required/>ID photograph matches the applicant photograph</label>
      <label className="ops-check"><input type="checkbox" required/>ID and required assignment evidence checked</label>
      <button className="ops-primary">Verify ID</button></form>}
    <p className="ops-caption">Private ID · identity reviewers and security only.</p></section>;
}

export function CollectionAndSecurity({record:r,user,act}){
  const badges=r.badgeHistory||[],current=badges.find(b=>!['revoked','suspended'].includes(b.status));
  const security=['Owner','Security Lead'].includes(user.role),issuer=['Owner','Issuance Officer'].includes(user.role);
  const originalRequired=r.collectionOriginalIdRequired??(originalIdAtCollection(r.requested)||!r.requested.simpleApplication||r.approval?.snapshot.originalIdAtCollection===true||r.incidents?.some(i=>i.kind==='identity-concern'));
  return <>
    {issuer&&r.status==='printed'&&<form className="ops-identity-review" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);act('verify-issue',{badgeNumber:f.get('badgeNumber'),recipient:f.get('recipient'),originalIdMatched:f.get('originalId')==='on',personMatched:true,photoMatched:true});}}><h3>Issue badge</h3><p>Match the person to the approved photograph. Refer any mismatch for review before issuing.</p>
      <input type="hidden" name="badgeNumber" value={current?.id||""}/><label>Recipient’s full name<input name="recipient" required defaultValue={r.name}/></label>
      {originalRequired&&<label className="ops-check"><input type="checkbox" name="originalId" required/>Original Emirates ID or passport is acceptable and its name and photograph match the applicant</label>}<label className="ops-check"><input type="checkbox" required/>Person matches the approved photograph</label><p className="ops-caption">Inspect only. Do not photograph, scan or record an ID number. Refer any mismatch without issuing.</p><button className="ops-primary">Verify & Issue Badge</button></form>}
    {security&&badges.length>0&&<details className="ops-identity-review"><summary>Incident & replacement</summary><form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);act('incident',{kind:f.get('kind'),notes:f.get('notes'),holdUntil:f.get('holdUntil')?new Date(f.get('holdUntil')+'T23:59:59Z').toISOString():null});}}><label>Incident type<select name="kind"><option value="lost">Lost badge</option><option value="stolen">Stolen badge</option><option value="misuse">Suspected misuse</option><option value="identity-concern">Identity concern</option><option value="other">Other</option></select></label><label>Incident description<textarea name="notes" required minLength={8} maxLength={1500}/></label>{!originalIdAtCollection(r.requested)&&<label>Document hold review date (if required)<input name="holdUntil" type="date"/></label>}<p className="ops-caption">Do not enter passport or ID numbers here. Suspension takes effect immediately.</p><button>Record incident & suspend access</button></form>
      {r.incidents?.map(i=><article key={i.id}><h4>{i.kind} · {new Date(i.created).toLocaleString()}</h4><p>{i.notes}</p>{i.hold_until&&<p role={i.hold_state==='pending'?'alert':undefined}>ID retention hold: {i.hold_state==='confirmed'?'Confirmed':'Pending — preservation is not yet confirmed'} · review {new Date(i.hold_until).toLocaleDateString()}</p>}{r.status==='suspended'&&<button onClick={()=>{if(confirm('Invalidate the previous badge and prepare a replacement with the same approved access?'))act('replace',{incidentId:i.id,confirmed:true});}}>Prepare replacement</button>}</article>)}</details>}
    {badges.length>0&&<section className="ops-identity-review"><h3>Badge history</h3>{badges.map(b=><div key={b.id}><strong>{b.id}</strong><p>{b.status==='collected'?'Issued':b.status==='prepared'?'Prepared · not active':b.status}{b.issuedAt&&' · '+new Date(b.issuedAt).toLocaleString()}{b.recipient&&' · '+b.recipient}</p></div>)}</section>}
  </>;
}
