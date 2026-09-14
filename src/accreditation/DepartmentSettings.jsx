export function DepartmentSettings({departments,categories,onChange}){
  const update=(id,patch)=>onChange(departments.map(d=>d.id===id?{...d,...patch}:d));
  return <section className="admin-panel"><h3>Application departments</h3><p>Maintain department names, relevant role options and available badge categories. These choices do not grant access or staff permissions.</p>
    {departments.map(d=><details key={d.id} className="department-editor"><summary>{d.label}{d.legacyOnly?' · existing records only':d.enabled?'':' · closed'}</summary>
      <label>Department name<input value={d.label} maxLength={100} required onChange={e=>update(d.id,{label:e.target.value})}/></label>
      {!d.legacyOnly&&<label className="access-check"><input type="checkbox" checked={d.enabled} onChange={e=>update(d.id,{enabled:e.target.checked})}/>Available to new applicants</label>}
      <label>Relevant roles · one per line<textarea rows={4} value={d.roles?.join('\n')||''} onChange={e=>update(d.id,{roles:e.target.value.split('\n')})}/></label>
      <fieldset><legend>Badge categories available to this department</legend>{categories.map(c=><label className="access-check" key={c.id}><input type="checkbox" checked={d.categories.includes(c.id)} onChange={e=>update(d.id,{categories:e.target.checked?[...d.categories,c.id]:d.categories.filter(id=>id!==c.id)})}/>{c.label}</label>)}</fieldset>
    </details>)}
    <button type="button" onClick={()=>onChange([...departments,{id:'department-'+crypto.randomUUID().slice(0,8),label:'New department',roles:['Other'],categories:['vendor'],enabled:false,nominationRequired:true,evidenceRequired:true}])}>Add department</button>
  </section>;
}
