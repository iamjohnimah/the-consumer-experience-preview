import test from 'node:test';
import assert from 'node:assert/strict';
import {weeklySuggestions,saveWeek,wardrobeCollections,regionalEdit} from '../src/dailyUtility.mjs';
const catalog=[{id:'top',category:'Tops'},{id:'bottom',category:'Bottoms'},{id:'coat',category:'Layers'},{id:'shoe',category:'Shoes'}];
test('suggestions use owned pieces and forecast, keeping every date in a Monday-first week',()=>{
 const owned=[...catalog,{id:'old',category:'Bags',status:'archived'}];
 const week=weeklySuggestions({owned,catalog,now:new Date('2026-10-06T12:00:00'),days:[{date:'2026-10-05',temperature_2m_max:28,weather_code:0},{date:'2026-10-06',temperature_2m_max:8,weather_code:61,precipitation_probability_max:90}]});
 assert.equal(week.length,7);assert.equal(week[0].day,'Mon');assert.equal(week[0].date,'2026-10-05');assert.equal(week[6].date,'2026-10-11');
 assert.ok(!week[0].items.includes('coat'));assert.ok(week[1].items.includes('coat'));assert.match(week[1].reason,/Rain/);
 assert.ok(week.every(p=>!p.example&&!p.items.includes('old')));
 assert.ok(weeklySuggestions({owned:[],catalog}).every(p=>p.example));
});
test('plan a week never duplicates or replaces a user plan',()=>{const week=weeklySuggestions({owned:[],catalog,now:new Date('2026-10-06T12:00:00')});const original={id:'mine',date:week[0].date,items:['mine']};let n=0;const next=saveWeek([original],week,()=>String(n++));assert.equal(next.length,7);assert.equal(next[0],original);assert.deepEqual(saveWeek(next,week,()=>String(n++)),next)});
test('wardrobe collections distinguish purchases, wishes and owned pieces',()=>{const owned=[{id:'receipt',origin:'Sample Gmail receipt'},{id:'manual',origin:'Added by you'},{id:'archived',origin:'Purchase',status:'archived'}];const c=wardrobeCollections(owned,['top'],catalog);assert.equal(c.owned.length,2);assert.deepEqual(c.purchases.map(p=>p.id),['receipt']);assert.deepEqual(c.wishlist.map(p=>p.id),['top']);});
test('geographic editorial selector changes place and keeps source attribution',()=>{assert.equal(regionalEdit('City','Paris','Île-de-France','France').label,'Paris');assert.equal(regionalEdit('State / region','Paris','Île-de-France','France').label,'Île-de-France');assert.equal(regionalEdit('Country','Paris','Île-de-France','France').label,'France');assert.ok(regionalEdit('City','Paris','IDF','France').edits.every(t=>t.source.startsWith('https://www.vogue.com/')));});
test('a wardrobe trend is expressed with an actual owned garment, without duplicating its category',()=>{const pieces=[{id:'tee',name:'Tee',category:'Tops'},{id:'trousers',name:'Trousers',category:'Bottoms'},{id:'jeans',name:'Denim jeans',category:'Bottoms'}];const week=weeklySuggestions({owned:pieces,catalog:[],now:new Date('2026-10-06T12:00:00')});assert.ok(week[0].items.includes('jeans'));assert.equal(week[0].items.filter(id=>pieces.find(p=>p.id===id).category==='Bottoms').length,1);assert.equal(week[0].trend,'Denim, reconsidered');});
