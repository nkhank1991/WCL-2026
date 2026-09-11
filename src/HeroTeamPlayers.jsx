import {withCampaignPortrait} from './player-art.js';
import {PlayerCard,PlayerRail} from './PlayerCard.jsx';
import {SignatureSweep} from './BroadcastGraphics.jsx';

// Campaign poster names are not a selection list. Only published roster identities
// receive player/profile cards; original source names and portrait approvals remain.
export function HeroTeamPlayers({team='bangladesh',players:publishedPlayers=[]}){
 const players=publishedPlayers.filter(p=>p.team===team).map(withCampaignPortrait);
 const featured=['bangladesh-shakibalhasan','bangladesh-mahmudullahriyad','bangladesh-mohammadashraful'];
 const ranked=players.toSorted((a,b)=>(featured.includes(a.id)?featured.indexOf(a.id):99)-(featured.includes(b.id)?featured.indexOf(b.id):99));
 return <div className="hero-team-players" data-hero-interactive="true" aria-label="Bangladesh Season 3 players"><SignatureSweep/>
  <PlayerRail selection={team} label="Browse Bangladesh players" description="Bangladesh Champions · Season 3">{ranked.map(player=><PlayerCard key={player.id} player={player}/>)}</PlayerRail>
  <p className="hero-team-note">{players.length} listed players · Match selection to be confirmed.</p>
 </div>;
}
