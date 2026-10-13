(() => {
 const sites = {dev:'https://dev.spreeai.com',stage:'https://stage.spreeai.com',prod:'https://spreeai.com',pages:'https://spreeai.com'};
 const query = new URLSearchParams(location.search).get('website');
 let saved; try { saved=sessionStorage.getItem('spreeai-website'); } catch {}
 const key = Object.hasOwn(sites,query) ? query : Object.hasOwn(sites,saved) ? saved : 'prod';
 try { sessionStorage.setItem('spreeai-website',key); } catch {}
 const locales=/^\/(fr|it|de|es|pt|ja|zh|zh_tw|hi|ar|bn|ur|id|ms|vi|th|ko|ru|tr|nl|pl|uk|ro|cs|el|he|sw|yo|sv|da|fi|no|nb|tl)\/?$/;
 const update = () => {
   document.querySelectorAll('a[href]').forEach(a => {
     const url=new URL(a.href,location.href);
     if (url.hostname==='spreeai.github.io' && url.pathname.startsWith('/public-website')) {
       a.href=sites[key]+url.pathname.replace(/^\/public-website/,'')+url.search+url.hash;
     } else if (['spreeai.com','www.spreeai.com'].includes(url.hostname)) {
       a.href=sites[key]+url.pathname+url.search+url.hash;
     }
   });
 };
 const start=()=>{const style=document.createElement('link');style.rel='stylesheet';style.href='https://spreeai.com/shop/localization/localization.css?v=20261013-complete';document.head.append(style);const script=document.createElement('script');script.src='https://spreeai.com/shop/localization/site-localization.js?v=20261013-complete';document.head.append(script);update();new MutationObserver(update).observe(document.body,{childList:true,subtree:true});};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
