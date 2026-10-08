import {decodeImage} from './fittingProfile.mjs';
export function stagePreviewOrigin(url,requestId){
 try{const asset=new URL(url),uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
  if(asset.protocol!=='https:'||asset.hostname!=='cdn-minio.stage.spreeai.com'||asset.port||asset.username||asset.password||asset.search||asset.hash||!uuid.test(requestId))return null;
  const parts=asset.pathname.split('/');
  if(parts.length!==4||parts[1]!=='users'||!uuid.test(parts[2])||!['webp','png','jpg','jpeg'].some(ext=>parts[3]===requestId+'.'+ext))return null;
  asset.hostname='api-minio.stage.spreeai.com';return asset.href;
 }catch{return null;}
}
// A completed job must also produce a readable image. Retry the same request only.
export async function verifyPreviewImage(initial,read,{signal,allowStageOrigin=false,decode=decodeImage,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),delays=[500,2000,5000]}={}){
 let result=initial;
 for(let attempt=0;attempt<=delays.length;attempt++){
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  if(result.status==='FAILED')break;
  if(result.image?.url?.startsWith('https://')){
   try{await decode(result.image.url,signal);return result.image.url}catch(e){if(e.name==='AbortError')throw e;}
   const origin=allowStageOrigin?stagePreviewOrigin(result.image.url,initial.request_id):null;
   if(origin){try{await decode(origin,signal);return origin}catch(e){if(e.name==='AbortError')throw e;}}
  }
  if(attempt===delays.length)break;
  await wait(delays[attempt],signal);
  try{result=await read(initial.request_id)}catch(e){if(e.name==='AbortError')throw e;result={request_id:initial.request_id};}
 }
 throw Error('Your preview image could not be loaded. Please retry this fitting.');
}
