import {defineConfig} from 'vite';
export default defineConfig({base:'./',server:{allowedHosts:['terminal.local'],host:'127.0.0.1',port:8940},build:{chunkSizeWarningLimit:1000}});
