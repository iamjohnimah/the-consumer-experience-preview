import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeFit,fitValues,savedTwin} from '../src/profileFit.mjs';
test('fit units convert into SDK centimeters and kilograms without inventing optional measurements',()=>{
  const fit=normalizeFit({height:'67',weight:'150',bust:'',waist:'',hips:'',bodyType:'Feminine'},'imperial');
  assert.equal(fit.heightCm,170.18);assert.equal(fit.weightKg,68.04);assert.equal(fit.bustCm,null);
  assert.equal(fitValues(fit,'imperial').height,'67');assert.equal(fitValues(fit,'imperial').weight,'150');
  assert.equal(normalizeFit({height:'',weight:''}).heightCm,null);
  assert.throws(()=>normalizeFit({height:'5',weight:'70'}),/height/);
  assert.throws(()=>normalizeFit({height:'170',weight:'banana'}),/weight/);
});
test('only preset Twins are persisted; a personal photo, file and uploaded asset ID never enter saved profile metadata',()=>{
  assert.equal(savedTwin({kind:'photo',id:'uploaded-user-image',file:{},url:'data:image/jpeg;base64,private'}),null);
  assert.deepEqual(savedTwin({kind:'twin',key:'preset-key',id:'avatar',name:'Twin',url:'https://images.example/twin',file:'must-not-save',weight:99}),{kind:'twin',key:'preset-key',id:'avatar',name:'Twin',url:'https://images.example/twin'});
});
