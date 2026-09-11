import {Link} from 'react-router-dom';
import teamLogos from './data/team-logos.json';
import {CalendarBlank,ArrowUpRight} from '@phosphor-icons/react';
export const teams=[['india','India','IND','#1264bf'],['pakistan','Pakistan','PAK','#18794f'],['south-africa','South Africa','SA','#075b41'],['australia','Australia','AUS','#b87c00'],['england','England','ENG','#b92939'],['west-indies','West Indies','WI','#822842'],['bangladesh','Bangladesh','BAN','#007663']].map(([id,name,short,color])=>({id,name,short,color}));
export const teamName=id=>teams.find(t=>t.id===id)?.name||'To be confirmed';
export const validSeason=value=>['1','2','3'].includes(String(value))?String(value):'3';
export const inSeason=(items,season)=>items.filter(item=>String(item.season)===String(season));
// Presentation only: retain the publisher's original venue field and omit its
// repeated placeholder suffix. UAE is a country label, not a stadium assignment.
export function venueLabel(match){
 const venue=(match.venue||'').replace(/(?:[·.,–—-]\s*)?(?:stadium|venue)\s*(?:to be confirmed|TBC)\.?/gi,'').trim();
 return venue|| (Number(match.season)===3?'United Arab Emirates':'Venue unavailable');
}
export function fixtureState(match){
 if(['Postponed','Cancelled'].includes(match.status))return match.status;
 if(match.verificationStatus==='verified' && match.status==='Live')return 'Live';
 if(match.verificationStatus==='verified' && match.status==='Completed' && match.result)return 'Result';
 return Number(match.season)===3?'Scheduled':'Archive';
}
export function priorityFixture(matches,now=Date.now()){
 const verified=matches.filter(m=>m.verificationStatus==='verified');
 return verified.find(m=>fixtureState(m)==='Live')
 ||matches.filter(m=>fixtureState(m)==='Scheduled'&&Date.parse(m.startsAt)>now).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt))[0]
 ||verified.filter(m=>fixtureState(m)==='Result').sort((a,b)=>Date.parse(b.startsAt||0)-Date.parse(a.startsAt||0))[0]||null;
}
export function matchMoment(match){
 if(!match.startsAt||!Number.isFinite(Date.parse(match.startsAt)))return match.date||'Date to be confirmed';
 return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Dubai',hour12:false}).format(new Date(match.startsAt))+' UAE';
}
export function HeroMatch({matches=[]}){
 const match=priorityFixture(matches);
 if(!match)return <Link className="hero-match-widget" to="/matches"><CalendarBlank/><span><small>MATCH CENTRE</small><strong>Explore the fixtures & archive</strong></span><ArrowUpRight/></Link>;
 const state=fixtureState(match);
 return <Link className="hero-match-widget" to={'/matches/'+match.id}><div className="hero-match-crests" aria-hidden="true">{match.teams.map(id=><i key={id}>{teamLogos[id]?<img src={teamLogos[id]} alt="" onError={e=>{e.currentTarget.hidden=true}}/>:teams.find(t=>t.id===id)?.short}</i>)}</div><span><small className={state==='Live'?'status-live':undefined}>{state==='Scheduled'?'UP NEXT':state.toUpperCase()} · SEASON {match.season}</small><strong>{match.teams.map(teamName).join(' × ')||match.label}</strong><em>{state==='Result'?match.result:matchMoment(match)}</em><em>{match.venue||'Venue to be confirmed'}</em><b className="hero-match-action">View Match Centre</b></span><ArrowUpRight/></Link>;
}
