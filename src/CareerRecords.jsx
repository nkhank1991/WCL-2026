import {deliveryImage} from './media.js';
import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {animate,useInView} from 'motion/react';
import {ArrowUpRight,ArrowRight,CaretDown} from '@phosphor-icons/react';
import {Reveal,useFilmMotion} from './Cinematic.jsx';

// Historical career achievements, not WCL statistics. Sources checked 10 September 2026.
export const careerRecords=[
 {id:'yuvraj-singh',name:'Yuvraj Singh',team:'India',image:'/assets/india.png',value:362,unit:'RUNS · 2011 WORLD CUP',year:'2011',title:'A tournament to remember.',copy:'362 runs. 15 wickets. Yuvraj was named Player of the Tournament at the 2011 ICC Cricket World Cup.',source:'https://www.icc-cricket.com/news/yuvraj-named-as-icc-cwc-2011-player-of-the-tournament'},
 {id:'ab-de-villiers',name:'AB de Villiers',team:'South Africa',image:'/assets/south-africa.png',value:31,unit:'BALLS TO AN ODI CENTURY',year:'2015',title:'A hundred in 31 balls.',copy:'Against West Indies in Johannesburg, de Villiers reached his century in just 31 balls, finishing on 149 from 44.',source:'https://www.icc-cricket.com/news/record-breakers-on-display-at-cwc15'},
 {id:'chris-gayle',name:'Chris Gayle',team:'West Indies',image:'/assets/chris-gayle-campaign.png',value:215,unit:'RUNS · 2015 WORLD CUP',year:'2015',title:'A World Cup first.',copy:'Gayle made 215 from 147 balls against Zimbabwe: the first double-century at a men’s Cricket World Cup.',source:'https://www.icc-cricket.com/news/2015-top-15-moments-no-10-chris-gayle-makes-1st-ever-world-cup-double-century'}
];

function StatNumber({value}){
 const ref=useRef(null);const played=useRef(false);const visible=useInView(ref,{once:true,amount:.5});const {enabled}=useFilmMotion();
 useEffect(()=>{
  if(!visible||played.current||!enabled){if(ref.current)ref.current.textContent=String(value);return;}
  played.current=true;
  const controls=animate(0,value,{duration:.75,ease:[.22,1,.36,1],onUpdate:n=>{if(ref.current)ref.current.textContent=String(Math.round(n));}});
  return()=>{controls.stop();if(ref.current)ref.current.textContent=String(value);};
 },[visible,enabled,value]);
 return <strong className="record-number" aria-label={String(value)}><span ref={ref} aria-hidden="true">{value}</span></strong>;
}

function CareerRecord({record:r,index:i}) {
 const [expanded,setExpanded]=useState(false);
 return <Reveal className={'record-card record-'+i} delay={i*.06}>
  <div className="record-image"><img src={deliveryImage(r.image)} alt={r.name+' in supplied '+r.team+' campaign kit'} loading="lazy" decoding="async" width="1122" height="1402"/><span>{r.team} / {r.year}</span></div>
  <div className="record-content" data-expanded={expanded}><p className="record-player">{r.name}</p><StatNumber value={r.value}/><p className="record-unit">{r.unit}</p><h3>{r.title}</h3><button className="mobile-record-toggle" aria-expanded={expanded} aria-controls={r.id+'-milestone '+r.id+'-source'} onClick={()=>setExpanded(value=>!value)}>{expanded?'Less detail':'The story'}<CaretDown aria-hidden="true"/></button><p className="record-detail" id={r.id+'-milestone'}>{r.copy}</p><a id={r.id+'-source'} href={r.source} target="_blank" rel="noreferrer" className="record-source">Read the ICC source <ArrowUpRight/></a></div>
 </Reveal>;
}
export function CareerRecords(){return <section className="career-section" id="career-records" aria-labelledby="career-title"><div className="wrap section">
 <Reveal className="section-title"><div><p className="kicker">THE NUMBERS. THE MEMORIES.</p><h2 id="career-title">Greatness, on the record.</h2></div><p className="record-context">Career milestones.<br/>Separate from WCL tournament statistics.</p></Reveal>
 <div className="records-grid">{careerRecords.map((r,i)=><CareerRecord record={r} index={i} key={r.id}/>)}</div>
 </div></section>}

export function RivalryFeature(){return <section id="rivalries" className="rivalry-editorial wrap section" aria-labelledby="rivalry-title">
 <Reveal className="rivalry-poster"><img src="/assets/wcl-rivalry-approved.webp" width="1080" height="1350" alt="Supplied rivalry campaign featuring Yuvraj Singh and Shahid Afridi in India and Pakistan Champions jerseys" loading="lazy"/></Reveal>
 <Reveal className="rivalry-editorial-copy"><h2 id="rivalry-title">OLD RIVALRIES.<br/><span>NEW CHAPTERS.</span></h2><p className="rivalry-nations">INDIA <span>×</span> PAKISTAN</p><p className="rivalry-date">10 October 2026 · 19:30 UAE</p><div className="rivalry-links"><Link to="/matches/s3-match-14">View match <ArrowRight/></Link></div></Reveal>
 </section>}
