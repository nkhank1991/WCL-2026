import {sharjahSeatingAreas,sharjahOrientation,seatingLabels} from '../../lib/accreditation-venues.mjs';
import './seating-areas.css';

export function SharjahMap(){
  return <details className="ops-seating-map"><summary>View Sharjah seating map</summary>
    <img src="/assets/accreditation/sharjah-seating-reference.jpeg" alt="Sharjah seating reference: North-West and North-East Stands above the ground; West and East Stands at the sides; Diamond, Platinum and Gold Pavilions, VIP suites, Royal Suite and Royal Lounge below." loading="lazy"/>
    <p>{sharjahOrientation.join(' · ')} — orientation only.</p>
    <p>Ticket seating reference only. Not a broadcast, media, PMOA, gate or Field of Play access map. Dubai has a separate layout.</p>
  </details>;
}
export function SeatingAllocation({config,proposal,value,onChange}){
  if(!proposal.venues?.includes('sharjah')||!proposal.zones?.some(z=>['SEC-3','SEC-4'].includes(z)))return null;
  const plan=config.sharjahSeating;
  const available=sharjahSeatingAreas.filter(a=>plan?.approved&&plan.areas.some(x=>x.id===a.id&&x.enabled&&proposal.zones.includes(x.zone)));
  return <section className="ops-seating"><h4>Permitted Sharjah areas</h4><SharjahMap/>
    {!available.length?<p role="status">No approved seating areas available. Ask event security to configure the seating-to-access mapping.</p>:['Stands','Pavilions','Suites and lounge'].map(group=>{
      const areas=available.filter(a=>a.group===group);
      return areas.length>0&&<fieldset className="ops-choices" key={group}><legend>{group}</legend>{areas.map(a=><label key={a.id}><input type="checkbox" checked={value.includes(a.id)} onChange={e=>onChange(e.target.checked?[...value,a.id]:value.filter(x=>x!==a.id))}/>{a.label}</label>)}</fieldset>;
    })}
    <p className="ops-caption">Selected: {seatingLabels(value).join(' · ')||'None'}</p>
  </section>;
}
export function SeatingConfiguration({value,onChange}){
  function edit(id,patch){
    const existing=value.areas.find(a=>a.id===id)||{id,zone:'',enabled:false};
    const next={...existing,...patch};
    onChange({...value,approved:false,areas:[...value.areas.filter(a=>a.id!==id),next].filter(a=>a.zone)});
  }
  return <section className="ops-seating"><h4>Sharjah seating configuration</h4><SharjahMap/>
    <p>Assign each permitted area to a security-approved access code. No code is inferred from the ticket map.</p>
    {sharjahSeatingAreas.map(a=>{
      const row=value.areas.find(x=>x.id===a.id);
      return <div className="ops-seating-setting" key={a.id}><label>{a.label}<select aria-label={'Access code for '+a.label} value={row?.zone||''} onChange={e=>edit(a.id,{zone:e.target.value,enabled:false})}><option value="">Not mapped</option><option value="SEC-3">3 · Stands</option><option value="SEC-4">4 · Hospitality Area</option></select></label><label className="access-check"><input type="checkbox" aria-label={'Enable '+a.label} disabled={!row?.zone} checked={row?.enabled===true} onChange={e=>edit(a.id,{enabled:e.target.checked})}/>Available</label></div>;
    })}
    <label>Seating mapping approval reference<input value={value.reference} onChange={e=>onChange({...value,approved:false,reference:e.target.value})}/></label>
    <label className="access-check"><input type="checkbox" checked={value.approved} onChange={e=>onChange({...value,approved:e.target.checked})}/>Event security has approved these explicit mappings</label>
  </section>;
}
