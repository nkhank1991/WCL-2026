// Read-only post-deployment check. Does not submit URLs or send mail.
import {load} from 'cheerio';
import {SITE_ORIGIN} from '../src/seo/config.js';
const origin=new URL(process.env.SEO_CHECK_ORIGIN || SITE_ORIGIN).origin;
if(!['https:','http:'].includes(new URL(origin).protocol))throw new Error('HTTP origin required');
let failures=0;
async function check(path){
  const response=await fetch(origin+path,{signal:AbortSignal.timeout(20000)});
  const html=await response.text(),$=load(html);
  const canonical=$('link[rel=canonical]').attr('href');
  const robots=[$('meta[name=robots]').attr('content'),response.headers.get('x-robots-tag')].filter(Boolean).join(', ');
  const expected=SITE_ORIGIN+path;
  const ok=response.status===200&&canonical===expected&&$('main h1').length>0&&!/noindex/i.test(robots);
  if(!ok)failures++;
  console.log(JSON.stringify({path,status:response.status,canonical,robots,initialHtmlHeading:$('main h1').text().trim(),ok}));
}
for(const p of ['/','/season','/teams/india','/matches/s3-match-14','/india-vs-pakistan','/faq'])await check(p);
for(const p of ['/robots.txt','/sitemap.xml']){
  const r=await fetch(origin+p,{signal:AbortSignal.timeout(20000)}),body=await r.text();
  const ok=r.ok&&(p.endsWith('.xml')?body.includes(SITE_ORIGIN+'/teams/india'):!body.includes('Disallow: /\n'));
  if(!ok)failures++;console.log(JSON.stringify({path:p,status:r.status,ok}));
}
const missing=await fetch(origin+'/wcl-this-page-does-not-exist',{signal:AbortSignal.timeout(20000)});
if(missing.status!==404)failures++;
console.log('Missing-page HTTP status: '+missing.status);
console.log(failures?'FAIL: '+failures+' launch checks need attention.':'PASS: initial HTML, canonical domain, indexability, sitemap and HTTP 404.');
process.exitCode=failures?1:0;
