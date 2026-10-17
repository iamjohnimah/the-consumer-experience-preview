import test from 'node:test';
import assert from 'node:assert/strict';
import {retailerDestination,tryOnAvailable} from '../src/productIntegrity.mjs';
test('retailer handoff rejects unsafe, absent and unavailable destinations',()=>{assert.equal(retailerDestination({source:'javascript:alert(1)'}),null);assert.equal(retailerDestination({}),null);assert.equal(retailerDestination({source:'https://retailer.com/product',availability:'out_of_stock'}),null);assert.equal(retailerDestination({source:'https://retailer.com/product?api_key=private'}),null);assert.equal(retailerDestination({source:'https://retailer.com/product'}),'https://retailer.com/product');});

test('awaiting garment preparation cannot start try-on',()=>{assert.equal(tryOnAvailable({garmentId:'pending',tryonStatus:'Awaiting preparation'}),false);assert.equal(tryOnAvailable({}),false);assert.equal(tryOnAvailable({garmentId:'prepared'}),true);});
