import {deliveryImage} from './media.js';
import {useState,useRef,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {AnimatePresence,motion} from 'motion/react';
import {ArrowRight,ArrowLeft,CaretDown} from '@phosphor-icons/react';
import {useCompactScreen} from './useCompactScreen.js';
import {useFilmMotion} from './Cinematic.jsx';
import {season3Players} from './season3-roster.js';
import {RivalryStage} from './RivalryStage.jsx';
import {leadership,leadershipStory,leadershipHeroImage} from './leadership-data.js';
import {HeroSchedule} from './HeroSchedule.jsx';
import {HeroTeamPlayers} from './HeroTeamPlayers.jsx';
import {SignatureSweep,useBroadcastMotion,broadcastEase} from './BroadcastGraphics.jsx';
import {BroadcastVideo} from './BroadcastVideo.jsx';


import storyData from './data/hero-stories.json';
import {usePublished} from './PublishedContent.jsx';
import additions from './data/hero-additions.json';
import {silhouetteFor} from './hero-silhouettes.js';
import {HeroSubject} from './HeroSubject.jsx';
export const features=structuredClone(storyData);

// Editorial mobile summaries, not clipped text. Full copy stays available on tap.
const mobileStoryCopy={
 season:'Seven nations. Cricket’s great stories return to the UAE.',
 'india-pakistan':'Yuvraj Singh. Shahid Afridi. Explore the players behind the rivalry.',
 'england-australia':'Explore England and Australia’s WCL lineups.',
 'south-africa-australia':'AB de Villiers. David Warner. Two nations, one stage.',
 legacy:'Chris Gayle. West Indies Champions. Revisit the legacy.',
 trophy:'Seven nations chase one trophy. Explore the 24-match schedule.',
 schedule:'Pakistan face Bangladesh on opening day. The final awaits on 18 October.',
 'new-stars':'Meet the five stars featured in the Season 3 campaign.',
 bangladesh:'Meet Bangladesh Champions ahead of their opening match with Pakistan.',
 'about-wcl':'Cricket’s celebrated names return in their national colours.',
 'ensemble-2026':'Meet the legends of the UAE chapter.',
 'film-story':'South Africa × West Indies. Revisit the 2025 highlights.',
 'ajay-devgn':'Cinema meets cricket with WCL Co-Founder Ajay Devgn.',
 'harshit-tomar':'Meet Harshit Tomar, the Founder & CEO behind WCL.'
};

features.push(...leadership.map(leadershipStory));
// Count the supplied, unambiguous roster entries; never present pending slots as confirmed players.
const pairTeams={'india-pakistan':['india','pakistan'],'england-australia':['england','australia'],'south-africa-australia':['south-africa','australia']};
for(const feature of features){
 const teams=pairTeams[feature.id];
 if(teams)feature.facts=teams.map((team,i)=>[String(season3Players.filter(p=>p.team===team).length),`${feature.players[i].team} · listed players`]).concat([['2026','Supplied Season 3 roster']]);
 if(feature.id==='legacy')feature.facts=[['14','West Indies · listed players'],[String(season3Players.length),'Listed across all nations'],['WCL TV','Highlights archive']];
}

function StoryFilm({item,onPlay}){return <div className="hero-film"><SignatureSweep/><BroadcastVideo videoId={item.videoId} title={item.alt} poster={item.image} onPlay={onPlay}/><small>Official WCL highlights · 2025 archive</small></div>}
features.forEach((item,index)=>{item.order=index});
features.push(...additions);
features.sort((a,b)=>a.order-b.order);
export function SportsHero({matches=[],players=season3Players}){
 const slides=usePublished('hero',features).filter(item=>item.visible!==false&&item.id!=='uae');
 const people=usePublished('leadership',leadership);
 const [activeIndex,setActive]=useState(0);
 const active=Math.min(activeIndex,Math.max(0,slides.length-1));
 const touchStart=useRef(null);
 const {enabled}=useFilmMotion();
 const {spatial:motionSpatial}=useBroadcastMotion();
 const compact=useCompactScreen();
 const spatial=motionSpatial&&!compact;
 const heroRef=useRef(null);
 const [paused,setPaused]=useState(false);
 const [hovered,setHovered]=useState(false);
 const [focused,setFocused]=useState(false);
 const [inView,setInView]=useState(()=>typeof IntersectionObserver==='undefined');
 const [pageVisible,setPageVisible]=useState(()=>typeof document==='undefined'||!document.hidden);
 const [filmPlaying,setFilmPlaying]=useState(false);
 const [expandedStory,setExpandedStory]=useState(null);
 const item=slides[active];
 const mobileBrief=item&&(item.mobileCopy||mobileStoryCopy[item.id]);
 const storyExpanded=expandedStory===item?.id;
 const leadershipPhoto=item&&leadership.some(person=>person.id===item.id);
 const teamCards=item?.id==='bangladesh';
 const silhouette=item&&!teamCards&&!leadershipPhoto&&silhouetteFor(item);
 const refinedGroup=item?.id==='new-stars'&&item.image==='/assets/season3-updates/new-stars.webp';
 const rotating=enabled&&!compact&&!paused&&!hovered&&!focused&&inView&&pageVisible&&!filmPlaying&&!storyExpanded&&slides.length>1;
 useEffect(()=>{const update=()=>setPageVisible(!document.hidden);document.addEventListener('visibilitychange',update);return()=>document.removeEventListener('visibilitychange',update)},[]);
 useEffect(()=>{if(typeof IntersectionObserver==='undefined')return;const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting&&entry.intersectionRatio>=.2),{threshold:.2});if(heroRef.current)observer.observe(heroRef.current);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!rotating)return;const timer=setTimeout(()=>setActive((active+1)%slides.length),4000);return()=>clearTimeout(timer)},[active,item?.id,slides.length,rotating]);
 function select(index){if(!slides.length)return;setFilmPlaying(false);setActive((index+slides.length)%slides.length)}
 function keyboard(e){if(e.target.matches('input,select,textarea,iframe')||e.target.closest('[data-hero-interactive]'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(active+(e.key==='ArrowRight'?1:-1));}else if(e.code==='Space'&&e.target===e.currentTarget){e.preventDefault();setPaused(value=>!value)}}
 function touchEnd(e){const start=touchStart.current;touchStart.current=null;if(!start)return;const t=e.changedTouches[0];if(Math.abs(t.clientX-start.x)>65&&Math.abs(t.clientY-start.y)<60)select(active+(t.clientX<start.x?1:-1));}
 if(!item)return null;
 return <section ref={heroRef} className="wcl-story-hero" aria-label="WCL featured stories" aria-roledescription="carousel" onKeyDown={keyboard} tabIndex={0} onPointerEnter={e=>{if(e.pointerType!=='touch')setHovered(true)}} onPointerLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}>
  {!compact&&<button className="hero-access-button" onClick={()=>setPaused(value=>!value)}>{paused?'Resume automatic stories':'Pause automatic stories'}</button>}
  <button className="hero-access-button" onClick={()=>select(active-1)}>Previous story</button>
  <button className="hero-access-button" onClick={()=>select(active+1)}>Next story</button>
  <div className="story-season-bar"><span className="uae-season-ribbon"><i aria-hidden="true"/>UAE · SEASON 3</span><strong>03–18 OCTOBER 2026</strong></div>
  <div className="story-stage" onPointerDown={e=>{if(e.target.closest('[data-hero-interactive]'))setPaused(true)}} onTouchStart={e=>{if(e.target.closest('[data-hero-interactive]')){touchStart.current=null;return}const t=e.touches[0];touchStart.current={x:t.clientX,y:t.clientY}}} onTouchEnd={touchEnd} aria-live={rotating?'off':'polite'} aria-atomic="true">
   <AnimatePresence mode="wait" initial={false}>
    <motion.div className={'story-scene story-'+item.id+(silhouette?' hero-subject-scene':'')+(silhouette?.group?' hero-group-scene':'')+(refinedGroup?' hero-refined-scene':'')+(teamCards?' hero-roster-scene':'')+(leadershipPhoto?' hero-leadership-scene':'')} key={item.id} role="group" aria-roledescription="slide" aria-label={`${active+1} of ${slides.length}: ${item.label}`} initial={enabled?{opacity:0}:false} animate={{opacity:1}} exit={{opacity:0,transition:{duration:enabled?.08:.1}}} transition={{duration:enabled?.45:.15,ease:broadcastEase}}>
     <div className="hero-story-copy" data-mobile-expanded={storyExpanded} data-mobile-summary={!!mobileBrief}>
      <p className="story-kicker"><span/>{item.tag}</p>
      {item.chapter&&<p className="hero-story-chapter">{item.chapter}</p>}
      <h1 aria-label={item.title+' '+item.line}><span className="hero-title-mask"><motion.span initial={spatial?{y:'105%',opacity:0}:{opacity:0}} animate={{y:0,opacity:1}} transition={{duration:spatial?.32:.15,delay:spatial?.1:0,ease:broadcastEase}}>{item.title}</motion.span></span>{' '}<span className="hero-title-mask"><motion.span initial={spatial?{y:'105%',opacity:0}:{opacity:0}} animate={{y:0,opacity:1}} transition={{duration:spatial?.32:.15,delay:spatial?.15:0,ease:broadcastEase}}>{item.line}</motion.span></span></h1>
      {item.role&&<p className="hero-story-role">{item.role}</p>}
      {mobileBrief&&<p className="story-description story-description-mobile">{mobileBrief}</p>}
      <p className="story-description story-description-full" id={'story-copy-'+item.id}>{item.copy}</p>
      {item.supportingCopy&&<p className="story-description hero-supporting-copy">{item.supportingCopy}</p>}
      <div className="story-actions"><Link className="story-primary" to={item.to}>{item.action}<ArrowRight/></Link><Link className="story-secondary" to={item.secondaryTo}>{item.secondary}<ArrowRight/></Link></div>
      <motion.dl className="story-facts" id={'story-facts-'+item.id} initial={spatial?{opacity:0,x:-8}:{opacity:0}} animate={{opacity:1,x:0}} transition={{duration:spatial?.25:.15,delay:spatial?.22:0,ease:broadcastEase}}>{item.facts.map(([value,label])=><div key={label}><dt data-compact={String(value).length>7||undefined}>{value}</dt><dd>{label}</dd></div>)}</motion.dl>
      {item.source&&<a className="hero-biography-source" href={item.source} target="_blank" rel="noreferrer">{item.note||'Biography & achievement source'} <ArrowRight/></a>}
     </div>
     {item.id==='schedule'?<HeroSchedule matches={matches}/>:teamCards?<HeroTeamPlayers players={players}/>:leadershipPhoto?<figure className="hero-leadership-photo"><SignatureSweep/><img src={leadershipHeroImage(item)} alt={item.alt||item.label+' — official WCL photograph'} width="700" height="470"/><figcaption><span>{item.role}</span><strong>{item.label}</strong><small>Official WCL photography</small></figcaption></figure>:item.id==='about-wcl'?<div className="hero-about-visual"><SignatureSweep/><img className="hero-about-ensemble" src={deliveryImage(item.image)} alt={item.alt}/><div className="hero-about-team"><p className="story-kicker">THE PEOPLE BEHIND THE CHAMPIONSHIP</p><h2>Building the next chapter.</h2><h3>Team behind WCL</h3><div className="hero-leadership-links">{people.map(person=>{const index=slides.findIndex(slide=>slide.id===person.id);const content=<><img src={leadershipHeroImage(person)} alt=""/><span><strong>{person.name}</strong><small>{person.role}</small></span><ArrowRight/></>;return index>=0?<button key={person.id} onClick={()=>select(index)} aria-label={'Read the '+person.name+' hero story'}>{content}</button>:<Link key={person.id} to={'/about#'+person.id}>{content}</Link>})}</div><p className="hero-leadership-credit">Leadership information as published on the official WCL website.</p></div></div>:item.videoId?<StoryFilm item={item} onPlay={()=>setFilmPlaying(true)}/>:item.id==='season'&&!item.image?<RivalryStage/>:<div className={'story-visual '+(item.players?.length?'story-portraits':'story-poster')}><SignatureSweep/>
      {item.players?.length?item.players.map(p=><figure key={p.name}><img src={deliveryImage(p.image)} alt={`${p.name} in ${p.team} campaign jersey`} width="1122" height="1402"/><figcaption><strong>{p.name}</strong><small>{p.team} Champions</small></figcaption></figure>):refinedGroup?<img className="hero-refined-photo" src="/assets/season3-updates/new-stars-refined-v2.webp" alt="Refined campaign composition of Andre Russell, Shakib Al Hasan, David Warner, James Anderson and Faf du Plessis" width="1536" height="1024"/>:silhouette?<HeroSubject item={item} silhouette={silhouette}/>:<img src={deliveryImage(item.image)} alt={item.alt} fetchPriority={active===0?'high':'auto'}/>}
      {item.players?.length===2&&<span className="story-versus" aria-hidden="true">×</span>}
     </div>}
    </motion.div>
   </AnimatePresence>
  </div>
  <div className="mobile-story-browse" role="group" aria-label="Browse WCL stories">{mobileBrief&&<button className="mobile-story-toggle" data-hero-interactive aria-expanded={storyExpanded} aria-controls={'story-copy-'+item.id+' story-facts-'+item.id} onClick={()=>{setExpandedStory(storyExpanded?null:item.id);setPaused(true)}}>{storyExpanded?'Less detail':'Story details'}<CaretDown aria-hidden="true"/></button>}<span>{String(active+1).padStart(2,'0')} <span aria-hidden="true">/</span> {String(slides.length).padStart(2,'0')}</span><button aria-label="Previous WCL story" onClick={()=>select(active-1)}><ArrowLeft/></button><button aria-label="Next WCL story" onClick={()=>select(active+1)}><ArrowRight/></button></div>
 </section>
}
