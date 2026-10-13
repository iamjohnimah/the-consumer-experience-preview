import {defineConfig} from 'vite';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,sep} from 'node:path';
export default defineConfig({base:'./',plugins:[{name:'shop-static-pages',configureServer(server){server.middlewares.use((req,res,next)=>{const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith('/shop-replica/'))return next();const root=resolve('public/shop-replica');const path=resolve('public',decodeURIComponent(url.pathname).slice(1),'index.html');if(!path.startsWith(root+sep)||!existsSync(path))return next();res.setHeader('Content-Type','text/html; charset=utf-8');res.end(readFileSync(path));})}}],server:{host:'127.0.0.1',port:8940},build:{chunkSizeWarningLimit:1000}});
