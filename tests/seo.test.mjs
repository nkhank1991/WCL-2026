import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {load} from 'cheerio';
import {publicSeoConfig,canonicalPath,jsonForHtml,SITE_ORIGIN} from '../src/seo/config.js';
import {publicRoutes,pageMetadata} from '../src/seo/model.js';
import {answers} from '../src/seo/answers.js';
const production=publicSeoConfig({SEO_INDEXABLE:'true',VERCEL_ENV:'production'});
const output=route=>'dist/client/'+(route==='/'?'index':route.slice(1))+'.html';

test('production opt-in; previews cannot accidentally index',()=>{
  assert.equal(publicSeoConfig().indexable,false);
  assert.equal(publicSeoConfig({SEO_INDEXABLE:'true',VERCEL_ENV:'preview'}).indexable,false);
  assert.equal(publicSeoConfig({SEO_INDEXABLE:'true',VERCEL_ENV:'development'}).indexable,false);
  assert.equal(production.indexable,true);
  for(const path of ['/admin','/admin/media','/api/contact','/accreditation','/fan-zone','/search','/teams/missing','/404'])
    assert.match(pageMetadata(path,production).robots,/noindex/);
});
test('canonical URLs remove query/hash and always use the approved host',()=>{
  assert.equal(canonicalPath('/matches/?season=1#results'),'/matches');
  assert.equal(pageMetadata('http://localhost:4173/teams/india?utm_source=x',production).canonical,SITE_ORIGIN+'/teams/india');
  assert.equal(pageMetadata('/',production).canonical,SITE_ORIGIN+'/');
  assert.equal(jsonForHtml({x:'</script><script>alert(1)</script>'}).includes('<'),false);
});
test('every real route has unique metadata and internally consistent schema',()=>{
  const titles=new Set(),canonicals=new Set();
  for(const route of publicRoutes){
    const m=pageMetadata(route,production);
    assert(m.known,route);assert.match(m.robots,/^index,/);
    assert(!titles.has(m.title),'Duplicate title '+m.title);titles.add(m.title);
    assert(!canonicals.has(m.canonical));canonicals.add(m.canonical);
    assert(m.description.length>50,route);
    assert(m.image.startsWith('https://'));
    assert(!JSON.stringify(m.graph).includes('SearchAction'),'Removed search must not return through schema');
    const page=m.graph['@graph'].find(g=>g['@id']===m.canonical+'#webpage');
    assert.equal(page.url,m.canonical);
  }
});
test('fixture and answer data agree; unverified video attributes are not invented',()=>{
  const m=pageMetadata('/matches/s3-match-14',production);
  const event=m.graph['@graph'].find(x=>x['@type']==='SportsEvent');
  assert.equal(event.startDate,'2026-10-10T19:30:00+04:00');
  assert.deepEqual(event.competitor.map(x=>x.name),['India Champions','Pakistan Champions']);
  assert(!event.endDate);assert(!event.offers);assert(!event.location.address);
  const faq=pageMetadata('/faq',production).graph['@graph'].find(x=>x['@type']==='FAQPage');
  assert.deepEqual(faq.mainEntity.map(x=>[x.name,x.acceptedAnswer.text]),answers.map(x=>[x.q,x.a]));
  assert(!JSON.stringify(pageMetadata('/watch/0h8eYdGRixY',production).graph).includes('uploadDate'));
});
test('all local sharing and entity images exist in the deployable output',async()=>{
  const images=new Set();
  const scan=value=>{
    if(!value||typeof value!=='object')return;
    for(const [key,item] of Object.entries(value)){
      if(['image','logo'].includes(key)&&typeof item==='string'&&item.startsWith(SITE_ORIGIN+'/assets/'))images.add(new URL(item).pathname);
      if(typeof item==='object')scan(item);
    }
  };
  publicRoutes.forEach(route=>scan(pageMetadata(route)));
  for(const asset of images)await access('dist/client'+asset);
});
test('all canonical pages ship substantive readable HTML without JavaScript',async()=>{
  for(const route of publicRoutes){
    const html=await readFile(output(route),'utf8'),$=load(html);
    assert.equal($('title').length,1,route);
    assert.equal($('meta[name=description]').length,1,route);
    assert.equal($('meta[name=robots]').length,1,route);
    assert.equal($('link[rel=canonical]').length,1,route);
    assert.equal($('link[rel=canonical]').attr('href'),SITE_ORIGIN+route);
    assert($('#root main').text().trim().length>80,'Empty initial content: '+route);
    assert($('#root main h1').length>=1,'Missing H1: '+route);
    assert(!$('#root main').text().includes('That page is out of play'),route);
    assert.equal($('script[type="application/ld+json"]').length,1,route);
    JSON.parse($('script[type="application/ld+json"]').text());
    for(const [,el] of [...$('#root main [style]')].entries()){
      if($(el).attr('aria-hidden')!=='true') assert(!/(?:^|;)opacity:0(?:;|$)/.test($(el).attr('style')),route+' hidden initial content');
    }
    // The crawler and browser receive the same real app, not bot-only content.
    assert.equal($('#root').attr('data-prerendered'),'true',route);
  }
});
test('XML sitemap covers public routes without a public directory or private pages',async()=>{
  const xml=load(await readFile('dist/client/sitemap.xml','utf8'),{xml:true});
  const urls=xml('loc').map((_,el)=>xml(el).text()).get();
  assert.deepEqual(urls.sort(),publicRoutes.map(p=>SITE_ORIGIN+p).sort());
  assert.equal(xml('lastmod').length,0,'Do not invent content-modified dates');
  assert(!publicRoutes.includes("/sitemap"));
  const home=load(await readFile("dist/client/index.html","utf8"));
  assert.equal(home('a[href="/sitemap"]').length,0);
  const robots=await readFile('dist/client/robots.txt','utf8');
  assert.match(robots,/User-agent: OAI-SearchBot/);
  assert.match(robots,/Sitemap: https:\/\/www.wclcricket.com\/sitemap.xml/);
});
test('static routing keeps API/private routes separate and serves genuine missing-page output',async()=>{
  const config=JSON.parse(await readFile('vercel.json','utf8'));
  assert.equal(config.cleanUrls,true);
  assert(config.functions['api/contact.js']);
  assert(config.rewrites.filter(r=>!r.source.startsWith('/api/')).every(r=>r.destination==='/private-shell'));
  assert.deepEqual(config.rewrites.filter(r=>r.source.startsWith('/api/')),[
    {source:'/api/operations/:path*',destination:'/api/accreditation?accreditationPath=:path*'},
    {source:'/api/accreditation/:path*',destination:'/api/accreditation?accreditationPath=accreditation/:path*'},
    {source:'/api/status',destination:'/api/cms?cmsPath=status'},
    {source:'/api/auth/:path*',destination:'/api/cms?cmsPath=auth/:path*'},
    {source:'/api/public/:path*',destination:'/api/cms?cmsPath=public/:path*'},
    {source:'/api/admin/:path*',destination:'/api/cms?cmsPath=admin/:path*'},
  ]);
  assert(!config.rewrites.some(r=>r.destination==='/index.html'));
  for(const route of ['/india','/pakistan','/wcl-season-1','/wcl-season-2','/ajay-devgn','/harshit-tomar'])assert(config.redirects.some(r=>r.source===route&&r.permanent));
  const $=load(await readFile('dist/client/404.html','utf8'));
  assert.match($('meta[name=robots]').attr('content'),/noindex/);
  assert.match($('h1').text(),/out of play/);
  // The public Vercel release does not include the separate Sites worker.
  await access('api/accreditation.js');
  const shell=load(await readFile('dist/client/private-shell.html','utf8'));
  assert.equal(shell('#root').text(),'');
  assert.match(shell('meta[name=robots]').attr('content'),/noindex/);
});
