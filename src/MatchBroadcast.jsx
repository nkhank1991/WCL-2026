import {useId,useRef,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {useInView} from 'motion/react';
import {ArrowRight,CaretRight,CaretDown,MagnifyingGlass} from '@phosphor-icons/react';
import {teams,teamName,validSeason,inSeason,fixtureState,priorityFixture,venueLabel} from './match-model.jsx';
import {useTeams} from './cms/SiteContent.jsx';
import {useBroadcastMotion} from './BroadcastGraphics.jsx';
import './match-broadcast.css';
import {MatchStage} from './MatchStage.jsx';
import {scoreFor} from './match-live.js';

// Dark, opaque team surfaces keep white names readable; these are first-listed
// team identities, not a claim of home-ground allocation.
export function fixtureColours(match){
 const team=teams.find(team=>team.id===match.teams[0]);
 const away=teams.find(team=>team.id===match.teams[1]);
 const base=[7,21,44];
 const fill=team?'#'+team.color.slice(1).match(/../g).map((part,index)=>Math.round(parseInt(part,16)*.65+base[index]*.35).toString(16).padStart(2,'0')).join(''):'#182c4b';
 return {'--mc-team-colour':team?.color||'#ff823a','--mc-team-fill':fill,'--mc-away-colour':away?.color||'#ff823a'};
}

export function matchDate(match){
 const valid=match.startsAt&&Number.isFinite(Date.parse(match.startsAt));
 const instant=valid?new Date(match.startsAt):null;
 const archiveParts=String(match.date||'').split('·').map(part=>part.trim());
 const archiveTime=archiveParts[1]?.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*([A-Z][A-Z0-9+:]*)?$/i);
 const weekday=archiveParts[0].match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+/)?.[1]||'';
 return {
  date:valid?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',timeZone:'Asia/Dubai'}).format(instant):archiveParts[0].replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+/,'')||'Date to be confirmed',
  day:valid?new Intl.DateTimeFormat('en-GB',{weekday:'long',timeZone:'Asia/Dubai'}).format(instant):weekday,
  time:valid?new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Dubai'}).format(instant):match.time||archiveTime?.[1]||'Time TBC',
  zone:valid?'UAE · UTC+4':match.timeZone||archiveTime?.[2]||'Local time not supplied'
 };
}

export function TeamMark({id}){
 const teams=useTeams();
 const [failed,setFailed]=useState(false);
 const team=teams.find(team=>team.id===id);
 return team?.logo&&!failed
  ?<img className="mc-crest" src={team.logo} alt="" onError={()=>setFailed(true)}/>
  :<span className="mc-team-code" aria-hidden="true">{team?.short||'—'}</span>;
}

function Fixture({match,compact,motionMode='off',index=0}){
 const ref=useRef(null);
 const entered=useInView(ref,{once:true,amount:.16});
 const date=matchDate(match),state=fixtureState(match);
 const title=match.teams.length?match.teams.map(teamName).join(' versus '):match.label;
 const result=state==='Result'?match.result:null;
 return <Link ref={motionMode==='off'?undefined:ref} className={'mc-fixture'+(state==='Live'?' mc-is-live':'')} to={'/matches/'+match.id}
  data-card-motion={motionMode} data-entered={motionMode==='off'||entered} data-scored={state==='Result'||state==='Live'}
  style={{...fixtureColours(match),'--mc-entry-delay':(Math.min(index,2)*70)+'ms'}}
  aria-label={title+' · '+date.date+' · '+date.time+' · '+state+' · Match details'}>
  <span className="mc-board-skin" aria-hidden="true"><span className="mc-board-colour"/><span className="mc-board-intro"/><span className="mc-board-rail"/></span>
  {compact&&<span className="mc-card-date">{date.date}<span>{date.time} {date.zone.startsWith('UAE')?'UAE':date.zone==='Local time not supplied'?'':date.zone}</span></span>}
  {!compact&&<span className="mc-fixture-time"><time dateTime={match.startsAt||undefined}>{date.time}</time>{!date.zone.startsWith('UAE')&&date.zone!=='Local time not supplied'&&<small>{date.zone}</small>}{state==='Live'&&<span className="mc-live">Live</span>}</span>}
  <span className="mc-fixture-teams">
   {[0,1].map(i=>{const score=scoreFor(match,match.teams[i],i);return <span className="mc-side" key={match.teams[i]||i}><TeamMark key={match.teams[i]||i} id={match.teams[i]}/><strong>{teamName(match.teams[i])}</strong>{score&&<span className="mc-row-score">{score.value}{score.overs&&<small>{score.overs} ov</small>}</span>}</span>})}
   {!compact&&<span className="mc-vs" aria-hidden="true">vs</span>}
  </span>
  <span className="mc-fixture-info">
   <span className="mc-match-label">{state==='Live'?<span className="mc-live">Live</span>:match.label}</span>
   <span className="mc-match-note">{result||(['Postponed','Cancelled'].includes(state)?state:compact&&state==='Archive'?'Season '+match.season+' archive':venueLabel(match))}</span>
  </span>
  <CaretRight className="mc-fixture-arrow" aria-hidden="true"/>
 </Link>;
}

// The public Match Centre is for finding a fixture and opening its details.
// Production graphics, palette previews and unverified team sheets do not belong here.
export function MatchBroadcast({matches=[],players=[],compact=false}){
 const {enabled,spatial}=useBroadcastMotion();
 const motionMode=spatial?'spatial':enabled?'fade':'off';
 const [params,setParams]=useSearchParams();
 const [local,setLocal]=useState({season:'3',team:'all'});
 const season=validSeason(compact?local.season:params.get('season'));
 const team=(compact?local.team:params.get('team'))||'all';
 const date=compact?'all':params.get('date')||'all';
 const view=compact?'all':params.get('view')||'all';
 const query=compact?'':params.get('q')||'';
 const [extraFilters,setExtraFilters]=useState(false),filterId=useId();
 const activeExtras=Number(date!=='all')+Number(!!query.trim());
 function set(key,value){
  if(compact){setLocal(previous=>({...previous,[key]:value}));return}
  const next=new URLSearchParams(params);
  if(value==='all'||!value)next.delete(key);else next.set(key,value);
  if(key==='season')next.delete('date');
  setParams(next,{replace:true,preventScrollReset:true});
 }
 function reset(){
  if(compact)setLocal({season,team:'all'});
  else setParams({season},{replace:true,preventScrollReset:true});
 }
 const seasonRows=inSeason(matches,season);
 const dates=[...new Set(seasonRows.map(match=>match.date))];
 const rows=seasonRows.filter(match=>{
  const state=fixtureState(match);
  return (team==='all'||match.teams.includes(team))
   &&(date==='all'||match.date===date)
   &&(view==='all'||(view==='upcoming'?state==='Scheduled'&&Date.parse(match.startsAt)>Date.now():state==='Result'))
   &&[match.label,match.venue,match.date,...match.teams.map(teamName)].join(' ').toLowerCase().includes(query.trim().toLowerCase());
 });
 // For the homepage prefer live/upcoming records, without disguising an archive as live.
 const upcoming=rows.filter(match=>fixtureState(match)==='Live'||(fixtureState(match)==='Scheduled'&&Date.parse(match.startsAt)>Date.now()))
  .sort((a,b)=>(fixtureState(a)==='Live'?-1:0)-(fixtureState(b)==='Live'?-1:0)||Date.parse(a.startsAt)-Date.parse(b.startsAt));
 const shown=compact?(upcoming.length?upcoming:rows).slice(0,3):rows;
 const featured=compact?shown[0]:priorityFixture(rows)||rows[0];
 const secondary=compact?shown.filter(match=>match.id!==featured?.id):shown;
 const groups=Object.values(shown.reduce((acc,match)=>{
  const key=matchDate(match).date;
  if(!acc[key])acc[key]={date:key,day:matchDate(match).day,matches:[]};
  acc[key].matches.push(match);
  return acc;
 },{}));
 const allLink='/matches?season='+season+(team!=='all'?'&team='+team:'');
 return <section className={'match-broadcast '+(compact?'mc-home':'mc-page wrap')} aria-label="WCL Match Centre">
  <header className="mc-header">
   <div><p className="mc-eyebrow">EVERY CONTEST. EVERY CHAPTER.</p>{compact?<h2>Match centre<span>.</span></h2>:<h1>Match centre<span>.</span></h1>}</div>
   {compact?<Link className="mc-all-link" to={allLink}>All matches <ArrowRight/></Link>:<p className="mc-header-note">{season==='3'?<>3–18 October 2026<br/>United Arab Emirates</>:<>Season {season} · {2023+Number(season)}<br/>Fixture archive</>}</p>}
  </header>
  <div className="mc-toolbar" data-extra-filters={extraFilters}>
   <div className="mc-filters">
    <label>Season<select aria-label="Season" value={season} onChange={event=>set('season',event.target.value)}>{['3','2','1'].map(value=><option value={value} key={value}>Season {value} · {2023+Number(value)}</option>)}</select></label>
    <label>Team<select aria-label={compact?'Filter homepage matches by team':'Team'} value={team} onChange={event=>set('team',event.target.value)}><option value="all">All teams</option>{teams.map(team=><option value={team.id} key={team.id}>{team.name}</option>)}</select></label>
    {!compact&&<button className="mobile-filter-toggle" aria-expanded={extraFilters} aria-controls={filterId+'-date '+filterId+'-search'} onClick={()=>setExtraFilters(value=>!value)}>{extraFilters?'Fewer filters':'Date & search'}{activeExtras>0&&<span>{activeExtras} active</span>}<CaretDown aria-hidden="true"/></button>}
    {!compact&&<label className="mc-extra-filter" id={filterId+'-date'}>Date<select aria-label="Date" value={date} onChange={event=>set('date',event.target.value)}><option value="all">All dates</option>{dates.map(value=><option key={value}>{value}</option>)}</select></label>}
   </div>
   {!compact&&<label className="mc-search" id={filterId+'-search'}><MagnifyingGlass aria-hidden="true"/><input aria-label="Search matches" value={query} placeholder="Find a match" onChange={event=>set('q',event.target.value)}/></label>}
   {compact&&<p className="mc-timezone">{season==='3'?'3–18 October 2026 · UAE time':'Season '+season+' · Fixture archive'}</p>}
  </div>
  {featured&&<div className="mc-stage-wrap"><MatchStage key={featured.id} match={featured} players={players} compact={compact}/></div>}
  {!compact&&<div className="mc-list-bar"><div className="mc-view-filter" aria-label="Filter match status">{['all','upcoming','results'].map(value=><button key={value} aria-pressed={view===value} onClick={()=>set('view',value)}>{value==='all'?'All matches':value==='upcoming'?'Upcoming':'Results'}</button>)}</div><p role="status">{rows.length} {rows.length===1?'match':'matches'}{season==='3'?' · UAE time (UTC+4)':''}</p></div>}
  {compact&&secondary.length>0&&<div className="mc-fixtures-heading"><h3>{upcoming.length?'Coming up':'From the archive'}</h3><span>Season {season}</span></div>}
  {shown.length?compact
   ?<div className="mc-home-grid" key={season+team}>{secondary.map((match,index)=><Fixture key={match.id} match={match} compact motionMode={motionMode} index={index}/>)}</div>
   :<div className="mc-fixture-list" key={season+team+date+view+query}>{groups.map(group=><section className="mc-date-group" key={group.date} aria-label={group.date+' fixtures'}><h2>{group.date}<span>{group.day}</span></h2><div>{group.matches.map((match,index)=><Fixture key={match.id} match={match} motionMode={motionMode} index={index}/>)}</div></section>)}</div>
   :<div className="mc-empty"><h2>{view==='results'?'Results will appear here.':'No matches found.'}</h2><p>{view==='results'?'Verified results are not available for this selection.':'Try another team, date or search.'}</p><button onClick={reset}>Reset filters <ArrowRight/></button></div>}
  {season!=='3'&&<p className="mc-footnote">Published fixture archive. Scores and results are shown only when verified.</p>}
 </section>;
}
