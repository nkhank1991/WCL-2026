import {useState} from 'react';
async function api(route,body){
  const r=await fetch('/api/accreditation/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(20000)});
  const data=await r.json();if(!r.ok)throw Error(data.error||'The private upload is unavailable. Try again shortly.');return data;
}
export function DriveDocumentInput({kind='idFront',receipt}){
  const [token,setToken]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  return <div className="ops-secure-document">
    <label>Passport or Emirates ID<input type="file" accept="image/jpeg,image/png,application/pdf" disabled={busy} onChange={async e=>{
      const file=e.target.files[0];setToken('');setError('');if(!file)return;
      if(!['image/jpeg','image/png','application/pdf'].includes(file.type)||file.size>2*1024*1024){setError('Choose one JPG, PNG or PDF below 2 MB.');e.target.value='';return;}
      setBusy(true);
      try{
        const s=await api('identity-session',{kind,receipt,mime:file.type,size:file.size});
        const u=new URL(s.uploadUrl);
        if(u.origin!=='https://www.googleapis.com'||u.pathname!=='/upload/drive/v3/files')throw Error('The private upload address could not be verified.');
        // File bytes are sent only to Google, never to a website API or proxy.
        const uploaded=await fetch(u,{method:'PUT',headers:{'Content-Type':file.type},body:file,credentials:'omit',redirect:'error',signal:AbortSignal.timeout(120000)});
        if(!uploaded.ok)throw Error('Upload interrupted. Select the file to try again.');
        const ready=await api('identity-result',{session:s.session});
        if(!ready.ready)throw Error('Upload is still processing. Please try again shortly.');
        setToken(ready.token);
      }catch(ex){setError(ex.message);e.target.value='';}finally{setBusy(false);}
    }}/></label>
    <input type="hidden" name={kind} value={token}/>
    {busy&&<p role="status">Uploading your ID securely…</p>}
    {token&&<p role="status">ID uploaded · private</p>}
    {error&&<p className="ops-error" role="alert">{error}</p>}
    <p className="ops-caption">One clear JPG, PNG or PDF · up to 2 MB. Only authorised identity reviewers and security staff can view it.</p>
  </div>;
}
