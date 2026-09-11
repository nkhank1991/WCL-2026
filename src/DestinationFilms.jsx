import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Play,ArrowUpRight,ArrowRight,X} from '@phosphor-icons/react';
export const destinationFilms=[
 {id:'dubai-skyline',title:'Dubai. Beyond the skyline.',location:'DUBAI',video:'WfTJL_h0XfY',publisher:'Visit Dubai',year:'2015',description:'A city film from Visit Dubai, pairing the modern skyline with the city’s heritage.',source:'https://www.youtube.com/watch?v=WfTJL_h0XfY'},
 {id:'sharjah-stadium',title:'Sharjah. A cricket landmark.',location:'SHARJAH',video:'JGGhTGX7xhE',publisher:'Sharjah Cricket Stadium',year:'2020',description:'Explore the ground through the stadium’s own introductory film.',source:'https://www.youtube.com/watch?v=JGGhTGX7xhE'},
 {id:'dubai-stadium',title:'Inside Dubai International Stadium.',location:'DUBAI SPORTS CITY',video:'R6LEJC0r3Qc',publisher:'Royal Challengers Bengaluru',year:'2014',description:'An archive venue tour from RCB’s official channel, filmed during the 2014 IPL.',source:'https://www.youtube.com/watch?v=R6LEJC0r3Qc'}
];
export function DestinationFilms({standalone=false}){
 const [active,setActive]=useState(null);
 return <section className={'destination-films wrap section '+(standalone?'destination-page':'')} id="uae-films">
 <div className="section-title"><div><p className="kicker">THE DESTINATION / UNITED ARAB EMIRATES</p>{standalone?<h1>The stage beyond<br/>the boundary.</h1>:<h2>The stage beyond<br/>the boundary.</h2>}</div>{!standalone&&<Link to="/tickets">Explore the UAE <ArrowRight/></Link>}</div>
 <p className="destination-intro">Dubai’s skyline. Sharjah’s cricket heritage. Take a closer look at the UAE through destination and stadium films.</p>
 <div className="destination-grid">{destinationFilms.map((film,i)=><article className="destination-card" key={film.id}>
  <div className="destination-player">{active===film.id?<><iframe title={film.title} src={`https://www.youtube-nocookie.com/embed/${film.video}?autoplay=1&rel=0`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/><button className="close-film" aria-label={`Close ${film.title} video`} onClick={()=>setActive(null)}><X/></button></>:<button className="destination-poster" onClick={()=>setActive(film.id)} aria-label={`Play ${film.title}`}><img src={`https://i.ytimg.com/vi/${film.video}/hqdefault.jpg`} alt="" loading="lazy"/><span className="film-play"><Play weight="fill"/></span><span className="film-index">0{i+1} / THE UAE</span></button>}</div>
  <div className="destination-copy"><small>{film.location}</small><h3>{film.title}</h3><p>{film.description}</p><a href={film.source} target="_blank" rel="noreferrer">{film.publisher} · {film.year} <ArrowUpRight/></a></div>
 </article>)}</div>
 <p className="source-note">Destination and archive venue films—not WCL Season 3 match footage or confirmation of host stadiums. Press play to load YouTube; availability is controlled by the publisher. <Link to="/matches">View the supplied Season 3 schedule.</Link></p>
 </section>;
}
