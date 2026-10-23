import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {buildStatic} from '../scripts/build-static.mjs';

test('Pages includes six navigation views and an email wishes flow and downloadable itinerary without guest records or server pages',async()=>{
  const output=await buildStatic();
  const html=await readFile(join(output,'index.html'),'utf8');
  const runtime=await readFile(join(output,'runtime.js'),'utf8');
  assert.match(html,/<form class="rsvp-form" id="rsvp-form"/);
  assert.match(html,/id="rsvp-unavailable" tabindex="-1" hidden>/);
  assert.match(html,/Your wishes will be submitted by email/);
  assert.doesNotMatch(html,/Responses are saved to this local guest list/);
  assert.match(runtime,/"rsvpEnabled":true/);
  assert.match(runtime,/"rsvpMode":"email"/);
  assert.match(runtime,/formsubmit\.co\/ajax\/rahulpareek3366%40gmail\.com/);
  assert.equal((html.match(/class="site-page"/g)||[]).length,6);
  assert.match(html,/Prerna Pareek weds Shubham Purohit/);
  assert.match(html,/Sunil Vyas/);
  assert.match(html,/Vandana Vyas/);
  assert.match(html,/Terapanthi Bhavan/);
  assert.match(html,/mailto:rahulpareek3366@gmail.com/);
  assert.match(html,/सौ\. शारदादेवी/);
  assert.match(html,/श्रीकांत सुनील व्यास/);
  assert.doesNotMatch(html,/Haldi.{0,30}to be decided|exact venue details to follow/i);
  assert.match(html,/https:\/\/wa.me\/919156704040/);
  assert.match(html,/Stunity Tech — by <b>Prateek<\/b>/);
  assert.match(html,/Download 2-day itinerary/);assert.match(html,/name="message"/);assert.doesNotMatch(html,/name="attendance"|name="events"|name="guests"|id="personal-plan"|data-calendar/);
  const pdf=await readFile(join(output,'wedding-itinerary.pdf'));assert.ok(pdf.toString('latin1').startsWith('%PDF-1.4'));
  const files=await readdir(output);
  assert.doesNotMatch(html,/src="review\.js"|href="review\.css"/);
  for(const name of ['.data','server.mjs','guest-list.html','guest-list.js','guest-list.css','review.js','review.css','review-store.mjs','itinerary.mjs','tests','.git','README.md'])assert.equal(files.includes(name),false,name);
  for(const name of ['app.js','experience.js','navigation.js','invitation-utils.js','wish-email.js','runtime.js','site.config.js','styles.css','experience.css','refinements.css','assets/photos/couple-hero.jpg','assets/stunity-credit.css'])await access(join(output,name));
  for(const name of files.filter(name=>name.endsWith('.js'))){
    const script=await readFile(join(output,name),'utf8');
    for(const match of script.matchAll(/from ['"]\.\/([^'"]+)['"]/g))await access(join(output,match[1]));
  }
});
