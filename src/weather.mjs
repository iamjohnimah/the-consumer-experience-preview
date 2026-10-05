export const weatherLabel=code=>code===0?'Clear skies':code>=1&&code<=3?'Cloudy':code===45||code===48?'Foggy':code>=95?'Thunderstorms':code>=71&&code<=77||code===85||code===86?'Snow showers':code>=51&&code<=67||code>=80&&code<=82?'Rain likely':'Changeable skies';
export function weatherAdvice(current,forecast){
 if(!current)return 'Choose for your plans. Live weather guidance will appear when your city’s forecast is available.';
 const temp=current.apparent_temperature??current.temperature_2m;
 const rain=(forecast?.precipitation_probability_max??0)>=40||/Rain|Thunder/.test(weatherLabel(current.weather_code));
 const warmth=temp<10?'It feels chilly. Consider a warmer outer layer.':temp<18?'A light layer makes sense today.':temp>25?'Keep your outfit light and breathable.':'Comfortable temperatures. An easy layer gives you options.';
 return warmth+(rain?' Rain is possible; bring an umbrella and choose suitable shoes.':'');
}
export function weatherLook(ids,get,current){
 if(!current)return ids;
 return (current.apparent_temperature??current.temperature_2m)>25?ids.filter(id=>get(id)?.category!=='Layers'):ids;
}
export const degrees=(value,unit='C')=>Number.isFinite(value)?Math.round(unit==='F'?value*9/5+32:value)+'°'+unit:'—';
export function normalizeForecast(data){
 if(!Number.isFinite(data.current?.temperature_2m))throw new Error('The forecast is unavailable right now.');
 return {current:data.current,timezone:data.timezone,days:(data.daily?.time||[]).map((date,i)=>({date,temperature_2m_max:data.daily.temperature_2m_max[i],temperature_2m_min:data.daily.temperature_2m_min[i],precipitation_probability_max:data.daily.precipitation_probability_max[i],weather_code:data.daily.weather_code[i]}))};
}
