// Adapt navigation only; the original Shop components and motion stay intact.
const root=window.__SHOP_ROOT__;
function adaptLinks(){for(const a of document.querySelectorAll('a[href]')){const url=new URL(a.href,location.href);if(url.origin==='https://spreeai.com'&&/^\/shop\/online\/(collection|product|account)(\/|$)/.test(url.pathname)){a.href=root+url.pathname.slice('/shop'.length)+url.search+url.hash;}else if(url.origin!==location.origin&&/^https?:$/.test(url.protocol)){a.target='_blank';a.rel='noopener noreferrer';}}}
adaptLinks();new MutationObserver(adaptLinks).observe(document.documentElement,{childList:true,subtree:true});
