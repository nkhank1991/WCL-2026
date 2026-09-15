import {lazy, Suspense, useEffect, useState} from 'react';
import {ApprovalRecord} from './SetupReviews';
import {operationsApi as api, fromUaeInput} from './operations-api';
const PdfPreview=lazy(()=>import('./PdfPreview'));

export default function BadgeProofReview({design, dirty, onApproved}) {
  const [blob,setBlob]=useState(null), [review,setReview]=useState(design.review),
    [reviewer,setReviewer]=useState(null), [busy,setBusy]=useState(false),
    [error,setError]=useState(''), [success,setSuccess]=useState('');
  useEffect(()=>{setBlob(null);setReview(design.review);setSuccess('');},[design.id,design.review.fingerprint]);
  useEffect(()=>{api('admin/setup-reviews').then(r=>setReviewer(r.reviewer)).catch(e=>setError(e.message));},[]);
  async function preview() {
    setBusy(true);setError('');
    try {
      const pdf=await api('admin/designs/'+design.id);
      const current=(await api('admin/designs')).items.find(d=>d.id===design.id);
      if(current.review.fingerprint!==design.review.fingerprint)throw Error('The design changed. Reopen this category and review its latest version.');
      setReview(current.review);setBlob(pdf);
    } catch(e){setError(e.message);} finally {setBusy(false);}
  }
  async function approve(e) {
    e.preventDefault();const form=new FormData(e.currentTarget);
    setBusy(true);setError('');setSuccess('');
    try {
      await api('admin/designs/'+design.id,{
        action:'publish',proofId:review.proof.id,fingerprint:review.fingerprint,
        displayName:form.get('displayName'),authorised:form.get('authorised')==='on',
        physicalProof:{printer:form.get('printer'),stock:form.get('stock'),scanner:form.get('scanner'),
          printedAt:fromUaeInput(form.get('printedAt')),widthMm:Number(form.get('widthMm')),heightMm:Number(form.get('heightMm')),
          qrResult:form.get('qrResult').trim(),artworkChecked:form.get('artworkChecked')==='on',duplexChecked:form.get('duplexChecked')==='on'}
      });
      const current=(await api('admin/designs')).items.find(d=>d.id===design.id);
      setReview(current.review);await onApproved();setSuccess('Physical proof approved. This exact design version is available for approved badges.');
    } catch(e){setError(e.message);} finally {setBusy(false);}
  }
  return <section className="ops-proof-review" aria-labelledby="physical-proof-title">
    <h3 id="physical-proof-title">Review and approve physical badge proof</h3>
    <p>Print this test PDF at actual size. Check both sides, measure the trimmed card and scan its test QR. Test proofs cannot authorise entry.</p>
    {dirty&&<p role="status">Save your artwork and text changes before preparing a proof.</p>}
    <button type="button" disabled={dirty||busy||!design.hasFront||!design.hasBack} onClick={preview}>{busy?'Working…':blob?'Reload current proof':'Preview front & back'}</button>
    {(!design.hasFront||!design.hasBack)&&<p className="ops-caption">Upload both artwork sides above to prepare the print proof.</p>}
    {error&&<p role="alert">{error}</p>}{success&&<p role="status">{success}</p>}
    <div className="setup-review-layout ops-proof-layout">
      <div className="setup-document">
        {blob?<Suspense fallback={<p role="status">Loading PDF viewer…</p>}><PdfPreview blob={blob} title={'Test proof · '+design.settings.label} inline download filename={'WCL-test-proof-'+design.category+'-v'+design.version+'.pdf'}/></Suspense>:<p>Open the current proof to display the exact front-and-back PDF here.</p>}
        {review.proof&&<details><summary>PDF version and checksum</summary><p>Proof {review.proof.id}</p><code>{review.proof.sha256}</code></details>}
      </div>
      <div className="setup-decision">
        {review.approval&&<><h4>{review.currentApproval?'Current approval':'Previous approval — review required'}</h4><ApprovalRecord record={review.approval}/></>}
        {!review.currentApproval&&<form className="ops-proof-evidence" onSubmit={approve}>
          <fieldset disabled={busy||dirty||!blob}>
            <legend>Record your physical test</legend>
            <p>This is your record of a real print and scan, not an automatic test result.</p>
            {reviewer?.name?<p>Approving as {reviewer.name} · {reviewer.role}</p>:<label>Your name<input name="displayName" required minLength={2} maxLength={150} autoComplete="name"/></label>}
            <label>Printer and model<input name="printer" required maxLength={200}/></label>
            <label>Card stock / material<input name="stock" required maxLength={200}/></label>
            <label>Printed at · UAE<input name="printedAt" type="datetime-local" step="1" required/></label>
            <div className="ops-two">{[['widthMm','Measured width · mm'],['heightMm','Measured height · mm']].map(([name,label])=><label key={name}>{label}<input name={name} type="number" step="0.1" min="1" required/></label>)}</div>
            <label>QR scanner / device<input name="scanner" required maxLength={200}/></label>
            <label>Result scanned from the printed test QR<input name="qrResult" required autoComplete="off" spellCheck="false"/><small>Scan the physical proof; paste the full result beginning wcl-proof:.</small></label>
            <label className="ops-check"><input type="checkbox" name="artworkChecked" required/>Artwork, details and reverse-side terms are correct.</label>
            <label className="ops-check"><input type="checkbox" name="duplexChecked" required/>Front/back alignment and actual-size trim have been checked.</label>
            <label className="ops-check"><input type="checkbox" name="authorised" required/>I completed this physical test and am authorised to approve this version.</label>
            <button className="ops-primary" disabled={!review.proof||busy}>Approve physical badge proof</button>
          </fieldset>
        </form>}
      </div>
    </div>
  </section>;
}
