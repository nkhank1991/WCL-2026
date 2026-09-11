import brands from './data/brands.json';
import frames from './data/brand-frames.json';
import {useState,useRef,useEffect} from 'react';
import {usePublished} from './PublishedContent.jsx';
import {useFilmMotion,Reveal} from './Cinematic.jsx';
import {CaretDown,Pause,Play} from '@phosphor-icons/react';
import './brands-compact.css';

function Logo({brand,caption=false}){
 const frame=frames[brand.id]||{left:0,top:0,width:200,height:200,canvas:200,tone:'light'};
 const scale=Math.min(100/frame.width,38/frame.height);
 return <div className={'association-logo '+(frame.tone==='dark'?'association-logo-dark':'')} title={brand.name} role="listitem">
  <div className="association-logo-window" style={{width:frame.width*scale,aspectRatio:frame.width/frame.height}}>
   <img src={brand.image} alt={caption?'':brand.name} loading="lazy" decoding="async" style={{width:frame.canvas/frame.width*100+'%',height:'auto',left:-frame.left/frame.width*100+'%',top:-frame.top/frame.height*100+'%'}}/>
  </div>
  {caption&&<span>{brand.name}</span>}
 </div>
}

export function BrandStrip(){
 const published=usePublished('brands',brands);
 const [expanded,setExpanded]=useState(false),[paused,setPaused]=useState(false),[visible,setVisible]=useState(false),[hidden,setHidden]=useState(false);
 const [hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[desktop,setDesktop]=useState(false);
 const {enabled,brandMotion=true,brandDuration=100}=useFilmMotion();
 const ref=useRef(null),rail=useRef(null),set=useRef(null);
 useEffect(()=>{
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));
  if(ref.current)observer.observe(ref.current);
  const change=()=>setHidden(document.hidden);change();
  const media=window.matchMedia('(min-width: 701px) and (hover: hover) and (pointer: fine)');
  const resize=()=>setDesktop(media.matches);resize();
  media.addEventListener('change',resize);document.addEventListener('visibilitychange',change);
  return()=>{observer.disconnect();media.removeEventListener('change',resize);document.removeEventListener('visibilitychange',change)};
 },[]);
 const automatic=enabled&&brandMotion&&desktop&&published.length>8;
 const running=automatic&&!paused&&visible&&!hidden&&!expanded&&!hovered&&!focused;
 useEffect(()=>{
  if(!running)return;
  // Keep fractional progress ourselves; scrollLeft can round subpixel writes.
  let frame,last,position=rail.current?.scrollLeft||0;
  const advance=time=>{
   const node=rail.current,width=set.current?.offsetWidth;
   if(node&&width){
    if(last!==undefined){position+=(Math.min(time-last,48)/1000)*width/(brandDuration*2);if(position>=width)position-=width;node.scrollLeft=position;}
    last=time;
   }
   frame=requestAnimationFrame(advance);
  };
  frame=requestAnimationFrame(advance);
  return()=>cancelAnimationFrame(frame);
 },[running,brandDuration]);
 function browse(event){
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
  event.preventDefault();setPaused(true);
  const node=rail.current;
  if(event.key==='Home')node.scrollLeft=0;
  else if(event.key==='End')node.scrollLeft=set.current.offsetWidth-node.clientWidth;
  else node.scrollBy({left:(event.key==='ArrowRight'?1:-1)*288,behavior:enabled?'smooth':'auto'});
 }
 if(!published.length)return null;
 return <section id="wcl-brands" ref={ref} className="brand-compact" aria-labelledby="brands-title" data-running={running} data-motion-enabled={enabled} onPointerEnter={()=>setHovered(true)} onPointerLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}>
  <div className="wrap association-heading">
   <div><p className="association-eyebrow">Across the seasons</p><h2 id="brands-title">Brands associated with WCL.</h2></div>
   <div className="association-actions">
    {automatic&&!expanded&&<button className="association-motion" onClick={()=>setPaused(v=>!v)} aria-label={paused?'Resume brand movement':'Pause brand movement'} aria-pressed={paused} title={paused?'Resume movement':'Pause movement'}>{paused?<Play size={14} weight="fill"/>:<Pause size={14} weight="fill"/>}</button>}
    <button className="association-toggle" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded} aria-controls="brand-collection">{expanded?'Show less':'View all '+published.length}<CaretDown size={14}/></button>
   </div>
  </div>
  <div className="wrap association-body" id="brand-collection">
   {expanded?<div className="association-grid" role="list" aria-label="All brands associated with WCL">{published.map(brand=><Logo key={brand.id} brand={brand} caption/>)}</div>:
    <div ref={rail} className="association-rail" role="region" tabIndex={0} aria-label="Browse brands associated with WCL" aria-describedby="brand-browse-help" onKeyDown={browse} onPointerDown={()=>setPaused(true)} onWheel={()=>setPaused(true)}>
     <div className="association-track"><div ref={set} className="association-set" role="list">{published.map(brand=><Logo key={brand.id} brand={brand}/>)}</div>{automatic&&<div className="association-set" role="list" aria-hidden="true">{published.map(brand=><Logo key={brand.id} brand={brand}/>)}</div>}</div>
    </div>}
   <span id="brand-browse-help" className="association-sr-only">Swipe or use the left and right arrow keys to browse. Home and End move to the first and last brands.</span>
  </div>
 </section>
}
export function PerimeterBoard(){return <div className="perimeter-board" aria-label="WCL championship ribbon"><Reveal className="perimeter-track"><span>WORLD CHAMPIONSHIP OF LEGENDS</span><span>SEVEN NATIONS</span><span>ONE TROPHY</span><span>UAE 2026</span><span>LEGENDS LIVE ON</span></Reveal></div>}
