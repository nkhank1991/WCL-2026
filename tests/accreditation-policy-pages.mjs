import assert from 'node:assert/strict';
import {build} from 'esbuild';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {JSDOM} from 'jsdom';
import {policyDocuments,policyPaths,policyStatus,policyVersion} from '../src/accreditation/policy-content.js';
import {pageMetadata} from '../src/seo/model.js';

const out=path.resolve('node_modules/.cache/accreditation-policy-pages.mjs');
await build({entryPoints:['src/accreditation/AccreditationPolicyPage.jsx'],outfile:out,bundle:true,platform:'node',format:'esm',jsx:'automatic',external:['react','react-dom','react/*','react-dom/*','react-router-dom']});
  const {AccreditationPolicyPage}=await import(pathToFileURL(out).href);
  assert.equal(policyStatus,'draft');
  for(const [kind,path] of Object.entries(policyPaths)){
    const html=renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:[path]},React.createElement(AccreditationPolicyPage,{kind})));
    const doc=new JSDOM(html).window.document;
    assert.equal(doc.querySelector('h1').textContent,policyDocuments[kind].title);
    assert.match(doc.body.textContent,/not yet in force/);
    assert.match(doc.body.textContent,/uploads remain closed/);
    assert.ok(doc.body.textContent.includes(policyVersion));
    assert.ok(doc.querySelector('a[href="/accreditation/apply"]'));
    for(const a of doc.querySelectorAll('a[href^="#"]'))assert.ok(doc.getElementById(a.getAttribute('href').slice(1)),'Broken contents link');
    for(const section of policyDocuments[kind].sections)assert.equal(doc.querySelectorAll('#'+section.id).length,1);
    assert.match(pageMetadata(path).title,/Draft/);
    assert.match(pageMetadata(path).robots,/noindex/);
    assert.ok(!doc.querySelector('form'),'A policy page must never collect ID data');
  }
  assert.match(JSON.stringify(policyDocuments.privacy),/data controller/);
  assert.match(JSON.stringify(policyDocuments.storage),/not yet enabled/);
  console.log('PASS three readable draft policies, navigation, noindex metadata and no collection');
