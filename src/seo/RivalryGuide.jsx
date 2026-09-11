import {Link} from 'react-router-dom';
import {season3Matches} from '../season3-schedule.js';
import {teams} from '../league-editorial.js';
export function RivalryGuide(){
  const match=season3Matches.find(m=>m.id==='s3-match-14');
  return <article className="rivalry-guide">
    <div className="page-title"><div className="wrap"><p className="kicker">WCL · INDIA × PAKISTAN</p><h1>One rivalry.<br/>Another chapter.</h1><p>India Champions and Pakistan Champions meet in the published WCL Season 3 schedule on {match.date}, at {match.time} UAE time (UTC+4).</p></div></div>
    <section className="wrap section rivalry-guide-grid">
      <div><h2>The next meeting.</h2><dl><div><dt>Date</dt><dd><time dateTime={match.startsAt}>{match.date}</time></dd></div><div><dt>Start time</dt><dd>{match.time} UAE · UTC+4</dd></div><div><dt>Competition</dt><dd>World Championship of Legends · Season 3</dd></div><div><dt>Location</dt><dd>United Arab Emirates</dd></div></dl><Link className="btn" to={'/matches/'+match.id}>Open match details <span aria-hidden="true">↗</span></Link><p className="source-note">Based on the published Season 3 schedule. Recheck the match page before making travel plans.</p><a className="text-link" href={match.source} target="_blank" rel="noreferrer">View the schedule source ↗</a></div>
      <div className="rivalry-guide-teams">{teams.filter(t=>['india','pakistan'].includes(t.id)).map(t=><Link key={t.id} to={'/teams/'+t.id}><img src={t.logo} width="80" height="80" alt={t.name+' Champions crest'}/><div><h2>{t.name}<br/>Champions</h2><span>Team, players & season records ↗</span></div></Link>)}</div>
    </section>
    <section className="wrap section rivalry-guide-history"><p className="kicker">THE FIRST CHAPTER · 2024</p><h2>A final to remember.</h2><p>India Champions won the first WCL final against Pakistan Champions by five wickets. Pakistan made 156/6 in 20 overs; India reached 159/5 in 19.1 overs.</p><div className="answer-links"><Link to="/matches/s1-18">The verified 2024 final ↗</Link><Link to="/watch">Explore WCL highlights ↗</Link><Link to="/faq">More WCL answers ↗</Link></div></section>
  </article>;
}
