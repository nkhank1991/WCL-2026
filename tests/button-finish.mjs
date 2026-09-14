import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import postcss from 'postcss';

const source=await readFile('src/button-finish.css','utf8');
const sheet=postcss.parse(source);
sheet.walkRules(rule=>assert(rule.selector.includes('.wcl-public'),'Button finish must not affect private portals'));
sheet.walkDecls(rule=>{
  assert.notEqual(rule.prop,'animation','Controls must remain calm at rest');
  assert.notEqual(rule.prop,'filter','Do not blur the actual text or icon');
});
for(const feature of ['prefers-reduced-motion','prefers-reduced-transparency','prefers-contrast','forced-colors',':focus-visible',':disabled','[data-surface-motion=quiet]','@supports']) assert(source.replaceAll('"','').includes(feature),`Missing ${feature} safeguard`);
const entry=await readFile('src/main.jsx','utf8');
assert(entry.indexOf('./button-finish.css')>entry.indexOf('./mobile-refinement.css'));
function luminance(hex){return hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0)}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
assert(contrast('111c2e','ff904e')>7,'Primary label contrast');
assert(contrast('f5f7fc','34465d')>7,'Secondary label contrast at its lightest glass edge');
assert(contrast('111c2e','edf1f7')>7,'Selected filter label contrast');
console.log('PASS public-only button material, finite feedback, focus/disabled/accessibility fallbacks and high-contrast labels');
