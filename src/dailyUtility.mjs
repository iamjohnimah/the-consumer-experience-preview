import {generateLook,lookWithAnchor} from './model.mjs';
import {weatherLook,weatherAdvice} from './weather.mjs';
export const trendEdits=[
 {id:'denim',name:'Denim, reconsidered',subtitle:'A familiar pair. A sharper layer.',match:'denim|jeans',source:'https://www.vogue.com/article/fall-denim-trends-experts'},
 {id:'tailoring',name:'Soft power',subtitle:'Easy tailoring with a personal twist.',match:'wool|shirt|jacket|trouser',source:'https://www.vogue.com/article/fall-winter-2026-fashion-trends'},
 {id:'texture',name:'A little texture',subtitle:'Let one rich fabric lead the look.',match:'knit|cashmere|silk',source:'https://www.vogue.com/article/editor-picks-fall-fashion-trends-2026'}
];
export function regionalEdit(scope,city,region,country){const index=scope==='City'?0:scope==='State / region'?1:2;return {label:scope==='City'?city:scope==='State / region'?region:country,edits:[...trendEdits.slice(index),...trendEdits.slice(0,index)]};}
export function wardrobeCollections(owned,saved,catalog){const active=owned.filter(p=>p.status!=='archived');return {owned:active,purchases:active.filter(p=>/purchase|receipt/i.test(p.origin||'')),wishlist:catalog.filter(p=>saved.includes(p.id))};}
export function weeklySuggestions({owned,catalog,days=[],now=new Date(),rotation=0}){
 const active=owned.filter(p=>p.status!=='archived'),pool=active.length?active:catalog;
 const start=new Date(now);start.setHours(12,0,0,0);start.setDate(start.getDate()-((start.getDay()+6)%7));
 const names=['Monday, made easy','A little texture','The midweek remix','A considered layer','After-hours edit','Weekend wandering','Slow Sunday'];
 return Array.from({length:7},(_,i)=>{const date=new Date(start);date.setDate(start.getDate()+i);const key=date.toLocaleDateString('en-CA'),forecast=days.find(d=>d.date===key),occasion=i===4?'Evening':i<4?'Work':'Everyday';let items=generateLook(pool,occasion,rotation+i);const get=id=>pool.find(p=>p.id===id);const trend=trendEdits[i%3],matches=pool.filter(p=>new RegExp(trend.match,'i').test(p.name||'')),anchor=matches[(rotation+i)%matches.length];if(anchor)items=lookWithAnchor(items,anchor,get);
 items=weatherLook(items,get,forecast?{temperature_2m:forecast.temperature_2m_max}:null);
 if(forecast&&forecast.temperature_2m_max<18&&!items.some(id=>get(id)?.category==='Layers')){const layer=pool.find(p=>p.category==='Layers');if(layer)items.push(layer.id);}
 return {id:'suggestion-'+key,date:key,day:date.toLocaleDateString('en-US',{weekday:'short'}),n:date.getDate(),name:names[i],items,occasion,forecast,example:!active.length,trend:anchor?trend.name:'Your everyday essentials',reason:forecast?weatherAdvice({temperature_2m:forecast.temperature_2m_max,weather_code:forecast.weather_code},forecast):'Forecast unavailable for this date. An idea for your plans.'};
 });
}
export function saveWeek(existing,suggestions,makeId){const dates=new Set(existing.map(p=>p.date));return [...existing,...suggestions.filter(s=>s.items.length&&!dates.has(s.date)).map(s=>({id:makeId(),date:s.date,name:s.name,items:s.items,occasion:s.occasion}))];}
