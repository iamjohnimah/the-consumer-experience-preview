import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../public/skincare/index.html',import.meta.url),'utf8');
const source=html.match(/<script[^>]*>([\s\S]*?)<\/script>/)[1].replace(/render\(\);\s*$/,'');
function app(saved){
 const elements=new Map(),store=new Map(saved?[['spreeai-beauty-v2',saved]]:[]);
 const node=()=>({textContent:'',innerHTML:'',style:{},addEventListener(){},setAttribute(){},classList:{toggle(){}},querySelector(){return null}});
 const document={querySelector:s=>{if(!elements.has(s))elements.set(s,node());return elements.get(s)},addEventListener(){},body:{classList:{toggle(){}}}};
 const context=vm.createContext({document,window:{addEventListener(){},scrollTo(){}},location:{hash:'#today',origin:'https://example.test',pathname:'/b2c/skincare/index.html'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},crypto:{randomUUID:()=>Math.random().toString(36)},structuredClone,URL,Date,console,setTimeout:()=>0,clearTimeout(){},AbortSignal});
 vm.runInContext(source,context);return {run:s=>vm.runInContext(s,context),store,context};
}
test('skincare opens every main screen, including empty routine, without requiring a questionnaire',()=>{
 const a=app();for(const route of ['today','start','shelf','profile','routine','progress','guide','settings']){a.run(`location.hash='#${route}';render()`)}
 assert.equal(a.run('state.profile'),null);assert.equal(a.run('state.shelf.length'),0);
 assert.match(a.run('photoHome()'),/photo|selfie/i);
});
test('corrupt skincare storage recovers with an explicit warning',()=>{const a=app('{broken');assert.equal(a.run('storageWarning'),true);assert.equal(a.run('state.checks.length'),0)});
test('unconfirmed products never enter the routine',()=>{const a=app();a.run("state.shelf=[{id:'x',name:'Unconfirmed',category:'Cleanse',period:'Both',confirmed:false,include:true}]");assert.equal(a.run("routine().some(p=>p.id==='x')"),false)});
test('confirmed selected products enter only their configured routine period',()=>{const a=app();a.run("state.shelf=[{id:'x',name:'Mine',category:'Cleanse',period:'Evening',confirmed:true,include:true}];period='Morning'");assert.equal(a.run("routine().some(p=>p.id==='x')"),false);a.run("period='Evening'");assert.equal(a.run("routine().some(p=>p.id==='x')"),true)});
test('failed persistence retains the previous skincare state and reports failure',()=>{const a=app();a.run("localStorage.setItem=()=>{throw Error('full')}");assert.equal(a.run("commit(s=>s.routineVersion=9)"),false);assert.equal(a.run('state.routineVersion'),1);assert.equal(a.run('storageWarning'),true)});
test('photo-first onboarding rejects invalid and non-front photos',()=>{const a=app();assert.equal(a.run("normalizeFlow({step:2,selfies:[{angle:'Side',data:'data:image/jpeg;base64,YQ=='}]}).step"),0);assert.equal(a.run("normalizeFlow({selfies:[{angle:'Front',data:'javascript:alert(1)'}]}).selfies.length"),0)});
test('a front selfie advances only as far as the completed product step',()=>{const a=app();assert.equal(a.run("normalizeFlow({step:2,selfies:[{angle:'Front',data:'data:image/jpeg;base64,YQ=='}]}).step"),1);assert.equal(a.run("normalizeFlow({step:2,selfies:[{angle:'Front',data:'data:image/jpeg;base64,YQ=='}],noProducts:true}).step"),2)});
test('one photo is never presented as its own baseline comparison',()=>{const a=app();a.run("state.checks=[{id:'a',date:'2026-10-01T12:00:00Z',photo:'data:image/jpeg;base64,YQ=='}]");assert.equal(a.run("comparisonPair('a')"),null)});
test('photo comparison uses a genuinely earlier front record',()=>{const a=app();a.run("state.checks=[{id:'b',date:'2026-10-02T12:00:00Z',photo:'data:image/jpeg;base64,Yg=='},{id:'a',date:'2026-10-01T12:00:00Z',photo:'data:image/jpeg;base64,YQ=='}]");assert.equal(a.run("comparisonPair('b').baseline.id"),'a');assert.equal(a.run("comparisonPair('a')"),null)});
test('persisted photo fields reject external URLs and unsafe URI schemes',()=>{const a=app();assert.equal(a.run("safePhoto('https://example.test/selfie.jpg')"),null);assert.equal(a.run("safeUrl('javascript:alert(1)')"),'');assert.equal(a.run("safeUrl('https://example.test/product')"),'https://example.test/product')});
test('embedded skincare retains its own storage key and clearly unconnected AI service',()=>{assert.match(source,/KEY='spreeai-beauty-v2'/);assert.match(source,/BEAUTY_SERVICE_ORIGIN=''/);assert.match(html,/event.origin===location.origin&&event.source===parent/)});
test('invalid calendar dates and impossible reminder times do not survive saved-state validation',()=>{const a=app();assert.equal(a.run("validDay('2026-02-31')"),false);assert.equal(a.run("validDay('2028-02-29')"),true);assert.equal(a.run("normalize({settings:{morning:'99:99',evening:'24:01'}}).settings.morning"),'08:00');assert.equal(a.run("normalize({settings:{morning:'99:99',evening:'24:01'}}).settings.evening"),'21:00')});
test('AI review rejects an incomplete result rather than manufacturing observations',()=>{const a=app();assert.equal(a.run("normalizePhotoReview({status:'complete',observations:[]})"),null)});
test('AI products require a matching source and uncertain identities remain uncertain',()=>{const a=app();assert.equal(a.run("normalizePhotoReview({status:'complete',provider:'OpenAI',sources:[],observations:[],recommendations:[{name:'Unsupported',source:'https://example.test'}]}).recommendations.length"),0);assert.equal(a.run("normalizePhotoReview({status:'complete',provider:'OpenAI',sources:[{url:'https://example.test/'}],observations:[],recommendations:[{name:'Sourced',source:'https://example.test/'}]}).recommendations[0].identity"),'uncertain')});
test('sample experience does not persist changes into personal records',()=>{const a=app();a.run('demo=true;commit(s=>s.routineVersion=2)');assert.equal(a.store.has('spreeai-beauty-v2'),false)});
