import {useEffect,useState} from 'react';
import {normalizeForecast} from './weather.mjs';
const cache=new Map();
const known={paris:{latitude:48.8534,longitude:2.3488,name:'Paris',country:'France'},london:{latitude:51.5085,longitude:-.1257,name:'London',country:'United Kingdom'},'new york':{latitude:40.7143,longitude:-74.006,name:'New York',country:'United States'},'los angeles':{latitude:34.0522,longitude:-118.2437,name:'Los Angeles',country:'United States'}};
export function useWeather(city){
 const [result,setResult]=useState({status:'loading'}),[revision,setRevision]=useState(0),[location,setLocation]=useState(null),[locationStatus,setLocationStatus]=useState(''),[locationError,setLocationError]=useState('');
 useEffect(()=>{
  const key=location?location.latitude+','+location.longitude:city.trim().toLowerCase(),cached=cache.get(key);
  if(cached&&Date.now()-cached.fetchedAt<30*60*1000&&revision===0){setResult(cached);return;}
  let active=true;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  setResult({status:'loading'});
  async function json(url){const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw new Error('The weather service is temporarily unavailable.');return r.json();}
  (async()=>{
   let place=location||known[key];
   if(!place){const search=await json('https://geocoding-api.open-meteo.com/v1/search?'+new URLSearchParams({name:city.trim(),count:'1',language:'en',format:'json'}));place=search.results?.[0];}
   if(!place)throw new Error('We couldn’t find that city. Try its city name in your preferences.');
   const raw=await json('https://api.open-meteo.com/v1/forecast?'+new URLSearchParams({latitude:place.latitude,longitude:place.longitude,current:'temperature_2m,apparent_temperature,weather_code,is_day',daily:'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code',timezone:'auto',forecast_days:'7'}));
   const value={status:'ready',place, ...normalizeForecast(raw),fetchedAt:Date.now()};
   if(active&&!controller.signal.aborted){cache.set(key,value);setResult(value);}
  })().catch(e=>{if(active)setResult({status:'error',error:e.name==='AbortError'?'Weather took too long to respond. Try again.':e.message})}).finally(()=>clearTimeout(timer));
  return()=>{active=false;controller.abort();clearTimeout(timer)};
 },[city,revision,location]);
 useEffect(()=>{setLocation(null)},[city]);
 function useCurrentLocation(){setLocationError('');if(!navigator.geolocation){setLocationError('Location is unavailable in this browser. Enter your city instead.');return;}setLocationStatus('locating');navigator.geolocation.getCurrentPosition(position=>{setLocation({latitude:Number(position.coords.latitude.toFixed(2)),longitude:Number(position.coords.longitude.toFixed(2)),name:'Current location',country:''});setLocationStatus('');},error=>{setLocationStatus('');setLocationError(error.code===1?'Location access was declined. You can enter your city instead.':'We couldn’t get your location. Try again or enter your city.');},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});}

 return {...result,locationStatus,locationError,useCurrentLocation,clearLocation:()=>setLocation(null),usingLocation:!!location,refresh:()=>setRevision(x=>x+1)};
}
