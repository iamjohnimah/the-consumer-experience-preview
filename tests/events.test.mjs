import test from 'node:test';
import assert from 'node:assert/strict';
import {officialEvents,eventCalendar} from '../src/events.mjs';
test('official multi-day calendar dates include the last day without inventing admission or a start time',()=>{
 const e=officialEvents.find(e=>e.id==='cfda-nyfw-fw27'),calendar=eventCalendar(e,new Date('2026-10-05T00:00:00Z'));
 assert.match(calendar,/DTSTART;VALUE=DATE:20270208/);assert.match(calendar,/DTEND;VALUE=DATE:20270213/);assert.match(calendar,/No reservation or admission/);assert.match(calendar,/URL:https:\/\/fashioncalendar.com\//);
});
test('local calendar text escapes line injection and rejects malformed event times',()=>{
 const e={id:'fixture',name:'Closet; edit\nNEW:line',date:'2026-10-11',time:'11:00',city:'Paris',place:'Preview'};
 assert.match(eventCalendar(e),/SUMMARY:Closet\\; edit\\nNEW:line \(preview event\)/);assert.throws(()=>eventCalendar({...e,time:'99:00'}),/valid time/);
});
