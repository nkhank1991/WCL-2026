import {useState,useRef,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion,AnimatePresence} from 'motion/react';
import {ArrowUpRight,CalendarBlank,ArrowLeft,ArrowRight} from '@phosphor-icons/react';
import {SignatureSweep,FixtureStrip,useBroadcastMotion,broadcastEase} from './BroadcastGraphics.jsx';
import {teams,teamName,fixtureState} from './match-model.jsx';
import {useTeams} from './cms/SiteContent.jsx';

const dayKey=match=>match.startsAt?.slice(0,10);
const dateLabel=day=>new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'2-digit',month:'long',timeZone:'Asia/Dubai'}).format(new Date(day+'T12:00:00+04:00'));

export function HeroSchedule({matches=[]}){
 const logos=Object.fromEntries(useTeams().map(t=>[t.id,t.logo]));
 const fixtures=matches.filter(m=>Number(m.season)===3&&Number.isFinite(Date.parse(m.startsAt))).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));
 const days=[...new Set(fixtures.map(dayKey))];
 const [selected,setSelected]=useState(null);
 const day=days.includes(selected)?selected:days[0];
 const {spatial}=useBroadcastMotion();
 const dayRail=useRef(null);
 useEffect(()=>{const rail=dayRail.current,button=rail?.querySelector('[aria-pressed="true"]');if(!rail||!button)return;const left=button.offsetLeft-rail.offsetLeft;if(left<rail.scrollLeft||left+button.offsetWidth>rail.scrollLeft+rail.clientWidth)rail.scrollTo?.({left:Math.max(0,left-rail.clientWidth/2+button.offsetWidth/2),behavior:spatial?'smooth':'instant'})},[day,spatial]);
 const dayMatches=fixtures.filter(m=>dayKey(m)===day);
 function moveDay(direction){setSelected(days[Math.max(0,Math.min(days.length-1,days.indexOf(day)+direction))])}
 return <div className="hero-schedule" data-hero-interactive="true" aria-label="Season 3 schedule cards">
  <SignatureSweep/>
  <div className="hero-schedule-heading"><span><CalendarBlank/> OCTOBER 2026</span><small>UAE time · UTC+4</small></div>
  {days.length?<>
   <div className="hero-schedule-days" ref={dayRail} role="group" aria-label="Choose a match day">{days.map(date=><button key={date} aria-pressed={date===day} aria-label={dateLabel(date)} onClick={()=>setSelected(date)}><small>OCT</small><strong>{date.slice(-2)}</strong></button>)}</div>
   <div className="hero-schedule-day-heading"><h2 className="hero-schedule-date">{dateLabel(day)}<small>{dayMatches.length} {dayMatches.length===1?'match':'matches'}</small></h2><div className="rail-controls"><button aria-label="Previous match day" disabled={day===days[0]} onClick={()=>moveDay(-1)}><ArrowLeft/></button><button aria-label="Next match day" disabled={day===days.at(-1)} onClick={()=>moveDay(1)}><ArrowRight/></button></div></div>
   <AnimatePresence mode="wait" initial={false}><motion.div key={day} className="hero-day-fixtures" initial={spatial?{opacity:0,x:-10}:{opacity:0}} animate={{opacity:1,x:0}} exit={{opacity:0,transition:{duration:.1}}} transition={{duration:spatial?.3:.15,ease:broadcastEase}}>
    {dayMatches.map(match=><Link key={match.id} className="hero-fixture-card" to={'/matches/'+match.id} style={{'--fixture-color':teams.find(t=>t.id===match.teams?.[0])?.color||'#ff823a','--opponent-color':teams.find(t=>t.id===match.teams?.[1])?.color||'#ff823a'}}>
     <div className="hero-fixture-meta"><span>{match.label}</span><span>{fixtureState(match)}</span></div>
     <div className="hero-fixture-sides">{[0,1].map(index=>{const team=match.teams?.[index];return <span key={index}>{logos[team]?<img src={logos[team]} alt=""/>:<span className="hero-fixture-code" aria-hidden="true">{teams.find(t=>t.id===team)?.short||'TBC'}</span>}<strong>{teamName(team)}</strong></span>})}<b aria-hidden="true">×</b></div>
     <FixtureStrip match={match} compact/>
     <div className="hero-fixture-action">Match details <ArrowUpRight/></div>
    </Link>)}
   </motion.div></AnimatePresence>
  </>:<p className="hero-schedule-empty">The Season 3 fixture list will appear here when published.</p>}
 </div>;
}
