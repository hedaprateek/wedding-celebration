import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {buildStatic} from '../scripts/build-static.mjs';

test('Pages includes six navigation views and a WhatsApp RSVP flow without guest records or server pages',async()=>{
  const output=await buildStatic();
  const html=await readFile(join(output,'index.html'),'utf8');
  const runtime=await readFile(join(output,'runtime.js'),'utf8');
  assert.match(html,/<form hidden class="rsvp-form" id="rsvp-form"/);
  assert.match(html,/id="rsvp-unavailable" tabindex="-1" hidden>/);
  assert.match(html,/Tap Send in WhatsApp to deliver it/);
  assert.doesNotMatch(html,/Responses are saved to this local guest list/);
  assert.match(runtime,/"rsvpEnabled":true/);
  assert.match(runtime,/"rsvpMode":"whatsapp"/);
  assert.match(runtime,/"rsvpEndpoint":null/);
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
  const files=await readdir(output);
  for(const name of ['.data','server.mjs','guest-list.html','guest-list.js','guest-list.css','tests','.git','README.md'])assert.equal(files.includes(name),false,name);
  for(const name of ['app.js','experience.js','navigation.js','invitation-utils.js','runtime.js','site.config.js','styles.css','experience.css','assets/photos/couple-hero.jpg','assets/stunity-credit.css'])await access(join(output,name));
  for(const name of files.filter(name=>name.endsWith('.js'))){
    const script=await readFile(join(output,name),'utf8');
    for(const match of script.matchAll(/from ['"]\.\/([^'"]+)['"]/g))await access(join(output,match[1]));
  }
});
