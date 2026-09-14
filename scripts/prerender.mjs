import {build} from 'esbuild';
import {loadEnv} from 'vite';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {load} from 'cheerio';
import {publicSeoConfig,jsonForHtml,SITE_ORIGIN} from '../src/seo/config.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist/client');
const config=publicSeoConfig({...loadEnv('production',root,''),...process.env});
const cache=path.join(root,'node_modules/.cache/wcl/static-render.mjs');
await mkdir(path.dirname(cache),{recursive:true});
await build({entryPoints:[path.join(root,'src/entry-static.jsx')],outfile:cache,bundle:true,
  platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},jsx:'automatic',
  define:{__WCL_SEO__:JSON.stringify(config),'process.env.NODE_ENV':'"production"'}});
const {renderPage,pageMetadata,publicRoutes,headTags}=await import(pathToFileURL(cache).href);
const template=await readFile(path.join(out,'index.html'),'utf8');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function documentFor(route,{shell=false}={}){
  const meta=pageMetadata(route,config);
  const $=load(template);
  $('title,meta[name="description"],meta[name="robots"],link[rel="canonical"],[data-wcl-seo]').remove();
  $('head').append('<title>'+escape(meta.title)+'</title>');
  for(const attrs of headTags(meta,config))$('head').append('<meta data-wcl-seo '+Object.entries(attrs).map(([k,v])=>k+'="'+escape(v)+'"').join(' ')+'>');
  $('head').append('<link data-wcl-seo rel="canonical" href="'+escape(meta.canonical)+'">');
  $('head').append('<script data-wcl-seo type="application/ld+json">'+jsonForHtml(meta.graph)+'</script>');
  if(!shell){
    $('#root').html(renderPage(route));
    // Settled, readable initial HTML for every visitor, including visitors without JS.
    // The client mounts the same application and enables its approved interactions.
    $('#root').attr('data-prerendered','true');
    $('#root [style]').each((_,node)=>{
      const el=$(node),style=el.attr('style');
      if(/(?:^|;)opacity:0(?:;|$)/.test(style) && !el.is('[aria-hidden="true"]')){
        el.attr('style',style.replace(/(?:^|;)opacity:0(?=;|$)/,';opacity:1').replace(/(?:^|;)transform:[^;]+/g,''));
      }
    });
    $('body').append('<noscript><p style="padding:16px;text-align:center;background:#0d1b30;color:#fff">Enable JavaScript for interactive filters and media. Browse <a style="color:#ff8b4a" href="/teams">teams</a> and <a style="color:#ff8b4a" href="/matches">fixtures</a> without JavaScript.</p></noscript>');
  }
  return $.html();
}
if(new Set(publicRoutes).size!==publicRoutes.length)throw new Error('Duplicate canonical route');
for(const route of [...publicRoutes,'/fan-zone','/404']){
  const file=path.join(out,route==='/'?'index.html':route.slice(1)+'.html');
  await mkdir(path.dirname(file),{recursive:true});
  await writeFile(file,documentFor(route));
}
await writeFile(path.join(out,'private-shell.html'),documentFor('/admin',{shell:true}));
const excluded=['/api/','/admin','/accreditation','/fan-zone','/private-shell'];
const directives=config.indexable?'Allow: /\n'+excluded.map(p=>'Disallow: '+p).join('\n'):'Disallow: /';
await writeFile(path.join(out,'robots.txt'),'# WCL public search access. robots.txt is not access control.\nUser-agent: *\n'+directives+'\n\nUser-agent: OAI-SearchBot\n'+directives+'\n\nSitemap: '+SITE_ORIGIN+'/sitemap.xml\n');
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+publicRoutes.map(p=>'  <url><loc>'+escape(SITE_ORIGIN+(p==='/'?'/':p))+'</loc></url>').join('\n')+'\n</urlset>\n');
// Optional plain-text discovery file; not a ranking signal or a substitute for HTML.
await writeFile(path.join(out,'llms.txt'),'# World Championship of Legends\n\n> WCL cricket: seven national teams, Season 3 scheduled in the UAE for 3–18 October 2026, and archives of Seasons 1 and 2. Check individual pages for current published information.\n\n## Public information\n'+[
 ['Tournament dates and schedule','/season'],['Teams','/teams'],['Players by team','/players'],['Fixtures and verified results','/matches'],['India vs Pakistan','/india-vs-pakistan'],['Official highlights library','/watch'],['Frequently asked questions','/faq'],['Contact','/contact'],['Privacy','/privacy']
].map(([label,p])=>'- ['+label+']('+SITE_ORIGIN+p+')').join('\n')+'\n\nListed players are not confirmed match squads. Archive schedules without verified results do not establish a score. Fixture times are UAE time (UTC+4) when labelled as such. Media playback depends on its publisher.\n');
console.log('Prerendered '+publicRoutes.length+' canonical public pages, plus private shell, My WCL and 404. Search indexing: '+(config.indexable?'ENABLED':'DISABLED (preview-safe)'));
