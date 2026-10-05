import {useEffect,useState} from 'react';
import {normalizeForecast} from './weather.mjs';
const cache=new Map();
const known={paris:{latitude:48.8534,longitude:2.3488,name:'Paris',country:'France'},london:{latitude:51.5085,longitude:-.1257,name:'London',country:'United Kingdom'},'new york':{latitude:40.7143,longitude:-74.006,name:'New York',country:'United States'},'los angeles':{latitude:34.0522,longitude:-118.2437,name:'Los Angeles',country:'United States'}};
export function useWeather(city){
 const [result,setResult]=useState({status:'loading'}),[revision,setRevision]=useState(0);
 useEffect(()=>{
  const key=city.trim().toLowerCase(),cached=cache.get(key);
  if(cached&&Date.now()-cached.fetchedAt<30*60*1000&&revision===0){setResult(cached);return;}
  let active=true;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  setResult({status:'loading'});
  async function json(url){const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw new Error('The weather service is temporarily unavailable.');return r.json();}
  (async()=>{
   let place=known[key];
   if(!place){const search=await json('https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name:city.trim(),count:'1',language:'en',format:'json'}));place=search.results?.[0];}
   if(!place)throw new Error('We couldn’t find that city. Try its city name in your preferences.');
   const raw=await json('https://api.open-meteo.com/v1/forecast?'+new URLSearchParams({latitude:place.latitude,longitude:place.longitude,current:'temperature_2m,apparent_temperature,weather_code,is_day',daily:'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code',timezone:'auto',forecast_days:'7'}));
   const value={status:'ready',place, ...normalizeForecast(raw),fetchedAt:Date.now()};
   if(!controller.signal.aborted){cache.set(key,value);setResult(value);}
  })().catch(e=>{if(active)setResult({status:'error',error:e.name==='AbortError'?'Weather took too long to respond. Try again.':e.message})}).finally(()=>clearTimeout(timer));
  return()=>{active=false;controller.abort();clearTimeout(timer)};
 },[city,revision]);
 return {...result,refresh:()=>setRevision(x=>x+1)};
}
