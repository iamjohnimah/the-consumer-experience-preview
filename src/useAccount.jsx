import {useState,useEffect,useRef} from 'react';
import {persistPreview,previewSocial,previewAction} from './preview.mjs';
// Device drafts only. Hosted account services remain in the private app.
export function useAccount(state,setState) {
 const [saveStatus,setSaveStatus]=useState('Saved in this browser');
 const latest=useRef(state);latest.current=state;
 function save(){try{persistPreview(localStorage,latest.current);setSaveStatus('Saved in this browser')}catch{setSaveStatus('Browser storage is full or unavailable. Export your wardrobe from Profile to keep a copy.')}}
 useEffect(()=>{const timer=setTimeout(save,300);return()=>clearTimeout(timer)},[state]);
 const account={status:'ready',enabled:true,local:true,user:{id:'browser-preview',name:state.profile.name}},social=previewSocial(state);
 async function action(path,body){setState(s=>previewAction(s,path,body));return {saved:true}}
 async function publish(post){const entry={...post,id:crypto.randomUUID(),authorId:'browser-preview',name:state.profile.name,created:Date.now()};setState(s=>({...s,posts:[entry,...(s.posts||[])]}));return entry}
 async function request(path){if(path==='reports')return {saved:true};throw new Error('Live accounts and messages are available only in the signed-in app.')}
 return {account,social,saveStatus,enable:save,request,refresh:async()=>social,publish,action};
}
