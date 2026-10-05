import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../src/catalog.json',import.meta.url)));
test('catalog filters use canonical genders and every preview points to a shipped local asset',()=>{
 const ids=new Set();
 for(const p of catalog){
  assert.ok(!ids.has(p.id),`Duplicate ${p.id}`);ids.add(p.id);
  assert.ok([null,undefined,'Men','Women','Unisex'].includes(p.gender),`${p.id}: ${p.gender}`);
  for(const field of ['image','model']) if(p[field]) assert.ok(existsSync(new URL('../public/'+p[field],import.meta.url)),`${p.id}: ${field}`);
  assert.ok(/^https:\/\//.test(p.source),`${p.id}: retailer link`);
  if(p.pendingGarmentId) assert.ok(!p.garmentId,`${p.id}: pending garment cannot enable fitting`);
 }
});
test('requested new brand groups retain their source currencies and men/women selection',()=>{
 for(const brand of ['GUCCI','DIOR','LOEWE','NIKE']){
  const pieces=catalog.filter(p=>p.id.startsWith('consumer-'+brand.toLowerCase()+'-'));
  assert.equal(pieces.filter(p=>p.gender==='Men').length,5,brand+' men');
  assert.equal(pieces.filter(p=>p.gender==='Women').length,5,brand+' women');
  assert.ok(pieces.every(p=>['USD','EUR'].includes(p.currency)));
 }
 for(const brand of ['CHLOÉ','SCHIAPARELLI']) assert.equal(catalog.filter(p=>p.brand===brand&&p.gender==='Women').length,5,brand);
});
