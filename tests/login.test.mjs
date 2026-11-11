import test from 'node:test';
import assert from 'node:assert/strict';
import {createHandler,normalizeName} from '../backend/functions/howdy-code-login/login-core.mjs';
const origin='https://thomasmarlin512.github.io';
const request=(body,extra={})=>new Request('https://test.invalid',{method:'POST',headers:{origin,authorization:'Bearer test-token',...extra},body:typeof body==='string'?body:JSON.stringify(body)});
function fixture(result={data:{ok:true}}){const calls=[];const admin={auth:{getUser:async()=>({data:{user:{id:'caller'}}})},rpc:async(name,args)=>{calls.push({name,args});return result;}};return {handler:createHandler(admin),calls,admin};}
test('first names normalize case and surrounding whitespace',()=>{for(const name of ['Thomas','THOMAS','thomas',' ThOmAs '])assert.equal(normalizeName(name),'thomas');for(const n of ['Manuela','DESIREE','martin'])assert.equal(normalizeName(n),n.toLowerCase());assert.equal(normalizeName(null),'');});
test('rejects foreign origins before database access',async()=>{const f=fixture();const r=await f.handler(request({name:'Test',code:'abcde'},{origin:'https://evil.invalid'}));assert.equal(r.status,403);assert.equal(f.calls.length,0);assert.equal(r.headers.get('Access-Control-Allow-Origin'),null);});
test('missing and invalid bearer tokens fail closed',async()=>{const f=fixture();assert.equal((await f.handler(request({},{authorization:''}))).status,401);f.admin.auth.getUser=async()=>({error:{}});assert.equal((await f.handler(request({}))).status,401);});
test('oversized request is rejected without database access',async()=>{const f=fixture();assert.equal((await f.handler(request('x'.repeat(5000)))).status,400);assert.equal(f.calls.length,0);});
test('names normalize but passwords retain exact case and whitespace',async()=>{const f=fixture();const r=await f.handler(request({name:' TeSt ',code:'aBcDe '}));assert.equal(r.status,200);assert.equal(f.calls[0].args.p_name,'test');assert.equal(f.calls[0].args.p_code,'aBcDe ');assert.equal(f.calls[0].args.p_requester,'caller');assert.equal(f.calls[0].name,'howdy_authenticate');assert.match(f.calls[0].args.p_client_key,/^[0-9a-f]{64}$/);assert.equal(r.headers.get('cache-control'),'no-store');});
test('a request cannot select a different session identity',async()=>{const f=fixture();await f.handler(request({name:'Test',code:'abcde',p_requester:'other-person'}));assert.equal(f.calls[0].args.p_requester,'caller');});
test('unknown names and incorrect passwords fail generically',async()=>{const f=fixture({data:{ok:false}});const r=await f.handler(request({name:'Other',code:'abcde'}));assert.equal(r.status,400);assert.equal((await r.json()).error,'Vorname oder Passwort ungültig.');});
test('database errors never grant access',async()=>{const f=fixture({error:{message:'private database details'}});const r=await f.handler(request({name:'Test',code:'abcde'}));assert.equal(r.status,503);assert.ok(!(await r.text()).includes('private database details'));});
test('throttling is returned as HTTP 429',async()=>{const f=fixture({data:{ok:false,limited:true}});assert.equal((await f.handler(request({name:'Test',code:'abcde'}))).status,429);});
test('five-character group passwords are accepted without hardcoding any secret',async()=>{const f=fixture();assert.equal((await f.handler(request({name:'Test',code:'aB12!'}))).status,200);});

