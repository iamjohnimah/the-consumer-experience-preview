import {publicUrl} from './retailCatalog.mjs';
export function retailerDestination(product){if(product?.availability==='out_of_stock')return null;return publicUrl(product?.source||product?.retailerUrl||product?.url);}

export function tryOnAvailable(product){return Boolean(product?.garmentId)&&!(/awaiting|unsupported|unavailable|failed/i.test(product?.tryonStatus||''));}
