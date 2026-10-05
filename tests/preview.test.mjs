import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {persistPreview,previewAction,previewSocial,PREVIEW_KEY} from '../src/preview.mjs';

test('public preview saves wardrobe locally and never conflates membership or votes',()=>{
  let saved;
  const storage={setItem:(key,value)=>saved={key,value}};
  const state={owned:[{id:'piece'}],posts:[{id:'draft'}],communityRooms:[],following:[],postVotes:[]};
  persistPreview(storage,state);
  assert.equal(saved.key,PREVIEW_KEY);
  assert.deepEqual(JSON.parse(saved.value),state);
  const voted=previewAction(state,'vote',{target:'draft',active:true});
  const followed=previewAction(voted,'follow',{target:'sample',active:true});
  assert.deepEqual(previewSocial(followed).votes,['draft']);
  assert.deepEqual(previewSocial(followed).following,['sample']);
  assert.deepEqual(previewSocial(followed).people,[]);
  assert.deepEqual(previewAction(followed,'vote',{target:'draft',active:false}).postVotes,[]);
  assert.throws(()=>previewAction(state,'messages',{}),/signed-in app/);
});

test('GitHub preview account and message surfaces do not call the private API',async()=>{
  for(const file of ['useAccount.jsx','CloudMessages.jsx']){
    const source=await readFile(new URL('../src/'+file,import.meta.url),'utf8');
    assert.doesNotMatch(source,/fetch\s*\(|\/api\//);
  }
});
