import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import postcss from 'postcss';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';

const css=postcss.parse(await readFile('src/mobile-refinement.css','utf8'));
css.walkRules(rule=>{
 assert(rule.selector.includes('.wcl-public'),'Public-only responsive styles');
 if(rule.parent.type==='root'){
  assert(rule.selector.includes('.mobile-')||rule.selector.includes('.story-description-mobile'));
  assert([...rule.nodes].every(node=>node.prop==='display'),'No desktop restyling');
 }else{
  assert(rule.parent.params.includes('max-width:'),'Responsive overrides must stay below the mobile breakpoint');
 }
});
const entry=await readFile('src/main.jsx','utf8');
assert(entry.indexOf('./mobile-refinement.css')>entry.indexOf('./seo/search-discovery.css'));
assert(!css.toString().includes('line-clamp:2'),'Do not conceal text with clipping');
assert(css.toString().includes('#root:not([data-client-ready=true])'),'No-JS disclosure fallback');
console.log('PASS scoped mobile stylesheet, desktop guards and readable prerender fallback');

const dom=new JSDOM('<html><body></body></html>',{url:'http://localhost:4173/',pretendToBeVisual:true});
for(const key of ['window','document','HTMLElement','Node','Element','SVGElement','MutationObserver']) Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
window.matchMedia=()=>({matches:true,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);
globalThis.getComputedStyle=window.getComputedStyle.bind(window);
globalThis.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
globalThis.fetch=async()=>({ok:false});
const React=await import('react');
const {render,screen,fireEvent,cleanup}=await import('@testing-library/react');
const {MemoryRouter}=await import('react-router-dom');
const outfile=path.resolve('node_modules/.cache/mobile-refinement-tests.mjs');
await build({stdin:{contents:"export {MobileFooterGroup} from './src/MobileFooterGroup.jsx';export {SportsHero} from './src/SportsHero.jsx';export {CareerRecords} from './src/CareerRecords.jsx';export {MatchBroadcast} from './src/MatchBroadcast.jsx';",resolveDir:process.cwd()},outfile,bundle:true,format:'esm',platform:'node',jsx:'automatic',external:['react','react-dom','react/*','react-dom/*','react-router-dom'],loader:{'.css':'empty'}});
const {MobileFooterGroup,SportsHero,CareerRecords,MatchBroadcast}=await import(pathToFileURL(outfile).href);
try{
 render(React.createElement(MobileFooterGroup,{title:'Explore'},React.createElement('a',{href:'/teams'},'Teams')));
 const toggle=screen.getByRole('button',{name:'Explore'});
 assert.equal(toggle.getAttribute('aria-expanded'),'false');
 assert(document.getElementById(toggle.getAttribute('aria-controls')).contains(screen.getByRole('link',{name:'Teams'})));
 fireEvent.click(toggle);assert.equal(toggle.getAttribute('aria-expanded'),'true');
 fireEvent.click(toggle);assert.equal(toggle.getAttribute('aria-expanded'),'false');
 cleanup();
 render(React.createElement(MemoryRouter,null,React.createElement(SportsHero)));
 const story=screen.getByRole('button',{name:'Story details'});
 assert.equal(document.querySelectorAll('.story-facts>div').length,3);
 assert.equal(document.querySelectorAll('.story-actions>a').length,2);
 fireEvent.click(story);assert.equal(story.getAttribute('aria-expanded'),'true');
 assert.equal(document.querySelector('.hero-story-copy').dataset.mobileExpanded,'true');
 assert.equal(screen.getByRole('button',{name:'Resume automatic stories'}).textContent,'Resume automatic stories');
 const storyTargets=story.getAttribute('aria-controls').split(' ').map(id=>document.getElementById(id));
 assert(storyTargets.every(Boolean));
 assert(storyTargets[0].textContent.includes('Unfinished rivalries'));
 assert.equal(storyTargets[1].querySelectorAll('dt').length,3,'All facts remain in the disclosure');
 cleanup();
 render(React.createElement(MemoryRouter,null,React.createElement(CareerRecords)));
 for(const button of screen.getAllByRole('button',{name:'The story'})){
  const ids=button.getAttribute('aria-controls').split(' ');
  assert(ids.every(id=>document.getElementById(id)));
  fireEvent.click(button);assert.equal(button.getAttribute('aria-expanded'),'true');
 }
 assert.equal(screen.getAllByRole('link',{name:'Read the ICC source'}).length,3);
 cleanup();
 render(React.createElement(MemoryRouter,{initialEntries:['/matches?q=india&date=03+Oct']},React.createElement(MatchBroadcast)));
 const filters=screen.getByRole('button',{name:/Date & search/});
 assert(filters.textContent.includes('2 active'));
 fireEvent.click(filters);assert.equal(filters.getAttribute('aria-expanded'),'true');
 assert.equal(document.querySelector('.mc-toolbar').dataset.extraFilters,'true');
 assert(filters.getAttribute('aria-controls').split(' ').every(id=>document.getElementById(id)));
 console.log('PASS mobile story, milestone and footer disclosure, complete hero facts/actions and active filter signposting');
}finally{cleanup();dom.window.close();}
