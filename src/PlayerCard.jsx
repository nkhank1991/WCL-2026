import {useState,useRef,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'motion/react';
import {ArrowUpRight,ArrowLeft,ArrowRight} from '@phosphor-icons/react';
import {useFilmMotion} from './Cinematic.jsx';
import {deliveryImage} from './media.js';
import {useTeams} from './cms/SiteContent.jsx';
import {useBroadcastMotion,broadcastEase} from './BroadcastGraphics.jsx';
const MotionLink=motion.create(Link);

export function PlayerCard({player}){
 const team=useTeams().find(t=>t.id===player.team);
 const [failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[player.image]);
 const {spatial}=useBroadcastMotion();
 const lowerThird=delay=>({hidden:{opacity:0,x:spatial?-8:0},shown:{opacity:1,x:0,transition:{duration:spatial?.28:.15,delay:spatial?delay:0,ease:broadcastEase}}});
 return <motion.article layout={spatial?'position':false} initial="hidden" whileInView="shown" variants={lowerThird(0)} viewport={{once:true,amount:.12}} className="player-card player-profile-card" style={{'--club':team?.color||'#185bff'}}>
  <Link className="player-portrait-link" to={'/players/'+player.id} aria-label={'View '+player.name+' profile'}>
   <div className={'player-photo '+(player.portraitFraming==='campaign'?'player-photo-campaign':'')}>
    {!failed&&player.image?<img src={deliveryImage(player.image)} srcSet={player.portraitVariants?`${player.portraitVariants.card} 480w, ${player.portraitVariants.profile} 960w`:undefined} sizes="(max-width:700px) 70vw, (max-width:1100px) 32vw, 24vw" alt={player.name} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:<span className="portrait-unavailable">Portrait awaiting approval</span>}
    <span className="player-profile-arrow" aria-hidden="true"><ArrowUpRight/></span>
   </div>
   <div className="player-caption"><motion.h3 variants={lowerThird(.08)}>{player.name}</motion.h3><motion.small variants={lowerThird(.14)}>{player.role}</motion.small></div>
  </Link>
  {team&&<MotionLink variants={lowerThird(.18)} className="player-team-strip" to={'/teams/'+team.id+'?season=3'} aria-label={'Explore '+team.name+' Champions'}>{team.logo?<img src={team.logo} alt="" loading="lazy"/>:<span className="player-team-code" aria-hidden="true">{team.short}</span>}<span>{team.name}<small>Champions · Season 3</small></span><ArrowUpRight/></MotionLink>}
 </motion.article>;
}

export function PlayerRail({children,selection,label='Browse Season 3 players',description='Find a player. Explore their colours.'}){
 const rail=useRef(null),{enabled}=useFilmMotion();
 const [edges,setEdges]=useState({start:true,end:false});
 function update(){const el=rail.current;if(el)setEdges({start:el.scrollLeft<4,end:el.scrollLeft+el.clientWidth>=el.scrollWidth-4})}
 useEffect(()=>{const el=rail.current;if(!el)return;el.scrollLeft=0;update();const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(update):null;observer?.observe(el);return()=>observer?.disconnect()},[selection]);
 function move(direction){rail.current?.scrollBy({left:direction*rail.current.clientWidth*.8,behavior:enabled?'smooth':'instant'})}
 return <><div className="player-rail-heading"><p>{description}</p><div className="rail-controls"><button aria-label="Previous players" disabled={edges.start} onClick={()=>move(-1)}><ArrowLeft/></button><button aria-label="Next players" disabled={edges.end} onClick={()=>move(1)}><ArrowRight/></button></div></div><div className="players-grid home-player-grid" ref={rail} onScroll={update} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();event.stopPropagation();move(event.key==='ArrowRight'?1:-1)}}} tabIndex={0} aria-label={label}>{children}</div></>;
}
