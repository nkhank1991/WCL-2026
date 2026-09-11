import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import postcss from 'postcss';
import {teamRecords,teamRecord,captainAppointments,withArchiveFinal} from '../src/team-records.js';
import archive from '../src/data/wcl.json' with {type:'json'};

for(const season of [1,2]){
 assert.equal(Object.keys(teamRecords[season]).length,6);
 for(const row of Object.values(teamRecords[season])){
  assert.equal(row.played,row.wins+row.losses+row.noResult);
  assert.equal(row.points,row.wins*2+row.noResult);
 }
 assert.equal(teamRecord('bangladesh',season),null,'a debut is not a zero record');
}
assert.equal(teamRecord('india',1).finish,'Champions');
assert.equal(teamRecord('south-africa',2).finish,'Champions');
assert.equal(teamRecord('india',2).finish,'Semi-final qualification');
assert.equal(teamRecord('australia',2).wins,2);
assert.equal(Object.keys(captainAppointments).length,1,'only published appointment may carry the captain label');
assert.equal(captainAppointments.australia.name,'David Warner');
const original=archive.matches.find(m=>m.id==='s2-18');
const final=withArchiveFinal(original);
assert.deepEqual(final.scores,['195/5 (20)','197/1 (16.5)']);
assert.equal(original.status,'Archive schedule','source is not mutated');
assert.equal(original.scores,undefined);
assert.equal(archive.matches.map(withArchiveFinal).filter(m=>m.verificationStatus==='verified').length,2);
for(const change of [{status:'Cancelled'},{status:'Postponed'},{verificationStatus:'verified'},{season:1},{teams:['india','australia']},{id:'unrelated'}]){
 const record={...original,...change};
 assert.equal(withArchiveFinal(record),record,'an edited, verified or mismatched record is never overwritten');
}
const css=await readFile('src/team-score-finish.css','utf8');
postcss.parse(css).walkRules(rule=>assert(rule.selector.startsWith('.wcl-public')||rule.selector==='body:has(.wcl-public)','public-only styling'));
assert(css.includes('prefers-reduced-motion:reduce'));
console.log('PASS twelve sourced league records, debut state, captain verification and two non-mutating final score summaries');

const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:4173/',pretendToBeVisual:true});
for(const key of ['window','document','HTMLElement','Node','Element','SVGElement','localStorage','MutationObserver'])
 Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
window.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
window.scrollTo=()=>{};
HTMLElement.prototype.scrollIntoView=()=>{};
HTMLElement.prototype.scrollBy=function({left}){this.scrollLeft+=left;this.dispatchEvent(new window.Event('scroll'))};
globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);
globalThis.getComputedStyle=window.getComputedStyle.bind(window);
globalThis.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
globalThis.fetch=async()=>({ok:false});
const React=await import('react');
const {render,screen,fireEvent,cleanup}=await import('@testing-library/react');
const outfile=path.resolve('node_modules/.cache/team-score-cards-tests.mjs');
await build({stdin:{contents:"export {League} from './src/League.jsx'; export {matchDate} from './src/MatchBroadcast.jsx';",resolveDir:process.cwd()},outfile,bundle:true,platform:'node',format:'esm',jsx:'automatic',external:['react','react-dom','react/*','react-dom/*'],loader:{'.css':'empty'}});
const {League,matchDate}=await import(pathToFileURL(outfile).href);
function page(url){cleanup();window.history.replaceState({},'',url);render(React.createElement(League))}
try{
 const date=matchDate(original);
 assert.deepEqual(date,{date:'2 Aug',day:'Sat',time:'4:30 PM',zone:'BST'});
 assert.equal(matchDate({date:'No confirmed date'}).time,'Time TBC');
 page('/teams');
 assert.equal(document.querySelectorAll('.tc-card').length,7);
 assert.equal(document.querySelectorAll('.tc-portrait>img').length,7);
 assert.equal(document.querySelectorAll('.tc-identity>img').length,7);
 assert.equal(document.querySelectorAll('a a').length,0);
 assert.equal(document.querySelector('[data-team=australia] .tc-player>span').textContent,'Captain · Season 3');
 assert.equal(document.querySelector('[data-team=india] .tc-player>span').textContent,'Featured legend');
 assert.equal(document.querySelector('[data-team=india] .tc-finish').textContent,'Semi-final qualification');
 fireEvent.click(screen.getByRole('button',{name:'WCL 1 2024'}));
 assert.equal(screen.getByRole('button',{name:'WCL 1 2024'}).getAttribute('aria-pressed'),'true');
 assert.equal(document.querySelector('[data-team=india] .tc-finish').textContent,'Champions');
 assert.equal(document.querySelectorAll('.tc-record-label').length,7);
 assert(document.querySelector('[data-team=bangladesh] .tc-debut').textContent.includes('No Season 1 record'));
 assert.equal(document.querySelector('[data-team=india] .tc-actions a').getAttribute('href'),'/teams/india');
 page('/');
 assert(document.querySelector('.tc-track[tabindex="0"]'),'focusable browsing track');
 assert(screen.getByRole('button',{name:'Previous teams'}).disabled);
 page('/matches?season=2&view=results');
 assert.equal(document.querySelectorAll('.mc-fixture').length,1);
 assert.equal(document.querySelectorAll('.ms-score').length,2);
 assert.equal(document.querySelector('.ms-team-winner .ms-score strong').textContent,'197/1');
 assert.equal(document.querySelector('.ms-versus small').textContent,'Final score');
 assert.equal(document.querySelector('.mc-fixture-time time').textContent,'4:30 PM');
 assert.equal(document.querySelectorAll('.mc-row-score').length,2);
 page('/matches/s1-18');
 assert.equal(document.querySelector('.ms-team-winner .ms-score strong').textContent,'159/5');
 assert.equal(document.querySelector('.ms-score-source').getAttribute('href'),'https://www.cricbuzz.com/live-cricket-scorecard/100861/indch-vs-pakch-final-world-championship-of-legends-2024');
 assert.equal(document.querySelector('.ms-stage').dataset.matchState,'result');
 page('/matches/s3-match-1');
 assert.equal(document.querySelector('.ms-stage').dataset.matchState,'scheduled');
 assert.equal(document.querySelectorAll('.ms-score').length,0);
 assert.equal(document.querySelectorAll('.ms-score-source').length,0);
 console.log('PASS seven original hero cards, synchronized season selection, labelled captain, rail accessibility, exact archive dates, two final summaries and no fabricated Season 3 scores');
}finally{cleanup();dom.window.close();}
