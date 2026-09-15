import {useState} from 'react';
import {documentLabels} from '../../lib/application-form.mjs';

async function identityApi(route,body){const r=await fetch('/api/accreditation/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(20000)});const data=await r.json();if(!r.ok)throw Error(data.error||'The identity service could not be reached.');return data;}
export function SecureDocumentInput({kind,required,receipt}){
  const [session,setSession]=useState(null),[value,setValue]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  const run=async fn=>{setBusy(true);setError('');try{await fn();}catch(e){setError(e.message);}finally{setBusy(false);}};
  return <div className="ops-secure-document"><strong>{documentLabels[kind]}{required?'':' (optional)'}</strong><input type="hidden" name={kind} value={value}/>
    <div className="ops-actions"><button type="button" disabled={busy} onClick={()=>run(async()=>{setValue('');setMessage('');setSession(await identityApi('identity-session',{kind,receipt}));})}>{value?'Replace document':session?'Get a new upload link':'Prepare secure upload'}</button>
    {session&&<><a className="ops-document-link" href={session.url} target="_blank" rel="noreferrer">Open secure upload ↗</a><button type="button" disabled={busy} onClick={()=>run(async()=>{const r=await identityApi('identity-result',{session:session.session});if(r.pending){setMessage('Finish uploading in the secure window, then check again.');return;}setValue(r.token);setMessage('Document saved securely. Ready to submit.');})}>Check upload</button></>}</div>
    {busy&&<p role="status">Connecting securely…</p>}{message&&<p role="status">{message}</p>}{error&&<p className="ops-error" role="alert">{error}</p>}
    <p className="ops-caption">Upload and preview in the private identity window. Only a document reference returns here.</p></div>;
}
