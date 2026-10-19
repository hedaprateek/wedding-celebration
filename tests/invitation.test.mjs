import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../site.config.js';
import {createItinerary} from '../itinerary.mjs';
import {fullNames,hasDate,eventDay,eventWhen,whatsappWish} from '../invitation-utils.js';

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
test('Wishes draft preserves sender and message without claiming attendance',()=>{
  const response={name:'Family & Friends',contact:'+91 90000 00000',note:'May your life be full of love & laughter. शुभकामनाएँ ♡'};
  const draft=whatsappWish(config,response),url=new URL(draft.url);
  assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/919156704040');assert.equal(url.searchParams.get('text'),draft.text);
  for(const text of ['Wedding wishes for Prerna & Shubham',response.name,response.contact,response.note])assert.ok(draft.text.includes(text),text);
  assert.doesNotMatch(draft.text,/Guests:|attending|unable to attend|Celebrations:|RSVP/);
});
test('Two-day PDF contains every printed time, venue, provisional dress guidance and studio credit',()=>{
  const bytes=createItinerary(config),pdf=bytes.toString('latin1');
  assert.ok(pdf.startsWith('%PDF-1.4'));assert.equal((pdf.match(/\/Type \/Page\b/g)||[]).length,2);
  for(const text of ['Tuesday, 1 December 2026','Wednesday, 2 December 2026','9:15 am','10:15 am','12:15 pm','4:31 pm','7:31 pm','8:15 am','3:15 pm','8:31 pm','Terapanthi Bhavan','D. V. Colony','rahulpareek3366@gmail.com','91567 04040','STUNITY TECH','PRATEEK','Chak Pujan','Vinayak Pujan','Baraat Swagat','Phera / Panigrahan Sanskar'])assert.ok(pdf.includes(text),text);
  assert.equal((pdf.match(/\(To be confirmed\)/g)||[]).length,9);assert.ok(pdf.includes('https://www.google.com/maps/search/'));assert.ok(pdf.includes('/Subtype /Link'));
  const offset=Number(pdf.match(/startxref\n(\d+)/)[1]);assert.equal(bytes.subarray(offset,offset+4).toString(),'xref');
  const changed=structuredClone(config);changed.events[0].dressCode='Pastel pink';const updated=createItinerary(changed).toString('latin1');assert.ok(updated.includes('Pastel pink'));assert.equal((updated.match(/\(To be confirmed\)/g)||[]).length,8);
});
