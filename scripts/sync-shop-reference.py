from pathlib import Path
import urllib.request,re,json,hashlib
from concurrent.futures import ThreadPoolExecutor
root=Path(__file__).resolve().parents[1]/'public/shop-replica'; root.mkdir(parents=True,exist_ok=True)
origin='https://spreeai.com'
urls=['/shop/online/assets/'+x for x in ['index-oMclJJV1.js','App-BHb0qeXa.js','Stylist-Bof_9um8.js','FitCompare-C3hEUqwS.js','MediaThumbnail-lNa_yh0U.js','style-DHCktA0V.css']]
urls += ['/shop/online/collection/'+x for x in ['app.js','style.css','elevated.css','footer-standard.css','refinement.css','polish.css','qa-refinements.css','catalog.json']]
urls+=['/shop/shop-menu.css','/shop/shop-menu.js','/shop/website-navigation.js','/shop/footer-layout.css']
def get(url):
 data=urllib.request.urlopen(origin+url,timeout=40).read(); return url,data
rows=list(ThreadPoolExecutor(6).map(get,urls)); manifest=[]
def patch_js(s):
 # Keep media on its original host; keep Shop navigation within this local copy.
 for q in ['`',"'",'"']:
  s=s.replace(q+'/shop/online/collection/',q+'__LOCAL_COLLECTION__/') if q!='`' else s.replace('`/shop/online/collection/','`${window.__SHOP_ROOT__}/online/collection/')
  s=s.replace(q+'/shop/online/product/',q+'__LOCAL_PRODUCT__/') if q!='`' else s.replace('`/shop/online/product/','`${window.__SHOP_ROOT__}/online/product/')
  s=s.replace(q+'/shop/online/account/',q+'__LOCAL_ACCOUNT__/') if q!='`' else s.replace('`/shop/online/account/','`${window.__SHOP_ROOT__}/online/account/')
  s=s.replace(q+'/shop/',q+'https://spreeai.com/shop/')
  s=s.replace(q+'/site-release.json',q+'https://spreeai.com/site-release.json')
 # Single/double quoted navigation literals need runtime prefix too.
 s=re.sub(r"(['\"])__LOCAL_(COLLECTION|PRODUCT|ACCOUNT)__/(.*?)\1",lambda m:'(window.__SHOP_ROOT__+"/online/'+m[2].lower()+'/'+m[3]+'")',s)
 s=s.replace('basename:ar?`/shop`:ir?`https://spreeai.com/shop/online/shopify`:`https://spreeai.com/shop/online/`','basename:window.__SHOP_ROOT__+`/online/`')
 # Original Vite lazy chunk preloads must resolve against this copy.
 s=s.replace('"/shop/online/"','(window.__SHOP_ROOT__+"/online/")')
 s=s.replace('`https://spreeai.com/shop/online/`','(window.__SHOP_ROOT__+`/online/`)')
 # Default to the same published demo environment on localhost and Pages.
 s=s.replace("'prod':'dev'","'prod':'prod'")
 return s
for url,data in rows:
 p=root/url.removeprefix('/shop/');p.parent.mkdir(parents=True,exist_ok=True)
 manifest.append({'source':origin+url,'sha256':hashlib.sha256(data).hexdigest()})
 if p.suffix=='.js':data=patch_js(data.decode()).encode()
 if p.suffix=='.css':
  s=data.decode();s=s.replace('/shop/','https://spreeai.com/shop/');s=re.sub(r'url\((?:[\"\x27])?(assets/[^)\"\x27]+)(?:[\"\x27])?\)',lambda m:'url("'+origin+url.rsplit('/',1)[0]+'/'+m[1]+'")',s);data=s.encode()
 if p.name=='catalog.json':
  obj=json.loads(data)
  for entry in obj:
   for key in ['image','model']:
    if entry.get(key,'').startswith('assets/'):entry[key]=origin+'/shop/online/collection/'+entry[key]
  data=json.dumps(obj).encode()
 p.write_bytes(data)
bootstrap="""<script>window.__SHOP_ROOT__=location.pathname.split('/shop-replica/')[0]+'/shop-replica';sessionStorage.setItem('spreeai-api-environment','prod');sessionStorage.setItem('spreeai-website','prod');</script>"""
html=urllib.request.urlopen(origin+'/shop/online/collection/?website=prod',timeout=40).read().decode()
html=re.sub(r'<script>\(function\(\).*?</script>','',html,count=1,flags=re.S)
html=html.replace('<head>','<head>'+bootstrap)
# Original collection assets remain on their host; JS/CSS are the pinned local originals.
html=re.sub(r'(src|poster)="(assets/[^\"]+)"',lambda m:m[1]+'="'+origin+'/shop/online/collection/'+m[2]+'"',html)
html=html.replace('="/shop/','="https://spreeai.com/shop/')
for name in ['shop-menu.js','website-navigation.js','shop-menu.css']:
 html=html.replace('https://spreeai.com/shop/'+name,'../../'+name)
# Preload fonts remain official public files. Collection CSS and app are relative local.
(root/'online/collection/index.html').write_text(html)
product='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'''+bootstrap+'''<title>SPREEAI Shop</title><link rel="stylesheet" href="../../assets/style-DHCktA0V.css"><link rel="stylesheet" href="../../../footer-layout.css"><link rel="stylesheet" href="../../../shop-menu.css"></head><body><div id="root"></div><script type="module" src="../../assets/index-oMclJJV1.js"></script></body></html>'''
catalog=json.loads((root/'online/collection/catalog.json').read_text())
for row in catalog:
 p=root/'online/product'/('spree-'+row['id'])/'index.html';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(product)
# Account entry uses the same app and adjusted relative links.
p=root/'online/account/index.html';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(product.replace('../../assets/','../assets/').replace('../../../','../../'))
(root/'source-manifest.json').write_text(json.dumps(manifest,indent=2))
print('Pinned original frontend assets and',len(catalog),'product pages')

for page in root.rglob('index.html'):
 text=page.read_text().replace('</body>','<script>const bridge=document.createElement("script");bridge.src=window.__SHOP_ROOT__+"/bridge.js";document.body.append(bridge);</script></body>')
 text=re.sub(r'href="/(?!shop/)([^\"]+)"',lambda m:'href="https://spreeai.com/'+m[1]+'"',text)
 page.write_text(text)
