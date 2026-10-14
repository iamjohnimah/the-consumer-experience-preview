import {useEffect,useState,useRef} from 'react';
import {normalizeForecast} from './weather.mjs';
const cache=new Map();
const known={paris:{latitude:48.8534,longitude:2.3488,name:'Paris',country:'France'},london:{latitude:51.5085,longitude:-.1257,name:'London',country:'United Kingdom'},'new york':{latitude:40.7143,longitude:-74.006,name:'New York',country:'United States'},'los angeles':{latitude:34.0522,longitude:-118.2437,name:'Los Angeles',country:'United States'}};
export function useWeather(city){
 const [result,setResult]=useState({status:'loading'}),[revision,setRevision]=useState(0),[location,setLocation]=useState(null),[locationStatus,setLocationStatus]=useState(''),[locationError,setLocationError]=useState(''),[locationRevision,setLocationRevision]=useState(0),[mode,setMode]=useState(()=>{try{return localStorage.getItem('spreeai-weather-source')==='city'?'city':'location'}catch{return 'location'}});
 const requestId=useRef(0);
 function saveMode(value){setMode(value);try{localStorage.setItem('spreeai-weather-source',value)}catch{}}

 useEffect(()=>{
  if(mode==='location'&&!location){setResult({status:'awaiting-location'});return;}
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
   const forecastPromise=json('https://api.open-meteo.com/v1/forecast?'+new URLSearchParams({latitude:place.latitude,longitude:place.longitude,current:'temperature_2m,apparent_temperature,weather_code,is_day',daily:'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code',timezone:'auto',forecast_days:'7'}));
   const cityPromise=location?(async()=>{const lookupController=new AbortController(),lookupTimer=setTimeout(()=>lookupController.abort(),4000);controller.signal.addEventListener('abort',()=>lookupController.abort(),{once:true});try{const response=await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?'+new URLSearchParams({latitude:place.latitude,longitude:place.longitude,localityLanguage:'en'}),{signal:lookupController.signal});if(!response.ok)throw new Error('City lookup unavailable');const address=await response.json();return {...place,name:address.city||address.locality||'Your area',country:address.countryName||''};}catch{return {...place,name:'Your area',country:''};}finally{clearTimeout(lookupTimer)}})():Promise.resolve(place);
   const [raw,namedPlace]=await Promise.all([forecastPromise,cityPromise]);
   const value={status:'ready',place:namedPlace, ...normalizeForecast(raw),fetchedAt:Date.now()};
   if(active&&!controller.signal.aborted){cache.set(key,value);setResult(value);}
  })().catch(e=>{if(active)setResult({status:'error',error:e.name==='AbortError'?'Weather took too long to respond. Try again.':e.message})}).finally(()=>clearTimeout(timer));
  return()=>{active=false;controller.abort();clearTimeout(timer)};
 },[city,revision,location,mode]);
 function useCurrentLocation(){saveMode('location');setLocationRevision(x=>x+1);}
 useEffect(()=>{
  if(mode!=='location')return;
  const id=++requestId.current;
  setLocationError('');setLocationStatus('locating');
  if(!navigator.geolocation){setLocationStatus('');setLocationError('Location is unavailable in this browser. Enter your city instead.');return;}
  function accept(position){if(id!==requestId.current)return;setLocationError('');setLocationStatus('');const latitude=Number(position.coords.latitude.toFixed(2)),longitude=Number(position.coords.longitude.toFixed(2));setLocation(previous=>previous?.latitude===latitude&&previous?.longitude===longitude?previous:{latitude,longitude,name:'Your area',country:''});}
  function failure(error){if(id!==requestId.current)return;setLocationStatus('');setLocationError(error.code===1?'Location access was declined. Allow location access in your browser or choose a city.':'We couldn’t update your location. Try again or choose a city.');}
  const options={enableHighAccuracy:false,timeout:10000,maximumAge:60000};
  const watcher=navigator.geolocation.watchPosition(accept,failure,options);
  function recheck(){if(document.visibilityState==='visible')navigator.geolocation.getCurrentPosition(accept,failure,options);}
  document.addEventListener('visibilitychange',recheck);window.addEventListener('focus',recheck);
  return()=>{requestId.current++;navigator.geolocation.clearWatch(watcher);document.removeEventListener('visibilitychange',recheck);window.removeEventListener('focus',recheck);};
 },[mode,locationRevision]);
 function selectCity(){requestId.current++;saveMode('city');setLocation(null);setLocationStatus('');setLocationError('');}

 return {...result,locationStatus,locationError,useCurrentLocation,selectCity,placeLabel:result.place?.name||(mode==='city'?city:'Finding your city…'),mode,clearLocation:selectCity,usingLocation:!!location,refresh:()=>{setRevision(x=>x+1);if(mode==='location')useCurrentLocation()}};
}
