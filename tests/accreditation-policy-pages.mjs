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
import {retentionDraft,approvalTemplates,policyPack} from '../lib/accreditation-policy-pack.mjs';

const out=path.resolve('node_modules/.cache/accreditation-policy-pages.mjs');
await build({entryPoints:['src/accreditation/AccreditationPolicyPage.jsx'],outfile:out,bundle:true,platform:'node',format:'esm',jsx:'automatic',external:['react','react-dom','react/*','react-dom/*','react-router-dom']});
  const {AccreditationPolicyPage}=await import(pathToFileURL(out).href);
  assert.equal(policyStatus,'review-required');
  for(const [kind,path] of Object.entries(policyPaths)){
    const html=renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:[path]},React.createElement(AccreditationPolicyPage,{kind})));
    const doc=new JSDOM(html).window.document;
    assert.equal(doc.querySelector('h1').textContent,policyDocuments[kind].title);
    assert.match(doc.body.textContent,/requires WCL privacy and retention approval/);
    assert.match(doc.body.textContent,/No ID copies or numbers are collected/);
    assert.ok(doc.body.textContent.includes(policyVersion));
    assert.ok(doc.querySelector('a[href="/accreditation/apply"]'));
    for(const a of doc.querySelectorAll('a[href^="#"]'))assert.ok(doc.getElementById(a.getAttribute('href').slice(1)),'Broken contents link');
    for(const section of policyDocuments[kind].sections)assert.equal(doc.querySelectorAll('#'+section.id).length,1);
    assert.doesNotMatch(pageMetadata(path).title,/Draft/);
    assert.match(pageMetadata(path).robots,/noindex/);
    assert.ok(!doc.querySelector('form'),'A policy page must never collect ID data');
  }
  assert.match(JSON.stringify(policyDocuments.privacy),/data controller/);
  assert.match(JSON.stringify(policyDocuments.storage),/not yet enabled/);
  assert.equal(policyPack.status,'adopted-pending-activation');
  assert.equal(approvalTemplates.length,5);
  assert.match(retentionDraft,/within 30 days after the event ends/);
  assert.match(JSON.stringify(policyDocuments.storage),/7 days after issue/);
  assert.match(JSON.stringify(policyDocuments.storage),/90 days after event end/);
  assert.match(JSON.stringify(policyDocuments.terms),/WCL-S3-TERMS-001/);
  for(const doc of Object.values(policyDocuments)){
    assert.ok(doc.documentId);
    assert.doesNotMatch(JSON.stringify(doc),/\[COMPLETE REGISTERED ADDRESS\]/);
  }
  console.log('PASS three no-copy policies, explicit review required, navigation, noindex metadata and no collection');
