// One durable perspective for this app origin. Personal files never enter wardrobe exports.
const DB='spreeai-fitting-profile-v1',STORE='profile',KEY='current';
export function profileRecord(identity) {
  if(!identity)return null;
  const common={kind:identity.kind,key:identity.key||crypto.randomUUID(),name:identity.kind==='photo'?'You':identity.name};
  if(identity.kind==='photo') {
    if(!(identity.file instanceof Blob)||!['image/jpeg','image/png','image/webp'].includes(identity.file.type)||identity.file.size>10*1024*1024)throw Error('Choose a readable JPG, PNG or WebP photo under 10 MB.');
    return {...common,file:identity.file,fileName:identity.file.name||'fitting-photo.jpg'};
  }
  if(identity.kind!=='twin'||!identity.id||!identity.url?.startsWith('https://'))throw Error('Choose an available Twin.');
  return {...common,id:identity.id,url:identity.url};
}
export async function restoreProfile(record) {
  if(record===undefined)return undefined;
  if(record===null||record.kind==='none')return null;
  if(record.kind!=='photo')return record;
  const file=new File([record.file],record.fileName,{type:record.file.type});
  const url=await photoDataURL(file);
  await decodeImage(url);
  return {kind:'photo',key:record.key,name:'You',file,url};
}
export function photoDataURL(file) {return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('This photo could not be opened.'));reader.readAsDataURL(file);});}
export function decodeImage(url,signal) {return new Promise((resolve,reject)=>{
  if(signal?.aborted){reject(new DOMException('Cancelled','AbortError'));return;}
  const image=new Image(),timer=setTimeout(()=>finish(Error('This image could not be loaded. Please retry.')),15000);
  const abort=()=>finish(new DOMException('Cancelled','AbortError'));
  function finish(error){clearTimeout(timer);signal?.removeEventListener('abort',abort);image.onload=image.onerror=null;error?reject(error):resolve(url);}
  signal?.addEventListener('abort',abort,{once:true});image.onload=()=>image.naturalWidth?finish():finish(Error('This image could not be loaded.'));image.onerror=()=>finish(Error('This image could not be loaded. Please retry.'));image.src=url;
});}
async function database() {return new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB){reject(Error('Photo storage is unavailable in this browser.'));return;}
  const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore(STORE);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Photo storage could not be opened.'));request.onblocked=()=>reject(Error('Close another SPREEAI tab and try saving again.'));
});}
async function transaction(mode,operation) {
  const db=await database();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode),request=operation(tx.objectStore(STORE));tx.oncomplete=()=>resolve(request.result);tx.onerror=tx.onabort=()=>reject(Error('Your fitting profile could not be saved. Check browser storage and retry.'));});}finally{db.close();}
}
export async function loadFittingProfile(){return restoreProfile(await transaction('readonly',store=>store.get(KEY)));}
export async function persistFittingProfile(identity){const record=profileRecord(identity);await transaction('readwrite',store=>store.put(record||{kind:'none'},KEY));}
