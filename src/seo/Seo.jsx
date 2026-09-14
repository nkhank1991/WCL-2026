import {usePublished} from '../PublishedContent.jsx';
import {useIdentity,CmsPageHeading} from '../cms/SiteContent.jsx';
import {applyContentMetadata} from '../cms/metadata.js';
import {socialDefaults} from '../SocialLinks.jsx';
import {useEffect} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {pageMetadata} from './model.js';
import {jsonForHtml,seoConfig} from './config.js';
import {answers} from './answers.js';

export function headTags(meta, config=seoConfig) {
  const tags=[
    {name:'description',content:meta.description},
    {name:'robots',content:meta.robots},
    {property:'og:type',content:'website'},
    {property:'og:site_name',content:'World Championship of Legends'},
    {property:'og:title',content:meta.title},
    {property:'og:description',content:meta.description},
    {property:'og:url',content:meta.canonical},
    {property:'og:image',content:meta.image},
    {property:'og:image:alt',content:meta.imageAlt},
    {name:'twitter:card',content:'summary_large_image'},
    {name:'twitter:site',content:'@wclleague'},
    {name:'twitter:title',content:meta.title},
    {name:'twitter:description',content:meta.description},
    {name:'twitter:image',content:meta.image},
    {name:'twitter:image:alt',content:meta.imageAlt},
  ];
  if(config.googleVerification)tags.push({name:'google-site-verification',content:config.googleVerification});
  if(config.bingVerification)tags.push({name:'msvalidate.01',content:config.bingVerification});
  return tags;
}
export function useSeo(){
  const {pathname}=useLocation();
  const seo=usePublished('seo',[]),identity=useIdentity(),social=usePublished('social',socialDefaults);
  useEffect(()=>{
    const config={...seoConfig,indexable:seoConfig.indexable && window.location.origin===seoConfig.origin};
    const meta=applyContentMetadata(pageMetadata(pathname,config),{seo,identity:[identity],social},config.origin);
    if(identity.favicon){let icon=document.querySelector('link[rel="icon"]');if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.append(icon)}icon.href=identity.favicon;}
    document.title=meta.title;
    document.head.querySelectorAll('[data-wcl-seo],meta[name="description"],meta[name="robots"],link[rel="canonical"]').forEach(el=>el.remove());
    for(const attrs of headTags(meta)){
      const node=document.createElement('meta');
      for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);
      node.dataset.wclSeo='';document.head.append(node);
    }
    const canonical=document.createElement('link');canonical.rel='canonical';canonical.href=meta.canonical;canonical.dataset.wclSeo='';document.head.append(canonical);
    const schema=document.createElement('script');schema.type='application/ld+json';schema.dataset.wclSeo='';schema.textContent=jsonForHtml(meta.graph);document.head.append(schema);
  },[pathname,seo,identity,social]);
}
export function SeoBreadcrumbs(){
  const {pathname}=useLocation();const {breadcrumbs,known}=pageMetadata(pathname);
  if(!known||!breadcrumbs.length)return null;
  return <nav className="wrap seo-breadcrumbs" aria-label="Breadcrumb"><ol>{breadcrumbs.map((item,i)=><li key={item.path}>{i===breadcrumbs.length-1?<span aria-current="page">{item.name}</span>:<Link to={item.path}>{item.name}</Link>}</li>)}</ol></nav>;
}
export function CricketAnswers(){
  return <><CmsPageHeading tag="GOOD TO KNOW" title="Frequently asked questions">Clear answers. Your next step, one click away.</CmsPageHeading><section className="wrap section faq-list">{answers.map(({q,a,links})=><details key={q}><summary>{q}</summary><p>{a}</p><div className="answer-links">{links.map(([label,to])=><Link key={to} to={to}>{label} <span aria-hidden="true">↗</span></Link>)}</div></details>)}</section></>;
}
