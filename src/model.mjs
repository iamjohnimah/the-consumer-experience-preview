import {occasionMode} from './occasions.mjs';
export const STORAGE_KEY='spreeai-consumer-public-v1';
export function removeRetiredPieces(state){
 if(!state||typeof state!=='object')return state;
 const retired=new Set(['chanel-tweed']);
 const clean=items=>items.filter(id=>!retired.has(id));
 return {...state,owned:state.owned?.filter(p=>!retired.has(p.id)),saved:state.saved&&clean(state.saved),looks:state.looks?.map(p=>({...p,items:clean(p.items)})),plans:state.plans?.map(p=>({...p,items:clean(p.items)})),posts:state.posts?.map(p=>({...p,items:clean(p.items)}))};
}
export function toggle(list,id){return list.includes(id)?list.filter(x=>x!==id):[...list,id]}
export function costPerWear(price,wears){return Number.isFinite(price)&&wears>0?price/wears:null}
export function mergeItems(existing,incoming){const ids=new Set(existing.map(x=>x.id));return [...existing,...incoming.filter(x=>{if(ids.has(x.id))return false;ids.add(x.id);return true})]}
export function searchItems(items,query,category='All',brand='All'){const q=query.toLowerCase().trim();return items.filter(i=>(category==='All'||i.category===category)&&(brand==='All'||i.brand===brand)&&`${i.name} ${i.brand} ${i.category} ${i.color}`.toLowerCase().includes(q))}
export function generateLook(items,occasion,rotation=0){occasion=occasionMode(occasion);const usable=items.filter(i=>i.status!=='archived'&&(occasion!=='Active'||/sport|fleece|sneaker|track|legging|training|jersey|hoodie|samba|air force|tee|sweat/i.test(i.name||'')));const pick=(cat,n=0)=>{const a=usable.filter(i=>cat.includes(i.category));return a[(rotation+n)%a.length]};let selection=occasion==='Evening'?[pick(['Dresses']),pick(['Bags']),pick(['Shoes'])]:[pick(['Tops']),pick(['Bottoms']),pick(['Layers']),pick(['Shoes']),pick(['Bags'])];if(occasion==='Active')return selection.filter(Boolean).map(i=>i.id);if(!selection[0])selection=occasion==='Evening'&&pick(['Tops'])?[pick(['Tops']),pick(['Bottoms']),pick(['Layers']),pick(['Shoes']),pick(['Bags'])]:[pick(['Dresses']),pick(['Shoes']),pick(['Bags'])];return selection.filter(Boolean).filter((i,n,a)=>a.findIndex(x=>x.id===i.id)===n).map(i=>i.id)}
export function validState(x){return Boolean(x&&x.version===1&&['owned','saved','looks','plans','events','following','messages','alerts','rsvps'].every(k=>Array.isArray(x[k]))&&x.owned.every(i=>i&&typeof i.id==='string'&&typeof i.name==='string'&&typeof i.image==='string')&&x.looks.every(i=>i&&Array.isArray(i.items))&&x.plans.every(i=>i&&Array.isArray(i.items))&&['posts','postVotes','hiddenPosts','reports','blockedPeople','comments'].every(k=>x[k]===undefined||Array.isArray(x[k]))&&(x.posts||[]).every(p=>p&&typeof p.id==='string'&&typeof p.title==='string'&&Array.isArray(p.items)&&Array.isArray(p.images))&&(x.comments||[]).every(c=>c&&typeof c.id==='string'&&typeof c.postId==='string'&&typeof c.text==='string'&&typeof c.author==='string')&&typeof x.profile?.name==='string'&&typeof x.profile?.city==='string')}

export function safeDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(new Date(value+'T12:00:00').getTime())}

export function lookWithAnchor(ids,anchor,get){const conflicts=anchor.category==='Dresses'?['Dresses','Tops','Bottoms']: ['Tops','Bottoms'].includes(anchor.category)?[anchor.category,'Dresses']:[anchor.category];return [...ids.filter(id=>get(id)&&!conflicts.includes(get(id).category)),anchor.id]}
