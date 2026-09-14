import {pmoaEligible,teamAccessRoles} from '../../lib/access-sections.mjs';
import './access-choices.css';

export function TeamAccessRole({category,value,onChange}) {
  if(category!=='team-staff')return null;
  return <label>Team role<select name="teamRole" required value={value} onChange={e=>onChange(e.target.value)}>
    <option value="">Choose your team role</option>
    {teamAccessRoles.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
  </select></label>;
}

export function AccessChoices({legend='Requested access',zones,selected,onChange,category,teamRole,name}) {
  return <fieldset className="ops-access-choices"><legend>{legend}</legend>
    {zones.map(zone=>{
      const eligible=zone.id!=='SEC-5'||pmoaEligible(category,teamRole);
      const disabled=zone.enabled===false||!eligible;
      return <label key={zone.id} className={selected.includes(zone.id)?'is-selected':''}>
        <input type="checkbox" name={name} value={zone.id} aria-label={(zone.code?zone.code+' · ':'')+zone.label}
          disabled={disabled} checked={!disabled&&selected.includes(zone.id)}
          onChange={e=>onChange(e.target.checked?[...selected,zone.id]:selected.filter(id=>id!==zone.id))}/>
        {zone.code&&<span className="ops-access-code" aria-hidden="true">{zone.code}</span>}
        <span>{zone.label}{zone.id==='SEC-5'&&<small>{eligible?'Players and Match Officials Area · explicit approval required':'Players, match officials, team managers and essential team logistics only'}</small>}
        {zone.enabled===false&&<small>Not open for requests</small>}</span>
      </label>;
    })}
  </fieldset>;
}
