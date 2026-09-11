import source from '../data/wcl.json' with {type:'json'};
import {teams,stories} from '../league-editorial.js';
import {season3Players} from '../season3-roster.js';
import {season3Matches} from '../season3-schedule.js';
import {withArchiveFinal} from '../team-records.js';
import {answers} from './answers.js';
import {absoluteUrl,canonicalPath,seoConfig} from './config.js';

const team = id => teams.find(t => t.id === id);
const teamName = id => team(id)?.name || 'Qualifier';
const allMatches = [...season3Matches,...source.matches].map(withArchiveFinal);
const shareImage = '/assets/wcl-approved-lineup.webp';
const staticPages = {
  '/':['WCL | World Championship of Legends Cricket','World Championship of Legends cricket: discover seven teams, the UAE 2026 Season 3 schedule, India vs Pakistan, players and WCL highlights.','Home'],
  '/season':['WCL 2026 Season 3 | UAE Dates, Teams & Schedule','Explore WCL Season 3 in the UAE, scheduled for 3–18 October 2026. Find seven teams, the 24-match schedule and tournament information.','Season 3'],
  '/seasons/1':['WCL 2024 Season 1 | India Champions, Final & Highlights','Revisit World Championship of Legends 2024: India Champions won the first title. Explore the verified final, archive fixtures and Season 1 highlights.','Season 1 · 2024'],
  '/seasons/2':['WCL 2025 Season 2 | South Africa Champions & Highlights','Revisit World Championship of Legends 2025: South Africa Champions won the second title. Explore the verified final, archive fixtures and highlights.','Season 2 · 2025'],
  '/teams':['WCL Teams | Seven Champions Teams & Season Records','Explore all seven World Championship of Legends teams, player lists, original team crests and records from WCL Seasons 1 and 2.','Teams'],
  '/players':['WCL Players | Season 3 Player Lists by Team','Browse the WCL Season 3 player directory by team. Explore profiles for India, Pakistan, South Africa, Australia, England, West Indies and Bangladesh.','Players'],
  '/matches':['WCL Match Centre | 2026 Fixtures & Season Archives','Follow WCL cricket fixtures: the UAE 2026 schedule and Seasons 1 and 2 archives, with verified final results and match details.','Matches'],
  '/news':['WCL Cricket News | Teams, Players & Tournament Stories','Explore World Championship of Legends news, team updates, player stories and the UAE chapter, with links to original reporting.','News'],
  '/watch':['WCL TV | Cricket Match Highlights, Seasons 1 & 2','Replay World Championship of Legends match highlights from the first two seasons. Browse teams and open videos from the original publisher.','WCL TV'],
  '/tickets':['WCL Tickets & Venues | Plan Your UAE Matchday','Find the latest WCL ticket and UAE venue information. Authorized booking links and prices will be published when confirmed.','Tickets'],
  '/gallery':['WCL Gallery | Cricket Campaigns & Championship Moments','Explore World Championship of Legends imagery, campaign artwork and moments from across the league.','Gallery'],
  '/about':['About WCL | World Championship of Legends Cricket','Learn about World Championship of Legends, the teams, the people behind the league and its next chapter in the UAE.','About WCL'],
  '/faq':['WCL Cricket FAQ | Dates, Teams, Highlights & Tickets','Answers to WCL questions: what the league is, when Season 3 takes place, India vs Pakistan, past champions, players, highlights and tickets.','Frequently asked questions'],
  '/contact':['Contact WCL | General, Media & Partnership Enquiries','Contact World Championship of Legends at info@wclcricket.com for general enquiries, media, partnerships and ticket information.','Contact'],
  '/privacy':['Privacy Policy | World Championship of Legends','Read how the WCL website handles contact enquiries, browser preferences, third-party services and privacy requests.','Privacy Policy'],
  '/cookies':['Cookies & Browser Storage | WCL','Understand WCL browser preferences, local storage and third-party media services, and manage locally saved WCL preferences.','Cookies & storage'],
  '/terms':['Website Terms of Use | WCL','Read the terms for using the World Championship of Legends website, its editorial content, media links and contact services.','Terms of use'],
  '/india-vs-pakistan':['India vs Pakistan WCL 2026 | Date, Time & Match Guide','India Champions vs Pakistan Champions: 10 October 2026 at 19:30 UAE time. Explore the WCL fixture, team lists and the verified 2024 final.','India vs Pakistan'],
  '/sitemap':['Explore WCL | Teams, Players, Fixtures & Stories','Find your way around WCL: all teams, listed players, fixtures, highlights, stories and essential information in one directory.','Explore WCL'],
  '/news/the-uae-stage':['The UAE Stage | WCL Destination Guide','Explore Dubai and Sharjah through credited destination films and discover the setting for the next World Championship of Legends chapter.','The UAE stage'],
};
export const publicRoutes = [
  ...Object.keys(staticPages),
  ...teams.map(t => '/teams/'+t.id),
  ...season3Players.map(p => '/players/'+p.id),
  ...allMatches.map(m => '/matches/'+m.id),
  ...source.videos.map(v => '/watch/'+v.id),
  ...stories.map(s => '/news/'+s.id),
];
export const isPrivatePath = path => /^\/(admin|api|accreditation)(\/|$)/.test(path) || path === '/fan-zone';
export const organization = {
  '@type':'SportsOrganization','@id':absoluteUrl('/#organization'),
  name:'World Championship of Legends',alternateName:'WCL',sport:'Cricket',
  url:absoluteUrl('/'),logo:absoluteUrl('/assets/wcl-official-logo.png'),
  email:'info@wclcricket.com',
  sameAs:['https://www.instagram.com/worldchampionshipoflegends/','https://x.com/wclleague','https://www.youtube.com/@Wclcricket','https://www.linkedin.com/company/world-championships-of-legends-league'],
};
const teamEntity = t => ({'@type':'SportsTeam','@id':absoluteUrl('/teams/'+t.id+'#team'),name:t.name+' Champions',sport:'Cricket',url:absoluteUrl('/teams/'+t.id),logo:absoluteUrl(t.logo)});
const compact = text => text.replace(/\s+/g,' ').trim();
export function pageMetadata(input, config = seoConfig) {
  const path=canonicalPath(input), canonical=absoluteUrl(path);
  const known=publicRoutes.includes(path);
  const base=staticPages[path];
  let title=base?.[0] || 'Page not found | WCL';
  let description=base?.[1] || 'This WCL page could not be found. Explore the team directory, match centre or highlights library.';
  let label=base?.[2] || 'Page not found', image=shareImage, extra=[], parent;
  const [section,id]=path.split('/').filter(Boolean);
  if(section==='teams' && id && team(id)){
    const t=team(id);label=t.name+' Champions';title=label+' | WCL Team, Players & Records';
    description=`Explore ${label} in World Championship of Legends: the Season 3 player list, fixtures and available WCL season records.`;
    parent=['Teams','/teams']; extra=[teamEntity(t)];
  }
  if(section==='players' && id){
    const p=season3Players.find(p=>p.id===id);
    if(p){label=p.name;title=p.name+' | '+teamName(p.team)+' Champions | WCL';
      description=`Explore ${p.name} in the ${teamName(p.team)} Champions Season 3 player directory, with team links and available profile information. Match squads are announced separately.`;
      parent=['Players','/players'];
      extra=[{'@type':'Person','@id':canonical+'#person',name:p.name,url:canonical,...(p.image?{image:absoluteUrl(p.image)}:{})}];
    }
  }
  if(section==='matches' && id){
    const m=allMatches.find(m=>m.id===id);
    if(m){label=m.teams.length===2?m.teams.map(teamName).join(' vs '):m.label;
      title=`${label} | WCL S${m.season} ${m.label}`;
      description=compact(`${label}, ${m.label}, WCL Season ${m.season}. ${m.date}${m.time?' at '+m.time+' UAE (UTC+4)':''}. ${m.result || 'View fixture information and team links.'}`);
      parent=['Matches','/matches'];
      // SportsEvent describes the published schedule, not a promise of Google event eligibility.
      if(m.startsAt) extra=[{'@type':'SportsEvent','@id':canonical+'#event',name:label+' — WCL '+m.label,
        description,startDate:m.startsAt,url:canonical,sport:'Cricket',
        location:{'@type':'Place',name:'United Arab Emirates'},
        organizer:{'@id':organization['@id']},competitor:m.teams.map(team).filter(Boolean).map(teamEntity)}];
    }
  }
  if(section==='watch' && id){
    const v=source.videos.find(v=>v.id===id);
    if(v){label=v.title;title=v.title+' | WCL TV';
      description=compact(`Watch ${v.title}. Open the original YouTube highlight through WCL TV. Playback is subject to publisher availability.`);
      image=v.thumbnail || shareImage;parent=['WCL TV','/watch'];
      // No fabricated uploadDate or duration. Add VideoObject only after verifying those source fields.
    }
  }
  if(section==='news' && id){
    const s=stories.find(s=>s.id===id);
    if(s){label=s.title;title=s.title+' | WCL';description=compact(s.intro+' '+s.body[0]);parent=['News','/news'];image=s.image;}
    if(id==='the-uae-stage')parent=['News','/news'];
  }
  if(path==='/fan-zone'){title='My WCL | Saved Team & Videos';description='Your favourite WCL team and saved videos, stored only in this browser.';label='My WCL';}
  if(isPrivatePath(path) && path!=='/fan-zone'){title='Private portal | WCL';description='WCL private services.';label='Private portal';}
  const breadcrumbs=path==='/'?[]:[{name:'Home',path:'/'},...(parent?[{name:parent[0],path:parent[1]}]:[]),{name:label,path}];
  const indexable=config.indexable && known && !isPrivatePath(path);
  const webPage={'@type':path==='/faq'?'FAQPage':(['teams','players','matches','news','watch'].includes(section)&&!id?'CollectionPage':'WebPage'),
    '@id':canonical+'#webpage',url:canonical,name:title,description,inLanguage:'en',
    isPartOf:{'@id':absoluteUrl('/#website')},publisher:{'@id':organization['@id']},
    ...(extra.length?{about:{'@id':extra[0]['@id']}}:{}),
    ...(path==='/faq'?{mainEntity:answers.map(a=>({'@type':'Question',name:a.q,acceptedAnswer:{'@type':'Answer',text:a.a}}))}:{})};
  const graph=known?[organization,{'@type':'WebSite','@id':absoluteUrl('/#website'),url:absoluteUrl('/'),name:'World Championship of Legends',alternateName:'WCL',inLanguage:'en',publisher:{'@id':organization['@id']}},webPage,...extra]:[];
  if(known&&breadcrumbs.length)graph.push({'@type':'BreadcrumbList','@id':canonical+'#breadcrumbs',itemListElement:breadcrumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:absoluteUrl(c.path)}))});
  return {path,known,title,description,canonical,image:absoluteUrl(image),imageAlt:'World Championship of Legends',breadcrumbs,
    robots:indexable?'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1':'noindex, follow',
    graph:{'@context':'https://schema.org','@graph':graph}};
}
export function directoryGroups(){
  return [
    {title:'Tournament & information',items:Object.keys(staticPages).filter(p=>p!=='/sitemap'&&!p.startsWith('/news/')).map(path=>({path,label:staticPages[path][2]}))},
    {title:'Teams',items:teams.map(t=>({path:'/teams/'+t.id,label:t.name+' Champions'}))},
    ...teams.map(t=>({title:t.name+' players',items:season3Players.filter(p=>p.team===t.id).map(p=>({path:'/players/'+p.id,label:p.name}))})),
    ...[3,2,1].map(season=>({title:'Season '+season+' fixtures',items:allMatches.filter(m=>m.season===season).map(m=>({path:'/matches/'+m.id,label:pageMetadata('/matches/'+m.id).title.replace(/ \| WCL/,' · WCL')}))})),
    {title:'WCL TV',items:source.videos.map(v=>({path:'/watch/'+v.id,label:v.title}))},
    {title:'Editorial',items:[...stories.map(s=>({path:'/news/'+s.id,label:s.title})),{path:'/news/the-uae-stage',label:'The UAE stage'}]},
  ];
}
