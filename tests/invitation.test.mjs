import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../site.config.js';
import {fullNames,hasDate,eventDay,eventWhen,calendarFile,whatsappRsvp} from '../invitation-utils.js';

test('Family names, venue, email and all nine printed start times are exact',()=>{
  assert.deepEqual(fullNames(config),{bride:'Prerna Pareek',groom:'Shubham Purohit'});
  assert.equal(config.contact.phone,'+919156704040');
  assert.equal(config.family.father,'Sunil Vyas');
  assert.equal(config.family.mother,'Vandana Vyas');
  assert.equal(config.contact.email,'rahulpareek3366@gmail.com');
  assert.equal(config.venue.name,'Terapanthi Bhavan');
  assert.match(config.venue.address,/D\. V\. Colony/);
  const expected={tilak:'2026-12-01T09:15:00+05:30',chak:'2026-12-01T10:15:00+05:30',vinayak:'2026-12-01T12:15:00+05:30',maayra:'2026-12-01T16:31:00+05:30',sangeet:'2026-12-01T19:31:00+05:30',haldi:'2026-12-02T08:15:00+05:30',baraat:'2026-12-02T12:15:00+05:30',wedding:'2026-12-02T15:15:00+05:30',reception:'2026-12-02T20:31:00+05:30'};
  for(const [id,date] of Object.entries(expected))assert.equal(config.events.find(event=>event.id===id).date,date);
  const haldi=config.events.find(event=>event.id==='haldi');
  assert.equal(hasDate(haldi),true);assert.equal(eventDay(haldi,config.timezone),'2026-12-02');assert.match(eventWhen(haldi,config.timezone),/8:15/);
  assert.match(eventWhen(config.events[0],config.timezone),/Tue/);
  assert.match(eventWhen(config.events.find(event=>event.id==='wedding'),config.timezone),/Wed/);
});
test('Calendar includes every printed time and venue, and invents no end times',()=>{
  const calendar=calendarFile(config,config.events,new Date('2026-10-17T00:00:00Z'));
  const text=calendar.text.replace(/\r\n /g,'');
  assert.equal(calendar.scheduled,9);assert.equal(calendar.pending,0);
  assert.equal((text.match(/BEGIN:VEVENT/g)||[]).length,9);
  for(const stamp of ['20261201T034500Z','20261201T044500Z','20261201T064500Z','20261201T110100Z','20261201T140100Z','20261202T024500Z','20261202T064500Z','20261202T094500Z','20261202T150100Z'])assert.ok(text.includes('DTSTART:'+stamp),stamp);
  assert.doesNotMatch(text,/DTEND:|1970|Provisional/);
  assert.match(text,/LOCATION:Terapanthi Bhavan/);assert.match(text,/rahulpareek3366@gmail.com/);
  const unscheduled={...config.events[0],date:null};
  assert.equal(calendarFile(config,[unscheduled]).scheduled,0);assert.equal(eventDay(unscheduled,config.timezone),'pending');
});
test('WhatsApp RSVP targets Rahul, preserves user text and distinguishes attendance from warm wishes',()=>{
  const draft=whatsappRsvp(config,{name:'Family & Friends',contact:'+91 90000 00000',attendance:'yes',guests:3,events:['wedding','haldi'],song:'A song + a smile',note:'Vegetarian; warm wishes ♡'});
  const url=new URL(draft.url);
  assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/919156704040');
  assert.equal(url.searchParams.get('text'),draft.text);
  for(const text of ['Prerna Pareek weds Shubham Purohit','Family & Friends','Guests: 3','Phera','3:15','Haldi','8:15','A song + a smile','Vegetarian; warm wishes ♡'])assert.ok(draft.text.includes(text),text);
  const decline=whatsappRsvp(config,{name:'Guest',contact:'guest@example.com',attendance:'no',guests:4,events:['wedding']});
  assert.match(decline.text,/unable to attend/);assert.doesNotMatch(decline.text,/Guests:|Celebrations:/);
});
