import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../site.config.js';
import {fullNames,hasDate,eventDay,eventWhen,calendarFile,whatsappRsvp} from '../invitation-utils.js';

test('Family names, RSVP number and five supplied times are exact; Haldi stays undated',()=>{
  assert.deepEqual(fullNames(config),{bride:'Prerna Pareek',groom:'Shubham Purohit'});
  assert.equal(config.contact.phone,'+919156704040');
  assert.equal(config.family.father,'Sunil Pareek');
  const expected={tilak:'2026-12-01T09:15:00+05:30',maayra:'2026-12-01T16:30:00+05:30',sangeet:'2026-12-01T19:30:00+05:30',wedding:'2026-12-02T15:15:00+05:30',reception:'2026-12-02T20:30:00+05:30'};
  for(const [id,date] of Object.entries(expected))assert.equal(config.events.find(event=>event.id===id).date,date);
  const haldi=config.events.find(event=>event.id==='haldi');
  assert.equal(haldi.date,null);assert.equal(hasDate(haldi),false);assert.equal(eventDay(haldi,config.timezone),'pending');assert.equal(eventWhen(haldi,config.timezone),'Date & time to be decided');
  assert.match(eventWhen(config.events[0],config.timezone),/Tue/);
  assert.match(eventWhen(config.events.find(event=>event.id==='wedding'),config.timezone),/Wed/);
});
test('Calendar has correct UTC starts, excludes undated Haldi, and invents no end times',()=>{
  const calendar=calendarFile(config,config.events,new Date('2026-10-17T00:00:00Z'));
  const text=calendar.text.replace(/\r\n /g,'');
  assert.equal(calendar.scheduled,5);assert.equal(calendar.pending,1);
  assert.equal((text.match(/BEGIN:VEVENT/g)||[]).length,5);
  for(const stamp of ['20261201T034500Z','20261201T110000Z','20261201T140000Z','20261202T094500Z','20261202T150000Z'])assert.ok(text.includes('DTSTART:'+stamp));
  assert.doesNotMatch(text,/DTEND:|1970|SUMMARY:Haldi|Provisional/);
  assert.equal(calendarFile(config,[config.events.find(event=>event.id==='haldi')]).scheduled,0);
});
test('WhatsApp RSVP targets Rahul, preserves user text and distinguishes attendance from warm wishes',()=>{
  const draft=whatsappRsvp(config,{name:'Family & Friends',contact:'+91 90000 00000',attendance:'yes',guests:3,events:['wedding','haldi'],song:'A song + a smile',note:'Vegetarian; warm wishes ♡'});
  const url=new URL(draft.url);
  assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/919156704040');
  assert.equal(url.searchParams.get('text'),draft.text);
  for(const text of ['Prerna Pareek weds Shubham Purohit','Family & Friends','Guests: 3','Phera','3:15','Haldi — Date & time to be decided','A song + a smile','Vegetarian; warm wishes ♡'])assert.ok(draft.text.includes(text),text);
  const decline=whatsappRsvp(config,{name:'Guest',contact:'guest@example.com',attendance:'no',guests:4,events:['wedding']});
  assert.match(decline.text,/unable to attend/);assert.doesNotMatch(decline.text,/Guests:|Celebrations:/);
});
