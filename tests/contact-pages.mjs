import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const dom=new JSDOM('<html><body></body></html>',{url:'http://localhost:4173/contact',pretendToBeVisual:true});
for(const key of ['window','document','HTMLElement','Node','Element','MutationObserver','localStorage','sessionStorage','FormData'])Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const React=await import('react');const {MemoryRouter}=await import('react-router-dom');
const {render,screen,fireEvent,cleanup,waitFor}=await import('@testing-library/react');
const out=path.resolve('node_modules/.cache/contact-pages.mjs');
await build({stdin:{contents:"export {ContactPage} from './src/ContactPage.jsx'; export {PolicyPage} from './src/PolicyPages.jsx';",resolveDir:process.cwd()},outfile:out,bundle:true,platform:'node',format:'esm',jsx:'automatic',external:['react','react-dom','react/*','react-dom/*','react-router-dom']});
const {ContactPage,PolicyPage}=await import(pathToFileURL(out).href);
let available=false,fail=false,calls=[],widgets=0,removed=0;
window.turnstile={render(_el,options){widgets++;queueMicrotask(()=>options.callback('test-token'));return widgets;},remove(){removed++}};
globalThis.fetch=async(_url,options={})=>{
 if(options.method==='POST'){const body=JSON.parse(options.body);calls.push(body);return new Response(JSON.stringify(fail?{error:'Synthetic delivery failure. Please retry.',fields:{message:'Check this message.'}}:{ok:true,reference:body.requestId}),{status:fail?502:202});}
 return new Response(JSON.stringify({available,siteKey:available?'test-public-sitekey':null}));
};
function page(Component,props={},route='/contact'){cleanup();return render(React.createElement(MemoryRouter,{initialEntries:[route]},React.createElement(Component,props)));}
function fill(){fireEvent.change(screen.getByLabelText('Your name'),{target:{value:'Test Visitor'}});fireEvent.change(screen.getByLabelText('Email address'),{target:{value:'visitor@example.com'}});fireEvent.change(screen.getByLabelText('What’s your enquiry about?'),{target:{value:'General enquiry'}});fireEvent.change(screen.getByLabelText('Your message'),{target:{value:'Synthetic message for UI tests only.'}});fireEvent.click(screen.getByRole('checkbox'));}
try {
 page(ContactPage);await screen.findByText(/Online enquiries are not available/);assert(screen.getByRole('button',{name:'Send enquiry'}).disabled);assert.equal(widgets,0);assert(screen.getAllByRole('link',{name:/info@wclcricket.com/}).length>0);
 available=true;page(ContactPage);await waitFor(()=>assert(!screen.getByRole('button',{name:'Send enquiry'}).disabled));await waitFor(()=>assert(widgets>0));fill();fail=true;fireEvent.submit(screen.getByRole('form',{name:'Contact WCL'}));await screen.findByRole('alert');assert(!screen.queryByText('Your enquiry is on its way.'));assert.equal(screen.getByLabelText('Your message').value,'Synthetic message for UI tests only.');await waitFor(()=>assert.equal(document.activeElement===screen.getByRole('alert'),true));
 const first=calls[0];fail=false;await waitFor(()=>assert(widgets>1));fireEvent.submit(screen.getByRole('form',{name:'Contact WCL'}));await screen.findByText('Your enquiry is on its way.');assert.equal(calls.length,2);assert.equal(calls[1].requestId,first.requestId);assert.equal(calls[1].privacy,true);assert(!('to' in calls[1]));await waitFor(()=>assert.equal(document.activeElement===screen.getByRole('status'),true));
 fireEvent.click(screen.getByRole('button',{name:'Send another enquiry'}));assert.equal(screen.getByLabelText('Your name').value,'');assert(removed>0);
 page(PolicyPage,{},'/privacy');assert(screen.getByRole('heading',{level:1,name:'Privacy Policy'}));assert.equal(screen.getAllByRole('heading',{level:2}).length,7);assert(!screen.queryByRole('button',{name:'Clear my WCL preferences'}));assert.equal(screen.getByRole('link',{name:'Privacy',exact:true}).getAttribute('aria-current'),'page');
 localStorage.setItem('wcl-fan','{"team":"india"}');sessionStorage.setItem('wcl-opening-seen','1');page(PolicyPage,{kind:'cookies'},'/cookies');fireEvent.click(screen.getByRole('button',{name:'Clear my WCL preferences'}));assert.equal(localStorage.getItem('wcl-fan'),null);assert.equal(sessionStorage.getItem('wcl-opening-seen'),null);assert(screen.getByRole('status').textContent.includes('cleared'));
 page(PolicyPage,{kind:'terms'},'/terms');assert(screen.getByRole('heading',{level:1,name:'Terms of use'}));assert.equal(screen.getAllByRole('heading',{level:2}).length,5);
 console.log('PASS contact unavailable/error/retry/success/new enquiry, focus, fixed payload, widget cleanup, all policy pages and storage controls. Providers mocked; no email sent.');
} finally {cleanup();dom.window.close();}
