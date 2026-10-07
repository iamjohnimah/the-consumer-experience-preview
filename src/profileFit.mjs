export function fitValues(saved={}, unit='metric') {
  const show=(n,scale=1)=>n==null?'':String(Math.round(n/scale*100)/100);
  return {height:show(saved.heightCm,unit==='imperial'?2.54:1),weight:show(saved.weightKg,unit==='imperial'?.45359237:1),
    bust:show(saved.bustCm,unit==='imperial'?2.54:1),waist:show(saved.waistCm,unit==='imperial'?2.54:1),hips:show(saved.hipsCm,unit==='imperial'?2.54:1),bodyType:saved.bodyType||'Feminine'};
}
export function normalizeFit(values,unit='metric') {
  const length=unit==='imperial'?2.54:1,weight=unit==='imperial'?.45359237:1;
  const convert=(value,factor,min,max,label)=>{if(value===''||value==null)return null;const n=Number(value)*factor;if(!Number.isFinite(n)||n<min||n>max)throw new Error(`Check your ${label}.`);return Math.round(n*100)/100;};
  return {heightCm:convert(values.height,length,100,230,'height'),weightKg:convert(values.weight,weight,30,250,'weight'),
    bustCm:convert(values.bust,length,40,220,'chest / bust measurement'),waistCm:convert(values.waist,length,40,220,'waist measurement'),hipsCm:convert(values.hips,length,40,220,'hip measurement'),
    bodyType:values.bodyType==='Masculine'?'Masculine':'Feminine'};
}
export function savedTwin(identity) {
  // A Twin is a preset. Never serialize a personal file, photo or uploaded asset ID.
  if(identity?.kind!=='twin')return null;
  return {kind:'twin',key:identity.key,id:identity.id,name:identity.name,url:identity.url};
}
