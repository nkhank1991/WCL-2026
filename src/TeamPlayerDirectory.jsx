import {useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {AnimatePresence,motion,useIsPresent} from 'motion/react';
import {CaretDown,ArrowUpRight,ArrowUp} from '@phosphor-icons/react';
import {PlayerCard} from './PlayerCard.jsx';
import {validSeason} from './match-model.jsx';
import {useBroadcastMotion,broadcastEase} from './BroadcastGraphics.jsx';
import logos from './data/team-logos.json';

function RosterPanel({team,players,season,close}){
 const [role,setRole]=useState('all');
 const present=useIsPresent(),{spatial}=useBroadcastMotion();
 const roles=[...new Set(players.map(player=>player.role))].sort();
 const shown=players.filter(player=>role==='all'||player.role===role);
 return <motion.div id={'roster-'+team.id} role="region" aria-labelledby={'team-toggle-'+team.id}
  aria-hidden={!present} inert={!present} className="team-roster-panel"
  initial={spatial?{height:0,opacity:0}:{opacity:0}}
  animate={{height:'auto',opacity:1}} exit={spatial?{height:0,opacity:0}:{opacity:0}}
  transition={{duration:spatial?.32:.12,ease:broadcastEase}}>
  <div className="team-roster-content">
   <div className="team-roster-toolbar"><p role="status">{shown.length} {shown.length===1?'player':'players'} · Season {season}</p>
    {!!players.length&&<label className="select-label">Role<select aria-label={team.name+' player role'} value={role} onChange={event=>setRole(event.target.value)}><option value="all">All roles</option>{roles.map(value=><option key={value}>{value}</option>)}</select></label>}
    <Link className="text-link" to={'/teams/'+team.id+'?season='+season}>Team hub <ArrowUpRight/></Link>
   </div>
   {shown.length?<div className="players-grid">{shown.map(player=><PlayerCard key={player.id} player={player}/>)}</div>:<p className="roster-empty">{season==='3'?'No players are published for this selection.':'The player list for this archive season is not available yet.'}</p>}
   {!!shown.length&&<button className="roster-back text-link" onClick={close}><ArrowUp/> Back to teams</button>}
  </div>
 </motion.div>;
}

export function TeamPlayerDirectory({teams,players}){
 const [params,setParams]=useSearchParams();
 const season=validSeason(params.get('season'));
 const open=teams.some(team=>team.id===params.get('team'))?params.get('team'):null;
 const available=season==='3'?players:[];
 function choose(id){
  const next=new URLSearchParams(params);
  next.delete('q');next.delete('role');
  if(id)next.set('team',id);else next.delete('team');
  setParams(next,{replace:true});
 }
 function close(id){
  const button=document.getElementById('team-toggle-'+id);
  choose(null);
  button?.focus({preventScroll:true});
  // Explicit return action, not an automatic jump on a filter or expansion.
  button?.scrollIntoView({block:'start',behavior:'instant'});
 }
 function keyNavigation(event,index){
  const next=event.key==='ArrowDown'?(index+1)%teams.length:event.key==='ArrowUp'?(index+teams.length-1)%teams.length:event.key==='Home'?0:event.key==='End'?teams.length-1:null;
  if(next!==null){event.preventDefault();document.getElementById('team-toggle-'+teams[next].id)?.focus();}
 }
 return <section className="wrap section team-player-directory" aria-label="Players by team">
  <div className="team-roster-intro"><div><p><strong>{available.length}</strong> players · <strong>7</strong> teams</p><span>Choose a team to explore its player list.</span></div>
   <label className="select-label">Season<select aria-label="Season" value={season} onChange={event=>setParams({season:event.target.value},{replace:true})}><option value="3">Season 3 · 2026</option><option value="2">Season 2 · 2025</option><option value="1">Season 1 · 2024</option></select></label>
  </div>
  <div className="team-roster-list">{teams.map((team,index)=>{
   const roster=available.filter(player=>player.team===team.id),expanded=open===team.id;
   return <article className={'team-roster-card'+(expanded?' is-open':'')} key={team.id} style={{'--club':team.color}}>
    <h2 className="team-roster-heading"><button id={'team-toggle-'+team.id} className="team-roster-toggle" aria-expanded={expanded} aria-controls={'roster-'+team.id} onClick={()=>choose(expanded?null:team.id)} onKeyDown={event=>keyNavigation(event,index)}>
     <img src={logos[team.id]} alt="" width="64" height="72"/>
     <span className="team-roster-name">{team.name}<small>Champions</small></span>
     <span className="team-roster-count">{season==='3'?roster.length+' players':'Season '+season+' archive'}</span>
     <span className="team-roster-action">{expanded?'Close players':'Explore players'}<CaretDown/></span>
    </button></h2>
    <AnimatePresence initial={false}>{expanded&&<RosterPanel key={team.id+season} team={team} players={roster} season={season} close={()=>close(team.id)}/>}</AnimatePresence>
   </article>;
  })}</div>
  <p className="source-note">Season player lists and match squads are announced separately.</p>
 </section>;
}
