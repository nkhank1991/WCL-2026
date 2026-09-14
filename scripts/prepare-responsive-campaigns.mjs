import sharp from 'sharp';
import {stat} from 'node:fs/promises';
import {optimisedCampaignSources} from '../src/media.js';

// Delivery derivatives only: originals, portrait proportions and pixels are not retouched.
let originalBytes=0,phoneBytes=0;
for(const source of optimisedCampaignSources){
 const input='public'+source;
 originalBytes+=(await stat(input)).size;
 for(const width of [480,800]){
  const output=input.replace(/\.png$/,`-w${width}.webp`);
  await sharp(input).resize({width,withoutEnlargement:true}).webp({quality:84,effort:5}).toFile(output);
  if(width===480)phoneBytes+=(await stat(output)).size;
 }
}
console.log(JSON.stringify({images:optimisedCampaignSources.size,originalBytes,phoneBytes}));
