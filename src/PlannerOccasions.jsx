import React from 'react';
import {Briefcase,Heart,ForkKnife,Sun,Sneaker,Flower,Confetti,CalendarBlank,ArrowRight} from '@phosphor-icons/react';
import './planner-occasions.css';
const choices=[['Work',Briefcase],['Date night',Heart],['Dinner',ForkKnife],['Weekend',Sun],['Workout',Sneaker],['Wedding',Flower],['Party',Confetti],['Special event',CalendarBlank]];
export default function PlannerOccasions({onChoose}){
 return <section className="planner-occasions" aria-labelledby="planner-occasions-title"><div className="planner-occasions-heading"><h2 id="planner-occasions-title">What are you dressing for?</h2><p>Choose an occasion, then pick a date and make the look yours.</p></div><div className="planner-occasion-options">{choices.map(([name,Icon])=><button className="btn" key={name} onClick={()=>onChoose(name)}><Icon aria-hidden="true"/><span>{name}</span><ArrowRight aria-hidden="true"/></button>)}</div></section>
}
