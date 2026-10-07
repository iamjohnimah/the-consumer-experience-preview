import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {normalizeRetailRow,mergeRetailProducts} from '../src/retailCatalog.mjs';

export function parseCsv(text) {
  const rows=[];let cells=[],cell='',quoted=false,closed=false;
  const pushCell=()=>{cells.push(cell);cell='';closed=false;};
  const pushRow=()=>{pushCell();if(cells.some(x=>x!==''))rows.push(cells);cells=[];};
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(quoted) {if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
    if(c==='"') {if(cell || closed)throw new Error('Invalid CSV quoting');quoted=true;}
    else if(c===',')pushCell();
    else if(c==='\n')pushRow();
    else if(c==='\r' && text[i+1]==='\n')continue;
    else {if(closed)throw new Error('Unexpected text after quoted CSV cell');cell+=c;}
  }
  if(quoted)throw new Error('Incomplete CSV: unterminated quoted cell');
  if(cell!=='' || cells.length || closed)pushRow();
  if(rows.length<2)throw new Error('Empty feed: keeping the previous catalog');
  const headers=rows.shift().map(h=>h.trim());
  if(new Set(headers).size!==headers.length)throw new Error('Duplicate CSV headers');
  return rows.map((row,i)=>{if(row.length!==headers.length)throw new Error(`CSV column mismatch at row ${i+2}`);return Object.fromEntries(headers.map((key,j)=>[key,row[j]]));});
}
export function parseJsonl(text) {
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());
  if(!lines.length)throw new Error('Empty feed: keeping the previous catalog');
  return lines.map((line,i)=>{
    let row;try{row=JSON.parse(line);}catch{throw new Error(`Incomplete or invalid JSONL at line ${i+1}`);}
    if(!row || typeof row!=='object' || Array.isArray(row) || Object.hasOwn(row,'error'))throw new Error(`Feed error at line ${i+1}; keeping the previous catalog`);
    return row;
  });
}
export function importFeed(text, options) {
  if(!['awin-csv','awin-jsonl'].includes(options.format))throw new Error('Choose awin-csv or awin-jsonl');
  const rows=options.format==='awin-csv'?parseCsv(text):parseJsonl(text);
  const products=rows.map((row,i)=>{try{return normalizeRetailRow(row,options);}catch{throw new Error(`Row ${i+1} is missing valid fashion product data; previous catalog was not replaced`);}});
  return mergeRetailProducts(products);
}
async function downloadAwin({publisher,advertiser,locale},token) {
  if(!/^\d+$/.test(publisher||'') || !/^\d+$/.test(advertiser||'') || !/^[a-z]{2}_[A-Z]{2}$/.test(locale||''))throw new Error('Provide numeric publisher/advertiser IDs and a locale such as en_US');
  if(!token)throw new Error('AWIN_API_TOKEN is not set. Keep it in the local environment or CI secret store, never VITE_ variables');
  const url=`https://api.awin.com/publishers/${publisher}/awinfeeds/download/${advertiser}-retail-${locale}.jsonl`;
  const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`},redirect:'error',signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error(`Awin download returned ${response.status}. Check approved feed access; previous catalog was not replaced`);
  const limit=50*1024*1024;let length=0;const parts=[];
  for await(const part of response.body){length+=part.length;if(length>limit)throw new Error('Feed exceeds 50 MB. Narrow the approved feed before importing');parts.push(part);}
  return Buffer.concat(parts).toString('utf8');
}
export async function main(args=process.argv.slice(2)) {
  const flags={};
  for(let i=0;i<args.length;i+=2){if(!args[i]?.startsWith('--') || !args[i+1] || args[i+1].startsWith('--'))throw new Error('Every option needs a value');flags[args[i].slice(2)]=args[i+1];}
  const format=flags.format || 'awin-jsonl';
  if(!flags.input && format!=='awin-jsonl')throw new Error('CSV imports require an authorized local export via --input');
  const text=flags.input?await readFile(flags.input,'utf8'):await downloadAwin(flags,process.env.AWIN_API_TOKEN);
  const approvals=flags.approvals?JSON.parse(await readFile(flags.approvals,'utf8')):[];
  if(!Array.isArray(approvals))throw new Error('Approvals must be an array');
  const importedAt=new Date().toISOString();
  const products=importFeed(text,{format,importedAt,merchantId:flags.advertiser,retailer:flags.retailer,publisherId:flags.publisher,approvals});
  const output=flags.output || new URL('../src/retailer-catalog.json',import.meta.url);
  let previous={products:[]};
  try{previous=JSON.parse(await readFile(output,'utf8'));}catch(e){if(e.code!=='ENOENT')throw new Error('Existing catalog could not be read; refusing to replace it');}
  const merchants=new Set(products.flatMap(p=>p.offers.map(o=>o.merchantId)));
  // A complete refresh retires offers removed from this merchant's feed while retaining others.
  const retained=(previous.products||[]).map(p=>({...p,offers:p.offers.filter(o=>!merchants.has(o.merchantId))})).filter(p=>p.offers.length);
  const snapshot={version:1,provider:'awin',importedAt,products:mergeRetailProducts([...retained,...products])};
  const path=output instanceof URL?output.pathname:output;
  await mkdir(dirname(path),{recursive:true});
  const temporary=path+`.${process.pid}.tmp`;
  await writeFile(temporary,JSON.stringify(snapshot,null,2)+'\n',{mode:0o600});
  await rename(temporary,path);
  console.log(`Imported ${products.length} fashion variants; ${snapshot.products.length} total. Approved tracked offers: ${snapshot.products.flatMap(p=>p.offers).filter(o=>o.affiliateApproved).length}. No credentials written to the catalog.`);
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(()=>{console.error('Import stopped. Check the feed format, required fields, approvals and account access. The previous catalog was preserved.');process.exitCode=1;});
