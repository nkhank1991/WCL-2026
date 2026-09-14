import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/cms.js';

test('an unconnected CMS serves reviewed public content only, with private administration closed', async t => {
  const keys=['CMS_BACKEND_ORIGIN','CMS_PROXY_SECRET'];
  const old=keys.map(key=>process.env[key]);
  keys.forEach(key=>delete process.env[key]);
  t.after(()=>keys.forEach((key,index)=>old[index]===undefined?delete process.env[key]:process.env[key]=old[index]));
  const call=async (route,method='GET')=>{
    const res={headers:{},setHeader(key,value){this.headers[key.toLowerCase()]=value;},end(body){this.body=JSON.parse(body);}};
    await handler({method,url:'/api/cms',query:{cmsPath:route},headers:{}},res);
    return res;
  };
  const teams=await call('public/content/teams');
  assert.equal(teams.statusCode,200);
  assert.equal(teams.body.items.length,7);
  assert.equal(teams.body.source,'published-build');
  assert.equal(teams.headers['set-cookie'],undefined);
  assert.equal(teams.headers['cache-control'],'public, max-age=60');
  for(const route of ['status','auth/session','admin/content','admin/staff','public/snapshot','public/content/staff']) {
    const response=await call(route);
    assert.equal(response.statusCode,503);
    assert.equal(response.body.items,undefined);
    assert.equal(response.headers['cache-control'],'no-store');
  }
  assert.equal((await call('public/content/teams','POST')).statusCode,503);
});
