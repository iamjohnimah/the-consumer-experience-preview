import React from 'react';
import {ArrowRight,CoatHanger,Camera,CalendarBlank,Check} from '@phosphor-icons/react';
import './home-welcome.css';

export function HomeWelcome({onCloset,onShop,onGuide,weather}){
 return <><section className="home-welcome cinematic-home" aria-label="Welcome to SPREEAI"><div className="hero-weather-position">{weather}</div><div className="home-welcome-story"><p className="eyebrow">YOUR STYLE. YOUR POSSIBILITIES.</p><h1>Your style.<br/>Made simple.</h1><p>Your closet, curated. Your next look, already on you.<br/>A little more possibility, every day.</p><div className="home-welcome-actions"><button className="btn primary" onClick={onCloset}><CoatHanger/> Open my closet</button><button className="btn" onClick={onShop}>Explore the shop <ArrowRight/></button></div></div></section></>
}

export function SetupGuide({owned,hasPreview,plans,onAdd,onTry,onPlan,onSkip}){
 const steps=[{Icon:CoatHanger,title:'Start with your clothes',text:'Add a garment photo. Your pieces appear in Closet, ready to organize and style.',done:owned>0,label:'Add a piece',action:onAdd},{Icon:Camera,title:'See a piece on you',text:'Choose a Twin or upload your photo in the fitting room. You can preview or remove your photo before trying on.',done:hasPreview,label:'Explore try-on',action:onTry},{Icon:CalendarBlank,title:'Make tomorrow easier',text:'Plan a look for a day or a whole week. Use your clothes and the forecast to get started.',done:plans>0,label:'Open my planner',action:onPlan}];
 return <div className="setup-guide"><p className="eyebrow">A QUICK START · AT YOUR PACE</p><h2>Make it yours in three steps.</h2><p>You can start anywhere. No account or photo is needed to explore.</p><ol>{steps.map(({Icon,title,text,done,label,action},i)=><li key={title}><span className="setup-step-number" aria-label={done?'Started':'Step '+(i+1)}>{done?<Check/>:String(i+1).padStart(2,'0')}</span><div><h3><Icon/>{title}</h3><p>{text}</p><button className="btn" onClick={action}>{label}<ArrowRight/></button></div></li>)}</ol><div className="setup-guide-bottom"><button className="small-link" onClick={onSkip}>Skip for now <ArrowRight/></button><p>Reopen this tour from Today or Profile whenever you like.</p></div></div>
}
