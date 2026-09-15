import {Link,NavLink} from 'react-router-dom';
import {policyDocuments,policyPaths,policyDate,policyVersion,policyNotice,policyReferences} from './policy-content';
import './operations.css';
import './policy-pages.css';

export function AccreditationPolicyPage({kind='privacy'}){
  const page=policyDocuments[kind];
  return <div className="ops-shell accreditation-policy">
    <a className="policy-skip" href="#policy-content">Skip to policy</a>
    <header className="ops-topbar"><Link to="/" aria-label="WCL homepage"><img src="/assets/wcl-official-logo.png" alt="WCL"/></Link><span>Accreditation<span>Season 3 · 2026</span></span><Link to="/accreditation/apply">Application</Link></header>
    <main>
      <p className="policy-eyebrow">WCL / ACCREDITATION POLICIES</p>
      <h1>{page.title}</h1>
      <p className="ops-lead">{page.intro}</p>
      <p className="ops-notice"><strong>{policyNotice}</strong></p>
      <nav className="policy-tabs" aria-label="Accreditation policies">{Object.entries(policyPaths).map(([key,to])=><NavLink key={key} to={to}>{key==='privacy'?'Privacy notice':key==='terms'?'Event terms':'Identity checks'}</NavLink>)}</nav>
      <div className="policy-meta"><span>Prepared {policyDate}</span><span>{page.documentId}</span><span>{policyVersion}</span></div>
      <ul className="policy-summary">{page.summary.map(item=><li key={item}>{item}</li>)}</ul>
      <div className="policy-layout">
        <nav className="policy-contents" aria-label="On this page"><h2>On this page</h2>{page.sections.map((section,i)=><a href={'#'+section.id} key={section.id}><span>{String(i+1).padStart(2,'0')}</span>{section.title}</a>)}</nav>
        <article id="policy-content" tabIndex={-1}>{page.sections.map(section=><section key={section.id} id={section.id}><h2>{section.title}</h2>{section.paragraphs.map(text=><p key={text}>{text}</p>)}{section.rows&&<dl className="retention-list">{section.rows.map(([label,detail])=><div key={label}><dt>{label}</dt><dd>{detail}</dd></div>)}</dl>}</section>)}</article>
      </div>
      <aside className="policy-related"><h2>Related policies</h2>{Object.entries(policyPaths).filter(([key])=>key!==kind).map(([key,to])=><Link key={key} to={to}>{policyDocuments[key].title}</Link>)}<Link to="/privacy">Website privacy policy</Link></aside>
      <aside className="policy-related"><h2>Research references</h2><p>Official sources reviewed on {policyDate}. These inform the policies; they do not certify WCL compliance or approve its provider arrangements.</p>{policyReferences.map(([label,url])=><a key={url} href={url} target="_blank" rel="noreferrer">{label}</a>)}</aside>
    </main>
    <footer className="ops-footer"><span>WCL accreditation · policy v1.1</span><Link to="/accreditation/apply">Return to application</Link></footer>
  </div>;
}
