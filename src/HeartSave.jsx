import React,{useEffect} from 'react';
import {Heart} from '@phosphor-icons/react';
export function HeartSave({saved,onClick,label,className=''}){return <button className={'heart-save '+className} aria-label={label} aria-pressed={saved} onClick={onClick}><Heart weight={saved?'fill':'regular'}/></button>}
export function HeartBurst({burst,onDone}){useEffect(()=>{if(!burst)return;const timer=setTimeout(onDone,1250);return()=>clearTimeout(timer)},[burst]);if(!burst)return null;return <span key={burst.id} className="consumer-heart-burst" aria-hidden="true" style={{left:burst.x,top:burst.y}}>{[-35,-20,-6,9,24,38].map((dx,i)=><i key={i} style={{'--dx':dx+'px',animationDelay:i*.035+'s'}}><Heart weight="fill"/></i>)}</span>}
