// Style signals are explicit local preferences, never inferred sensitive traits.
export function rankPieces(items,signals={}) {
 const score=p=>Object.entries(signals).reduce((n,[id,value])=>{const other=items.find(x=>x.id===id);if(!other)return n;return n+(id===p.id?value*4:0)+(other.brand===p.brand?value:0)+(other.category===p.category?value*.5:0)},0);
 return [...items].sort((a,b)=>score(b)-score(a));
}
export function wardrobeRecap(owned,plans,now=new Date()) {
 const active=owned.filter(p=>p.status!=='archived');const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-6);const from=cutoff.toLocaleDateString('en-CA'),to=now.toLocaleDateString('en-CA');
 const worn=plans.filter(p=>p.worn&&p.date>=from&&p.date<=to),ids=new Set(worn.flatMap(p=>p.items));
 return {outfits:worn.length,pieces:active.filter(p=>ids.has(p.id)).length,total:active.length,rediscover:[...active].sort((a,b)=>(a.wears||0)-(b.wears||0)).slice(0,3).map(p=>p.id)};
}
export function encodeRecipe(name,ids,catalog){const allowed=new Set(catalog.map(p=>p.id));const items=[...new Set(ids.filter(id=>allowed.has(id)))].slice(0,6);if(!items.length)throw new Error('A share link needs at least one catalog piece.');const bytes=new TextEncoder().encode(JSON.stringify({v:1,name:String(name).slice(0,80),items}));return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
export function decodeRecipe(encoded,catalog){try{if(encoded.length>1800||!/^[A-Za-z0-9_-]+$/.test(encoded))return null;const raw=atob(encoded.replaceAll('-','+').replaceAll('_','/'));const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0))));const allowed=new Set(catalog.map(p=>p.id));if(data.v!==1||typeof data.name!=='string'||data.name.length>80||!Array.isArray(data.items)||!data.items.length||data.items.length>6||data.items.some(id=>typeof id!=='string'||!allowed.has(id)))return null;return {...data,items:[...new Set(data.items)]};}catch{return null}}
