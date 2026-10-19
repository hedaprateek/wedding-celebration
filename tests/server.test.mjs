import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {request as httpRequest} from 'node:http';
import {createWeddingServer,csvCell} from '../server.mjs';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
import {mkdir} from 'node:fs/promises';
const fixtures=resolve(project,'tests/fixtures');await mkdir(fixtures,{recursive:true});
const payload=changes=>({name:'Test Guest',contact:'guest@example.com',attendance:'yes',guests:2,events:['wedding','reception'],note:'A disposable test response',consent:true,website:'',requestId:randomUUID(),...changes});
async function fixture(run,options={}){const dataDirectory=await mkdtemp(resolve(fixtures,'rsvp-'));let server;try{server=await createWeddingServer({dataDirectory,...options});await new Promise(done=>server.listen(0,'127.0.0.1',done));const base=`http://127.0.0.1:${server.address().port}`;await run({server,base,dataDirectory,post:(data,headers={})=>fetch(base+'/api/rsvp',{method:'POST',headers:{'Content-Type':'application/json',Origin:base,...headers},body:JSON.stringify(data)})});}finally{if(server){server.closeAllConnections();await new Promise(done=>server.close(done))}if(!dataDirectory.startsWith(fixtures+'\\')&&!dataDirectory.startsWith(fixtures+'/'))throw Error('Unexpected fixture cleanup target');await rm(dataDirectory,{recursive:true,force:true})}}
test('RSVP persists, repeated contacts update, and retries do not duplicate guests',async()=>fixture(async({post,base,dataDirectory})=>{const first=payload();assert.equal((await post(first)).status,201);assert.equal((await post(first)).status,200);let list=await(await fetch(base+'/api/guest-list')).json();assert.equal(list.rows.length,1);assert.equal(list.rows[0].guests,2);assert.equal((await post(payload({contact:'GUEST@example.com',guests:4,note:'Updated count'}))).status,200);list=await(await fetch(base+'/api/guest-list')).json();assert.equal(list.rows.length,1);assert.equal(list.rows[0].guests,4);assert.equal(list.rows[0].note,'Updated count');assert.equal((await readFile(resolve(dataDirectory,'rsvps.jsonl'),'utf8')).trim().split('\n').length,2);assert.equal(list.rows[0].requestId,undefined);assert.equal(list.rows[0].contactKey,undefined);}));
test('Declines are saved without attending guests or events',async()=>fixture(async({post,base})=>{assert.equal((await post(payload({attendance:'no',guests:8,events:['wedding']}))).status,201);const list=await(await fetch(base+'/api/guest-list')).json();assert.equal(list.rows[0].guests,0);assert.deepEqual(list.rows[0].events,[]);}));

test('Wishes save privately without attendance and do not replace an existing RSVP',async()=>fixture(async({post,base})=>{
  assert.equal((await post(payload())).status,201);
  const wish={kind:'wish',name:'Test Guest',contact:'guest@example.com',note:'A lifetime of love. शुभकामनाएँ!',consent:true,requestId:randomUUID()};
  let response=await post(wish);assert.equal(response.status,201);assert.match((await response.json()).message,/wishes are saved on this computer/);assert.equal((await post(wish)).status,200);
  let data=await(await fetch(base+'/api/guest-list')).json();assert.equal(data.rows.length,2);const message=data.rows.find(row=>row.kind==='wish');assert.equal(message.attendance,'wish');assert.equal(message.guests,0);assert.deepEqual(message.events,[]);assert.equal(data.rows.find(row=>row.attendance==='yes').guests,2);
  assert.equal((await post({...wish,requestId:randomUUID(),note:'Updated blessing'})).status,200);data=await(await fetch(base+'/api/guest-list')).json();assert.equal(data.rows.length,2);assert.equal(data.rows.find(row=>row.kind==='wish').note,'Updated blessing');
  for(const change of [{consent:false},{note:''},{note:'   '},{note:'a'.repeat(601)},{contact:'not valid'}])assert.equal((await post({...wish,...change,requestId:randomUUID()})).status,400);
  const fields=new URLSearchParams({kind:'wish',name:'Native wish',contact:'wish@example.com',note:'Wishing you joy!',consent:'yes'});response=await fetch(base+'/api/rsvp',{method:'POST',body:fields});assert.equal(response.status,200);assert.match(await response.text(),/wishes are saved on this computer/);
}));

test('Itinerary downloads as a current two-page PDF with a useful filename',async()=>fixture(async({base})=>{
  const response=await fetch(base+'/wedding-itinerary.pdf');assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'application/pdf');assert.match(response.headers.get('content-disposition'),/Prerna-Shubham-Wedding-Itinerary.pdf/);const pdf=await response.text();assert.ok(pdf.startsWith('%PDF-1.4'));assert.ok(pdf.includes('Terapanthi Bhavan'));assert.ok(pdf.includes('4:31 pm'));assert.equal((pdf.match(/\/Type \/Page\b/g)||[]).length,2);
}));
test('Consent, real contact details, event selection, party bounds and honeypot are enforced',async()=>fixture(async({post,base})=>{for(const changes of [{consent:false},{contact:'not a contact'},{guests:0},{guests:9},{guests:1.5},{events:[]},{events:['not-an-event']},{name:'   '},{note:'a'.repeat(601)},{website:'bot.example'},{attendance:'maybe'}])assert.equal((await post(payload(changes))).status,400,JSON.stringify(changes));const list=await(await fetch(base+'/api/guest-list')).json();assert.equal(list.rows.length,0);assert.equal((await post(payload({contact:'+91 98765 43210'}))).status,201);}));
test('Cross-origin requests, unknown hosts and private files are rejected',async()=>fixture(async({post,base})=>{assert.equal((await post(payload(),{Origin:'https://other.example'})).status,403);const unknownHost=await new Promise((done,reject)=>{const request=httpRequest(base+'/',{headers:{Host:'untrusted.example'}},response=>{response.resume();done(response.statusCode)});request.on('error',reject);request.end()});assert.equal(unknownHost,421);for(const path of ['/.data/rsvps.jsonl','/server.mjs','/tests/server.test.mjs','/package.json','/../.git/config'])assert.equal((await fetch(base+path)).status,404,path);assert.equal((await fetch(base+'/api/guest-list',{headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);}));
test('Public hosting disables local guest-list routes',async()=>fixture(async({base})=>{for(const path of ['/guest-list','/guest-list.html','/api/guest-list','/api/guest-list.csv','/guest-list.js'])assert.equal((await fetch(base+path)).status,404,path);},{publicOrigin:'https://wedding.example'}));
test('CSV export escapes formulas and preserves guest values safely',async()=>fixture(async({post,base})=>{assert.equal((await post(payload({name:'=HYPERLINK("https://example.com")',note:'<script>alert(1)</script>'}))).status,201);const response=await fetch(base+'/api/guest-list.csv');assert.equal(response.status,200);const csv=await response.text();assert.ok(csv.includes("'=HYPERLINK"));assert.ok(csv.includes('<script>alert(1)</script>'));assert.ok(response.headers.get('content-disposition').includes('attachment'));assert.equal(csvCell('+919876543210'),'"\'+919876543210"');}));
test('Native form submissions work without JavaScript and escape their confirmation',async()=>fixture(async({base})=>{const fields=new URLSearchParams({name:'<b>Guest</b>',contact:'native@example.com',attendance:'yes',guests:'1',events:'wedding',consent:'yes'});const response=await fetch(base+'/api/rsvp',{method:'POST',body:fields});assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes('&lt;b&gt;Guest&lt;/b&gt;'));assert.ok(html.includes('preview RSVP'));}));
test('Rate limits prevent excess submissions',async()=>fixture(async({post})=>{assert.equal((await post(payload())).status,201);assert.equal((await post(payload())).status,429);},{rateLimit:1}));
test('Oversized form bodies are rejected',async()=>fixture(async({post})=>{assert.equal((await post(payload({note:'x'.repeat(17000)}))).status,413);}));

test('Song suggestions stay with the private RSVP, support updates, and export safely',async()=>fixture(async({post,base,dataDirectory})=>{
  const song='A favourite song — Test Artist';
  assert.equal((await post(payload({song}))).status,201);
  let list=await(await fetch(base+'/api/guest-list')).json();
  assert.equal(list.rows[0].song,song);
  assert.equal(JSON.parse((await readFile(resolve(dataDirectory,'rsvps.jsonl'),'utf8')).trim()).song,song);
  assert.equal((await post(payload({song:'=1+1'}))).status,200);
  list=await(await fetch(base+'/api/guest-list')).json();
  assert.equal(list.rows.length,1);assert.equal(list.rows[0].song,'=1+1');
  const csv=await(await fetch(base+'/api/guest-list.csv')).text();
  assert.ok(csv.includes('Song suggestion'));assert.ok(csv.includes("'=1+1"));
  for(const value of ['a'.repeat(161),{},['a song']])assert.equal((await post(payload({song:value}))).status,400);
  const fields=new URLSearchParams({name:'Native Song Guest',contact:'native-song@example.com',attendance:'no',consent:'yes',song:'Another favourite'});
  assert.equal((await fetch(base+'/api/rsvp',{method:'POST',body:fields})).status,200);
  list=await(await fetch(base+'/api/guest-list')).json();
  assert.equal(list.rows.find(row=>row.contact==='native-song@example.com').song,'Another favourite');
}));
test('Data is available after a server restart',async()=>{const dataDirectory=await mkdtemp(resolve(fixtures,'restart-'));let server;try{server=await createWeddingServer({dataDirectory});await new Promise(done=>server.listen(0,'127.0.0.1',done));let base=`http://127.0.0.1:${server.address().port}`;assert.equal((await fetch(base+'/api/rsvp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload())})).status,201);server.closeAllConnections();await new Promise(done=>server.close(done));server=await createWeddingServer({dataDirectory});await new Promise(done=>server.listen(0,'127.0.0.1',done));base=`http://127.0.0.1:${server.address().port}`;const list=await(await fetch(base+'/api/guest-list')).json();assert.equal(list.rows.length,1);}finally{if(server){server.closeAllConnections();await new Promise(done=>server.close(done))}if(!dataDirectory.startsWith(fixtures+'\\')&&!dataDirectory.startsWith(fixtures+'/'))throw Error('Invalid fixture cleanup target');await rm(dataDirectory,{recursive:true,force:true})}});
