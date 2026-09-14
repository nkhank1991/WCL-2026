import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {motion,AnimatePresence} from 'motion/react';
import {ArrowRight,MapPin,CaretDown} from '@phosphor-icons/react';
import {teams,teamName,fixtureState,matchMoment,venueLabel} from './match-model.jsx';
import {liveSnapshot,chaseEquation,scoreFor,eligibleMoment} from './match-live.js';
import {useBroadcastMotion,broadcastEase} from './BroadcastGraphics.jsx';
import {useTeams} from './cms/SiteContent.jsx';
import {deliveryImage} from './media.js';
import './match-stage.css';

const labels={toss:'Toss',innings:'In progress',chase:'The chase','innings-break':'Innings break',result:'Result'};
function Identity({id}){
 const [failed,setFailed]=useState(false),team=useTeams().find(t=>t.id===id);
 return team?.logo&&!failed?<img className="ms-crest" src={team?.logo} alt="" onError={()=>setFailed(true)}/>:<span className="ms-crest-text" aria-hidden="true">{team?.short||'TBC'}</span>;
}
function useMoment(match){
 const event=eligibleMoment(match);
 const previous=useRef({matchId:match.id,eventId:event?.id});
 const [moment,setMoment]=useState(null);
 useEffect(()=>{
  // A visit is not a wicket. Only a fresh change in the connected snapshot reacts.
  if(previous.current.matchId!==match.id){previous.current={matchId:match.id,eventId:event?.id};setMoment(null);return}
  if(!event||previous.current.eventId===event.id)return;
  previous.current.eventId=event.id;
  if(document.visibilityState==='hidden')return;
  setMoment(event);
  const timer=setTimeout(()=>setMoment(null),2600);
  const hide=()=>{if(document.hidden)setMoment(null)};
  document.addEventListener('visibilitychange',hide);
  return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',hide)};
 },[match.id,event?.id]);
 return moment;
}
function Score({score,spatial}){
 return <div className={'ms-score'+(score?.long?' ms-score-long':'')}><span className="ms-score-mask"><motion.strong key={score?.value||'waiting'} initial={spatial?{y:12,opacity:.6}:false} animate={{y:0,opacity:1}} transition={{duration:.28,ease:broadcastEase}}>{score?.value||'—'}</motion.strong></span><small>{score?.overs?score.overs+' overs':score?'':'Score awaited'}</small></div>;
}
export function MatchStage({match,players=[],compact=false,detail=false}){
 const {spatial}=useBroadcastMotion(),state=fixtureState(match);
 const live=liveSnapshot(match),equation=chaseEquation(live),moment=useMoment(match);
 const current=state==='Live',result=state==='Result',scored=current||result;
 const first=teams.find(t=>t.id===match.teams[0]);
 const second=teams.find(t=>t.id===match.teams[1]);
 const date=match.startsAt&&Number.isFinite(Date.parse(match.startsAt))?new Date(match.startsAt):null;
 const archiveParts=String(match.date||'').split('·').map(part=>part.trim());
 const day=date?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',timeZone:'Asia/Dubai'}).format(date):archiveParts[0].replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+/, '');
 const time=date?new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Dubai'}).format(date):archiveParts[1]||match.time||null;
 const phase=current?'Live · '+(labels[live?.phase]||'Match'):result?'Result':state==='Scheduled'?'Up next':state;
 const person=moment?.playerId&&players.find(p=>p.id===moment.playerId&&match.teams.includes(p.team)&&Number(p.season||3)===Number(match.season));
 const requirement=result?match.result:equation?(equation.runs===0?'Target reached':equation.complete?'Innings complete':teamName(live.battingTeam)+' need '+equation.runs+' from '+equation.balls+' balls'):current?(
  live?.phase==='innings-break'?'Innings break':live?.phase==='toss'?live.toss||'Toss update awaited':live?.battingTeam?teamName(live.battingTeam)+' batting':'Scores will appear once verified.'
 ):state==='Scheduled'?null:state==='Archive'?null:state==='Postponed'?'A revised start will be announced.':'This fixture has been cancelled.';
 return <article className={'ms-stage ms-scorecard'+(compact?' ms-stage-home':'')} data-match-state={state.toLowerCase()} data-moment={moment?.type||'rest'} style={{'--ms-team':first?.color||'#185bff','--ms-opponent':second?.color||'#ff823a'}}>
  <header className="ms-topline"><span className={current?'ms-status ms-status-live':'ms-status'}>{phase}</span><span>Season {match.season}<i> / </i>{match.label}</span>{scored&&<span className="ms-date-line">{matchMoment(match)}</span>}</header>
  <div className={'ms-matchup'+(scored?' ms-matchup-scored':'')}>
   {spatial&&<motion.span aria-hidden="true" className="ms-intro-panel" initial={{x:'-102%'}} whileInView={{x:'102%'}} viewport={{once:true,amount:.3}} transition={{duration:.6,ease:broadcastEase}}/>}
   {[0,1].map(index=>{const id=match.teams[index],score=scoreFor(match,id,index);return <motion.div initial={spatial?{y:10,opacity:.65}:false} whileInView={spatial?{y:0,opacity:1}:undefined} animate={!spatial?{y:0,opacity:1}:undefined} viewport={{once:true}} transition={{duration:.4,delay:.08,ease:broadcastEase}} className={'ms-team ms-team-'+index+(score?.batting?' ms-batting':'')+(result&&match.winner===id?' ms-team-winner':'')} key={id||index}>
    <Link to={id?'/teams/'+id+'?season='+match.season:'/matches?season='+match.season} className="ms-team-name"><Identity id={id}/><span><h2>{id?teamName(id):'To be confirmed'}</h2><small>{id?'Champions':match.stage||'Knockout'}</small></span></Link>
    {scored&&<Score score={score} spatial={spatial}/>}
    {score?.batting&&current&&['innings','chase'].includes(live?.phase)&&<span className="ms-batting-label">Batting</span>}
   </motion.div>})}
   <div className="ms-middle">{scored?<span className="ms-versus">vs<small>{result?'Final score':live?.phase==='innings-break'?'Innings break':'In play'}</small></span>:<><span className="ms-kickoff-date">{day}</span>{time&&<span className="ms-kickoff-time">{time}{date&&<small>UAE time</small>}</span>}</>}</div>
  </div>
  {(requirement||moment)&&<div className="ms-story-strap">
   {moment&&spatial&&<motion.span className="ms-event-sweep" aria-hidden="true" key={moment.id} initial={{x:'-102%'}} animate={{x:'102%'}} transition={{duration:.65,ease:broadcastEase}}/>}
   <AnimatePresence initial={false} mode="wait"><motion.div className="ms-story-message" key={moment?.id||requirement} initial={spatial?{y:8,opacity:.6}:false} animate={{y:0,opacity:1}} exit={{opacity:0}} transition={{duration:.2,ease:broadcastEase}}>
    {person?.image&&<motion.img src={deliveryImage(person.image)} alt={person.name} initial={spatial?{rotateY:-8}:false} animate={{rotateY:0}} transition={{duration:.3}}/>}
    <div><p role="status">{moment?.title||requirement}</p>{moment?.detail?<small>{moment.detail}</small>:equation?.rate&&equation.runs>0&&!equation.complete?<small>Required rate {equation.rate} <span>·</span> Target {live.target}</small>:null}</div>
   </motion.div></AnimatePresence>
  </div>}
  {live&&<div className="ms-recent">{live.recentBalls.length>0&&<><span>Recent balls</span><ol aria-label="Last six published deliveries">{live.recentBalls.map(ball=><li key={ball.id} data-ball={ball.label} title={ball.summary||ball.over}>{ball.label}</li>)}</ol></>}{live.updatedAt&&<time dateTime={live.updatedAt}>Updated {new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Dubai'}).format(new Date(live.updatedAt))} UAE</time>}</div>}
  <footer className="ms-footer"><span><MapPin/>{venueLabel(match)}</span>{!detail?<Link className="ms-primary-link" to={'/matches/'+match.id}>{current?'Follow live':result?'View result':state==='Archive'?'Match details':'Match preview'} <ArrowRight/></Link>:state==='Scheduled'?<Link className="ms-primary-link" to={'/tickets?match='+match.id}>Plan your matchday <ArrowRight/></Link>:<span className="ms-source-label">{scored?'Verified match update':'Published fixture'}</span>}</footer>
 </article>;
}
export function MatchInsights({match,players=[],videos=[]}){
 const live=liveSnapshot(match),state=fixtureState(match);
 const people=(live?.players||[]).map(stats=>({stats,player:players.find(p=>p.id===stats.playerId&&p.team===stats.teamId&&match.teams.includes(p.team)&&Number(p.season||3)===Number(match.season))})).filter(p=>p.player);
 return <div className="ms-insights">
  {people.length>0&&<section className="ms-players"><div className="ms-section-heading"><h2>The players shaping it.</h2><span>{state==='Result'?'Match performances':live?.phase==='innings-break'?'Innings performances':'Current innings'}</span></div><div className="ms-player-line">{people.slice(0,3).map(({stats,player})=><Link key={player.id} to={'/players/'+player.id} className="ms-player"><div className="ms-player-photo">{player.image&&<img src={deliveryImage(player.image)} alt={player.name}/>}</div><div><small>{teamName(player.team)} · {stats.role==='batting'?(state==='Live'&&['innings','chase'].includes(live?.phase)?'At the crease':'Batting'):'Bowling'}</small><h3>{player.name}</h3><p>{stats.role==='batting'?<><strong>{stats.runs}{stats.striker?'*':''}</strong><span>from {stats.balls} balls</span></>:<><strong>{stats.wickets}/{stats.conceded}</strong><span>{stats.overs} overs</span></>}</p></div><ArrowRight/></Link>)}</div></section>}
  {live?.innings.length>0&&<details className="ms-disclosure"><summary>Innings details <CaretDown/></summary><div className="ms-innings">{live.innings.map(innings=><div key={innings.teamId}><strong>{teamName(innings.teamId)}</strong><span>{innings.runs}/{innings.wickets}</span><small>{innings.overs} overs</small></div>)}</div></details>}
  {videos.length>0&&<details className="ms-disclosure"><summary>Match highlights <CaretDown/></summary><div className="ms-highlight-links">{videos.map(video=><Link to={'/watch/'+video.id} key={video.id}>{video.thumbnail&&<img src={video.thumbnail} alt="" loading="lazy"/>}<span>{video.title}</span><ArrowRight/></Link>)}</div></details>}
  <details className="ms-disclosure"><summary>Match information <CaretDown/></summary><dl className="ms-match-information"><div><dt>Competition</dt><dd>WCL · Season {match.season}</dd></div><div><dt>When</dt><dd>{matchMoment(match)}</dd></div><div><dt>Venue</dt><dd>{venueLabel(match)}</dd></div><div><dt>Status</dt><dd>{state}</dd></div></dl></details>
  {match.scoreSource&&<a className="ms-score-source" href={match.scoreSource} target="_blank" rel="noopener noreferrer">Full scorecard on Cricbuzz <ArrowRight/></a>}
  <p className="ms-availability-note">{state==='Scheduled'?'Toss, playing XIs and live match updates will appear when confirmed.':state==='Archive'?'This archive contains the published fixture. A result or scorecard is shown only when verified.':!live&&!match.scoreSource?'Detailed live data is not connected for this match.':null}</p>
 </div>;
}
