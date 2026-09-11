import {useEffect,useState} from 'react';
import {motion} from 'motion/react';
import {CalendarBlank,MapPin} from '@phosphor-icons/react';
import {useFilmMotion} from './Cinematic.jsx';
import {venueLabel} from './match-model.jsx';

export const broadcastEase=[.22,1,.36,1];
export function useBroadcastMotion(){
 const {enabled}=useFilmMotion();
 const [compact,setCompact]=useState(()=>typeof matchMedia!=='undefined'&&matchMedia('(max-width:700px)').matches);
 useEffect(()=>{const media=window.matchMedia?.('(max-width:700px)');if(!media)return;const update=()=>setCompact(media.matches);update();media.addEventListener?.('change',update);return()=>media.removeEventListener?.('change',update)},[]);
 return {enabled,spatial:enabled&&!compact};
}

// One finite sweep, clipped to its visual. Never a page overlay or an ambient loop.
export function SignatureSweep(){
 const {spatial}=useBroadcastMotion();
 if(!spatial)return null;
 return <span className="broadcast-sweep" aria-hidden="true"><motion.i initial={{x:'-100%',opacity:0}} animate={{x:'0%',opacity:[0,1,1,0]}} transition={{duration:.55,ease:broadcastEase,times:[0,.1,.82,1]}}/></span>;
}

export function SectionRule(){
 const {spatial}=useBroadcastMotion();
 return <motion.span className="broadcast-section-rule" aria-hidden="true" initial={spatial?{scaleX:0,opacity:0}:{opacity:0}} whileInView={{scaleX:1,opacity:1}} viewport={{once:true}} transition={{duration:spatial?.3:.15,ease:broadcastEase}}/>;
}

export function FixtureStrip({match,compact=false}){
 const valid=Number.isFinite(Date.parse(match.startsAt));
 const when=valid?new Date(match.startsAt):null;
 const date=when?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',timeZone:'Asia/Dubai'}).format(when):match.date||'Date TBC';
 const time=when?new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Dubai'}).format(when):null;
 return <div className={'fixture-info-strip'+(compact?' compact':'')}>
  <span><CalendarBlank aria-hidden="true"/><time dateTime={valid?match.startsAt:undefined}>{date}</time>{time&&<strong>{time} <small>UAE</small></strong>}</span>
  <span className="fixture-info-venue"><MapPin aria-hidden="true"/>{venueLabel(match)}</span>
 </div>;
}

export function ScoreUpdate({value}){
 const {spatial}=useBroadcastMotion();
 return <b className="verified-score"><motion.span key={String(value)} initial={spatial?{opacity:0,y:5}:{opacity:0}} animate={{opacity:1,y:0}} transition={{duration:spatial?.25:.15,ease:broadcastEase}}>{value}</motion.span></b>;
}
