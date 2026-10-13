import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../public/shop-replica/',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
test('every mirrored catalog garment has a local product entry',()=>{const rows=JSON.parse(read('online/collection/catalog.json'));assert.equal(rows.length,680);for(const p of rows){assert.ok(existsSync(new URL(`online/product/spree-${p.id}/index.html`,root)),p.id);assert.match(p.image,/^https:\/\/(?:[a-z0-9.-]+\.)?spreeai\.com\//);}});
test('original product app resolves within the consumer deployment prefix',()=>{const s=read('online/assets/index-oMclJJV1.js');assert.ok(s.includes('basename:window.__SHOP_ROOT__+`/online/`'));const app=read('online/assets/App-BHb0qeXa.js');assert.ok(app.includes('${window.__SHOP_ROOT__}/online/collection/'));assert.ok(app.includes('product-outfit-builder'));});
test('original collection shuffles once per visit and keeps filter order stable',()=>{const s=read('online/collection/app.js');assert.ok(s.includes('const visitRanks=new Map()'));assert.ok(s.includes('visitRanks.set(row.id,Math.random())'));assert.ok(s.includes('visitRanks.get(a.id)-visitRanks.get(b.id)'));});
