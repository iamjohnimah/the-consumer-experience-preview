import React from 'react';
import {ArrowUpRight} from '@phosphor-icons/react';
import {offerLink,offersFor} from './retailCatalog.mjs';
const price=(n,currency)=>n==null?'Price at retailer':new Intl.NumberFormat('en-US',{style:'currency',currency,minimumFractionDigits:0}).format(n);
export default function RetailOffers({product}) {
  const offers=offersFor(product), affiliated=offers.some(o=>offerLink(o)?.affiliate);
  if(!offers.length) return null;
  return <section className="retailer-offers" aria-label="Retailer prices and availability"><h3>{offers.length>1?'Where to buy':'At the retailer'}</h3>
    {offers.map(o=>{const link=offerLink(o);return <div className="retailer-offer" key={o.id}>
      <div className="offer-heading"><div><strong>{o.retailer}</strong><small>{o.availability==='in_stock'?'Retailer reports in stock':o.availability==='preorder'?'Preorder':o.availability==='backorder'?'Backorder':o.availability==='out_of_stock'?'Out of stock':'Confirm availability at the retailer'}{o.size?` · ${o.size}`:''}</small></div>
      <div className="offer-price"><strong>{price(o.price,o.currency)}</strong>{o.listPrice>o.price&&<del>{price(o.listPrice,o.currency)}</del>}</div></div>
      {link?<a className="btn" href={link.href} target="_blank" rel={link.rel}>Shop at {o.retailer} <ArrowUpRight aria-hidden="true"/></a>:<div className="offer-unavailable">This offer is currently unavailable</div>}
      <small>{o.updatedAt?`Retailer data dated ${o.updatedAt.slice(0,10)}.`:o.importedAt?`Feed imported ${o.importedAt.slice(0,10)}; retailer update time not supplied.`:'Retailer update time not supplied.'} Prices, shipping and availability can change; confirm before purchasing.</small>
    </div>})}
    {affiliated&&<p className="affiliate-disclosure">We may earn a commission if you purchase through these links, at no extra cost to you.</p>}
  </section>;
}
