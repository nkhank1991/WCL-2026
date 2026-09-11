import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import postcss from 'postcss';

// Public-only CSS boundary: no unscoped rule may recolour the private portals.
const css=await readFile('src/premium-finish.css','utf8');
postcss.parse(css).walkRules(rule=>{
  assert(rule.selector.startsWith('.wcl-public'), 'Unscoped finish selector: '+rule.selector);
});
assert(css.includes('prefers-reduced-motion:reduce'));
assert(css.includes('data-surface-motion=quiet'));
const entry=await readFile('src/main.jsx','utf8');
assert(entry.indexOf('./premium-finish.css')>entry.indexOf('./broadcast.css'));
console.log('PASS public-only finish ownership, last import, reduced-motion and quiet-state guards');

const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'http://localhost:4173/',pretendToBeVisual:true});
for(const key of ['window','document','HTMLElement','Node','Element','SVGElement','localStorage','MutationObserver'])
  Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
window.matchMedia=()=>({matches:true,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
window.scrollTo=()=>{};
HTMLElement.prototype.scrollIntoView=()=>{};
HTMLElement.prototype.scrollBy=function({left}){this.scrollLeft+=left};
globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);
globalThis.getComputedStyle=window.getComputedStyle.bind(window);
globalThis.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
globalThis.fetch=async()=>({ok:false});
window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};
window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
const React=await import('react');
const {render,screen,fireEvent,cleanup,waitFor,within}=await import('@testing-library/react');
const outfile=path.resolve('node_modules/.cache/navigation-rosters-tests.mjs');
await build({entryPoints:['src/League.jsx'],outfile,bundle:true,platform:'node',format:'esm',jsx:'automatic',external:['react','react-dom','react/*','react-dom/*'],loader:{'.css':'empty'}});
const {League}=await import(pathToFileURL(outfile).href);
function page(url){cleanup();window.history.replaceState({},'',url);render(React.createElement(League))}
try {
 page('/');
 assert.equal(document.querySelectorAll('.search-link,.hero-match-widget,.nation-strip').length,0);
 assert(!screen.queryByRole('textbox',{name:'Find players on homepage'}));
 assert(!screen.queryByText('Tournament information',{exact:true}));
 assert(!document.querySelector('a[href="/search"],a[href="/experience"]'));
 assert(!document.body.textContent.includes('Stadium allocations will be confirmed here before the tournament.'));
 const reels=document.querySelector('.reels-section');
 assert.equal(reels.querySelectorAll('.reel-card').length,12);
 fireEvent.change(screen.getByRole('combobox',{name:'Social channel'}),{target:{value:'bangladesh'}});
 assert.equal(reels.querySelectorAll('.reel-card').length,2);
 assert([...reels.querySelectorAll('.reel-direct-link')].every(a=>a.href.startsWith('https://www.instagram.com/bangladeshchampionsofficial/reel/')&&a.target==='_blank'&&a.rel.includes('noopener')));
 const additions=JSON.parse(await readFile('src/data/social-reels.json','utf8'));
 assert.equal(additions.length,8);
 assert.equal(new Set(additions.map(n=>n.sourceUrl)).size,8);
 for(const item of additions)assert((await readFile('public'+item.thumbnail)).length>0);
 console.log('PASS removed chrome, retired navigation and 12 curated moments with genuine team Reel destinations');

 page('/players');
 assert.equal(document.querySelectorAll('.team-roster-toggle').length,7);
 assert.equal(document.querySelectorAll('.player-profile-card').length,0);
 assert(!screen.queryByRole('textbox'));
 const expected={india:14,pakistan:13,'south-africa':14,australia:13,england:14,'west-indies':14,bangladesh:14};
 const identities=new Set();
 for(const [id,count]of Object.entries(expected)){
  fireEvent.click(document.getElementById('team-toggle-'+id));
  await waitFor(()=>assert.equal(document.querySelectorAll('.team-roster-panel').length,1));
  const region=document.getElementById('roster-'+id);
  assert.equal(region.getAttribute('aria-hidden'),'false');
  assert.equal(region.querySelectorAll('.player-profile-card').length,count);
  assert.equal(document.querySelectorAll('.team-roster-toggle[aria-expanded="true"]').length,1);
  for(const link of region.querySelectorAll('.player-portrait-link'))identities.add(link.getAttribute('href'));
  assert([...region.querySelectorAll('.player-team-strip')].every(a=>a.getAttribute('href')==='/teams/'+id+'?season=3'));
  assert(!region.querySelector('a a'));
 }
 assert.equal(identities.size,96);
 assert.equal(document.querySelectorAll('#roster-bangladesh .player-team-strip img[src="/assets/team-logos/bangladesh.webp"]').length,14);
 const back=screen.getByRole('button',{name:'Back to teams'});
 fireEvent.click(back);
 await waitFor(()=>assert.equal(document.querySelectorAll('.player-profile-card').length,0));
 assert.equal(document.activeElement.id,'team-toggle-bangladesh');
 fireEvent.keyDown(document.activeElement,{key:'Home'});
 assert.equal(document.activeElement.id,'team-toggle-india');
 fireEvent.keyDown(document.activeElement,{key:'ArrowDown'});
 assert.equal(document.activeElement.id,'team-toggle-pakistan');
 page('/players?team=india');
 const role=screen.getByRole('combobox',{name:'India player role'});
 fireEvent.change(role,{target:{value:role.options[1].value}});
 assert([...document.querySelectorAll('#roster-india .player-caption small')].every(e=>e.textContent===role.value));
 fireEvent.change(screen.getByRole('combobox',{name:'Season'}),{target:{value:'2'}});
 await waitFor(()=>assert.equal(document.querySelectorAll('.player-profile-card').length,0));
 fireEvent.click(document.getElementById('team-toggle-india'));
 assert(screen.getByText('The player list for this archive season is not available yet.'));
 console.log('PASS seven expandable teams, 96 identities, roles, correct links, keyboard focus, collapse and season isolation');

 page('/search');assert.equal(window.location.pathname,'/');
 page('/experience');assert.equal(window.location.pathname,'/tickets');
 page('/matches/s3-match-1');
 assert(!/stadium to be confirmed|venue TBC/i.test(document.body.textContent));
 assert(document.querySelector('.ms-crest[src="/assets/team-logos/bangladesh.webp"]'));
 assert(document.querySelector('.ms-footer').textContent.includes('UAE'));
 console.log('PASS retired-route redirects, supplied crest and compact venue presentation without invented allocations');
}finally{cleanup();dom.window.close();}
