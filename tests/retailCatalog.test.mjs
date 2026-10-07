import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {publicUrl,parsePrice,normalizeRetailRow,offerLink,mergeRetailProducts,combineCatalog} from '../src/retailCatalog.mjs';
import {parseCsv,parseJsonl,importFeed,main} from '../scripts/import-retailer-feed.mjs';
const now='2026-10-07T12:00:00Z';
const options={format:'awin-jsonl',importedAt:now,merchantId:'42',retailer:'Example retailer',publisherId:'99'};
const row={id:'coat-blue-m',title:'Cotton coat',brand:'Example',description:'A blue coat.',product_type:'Women > Jackets',link:'https://retailer.example/coat',image_link:'https://images.example/coat.webp',additional_image_link:['https://images.example/coat-back.webp'],lifestyle_image_link:'https://images.example/coat-model.webp',price:'125.00 EUR',sale_price:'100.00 EUR',sale_price_effective_date:'2026-10-01/2026-10-31',size:'M',color:'Blue',gender:'female',material:'Cotton',availability:'in_stock',gtin:'1234567890128'};
test('enhanced feed retains exact variant, lifestyle and alternate images, currency and sale period',()=>{
  const p=normalizeRetailRow(row,options);
  assert.equal(p.category,'Layers');assert.equal(p.gender,'Women');assert.equal(p.price,100);assert.equal(p.currency,'EUR');
  assert.deepEqual(p.sizes,['M']);assert.equal(p.material,'Cotton');assert.equal(p.images.length,2);assert.equal(p.model,row.lifestyle_image_link);
  assert.equal(p.offers[0].listPrice,125);assert.equal(p.offers[0].affiliateApproved,false);assert.equal(p.checked,null);
  assert.equal(p.garmentId,undefined,'A retailer photo is not a prepared try-on garment');
  assert.equal(normalizeRetailRow({...row,sale_price:'90 USD'},options).price,125);
  assert.equal(normalizeRetailRow({...row,sale_price_effective_date:'2026-01-01/2026-02-01'},options).price,125);
});
test('documented sectioned enhanced feed is accepted without confusing advertiser and product IDs',()=>{
  const p=normalizeRetailRow({meta:{advertiser_id:56,advertiser_name:'Second retailer'},product_basic:{id:row.id,title:row.title,link:row.link,image_link:row.image_link},product_identifiers:{brand:row.brand},product_category:{product_type:row.product_type},price_and_availability:{price:row.price,availability:row.availability}},options);
  assert.equal(p.sku,row.id);assert.equal(p.offers[0].merchantId,'56');assert.equal(p.offers[0].retailer,'Second retailer');
});
test('CSV parser supports escaped quotes, commas and multiline descriptions and rejects truncated feeds',()=>{
  assert.deepEqual(parseCsv('a,b\r\n"x,y","Two ""quotes""\nnext line"\r\n'),[{a:'x,y',b:'Two "quotes"\nnext line'}]);
  assert.throws(()=>parseCsv('a,b\nx'),/mismatch/);assert.throws(()=>parseCsv('a,b\n"unfinished'),/unterminated/);
  assert.throws(()=>parseCsv('a,a\nx,y'),/Duplicate/);
  assert.throws(()=>parseJsonl(JSON.stringify(row)+'\n{"error":500}'),/Feed error/);
  assert.throws(()=>parseJsonl(JSON.stringify(row)+'\n{"id":'),/Incomplete/);
});
test('CSV affiliate tracking requires matching publisher, merchant approval and an allowed tracking host',()=>{
  const csv={merchant_id:'42',merchant_name:'Example retailer',merchant_product_id:'sku1',product_name:'Cotton coat',brand_name:'Example',merchant_category:'Coats',merchant_deep_link:row.link,merchant_image_url:row.image_link,search_price:'125.00',currency:'EUR',in_stock:'1',aw_deep_link:'https://tracking.example/link?merchant=42&publisher=99'};
  const approval={merchantId:'42',publisherId:'99',approved:true,trackingHosts:['tracking.example']};
  const base={...options,format:'awin-csv'};
  assert.equal(offerLink(normalizeRetailRow(csv,base).offers[0]).affiliate,false);
  const offer=normalizeRetailRow(csv,{...base,approvals:[approval]}).offers[0];
  assert.deepEqual(offerLink(offer),{href:csv.aw_deep_link,affiliate:true,rel:'sponsored noopener noreferrer'});
  assert.equal(normalizeRetailRow(csv,{...base,publisherId:'1',approvals:[approval]}).offers[0].affiliateApproved,false);
  assert.equal(normalizeRetailRow({...csv,aw_deep_link:'https://unapproved.example/link'},{...base,approvals:[approval]}).offers[0].affiliateApproved,false);
  assert.equal(offerLink({...offer,availability:'out_of_stock'}),null);
  assert.equal(offerLink({...offer,validUntil:'2020-01-01'}),null);
  assert.equal(offerLink({...offer,trackingUrl:'javascript:alert(1)'}).affiliate,false);
});
test('no secret-bearing, credentialed or local link enters the public catalog',()=>{
  for(const u of ['javascript:alert(1)','http://retailer.example/p','https://user:pass@retailer.example/p','https://localhost/p','https://127.0.0.1/p','https://[::1]/p','https://retailer.example/p?api_key=secret','https://retailer.example/apikey/secret/p'])assert.equal(publicUrl(u),null,u);
  assert.equal(parsePrice('not a price','USD'),null);assert.equal(parsePrice('125'),null);assert.equal(parsePrice('-10 USD'),null);
  assert.deepEqual(parsePrice({value:'12.50',currency:'GBP'}),{amount:12.5,currency:'GBP'});
  assert.equal(parsePrice('10 XYZ'),null);
  assert.equal(normalizeRetailRow({...row,gtin:'1234567890123'},options).gtin,null);
  assert.throws(()=>importFeed(JSON.stringify({...row,image_link:'https://localhost/p'}),options));
});
test('retailer comparisons merge exact variants only, retaining separate currencies and retailer offers',()=>{
  const a=normalizeRetailRow(row,options),b=normalizeRetailRow({...row,link:'https://other.example/coat',price:'140 USD',sale_price:undefined},{...options,merchantId:'43',retailer:'Other retailer'});
  const merged=mergeRetailProducts([a,b]);assert.equal(merged.length,1);assert.equal(merged[0].offers.length,2);assert.deepEqual(merged[0].offers.map(o=>o.currency),['EUR','USD']);
  assert.equal(mergeRetailProducts([a,{...b,color:'Red'}]).length,2);
  assert.equal(mergeRetailProducts([a,{...b,sizes:['L']}]).length,2);
  assert.equal(mergeRetailProducts([{...a,gtin:null},{...b,gtin:null}]).length,2);
});
test('refresh removes retired merchant offers and invalid imports preserve the previous snapshot',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'spree-retail-')),output=join(dir,'catalog.json'),input=join(dir,'feed.jsonl');
  const old=normalizeRetailRow({...row,id:'retired',gtin:null},options);
  const other=normalizeRetailRow({...row,id:'other',gtin:null},{...options,merchantId:'43'});
  await writeFile(output,JSON.stringify({version:1,products:[old,other]}));await writeFile(input,JSON.stringify(row));
  await main(['--input',input,'--format','awin-jsonl','--advertiser','42','--retailer','Example retailer','--output',output]);
  const content=await readFile(output,'utf8'),snapshot=JSON.parse(content);assert.equal(snapshot.products.length,2);assert.ok(!snapshot.products.some(p=>p.sku==='retired'));
  await writeFile(input,JSON.stringify(row)+'\n{"error":500}');
  await assert.rejects(main(['--input',input,'--format','awin-jsonl','--advertiser','42','--retailer','Example retailer','--output',output]));
  assert.equal(await readFile(output,'utf8'),content);
});
test('prepared catalog order and fitting identifiers remain intact when retailer data is added',()=>{
  const retail=normalizeRetailRow(row,options);
  const prepared={id:'prepared',brand:'Example',name:'Prepared coat',image:'assets/coat.webp',source:row.link,garmentId:'approved-garment',partnerId:'existing',color:'Blue',sizes:['M']};
  const combined=combineCatalog([prepared],[retail]);assert.equal(combined.length,1);assert.equal(combined[0].id,'prepared');assert.equal(combined[0].garmentId,'approved-garment');assert.equal(combined[0].price,100);
  assert.equal(combineCatalog([prepared],[{...retail,color:'Red'}]).length,2);
});
