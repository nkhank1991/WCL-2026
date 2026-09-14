import {useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,ArrowUpRight,Play} from '@phosphor-icons/react';
import source from './data/news-public.json';
import {Reveal} from './Cinematic.jsx';
import {usePublished} from './PublishedContent.jsx';
import {destinationStory} from './DestinationStory.jsx';
export const publishedNews=[destinationStory,...source].filter(n=>['verified','preview-verified'].includes(n.verificationStatus)&&!n.duplicateOf).sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')||(b.sourceItem||0)-(a.sourceItem||0));
const dateLabel=value=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
const actionFor=n=>n.contentType==='editorial'?'Explore the story':n.contentType==='video'?'Watch Video':n.contentType==='social'?'View Post':'Read Article';
export function NewsCard({item,featured=false}){
 const [failed,setFailed]=useState(false);
 const fallback=!item.thumbnail||failed;
 return <article className={'press-card '+(featured?'press-featured':'')}>
  <a href={item.sourceUrl} target={item.contentType==='editorial'?'_self':'_blank'} rel="noopener noreferrer" aria-label={item.title+(item.contentType==='editorial'?'':' (opens in a new tab)')}>
   <div className={'press-art '+(fallback?'is-fallback':'')}>
    {fallback?<div className="news-art-placeholder"><small>{item.sourceName}</small><strong>{item.team?item.team.replaceAll('-',' ').toUpperCase():'WCL'}<br/>{item.category.toUpperCase()}</strong><small>Article image unavailable · open source</small></div>:<img src={item.thumbnail} alt={item.imageAlt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>}
    {item.contentType==='video'&&<span className="press-play"><Play weight="fill"/></span>}
   </div>
   <div className="press-copy"><div className="press-meta"><span>{item.category}</span><span>{item.season==='2026'?'SEASON 3':item.season?item.season+' ARCHIVE':'WCL'}</span></div><h3>{item.title}</h3><p>{item.summary}</p><div className="press-byline"><span>{item.sourceName}</span>{item.publishedAt&&<time dateTime={item.publishedAt}>{dateLabel(item.publishedAt)}</time>}</div>{item.imageCredit&&<small className="press-image-credit">Image: {item.imageCredit}{item.contentType==='editorial'?'':' · original article'}</small>}<span className="press-action">{actionFor(item)}<ArrowUpRight/></span></div>
  </a>
 </article>
}
export function HomeNews(){
 const supportingRef=useRef(null);
 const publishedNews=[destinationStory,...usePublished('news',source)].sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')||(b.sourceItem||0)-(a.sourceItem||0));
 const featured=publishedNews.find(n=>n.featured)||publishedNews[0];
 const supporting=[destinationStory,...[32,28].map(id=>publishedNews.find(n=>n.sourceItem===id)).filter(Boolean)];
 const more=[33,34,35].map(id=>publishedNews.find(n=>n.sourceItem===id)).filter(Boolean);
 function browseSupporting(event){
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||event.altKey||event.ctrlKey||event.metaKey)return;
  const links=[...supportingRef.current.querySelectorAll('.press-card > a')];
  const current=links.indexOf(document.activeElement);
  if(current<0)return;
  const next=event.key==='Home'?0:event.key==='End'?links.length-1:Math.max(0,Math.min(links.length-1,current+(event.key==='ArrowRight'?1:-1)));
  event.preventDefault();
  links[next].focus({preventScroll:true});
  links[next].scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});
 }
 return <><section className="wrap section press-home" aria-labelledby="home-news-title"><Reveal className="section-title"><div><p className="kicker">THE NEXT CHAPTER, AS IT HAPPENS</p><h2 id="home-news-title">News & Updates</h2></div><Link to="/news">View All News <ArrowRight/></Link></Reveal><div className="press-home-grid"><NewsCard item={featured} featured/><div className="press-supporting" ref={supportingRef} onKeyDown={browseSupporting}>{supporting.map(n=><NewsCard key={n.id} item={n}/>)}</div></div><div className="press-more">{more.map(n=><a key={n.id} href={n.sourceUrl} target="_blank" rel="noopener noreferrer"><span>{n.sourceName} · {dateLabel(n.publishedAt)}</span><h3>{n.title}</h3><ArrowUpRight/></a>)}</div></section></>
}
export function NewsCentre(){
 const publishedNews=[destinationStory,...usePublished('news',source)].sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')||(b.sourceItem||0)-(a.sourceItem||0));
 const [category,setCategory]=useState('All'),[limit,setLimit]=useState(9),[query,setQuery]=useState('');
 const categories=['All','News','Team Updates','Destination','Videos','Social'].filter(c=>c==='All'||publishedNews.some(n=>n.category===c));
 const filtered=publishedNews.filter(n=>(category==='All'||n.category===category)&&(n.title+' '+n.summary+' '+n.sourceName).toLowerCase().includes(query.toLowerCase()));
 const shown=filtered.slice(0,limit);
 function choose(c){setCategory(c);setLimit(9)}
 return <><div className="page-title"><div className="wrap"><p className="kicker">ANNOUNCEMENTS. TEAMS. THE WCL ARCHIVE.</p><h1>News & Updates</h1><p>The stories behind the championship, from the latest Season 3 announcements to earlier editions.</p></div></div><section className="wrap section"><label className="news-search">Search stories<input type="search" aria-label="Search news" placeholder="Search a player, team or story" value={query} onChange={e=>{setQuery(e.target.value);setLimit(9)}}/></label><div className="press-filters" aria-label="Filter news">{categories.map(c=><button key={c} aria-pressed={category===c} onClick={()=>choose(c)}>{c}</button>)}<span role="status">{filtered.length} stories</span></div><div className={"press-grid "+(category==='All'&&!query?'news-editorial-grid':'')}>{shown.map((n,i)=><NewsCard key={n.id} item={n} featured={i===0&&category==='All'&&!query}/>)}</div>{!shown.length&&<div className="empty-box"><h3>No stories found.</h3><p>Try another team, category or search.</p><button className="text-link" onClick={()=>{setQuery('');choose('All')}}>Reset news filters</button></div>}{limit<filtered.length&&<div className="press-load"><button className="btn" onClick={()=>setLimit(n=>n+9)}>Load More <ArrowRight/></button><span>Showing {shown.length} of {filtered.length}</span></div>}<p className="press-disclosure">External coverage opens on the original publisher or social platform. Earlier seasons are labelled as archive. Article images are loaded from the publisher where available. A text panel is used when the publisher image cannot be loaded.</p></section></>
}
