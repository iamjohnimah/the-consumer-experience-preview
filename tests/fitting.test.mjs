import test from 'node:test';
import assert from 'node:assert/strict';
import {fittingConfig,fittingRequest,renderTwin,recommendSize,uploadPhoto,fittingError,loadTwins} from '../src/fitting.mjs';

test('fitting sessions stay scoped to the garment collection and carry only shopper credentials',async()=>{
 const original=globalThis.fetch,calls=[];
 globalThis.fetch=async(url,opts)=>{calls.push({url,opts,body:opts.body?JSON.parse(opts.body):undefined});return Response.json(url.endsWith('/v1/user/guest')?{access_token:url.includes('stage')?'stage-shopper':'dev-shopper',expires_in:1800}:{ok:true})};
 try{await fittingRequest({partnerId:'contract-review'},'/v1/check');await fittingRequest({},'/v1/check');assert.deepEqual(calls.filter(c=>c.body).map(c=>c.body.partner_id),['contract-review','demo-site']);assert.equal(calls[1].opts.headers.Authorization,'Bearer stage-shopper');assert.equal(calls[3].opts.headers.Authorization,'Bearer dev-shopper');assert.equal(fittingConfig({}).base,'https://api.dev.spreeai.com')}finally{globalThis.fetch=original}
});
test('completed outfit renders send every garment and avoid unverified sizing claims',async()=>{
 const original=globalThis.fetch,calls=[];globalThis.fetch=async(url,opts)=>{const body=opts.body?JSON.parse(opts.body):undefined;calls.push({url,body});return Response.json(url.endsWith('/v1/user/guest')?{access_token:'guest',expires_in:1800}:url.includes('/user-assets/')?{status:'COMPLETE',image:{url:'https://example.com/actual.png'}}:{request_id:'actual-job'})};
 try{const result=await renderTwin({partnerId:'outfit-contract',garmentId:'top',garmentIds:['top','pants']},{id:'twin-1',name:'Twin'},new AbortController().signal,()=>{},'front','M');const request=calls.find(c=>c.url.endsWith('/store-experience/tryon'));assert.deepEqual(request.body.garment_set.garments,[{garment_id:'top'},{garment_id:'pants'}]);assert.equal(request.body.size,undefined);assert.equal(result.twinName,'Twin');assert.equal(result.image.url,'https://example.com/actual.png')}finally{globalThis.fetch=original}
});
test('expired shopper sessions refresh within their own collection',async()=>{
 const original=globalThis.fetch,calls=[];globalThis.fetch=async(url,opts)=>{calls.push({url,opts});return Response.json(url.endsWith('/v1/user/guest')?{access_token:'old',refresh_token:'refresh',expires_in:1}:url.endsWith('/v1/auth/refresh')?{access_token:'new',expires_in:1800}:{ok:true})};
 try{const p={partnerId:'refresh-contract'};await fittingRequest(p,'/first');await fittingRequest(p,'/second');assert.ok(calls.some(c=>c.url.endsWith('/v1/auth/refresh')));assert.equal(calls.at(-1).opts.headers.Authorization,'Bearer new')}finally{globalThis.fetch=original}
});
test('unsupported sizing and invalid photo uploads fail before transmission',async()=>{
 const original=globalThis.fetch;let called=false;globalThis.fetch=async()=>{called=true;throw Error('Unexpected request')};try{await assert.rejects(recommendSize({category:'Bags'},{height:170,weight:58}),/unavailable/);await assert.rejects(uploadPhoto({},new File(['bad'],'bad.txt',{type:'text/plain'})),/JPG/);assert.equal(called,false)}finally{globalThis.fetch=original}
});
test('missing back assets preserve an understandable front-preview path',()=>{assert.match(fittingError('variant has no back_flat image'),/front preview is still available/);assert.match(fittingError('variant failed processing'),/still being prepared/)});
test('profile and fitting reuse preset Twins only within the same collection and never cache an aborted request',async()=>{
 const original=globalThis.fetch,calls=[];
 globalThis.fetch=async(url)=>{calls.push(url);return Response.json(url.endsWith('/v1/user/guest')?{access_token:'guest',expires_in:1800}:{avatars:[{id:'preset',name:'Preset Twin'}]})};
 try{
  const a={partnerId:'preset-cache-a'},b={partnerId:'preset-cache-b'};
  assert.equal((await loadTwins(a))[0].id,'preset');await loadTwins(a);await loadTwins(b);
  assert.equal(calls.filter(u=>u.includes('/v1/avatars')).length,2);
  const c=new AbortController();c.abort();await assert.rejects(loadTwins(a,c.signal),{name:'AbortError'});
 }finally{globalThis.fetch=original}
});
