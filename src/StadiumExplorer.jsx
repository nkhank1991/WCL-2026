import {useState} from 'react';
import {motion} from 'motion/react';
import {SectionRule,useBroadcastMotion,broadcastEase} from './BroadcastGraphics.jsx';
import {MapPin,ArrowUpRight,Play,X} from '@phosphor-icons/react';

export const stadiums=[
 {id:'dubai',name:'Dubai International Cricket Stadium',city:'Dubai Sports City',address:'Dubai Sports City · Sheikh Mohammed Bin Zayed Road · Dubai',video:'R6LEJC0r3Qc',credit:'Royal Challengers Bengaluru · 2014 venue tour',source:'https://www.dsc.ae/contact_details/stadium-and-events/',map:'Dubai International Cricket Stadium, Dubai Sports City, United Arab Emirates'},
 {id:'sharjah',name:'Sharjah Cricket Stadium',city:'Sharjah',address:'Second Industrial Street · Industrial Area 5 · Sharjah',video:'JGGhTGX7xhE',credit:'Sharjah Cricket Stadium · 2020 venue film',source:'https://sharjahcricket.ae/contact-us',map:'Sharjah Cricket Stadium, Industrial Area 5, Sharjah, United Arab Emirates'}
];
export function StadiumExplorer(){
 const [selected,setSelected]=useState('dubai'),[mode,setMode]=useState(null);
 const {spatial}=useBroadcastMotion();
 const venue=stadiums.find(s=>s.id===selected);
 return <section className="stadium-explorer" aria-labelledby="stadium-title">
  <div className="section-title"><div><p className="kicker broadcast-kicker"><SectionRule/>EXPLORE THE GROUNDS</p><h2 id="stadium-title">Before the first ball.</h2></div><span className="stadium-allocation">Season 3 stadium allocations pending</span></div>
  <div className="stadium-layout"><div className="stadium-choices">{stadiums.map(s=><button className={'stadium-choice '+(selected===s.id?'selected':'')} key={s.id} aria-pressed={selected===s.id} aria-controls="stadium-detail" onClick={()=>{setSelected(s.id);setMode(null)}}><img src={`https://i.ytimg.com/vi/${s.video}/hqdefault.jpg`} alt={s.name+' archive venue film preview'} loading="lazy"/><span className="stadium-choice-copy"><small>{s.city}</small><strong>{s.name}</strong><span>Explore the ground <ArrowUpRight/></span></span></button>)}</div>
   <div className="stadium-detail" id="stadium-detail"><div className="stadium-media">
    {mode==='map'?<iframe key={venue.id+'-map'} src={`https://maps.google.com/maps?q=${encodeURIComponent(venue.map)}&z=15&output=embed`} title={'Map of '+venue.name} loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>:mode==='film'?<iframe key={venue.id+'-film'} src={`https://www.youtube-nocookie.com/embed/${venue.video}?autoplay=1&rel=0`} title={venue.name+' archive tour'} referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>:<><img key={venue.id} src={`https://i.ytimg.com/vi/${venue.video}/hqdefault.jpg`} alt={venue.name+' archive film thumbnail'}/><div className="stadium-media-actions"><button className="btn" onClick={()=>setMode('map')}><MapPin/>Explore map</button><button onClick={()=>setMode('film')}><Play weight="fill"/>Watch venue film</button></div></>}
    {mode&&<button className="stadium-close" aria-label="Close stadium media" onClick={()=>setMode(null)}><X/></button>}
   </div><motion.div key={venue.id} className="stadium-detail-copy" aria-live="polite" initial={spatial?{opacity:0,x:-8}:{opacity:0}} animate={{opacity:1,x:0}} transition={{duration:spatial?.3:.15,ease:broadcastEase}}><p className="kicker stadium-locator"><MapPin aria-hidden="true"/><SectionRule/>{venue.city}</p><h3>{venue.name}</h3><p><MapPin/>{venue.address}</p><div><a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venue.map)}`} target="_blank" rel="noreferrer">Get directions <ArrowUpRight/></a><a href={venue.source} target="_blank" rel="noreferrer">Venue information <ArrowUpRight/></a></div><small>{venue.credit}. Archive imagery, not current WCL footage.</small></motion.div></div>
  </div><p className="source-note">Explore these UAE cricket destinations. Match-to-stadium assignments, gates, parking and accessible seating for Season 3 have not been confirmed. Maps and films load only on request.</p>
 </section>;
}
