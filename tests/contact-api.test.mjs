import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createContactHandler, CONTACT_INBOX} from '../lib/contact-handler.mjs';
import {readFileSync} from 'node:fs';

const env = {NODE_ENV:'production', CONTACT_ENABLED:'true', CONTACT_ALLOWED_ORIGINS:'https://wcl.example', RESEND_API_KEY:'test-server-secret', CONTACT_FROM_EMAIL:'website@wcl.example', TURNSTILE_SITE_KEY:'test-public-sitekey', TURNSTILE_SECRET_KEY:'test-challenge-secret'};
const valid = {name:'Test Visitor',email:'visitor@example.com',topic:'General enquiry',message:'A synthetic enquiry used only by the automated tests.',privacy:true,website:'',requestId:'11111111-1111-4111-8111-111111111111',token:'test-token'};
async function fixture(t, options={}) {
  const calls=[];
  const fetcher=async(url,request)=>{calls.push({url,request}); if(options.fail) throw new Error('secret-provider-error'); return url.includes('siteverify') ? new Response(JSON.stringify(options.challenge || {success:true,hostname:'wcl.example',action:'contact'}), {status:options.challengeStatus||200}) : new Response(JSON.stringify(options.receipt||{id:'test-provider-receipt'}), {status:options.status||200});};
  const server=createServer(createContactHandler({env:{...env,...options.env},fetcher}));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); t.after(()=>new Promise(resolve=>server.close(resolve)));
  const url=`http://127.0.0.1:${server.address().port}`;
  async function request(body=valid,options={}) {
    const r=await fetch(url,{method:'POST',headers:{Origin:'https://wcl.example','Content-Type':'application/json',...options.headers},body:typeof body==='string'?body:JSON.stringify(body),...options.override});
    return {status:r.status,headers:r.headers,body:await r.json()};
  }
  return {calls,request,url};
}
test('GET reveals only readiness/public site key; no credentials',async t=>{
  const f=await fixture(t);const response=await fetch(f.url);const body=await response.text();assert.equal(response.headers.get('cache-control'),'no-store');assert.deepEqual(JSON.parse(body),{available:true,siteKey:'test-public-sitekey',email:CONTACT_INBOX});assert(!body.includes('secret'));assert.equal(f.calls.length,0);
});
test('disabled or incomplete configuration fails closed',async t=>{
  const f=await fixture(t,{env:{CONTACT_ENABLED:'false'}});assert.equal((await f.request()).status,503);assert.deepEqual(await (await fetch(f.url)).json(),{available:false,siteKey:null,email:CONTACT_INBOX});assert.equal(f.calls.length,0);
  const missing=await fixture(t,{env:{TURNSTILE_SECRET_KEY:''}});assert.equal((await missing.request()).status,503);
});
test('blocks cross-origin and absent origin; does not reflect CORS',async t=>{
  const f=await fixture(t);for(const origin of ['https://attacker.example','null','']) {const r=await f.request(valid,{headers:{Origin:origin}});assert.equal(r.status,403);assert.equal(r.headers.get('access-control-allow-origin'),null);}assert.equal(f.calls.length,0);
});
test('enforces method, content type, JSON and body limit',async t=>{
  const f=await fixture(t);assert.equal((await fetch(f.url,{method:'DELETE'})).status,405);assert.equal((await f.request(valid,{headers:{'Content-Type':'text/plain'}})).status,415);assert.equal((await f.request('{')).status,400);assert.equal((await f.request('x'.repeat(17000))).status,413);assert.equal(f.calls.length,0);
});
test('validates all fields, acknowledgement and honeypot before contacting providers',async t=>{
  const f=await fixture(t);for(const patch of [{name:'A'},{name:'Name\r\nBcc: bad@example.com'},{email:'a@example.com\nBcc:x'},{topic:'arbitrary headers'},{message:'small'},{message:'x'.repeat(5001)},{privacy:false},{website:'bot.example'},{token:''},{token:'x'.repeat(2049)},{requestId:'bad'}])assert.equal((await f.request({...valid,...patch})).status,400);assert.equal(f.calls.length,0);
});
test('verifies challenge success, hostname and action server-side',async t=>{
  for(const challenge of [{success:false},{success:true,hostname:'other.example',action:'contact'},{success:true,hostname:'wcl.example',action:'login'}]){const f=await fixture(t,{challenge});assert.equal((await f.request()).status,400);assert.equal(f.calls.length,1);}
});
test('challenge outage cannot send a message',async t=>{
  const f=await fixture(t,{challengeStatus:503});assert.equal((await f.request()).status,503);assert.equal(f.calls.length,1);
});
test('accepted mail goes only to WCL with safe sender and visitor Reply-To',async t=>{
  const f=await fixture(t);const r=await f.request({...valid,to:'attacker@example.com',from:'spoof@example.com',message:'<script>not HTML</script> Test message.'});assert.equal(r.status,202);assert.equal(r.body.ok,true);assert.equal(f.calls.length,2);
  const sent=JSON.parse(f.calls[1].request.body);assert.deepEqual(sent.to,['info@wclcricket.com']);assert.equal(sent.from,'WCL Website <website@wcl.example>');assert.equal(sent.reply_to,'visitor@example.com');assert.equal(sent.subject,'WCL enquiry · General enquiry');assert.equal(sent.html,undefined);assert(sent.text.includes('<script>not HTML</script>'));assert(!JSON.stringify(r.body).includes('test-server-secret'));
});
test('retry has a stable payload-bound Resend idempotency key',async t=>{
  const f=await fixture(t);await f.request();await f.request({...valid,token:'new-token'});assert.equal(f.calls[1].request.headers['Idempotency-Key'],f.calls[3].request.headers['Idempotency-Key']);await f.request({...valid,message:'A materially different synthetic message.'});assert.notEqual(f.calls[1].request.headers['Idempotency-Key'],f.calls[5].request.headers['Idempotency-Key']);
});
test('provider failure, quota and uncertain response never return a false success',async t=>{
  for(const [options,status] of [[{status:403},502],[{status:429},429],[{receipt:{}},502],[{fail:true},502]]){const f=await fixture(t,options);const r=await f.request();assert.equal(r.status,status);assert(!r.body.ok);assert(!JSON.stringify(r).includes('secret-provider-error'));if(status===429)assert.equal(r.headers.get('retry-after'),'60');}
});
test('Vercel entry is isolated; static public pages and private-only rewrites exclude the contact API',()=>{
  const config=JSON.parse(readFileSync('vercel.json','utf8'));assert.equal(config.outputDirectory,'dist/client');assert.equal(config.cleanUrls,true);assert.deepEqual(config.rewrites.map(r=>r.source),['/admin/:path*','/accreditation/:path*']);assert(config.rewrites.every(r=>r.destination==='/private-shell'));assert(config.functions['api/contact.js']);assert(!readFileSync('api/contact.js','utf8').includes('server/index'));
});
test('pre-parsed Vercel requests use the same validation and body limits',async()=>{
  const handler=createContactHandler({env,fetcher:async url=>new Response(JSON.stringify(url.includes('siteverify')?{success:true,hostname:'wcl.example',action:'contact'}:{id:'test-only'}))});
  for(const [body,status] of [[valid,202],[{...valid,message:'x'.repeat(20000)},413],[[],400]]){const res={setHeader(){},end(value){this.body=JSON.parse(value)}};await handler({method:'POST',headers:{origin:'https://wcl.example','content-type':'application/json'},body},res);assert.equal(res.statusCode,status);}
});
