import React,{useEffect,useRef,useState,useId} from 'react';
import {CaretLeft,CaretRight} from '@phosphor-icons/react';

export default function ScrollRow({children,className='',label='cards',disabled=false}){
 const row=useRef(null),id=useId(),[edges,setEdges]=useState({overflow:false,start:true,end:false});
 useEffect(()=>{
  const el=row.current;if(!el)return;
  const measure=()=>setEdges({overflow:el.scrollWidth>el.clientWidth+2,start:el.scrollLeft<=2,end:el.scrollLeft+el.clientWidth>=el.scrollWidth-2});
  const observer=new ResizeObserver(measure);observer.observe(el);[...el.children].forEach(child=>observer.observe(child));
  el.addEventListener('scroll',measure,{passive:true});measure();
  return()=>{observer.disconnect();el.removeEventListener('scroll',measure)};
 },[children]);
 const move=direction=>{const el=row.current;if(!el)return;el.scrollBy({left:direction*Math.max(100,el.clientWidth*.8),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
 return <div className="scroll-row-shell">{edges.overflow&&<div className="scroll-row-controls"><span>Explore more {label}</span><div><button type="button" className="icon-button" aria-label={'Previous '+label} aria-controls={id} disabled={disabled||edges.start} onClick={()=>move(-1)}><CaretLeft/></button><button type="button" className="icon-button" aria-label={'Next '+label} aria-controls={id} disabled={disabled||edges.end} onClick={()=>move(1)}><CaretRight/></button></div></div>}<div id={id} ref={row} className={className} role="region" aria-label={label} tabIndex={edges.overflow?0:undefined}>{children}</div></div>
}
