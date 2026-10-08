import test from 'node:test';
import assert from 'node:assert/strict';
import {profileRecord} from '../src/fittingProfile.mjs';
import {stagePreviewOrigin,verifyPreviewImage} from '../src/previewImage.mjs';
test('durable photo records retain original bytes without provider asset IDs or expiring URLs',async()=>{
 const file=new File(['original-photo-bytes'],'photo.png',{type:'image/png'}),record=profileRecord({kind:'photo',key:'photo-key',file,id:'provider-id',url:'https://expiring.example/photo'});
 assert.equal(record.url,undefined);assert.equal(record.id,undefined);assert.equal(await record.file.text(),'original-photo-bytes');assert.equal(record.fileName,'photo.png');
 assert.throws(()=>profileRecord({kind:'photo',file:new File(['bad'],'photo.txt',{type:'text/plain'})}),/readable/);
});
const id='12345678-1234-1234-1234-123456789abc',user='87654321-4321-4321-4321-cba987654321',url=`https://cdn-minio.stage.spreeai.com/users/${user}/${id}.webp`;
test('staging recovery accepts only the exact unsigned result and never rewrites shopper inputs',()=>{
 assert.equal(stagePreviewOrigin(url,id),url.replace('cdn-minio','api-minio'));
 for(const input of [url+'?signature=secret',url.replace(id,user),url.replace('cdn-minio.stage.spreeai.com','other.example'),url.replace(`/${id}.webp`,`/tryon-inputs/${id}.webp`)])assert.equal(stagePreviewOrigin(input,id),null);
});
test('readiness retries the same request; a completed but unreadable image fails rather than claiming ready',async()=>{
 const reads=[],decodes=[];const image=await verifyPreviewImage({request_id:id,status:'COMPLETE',image:{url:'https://images.example/expired'}},async key=>{reads.push(key);return {request_id:key,status:'COMPLETE',image:{url:'https://images.example/fresh'}}},{decode:async link=>{decodes.push(link);if(link.endsWith('/expired'))throw Error('expired')},wait:async()=>{},delays:[1]});
 assert.equal(image,'https://images.example/fresh');assert.deepEqual(reads,[id]);
 await assert.rejects(verifyPreviewImage({request_id:id,status:'COMPLETE',image:{url}},async()=>({}),{decode:async()=>{throw Error('broken')},delays:[]}),/could not be loaded/);
});
test('cancellation prevents delivery and staging fallback preserves the request',async()=>{
 const controller=new AbortController();controller.abort();await assert.rejects(verifyPreviewImage({request_id:id},async()=>({}),{signal:controller.signal}),{name:'AbortError'});
 const decoded=[];assert.equal(await verifyPreviewImage({request_id:id,status:'COMPLETE',image:{url}},async()=>({}),{allowStageOrigin:true,decode:async link=>{decoded.push(link);if(link===url)throw Error('CDN unavailable')},delays:[]}),url.replace('cdn-minio','api-minio'));assert.equal(decoded.length,2);
});
