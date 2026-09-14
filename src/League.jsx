import {deliveryImage,responsiveCampaign} from './media.js';
import {CmsPageHeading as PageTitle,WclLogo,CmsNavigation,CmsFooter,CmsCopyright,useTeams,usePageCopy,RichCopy} from './cms/SiteContent.jsx';
import {useState,useEffect,useRef,createContext,useContext,lazy,Suspense} from 'react';
import {BrowserRouter,Routes,Route,Link,NavLink,useLocation,useParams,useSearchParams,Navigate} from 'react-router-dom';
import {ArrowRight,ArrowLeft,Play,CalendarBlank,Trophy,MapPin,List,X,MagnifyingGlass,Heart,ArrowUpRight,Users,ChartBar,Ticket,Check,Download} from '@phosphor-icons/react';
import sourceData from './data/wcl.json';
import {season3Players,pendingSlots} from './season3-roster.js';
import {season3Matches,scheduleSource,uaeTime} from './season3-schedule.js';
import {TeamShowcase,TeamRecord} from './TeamShowcase.jsx';
import {recordSources,withArchiveFinal} from './team-records.js';
import {TeamPlayerDirectory} from './TeamPlayerDirectory.jsx';
import {DestinationStory} from './DestinationStory.jsx';
import {BrandStrip,PerimeterBoard} from './BrandStrip.jsx';
import {ContactPage} from './ContactPage.jsx';
import {PolicyPage} from './PolicyPages.jsx';
import {LeadershipProfiles} from './Leadership.jsx';
const ApplicantPortal=lazy(()=>import('./ApplicantPortal.jsx').then(m=>({default:m.ApplicantPortal})));
const Admin=lazy(()=>import('./Admin.jsx').then(m=>({default:m.Admin})));
const AccreditationPlan=lazy(()=>import('./Admin.jsx').then(m=>({default:m.AccreditationPlan})));
import {usePublished} from './PublishedContent.jsx';
const LeagueData=createContext(null);
const useLeagueData=()=>useContext(LeagueData)||data;
const data={...sourceData,matches:[...season3Matches,...sourceData.matches],players:season3Players};
import './league.css';
import {fixtureState,validSeason,inSeason,matchMoment} from './match-model.jsx';
import {withCampaignPortrait} from './player-art.js';
import {motion,AnimatePresence} from 'motion/react';
import {Reveal,FilmProgress} from './Cinematic.jsx';
import {SportsHero} from './SportsHero.jsx';
import {PlayerCard,PlayerRail} from './PlayerCard.jsx';
import {videoMatchLabel,videoCardTitle} from './video-labels.js';
import {ReelsSection} from './ReelsSection.jsx';
import {StadiumExplorer} from './StadiumExplorer.jsx';
import {SectionRule,FixtureStrip,ScoreUpdate,useBroadcastMotion,broadcastEase} from './BroadcastGraphics.jsx';
import {BroadcastVideo} from './BroadcastVideo.jsx';
import {MatchBroadcast} from './MatchBroadcast.jsx';
import {MatchStage,MatchInsights} from './MatchStage.jsx';
import {SocialLinks,TeamInstagram} from './SocialLinks.jsx';
import {HomeNews,NewsCentre} from './NewsCentre.jsx';
import {CareerRecords,RivalryFeature} from './CareerRecords.jsx';
const MotionLink=motion.create(Link);

import {teams,stories} from './league-editorial.js';
const teamById=id=>teams.find(t=>t.id===id);
function readSaved(){try{return JSON.parse(localStorage.getItem('wcl-fan')||'{}')}catch{return {}}}
function Crest({id,size=''}){const [failed,setFailed]=useState(false);const t=useTeams().find(t=>t.id===id);useEffect(()=>setFailed(false),[t?.logo]);return t?<span className={`crest ${size}`} style={{'--club':t.color}}>{t.logo&&!failed?<img src={t.logo} alt="" onError={()=>setFailed(true)}/>:t.short}</span>:null}
function Button({to,children,light=false}){return <Link className={`btn ${light?'light':''}`} to={to}>{children}<ArrowRight size={18}/></Link>}
function SectionHead({tag,title,to,label='View all'}){return <Reveal className="section-title"><div><p className="kicker broadcast-kicker"><SectionRule/>{tag}</p><h2>{title}</h2></div>{to&&<Link to={to}>{label}<ArrowRight/></Link>}</Reveal>}
function Empty({title,children,icon=<CalendarBlank size={36}/>}){return <div className="empty-box">{icon}<h3>{title}</h3><p>{children}</p></div>}
function SeasonSelect({value,onChange,includeAll=false}){return <label className="select-label">Season<select aria-label="Season" value={value} onChange={e=>onChange(e.target.value)}>{includeAll&&<option value="all">All seasons</option>}<option value="3">Season 3 · 2026</option><option value="2">Season 2 · 2025</option><option value="1">Season 1 · 2024</option></select></label>}

import {useSeo,SeoBreadcrumbs,CricketAnswers} from './seo/Seo.jsx';
import {RivalryGuide} from './seo/RivalryGuide.jsx';
import {SeasonArchive} from './seo/SeasonArchive.jsx';

function ScrollReset(){
 const {pathname,hash,key}=useLocation();
 useEffect(()=>{
  let cancelled=false;let frame;
  const position=()=>{
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    if(cancelled)return;
    const target=window.location.hash&&document.getElementById(window.location.hash.slice(1));
    const header=document.querySelector('.league-header')?.getBoundingClientRect().height||0;
    const top=target?window.scrollY+target.getBoundingClientRect().top-header:0;
    window.scrollTo({top,left:0,behavior:'instant'});
   });
  };
  position();
  if(hash)document.fonts?.ready.then(()=>{if(!cancelled)position();});
  window.addEventListener('hashchange',position);
  return()=>{cancelled=true;cancelAnimationFrame(frame);window.removeEventListener('hashchange',position);};
 },[pathname,hash]);
 return null;
}

function Layout({children}){
 const {spatial}=useBroadcastMotion();
 const [open,setOpen]=useState(false);const menuRef=useRef(null);const {pathname}=useLocation();useEffect(()=>setOpen(false),[pathname]);
 useEffect(()=>{if(!open)return;const escape=e=>{if(e.key==='Escape'){setOpen(false);menuRef.current?.focus();}};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[open]);
 return <div className="wcl-public" data-surface-motion={spatial?'spatial':'quiet'}><ScrollReset/><FilmProgress/><a className="skip" href="#content">Skip to content</a><header className="league-header"><div className="nav-wrap"><Link to="/" className="wcl-logo" aria-label="WCL homepage"><WclLogo/><small>WORLD CHAMPIONSHIP<br/>OF LEGENDS</small></Link><nav id="main-navigation" aria-label="Main navigation" className={open?'expanded':''}><CmsNavigation/><SocialLinks compact/></nav><button ref={menuRef} className="mobile-menu" aria-controls="main-navigation" aria-expanded={open} aria-label="Toggle menu" onClick={()=>setOpen(!open)}>{open?<X/>:<List/>}</button></div></header><motion.main id="content" key={pathname} initial={false}><SeoBreadcrumbs/>{children}</motion.main><section className="fan-banner wrap"><div><p className="kicker">YOUR COLOURS. YOUR CRICKET.</p><h2>Make it your WCL.</h2><p>Choose your team. Keep the moments you love.</p></div><Button to="/fan-zone">Choose your champions</Button></section><BrandStrip/><footer className="league-footer"><div className="wrap footer-wordmark" aria-hidden="true">WORLD OF LEGENDS.</div><div className="wrap footer-grid"><div><Link className="wcl-logo" to="/" aria-label="WCL homepage"><WclLogo/></Link><p>Legends live forever.</p><small>World Championship of Legends</small><SocialLinks/></div><CmsFooter/></div><div className="wrap copyright"><CmsCopyright/></div></footer></div>;
}

function MatchCard({match}){
 const state=fixtureState(match);const {spatial}=useBroadcastMotion();
 return <MotionLink initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true,amount:.1}} transition={{duration:spatial?.28:.15,ease:broadcastEase}} className="match-tile broadcast-match refined-match" style={{'--home-color':teamById(match.teams[0])?.color||'#174bbb','--away-color':teamById(match.teams[1])?.color||'#d58a34'}} to={'/matches/'+match.id}>
 <div className="match-meta"><span>SEASON {match.season} · {match.label}</span><span className={'status status-'+state.toLowerCase()}>{state}</span></div>
 <div className="match-arena">{[0,1].map(i=><div className="match-contender" key={i}>{match.teams[i]?<Crest id={match.teams[i]}/>:<span className="crest tbd-crest"><Trophy/></span>}<strong>{teamById(match.teams[i])?.name||'To be confirmed'}</strong>{match.verificationStatus==='verified'&&match.scores?.[i]&&<ScoreUpdate value={match.scores[i]}/>}{i===0&&<span className="match-versus" aria-hidden="true">vs</span>}</div>)}</div>
 <FixtureStrip match={match}/>
 {state==='Result'&&<p className="verified-result">{match.result}</p>}<div className="match-foot"><span>{state==='Live'?'Follow this match':'Match details'}</span><ArrowUpRight/></div></MotionLink>
}
function MatchStrip(){const data=useLeagueData();const finals=data.matches.filter(m=>m.label==='Final');return <div className="score-strip"><div className="score-intro"><p className="kicker">THE MATCH CENTRE</p><h3>Every contest.<br/>Every chapter.</h3><Link to="/matches">All matches <ArrowRight/></Link></div><Link className="next-season" to="/matches?season=3"><span className="status gold">NEXT CHAPTER</span><h3>Season 3 · UAE</h3><strong>03 — 18 OCT 2026</strong><p>24 fixtures · View the schedule <ArrowUpRight/></p></Link>{finals.reverse().map(m=><MatchCard key={m.id} match={m}/>)}</div>}
function StoryCard({story,large=false}){return <Link className={`story-card ${large?'large':''}`} to={`/news/${story.id}`}><div className="story-art"><img loading="lazy" src={deliveryImage(story.image)} alt="WCL campaign artwork"/><span className="story-category">{story.category}</span><span className="round-arrow"><ArrowUpRight/></span></div><div className="story-copy"><small>WCL EDITORIAL</small><h3>{story.title}</h3><p>{story.intro}</p></div></Link>}
function VideoCard({video}){const {spatial}=useBroadcastMotion();return <MotionLink whileHover={spatial?{y:-3}:undefined} transition={{duration:.2}} className="video-card" to={`/watch/${video.id}`}><div className="video-art"><img loading="lazy" decoding="async" width="480" height="360" src={video.thumbnail||`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt=""/><span className="play-circle"><Play weight="fill"/></span><span className="video-season">SEASON {video.season}</span><span className="video-match-title">{videoMatchLabel(video)}</span><span className="video-editorial-label">MATCH HIGHLIGHTS</span></div><h3><span className="video-full-title">{video.title}</span><span className="video-compact-title">{videoCardTitle(video)}</span></h3><span>Match highlights <ArrowUpRight/></span></MotionLink>}
function Home(){
 const data=useLeagueData();
 return <>
  <nav className="mobile-home-paths" aria-label="Quick access">
   <Link to="/matches">Fixtures</Link><Link to="/#wcl-teams">Teams</Link><Link to="/watch">Highlights</Link><Link to="/tickets">Tickets</Link>
  </nav>
  <SportsHero matches={data.matches} players={data.players}/>
  <RivalryFeature/>
  <section id="wcl-teams" className="wrap section teams-home"><SectionHead tag="FIND YOUR TEAM" title="WCL teams" to="/teams" label="All teams"/><TeamShowcase teams={teams} rail/></section>
  <section id="match-hub" className="wrap section"><Reveal><HomeMatchCentre/></Reveal></section>
  <div className="wrap home-secondary-promotion"><SeasonWidgets/></div>
  <section className="spotlight-section"><div className="wrap section"><PlayerSpotlight/></div></section>
  <section className="wrap section home-secondary-promotion"><Reveal><HomePlayers/></Reveal></section>
  <div className="home-secondary-promotion"><TrophyScene/></div>
  <ReelsSection/>
  <section className="video-section"><div className="wrap section"><SectionHead tag="WCL TV" title="Highlights" to="/watch" label="All highlights"/><div className="video-grid">{data.videos.slice(0,4).map(v=><VideoCard video={v} key={v.id}/>)}</div></div></section>
  <HomeNews/>
  <CareerRecords/>
  <section className="wrap section"><SectionHead tag="OCTOBER 2026" title="Plan your visit"/><div className="guide-grid">{[['Season 3','Dates and tournament information.','/season',<Trophy/>],['Tickets','Matchday information.','/tickets',<Ticket/>],['My WCL','Your team and saved highlights.','/fan-zone',<Heart/>]].map(([title,copy,to,icon])=><Link className="guide-card" to={to} key={to}>{icon}<h3>{title}</h3><p>{copy}</p><ArrowRight/></Link>)}</div></section>
 </>;
}

function RosterPending(){return <details className="roster-pending"><summary>Lineup notes · {pendingSlots.length} unresolved slots</summary><p>The supplied workbook lists alternatives or leaves these slots empty. None are included in the player directory until resolved.</p><ul>{pendingSlots.map(s=><li key={s.sourceRow}>{teamById(s.team)?.name}: {s.sourceName||'Player to be confirmed'}</li>)}</ul></details>}
function TrophyScene(){return <section className="trophy-scene"><div className="wrap trophy-scene-inner"><Reveal className="trophy-scene-art"><img src={deliveryImage("/assets/season3-trophy.png")} alt="Supplied WCL Season 3 gold trophy design with crown and winged handles" loading="lazy" decoding="async"/></Reveal><Reveal><p className="kicker">THE SEASON 3 TROPHY</p><h2>SEVEN NATIONS.<br/><span>ONE PRIZE.</span></h2><p>The next chapter of the World Championship of Legends. United Arab Emirates. 3–18 October 2026.</p><Button to="/season">Inside Season 3</Button></Reveal></div></section>}
function SeasonWidgets(){
 const favorite=teamById(readSaved().team);
 return <div className="wcl-bento">
  <Link className="bento-lead" to="/season"><img src={deliveryImage("/assets/india.png")} alt="India Champions campaign portrait" loading="lazy"/><span className="bento-tag">SEASON 3 · UAE 2026</span><div className="bento-caption"><h2>THE WORLD'S<br/>CRICKET LEGENDS.</h2><p>3–18 October 2026 · United Arab Emirates</p><span className="bento-action">Explore the season <ArrowUpRight/></span></div></Link>
  <Link className="bento-wide" to={favorite?`/teams/${favorite.id}`:'/fan-zone'}><img src={deliveryImage(favorite?favorite.image:'/assets/pakistan.png')} alt="WCL campaign portrait" loading="lazy"/><div><span className="bento-tag">MY WCL</span><h3>{favorite?favorite.name+' Champions':'Your team. Your WCL.'}</h3><span className="bento-action">{favorite?'Visit your team':'Choose your team'}<ArrowUpRight/></span></div></Link>
  <Link className="bento-number" to="/players"><span className="bento-tag">SEASON 3 PLAYERS</span><strong>{data.players.length}</strong><span>Season 3 player profiles</span><ArrowUpRight/></Link>
  <Link className="bento-watch" to="/watch"><img src={deliveryImage("/assets/chris-gayle-campaign.png")} alt="West Indies Champions campaign portrait" loading="lazy"/><div><Play weight="fill"/><h3>WCL TV</h3><span>{data.videos.length} archive highlights</span></div></Link>
 </div>
}

function HomeMatchCentre(){const data=useLeagueData();return <MatchBroadcast compact matches={data.matches} players={data.players}/>}

function PlayerSpotlight(){const data=useLeagueData();const {spatial}=useBroadcastMotion();
 const choices=useTeams().filter(t=>data.players.some(p=>p.name.toLowerCase().replace(/[^a-z]/g,'')===t.legend.toLowerCase().replace(/[^a-z]/g,'')));
 const [selected,setSelected]=useState('india');const t=choices.find(t=>t.id===selected)||choices[0];
 if(!t)return <Empty title="Player spotlight awaiting publication.">Approved profiles will appear here once published.</Empty>;
 const p=data.players.find(p=>p.name.toLowerCase().replace(/[^a-z]/g,'')===t.legend.toLowerCase().replace(/[^a-z]/g,''));
 const browse=direction=>setSelected(choices[(choices.findIndex(c=>c.id===t.id)+direction+choices.length)%choices.length].id);
 return <><SectionHead tag="PLAYER SPOTLIGHT" title="Featured players" to="/players" label="All players"/><div className="spotlight-grid" style={{'--club':t.color}}>
  <div className="spotlight-portrait"><motion.span key={t.id+'-colour'} className="spotlight-team-reveal" initial={{opacity:0}} animate={{opacity:.16}} transition={{duration:spatial?.3:.15}}/>
   <AnimatePresence initial={false}><motion.img key={t.id} src={deliveryImage(t.image)} {...responsiveCampaign(t.image)} loading="lazy" decoding="async" alt={t.legend} initial={spatial?{opacity:0,x:-12}:{opacity:0}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={{duration:spatial?.45:.15,ease:broadcastEase}}/></AnimatePresence>
   <motion.div className="portrait-caption" key={t.id+'-caption'} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.25,delay:spatial?.12:0}}><Crest id={t.id}/><span>{t.name} Champions</span></motion.div>
  </div>
  <motion.div className="spotlight-bio" key={t.id+'-bio'} initial={spatial?{opacity:0,x:-8}:{opacity:0}} animate={{opacity:1,x:0}} transition={{duration:spatial?.3:.15,delay:spatial?.12:0,ease:broadcastEase}}>
   <p className="kicker">THE WCL SEASON 3 PLAYERS</p><h2>{t.legend}</h2><p className="spotlight-role">{p.role}</p><p className="spotlight-description">Explore {t.legend}'s place in the Season 3 {t.name} Champions lineup, with team information and match coverage.</p>
   <div className="player-facts"><div><small>Team</small><strong>{t.name}</strong></div><div><small>Role</small><strong>{p.role}</strong></div><div><small>Competition</small><strong>WCL</strong></div></div><Button to={`/players/${p.id}`}>View player profile</Button><p className="archive-label">Season 3 · 2026 player list</p>
  </motion.div>
  <div className="mobile-spotlight-browse" role="group" aria-label="Browse featured players"><button aria-label="Previous featured player" onClick={()=>browse(-1)}><ArrowLeft/></button><button aria-label="Next featured player" onClick={()=>browse(1)}><ArrowRight/></button></div>
  <div className="spotlight-picker" aria-label="Select featured player">{choices.map(c=><button key={c.id} className={c.id===t.id?'active':''} aria-pressed={c.id===t.id} onClick={()=>setSelected(c.id)}><img src={deliveryImage(c.image)} alt=""/><span><strong>{c.legend}</strong><small>{c.name} Champions</small></span><ArrowRight/></button>)}</div>
 </div></>
}

function HomePlayers(){const data=useLeagueData();
 const [team,setTeam]=useState('all');
 const rows=[...teams.flatMap(t=>data.players.filter(p=>p.name.toLowerCase().replace(/[^a-z]/g,'')===t.legend.toLowerCase().replace(/[^a-z]/g,''))),...[...data.players].sort((a,b)=>Number(!!b.campaign)-Number(!!a.campaign))].filter((p,i,arr)=>arr.findIndex(x=>x.id===p.id)===i).filter(p=>team==='all'||p.team===team).slice(0,8);
 return <><SectionHead tag="THE PLAYERS" title="WCL players" to="/players" label={`Explore ${data.players.length} players`}/><div className="home-player-controls"><div className="team-pills"><button className={team==='all'?'active':''} onClick={()=>setTeam('all')}>All teams</button>{teams.map(t=><button key={t.id} className={team===t.id?'active':''} onClick={()=>setTeam(t.id)} aria-label={`Show ${t.name} players`}>{t.short}</button>)}</div></div><PlayerRail selection={team}>{rows.map(p=><PlayerCard key={p.id} player={p}/>)}</PlayerRail>{!rows.length&&<Empty title="No matching players.">Try another team or player name.</Empty>}<p className="source-note player-archive-note">Season 3 player list. Match squads and appearances are announced separately.</p></>
}

function Matches(){const data=useLeagueData();return <MatchBroadcast matches={data.matches} players={data.players}/>}
function MatchDetail(){const data=useLeagueData();
 const {id}=useParams();const m=data.matches.find(m=>m.id===id);if(!m)return <NotFound/>;
 const related=data.videos.filter(v=>v.season===m.season&&m.teams.length===2&&m.teams.every(t=>v.title.toLowerCase().includes(teamById(t)?.name.toLowerCase()||'__none')));
 return <section className="wrap ms-details-page"><Link className="ms-back" to={`/matches?season=${m.season}`}><ArrowLeft/> Back to matches</Link>
  <h1 className="ms-sr-only">{m.label} · {m.teams.map(t=>teamById(t)?.name||'To be confirmed').join(' versus ')} · Season {m.season}</h1>
  <MatchStage key={m.id} match={m} players={data.players} detail/>
  <MatchInsights match={m} players={data.players} videos={related}/>
 </section>;
}
function Tabs({values,value,onChange}){return <div className="league-tabs" role="tablist">{values.map(v=><button role="tab" aria-selected={v===value} className={v===value?'active':''} onClick={()=>onChange(v)} key={v}>{v}</button>)}</div>}
function Teams(){return <><PageTitle tag="SEVEN NATIONS. ONE CROWN." title="The champions">The faces. The colours. The records behind every team.</PageTitle><section className="wrap section"><TeamShowcase teams={teams}/></section></>}
function TeamDetail(){const teams=useTeams();const teamById=id=>teams.find(t=>t.id===id);const data=useLeagueData();const {id}=useParams();const t=teamById(id);const [params,setParams]=useSearchParams();const season=validSeason(params.get('season'));const [tab,setTab]=useState('Overview'),[saved,setSaved]=useState(readSaved);
 if(!t)return <NotFound/>;
 const players=season==='3'?data.players.filter(p=>p.team===id):[],matches=inSeason(data.matches,season).filter(m=>m.teams.includes(id)),videos=inSeason(data.videos,season).filter(v=>v.teams?.includes(id)||v.title.toLowerCase().includes(t.name.toLowerCase()));
 const favorite=saved.team===id;function follow(){const next={...saved,team:favorite?null:id};localStorage.setItem('wcl-fan',JSON.stringify(next));setSaved(next)}
 return <><section className="team-top" style={{'--club':t.color}}><div className="wrap"><div><Link to="/teams" className="back"><ArrowLeft/> All teams</Link><Crest id={id} size="big"/><p className="kicker">WORLD CHAMPIONSHIP OF LEGENDS</p><h1>{t.name}<br/><em>Champions.</em></h1><button className="btn" onClick={follow}>{favorite?<Check/>:<Heart/>}{favorite?'Your team':'Make this my team'}</button><TeamInstagram id={t.id} name={t.name}/></div><img src={deliveryImage(t.image)} alt={t.name+' Champions campaign portrait'}/></div></section>
 <section className="wrap section team-content"><div className="team-season-bar"><SeasonSelect value={season} onChange={v=>setParams({season:v})}/><p>Season {season} · {2023+Number(season)} {season==='3'?'UAE':'archive'}</p></div><Tabs values={['Overview','Players','Matches','Videos']} value={tab} onChange={setTab}/>
 {tab==='Overview'?<div className="overview-grid"><div><p className="kicker">{season==='3'?'THE NEXT CHAPTER':'FROM THE ARCHIVE'}</p><h2>{season==='3'?'A nation behind every legend.':'Revisit Season '+season+'.'}</h2><p>{season==='3'?t.name+' Champions return for the UAE chapter. Meet the Season 3 players and explore the fixtures.':'Matches and highlights on this page are limited to the '+(2023+Number(season))+' edition. Historical player lists will be added when verified.'}</p><Button to={'/matches?season='+season+'&team='+id}>Explore the matches</Button></div>{season==='3'?<div className="team-quick"><span><CalendarBlank/> {matches.length} season fixtures</span><span><Play/> {videos.length} archive highlights</span><span><Users/> {season==='3'?players.length+' Season 3 players':'Historical player list unavailable'}</span></div>:<div className="tc-team-history"><h3>{t.name} · Season {season}</h3><TeamRecord id={id} season={season}/><a href={recordSources[season]} target="_blank" rel="noopener noreferrer">Record source <ArrowUpRight size={14}/></a></div>}</div>
 :tab==='Players'?<><p className="source-note">Season {season} · {season==='3'?'Player list. Match squads are announced separately.':'Historical player list.'}</p>{players.length?<div className="players-grid">{players.map(p=><PlayerCard player={p} key={p.id}/>)}</div>:<Empty title="Player list not yet available." icon={<Users size={36}/>}>The Season 3 list is not used as a substitute for this season.</Empty>}</>
 :tab==='Matches'?matches.length?<div className="match-grid">{matches.map(m=><MatchCard match={m} key={m.id}/>)}</div>:<Empty title="No fixtures for this season.">Try a different season.</Empty>
 :videos.length?<div className="video-grid">{videos.map(v=><VideoCard video={v} key={v.id}/>)}</div>:<Empty title="Highlights are on their way." icon={<Play size={36}/>}>No videos have been published for this team in Season {season}.</Empty>}</section></>
}
function Players(){const data=useLeagueData();return <><PageTitle tag="THE NAMES YOU NEVER FORGET" title="Players">Choose your team.</PageTitle><TeamPlayerDirectory players={data.players} teams={teams}/></>}
function PlayerDetail(){const data=useLeagueData();const {id}=useParams();const player=data.players.find(p=>p.id===id);if(!player)return <NotFound/>;const team=teamById(player.team);
 return <><section className={'player-profile '+(!player.campaign?'headshot-profile':'')} style={{'--club':team.color}}><div className="wrap"><div><Link className="back" to={'/players?team='+team.id}><ArrowLeft/> Season 3 players</Link><p className="kicker">{team.name.toUpperCase()} CHAMPIONS</p><h1>{player.name}</h1><p>{player.role}</p><span className="status">SEASON 3 · 2026</span></div>{player.image?<img src={deliveryImage(player.profileImage||player.image)} alt={player.name}/>:<p className="portrait-unavailable">Portrait coming soon</p>}</div></section><section className="wrap section overview-grid"><div><p className="kicker">PLAYER PROFILE</p><h2>Part of the WCL story.</h2><p>{player.name} features in the Season 3 {team.name} Champions player list.</p><p>Explore the team and its fixtures for the UAE chapter. Match squads and appearances will be confirmed separately.</p><Button to={'/matches?season=3&team='+team.id}>Team fixtures</Button></div><div className="team-quick"><Crest id={team.id} size="big"/><h3>{team.name} Champions</h3><Button to={'/teams/'+team.id}>Visit team hub</Button></div></section></>
}
function News(){return <NewsCentre/>}
function Article(){const {id}=useParams();const story=stories.find(s=>s.id===id);if(!story)return <NotFound/>;return <article><PageTitle tag={story.category.toUpperCase()} title={story.title}>{story.intro}</PageTitle><div className="wrap article"><Link className="back" to="/news"><ArrowLeft/> All stories</Link><img className="article-image" src={deliveryImage(story.image)} alt="WCL campaign artwork"/><div className="article-body"><span className="kicker">WCL EDITORIAL · SOURCE SUMMARY</span>{story.body.map(p=><p key={p}>{p}</p>)}{story.source?.startsWith('/assets/')&&<a className="text-link" href={story.source} target="_blank" rel="noreferrer">View campaign artwork <ArrowUpRight/></a>}<div className="hero-buttons"><Button to="/season">Explore Season 3</Button><Button to="/watch">Watch highlights</Button></div></div></div></article>}
function Watch(){const data=useLeagueData();const [params,setParams]=useSearchParams();const season=params.get('season')||'all';const [query,setQuery]=useState('');const videos=data.videos.filter(v=>(season==='all'||String(v.season)===season)&&v.title.toLowerCase().includes(query.toLowerCase()));return <><PageTitle tag="REPLAY THE EXTRAORDINARY" title="WCL TV">Officially linked highlights from the first two chapters.</PageTitle><section className="wrap section"><div className="filters"><SeasonSelect includeAll value={season} onChange={v=>setParams({season:v})}/><label className="input-search"><MagnifyingGlass/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search videos" placeholder="Search videos or teams"/></label></div><p className="source-note">{videos.length} videos · From the WCL season archives</p><div className="video-grid library">{videos.map(v=><VideoCard video={v} key={v.id}/>)}</div>{!videos.length&&<Empty title="No videos available for this selection." icon={<Play size={36}/>}>Choose an archive season or clear the search.</Empty>}</section></>}
function VideoDetail(){const data=useLeagueData();const {id}=useParams();const video=data.videos.find(v=>v.id===id);const [saved,setSaved]=useState(readSaved);if(!video)return <NotFound/>;const isSaved=saved.videos?.includes(id);function toggle(){const next={...saved,videos:isSaved?saved.videos.filter(v=>v!==id):[...(saved.videos||[]),id]};localStorage.setItem('wcl-fan',JSON.stringify(next));setSaved(next)}return <><PageTitle tag={`WCL TV · SEASON ${video.season}`} title="Match highlights"/><section className="wrap section"><Link className="back" to="/watch"><ArrowLeft/> All videos</Link><div className="video-player video-player-broadcast"><BroadcastVideo videoId={id} title={video.title} initiallyOpen/></div><div className="video-description"><h2>{video.title}</h2><button className="btn" onClick={toggle}>{isSaved?<Check/>:<Heart/>}{isSaved?'Saved to My WCL':'Save video'}</button></div><p className="source-note">Official WCL highlights · YouTube player</p><SectionHead tag="KEEP WATCHING" title="More highlights"/><div className="video-grid">{data.videos.filter(v=>v.season===video.season&&v.id!==id).slice(0,4).map(v=><VideoCard key={v.id} video={v}/>)}</div></section></>}

function Season(){const data=useLeagueData();return <><PageTitle tag="03—18 OCTOBER 2026 · UNITED ARAB EMIRATES" title="Season 3">Season 3. Seven nations. The legends return.</PageTitle><section className="wrap section"><img className="season-banner" src="/assets/wcl-approved-lineup.webp" alt="WCL Season 3 campaign"/><div className="season-summary"><div><CalendarBlank/><small>TOURNAMENT WINDOW</small><strong>3–18 October 2026</strong></div><div><MapPin/><small>HOST</small><strong>United Arab Emirates</strong></div><div><Trophy/><small>THE FIELD</small><strong>Seven championship teams</strong></div></div><SectionHead tag="YOUR SEASON GUIDE" title="Get closer to the game."/><div className="guide-grid">{[['/matches','Fixtures','Find the schedule and explore past seasons.'],['/teams','Teams','Meet the nations behind the championship.'],['/tickets','Tickets & venues','Check the latest event information.']].map(([to,title,copy])=><Link className="guide-card" to={to} key={to}><h3>{title}</h3><p>{copy}</p><ArrowRight/></Link>)}</div></section></>}
function Tickets(){const data=useLeagueData();const [params]=useSearchParams();const [selected,setSelected]=useState(params.get('match')||'');const listings=usePublished('tickets',[]);const fixtures=inSeason(data.matches,'3');const fixture=fixtures.find(m=>m.id===selected);
 const ticket=listings.find(t=>t.matchId===selected&&t.verificationStatus==='verified'),canBook=ticket?.availability==='on-sale'&&/^https:\/\//.test(ticket.bookingUrl||'');
 return <><PageTitle tag="BE PART OF THE NEXT CHAPTER" title="Your matchday starts here.">Season 3 · United Arab Emirates · 3–18 October 2026</PageTitle><section className="wrap section"><div className="ticket-planner"><div><p className="kicker">PLAN YOUR VISIT</p><h2>Pick the match.<br/>Feel the occasion.</h2><p>Find your fixture, check the start time and follow ticket availability in one place.</p><label className="select-label">Choose a match<select aria-label="Choose a match" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">All Season 3 matches</option>{fixtures.map(m=><option key={m.id} value={m.id}>{m.date} · {m.teams.length?m.teams.map(id=>teamById(id)?.name).join(' × '):m.label}</option>)}</select></label></div><div className="ticket-availability"><Ticket size={32}/><span className="status">{canBook?'ON SALE':ticket?.availability==='sold-out'?'SOLD OUT':'TICKETS COMING SOON'}</span><h3>{fixture?fixture.teams.map(id=>teamById(id)?.name).join(' × ')||fixture.label:'The UAE chapter'}</h3><dl><div><dt>When</dt><dd>{fixture?matchMoment(fixture):'3–18 October 2026'}</dd></div><div><dt>Stadium</dt><dd>{ticket?.venue||'Allocation to be announced'}</dd></div><div><dt>Tickets</dt><dd>{ticket?.priceLabel||'Pricing to be announced'}</dd></div></dl>{canBook?<a className="btn" href={ticket.bookingUrl} target="_blank" rel="noopener noreferrer">Book with {ticket.provider||'the authorized partner'}<ArrowUpRight/></a>:<p>{ticket?.availability==='sold-out'?'Tickets for this fixture are sold out. Check another match for availability.':'Booking links will appear here once the authorized ticketing partner is confirmed.'}</p>}{fixture&&<Link className="text-link" to={'/matches/'+fixture.id}>Match information <ArrowRight/></Link>}</div></div><StadiumExplorer/><div className="overview-grid section"><div><p className="kicker">BEFORE YOU GO</p><h2>Know your matchday.</h2><p>All fixture times are in UAE time (UTC+4). Explore venue maps above. Match-specific entry gates, accessibility information and transport guidance will be added once stadium allocations are confirmed.</p><Button to="/matches?season=3">Explore all fixtures</Button></div><div className="faq-list"><details><summary>When can I book?</summary><p>Season 3 sales have not been verified yet. Confirmed booking links will be published on this page. Avoid unverified resellers.</p></details><details><summary>Are Dubai and Sharjah confirmed match venues?</summary><p>The destination films introduce the UAE. They do not confirm where an individual fixture will be played.</p></details><details><summary>Will hospitality and accessible tickets be available?</summary><p>Categories, pricing and accessible seating arrangements are awaiting the authorized provider’s confirmation.</p></details></div></div></section></>
}
function FanZone(){const data=useLeagueData();const [saved,setSaved]=useState(readSaved);const [message,setMessage]=useState('');function choose(id){const next={...saved,team:id};localStorage.setItem('wcl-fan',JSON.stringify(next));setSaved(next);setMessage(`${teamById(id).name} saved as your team.`)}return <><PageTitle tag="YOUR COLOURS. YOUR CRICKET." title="My WCL">Your team and favourite moments, saved on this device.</PageTitle><section className="wrap section"><SectionHead tag="PICK A SIDE" title="Who are your champions?"/><div className="fan-teams">{teams.map(t=><button key={t.id} className={saved.team===t.id?'selected':''} aria-pressed={saved.team===t.id} onClick={()=>choose(t.id)}><Crest id={t.id} size="big"/>{t.name}{saved.team===t.id&&<Check/>}</button>)}</div><p role="status" className="save-status">{message}</p>{saved.team&&<Button to={`/teams/${saved.team}`}>Visit my team</Button>}<div className="section"><SectionHead tag="YOUR COLLECTION" title="Saved videos"/><div className="video-grid">{data.videos.filter(v=>saved.videos?.includes(v.id)).map(v=><VideoCard video={v} key={v.id}/>)}</div>{!saved.videos?.length&&<Empty title="Keep your favourite moments here." icon={<Heart size={36}/>}>Open a video and select Save video. No account is needed for preferences stored on this device.</Empty>}</div></section></>}
function Gallery(){const teams=useTeams();const data=useLeagueData();const [selected,setSelected]=useState(null);const dialog=useRef(null);useEffect(()=>{if(selected)dialog.current?.showModal()},[selected]);return <><PageTitle tag="THE LEGENDS, IN FOCUS" title="Campaign gallery">The Season 3 campaign collection.</PageTitle><section className="wrap section"><div className="gallery-grid">{teams.map(t=><button key={t.id} onClick={()=>setSelected(t)}><img loading="lazy" src={deliveryImage(t.image)} alt={`${t.name} campaign artwork`}/><span>{t.name} Champions <ArrowUpRight/></span></button>)}</div></section><dialog ref={dialog} onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget){dialog.current.close();setSelected(null)}}}><button className="dialog-close" aria-label="Close gallery" onClick={()=>{dialog.current.close();setSelected(null)}}><X/></button>{selected&&<img src={selected.image} alt={`${selected.name} campaign artwork`}/>}</dialog></>}
function About(){const page=usePageCopy("/about");return <><PageTitle tag="WORLD CHAMPIONSHIP OF LEGENDS" title="About WCL"/><section className="wrap section overview-grid"><div><p className="kicker">ABOUT WCL</p><h2>Great names.<br/>A shared stage.</h2>{page?.sections?.length?page.sections.map(s=><div key={s.id}><h3>{s.title}</h3><RichCopy text={s.body}/></div>):<><p>World Championship of Legends brings celebrated international cricketers back together in national team colours. Seven championship teams come together for Season 3 in the UAE.</p><p>The first two season archives preserve the matches and moments that built the league's story.</p></>}<Button to="/watch">Explore the archive</Button></div><div className="team-quick"><h3>Team behind WCL</h3><Link to="/about#harshit-tomar">Harshit Tomar · Founder & CEO ↗</Link><Link to="/about#ajay-devgn">Ajay Devgn · Co-Founder ↗</Link><p className="source-note">The people behind the championship.</p></div></section><LeadershipProfiles/></>}
function NotFound(){return <><PageTitle tag="404 · OUTSIDE THE BOUNDARY" title="That page is out of play."/><section className="wrap section"><Button to="/">Return to WCL</Button></section></>}
function LeaguePages(){useSeo();const location=useLocation();const players=usePublished('players',data.players),matches=usePublished('fixtures',data.matches),videos=usePublished('videos',data.videos);if(location.pathname==='/accreditation'||location.pathname==='/accreditation/apply')return <Suspense fallback={<p role="status">Loading application portal…</p>}><ApplicantPortal/></Suspense>;if(location.pathname.startsWith('/admin')||location.pathname==='/accreditation/review')return <Suspense fallback={<p role="status" className="wrap section">Loading administration…</p>}><Admin key={location.pathname} portal={location.pathname==='/accreditation/review'?'accreditation':'cms'}/></Suspense>;return <LeagueData.Provider value={{...data,players:players.map(withCampaignPortrait),matches:matches.map(withArchiveFinal),videos}}><Layout><Routes><Route path="/" element={<Home/>}/><Route path="/season" element={<Season/>}/><Route path="/seasons/1" element={<SeasonArchive season={1}/>}/><Route path="/seasons/2" element={<SeasonArchive season={2}/>}/><Route path="/accreditation/process" element={<Suspense fallback={<p role="status" className="wrap section">Loading accreditation information…</p>}><AccreditationPlan/></Suspense>}/><Route path="/experience" element={<Navigate to="/tickets" replace/>}/><Route path="/teams" element={<Teams/>}/><Route path="/teams/:id" element={<TeamDetail/>}/><Route path="/players" element={<Players/>}/><Route path="/players/:id" element={<PlayerDetail/>}/><Route path="/matches" element={<Matches/>}/><Route path="/matches/:id" element={<MatchDetail/>}/><Route path="/standings" element={<Navigate to="/matches" replace/>}/><Route path="/stats" element={<Navigate to="/players" replace/>}/><Route path="/news" element={<News/>}/><Route path="/news/the-uae-stage" element={<DestinationStory/>}/><Route path="/news/:id" element={<Article/>}/><Route path="/watch" element={<Watch/>}/><Route path="/watch/:id" element={<VideoDetail/>}/><Route path="/tickets" element={<Tickets/>}/><Route path="/fan-zone" element={<FanZone/>}/><Route path="/gallery" element={<Gallery/>}/><Route path="/search" element={<Navigate to="/" replace/>}/><Route path="/about" element={<About/>}/><Route path="/faq" element={<CricketAnswers/>}/><Route path="/india-vs-pakistan" element={<RivalryGuide/>}/><Route path="/privacy" element={<PolicyPage/>}/><Route path="/cookies" element={<PolicyPage key="cookies" kind="cookies"/>}/><Route path="/terms" element={<PolicyPage key="terms" kind="terms"/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="*" element={<NotFound/>}/></Routes></Layout></LeagueData.Provider>}
export function League(){return <BrowserRouter><LeaguePages/></BrowserRouter>}
export {LeaguePages, stories, teams};
