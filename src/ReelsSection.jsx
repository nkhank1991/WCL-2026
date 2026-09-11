import {useState,useRef} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Play,InstagramLogo} from '@phosphor-icons/react';
import {useFilmMotion} from './Cinematic.jsx';
import {SectionRule} from './BroadcastGraphics.jsx';
import {usePublished} from './PublishedContent.jsx';
import source from './data/news-public.json';
import socialReels from './data/social-reels.json';
import {teams} from './match-model.jsx';

const selection=['news-18','news-17','news-16','news-12'];
export function instagramSource(url){try{const u=new URL(url);return u.protocol==='https:'&&/^(www\.)?instagram\.com$/.test(u.hostname)&&/^\/(?:[\w.]+\/)?(reel|p)\/[\w-]+\//.test(u.pathname)?u.href:null}catch{return null}}
export function ReelsSection(){
 const news=usePublished('news',source),{enabled}=useFilmMotion();
 const items=[...socialReels,...selection.map(id=>news.find(n=>n.id===id))].filter(n=>n?.thumbnail&&instagramSource(n.sourceUrl));
 const [filter,setFilter]=useState('All'),[channel,setChannel]=useState('all');const rail=useRef(null);
 const rows=items.filter(n=>(filter==='All'||(filter==='Reels'?n.contentType==='video':n.team||n.contentType==='social'))&&(channel==='all'||n.team===channel));
 function scroll(direction){rail.current?.scrollBy({left:direction*rail.current.clientWidth*.8,behavior:enabled?'smooth':'instant'})}
 return !items.length?null:<section className="reels-section wrap section" aria-labelledby="reels-title">
  <div className="section-title"><div><p className="kicker broadcast-kicker"><SectionRule/>INSIDE WCL</p><h2 id="reels-title">Closer to the moment.</h2></div><a className="text-link" href="https://www.instagram.com/worldchampionshipoflegends/" target="_blank" rel="noopener noreferrer"><InstagramLogo/> Follow WCL <ArrowUpRight/></a></div>
  <div className="reels-toolbar"><div className="team-pills">{['All','Reels','Team moments'].map(label=><button key={label} aria-pressed={filter===label} className={filter===label?'active':''} onClick={()=>{setFilter(label);rail.current?.scrollTo?.({left:0,behavior:'instant'})}}>{label}</button>)}</div><label className="select-label reels-channel">Channel<select aria-label="Social channel" value={channel} onChange={event=>{setChannel(event.target.value);rail.current?.scrollTo?.({left:0,behavior:'instant'})}}><option value="all">All channels</option>{teams.filter(t=>items.some(n=>n.team===t.id)).map(t=><option key={t.id} value={t.id}>{t.name} Champions</option>)}</select></label><div className="rail-controls"><button aria-label="Previous moments" onClick={()=>scroll(-1)}><ArrowLeft/></button><button aria-label="Next moments" onClick={()=>scroll(1)}><ArrowRight/></button></div></div>
  <div className="reels-rail" ref={rail} tabIndex={0} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();scroll(event.key==='ArrowRight'?1:-1)}}} role="list" aria-label="Curated WCL social moments">{rows.map(n=><article className="reel-card" key={n.id} role="listitem">
   <a className="reel-direct-link" href={instagramSource(n.sourceUrl)} target="_blank" rel="noopener noreferrer" aria-label={'Open '+n.title+' on Instagram (opens in a new tab)'}>
    <img src={n.thumbnail} alt={n.imageAlt||n.title} loading="lazy"/>
    <span className="reel-type">{n.contentType==='video'?<Play weight="fill"/>:<InstagramLogo/>}{n.contentType==='video'?'REEL':'TEAM MOMENT'} · {n.season}</span>
    <span className="reel-caption"><small>{n.sourceName}</small><strong>{n.title}</strong><span>{n.contentType==='video'?'Watch on Instagram':'Open on Instagram'} <ArrowUpRight/></span></span>
   </a>
  </article>)}</div>
  <p className="source-note">Curated from WCL and team channels. Each Reel opens directly on Instagram.</p>
 </section>;
}
