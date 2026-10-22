import React,{useEffect,useRef,useState} from 'react';
import {asset} from './preview.mjs';
import './skincare.css';
export function ExperienceCategories({skincare=false}){
 return <nav className="experience-categories" aria-label="Experience category"><a href="#/today" aria-current={!skincare?'page':undefined}>Fashion</a><a href="#/skincare" aria-current={skincare?'page':undefined}>Skincare</a><span>Your everyday, together.</span></nav>;
}
export default function Skincare({dark}){
 const frame=useRef(null),[ready,setReady]=useState(false);
 const syncAppearance=()=>frame.current?.contentWindow?.postMessage({type:'spreeai:appearance',dark},location.origin);
 useEffect(syncAppearance,[dark,ready]);
 return <section className="skincare-category" aria-labelledby="skincare-title"><header className="skincare-heading"><div><p className="eyebrow">YOUR DAILY CARE</p><h1 id="skincare-title">Skincare.</h1><p>Your products, your routine and your progress. Start with one front selfie.</p></div><details><summary>Before you start</summary><p>Your skincare records stay in this browser. Live AI photo reviews and comparisons need a connected service; no result is generated when it is unavailable. Photos saved in the separate beauty demo remain there.</p><a href="https://iamjohnimah.github.io/spreeai-beauty/#settings" target="_blank" rel="noreferrer">Open previous skincare records</a></details></header>{!ready&&<p role="status">Opening your skincare space…</p>}<iframe ref={frame} title="Skincare: photo review, products, routine and progress" src={asset('skincare/index.html?embedded=1')} className="skincare-frame" allow="camera" onLoad={()=>{setReady(true);syncAppearance()}}/><p className="skincare-record-note">Skincare photos stay separate from your fashion fitting profile. <a href={asset('skincare/index.html#settings')} target="_blank" rel="noreferrer">Manage or export skincare records</a></p></section>;
}
