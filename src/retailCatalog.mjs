// Shared by the browser and the offline importer. Never contains credentials.
const clean = value => String(value ?? '').trim();
const token = value => encodeURIComponent(clean(value));
export function publicUrl(value) {
  try {
    const u = new URL(clean(value));
    const h = u.hostname.toLowerCase();
    if (u.protocol !== 'https:' || u.username || u.password || h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || !h.includes('.') || /^\d+[.:]/.test(h) || h.startsWith('[')) return null;
    if ([...u.searchParams.keys()].some(k => /^(api[_-]?key|access[_-]?token|secret|authorization)$/i.test(k))) return null;
    if (/\/(apikey|access_token)\//i.test(u.pathname)) return null;
    return u.href;
  } catch { return null; }
}
export function parsePrice(value, currency) {
  if (value && typeof value === 'object') return parsePrice(value.value ?? value.amount, value.currency ?? currency);
  const match = clean(value).match(/^(\d+(?:\.\d{1,4})?)\s*([A-Z]{3})?$/);
  if (!match) return null;
  const code = match[2] || clean(currency).toUpperCase();
  try { new Intl.NumberFormat('en', {style:'currency', currency:code}); } catch { return null; }
  if (!/^[A-Z]{3}$/.test(code) || !Intl.supportedValuesOf('currency').includes(code)) return null;
  return {amount:Number(match[1]), currency:code};
}
export function categoryFor(value) {
  const s = clean(value).toLowerCase();
  // Specific accessories precede broad Clothing paths.
  if (/shoe|sneaker|footwear|boot|sandal|pump|loafer/.test(s)) return 'Shoes';
  if (/handbag|backpack|purse|bag/.test(s)) return 'Bags';
  if (/dress|jumpsuit/.test(s)) return 'Dresses';
  if (/jean|trouser|pant|skirt|short/.test(s)) return 'Bottoms';
  if (/jacket|coat|blazer|outerwear|cardigan/.test(s)) return 'Layers';
  if (/shirt|blouse|sweater|pullover|hoodie|top|knit/.test(s)) return 'Tops';
  if (/accessor|belt|jewell?ery|scarf|hat|sunglass/.test(s)) return 'Accessories';
  return null;
}
const status = value => ({'1':'in_stock','true':'in_stock','yes':'in_stock','in stock':'in_stock','in_stock':'in_stock','0':'out_of_stock','false':'out_of_stock','no':'out_of_stock','out of stock':'out_of_stock','out_of_stock':'out_of_stock','preorder':'preorder','backorder':'backorder'}[clean(value).toLowerCase()] || 'unknown');
const date = value => { const s=clean(value); return s && Number.isFinite(Date.parse(s)) ? new Date(s).toISOString() : null; };
const gender = value => ({female:'Women',women:'Women',womens:'Women',male:'Men',men:'Men',mens:'Men',unisex:'Unisex'}[clean(value).toLowerCase()] || null);
const validGtin = s => {
  if(!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(s))return false;
  const total=[...s.slice(0,-1)].reverse().reduce((sum,n,i)=>sum+Number(n)*(i%2?1:3),0);
  return (10-total%10)%10===Number(s.at(-1));
};
function field(row, key, depth=0) {
  if (Object.hasOwn(row,key)) return row[key];
  if (depth > 2) return undefined;
  for (const [name,value] of Object.entries(row)) {
    if (name!=='meta' && value && typeof value==='object' && !Array.isArray(value)) {
      const found=field(value,key,depth+1); if(found!==undefined) return found;
    }
  }
}
function saleActive(range, now) {
  if (!range) return true;
  const [from,to] = clean(range).split('/');
  return !!date(from) && !!date(to) && Date.parse(from)<=Date.parse(now) && Date.parse(now)<=Date.parse(to);
}
export function normalizeRetailRow(row, {format, importedAt, merchantId, retailer, publisherId, approvals=[]}) {
  const csv=format==='awin-csv', f=key=>csv?row[key]:field(row,key);
  const mid=clean(csv?f('merchant_id'):(row.meta?.advertiser_id ?? merchantId));
  const sku=clean(csv?f('merchant_product_id') || f('aw_product_id'):f('id'));
  const name=clean(csv?f('product_name'):f('title'));
  const brand=clean(csv?f('brand_name'):f('brand'));
  const source=publicUrl(csv?f('merchant_deep_link'):f('link'));
  const image=publicUrl(csv?f('merchant_image_url') || f('aw_image_url'):f('image_link'));
  const productType=clean(csv?f('product_type') || f('merchant_category') || f('category_name'):f('product_type') || f('google_product_category'));
  const category=categoryFor(productType);
  const regular=parsePrice(csv?f('search_price'):f('price'), csv?f('currency'):undefined);
  if (!mid || !sku || !name || !brand || !source || !image || !regular || !category) throw new Error('Missing valid merchant, SKU, title, brand, product URL, image, price/currency or fashion category');
  const retailerName=clean(csv?f('merchant_name'):(row.meta?.advertiser_name ?? retailer));
  if (!retailerName) throw new Error('Missing retailer name');
  const sale=csv?null:parsePrice(f('sale_price'));
  const onSale=sale && sale.currency===regular.currency && sale.amount<regular.amount && saleActive(f('sale_price_effective_date'),importedAt);
  const listPrice=csv?parsePrice(f('rrp_price') || f('product_price_old'), regular.currency):regular;
  const price=onSale?sale:regular;
  const tracking=csv?publicUrl(f('aw_deep_link')):null; // Google link is explicitly non-trackable.
  const approval=approvals.find(a=>String(a.merchantId)===mid && String(a.publisherId)===String(publisherId) && a.approved===true);
  const allowed=tracking && approval?.trackingHosts?.includes(new URL(tracking).hostname);
  const additional=csv?[f('alternate_image'),f('alternate_image_two'),f('alternate_image_three')]:f('additional_image_link');
  const images=[...new Set([image,...(Array.isArray(additional)?additional:[]).map(publicUrl).filter(Boolean)])];
  const color=clean(csv?f('colour'):f('color'));
  const size=clean(f('size'));
  const availability=status(csv?f('in_stock'):f('availability'));
  const gtin=clean(csv?f('product_GTIN') || f('ean') || f('upc'):f('gtin'));
  const offer={id:`awin:${mid}:${sku}`,retailer:retailerName,merchantId:mid,sku,network:'awin',price:price.amount,currency:price.currency,
    listPrice:listPrice?.currency===price.currency && listPrice.amount>price.amount?listPrice.amount:null,
    availability,size,color,productUrl:source,trackingUrl:allowed?tracking:null,affiliateApproved:!!allowed,
    trackingHost:allowed?new URL(tracking).hostname:null,updatedAt:date(f('last_updated')),importedAt,
    validUntil:date(csv?f('valid_to'):f('expiration_date'))};
  return {id:`retail-awin-${token(mid)}-${token(sku)}`,brand,name,description:clean(f('description')).slice(0,5000),category,productType,
    image,images,model:publicUrl(f('lifestyle_image_link')),color,sizes:size?[size]:[],material:clean(f('material')),gender:gender(csv?f('suitable_for'):f('gender')),
    gtin:validGtin(gtin)?gtin:null,mpn:clean(f('mpn')),sku,price:price.amount,currency:price.currency,source,
    checked:offer.updatedAt?.slice(0,10) || null,importedAt,offers:[offer]};
}
export function offerLink(offer, now=Date.now()) {
  const direct=publicUrl(offer.productUrl);
  if (!direct || offer.availability==='out_of_stock' || (offer.validUntil && Date.parse(offer.validUntil)<=now)) return null;
  const tracked=publicUrl(offer.trackingUrl);
  const affiliate=!!(offer.affiliateApproved===true && tracked && new URL(tracked).hostname===offer.trackingHost);
  return {href:affiliate?tracked:direct,affiliate,rel:affiliate?'sponsored noopener noreferrer':'noopener noreferrer'};
}
export function offersFor(product) {
  if (product.offers?.length) return product.offers;
  return product.source?[{id:product.id,retailer:product.brand,price:product.price,currency:product.currency || 'USD',productUrl:product.source,
    updatedAt:product.checked || null,availability:'unknown',affiliateApproved:false}]:[];
}
export function mergeRetailProducts(products) {
  const output=new Map();
  for(const p of products) {
    // GTIN identifies an exact size/color variant. Never match titles or photographs.
    const key=p.gtin?`gtin:${p.gtin}`:p.id;
    const known=output.get(key);
    if (!known) {output.set(key,{...p,offers:[...p.offers]});continue;}
    const identity=x=>[x.brand,x.color,x.sizes?.join(',')].map(clean).join('|').toLowerCase();
    if(identity(known)!==identity(p)) {output.set(p.id,{...p,offers:[...p.offers]});continue;}
    known.images=[...new Set([...(known.images||[]),...(p.images||[])])];
    for(const offer of p.offers) {const i=known.offers.findIndex(o=>o.id===offer.id);if(i<0)known.offers.push(offer);else known.offers[i]=offer;}
  }
  return [...output.values()].map(p=>{
    const offer=p.offers.find(o=>offerLink(o)) || p.offers[0];
    return {...p,price:offer.price,currency:offer.currency,source:offer.productUrl,checked:offer.updatedAt?.slice(0,10)||null};
  });
}
export function combineCatalog(prepared, retail) {
  const combined=prepared.map(p=>({...p}));
  for(const p of retail) {
    const i=combined.findIndex(x=>x.source===p.source);
    if(i<0) combined.push({...p});
    else {
      const x=combined[i];
      // An exact variant must match before supplementing a prepared try-on garment.
      if (x.brand.toLowerCase()!==p.brand.toLowerCase() || (x.color && p.color && x.color.toLowerCase()!==p.color.toLowerCase()) || (x.sizes?.length && p.sizes?.length && !p.sizes.every(s=>x.sizes.includes(s)))) {combined.push({...p});continue;}
      combined[i]={...x,offers:p.offers,price:p.price,currency:p.currency,description:p.description||x.description,material:p.material||x.material,images:p.images,checked:p.checked,importedAt:p.importedAt};
    }
  }
  return combined;
}
