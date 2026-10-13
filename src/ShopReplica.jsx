import React,{useState} from 'react';
// The pinned public Shop frontend owns its layouts, responsive rules and motion.
// Remounting on entry gives each visit a fresh stable collection order.
export default function ShopReplica(){const [visit]=useState(()=>crypto.randomUUID());return <iframe className="shop-replica-frame" title="SPREEAI Shop collection and fitting room" src={`shop-replica/online/collection/?website=prod&lang=en&visit=${visit}`} allow="autoplay; fullscreen"/>}
