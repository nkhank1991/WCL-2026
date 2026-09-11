import {useEffect,useId,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'motion/react';
import {ArrowLeft,ArrowRight,ArrowUpRight,InstagramLogo,Trophy} from '@phosphor-icons/react';
import {deliveryImage} from './media.js';
import {teamInstagram} from './SocialLinks.jsx';
import {broadcastEase,useBroadcastMotion} from './BroadcastGraphics.jsx';
import {captainAppointments,recordSources,teamRecord} from './team-records.js';

export function TeamRecord({id,season}) {
 const {spatial}=useBroadcastMotion(),record=teamRecord(id,season);
 return <motion.div className="tc-record" key={season} initial={spatial?{opacity:.25,y:7}:false} animate={{opacity:1,y:0}} transition={{duration:spatial?.32:0,ease:broadcastEase}}>
  <p className="tc-record-label">WCL {season} <span>· {2023+Number(season)} league stage</span></p>
  {record?<><dl className="tc-stats">{[['Played',record.played],['Won',record.wins],['Points',record.points]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{String(value).padStart(2,'0')}</dd></div>)}</dl>
   <p className="tc-record-detail">{record.losses} lost <span>·</span> {record.noResult} no result</p>
   <span className={'tc-finish'+(record.finish==='Champions'?' tc-winner':'')}>{record.finish==='Champions'&&<Trophy weight="fill"/>}{record.finish}</span>
  </>:<div className="tc-debut"><strong>A new chapter.</strong><p>WCL debut in Season 3.<br/>No Season {season} record.</p></div>}
 </motion.div>;
}

export function TeamCard({team,season,index=0}) {
 const {spatial}=useBroadcastMotion(),[failed,setFailed]=useState(false),[crestFailed,setCrestFailed]=useState(false);
 const appointment=captainAppointments[team.id],captain=appointment?.name===team.legend;
 return <motion.article className="tc-card" data-team={team.id} style={{'--tc-colour':team.color}}
  initial={spatial?{opacity:0,y:16}:false} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}}
  transition={{duration:.5,delay:spatial?Math.min(index%2,1)*.06:0,ease:broadcastEase}}>
  <Link to={'/teams/'+team.id} className="tc-portrait" aria-label={team.name+' Champions — explore the team'}>
   {!failed?<img src={deliveryImage(team.image)} alt={team.legend+' in '+team.name+' Champions campaign kit'} loading="lazy" onError={()=>setFailed(true)}/>:<span className="tc-photo-unavailable">Portrait unavailable</span>}
   <div className="tc-player"><span>{captain?'Captain · Season 3':'Featured legend'}</span><strong>{team.legend}</strong></div>
  </Link>
  <div className="tc-body">
   <div className="tc-identity"><span className="tc-code">{team.short}</span>{team.logo&&!crestFailed?<img src={team.logo} alt={team.name+' Champions crest'} onError={()=>setCrestFailed(true)}/>:null}</div>
   <h3><Link to={'/teams/'+team.id}>{team.name}{' '}<span>Champions</span></Link></h3>
   <TeamRecord id={team.id} season={season}/>
   <div className="tc-actions"><Link to={'/teams/'+team.id} aria-label={'Explore '+team.name+' Champions'}>Explore team <ArrowRight/></Link><a href={teamInstagram[team.id]} target="_blank" rel="noopener noreferrer" aria-label={team.name+' Champions on Instagram (opens in a new tab)'}><InstagramLogo size={19}/></a></div>
  </div>
 </motion.article>;
}

export function TeamShowcase({teams,rail=false}) {
 const [season,setSeason]=useState('2'),[position,setPosition]=useState({start:true,end:false});
 const {spatial}=useBroadcastMotion(),track=useRef(null),id=useId();
 useEffect(()=>{
  if(!rail)return;
  const el=track.current;if(!el)return;
  const update=()=>setPosition({start:el.scrollLeft<4,end:el.scrollLeft+el.clientWidth>=el.scrollWidth-4});
  update();el.addEventListener('scroll',update,{passive:true});
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(update):null;
  observer?.observe(el);window.addEventListener('resize',update);
  return()=>{el.removeEventListener('scroll',update);observer?.disconnect();window.removeEventListener('resize',update)};
 },[rail]);
 function browse(direction) {
  const el=track.current,card=el?.querySelector('.tc-card');if(!el||!card)return;
  const gap=parseFloat(getComputedStyle(el).columnGap)||0;
  el.scrollBy({left:direction*(card.getBoundingClientRect().width+gap),behavior:spatial?'smooth':'instant'});
 }
 return <div className={'tc-showcase'+(rail?' tc-showcase-rail':'')}>
  <div className="tc-toolbar"><div><p>Two seasons. Seven identities.</p><span>Explore the teams. Revisit their records.</span></div>
   <div className="tc-controls"><div className="tc-season" role="group" aria-label="Team record season">{['1','2'].map(value=><button key={value} onClick={()=>setSeason(value)} aria-label={'WCL '+value+' '+(2023+Number(value))} aria-pressed={season===value} aria-controls={id}>WCL {value}{' '}<span>{2023+Number(value)}</span></button>)}</div>
   {rail&&<div className="tc-browse"><button onClick={()=>browse(-1)} disabled={position.start} aria-controls={id} aria-label="Previous teams"><ArrowLeft/></button><button onClick={()=>browse(1)} disabled={position.end} aria-controls={id} aria-label="Next teams"><ArrowRight/></button></div>}</div>
  </div>
  <div ref={track} id={id} className={rail?'tc-track':'tc-grid'} aria-label="WCL teams" tabIndex={rail?0:undefined}>{teams.map((team,index)=><TeamCard key={team.id} team={team} season={season} index={index}/>)}</div>
  <div className="tc-footnote"><p>Team statistics are league-stage only. Portraits show the Season 3 campaign.</p><a href={recordSources[season]} target="_blank" rel="noopener noreferrer">Record source <ArrowUpRight size={13}/></a></div>
 </div>;
}
