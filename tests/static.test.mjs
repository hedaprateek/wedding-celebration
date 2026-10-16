import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {buildStatic} from '../scripts/build-static.mjs';

test('Pages artifact includes public assets and an honest RSVP notice, with no host pages or guest records',async()=>{
  const output=await buildStatic();
  const html=await readFile(join(output,'index.html'),'utf8');
  const runtime=await readFile(join(output,'runtime.js'),'utf8');
  assert.match(html,/<form hidden class="rsvp-form" id="rsvp-form"/);
  assert.match(html,/id="rsvp-unavailable" tabindex="-1">/);
  assert.match(html,/Online RSVPs are not open yet/);
  assert.doesNotMatch(html,/Responses are saved to this local guest list/);
  assert.match(runtime,/rsvpEnabled:false/);
  assert.match(runtime,/rsvpEndpoint:null/);
  assert.match(html,/Stunity Tech — by <b>Prateek<\/b>/);
  const files=await readdir(output);
  for(const name of ['.data','server.mjs','guest-list.html','guest-list.js','guest-list.css','tests','.git','README.md'])assert.equal(files.includes(name),false,name);
  for(const name of ['app.js','experience.js','runtime.js','site.config.js','styles.css','experience.css','assets/photos/couple-hero.jpg','assets/stunity-credit.css'])await access(join(output,name));
  for(const name of files.filter(name=>name.endsWith('.js'))){
    const script=await readFile(join(output,name),'utf8');
    for(const match of script.matchAll(/from ['"]\.\/([^'"]+)['"]/g))await access(join(output,match[1]));
  }
});
