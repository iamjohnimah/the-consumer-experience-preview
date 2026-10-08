import test from 'node:test';
import assert from 'node:assert/strict';
import {changeComparison,comparisonEntries,pieceSource,lookSource,lookKey} from '../src/wardrobeSelections.mjs';
test('comparison accepts four pieces or outfits and still allows removal at capacity',()=>{
 const selection=['a','b','c',lookKey('outfit')];
 assert.deepEqual(changeComparison(selection,'fifth'),selection);
 assert.deepEqual(changeComparison(selection,'b'),['a','c',lookKey('outfit')]);
 assert.deepEqual(changeComparison(changeComparison(selection,'b'),'fifth'),['a','c',lookKey('outfit'),'fifth']);
});
test('owned pieces take precedence over wishlist without marking shopping choices as owned',()=>{
 const owned=[{id:'a'}],saved=['a','b'];
 assert.equal(pieceSource({id:'a'},owned,saved),'Already yours');
 assert.equal(pieceSource({id:'b'},owned,saved),'Want to buy');
 assert.equal(lookSource(['a','b'],owned),'Owned + to buy');
 assert.equal(lookSource(['b'],owned),'To-buy look');
 assert.deepEqual(owned,[{id:'a'}]);
});
test('saved-look totals exclude unverifiable or mixed-currency totals and omit unavailable looks',()=>{
 const pieces=[{id:'a',price:10,currency:'USD'},{id:'b',price:20,currency:'USD'},{id:'e',price:30,currency:'EUR'},{id:'archived',status:'archived',price:5}];
 const entries=comparisonEntries(pieces,[{id:'one',items:['a','b']},{id:'mixed',items:['a','e']},{id:'missing',items:['a','lost']},{id:'old',items:['archived']}]);
 assert.equal(entries.find(e=>e.key===lookKey('one')).price,30);
 assert.equal(entries.find(e=>e.key===lookKey('mixed')).price,null);
 assert.equal(entries.find(e=>e.key===lookKey('missing')).price,null);
 assert.ok(!entries.some(e=>e.key===lookKey('old')||e.key==='archived'));
});
