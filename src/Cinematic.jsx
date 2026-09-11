import {createContext,useContext,useState,useRef,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion,MotionConfig,useReducedMotion,useScroll,useTransform,useSpring,useMotionValue} from 'motion/react';
import {ArrowUpRight,ArrowDown,Play,Pause} from '@phosphor-icons/react';
import {usePublished} from './PublishedContent.jsx';

const Preference=createContext({enabled:true,toggle:()=>{}});
const ease=[.22,1,.36,1];
export function CinematicProvider({children,staticRender=false}){
 const [enabled,setEnabled]=useState(true);
 const settings=usePublished('experience',[{id:'motion',motionEnabled:true,brandMotion:true,brandDuration:100,revealDuration:.35}]).find(p=>p.id==='motion')||{};
 const allowed=!staticRender&&enabled&&settings.motionEnabled!==false;
 const reduced=useReducedMotion();
 useEffect(()=>{document.documentElement.dataset.motion=allowed&&!reduced?'on':'off'},[allowed,reduced]);
 return <Preference.Provider value={{enabled:allowed&&!reduced,brandMotion:settings.brandMotion!==false,brandDuration:Math.max(80,Math.min(180,settings.brandDuration||100)),revealDuration:Math.max(.15,Math.min(.6,settings.revealDuration||.35)),toggle:()=>setEnabled(v=>!v)}}><MotionConfig reducedMotion={!allowed?'always':'user'} transition={{duration:.25,ease}}>{children}</MotionConfig></Preference.Provider>
}
export function useFilmMotion(){const p=useContext(Preference);const reduced=useReducedMotion();return {...p,enabled:p.enabled&&!reduced}}
export function Reveal({children,className='',delay=0}){const {enabled,revealDuration=.35}=useFilmMotion();return <motion.div className={className} initial={enabled?{opacity:0,y:12}:{opacity:1,y:0}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.08}} transition={{duration:enabled?revealDuration:0,delay:enabled?delay:0,ease}}>{children}</motion.div>}
export function FilmProgress(){const {scrollYProgress}=useScroll();const scaleX=useSpring(scrollYProgress,{stiffness:100,damping:30});return <motion.div className="film-progress" style={{scaleX,transformOrigin:'0% 50%'}}/>}
export function CinematicHero(){
 const ref=useRef(null);const {enabled,toggle}=useFilmMotion();
 const {scrollYProgress}=useScroll({target:ref,offset:['start start','end start']});
 const artworkY=useTransform(scrollYProgress,[0,1],[0,100]);
 const copyY=useTransform(scrollYProgress,[0,1],[0,-35]);
 const px=useMotionValue(0);const py=useMotionValue(0);
 const x=useSpring(px,{stiffness:45,damping:22});const y=useSpring(py,{stiffness:45,damping:22});
 function pointer(e){if(!enabled||e.pointerType==='touch')return;const r=e.currentTarget.getBoundingClientRect();px.set((e.clientX-r.left-r.width/2)*.014);py.set((e.clientY-r.top-r.height/2)*.008)}
 const rise=i=>({initial:enabled?{y:'110%',opacity:0}:{y:0,opacity:1},animate:{y:0,opacity:1},transition:{duration:1.1,delay:.12+i*.13,ease}});
 return <section ref={ref} className="film-hero" onPointerMove={pointer} onPointerLeave={()=>{px.set(0);py.set(0)}}>
  <div className="film-topline"><span>WORLD CHAMPIONSHIP OF LEGENDS</span><span>SEASON 03 — UAE, 2026</span></div>
  <motion.div className="film-copy" style={{y:enabled?copyY:0}}>
   <motion.p className="film-eyebrow" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.15,duration:.8}}><span/> 03 — 18 October 2026</motion.p>
   <h1><span className="line-mask"><motion.span {...rise(0)}>Legends.</motion.span></span><span className="line-mask"><motion.em {...rise(1)}>Live again.</motion.em></span></h1>
   <motion.div initial={enabled?{opacity:0,y:15}:false} animate={{opacity:1,y:0}} transition={{delay:.6,duration:.8,ease}}><p className="film-intro">The names you grew up with.<br/>The game you never stopped loving.</p><div className="film-actions"><Link className="film-primary" to="/season">Enter Season 3 <span><ArrowUpRight/></span></Link><Link className="film-secondary" to="/watch"><Play weight="fill"/> Watch the highlights</Link></div></motion.div>
  </motion.div>
  <motion.div className="film-artwork" style={{y:enabled?artworkY:0}}><motion.div className="film-portrait-stage" style={{x:enabled?x:0,y:enabled?y:0}}>
   <span className="film-orbit orbit-one"/><span className="film-orbit orbit-two"/>
   <span className="film-ghost-word" aria-hidden="true">LEGENDS</span>
   <motion.img className="film-player player-left" src="/assets/pakistan.png" alt="Pakistan Champions campaign portrait" initial={enabled?{opacity:0,y:55}:false} animate={{opacity:1,y:0}} transition={{duration:1.35,delay:.25,ease}}/>
   <motion.img className="film-player player-right" src="/assets/south-africa.png" alt="South Africa Champions campaign portrait" initial={enabled?{opacity:0,y:55}:false} animate={{opacity:1,y:0}} transition={{duration:1.35,delay:.4,ease}}/>
   <motion.img className="film-player player-centre" src="/assets/india.png" alt="India Champions campaign portrait" initial={enabled?{opacity:0,y:70}:false} animate={{opacity:1,y:0}} transition={{duration:1.4,delay:.15,ease}}/>
   <div className="film-stamp"><span>WCL</span><strong>III</strong><small>THE UAE CHAPTER</small></div>
  </motion.div></motion.div>
  <div className="film-bottom"><a href="#match-hub" className="film-scroll"><span><ArrowDown/></span> Explore the championship</a><div className="film-edition"><strong>07</strong><span>NATIONS.<br/>ONE CHAMPIONSHIP.</span></div><button className="film-motion-control" onClick={toggle} aria-pressed={enabled} aria-label={enabled?'Pause ambient motion':'Enable ambient motion'}>{enabled?<Pause/>:<Play/>}<span>Motion {enabled?'on':'off'}</span></button></div>
 </section>
}
export function EditorialBridge(){return <section className="editorial-bridge"><Reveal><p>Some names belong<br/>on a <em>bigger stage.</em></p><span>Seven nations. Three chapters. A lifetime of cricket.</span></Reveal></section>}
