export const COMPARE_LIMIT=4;
export const lookKey=id=>'look:'+id;
export function changeComparison(selection,key){
 if(selection.includes(key))return selection.filter(id=>id!==key);
 return selection.length<COMPARE_LIMIT?[...selection,key]:selection;
}
export function pieceSource(piece,owned,saved){
 if(owned.some(p=>p.id===piece.id))return 'Already yours';
 return saved.includes(piece.id)?'Want to buy':'Shop piece';
}
export function lookSource(items,owned){
 const count=items.filter(id=>owned.some(p=>p.id===id)).length;
 return count===items.length&&count>0?'Owned look':count?'Owned + to buy':'To-buy look';
}
export function comparisonEntries(pieces,looks){
 const available=pieces.filter(p=>p.status!=='archived');
 return [...looks.map(l=>{
  const items=l.items.map(id=>available.find(p=>p.id===id)).filter(Boolean);
  const currency=items[0]?.currency||'USD';
  const price=items.length===l.items.length&&items.length&&items.every(p=>Number.isFinite(p.price)&&(p.currency||'USD')===currency)?items.reduce((n,p)=>n+p.price,0):null;
  return {...l,key:lookKey(l.id),kind:'look',pieces:items,price,currency};
 }).filter(l=>l.pieces.length),...available.map(p=>({...p,key:p.id,kind:'piece',pieces:[p]}))];
}
