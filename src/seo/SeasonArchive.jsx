import {Link} from 'react-router-dom';
import source from '../data/wcl.json';
import {teams} from '../league-editorial.js';
import {withArchiveFinal} from '../team-records.js';
export function SeasonArchive({season}){
  const year=season===1?2024:2025;
  const matches=source.matches.filter(m=>m.season===season).map(withArchiveFinal);
  const final=matches.find(m=>m.label==='Final');
  const videos=source.videos.filter(v=>v.season===season);
  const label=m=>m.teams.map(id=>teams.find(t=>t.id===id)?.name||'Qualifier').join(' vs ');
  return <article>
    <div className="page-title"><div className="wrap"><p className="kicker">WCL ARCHIVE · {year}</p><h1>Season {season}.<br/>The {year} chapter.</h1><p>{season===1?'India Champions won the inaugural World Championship of Legends title.':'South Africa Champions won the second World Championship of Legends title.'} Revisit the published fixtures and highlights.</p></div></div>
    <section className="wrap section rivalry-guide-history"><p className="kicker">THE VERIFIED FINAL</p><h2>{final.result}</h2><p>{label(final)}. {final.scores.join(' · ')}.</p><div className="answer-links"><Link to={'/matches/'+final.id}>Final score summary ↗</Link><Link to={'/watch?season='+season}>Season {season} highlights ↗</Link><Link to={'/seasons/'+(season===1?2:1)}>Explore Season {season===1?2:1} ↗</Link></div></section>
    <section className="wrap section archive-lists"><div><h2>Fixtures</h2><p className="source-note">Archive schedule records. Only independently verified results are shown.</p><ul>{matches.map(m=><li key={m.id}><Link to={'/matches/'+m.id}>{m.label} · {label(m)}<br/><span>{m.date}</span></Link></li>)}</ul></div><div><h2>Highlights</h2><p className="source-note">From the original WCL season video collection.</p><ul>{videos.map(v=><li key={v.id}><Link to={'/watch/'+v.id}>{v.title}</Link></li>)}</ul></div></section>
  </article>;
}
