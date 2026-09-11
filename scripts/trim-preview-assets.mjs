// Preserve all source artwork. Ship the already-approved web variants, not
// unused archival masters, in the frontend-only mobile review deployment.
import {readFileSync, readdirSync, existsSync, statSync, unlinkSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const client=path.join(root,'dist','client');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const files=walk(client);
const code=files.filter(file=>/\.(js|css|html)$/.test(file)).map(file=>readFileSync(file,'utf8')).join('\n');
const reviews=JSON.parse(readFileSync(path.join(root,'src/data/portrait-reviews.json'),'utf8'));
const candidates=new Set();
// Source provenance is retained in the review catalogue. The runtime renders
// card/profile variants only; these masters have no UI link or image consumer.
for(const portrait of Object.values(reviews)) {
  if(portrait.status!=='approved'||!portrait.source?.startsWith('/assets/portraits-v2/'))continue;
  for(const variant of [portrait.card,portrait.profile]) {
    if(!variant?.startsWith('/assets/')||!existsSync(path.join(client,variant.slice(1))))throw new Error('Missing reviewed portrait variant: '+variant);
  }
  candidates.add(path.join(client,portrait.source.slice(1)));
}
// Retired compositions are never displayed or linked in the current bundle.
for(const name of ['wcl-golden-arena-original.jpg','hero.png','season3-ensemble-2026.png','season3-cinematic-hero.png','season3-natural-hero-v2.png']) {
  if(!code.includes(name))candidates.add(path.join(client,'assets',name));
}
let bytes=0,count=0;
for(const candidate of candidates) {
  const target=path.resolve(candidate);
  if(!target.startsWith(client+path.sep))throw new Error('Asset outside generated client output');
  if(!existsSync(target))continue;
  bytes+=statSync(target).size;
  unlinkSync(target);
  count++;
}
console.log(`Mobile review: excluded ${count} archival copies (${Math.round(bytes/1024/1024)} MB); public originals unchanged.`);
